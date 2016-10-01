'use strict';

var pkg = require('./package.json');
const shell = require('shelljs');
var server = require('browser-sync').create(pkg.name);
var options = require('command-line-args')([
  { name: 'proxy',  alias: 'x', type: String },
  { name: 'port',   alias: 'p', type: Number },
  { name: 'static', alias: 'o', type: Boolean },
  { name: 'tunnel', alias: 't', type: String },
  { name: 'ssl',    alias: 's', type: Boolean },
  { name: 'watch',    alias: 'w', type: Boolean }
]);


var proxy = options.proxy || 'bouncyball.dev';
var port = options.port || 8080;
var tunnel = options.tunnel || false;
var https = options.ssl ? { key: './livereload.key', cert: './livereload.crt' } : false;

let sharedSettings = {
  port: port,
  tunnel: tunnel,
  https: https,
  logPrefix: pkg.name,
  open: false
};

// Configuration object passed to BrowserSync
var config = {};

// If we are using a proxy create a unique Object of settings
if (options.proxy) {

  config = Object.assign({
    proxy: proxy
  }, sharedSettings);

} else {
  // Rewrite URLs without .html to map to .html files
  var rewriteModule = require('http-rewrite-middleware').getMiddleware([
    { from: '(^((?!css|html|js|img|svg|ico|md|\/$).)*$)', to: '$1.html' }
  ]);
  config = Object.assign({
    server: { baseDir: '.' },
    middleware: [ rewriteModule ]
  }, sharedSettings);
}

// If we are watching files for changes add it to the config
if (options.watch) {
  var defaultOptions = { ignoreInitial: true };
  config = Object.assign({
    files: [
      {
        match: ['./site/css/*.css'],
        fn: function(e, path) {
          // shell.exec is synchronous
          shell.exec('npm run build:css');
          server.reload('*.css');
        },
        options: defaultOptions
      },
      {
        match: ['./site/js/*.js'],
        fn: function(e, path) {
          // shell.exec is synchronous
          shell.exec('npm run build:js');
          server.reload('*.js');
        },
        options: defaultOptions
      },
    ]
  }, config);
}


// Start the server!!
server.init( config );
