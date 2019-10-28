// Keeping Modernizr here, since I'd like it to be globally accessible.
//   eslint-disable-next-line no-unused-vars
const Modernizr = require('./vendor/modernizr-custom');
const App = require('./app');

// outline.js replacement that handles outline styling in our stylesheets.
document.addEventListener('mousedown', () => document.body.classList.add('no-focus'));
document.addEventListener('keydown', () => document.body.classList.remove('no-focus'));

App.init();
