define(['base/request', 'app/model', 'mithril'], function (req, app, m) {
    const model = {};

    model.userContentType = 'application/vnd.enpassant.user+json';
    model.tokenContentType = 'application/vnd.enpassant.token+json';

    model.vm = {};

    model.vm.init = function() {
    };

    model.initToken = function(value) {
        const tokenId = sessionStorage.tokenId;
        if (tokenId && !model.vm.loggedInUser()) {
            const tokenPromise = model.loadToken(tokenId);
        }
        return value;
    };

    model.load = function(url) {
        return req.head(url, app.setLinks);
    };

    model.loginComponent = {};

    model.loggedInComponent = {};

    model.vm.loginComponent = m.prop(model.loginComponent);
    model.vm.loggedInUser = m.prop("");

    model.removeToken = function(tokenId) {
        sessionStorage.removeItem("tokenId");
        model.vm.loginComponent(model.loginComponent);
        model.vm.loggedInUser("");
    };

    model.loadUser = function(userId) {
        const link = app.getLink("user", "GET", model.userContentType);
        if (link) {
            link.fullUrl = app.fullUri(link.url.replace(/:[a-zA-Z0-9]+/, userId));
            req.sendLink(link, {}, undefined).then(
                function(user) {
                    model.vm.loggedInUser(user.name);
                    model.vm.loginComponent(model.loggedInComponent);
                    m.route(m.route(), undefined, true);
            }, app.errorHandler(model, "Load logged in user data", model.removeToken));
        }
    };

    model.loadToken = function(tokenId) {
        const link = app.getLink("token", "GET", model.tokenContentType);
        if (link) {
            link.fullUrl = app.fullUri(link.url.replace(/:[a-zA-Z0-9]+/, tokenId));
            return req.sendLink(link,{}, undefined).then(
                function(token) {
                    sessionStorage.tokenId = token.id;
                    model.loadUser(token.userId);
                }, app.errorHandler(model, "Load logged in user data", model.removeToken)
            );
        }
    };

    return model;
});
