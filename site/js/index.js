// Keeping Modernizr here, since I'd like it to be globally accessible.
//   eslint-disable-next-line no-unused-vars
import '../vendor_custom/modernizr-custom.js';
import { updatePanes } from './updatePanes.js';
import { toggleDocs } from './toggleDocs.js';

// outline.js replacement that handles outline styling in our stylesheets.
document.addEventListener('mousedown', () => document.body.classList.add('no-focus'));
document.addEventListener('keydown', () => document.body.classList.remove('no-focus'));

// DOM queries and a URL lookup.
const unsupportedLink = document.querySelector('.unsupported-details');
const docsToggleLink = document.querySelector('.docs-toggle-link');

// Pre-select vanilla-js if no document fragment in url.
if (!window.location.hash) {
  window.location.hash = 'vanilla-js';
}

updatePanes();

window.addEventListener('hashchange', updatePanes);
docsToggleLink.addEventListener('click', toggleDocs);
unsupportedLink.addEventListener('click', toggleDocs);
