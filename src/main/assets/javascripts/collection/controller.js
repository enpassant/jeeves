define(['./model', 'mithril', 'jquery'], function (model, m, $) {
    model.controller = function(data) {
        this.appendable = true;
        this.rows = m.prop([]);
        this.onunload = function() {
            this.appendable = true;
        };

        model.load(this);

        this.deleteItem = function(link, id) {
            const vm = this;
            const $dialog = $('#dlgModalDelete');
            $dialog.modal({
                detachable: false,
                onApprove : function() {
                    model.deleteItem(vm, link, id);
                }
            }).modal('show');
        };
    };
});
