define(['./model', 'app/model', 'base/localization', 'base/request', 'cookie', 'mithril'],
     function (model, app, loc, req, Cookies, m)
{
    var login = function(name, password) {
        return function(elem) {
            var page = model.vm.getPage("login");
            var login = { name: name, password: password };
            req.send({url: app.fullUri(page.url), method: "POST", data: login}, undefined).then(
                function(token) {
                    Cookies.set("tokenId", token.id);
                    model.loadUser(token.userId);
                },
                app.errorHandler(model));
        };
    };

    var logout = function() {
        var page = model.vm.getPage("token");
        var url = app.fullUri(page.url.replace(/:[a-zA-Z0-9]+/, Cookies.get("tokenId")));
        req.send({url: url, method: "DELETE"}, undefined).then(
            function(token) {
                Cookies.remove("tokenId");
                model.vm.loginComponent(model.loginComponent);
                model.vm.loggedInUser("");
                var route = m.route();
                m.route(route, undefined, true);
            });
    };

    model.loginComponent.view = function(ctrl, args) {
        return m("div.right.menu", [
            m("div.ui.dropdown.item", {config: function(elem) {
                $(elem).dropdown();
            }}, [
                "Login", m("i.dropdown.icon"), m("div.menu", [
                    m("a.item", {onclick: login("jim", "jim123")}, "Jim"),
                    m("a.item", {onclick: login("john", "john123")}, "John"),
                    m("a.item", {onclick: login("john", "john")}, "John with wrong password"),
                    m("a.item", {onclick: login("fred", "fred123")}, "Fred")
                ])
            ]),
        ]);
    };

    model.loggedInComponent.view = function(ctrl, args) {
        return m("div.right.menu",
            m("a.item", {onclick: logout}, model.vm.loggedInUser())
        );
    };

    model.view = function() {
        var menuItems = model.vm.pages().filter(function(page) {
            return page.title;
        }).map(function(page) {
            return m("a.item", {
                href: model.vm.getHref(page, "GET"),
                config: m.route},
                loc.tr(page.title || ("get " + page.rel)));
        });
        var rightMenu = m.component(model.vm.loginComponent());
        return m("div.ui.menu.inverted.stackable", menuItems.concat(rightMenu));
    };
});
