{
    "name": "Trombinoscope Member",
    "version": "17.0.1.0.0",
    "depends": ["membership", "website_partner"],
    "author": "Yotech",
    "license": "Other proprietary",
    "category": "theme",
    "description": """
This module add trombinoscope snippet for odoo Website.
Features including:
- [ID-296-4503/4504] custom trombinoscope member
    """,
    "data": [
        "security/ir.model.access.csv",

        "data/image_library.xml",

        "views/trombinoscope_list.xml",
        "views/res_partner_views.xml",
        "views/snippets/s_trombinoscope_member.xml",
        "views/snippets/snippets.xml",
        "views/portal.xml",
        "views/website_partner_templates.xml",
    ],
    "assets": {
        "web.assets_frontend": [
            "yo_trombinoscope_member/static/src/snippets/s_trombinoscope_member/000.js",
            "yo_trombinoscope_member/static/src/snippets/s_trombinoscope_member/000.scss",
        ],
        "website.assets_wysiwyg": [
            "yo_trombinoscope_member/static/src/snippets/s_trombinoscope_member/options.js",
        ],
    },
}
