define(['./model', 'base/localization', 'base/request', 'cookie', 'mithril'],
     function (model, loc, req, Cookies)
 {
    var loadUser = function(userId) {
        var page = model.vm.getPage("user");
        req.send({url: "/api" + page.url, method: "GET"},
            model.vm.pages).then(function(user) {
                console.log(user);
                Cookies.set("user", user.name);
        });
    };

    var login = function(name, password) {
        return function(elem) {
            var page = model.vm.getPage("login");
            var login = { name: name, password: password };
            req.send({url: "/api" + page.url, method: "POST", data: login},
                model.vm.pages).then(function(token) {
                    console.log(token);
                    Cookies.set("tokenId", token.id);
                    Cookies.set("userId", token.userId);
                    loadUser(userId);
            });
        };
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
        var rightMenu = m("div.right.menu", [
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
        return m("div.ui.menu.inverted.stackable", menuItems.concat(rightMenu));
    };
});
