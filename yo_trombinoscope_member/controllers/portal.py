from odoo.addons.portal.controllers.portal import CustomerPortal

class PortalTrombinoscope(CustomerPortal):
    OPTIONAL_CAFEECO_FIELDS = ["description", "favorite_quote"]

    def _get_optional_fields(self) -> list[str]:
        res = super()._get_optional_fields()
        res = [*res, *self.OPTIONAL_CAFEECO_FIELDS]
        return res