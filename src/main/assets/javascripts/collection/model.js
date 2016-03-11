define(['menu', 'base/request', 'mithril'], function (menu, req, m) {
    var model = {};

    model.contentType = 'application/collection+json';

    model.appendable = true;

    model.clean = function() {
        model.appendable = true;
    };

    model.vm = {};

    model.vm.rows = m.prop([]);

    model.vm.init = function() {
    };

    var appendRows = function(rows) {
        if (rows.length > 0) {
            model.vm.rows(model.vm.rows().concat(rows));
        } else {
            model.appendable = false;
        }
    };

    model.append = function() {
        if (model.appendable) {
            var offset = model.vm.rows().length;
            var link = {method: "GET", fullUrl: model.vm.url + "?offset=" + offset,
                type: model.contentType};
            return req.sendLink(link, {}, menu.vm.setLinks).then(appendRows);
        }
    };

    model.load = function(url) {
        model.vm.url = url;
        var link = {method: "GET", fullUrl: url,
            type: model.contentType};
        return req.sendLink(link, {}, menu.vm.setLinks).then(model.vm.rows);
    };

    return model;
});
