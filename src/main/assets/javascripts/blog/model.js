define(['menu', 'app/model', 'base/request', 'mithril'], function (menu, app, req, m) {
    var model = {};

    model.blog = {};

    model.setBlog = function(blog) {
        model.blog = blog;
        model.vm.blog(blog);
    };

    model.vm = {};

    model.vm.blog = m.prop({});

    model.vm.send = function() {
        var page = menu.vm.getPage("self");
        var url = app.fullUri(page.url);
        var blog = model.vm.blog();
        blog.title = $('#blog-title').text();
        blog.note = $('#blog-note').text();
        req.send({method: "PUT", url: url, data: model.vm.blog}, menu.vm.pages).then(
            model.setBlog).then(function() {
                page = menu.vm.getPage("blogs");
                var href = menu.vm.getHref(page, "GET");
                m.route(href);
            });
    };

    model.vm.delete = function() {
        var page = menu.vm.getPage("self");
        var url = app.fullUri(page.url);
        req.send({method: "DELETE", url: url}, menu.vm.pages).then(function() {
            page = menu.vm.getPage("blogs");
            var href = menu.vm.getHref(page, "GET");
            m.route(href);
        });
    };

    model.vm.init = function() {
        this.page = menu.vm.getPage("self");
        this.putHref = menu.vm.getHref(this.page, "PUT");
        this.deleteHref = menu.vm.getHref(this.page, "DELETE");
        this.params = m.route.param();
        this.isEditable = m.prop(this.params.method == "PUT" && this.putHref);
        return this;
    };

    model.load = function(url) {
        model.vm.blog = m.prop({});

        if (url.contains(':')) {
            return req.head({url: url}, menu.vm.pages);
        } else {
            return req.send({method: "GET", url: url}, menu.vm.pages).then(model.setBlog);
        }
    };

    return model;
});
