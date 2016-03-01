define(['menu', 'collection', 'blog', 'base/request', 'base/localization'],
    function (menu, collection, blog, req, loc)
{
    var restUri = "/api";

    var Message = function(header, content, type) {
        this.header = header;
        this.content = content;
        this.type = type;
    };

    var app = {};

    app.errorHandler = function(error) {
        var messages = app.messages();
        var type = error.status >= 400 ? "negative." : "warning.";
        var msg = new Message(error.statusText, error.responseText, type);
        messages.push(msg);
        app.messages(messages);
    };

    app.getFullUri = function(uri) {
        return restUri + uri;
    };

    app.messages = m.prop([]);

    app.controller = function(data) {
        var params = m.route.param();

        if (params.path) {
            if (params.componentName && components[params.componentName]) {
                this.component = components[params.componentName];
                this.component.load(restUri + params.path).then(
                    menu.initToken, app.errorHandler);
            }
        } else {
            menu.load(restUri + '/').then(menu.initToken, app.errorHandler);
        }

        return this;
    };

    var components = {
        'collection': collection,
        'vnd.enpassant.blog': blog
    };

    app.view = function(ctrl) {
        var component = ctrl.component;

        var componentUi = (component) ?
            m("div.ui.basic.segment", [
                m.component(component, ctrl)
            ]) : "";

        return m("div", [
            m.component(menu),
            m("div.ui.stackable.grid", [
                m("div.twelve.wide.column", [
                    componentUi
                ]),
                m("div.four.wide.column",
                    m("div.ui.basic.segment",
                        app.messages().map(function(msg) {
                            return m("div.ui." + msg.type + "message", [
                                m("div.header", msg.header),
                                msg.content
                            ]);
                       })
                    )
                )
            ])
        ]);
    };

    m.route(document.body, "/", {
        "/": app,
        "/:componentName": app
    });

    return app;
});

