// Keeping Modernizr here, since I'd like it to be globally accessible.
//   eslint-disable-next-line no-unused-vars
import '../vendor_custom/modernizr-custom.js';
import { updatePanes } from './updatePanes.js';
import { toggleDocs } from './toggleDocs.js';

// outline.js replacement that handles outline styling in our stylesheets.
document.addEventListener('mousedown', () => document.body.classList.add('no-focus'));
document.addEventListener('keydown', () => document.body.classList.remove('no-focus'));

// DOM queries and a URL lookup.
const options = document.querySelectorAll('.selection-bar .nav-button');
const unsupportedLink = document.querySelector('.unsupported-details');
const docsToggleLink = document.querySelector('.docs-toggle-link');
const hashOption = window.location.hash;

// Pre-select an option, if it is found in the URL fragment.
if (hashOption) {
  document.querySelector('.is-active').classList.remove('is-active');
  document.getElementById(hashOption.slice(1)).classList.add('is-active');
}

updatePanes();

// Set listeners for future updates:
options.forEach((option) => {
  option.addEventListener('click', updatePanes);
});
docsToggleLink.addEventListener('click', toggleDocs);
unsupportedLink.addEventListener('click', toggleDocs);
