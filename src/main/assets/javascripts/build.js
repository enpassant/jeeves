requirejs.config({
    mainConfigFile: 'main.js',
    optimize: "uglify2",
    //  uglify2: {
    //      mangle: false
    //  },
    preserveLicenseComments: false,
    generateSourceMaps: true,
    packages: ['base'],
    paths: {
        'mithril': '../third/mithril/mithril.min',
        'mithril-translate': '../third/mithril-translate/mithril-translate.min',
        'semantic': '../third/semantic/semantic.min',
        'jquery': '../third/jquery/jquery-1.12.0.min',
        'cookie': '../third/cookie/js.cookie'
    }
});
