define(['app/model', 'menu', 'base/request', 'mithril'], function (app, menu, req, m) {
    const model = {};

    model.contentType = 'application/collection+json';

    app.components.collection = model;

    function handleError(vm, error) {
        vm.appendable = false;
        app.errorHandler(menu)(error);
    }

    const appendRows = function(vm, rows) {
        if (rows.length > 0) {
            vm.rows(vm.rows().concat(rows));
        } else {
            vm.appendable = false;
        }
    };

    model.getColumns = function(link) {
        const columns = link ? link.columns.split(" ") : [];
        return columns.map(function(column) {
            const arr = column.split(":");
            if (arr.length >= 2) {
                return { name: arr[0], type: arr[1] };
            } else {
                return { name: arr[0], type: "string" };
            }
        });
    };

    model.append = function(vm) {
        if (vm.appendable) {
            const offset = vm.rows().length;
            const link = {method: "GET", fullUrl: vm.url + "?offset=" + offset,
                type: model.contentType};
            return req.sendLink(link, {}, app.setLinks).then(appendRows.bind(null, vm),
                handleError.bind(null, vm));
        }
    };

    model.load = function(vm) {
        const params = m.route.param();

        vm.url = params.path;
        const link = {method: "GET", fullUrl: vm.url, type: model.contentType};
        return req.sendLink(link, {}, app.setLinks).then(vm.rows).then(
            menu.initToken, handleError.bind(null, vm));
    };

    model.deleteItem = function(vm, link, id) {
        const params = m.route.param();
        link.fullUrl = (link.url).replace(/:[a-zA-Z0-9]+/, id);
        return req.sendLink(link, {}, app.setLinks).then(function() {
            return model.load(vm);
        });
    };

    return model;
});
