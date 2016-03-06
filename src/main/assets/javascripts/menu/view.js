define(['./model', 'app/model', 'base/localization', 'base/request', 'cookie', 'mithril'],
     function (model, app, loc, req, Cookies, m)
{
    var login = function(name, password) {
        return function(elem) {
            var link = model.vm.getLink("login", "POST", model.tokenContentType);
            var login = { name: name, password: password };
            req.sendLink(link, {data: login}, undefined).then(
                function(token) {
                    Cookies.set("tokenId", token.id);
                    model.loadUser(token.userId);
                },
                app.errorHandler(model));
        };
    };

    var logout = function() {
        var link = model.vm.getLink("token", "DELETE", model.tokenContentType);
        var url = app.fullUri(link.url.replace(/:[a-zA-Z0-9]+/, Cookies.get("tokenId")));
        req.send({url: url, method: "DELETE"}, undefined).then(
            function(token) {
                Cookies.remove("tokenId");
                model.vm.loginComponent(model.loginComponent);
                model.vm.loggedInUser("");
                m.route(m.route(), undefined, true);
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
        var menuItems = model.vm.links().filter(function(link) {
            return link.title && link.method === 'GET';
        }).map(function(link) {
            return m("a.item", {
                href: model.vm.getLinkHref(link),
                config: m.route},
                loc.tr(link.title || ("get " + link.rel)));
        });
        var rightMenu = m.component(model.vm.loginComponent());
        return m("div.ui.menu.inverted.stackable", menuItems.concat(rightMenu));
    };
});
