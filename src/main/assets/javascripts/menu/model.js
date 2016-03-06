define(['base/request', 'app/model', 'cookie', 'mithril'], function (req, app, Cookies, m) {
    var model = {};

    model.userContentType = 'application/vnd.enpassant.user+json';
    model.tokenContentType = 'application/vnd.enpassant.token+json';

    model.vm = {};

    model.vm.links = m.prop([]);

    function clone(obj) {
        if (null === obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    model.vm.pages = function(arr) {
        var links = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var methods = arr[i].method.split(" ");
            for (var j = 0, len2 = methods.length; j < len2; j++) {
                var link = clone(arr[i]);
                link.method = methods[j];
                links.push(link);
            }
        }
        model.vm.links(links);
    };

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

    model.vm.getLink = function(rel, method, contentType) {
        return model.vm.links().find(function(page) {
            return (page.rel === rel && page.method === method &&
                (typeof contentType === 'undefined' || page.type === contentType));
        });
    };

    model.vm.redirect = function(rel, method) {
        var href = model.vm.getHref(rel, method);
        if (href) return m.route(href);
    };

    model.vm.getComponent = function(type) {
        return type.match(/application\/([a-z.]+)/)[1];
    };

    model.vm.getLinkHref = function(link, id) {
        if (link) {
            var url = id ? link.url.replace(/:[a-zA-Z0-9]+/, id) : link.url;
            return "/" + model.vm.getComponent(link.type) +
                "?path=" + url + "&method=" + link.method;
        }
        return undefined;
    };

    model.vm.getHref = function(rel, method, contentType, id) {
        var link = model.vm.getLink(rel, method, contentType);
        return model.vm.getLinkHref(link, id);
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
        var page = model.vm.getLink("user", "GET", model.userContentType);
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
        var page = model.vm.getLink("token", "GET", model.tokenContentType);
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
