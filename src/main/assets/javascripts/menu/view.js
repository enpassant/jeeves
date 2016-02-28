define(['./model', 'base/localization', 'base/request', 'cookie', 'mithril'],
     function (model, loc, req, Cookies)
 {
    var login = function(name, password) {
        return function(elem) {
            var page = model.vm.getPage("login");
            var login = { name: name, password: password };
            req.send({url: "/api" + page.url, method: "POST", data: login}, undefined).then(
                function(token) {
                    Cookies.set("tokenId", token.id);
                    Cookies.set("userId", token.userId);
                    loadUser(token.userId);
                });
        };
    };

    var loadUser = function(userId) {
        var page = model.vm.getPage("user");
        if (page) {
            var url = "/api" + page.url.replace(/:[a-zA-Z0-9]+/, userId);
            req.send({url: url, method: "GET"}, undefined).then(
                function(user) {
                    Cookies.set("user", user.name);
                    model.vm.loggedInUser(user.name);
                    model.vm.loginComponent(model.loggedInComponent);
            });
        }
    };

    var logout = function() {
        var page = model.vm.getPage("token");
        var url = "/api" + page.url.replace(/:[a-zA-Z0-9]+/, Cookies.get("tokenId"));
        req.send({url: url, method: "DELETE"}, undefined).then(
            function(token) {
                Cookies.remove("tokenId");
                Cookies.remove("userId");
                model.vm.loginComponent(model.loginComponent);
                model.vm.loggedInUser("");
            });
    };

    model.loginComponent.view = function(ctrl, args) {
        return m("div.right.menu", [
            m("div.ui.dropdown.item", {config: function() {
                $('.ui.dropdown').dropdown();
            }}, [
                "Login", m("i.dropdown.icon"), m("div.menu", [
                    m("a.item", {onclick: login("jim", "jim123")}, "Jim"),
                    m("a.item", {onclick: login("john", "john123")}, "John"),
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
