from odoo.addons.portal.controllers.portal import CustomerPortal

class PortalTrombinoscope(CustomerPortal):
    
    def _get_optional_fields(self) -> list[str]:
        res = super()._get_optional_fields()
        if "description" not in res: res.append("description")
        res = [*res, "favorite_quote"]
        return res