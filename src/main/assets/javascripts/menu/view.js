define(['./model', 'base/localization', 'mithril'], function (model, loc) {
    model.view = function() {
        return m("div.ui.menu.inverted.stackable",
            model.vm.pages().filter(function(page) {
                return page.title;
            }).map(function(page) {
                return m("a.item", {
                    href: model.vm.getHref(page, "GET"),
                    config: m.route},
                    loc.tr(page.title || ("get " + page.rel)));
            })
        );
    };
});
