define(['menu', 'app/model', 'base/request', 'mithril'], function (menu, app, req, m) {
    var model = {};

    model.contentType = 'application/vnd.enpassant.blog+json';

    model.blog = {};

    model.setBlog = function(blog) {
        model.blog = blog;
        model.vm.blog(blog);
    };

    model.vm = {};

    model.vm.blog = m.prop({});

    model.vm.loadForEdit = function() {
        var link = menu.vm.getLink("self", "GET", model.contentType);
        link.fullUrl += "?forEdit=true";
        return req.sendLink(link, {}, menu.vm.setLinks).then(model.setBlog);
    };

    model.vm.save = function(ctrl) {
        if (!ctrl.isEditable()) {
            menu.vm.redirect("blogs", "GET");
        } else {
            var link = menu.vm.getLink("self", "PUT", model.contentType);
            var blog = model.vm.blog();
            blog.title = $('#blog-title').text();
            blog.note = $('#blog-note').val();
            req.sendData(link, model.vm.blog, model.contentType, menu.vm.setLinks).then(
                model.setBlog).then(function() {
                    menu.vm.redirect("blogs", "GET");
                });
        }
    };

    model.vm.delete = function() {
        var link = menu.vm.getLink("self", "DELETE", model.contentType);
        var url = app.fullUri(link.url);
        req.sendLink(link, {}, menu.vm.setLinks).then(function() {
            menu.vm.redirect("blogs", "GET");
        });
    };

    model.vm.init = function() {
        this.putHref = menu.vm.getHref("self", "PUT", model.contentType);
        this.deleteHref = menu.vm.getHref("self", "DELETE", model.contentType);
        this.params = m.route.param();
        this.isEditable = m.prop(false);
        ctrl = this;
        if (this.params.method == "PUT" && this.putHref) {
            model.vm.loadForEdit().then(function() {
                ctrl.isEditable(true);
            });
        }

        return this;
    };

    model.load = function(url) {
        model.vm.blog = m.prop({});

        if (url.indexOf(':') >= 0) {
            return req.head(url, menu.vm.setLinks);
        } else {
            var link = {method: "GET", fullUrl: url, type: model.contentType};
            return req.sendLink(link, {}, menu.vm.setLinks).then(model.setBlog);
        }
    };

    return model;
});
