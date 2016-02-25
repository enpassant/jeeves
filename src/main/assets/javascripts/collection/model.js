define(['menu', 'base/request', 'mithril'], function (menu, req) {
    var model = {};

    model.vm = {};

    model.vm.rows = m.prop([]);

    model.vm.init = function() {
    };

    model.load = function(url) {
        req.send({method: "GET", url: url}, menu.vm.pages).then(model.vm.rows);
    };

    return model;
});
