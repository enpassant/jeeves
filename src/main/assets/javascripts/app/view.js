define(['./model', './controller', 'base/localization', 'menu', 'mithril'],
    function (model, controller, loc, menu)
{
    model.view = function(ctrl) {
        var component = ctrl.component;

        var componentUi = (component) ?
            m("div.ui.basic.segment", [
                m.component(component, ctrl)
            ]) : "";

        return m("div", [
            m.component(menu),
            m("div.ui.stackable.grid", [
                m("div.twelve.wide.column", [
                    componentUi
                ]),
                m("div.four.wide.column",
                    m("div.ui.basic.segment",
                        model.messages().map(function(msg, idx) {
                            return m("div.ui." + msg.type + "message",
                                { config: function(elem) {
                                    $(elem).on('click', function() {
                                        $(this).closest('.message').transition('fade');
                                        var messages = model.messages().filter(
                                            function(msg, i) {
                                                return (idx !== i);
                                            });
                                        model.messages(messages);
                                    });
                                }}, [
                                m("i.close.icon"),
                                m("div.header",
                                    msg.action ? msg.header + ": " +  msg.action : msg.header),
                                msg.content
                            ]);
                       })
                    )
                )
            ])
        ]);
    };

    m.route(document.body, "/", {
        "/": model,
        "/:componentName": model
    });
});