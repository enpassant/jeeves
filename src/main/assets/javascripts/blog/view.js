define(['./model', 'menu', 'base/localization', 'mithril'], function (model, menu, loc) {
    model.view = function(ctrl, args) {
        var date = loc.format(model.vm.blog().date, 'date');
        var editable = ctrl.isEditable() ? "[contenteditable=true]" : "";
        var editIcon = (ctrl.putHref && !ctrl.isEditable()) ?
            m("a.clickable", {onclick: function() {
                ctrl.isEditable(true);
            }}, m("i.write.icon"))
            : "";
        var deleteButton = ctrl.deleteHref ?
            m("button.ui.button.right.floated", {onclick: model.vm.delete}, "Delete")
            : "";
        return m("div.ui.card", [
            m("div.content", [
                m("div.header#blog-title" + editable, {config: function(elem) {
                    elem.focus();
                }}, model.vm.blog().title),
                m("div.meta", [
                    "by " + model.vm.blog().accountId, m("span.right.floated", date)
                ])
            ]),
            m("div.content#blog-note" + editable, model.vm.blog().note),
            m("div.extra.content", [
                m("i.comment.icon"), "1 comment"
            ]),
            m("div.extra.content", [
                m("button.ui.button.right.floated", {onclick: model.vm.send}, "OK"),
                editIcon,
                deleteButton
            ])
        ]);
    };
});
