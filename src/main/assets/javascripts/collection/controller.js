define(['./model', 'app/model', 'menu', 'base/request', 'mithril', 'jquery'],
function (model, app, menu, req, m, $) {
    model.controller = function(data) {
        this.deleteItem = function(link, id) {
            var $dialog = $('.ui.modal.delete');
            $dialog.modal({
                onApprove : function() {
                    m.startComputation();
                    var params = m.route.param();
                    link.fullUrl = (app.fullUri(link.url)).replace(/:[a-zA-Z0-9]+/, id);
                    req.sendLink(link, {}, menu.vm.setLinks).then(function() {
                        model.load(app.fullUri(params.path));
                    });
                    m.endComputation();
                }
            }).modal('show');
        };
    };
});
