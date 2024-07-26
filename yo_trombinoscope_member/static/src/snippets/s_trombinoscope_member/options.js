/** @odoo-module **/

import options from "@web_editor/js/editor/snippets.options";

const TrombinoscopeMemberOptions = options.Class.extend({
    init: function () {
        this._super(...arguments);
    },
    start: function () {
        console.log("Load Trombinoscope Options")
        this._loadOptions();
        this._loadSize();
        this._loadPreview();
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
        const size = this.$target.attr('data-trombinoscope-size') || '3';
        this.$el.find('we-range > div > input')[0].setAttribute('value', size);
    },
    setTrombinoscopeSize: function (previewMode, widgetValue, params) {
        // Place widget value to data column
        if (this.$target.attr('data-trombinoscope-size') != widgetValue && widgetValue != "") {
            this.$target[0].setAttribute('data-trombinoscope-size', widgetValue);
            this._rerender_preview(widgetValue);
        }
    },
    _rerender_preview: function (size) {

        let gridElement = this.$target.find('.s_nb_grid');
        if (!gridElement) {
            console.error(".s_nb_grid class not found");
            return;
        }

        let res = ""
        size = parseInt(size)
        for (let i = 0; i < size; i++) {
            res += `<div class="row trombinoscope-row gx-1 mb-2 justify-content-center">`;
            for (let j = 0; j < size; j++) {
                res += `<div class="col-auto">
                            <div class="card trombinoscope-card">
                                <a href="#" class="trombinoscope-card-link">
                                    <img src="/yo_trombinoscope_member/static/src/img/placeholder-150.png" class="card-img-top img-thumbnail" alt="...">
                                    <div class="card-body trombinoscope-card-text">
                                        <h5 class="card-title placeholder-glow">
                                            <span class="placeholder col-6"></span>
                                        </h5>
                                        <p class="card-text placeholder-glow">
                                            <span class="placeholder col-4"></span>
                                            <span class="placeholder col-7"></span>
                                            <span class="placeholder col-7"></span>
                                        </p>
                                    </div>
                                </a>
                            </div>
                        </div>`;
            }
            res += '</div>';
        }

        gridElement.html(res);
    }
});

options.registry.TrombinoscopeMemberOptions = TrombinoscopeMemberOptions;

export default TrombinoscopeMemberOptions;
