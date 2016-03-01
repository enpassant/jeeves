define(['menu', 'app/model', 'base/request', 'mithril'], function (menu, app, req) {
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
        console.log(url);
        var blog = model.vm.blog();
        blog.title = $('#blog-title').text();
        blog.note = $('#blog-note').text();
        req.send({method: "PUT", url: url, data: model.vm.blog}, menu.vm.pages).then(
            model.setBlog);
    };

    model.vm.init = function() {
        return model.vm;
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
