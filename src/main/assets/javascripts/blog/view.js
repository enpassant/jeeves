define(['./model', 'menu', 'base/localization', 'mithril'], function (model, menu, loc) {
    model.view = function(ctrl, args) {
        var date = loc.format(ctrl.blog().date, 'date');
        var editable = true ? "[contenteditable=true]" : "";
        return m("div.ui.card", [
            m("div.content", [
                m("div.header#blog-title" + editable, {config: function() {
                    document.getElementById('blog-title').focus();
                }}, ctrl.blog().title),
                m("div.meta", [
                    "by " + ctrl.blog().accountId, m("span.right.floated", date)
                ])
            ]),
            m("div.content#blog-note" + editable, ctrl.blog().note),
            m("div.extra.content", [
                m("i.comment.icon"), "1 comment"
            ]),
            m("div.extra.content", [
                m("button.ui.button.right.floated", {onclick: ctrl.send}, "OK")
            ])
        ]);
    };
});
