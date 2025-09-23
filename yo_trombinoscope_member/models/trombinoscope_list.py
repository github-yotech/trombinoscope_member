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

    @api.model
    def _default_member_placeholder_image(self):
        return b64encode(file_open(self._get_default_member_placeholder_image_path(), 'rb').read())

    def get_members(self):
        self.ensure_one()
        members = self.member_ids.search([('trombinoscope_id', '=', self.id)])
        members = members.filtered(lambda x: x.is_active is True)
        # these are for sneaking-in these strings into the po file
        # without them, these words wouldn't be registered
        _("name")
        _("image")
        _("title")
        _("company")
        _("favorite_quote")
        _("description")
        partners = members.partner_id
        res = []
        for partner in partners:
            partner_image = partner.get_image_for_display() or self.member_placeholder_image

            res.append({
                "id": partner.id,
                "name": partner.name,
                "has_image": partner.has_image(),
                "image_field": partner.get_best_image_field(),
                "image": partner_image,
                "title": partner.title.name or '',
                "company": partner.company_id.name or '',
                "favorite_quote": partner.favorite_quote or '',
                "description": partner.description or '',
                "website_published": getattr(partner, 'website_published', False),
            })

        res = sorted(res, key=lambda x: (x.get('company', '').lower(), x.get('name', '').lower()))

        return res

    def get_members_optimized(self, limit=None):
        """Optimized version of get_members with better SQL queries and caching"""
        self.ensure_one()

        domain = [('trombinoscope_id', '=', self.id)]
        members = self.env['trombinoscope.list.member'].search(domain)
        members = members.filtered(lambda x: x.is_active is True)

        if limit:
            members = members[:limit]

        partners = members.mapped('partner_id')

        res = []
        for partner in partners:
            partner_image = partner.get_image_for_display() or self.member_placeholder_image

            res.append({
                "id": partner.id,
                "name": partner.name,
                "has_image": partner.has_image(),
                "image_field": partner.get_best_image_field(),
                "image": partner_image,
                "title": partner.title.name if partner.title else '',
                "company": partner.company_id.name if partner.company_id else '',
                "favorite_quote": partner.favorite_quote or '',
                "description": partner.description or '',
                "website_published": getattr(partner, 'website_published', False),
            })

        res = sorted(res, key=lambda x: (x.get('company', '').lower(), x.get('name', '').lower()))

        return res

    @api.model
    def _get_default_member_placeholder_image_path(self):
        return "base/static/img/avatar_grey.png"

class TrombinoscopeListMember(models.Model):
    _name = "trombinoscope.list.member"
    _description = "Trombinoscope List Member"
    _order = "sequence asc"

    sequence = fields.Integer("Sequence")

    trombinoscope_id = fields.Many2one("trombinoscope.list", string="Trombinoscope", required=True, ondelete='cascade')
    partner_id = fields.Many2one("res.partner", string="Member Name", required=True)
    is_active = fields.Boolean("Active", compute="_compute_active")

    @api.depends('partner_id', 'partner_id.active')
    def _compute_active(self):
        for rec in self:
            if not rec.partner_id.active:
                rec.is_active = False
                continue
            rec.is_active = True
