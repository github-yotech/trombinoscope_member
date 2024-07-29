/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

const TrombinoscopeMember = publicWidget.Widget.extend({
    selector: '.trombinoscope-member',
    init: function () {
        console.debug("Load Trombinoscope")
        this._super.apply(this, arguments);
        this.rpc = this.bindService("rpc");
    },

    start() {
        this.loadImage();
    },
    renderImgGrid(responses) {
        if (responses.length == 0) {
            return;
        }

        let gridElement = this.$target.find('.s_nb_grid')
        if (!gridElement) {
            console.error(".s_nb_grid class not found")
            return;
        }

        // Structure images to rectangle(TxT) grid
        const colSize = parseInt(this.$target.attr('data-trombinoscope-col')) || 1;
        const rowSize = parseInt(this.$target.attr('data-trombinoscope-row')) || 1;
        const data = responses
        let res = "";

        if (data.length == 0) {
            console.warn("No trombinoscope image")
            return;
        }

        let index = 0;
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
                    <div class="col-auto">
                        <div class="card trombinoscope-card" data-detail='${detail}'>
                            <a href="#" class="trombinoscope-card-link">
                                <img src="data:image/png;base64,${image}" class="card-img-top img-thumbnail" alt="..."/>
                                <div class="card-body trombinoscope-card-text">
                                    <h5 class="card-title">
                                        ${rest.name}
                                    </h5>
                                </div>
                            </a>
                        </div>
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

        // register onclick card
        const cardElement = gridElement.find('.trombinoscope-card')
        cardElement.on('click .trombinoscope-card', ev => {
            const card = $(ev.target).closest('.trombinoscope-card')
            const detail = card.data('detail')
            const image = card.find('.card-img-top').attr('src')
            this.showModal(image, detail)
        })
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
            this.renderImgGrid([])
        }

        let data = await this._fetch();
        this.renderImgGrid(data);
    },
    showModal(image, data) {
        let modal = this.$target.find('.trombinoscope-modal');

        // Set Modal Title
        modal.find('.modal-title').html((data['name'] || ''))


        // Set Modal Body
        let detailElement = '';
        for (const [key, value] of Object.entries(data)) {
            const val = value != '' && value != null ? value : '-'
            detailElement += `
            <tr>
                <th scope="row">${(key.toUpperCase())}</th>
                <td>: ${val}</td>
            </tr>
            `
        }

        let bodyElement = `
        <div class="container-fluid">
            <div class="row">
                <div class="col">
                <image class="img-fluid" src="${image}"/>
                </div>
                <div class="col">
                <table class="table table-borderless table-responsive table-sm align-top">
                    <tbody>
                        ${detailElement}
                    </tbody>
                </table>
                </div>
                
            </div>
        </div>`

        modal.find('.modal-body').html(bodyElement)


        modal.modal('show');
    }

});

publicWidget.registry.TrombinoscopeMember = TrombinoscopeMember;

export default TrombinoscopeMember;
