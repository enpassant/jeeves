define(['base/request', 'app/model', 'mithril'], function (req, app) {
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

    return model;
});
