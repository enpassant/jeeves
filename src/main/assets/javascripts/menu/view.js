define(['./model', 'app/model', 'base/localization', 'i18n!nls/messages',
     'base/request', 'cookie', 'mithril'],
     function (model, app, loc, msg, req, Cookies, m)
{
    var login = function(name, password) {
        return function(elem) {
            var link = model.vm.getLink("login", "POST", model.tokenContentType);
            var login = { name: name, password: password };
            req.sendData(link, login, 'application/json').then(
                function(token) {
                    Cookies.set("tokenId", token.id);
                    model.loadUser(token.userId);
                },
                app.errorHandler(model));
        };
    };

    var logout = function() {
        $('#logout').popup('destroy');
        var link = model.vm.getLink("token", "DELETE", model.tokenContentType);
        link.fullUrl = app.fullUri(link.url.replace(/:[a-zA-Z0-9]+/, Cookies.get("tokenId")));
        req.sendLink(link, {}, undefined).then(
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
                loc.tr(msg, "Log in"), m("i.dropdown.icon"), m("div.menu", [
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
            m("a.item#logout[data-content=" + loc.tr(msg, "Log out") + "]",
                {onclick: logout, config: function(elem) {
                    $(elem).popup();
                }}, model.vm.loggedInUser())
        );
    };

    model.view = function() {
        var menuItems = model.vm.links().filter(function(link) {
            return link.title && link.method === 'GET';
        }).map(function(link) {
            return m("a.item", {
                href: model.vm.getLinkHref(link),
                config: m.route},
                loc.tr(msg, link.title || ("get " + link.rel)));
        });
        var rightMenu = m.component(model.vm.loginComponent());
        return m("div.ui.menu.inverted.stackable", menuItems.concat(rightMenu));
    };
});
