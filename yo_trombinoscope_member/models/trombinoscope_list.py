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
        res = members.partner_id.mapped(lambda x: {
            "id": x.id,
            "name": x.name,
            "image": x.image_256 or self.member_placeholder_image,
            "title": x.title.name or '',
            "company": x.company_id.name or '',
            "favorite_quote": x.favorite_quote or '',
            "description": x.description or '',
            # _("activity"): ''
        })
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
    partner_id = fields.Many2one("res.partner", string="Member Name", required=True, domain="[('image_1024','!=',False)]")
    is_active = fields.Boolean("Active", compute="_compute_active")

    @api.depends('partner_id', 'partner_id.active')
    def _compute_active(self):
        for rec in self:
            if not rec.partner_id.active:
                rec.is_active = False
                continue
            rec.is_active = True
