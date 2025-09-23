from odoo import models, fields, api

class Partner(models.Model):
    _inherit = 'res.partner'

    trombinoscope_member_ids = fields.One2many("trombinoscope.list.member", "partner_id")
    trombinoscope_ids = fields.Many2many("trombinoscope.list", relation="trombinoscope_list_member", column1="partner_id", column2="trombinoscope_id")

    description = fields.Text("Description")
    favorite_quote = fields.Char('Favorite Quote')

    def has_image(self):
        """Check if partner has an image"""
        self.ensure_one()
        return bool(self.image_1920)

    def get_best_image_field(self):
        """Get the best available image field name for this partner"""
        self.ensure_one()
        if self.image_1920:
            return 'image_256'
        return None

    def get_image_for_display(self, preferred_size='image_256'):
        """Get image for display with fallback"""
        self.ensure_one()
        if self.image_1920:
            return getattr(self, preferred_size, None) or self.image_1920
        return None
