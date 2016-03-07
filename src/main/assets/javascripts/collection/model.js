define(['menu', 'base/request', 'mithril'], function (menu, req, m) {
    var model = {};

    model.contentType = 'application/collection+json';

    model.vm = {};

    model.vm.rows = m.prop([]);

    model.vm.init = function() {
    };

    model.load = function(url) {
        var link = {method: "GET", fullUrl: url, type: model.contentType};
        return req.sendLink(link, {}, menu.vm.setLinks).then(model.vm.rows);
    };

    return model;
});
