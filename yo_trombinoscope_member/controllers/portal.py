import base64

from odoo.addons.portal.controllers.portal import CustomerPortal


class PortalTrombinoscope(CustomerPortal):
    OPTIONAL_CAFEECO_FIELDS = [
        "description",
        "image_1920",
        "favorite_quote",
    ]

    def _get_optional_fields(self) -> list[str]:
        res = super()._get_optional_fields()
        res = [*res, *self.OPTIONAL_CAFEECO_FIELDS]
        return res

    def account(self, redirect=None, **post):
        # Encode file passed by the html form
        if post.get('image_1920'):
            binary = base64.b64encode(post.get('image_1920').read())
            post['image_1920'] = binary

        # Prevent image to be erased when updating other fields
        else:
            post.pop('image_1920', None)

        return super().account(redirect, **post)
