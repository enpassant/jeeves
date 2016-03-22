define(['./model', 'menu', 'collection', 'blog', 'mithril'],
    function (model, menu, collection, blog, m)
{
    model.controller = function(data) {
        const params = m.route.param();

        if (params.path) {
            if (params.componentName && model.components[params.componentName]) {
                this.component = model.components[params.componentName];
            }
        } else {
            menu.load(model.fullUri('/')).then(menu.initToken, model.errorHandler(menu));
        }
    };
});
