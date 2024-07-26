/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

const TrombinoscopeMember = publicWidget.Widget.extend({
    selector: '.trombinoscope-member',
    init: function () {
        this._super.apply(this, arguments);
        this.rpc = this.bindService("rpc");
    },

    start() {
        this.loadImage();
    },
    convertToSquareMatrix(arr, size) {
        // Check if the array can form a perfect square matrix
        while (size * size > arr.length) {
            size -= 1
        }

        const matrix = [];
        for (let i = 0; i < size; i++) {
            matrix[i] = [];
            for (let j = 0; j < size; j++) {
                matrix[i][j] = arr[i * size + j];
            }
        }

        return matrix;
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
        let colSize = parseInt(this.$target.attr('data-trombinoscope-size')) || '3';
        let data = this.convertToSquareMatrix(responses, colSize)
        let res = "";
        let index = 0;
        if (data.length == 0) {
            console.warn("No trombinoscope image")
            return;
        }

        // Determine coll class
        data.forEach(row => {
            res += `<div class="row trombinoscope-row gx-1 mb-2 justify-content-center">`;
            row.forEach(col => {
                res += `
                    <div class="col-auto">
                        <div class="card trombinoscope-card">
                            <a href="${col.url}" class="trombinoscope-card-link">
                                <img src="data:image/png;base64,${col.image}" class="card-img-top img-thumbnail" alt="..."/>
                                <div class="card-body trombinoscope-card-text">
                                    <h5 class="card-title">
                                        ${col.name}
                                    </h5>
                                    <p class="card-text mb-0">${col.title}</p>
                                    <p class="card-text mb-0">${col.company}</p>
                                    <p class="card-text mb-0">${col.activity}</p>
                                </div>
                            </a>
                        </div>
                    </div>
                `;
                index += 1;
            });
            res += `</div>`;
        });


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
        if (previewMode){
            return;
        }

        if (!this.$target.attr('data-trombinoscope-id')) {
            this.renderImgGrid([])
        }

        let data = await this._fetch();
        this.renderImgGrid(data);
    },

});

publicWidget.registry.TrombinoscopeMember = TrombinoscopeMember;

export default TrombinoscopeMember;
