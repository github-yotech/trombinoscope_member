/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

const TrombinoscopeMemberOptions = options.Class.extend({
    init: function () {
        console.debug("Load Trombinoscope Options")
        this._super(...arguments);
    },
    start: function () {
        this._loadOptions();
        this._loadSize();
        this._loadPreview();
    },
    async onBuilt(options) {
        await this._super(...arguments);
        this._hideModal();
    },
    _hideModal() {
        let modal = this.$target.find('.trombinoscope-modal');
        modal.hide()
    },
    _loadPreview() {
        const size = this.$target.attr('data-trombinoscope-size') || '3';
        this._rerender_preview(size)
    },
    _loadOptions: async function (previewMode, value) {
        // Since it's load after init
        // We need to handle everything manually

        const res = await this.rpc('/trombinoscope/list');

        if (res.length == 0) {
            return;
        }

        // Get current tormbinoscope
        const tromb = parseInt(this.$target.attr('data-trombinoscope-id'));

        // Render selectiondom
        const selectElement = this.$el.find('.trombinoscope-selection we-selection-items');
        let selectOptions = "";
        res.forEach(r => {
            let selectClass = "o_we_user_value_widget trombinoscope-selection";
            if (r.id == tromb) {
                selectClass += " active";
                this.$el.attr('data-placeholder-text', r.name);
            }
            selectOptions += `<we-button class="${selectClass}" data-select-trombinoscope="${r.id}" data-select-trombinoscope-name="${r.name}" data-reload="/" ><div>${r.name}</div></we-button>`;
        });
        selectElement.append(selectOptions);

        selectElement.on('click .trombinoscope-selection', ev => {
            const selectedEl = $(ev.target).closest('.trombinoscope-selection');
            const selectedId = selectedEl.data('select-trombinoscope');
            this.setTrombinoscope(selectedId);

            // Set this one as active and other as none
            this.$el.find('.trombinoscope-selection').removeClass('active');
            selectedEl.addClass('active');
            this.$el.find('.trombinoscope-selection we-toggler').attr('data-placeholder-text', selectedEl.data('select-trombinoscope-name'));
        })
    },
    setTrombinoscope(trombi) {
        this.$target.attr('data-trombinoscope-id', trombi);
        this.$el.find('.trombinoscope-selection we-toggler').attr('data-placeholder-text', trombi);
    },
    _loadSize: function (previewMode, value) {
        const colSize = this.$target.attr('data-trombinoscope-col') || '3';
        const rowSize = this.$target.attr('data-trombinoscope-row') || '3';
        this.$el.find("we-range.trombi-option-col > div > input")[0].setAttribute('value', colSize);
        this.$el.find("we-range.trombi-option-row > div > input")[0].setAttribute('value', rowSize);
    },
    setTrombinoscopeSize: function (previewMode, widgetValue, params) {
        // Place widget value to data column
        if (this.$target.attr('data-trombinoscope-size') != widgetValue && widgetValue != "") {
            this.$target[0].setAttribute('data-trombinoscope-size', widgetValue);
            this._rerender_preview(widgetValue);
        }
    },
    trombinoscopeRow: function (previewMode, widgetValue, params) {
        if (this.$target.attr('data-trombinoscope-row') != widgetValue && widgetValue != "") {
            this.$target[0].setAttribute('data-trombinoscope-row', widgetValue);
            this._rerender_preview();
        }
    },
    trombinoscopeCol: function (previewMode, widgetValue, params) {
        if (this.$target.attr('data-trombinoscope-col') != widgetValue && widgetValue != "") {
            this.$target[0].setAttribute('data-trombinoscope-col', widgetValue);
            this._rerender_preview();
        }
    },
    _rerender_preview: function () {
        const colSize = parseInt(this.$target.attr('data-trombinoscope-col')) || 0;
        const rowSize = parseInt(this.$target.attr('data-trombinoscope-row')) || 0;

        let gridElement = this.$target.find('.s_nb_grid');
        if (!gridElement) {
            console.error(".s_nb_grid class not found");
            return;
        }

        let res = ""
        for (let i = 0; i < rowSize; i++) {
            res += `<div class="row trombinoscope-row gx-1 mb-2 justify-content-center">`;
            for (let j = 0; j < colSize; j++) {
                res += `<div class="col-3 trombinoscope-card m-1" data-detail=''>
                            <figure class="figure">
                                <img src="/yo_trombinoscope_member/static/src/img/placeholder-150.png" class="figure-img img-fluid rounded trombinoscope-img" alt="palceholder"/>
                                <figcaption class="figure-caption placeholder-gloe"><span class="placeholder col-11"/></figcaption>
                            </figure>
                        </div>`;
            }
            res += '</div>';
        }

        gridElement.html(res);
    }
});

options.registry.TrombinoscopeMemberOptions = TrombinoscopeMemberOptions;

export default TrombinoscopeMemberOptions;
