(function(requirejs) {
    "use strict";

    require.config({
        optimize: "none",
        skipDirOptimize: "true",
        keepBuildDir: "true",
        packages: ['menu', 'collection', 'blog'],
        paths: {
            'mithril': '../third/mithril/mithril',
            'mithril-translate': '../third/mithril-translate/mithril-translate.min',
            'semantic': '../third/semantic/semantic.min',
            'jquery': '../third/jquery/jquery-1.12.0.min',
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
        baseUrl: '/javascripts'
    });

    requirejs.onError = function(err) {
        console.log(err);
    };

    require(['jquery', 'app'], function ($, app) {
    });
})(requirejs);
