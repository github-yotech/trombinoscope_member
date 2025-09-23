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
        this.dataCache = new Map();
    },

    start() {
        this.loadImage();
        this._initLazyLoading();
    },

    _initLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.onload = () => img.classList.add('loaded');
                            img.removeAttribute('data-src');
                            observer.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });
        }
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
                const detail = JSON.stringify(colData);
                let imageUrl = '/yo_trombinoscope_member/static/src/img/placeholder-150.png';

                if (colData.image) {
                    imageUrl = `data:image/png;base64,${colData.image}`;
                } else if (colData.has_image && colData.image_field) {
                    imageUrl = `/web/image/res.partner/${colData.id}/${colData.image_field}`;
                } else if (colData.has_image) {
                    imageUrl = `/web/image/res.partner/${colData.id}/image`;
                }

                rowContent += `
                    <div class="col-${colNum} trombinoscope-card m-1" data-member-name="${colData.name.toLowerCase()}" data-member-company="${colData.company.toLowerCase()}">
                        <a ${colData.website_published ? "href=\"/partners/" + colData.id + "\"" : ""}>
                            <figure class="figure">
                                <img data-src="${imageUrl}" class="figure-img img-fluid rounded trombinoscope-img lazy-load" alt="img ${colData.name}" loading="lazy" src="data:image/svg+xml,%3csvg%20width='100'%20height='100'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20width='100'%20height='100'%20fill='%23f0f0f0'/%3e%3c/svg%3e"/>
                                <figcaption class="figure-caption">${colData.name}</figcaption>
                                <small class="text-muted d-block">${colData.company}</small>
                                <i>${colData.favorite_quote ? colData.favorite_quote : ""}</i>
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

        if (this.imageObserver) {
            gridElement.find('img[data-src]').each((_, img) => {
                this.imageObserver.observe(img);
            });
        }
    },

    _onSearchInput: function (event) {
        const searchTerm = event.target.value.toLowerCase().trim();

        if (searchTerm === '') {
            this.renderImgGrid(this.allMembers || []);
            return;
        }

        const filtered = (this.allMembers || []).filter(item => {
            const name = (item.name || '').toLowerCase();
            const company = (item.company || '').toLowerCase();
            return name.includes(searchTerm) || company.includes(searchTerm);
        });

        this.renderImgGrid(filtered);
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

        if (this.imageObserver) {
            gridElement.find('img[data-src]').each((_, img) => {
                this.imageObserver.observe(img);
            });
        }
    },
    /**
     * @private
     */
    async _fetch() {
        let tromb = parseInt(this.$target.attr('data-trombinoscope-id'));
        let rowSize = parseInt(this.$target.attr('data-trombinoscope-row')) || 3;
        let colSize = parseInt(this.$target.attr('data-trombinoscope-col')) || 3;

        const optimalLimit = rowSize * colSize;
        const cacheKey = `${tromb}_${optimalLimit}`;

        if (this.dataCache.has(cacheKey)) {
            return this.dataCache.get(cacheKey);
        }

        const responses = await this.rpc('/trombinoscope/list/member', {
            'trombinoscope': tromb,
            'limit': optimalLimit
        });

        this.dataCache.set(cacheKey, responses);
        setTimeout(() => {
            this.dataCache.delete(cacheKey);
        }, 300000);

        return responses;
    },
    async loadImage(previewMode) {
        if (previewMode) {
            return;
        }

        if (!this.$target.attr('data-trombinoscope-id')) {
            this.renderImgGrid([])
        }

        let data = await this._fetch();
        this.allMembers = data;
        this.renderImgGrid(data);
    },

    destroy() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        this._super.apply(this, arguments);
    },

});

publicWidget.registry.TrombinoscopeMember = TrombinoscopeMember;

export default TrombinoscopeMember;
