define(['./model', 'app/model', 'base/localization', 'jquery',
    'mithril', 'i18n!nls/messages', 'semantic'],
     function (model, app, loc, $, m, msg)
{
    model.view = function(vm) {
        var link = app.getLink("self", "GET", model.contentType);
        var columns = model.getColumns(link);
        var columnsUI = columns.map(function(column, i) {
            return m("th", loc.tr(msg, column.name));
        });
        var operations = [ m("i.configure.icon") ];
        var href = app.getHref("new", "GET");
        if (href) {
            operations.push(m("a", {href: href, config: m.route}, m("i.add.circle.icon")));
        }
        columnsUI.push(m("th", operations));
        return m("div", { config: function(elem) {
            $(elem)
              .visibility({
                once: false,
                observeChanges: true,
                onBottomVisible: function() {
                  model.append(vm);
                }
              })
            ;
            }}, [
            m("table.ui.compact.striped.table", [
                m("thead", [
                    m("tr", columnsUI)
                ]),
                m("tbody", [
                    vm.rows().map(function(row, index) {
                        var id = row[Object.keys(row)[0]];
                        var columnValueUI = columns.map(function(column, i) {
                            return m("td", row[column.name] ?
                                   loc.format(row[column.name], column.type) : "");
                        });
                        var operations = [];
                        href = app.getHref("item", "GET", undefined, id);
                        if (href) {
                            operations.push(m("a", {href: href, config: m.route},
                                m("i.unhide.icon")));
                        }
                        href = app.getHref("item", "PUT", undefined, id);
                        if (href) {
                            operations.push(m("a", {href: href, config: m.route},
                                m("i.write.icon")));
                        }
                        link = app.getLink("item", "DELETE");
                        if (link) {
                            operations.push(m("a.clickable",
                                {onclick: vm.deleteItem.bind(vm, link, id)},
                                m("i.trash.outline.icon")));
                        }
                        columnValueUI.push(m("td", operations));
                        return m("tr", columnValueUI);
                    })
                ])
            ]),
            m("div.ui.modal.delete.hidden#dlgModalDelete", [
                m("div.content", m("p", "Are you sure you want to delete?")),
                m("div.actions", [
                    m("div.ui.black.deny.button", loc.tr(msg, "No")),
                    m("div.ui.positive.right.labeled.icon.button", [
                        m("i.checkmark.icon"), loc.tr(msg, "Yes")
                    ])
                ])
            ])
        ]);
    };
});
