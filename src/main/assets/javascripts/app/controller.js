define(['./model', 'menu', 'collection', 'blog', 'mithril'],
    function (model, menu, collection, blog, m)
{
    model.controller = function(data) {
        this.onunload = function() {
            if (this.component && this.component.clean) this.component.clean();
        };

        var params = m.route.param();

        if (params.path) {
            if (params.componentName && components[params.componentName]) {
                this.component = components[params.componentName];
                this.component.load(model.fullUri(params.path)).then(
                    menu.initToken, model.errorHandler(menu));
            }
        } else {
            menu.load(model.fullUri('/')).then(menu.initToken, model.errorHandler(menu));
        }
    };

    var components = {
        'collection': collection,
        'vnd.enpassant.blog': blog
    };
});
