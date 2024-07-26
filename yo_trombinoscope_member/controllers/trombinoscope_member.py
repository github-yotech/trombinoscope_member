from odoo import http

class TrombinoscopeMember(http.Controller):

    @http.route("/trombinoscope/list", auth="public", type="json")
    def get_trombinoscope(self, **kwargs):
        """ Get list of trombinoscope
        """
        tromb = http.request.env['trombinoscope.list'].sudo()\
            .search_read([('is_active', '=', True)], ['id', 'name'], order='name asc')
        return tromb

    @http.route("/trombinoscope/list/member", auth="public", type="json")
    def get_member(self, trombinoscope, **kwargs):
        """ Get list of marked partner
            Partner is not availble to public
            but for this case, we want to expose it
            for a momment.

            :param trombinosope_id(int): id of
        """
        # Limit request
        limit = kwargs.get('limit') or 4
        limit = limit if limit <= 36 else 0

        # Trombinoscope
        trombi = http.request.env['trombinoscope.list'].sudo().browse(trombinoscope)
        if not trombi or not trombi.is_active:
            return []

        members = trombi.get_members()
        return members
