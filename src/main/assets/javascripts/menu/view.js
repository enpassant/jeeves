define(['./model', 'base/localization', 'base/request', 'mithril'], function (model, loc, req) {
    var login = function(name, password) {
        return function(elem) { 
            var page = model.vm.getPage("login");
            var href = model.vm.getHref(page, "POST");
            m.startComputation();
            var login = { name: name, password: password };
            req.send({url: "/api" + page.url, method: "POST", data: login},
                 model.vm.pages).then(function() {
            });
            m.endComputation();
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
            ])
        ]);
        return m("div.ui.menu.inverted.stackable", menuItems.concat(rightMenu));
    };
});
