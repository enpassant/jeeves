define(['app/model', 'menu', 'base/request', 'mithril'], function (app, menu, req, m) {
    var model = {};

    model.contentType = 'application/collection+json';

    app.components.collection = model;

    var appendRows = function(vm, rows) {
        if (rows.length > 0) {
            vm.rows(vm.rows().concat(rows));
        } else {
            vm.appendable = false;
        }
    };

    model.getColumns = function(link) {
        var columns = link ? link.columns.split(" ") : [];
        return columns.map(function(column) {
            var arr = column.split(":");
            if (arr.length >= 2) {
                return { name: arr[0], type: arr[1] };
            } else {
                return { name: arr[0], type: "string" };
            }
        });
    };

    model.append = function(vm) {
        if (vm.appendable) {
            var offset = vm.rows().length;
            var link = {method: "GET", fullUrl: vm.url + "?offset=" + offset,
                type: model.contentType};
            return req.sendLink(link, {}, app.setLinks).then(appendRows.bind(null, vm));
        }
    };

    model.load = function(vm) {
        var params = m.route.param();

        vm.url = app.fullUri(params.path);
        var link = {method: "GET", fullUrl: vm.url, type: model.contentType};
        return req.sendLink(link, {}, app.setLinks).then(vm.rows).then(
            menu.initToken, app.errorHandler(menu));
    };

    model.deleteItem = function(vm, link, id) {
        var params = m.route.param();
        link.fullUrl = (app.fullUri(link.url)).replace(/:[a-zA-Z0-9]+/, id);
        return req.sendLink(link, {}, app.setLinks).then(function() {
            return model.load(vm);
        });
    };

    return model;
});
