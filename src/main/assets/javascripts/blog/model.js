define(['menu', 'app/model', 'base/request', 'mithril'], function (menu, app, req, m) {
    var model = {};

    model.contentType = 'application/vnd.enpassant.blog+json';

    model.loadForEdit = function(vm) {
        var link = menu.vm.getLink("edit", "GET", model.contentType);
        if (link) {
            return req.sendLink(link, {}, menu.vm.setLinks).then(vm.blog);
        } else {
            var promise = new Promise(function (resolve, reject) {
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
            menu.vm.redirect("blogs", "GET");
        } else {
            var link = menu.vm.getLink("self", "PUT", model.contentType);
            var blog = vm.blog();
            blog.title = $('#blog-title').text();
            blog.note = $('#blog-note').val();
            req.sendData(link, vm.blog, model.contentType, menu.vm.setLinks).then(
                vm.blog).then(function() {
                    menu.vm.redirect("blogs", "GET");
                });
        }
    };

    model.delete = function(vm) {
        var link = menu.vm.getLink("self", "DELETE", model.contentType);
        var url = app.fullUri(link.url);
        req.sendLink(link, {}, menu.vm.setLinks).then(function() {
            menu.vm.redirect("blogs", "GET");
        });
    };

    model.init = function() {
        this.blog = m.prop({});
        this.isEditable = m.prop(false);

        model.load(this).then(function() {
            this.putHref = menu.vm.getHref("self", "PUT", model.contentType);
            this.deleteHref = menu.vm.getHref("self", "DELETE", model.contentType);
            this.params = m.route.param();
            if (this.params.method == "PUT" && this.putHref) {
                model.loadForEdit(this).then(function() {
                    this.isEditable(true);
                }.bind(this));
            }
        }.bind(this));
    };

    model.load = function(vm) {
        var params = m.route.param();

        vm.url = app.fullUri(params.path);

        if (vm.url.indexOf(':') >= 0) {
            return req.head(vm.url, menu.vm.setLinks).then(
                menu.initToken, app.errorHandler(menu));
        } else {
            var link = {method: "GET", fullUrl: vm.url, type: model.contentType};
            return req.sendLink(link, {}, menu.vm.setLinks).then(vm.blog).then(
                    menu.initToken, app.errorHandler(menu));
        }
    };

    return model;
});
