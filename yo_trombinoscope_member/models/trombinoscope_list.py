from base64 import b64encode

from odoo import api, fields, models, _
from odoo.tools import file_open

class TrombinoscopeList(models.Model):
    _name = 'trombinoscope.list'
    _description = 'Trombinoscope List'

    name = fields.Char("Name", required=True)
    is_active = fields.Boolean("Active", default=True)
    member_ids = fields.One2many("trombinoscope.list.member", "trombinoscope_id", string="Members")
    member_placeholder_image = fields.Image(
        max_width=256,
        max_height=256,
        default=lambda self: self._default_member_placeholder_image(),
    )
    alphabetical_sort_default = fields.Boolean(
        string="Sort alphabetically by default",
        default=False,
        help="When enabled, the trombinoscope will be sorted alphabetically by company name by default"
    )

    @api.model
    def _default_member_placeholder_image(self):
        return b64encode(file_open(self._get_default_member_placeholder_image_path(), 'rb').read())

    def get_members(self, limit=None):
        """Get members of the trombinoscope with optimized queries"""
        self.ensure_one()
        # these are for sneaking-in these strings into the po file
        # without them, these words wouldn't be registered
        _("name")
        _("image")
        _("title")
        _("company")
        _("favorite_quote")
        _("description")

        domain = [('trombinoscope_id', '=', self.id)]
        members = self.env['trombinoscope.list.member'].search(domain)
        members = members.filtered(lambda x: x.is_active)

        if limit:
            members = members[:limit]

        partners = members.mapped('partner_id')

        res = []
        for member in members:
            partner = member.partner_id
            partner_image = partner.image_256 or self.member_placeholder_image

            res.append({
                "id": partner.id,
                "name": partner.name,
                "image": partner_image,
                "title": partner.title.name if partner.title else '',
                "company": partner.parent_id.name if partner.parent_id else '',
                "favorite_quote": partner.favorite_quote or '',
                "description": partner.description or '',
                "website_published": partner.website_published or False,
                "tags": [tag.name for tag in partner.category_id] if partner.category_id else [],
                "alphabetical_sort_default": self.alphabetical_sort_default,
            })

        return res

    @api.model
    def _get_default_member_placeholder_image_path(self):
        return "base/static/img/avatar_grey.png"

class TrombinoscopeListMember(models.Model):
    _name = "trombinoscope.list.member"
    _description = "Trombinoscope List Member"
    _order = "sequence asc"

    sequence = fields.Integer("Sequence", default=1)
    number_display = fields.Integer("N°", compute="_compute_number_display", inverse="_inverse_number_display", store=False)

    trombinoscope_id = fields.Many2one("trombinoscope.list", string="Trombinoscope", required=True, ondelete='cascade')
    partner_id = fields.Many2one("res.partner", string="Member Name", required=True)
    is_active = fields.Boolean("Active", compute="_compute_active")

    @api.depends('sequence')
    def _compute_number_display(self):
        """Affiche le numéro basé sur la position dans la séquence"""
        for record in self:
            record.number_display = record.sequence

    def _inverse_number_display(self):
        """Met à jour la séquence quand le numéro est modifié"""
        for record in self:
            if record.number_display != record.sequence:
                new_position = record.number_display

                all_members = self.search([('trombinoscope_id', '=', record.trombinoscope_id.id)], order='sequence, id')

                with record.env.norecompute():
                    temp_sequence = max([m.sequence for m in all_members]) + 1000
                    record.with_context(skip_resequence=True).write({'sequence': temp_sequence})

                    members_list = list(all_members.filtered(lambda m: m.id != record.id))

                    if new_position <= 1:
                        members_list.insert(0, record)
                    elif new_position >= len(members_list) + 1:
                        members_list.append(record)
                    else:
                        members_list.insert(new_position - 1, record)

                    for index, member in enumerate(members_list, 1):
                        if member.sequence != index:
                            member.with_context(skip_resequence=True).write({'sequence': index})

    @api.model
    def create(self, vals):
        """Auto-assign sequence if not provided"""
        if 'sequence' not in vals or not vals['sequence']:
            if 'trombinoscope_id' in vals:
                last_member = self.search([('trombinoscope_id', '=', vals['trombinoscope_id'])], order='sequence desc', limit=1)
                vals['sequence'] = (last_member.sequence or 0) + 1
            else:
                vals['sequence'] = 1
        return super().create(vals)

    def write(self, vals):
        """Met à jour les séquences quand un élément est glissé"""
        result = super().write(vals)

        if 'sequence' in vals and not self.env.context.get('skip_resequence'):
            self._resequence_members()

        return result

    def _resequence_members(self):
        """Renumérote tous les membres pour avoir une séquence continue 1,2,3..."""
        if self.trombinoscope_id:
            members = self.search([('trombinoscope_id', '=', self.trombinoscope_id.id)], order='sequence, id')

            for index, member in enumerate(members, 1):
                if member.sequence != index:
                    member.with_context(skip_resequence=True).write({'sequence': index})

    @api.depends('partner_id', 'partner_id.active')
    def _compute_active(self):
        for rec in self:
            if not rec.partner_id.active:
                rec.is_active = False
                continue
            rec.is_active = True
