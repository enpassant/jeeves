(function(requirejs) {
    "use strict";

    var isStorage = typeof(Storage) !== "undefined";
    var lang = isStorage ? localStorage.lang : undefined;

    requirejs.config({
        optimize: "uglify2",
        skipDirOptimize: "true",
        keepBuildDir: "true",
        packages: ['app', 'menu', 'collection', 'blog'],
        paths: {
            'mithril': '../lib/mithril/mithril',
            'semantic': '../lib/Semantic-UI/semantic.min',
            'jquery': '../lib/jquery/jquery.min',
            'immutable': '../lib/immutable/immutable.min'
        },
        shim: {
            'semantic': {
                deps: ['jquery']
            },
            'jquery': {
                exports : '$'
            },
            'app': {
                deps: ['semantic']
            }
        },
        priority: ["mithril"],
        appDir: '../assets',
        baseUrl: 'javascripts'
    });

    requirejs.config({
        config: {
            i18n: {
                locale: lang
            }
        }
    });

    requirejs.onError = function(err) {
        console.log(err);
    };

    require(['app', 'mithril', 'immutable'], function (app, m) {
        m.route(document.body, "/", {
            "/": app,
            "/:componentName": app
        });
    });
})(requirejs);
