from odoo import fields, models

class TrombinoscopeList(models.Model):
    _name = 'trombinoscope.list'
    _description = 'Trombinoscope List'

    name = fields.Char("Name", required=True)
    is_active = fields.Boolean("Active", default=True)
    member_ids = fields.One2many("trombinoscope.list.member", "trombinoscope_id", string="Members")

class TrombinoscopeListMember(models.Model):
    _name = "trombinoscope.list.member"
    _description = "Trombinoscope List Member"
    _order = "sequence asc"

    sequence = fields.Integer("Sequence")

    trombinoscope_id = fields.Many2one("trombinoscope.list", string="Trombinoscope")
    partner_id = fields.Many2one("res.partner", string="Member Name", required=True, domain="[('image_1024','!=',False)]")
