define(['./model', 'menu', 'collection', 'blog'], function (model, menu, collection, blog) {
    model.controller = function(data) {
        var params = m.route.param();

        if (params.path) {
            if (params.componentName && components[params.componentName]) {
                this.component = components[params.componentName];
                this.component.load(model.fullUri(params.path)).then(
                    menu.initToken, model.errorHandler);
            }
        } else {
            menu.load(model.fullUri('/')).then(menu.initToken, model.errorHandler);
        }

        return this;
    };

    var components = {
        'collection': collection,
        'vnd.enpassant.blog': blog
    };
});
