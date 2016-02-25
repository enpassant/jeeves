define(['base/request', 'mithril'], function (req) {
    var model = {};

    model.vm = {};

    model.vm.pages = m.prop([]);

    model.vm.getColumns = function(page) {
        var columns = page ? page.columns.split(" ") : [];
        return columns.map(function(column) {
            var arr = column.split(":");
            if (arr.length >= 2) {
                return { name: arr[0], type: arr[1] };
            } else {
                return { name: arr[0], type: "string" };
            }
        });
    };

    model.vm.getPage = function(rel) {
        return model.vm.pages().find(function(page) {
            return (page.rel === rel);
        });
    };

    model.vm.getComponent = function(type) {
        return type.match(/application\/([a-z.]+)/)[1];
    };

    model.vm.getHref = function(page, method) {
        if (page && page.method.contains(method)) {
            return "/" + model.vm.getComponent(page.type) + "?path=" +
                page.url + "&method=" + method;
        }
        return undefined;
    };

    model.vm.init = function() {
    };

    model.load = function(url) {
        req.head({url: url}, model.vm.pages);
    };

    return model;
});
