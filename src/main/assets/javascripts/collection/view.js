define(['./model', 'app/model', 'menu', 'base/localization', 'base/request', 'jquery',
    'mithril', 'semantic'], function (model, app, menu, loc, req, $, m)
{
    var deleteItem = function(href) {
        return function(elem) {
            var $dialog = $('.ui.modal.delete');
            $dialog.modal({
                onApprove : function() {
                    m.startComputation();
                    var params = m.route.param();
                    req.send({url: href, method: "DELETE"}, menu.vm.pages).then(function() {
                        model.load(app.fullUri(params.path));
                    });
                    m.endComputation();
                }
            }).modal('show');
        };
    };

    model.view = function() {
        var page = menu.vm.getLink("self", "GET", model.contentType);
        var columns = menu.vm.getColumns(page);
        var columnsUI = columns.map(function(column, i) {
            return m("th", loc.tr(column.name));
        });
        var operations = [ m("i.configure.icon") ];
        var href = menu.vm.getHref("new", "GET");
        if (href) {
            operations.push(m("a", {href: href, config: m.route}, m("i.add.circle.icon")));
        }
        columnsUI.push(m("th", operations));
        return m("div", [
            m("table.ui.compact.striped.table", [
                m("thead", [
                    m("tr", columnsUI)
                ]),
                m("tbody", [
                    model.vm.rows().map(function(row, index) {
                        var id = row[Object.keys(row)[0]];
                        var columnValueUI = columns.map(function(column, i) {
                            return m("td", row[column.name] ?
                                   loc.format(row[column.name], column.type) : "");
                        });
                        var operations = [];
                        href = menu.vm.getHref("item", "GET", undefined, id);
                        if (href) {
                            operations.push(m("a", {href: href, config: m.route},
                                m("i.unhide.icon")));
                        }
                        href = menu.vm.getHref("item", "PUT", undefined, id);
                        if (href) {
                            operations.push(m("a", {href: href, config: m.route},
                                m("i.write.icon")));
                        }
                        page = menu.vm.getLink("item", "DELETE");
                        if (page) {
                            href = (app.fullUri(page.url)).replace(/:[a-zA-Z0-9]+/, id);
                            operations.push(m("a.clickable", {onclick: deleteItem(href)},
                                m("i.trash.outline.icon")));
                        }
                        columnValueUI.push(m("td", operations));
                        return m("tr", columnValueUI);
                    })
                ]),
                m("div.ui.modal.delete", [
                    m("div.content", m("p", "Are you sure you want to delete?")),
                    m("div.actions", [
                        m("div.ui.black.deny.button", "No"),
                        m("div.ui.positive.right.labeled.icon.button", [
                            m("i.checkmark.icon"), "Yes"
                        ])
                    ])
                ])
            ])
        ]);
    };
});
