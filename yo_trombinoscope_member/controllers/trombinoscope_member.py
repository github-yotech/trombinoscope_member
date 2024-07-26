from odoo import http

class TrombinoscopeMember(http.Controller):

    @http.route("/trombinoscope/list", auth="public", type="json", methods=['GET', 'POST'])
    def get_trombinoscope(self, **kwargs):
        """ Get list of trombinoscope
        """
        tromb = http.request.env['trombinoscope.list'].sudo()\
            .search_read([('is_active', '=', True)], ['id', 'name'], order='name asc')
        return tromb

    @http.route("/trombinoscope/list/member", auth="public", type="json", methods=['GET', 'POST'])
    def get_member(self, **kwargs):
        """ Get list of marked partner
            Partner is not availble to public
            but for this case, we want to expose it
            for a momment.
        """
        # Limit request
        limit = kwargs.get('limit') or 4
        limit = limit if limit <= 36 else 0

        # Trombinoscope
        tromb = kwargs.get('trombinoscope_id')

        # construct domain
        domain = [('is_active', '=', True)]
        if tromb:
            domain += [('id', '=', tromb)]

        members = http.request.env['trombinoscope.list'].sudo().search(domain)
        members = members.member_ids.partner_id.mapped(lambda x: {
            "name": x.name,
            "image": x.image_256,
            "url": f'/member/{x.id}',
            "title": x.title.name or 'Title',
            "company": x.company_id.name or 'Company',
            "activity": "Activity of person"
        })

        return members
