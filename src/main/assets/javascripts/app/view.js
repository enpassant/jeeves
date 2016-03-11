define(['./model', './controller', 'menu', 'mithril'],
    function (model, controller, menu, m)
{
    model.view = function(ctrl) {
        var component = ctrl.component;

        var componentUi = (component) ?
            m("div.ui.basic.segment", [
                m(component)
            ]) : "";

        var outdatedBrowserUI = m("The browser is outdated");

        var messageUI = m("div.ui.basic.segment",
            model.messages().map(function(msg, idx) {
                return m("div.ui." + msg.type + "message",
                    { config: function(elem) {
                        $(elem).off('click');
                        $(elem).on('click', function() {
                            var messages = model.messages().filter(
                                function(msg, i) {
                                    return (idx !== i);
                                });
                            model.messages(messages);
                            $(elem).transition("fade");
                        });
                    }}, [
                    m("i.close.icon"),
                    m("div.header",
                        msg.action ? msg.header + ": " +  msg.action : msg.header),
                    msg.content
                ]);
           })
        );

        var appUI = m("div", [
            m.component(menu),
            m("div.ui.stackable.grid", [
                m("div.twelve.wide.column", [
                    componentUi
                ]),
                m("div.four.wide.column", messageUI)
            ])
        ]);

        var isStorage = typeof(Storage) !== "undefined";

        return isStorage ? appUI : outdatedBrowserUI;
    };

    m.route(document.body, "/", {
        "/": model,
        "/:componentName": model
    });
});
