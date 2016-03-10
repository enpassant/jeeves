define(['./model', 'menu', 'base/localization', 'i18n!nls/messages', 'mithril'],
    function (model, menu, loc, msg, m) {
    model.view = function(ctrl, args) {
        var date = loc.format(model.vm.blog().date, 'date');
        var editable = ctrl.isEditable() ? "[contenteditable=true]" : "";
        var editIcon = (ctrl.putHref && !ctrl.isEditable()) ?
            m("a.clickable", {onclick: function() {
                model.vm.loadForEdit(ctrl.isEditable).then(function() {
                    ctrl.isEditable(true);
                });
            }}, m("i.write.icon"))
            : "";
        var deleteButton = ctrl.deleteHref ?
            m("button.ui.button.right.floated", {onclick: model.vm.delete},
                   loc.tr(msg, "Delete"))
            : "";

        var appendHtml = function(html) {
            return function(el, init) {
                if (!init) el.innerHTML = html;
            };
        };
        var noteUI = editable ?
            m("textarea#blog-note[rows=6]", model.vm.blog().note) :
            m("div.content", {config: appendHtml(model.vm.blog().note)});

        return m("div.ui.card", [
            m("div.content", [
                m("div.header#blog-title" + editable, {config: function(elem) {
                    elem.focus();
                }}, model.vm.blog().title),
                m("div.meta", [
                    loc.tr(msg, "by") + " " +
                    model.vm.blog().accountId, m("span.right.floated", date)
                ])
            ]),
            noteUI,
            m("div.extra.content", [
                m("i.comment.icon"), "1" + " " + loc.tr(msg, "comment")
            ]),
            m("div.extra.content", [
                m("button.ui.button.right.floated", {onclick: function() {
                    model.vm.save(ctrl);
                    }},
                    loc.tr(msg, "OK")),
                editIcon,
                deleteButton
            ])
        ]);
    };
});
