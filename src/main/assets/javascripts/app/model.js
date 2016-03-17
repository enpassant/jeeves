define(['base/request', 'mithril', 'immutable'], function (req, m, Immutable) {
    const model = {};

    model.restUri = m.prop("/api");

    model.Message = function(header, content, type, action) {
        this.header = header;
        this.content = content;
        this.type = type;
        this.action = action;
    };

    model.errorHandler = function(menu, action, fn) {
        return function(error) {
            const messages = model.messages();
            const type = error.status >= 400 ? "error." : "warning.";
            const msg = Immutable.Map(
                new model.Message(error.statusText, error.responseText, type, action)
            );
            const newMessages = messages.push(msg);
            model.messages(newMessages);

            if (menu && error.status === 401) {
                menu.removeToken();
            } else if (fn) fn();
        };
    };

    model.fullUri = function(uri) {
        return model.restUri() + uri;
    };

    model.messages = m.prop(Immutable.List([]));

    model.links = m.prop(Immutable.List([]));

    model.setLinks = function(arr) {
        const links = [];
        for (var i = 0, len = arr.length; i < len; i++) {
            const methods = arr[i].method.split(" ");
            for (var j = 0, len2 = methods.length; j < len2; j++) {
                const link = Immutable.Map(arr[i])
                    .set("fullUrl", model.fullUri(arr[i].url))
                    .set("method", methods[j]);
                links.push(link);
            }
        }
        model.links(Immutable.List(links));
    };

    model.getLink = function(rel, method, contentType) {
        const linkObj = model.links().find(function(link) {
            return (link.get("rel") === rel && link.get("method") === method &&
                (typeof contentType === 'undefined' || link.get("type") === contentType));
        });
        return linkObj ? linkObj.toJS() : undefined;
    };

    model.redirect = function(rel, method) {
        const href = model.getHref(rel, method);
        if (href) return m.route(href);
    };

    model.getComponent = function(type) {
        return type.match(/application\/([a-z.]+)/)[1];
    };

    model.getLinkHref = function(link, id) {
        if (link) {
            const url = id ? link.url.replace(/:[a-zA-Z0-9]+/, id) : link.url;
            return "/" + model.getComponent(link.type) +
                "?path=" + url + "&method=" + link.method;
        }
        return undefined;
    };

    model.getHref = function(rel, method, contentType, id) {
        const link = model.getLink(rel, method, contentType);
        return model.getLinkHref(link, id);
    };

    model.components = {};

    return model;
});
