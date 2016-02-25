define(['menu', 'collection', 'blog', 'base/request', 'base/localization'],
    function (menu, collection, blog, req, loc)
{
    var restUri = "/api";

    var appMenu = {
        controller: function() {
            menu.load(restUri + '/');
        },
        view: function() {
            return m.component(menu);
        }
    };

    var app = {};

    app.getFullUri = function(uri) {
        return restUri + uri;
    };

    app.controller = function(data) {
        var params = m.route.param();

        if (params.path) {
            if (params.componentName && components[params.componentName]) {
                this.component = components[params.componentName];
                this.component.load(restUri + params.path);
            }
        } else {
            menu.load(restUri + '/');
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
            m("div.ui.segment", [
                m.component(component, ctrl)
            ]) : "Missing component";

        return m("div", [
            m.component(menu),
            componentUi
        ]);
    };

    m.route(document.body, "/", {
        "/": appMenu,
        "/:componentName": app
    });

    return app;
});

