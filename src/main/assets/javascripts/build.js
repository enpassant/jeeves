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
      'semantic': 'empty:',
      'cookie': 'empty:',
      'jquery': 'empty:',
      'mithril': 'empty:',
      'mithril-translate': 'empty:',
      'jsRoutes' : 'empty:'
  }
});
