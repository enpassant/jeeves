define(['./model', 'mithril', 'jquery'], function (model, m, $) {
    model.controller = function(data) {
        this.appendable = true;
        this.rows = m.prop([]);
        this.onunload = function() {
            this.appendable = true;
        };

        model.load(this);

        this.deleteItem = function(link, id) {
            var vm = this;
            var $dialog = $('.ui.modal.delete');
            $dialog.modal({
                onApprove : function() {
                    model.deleteItem(vm, link, id);
                }
            }).modal('show');
        };
    };
});
