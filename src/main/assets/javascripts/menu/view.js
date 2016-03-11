define(['./model', 'app/model', 'base/localization', 'i18n!nls/messages',
     'base/request', 'mithril'],
     function (model, app, loc, msg, req, m)
{
    var login = function(name, password) {
        return function(elem) {
            var link = app.getLink("login", "POST", model.tokenContentType);
            var login = { name: name, password: password };
            req.sendData(link, login, 'application/json').then(
                function(token) {
                    sessionStorage.tokenId = token.id;
                    model.loadUser(token.userId);
                },
                app.errorHandler(model));
        };
    };

    var logout = function(event) {
        $(event.target).popup('destroy');
        var link = app.getLink("token", "DELETE", model.tokenContentType);
        link.fullUrl = app.fullUri(link.url.replace(/:[a-zA-Z0-9]+/, sessionStorage.tokenId));
        req.sendLink(link, {}, undefined).then(
            function(token) {
                sessionStorage.removeItem("tokenId");
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
            m("a.item[data-content=" + loc.tr(msg, "Log out") + "]",
                {onclick: logout, config: function(elem) {
                    $(elem).popup();
                }}, model.vm.loggedInUser())
        );
    };

    model.view = function() {
        var menuItems = app.links().filter(function(link) {
            return link.title && link.method === 'GET';
        }).map(function(link) {
            return m("a.item", {
                href: app.getLinkHref(link),
                config: m.route},
                loc.tr(msg, link.title || ("get " + link.rel)));
        });
        var rightMenu = m.component(model.vm.loginComponent());
        return m("div.ui.container.grid", [
            m("div.mobile.only.sixteen.wide.column",
                m("div.ui.inverted.top.fixed.menu",
                [ m("div.ui.dropdown.item", {config: function(elem) {
                    $(elem).dropdown();
                }}, [ m("i.icon.content") , m("div.menu", menuItems) ])
                ].concat(rightMenu))),
            m("div.computer.only.tablet.only.sixteen.wide.column",
                m("div.ui.inverted.top.fixed.menu",
                    menuItems.concat(rightMenu)))
        ]);
    };
});
