/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";
import { _t } from "@web/core/l10n/translation";

const TrombinoscopeMember = publicWidget.Widget.extend({
    selector: '.trombinoscope-member',
    events: {
        'input .trombinoscope-search': '_onSearchInput',
    },

    init: function () {
        console.debug("Load Trombinoscope")
        this._super.apply(this, arguments);
        this.rpc = this.bindService("rpc");
        this.allMembers = [];
    },

    start() {
        this.loadImage();
    },
    renderImgGrid(responses) {
        if (responses.length == 0) {
            let gridElement = this.$target.find('.s_nb_grid');
            if (gridElement) {
                gridElement.html('<div class="text-center text-muted"><p>No members found</p></div>');
            }
            return;
        }

        let gridElement = this.$target.find('.s_nb_grid')
        if (!gridElement) {
            console.error(".s_nb_grid class not found")
            return;
        }

        const colSize = parseInt(this.$target.attr('data-trombinoscope-col')) || 1;
        const rowSize = parseInt(this.$target.attr('data-trombinoscope-row')) || 1;
        const data = responses
        let res = "";

        if (data.length == 0) {
            console.warn("No trombinoscope image")
            gridElement.html('<div class="text-center text-muted"><p>No members found</p></div>');
            return;
        }

        let index = 0;
        // Calculate col Number
        const colNum = Math.floor(12 / colSize)
        for (let i = 0; i < rowSize; i++) {
            let rowContent = `<div class="row trombinoscope-row gx-1 mb-2 justify-content-center">`;
            let rowBreak = false;

            for (let j = 0; j < colSize; j++) {
                if (!data[index]) {
                    rowBreak = true;
                    break;
                }

                const colData = data[index];
                const { image, ...rest } = colData;
                const detail = JSON.stringify(rest);

                rowContent += `
                    <div class="col-${colNum} trombinoscope-card m-1" data-member-name="${rest.name.toLowerCase()}" data-member-company="${rest.company.toLowerCase()}">
                        <a ${rest.website_published ? "href=\"/partners/" + rest.id + "\"" : ""}>
                            <figure class="figure">
                                <img src="data:image/png;base64,${image}" class="figure-img img-fluid rounded trombinoscope-img" alt="img ${rest.name}"/>
                                <figcaption class="figure-caption">${rest.name}</figcaption>
                                <small class="text-muted d-block">${rest.company}</small>
                                <i>${rest.favorite_quote ? rest.favorite_quote : ""}</i>
                            </figure>
                        </a>
                    </div>
                `;
                index += 1;
            }

            rowContent += `</div>`;
            res += rowContent;

            if (rowBreak) {
                break;
            }
        }

        gridElement.html(res);
    },

    _onSearchInput: function (event) {
        const searchTerm = event.target.value.toLowerCase().trim();
        const cards = this.$target.find('.trombinoscope-card');

        if (searchTerm === '') {
            cards.show();
            this._reorganizeGrid();
        } else {
            cards.each(function () {
                const $card = $(this);
                const memberName = $card.data('member-name') || '';
                const memberCompany = $card.data('member-company') || '';

                if (memberName.includes(searchTerm) || memberCompany.includes(searchTerm)) {
                    $card.show();
                } else {
                    $card.hide();
                }
            });
            this._reorganizeGrid();
        }
    },

    _reorganizeGrid: function () {
        const colSize = parseInt(this.$target.attr('data-trombinoscope-col')) || 3;
        const visibleCards = this.$target.find('.trombinoscope-card:visible');
        const gridElement = this.$target.find('.s_nb_grid');

        if (visibleCards.length === 0) {
            gridElement.html('<div class="text-center text-muted mt-4"><p>No members found for this search</p></div>');
            return;
        }

        let res = "";
        let index = 0;
        const colNum = Math.floor(12 / colSize);

        while (index < visibleCards.length) {
            let rowContent = `<div class="row trombinoscope-row gx-1 mb-2 justify-content-center">`;

            for (let j = 0; j < colSize && index < visibleCards.length; j++) {
                const cardHtml = visibleCards.eq(index).prop('outerHTML');

                const updatedCardHtml = cardHtml.replace(/col-\d+/, `col-${colNum}`);
                rowContent += updatedCardHtml;
                index++;
            }

            rowContent += `</div>`;
            res += rowContent;
        }

        gridElement.html(res);
    },
    /**
     * @private
     */
    async _fetch() {
        let tromb = parseInt(this.$target.attr('data-trombinoscope-id'));
        let colSize = parseInt(this.$target.attr('data-trombinoscope-size')) || 3;
        colSize = colSize ** 2;

        const responses = await this.rpc('/trombinoscope/list/member', { 'trombinoscope': tromb, 'limit': colSize });
        return responses;
    },
    async loadImage(previewMode) {
        if (previewMode) {
            return;
        }

        if (!this.$target.attr('data-trombinoscope-id')) {
            // Keep the search bar visible but show placeholder content
            let gridElement = this.$target.find('.s_nb_grid');
            if (gridElement) {
                gridElement.html('<div class="text-center text-muted"><p>Please select a trombinoscope to display members</p></div>');
            }
            return;
        }

        let data = await this._fetch();
        this.allMembers = data;
        this.renderImgGrid(data);
    },

});

publicWidget.registry.TrombinoscopeMember = TrombinoscopeMember;

export default TrombinoscopeMember;
