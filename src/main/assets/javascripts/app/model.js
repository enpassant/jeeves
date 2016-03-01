define(['base/request', 'mithril'], function (req) {
    var model = {};

    model.restUri = m.prop("/api");

    model.Message = function(header, content, type) {
        this.header = header;
        this.content = content;
        this.type = type;
    };

    model.errorHandler = function(error) {
        var messages = model.messages();
        var type = error.status >= 400 ? "negative." : "warning.";
        var msg = new model.Message(error.statusText, error.responseText, type);
        messages.push(msg);
        model.messages(messages);
    };

    model.fullUri = function(uri) {
        return model.restUri() + uri;
    };

    model.messages = m.prop([]);

    return model;
});
