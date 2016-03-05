define(['base/request', 'app/model', 'cookie', 'mithril'], function (req, app, Cookies, m) {
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

    model.vm.redirect = function(rel, method) {
        var page = model.vm.igetPage(rel);
        if (page && method) {
            var href = model.vm.getHref(page, method);
            if (href) return m.route(href);
        }
    };

    model.vm.getPage = function(rel) {
        return model.vm.pages().find(function(page) {
            return (page.rel === rel);
        });
    };

    model.vm.getComponent = function(type) {
        return type.match(/application\/([a-z.]+)/)[1];
    };

    model.vm.getHref = function(page, method, id) {
        if (page && page.method.contains(method)) {
            var url = id ? page.url.replace(/:[a-zA-Z0-9]+/, id) : page.url;
            return "/" + model.vm.getComponent(page.type) +
                "?path=" + url + "&method=" + method;
        }
        return undefined;
    };

    model.vm.init = function() {
    };

    model.initToken = function() {
        var tokenId = Cookies.get('tokenId');
        if (tokenId && !model.vm.loggedInUser()) {
            var tokenPromise = model.loadToken(tokenId);
        }
    };

    model.load = function(url) {
        return req.head({url: url}, model.vm.pages);
    };

    model.loginComponent = {};

    model.loggedInComponent = {};

    model.vm.loginComponent = m.prop(model.loginComponent);
    model.vm.loggedInUser = m.prop("");

    model.removeToken = function(tokenId) {
        Cookies.remove("tokenId");
        model.vm.loginComponent(model.loginComponent);
        model.vm.loggedInUser("");
    };

    model.loadUser = function(userId) {
        var page = model.vm.getPage("user");
        if (page) {
            var url = app.fullUri(page.url.replace(/:[a-zA-Z0-9]+/, userId));
            req.send({url: url, method: "GET"}, undefined).then(
                function(user) {
                    model.vm.loggedInUser(user.name);
                    model.vm.loginComponent(model.loggedInComponent);
                    m.route(m.route(), undefined, true);
            }, app.errorHandler(model, "Load logged in user data", model.removeToken));
        }
    };

    model.loadToken = function(tokenId) {
        var page = model.vm.getPage("token");
        if (page) {
            var url = app.fullUri(page.url.replace(/:[a-zA-Z0-9]+/, tokenId));
            return req.send({url: url, method: "GET"}, undefined).then(
                function(token) {
                    Cookies.set("tokenId", token.id);
                    model.loadUser(token.userId);
                }, app.errorHandler(model, "Load logged in user data", model.removeToken)
            );
        }
    };

    return model;
});
