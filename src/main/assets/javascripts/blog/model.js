define(['menu', 'app/model', 'base/request', 'mithril'], function (menu, app, req, m) {
    const model = {};

    model.contentType = 'application/vnd.enpassant.blog+json';

    app.components['vnd.enpassant.blog'] = model;

    model.loadForEdit = function(vm) {
        const link = app.getLink("edit", "GET", model.contentType);
        if (link) {
            return req.sendLink(link, {}, app.setLinks).then(vm.blog);
        } else {
            const promise = new Promise(function (resolve, reject) {
                m.startComputation();
                resolve();
                vm.isEditable(true);
                m.endComputation();
            });
            return promise;
        }
    };

    model.save = function(vm) {
        if (!vm.isEditable()) {
            app.redirect("blogs", "GET");
        } else {
            const link = app.getLink("self", "PUT", model.contentType);
            const blog = vm.blog();
            blog.title = $('#blog-title').text();
            blog.note = $('#blog-note').val();
            req.sendData(link, vm.blog, model.contentType, app.setLinks).then(
                vm.blog).then(function() {
                    app.redirect("blogs", "GET");
                });
        }
    };

    model.delete = function(vm) {
        const link = app.getLink("self", "DELETE", model.contentType);
        req.sendLink(link, {}, app.setLinks).then(function() {
            app.redirect("blogs", "GET");
        });
    };

    model.init = function() {
        this.blog = m.prop({});
        this.isEditable = m.prop(false);

        model.load(this).then(function() {
            this.putHref = app.getHref("self", "PUT", model.contentType);
            this.deleteHref = app.getHref("self", "DELETE", model.contentType);
            this.params = m.route.param();
            if (this.params.method == "PUT" && this.putHref) {
                model.loadForEdit(this).then(function() {
                    this.isEditable(true);
                }.bind(this));
            }
        }.bind(this));
    };

    model.load = function(vm) {
        const params = m.route.param();

        vm.url = params.path;

        if (vm.url.indexOf(':') >= 0) {
            return req.head(vm.url, app.setLinks).then(
                menu.initToken, app.errorHandler(menu));
        } else {
            const link = {method: "GET", fullUrl: vm.url, type: model.contentType};
            return req.sendLink(link, {}, app.setLinks).then(vm.blog).then(
                    menu.initToken, app.errorHandler(menu));
        }
    };

    return model;
});
