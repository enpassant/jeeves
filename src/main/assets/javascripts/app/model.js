define(['base/request', 'mithril'], function (req, m) {
    var model = {};

    model.restUri = m.prop("/api");

    model.Message = function(header, content, type, action) {
        this.header = header;
        this.content = content;
        this.type = type;
        this.action = action;
    };

    model.errorHandler = function(menu, action, fn) {
        return function(error) {
            var messages = model.messages();
            var type = error.status >= 400 ? "error." : "warning.";
            var msg = new model.Message(error.statusText, error.responseText, type, action);
            messages.push(msg);
            model.messages(messages);

            if (menu && error.status === 401) {
                menu.removeToken();
            } else if (fn) fn();
        };
    };

    model.fullUri = function(uri) {
        return model.restUri() + uri;
    };

    model.messages = m.prop([]);

    model.links = m.prop([]);

    function clone(obj) {
        if (null === obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    model.setLinks = function(arr) {
        var links = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            var methods = arr[i].method.split(" ");
            for (var j = 0, len2 = methods.length; j < len2; j++) {
                var link = clone(arr[i]);
                link.fullUrl = model.fullUri(link.url);
                link.method = methods[j];
                links.push(link);
            }
        }
        model.links(links);
    };

    model.getLink = function(rel, method, contentType) {
        return model.links().find(function(link) {
            return (link.rel === rel && link.method === method &&
                (typeof contentType === 'undefined' || link.type === contentType));
        });
    };

    model.redirect = function(rel, method) {
        var href = model.getHref(rel, method);
        if (href) return m.route(href);
    };

    model.getComponent = function(type) {
        return type.match(/application\/([a-z.]+)/)[1];
    };

    model.getLinkHref = function(link, id) {
        if (link) {
            var url = id ? link.url.replace(/:[a-zA-Z0-9]+/, id) : link.url;
            return "/" + model.getComponent(link.type) +
                "?path=" + url + "&method=" + link.method;
        }
        return undefined;
    };

    model.getHref = function(rel, method, contentType, id) {
        var link = model.getLink(rel, method, contentType);
        return model.getLinkHref(link, id);
    };

    model.components = {};

    return model;
});
