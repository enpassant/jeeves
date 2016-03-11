define(['./model', 'mithril', 'jquery'], function (model, m, $) {
    model.controller = function(data) {
        this.appendable = true;
        this.rows = m.prop([]);
        this.onunload = function() {
            this.appendable = true;
        };

        model.load(this);

        this.deleteItem = function(link, id) {
            var $dialog = $('.ui.modal.delete');
            $dialog.modal({
                onApprove : function() {
                    m.startComputation();
                    model.deleteItem(link, id);
                    m.endComputation();
                }
            }).modal('show');
        };
    };
});
