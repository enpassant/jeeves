define(['./model', 'menu', 'base/localization', 'i18n!nls/messages', 'mithril'],
    function (model, menu, loc, msg, m) {
    model.view = function(vm, args) {
        var date = loc.format(vm.blog().date, 'date');
        var editable = vm.isEditable() ? "[contenteditable=true]" : "";
        var editIcon = (vm.putHref && !vm.isEditable()) ?
            m("a.clickable", {onclick: function() {
                model.loadForEdit(vm).then(function() {
                    vm.isEditable(true);
                });
            }}, m("i.write.icon"))
            : "";
        var deleteButton = vm.deleteHref ?
            m("button.ui.button.right.floated", {onclick: model.delete.bind(null, vm)},
                   loc.tr(msg, "Delete"))
            : "";

        var appendHtml = function(html) {
            return function(el, init) {
                if (!init) el.innerHTML = html;
            };
        };
        var noteUI = editable ?
            m("textarea#blog-note[rows=6]", vm.blog().note) :
            m("div.content", {config: appendHtml(vm.blog().note)});

        return m("div.ui.card", [
            m("div.content", [
                m("div.header#blog-title" + editable, {config: function(elem) {
                    elem.focus();
                }}, vm.blog().title),
                m("div.meta", [
                    loc.tr(msg, "by") + " " +
                    vm.blog().accountId, m("span.right.floated", date)
                ])
            ]),
            noteUI,
            m("div.extra.content", [
                m("i.comment.icon"), "1" + " " + loc.tr(msg, "comment")
            ]),
            m("div.extra.content", [
                m("button.ui.button.right.floated", {onclick: function() {
                    model.save(vm);
                    }},
                    loc.tr(msg, "OK")),
                editIcon,
                deleteButton
            ])
        ]);
    };
});
