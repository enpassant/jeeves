define(['./model', 'app/model', 'base/localization', 'jquery',
    'mithril', 'i18n!nls/messages', 'semantic'],
     function (model, app, loc, $, m, msg)
{
    model.view = function(vm) {
        const link = app.getLink("self", "GET", model.contentType);
        const columns = model.getColumns(link);
        const columnsUI = columns.map(function(column, i) {
            return m("th", loc.tr(msg, column.name));
        });
        const operations = [ m("i.configure.icon") ];
        const href = app.getHref("new", "GET");
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
                        const id = row[Object.keys(row)[0]];
                        const columnValueUI = columns.map(function(column, i) {
                            return m("td", row[column.name] ?
                                   loc.format(row[column.name], column.type) : "");
                        });
                        const operations = [];
                        const hrefGet = app.getHref("item", "GET", undefined, id);
                        if (hrefGet) {
                            operations.push(m("a", {href: hrefGet, config: m.route},
                                m("i.unhide.icon")));
                        }
                        const hrefPut = app.getHref("item", "PUT", undefined, id);
                        if (hrefPut) {
                            operations.push(m("a", {href: hrefPut, config: m.route},
                                m("i.write.icon")));
                        }
                        const linkDelete = app.getLink("item", "DELETE");
                        if (linkDelete) {
                            operations.push(m("a.clickable",
                                {onclick: vm.deleteItem.bind(vm, linkDelete, id)},
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
