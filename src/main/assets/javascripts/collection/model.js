define(['menu', 'base/request', 'mithril'], function (menu, req, m) {
    var model = {};

    model.vm = {};

    model.vm.rows = m.prop([]);

    model.vm.init = function() {
    };

    model.load = function(url) {
        return req.send({method: "GET", url: url}, menu.vm.pages).then(model.vm.rows);
    };

    return model;
});
