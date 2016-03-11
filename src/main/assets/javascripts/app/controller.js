define(['./model', 'menu', 'collection', 'blog', 'mithril'],
    function (model, menu, collection, blog, m)
{
    model.controller = function(data) {
        var params = m.route.param();

        if (params.path) {
            if (params.componentName && components[params.componentName]) {
                if (model.component && model.component.clean) {
                    model.component.clean();
                }
                model.component = this.component = components[params.componentName];
                this.component.load(model.fullUri(params.path)).then(
                    menu.initToken, model.errorHandler(menu));
            }
        } else {
            menu.load(model.fullUri('/')).then(menu.initToken, model.errorHandler(menu));
        }

        return this;
    };

    var components = {
        'collection': collection,
        'vnd.enpassant.blog': blog
    };
});
