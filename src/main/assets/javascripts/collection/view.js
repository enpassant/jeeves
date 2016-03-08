define(['./model', 'app/model', 'menu', 'base/localization', 'base/request', 'jquery',
    'mithril', 'i18n!nls/messages', 'semantic'],
     function (model, app, menu, loc, req, $, m, msg)
{
    var deleteItem = function(link, id) {
        return function(elem) {
            var $dialog = $('.ui.modal.delete');
            $dialog.modal({
                onApprove : function() {
                    m.startComputation();
                    var params = m.route.param();
                    link.fullUrl = (app.fullUri(link.url)).replace(/:[a-zA-Z0-9]+/, id);
                    req.sendLink(link, {}, menu.vm.setLinks).then(function() {
                        model.load(app.fullUri(params.path));
                    });
                    m.endComputation();
                }
            }).modal('show');
        };
    };

    model.view = function() {
        var link = menu.vm.getLink("self", "GET", model.contentType);
        var columns = menu.vm.getColumns(link);
        var columnsUI = columns.map(function(column, i) {
            return m("th", loc.tr(msg, column.name));
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
                        link = menu.vm.getLink("item", "DELETE");
                        if (link) {
                            operations.push(m("a.clickable", {onclick: deleteItem(link, id)},
                                m("i.trash.outline.icon")));
                        }
                        columnValueUI.push(m("td", operations));
                        return m("tr", columnValueUI);
                    })
                ]),
                m("div.ui.modal.delete", [
                    m("div.content", m("p", "Are you sure you want to delete?")),
                    m("div.actions", [
                        m("div.ui.black.deny.button", loc.tr(msg, "No")),
                        m("div.ui.positive.right.labeled.icon.button", [
                            m("i.checkmark.icon"), loc.tr(msg, "Yes")
                        ])
                    ])
                ])
            ])
        ]);
    };
});
