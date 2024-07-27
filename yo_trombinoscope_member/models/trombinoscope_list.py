from odoo import api, fields, models

class TrombinoscopeList(models.Model):
    _name = 'trombinoscope.list'
    _description = 'Trombinoscope List'

    name = fields.Char("Name", required=True)
    is_active = fields.Boolean("Active", default=True)
    member_ids = fields.One2many("trombinoscope.list.member", "trombinoscope_id", string="Members")

    def get_members(self):
        self.ensure_one()
        members = self.member_ids.search([('trombinoscope_id', '=', self.id)])
        members = members.filtered(lambda x: x.is_active is True)
        res = members.partner_id.mapped(lambda x: {
            "name": x.name,
            "image": x.image_256,
            "title": x.title.name or '',
            "company": x.company_id.name or '',
            "activity": ''
        })
        return res

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
