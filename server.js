'use strict';

const pkg = require('./package.json');
const shell = require('shelljs');
const server = require('browser-sync').create(pkg.name);
const httpRewriteMiddleware = require('http-rewrite-middleware');
const options = require('command-line-args')([
  { name: 'proxy', alias: 'x', type: String },
  { name: 'port', alias: 'p', type: Number },
  { name: 'static', alias: 'o', type: Boolean },
  { name: 'tunnel', alias: 't', type: String },
  { name: 'ssl', alias: 's', type: Boolean },
  { name: 'watch', alias: 'w', type: Boolean },
]);

const proxy = options.proxy || 'bouncyball.dev';
const port = options.port || 8080;
const tunnel = options.tunnel || false;
const https = options.ssl ? { key: './livereload.key', cert: './livereload.crt' } : false;

const sharedSettings = {
  port,
  tunnel,
  https,
  logPrefix: pkg.name,
  open: false,
  notify: false,
};

// Configuration object passed to BrowserSync
let config = {};

// If we are using a proxy create a unique Object of settings
if (options.proxy) {
  config = Object.assign({
    proxy,
  }, sharedSettings);
} else {
  // Rewrite URLs without .html to map to .html files
  const rewriteModule = httpRewriteMiddleware.getMiddleware([
    // It's hard to tell if this escape is needed or not, so I'm leaving it here to be safe.
    //   eslint-disable-next-line no-useless-escape
    { from: '(^((?!css|html|js|img|svg|gif|mp4|ogg|webm|ico|md|swf|\/$).)*$)', to: '$1.html' },
  ]);
  config = Object.assign({
    server: { baseDir: '.' },
    middleware: [rewriteModule],
  }, sharedSettings);
}

// If we are watching files for changes add it to the config
if (options.watch) {
  const defaultOptions = { ignoreInitial: true };
  config = Object.assign({
    files: [
      {
        match: ['./site/css/*.css'],
        fn: function watchTask() {
          // shell.exec is synchronous
          shell.exec('npm run build:css');
          server.reload('*.css');
        },
        options: defaultOptions,
      },
      {
        // Added specific React script to prevent infinite loop from js output
        match: ['./site/js/*.js', './examples/react/script.js'],
        fn: function watchTask() {
          // shell.exec is synchronous
          shell.exec('npm run build:js');
          server.reload('*.js');
        },
        options: defaultOptions,
      },
    ],
  }, config);
}

// Start the server!!
server.init(config);
