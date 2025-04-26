from odoo import models, fields

class Partner(models.Model):
    _inherit = 'res.partner'

    trombinoscope_member_ids = fields.One2many("trombinoscope.list.member", "partner_id")
    trombinoscope_ids = fields.Many2many("trombinoscope.list", relation="trombinoscope_list_member", column1="partner_id", column2="trombinoscope_id")
    
    description = fields.Text("Description")
    favorite_quote = fields.Char('Favorite Quote')
