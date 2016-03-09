(function(requirejs) {
    "use strict";

    var isStorage = typeof(Storage) !== "undefined";
    var lang = isStorage ? localStorage.lang : undefined;

    requirejs.config({
        optimize: "none",
        skipDirOptimize: "true",
        keepBuildDir: "true",
        packages: ['app', 'menu', 'collection', 'blog'],
        paths: {
            'mithril': '../lib/mithril/mithril.min',
            'semantic': '../lib/Semantic-UI/semantic.min',
            'jquery': '../lib/jquery/jquery.min'
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

    require(['jquery', 'semantic', 'app'], function ($, semantic, app) {
    });
})(requirejs);
