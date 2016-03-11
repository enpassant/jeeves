define(['./model', 'menu', 'collection', 'blog', 'mithril'],
    function (model, menu, collection, blog, m)
{
    model.controller = function(data) {
        var params = m.route.param();

        if (params.path) {
            if (params.componentName && components[params.componentName]) {
                this.component = components[params.componentName];
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
