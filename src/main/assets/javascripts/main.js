(function(requirejs) {
    "use strict";

    require.config({
        optimize: "none",
        skipDirOptimize: "true",
        keepBuildDir: "true",
        packages: ['app', 'menu', 'collection', 'blog'],
        paths: {
            'mithril': '../lib/mithril/mithril.min',
            'mithril-translate': '../third/mithril-translate/mithril-translate',
            'semantic': '../lib/Semantic-UI/semantic.min',
            'jquery': '../lib/jquery/jquery.min',
            'cookie': '../third/cookie/js.cookie'
        },
        shim: {
            'mithril-translate': {
                deps: [ 'mithril' ]
            },
            'semantic': {
                deps: ['jquery']
            },
            'jquery': {
                exports : '$'
            },
            'app': {
                deps: ['mithril-translate', 'semantic']
            }
        },
        priority: ["mithril"],
        appDir: '../assets',
        baseUrl: 'javascripts'
    });

    requirejs.onError = function(err) {
        console.log(err);
    };

    require(['jquery', 'semantic', 'app'], function ($, semantic, app) {
    });
})(requirejs);
