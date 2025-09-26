from odoo import models

# part 2 of 2 on applying workaround to bring translation to the frontend
class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'

    @classmethod
    def _get_translation_frontend_modules_name(cls):
        modules = super()._get_translation_frontend_modules_name()
        return modules + ['trombinoscope_member','yo_trombinoscope_member']