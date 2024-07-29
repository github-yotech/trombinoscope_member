from odoo import models, fields

class Partner(models.Model):
    _inherit = 'res.partner'

    trombinoscope_member_ids = fields.One2many("trombinoscope.list.member", "partner_id")
    trombinoscope_ids = fields.Many2many("trombinoscope.list", relation="trombinoscope_list_member", column1="partner_id", column2="trombinoscope_id")
    # trombinoscope_ids = fields.Many2many(string="Trombiniscopes", compute="_compute_trombinoscope_ids", inverse="_inverse_trombinoscope_ids")

    # @api.depends("trombinoscope_member_ids")
    # def _compute_trombinoscope_ids(self):
    #     for rec in self:
    #         rec.trombinoscope_ids = [Command.set(rec.trombinoscope_member_ids.trombinoscope_id.ids)]

    # def _inverse_trombinoscope_ids(self):
    #     for rec in self:
    #         pass
