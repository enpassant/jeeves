define(['./model', './controller', 'menu', 'mithril'],
    function (model, controller, menu, m)
{
    model.view = function(ctrl) {
        const component = ctrl.component;

        const componentUi = (component) ?
            m("div.ui.basic.segment", [
                m(component)
            ]) : "";

        const outdatedBrowserUI = m("The browser is outdated");

        const messageUI = m("div.ui.basic.segment",
            model.messages().map(function(message, idx) {
                const msg = message.toObject();
                return m("div.ui." + msg.type + "message",
                    { config: function(elem) {
                        $(elem).off('click');
                        $(elem).on('click', function() {
                            const messages = model.messages().filter(
                                function(msg, i) {
                                    return (idx !== i);
                                }).toList();
                            model.messages(messages);
                            m.redraw();
                        });
                    }}, [
                    m("i.close.icon"),
                    m("div.header",
                        msg.action ? msg.header + ": " +  msg.action : msg.header),
                    msg.content
                ]);
           }).toArray()
        );

        const appUI = m("div", [
            m.component(menu),
            m("div.ui.stackable.grid", [
                m("div.twelve.wide.column", [
                    componentUi
                ]),
                m("div.four.wide.column", messageUI)
            ])
        ]);

        const isStorage = typeof(Storage) !== "undefined";

        return isStorage ? appUI : outdatedBrowserUI;
    };
});
