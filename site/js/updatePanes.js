/*  eslint-disable indent */
//  I'm disabling this rule here because the patterns and
//  indenting in this case makes it pretty readable.

const { Remarkable } = require('remarkable');
const Platform = require('platform');
const sourceDump = require('./sourceDump');
const Prism = require('./vendor/prismjs-custom');


// DOM queries
const srcPreEl = document.querySelector('.source-pane > pre');
const srcCodeEl = document.querySelector('.source-pane > pre > code');
const demoEl = document.querySelector('.demo-frame');
const docsEl = document.querySelector('.docs-pane-content');
const docsLinkDemoName = document.querySelector('.demo-name');
const unsupportedEl = document.querySelector('.unsupported');

// We pull this value to the top level, so callbacks can access its latest value.
let selected;

/**
 * @private
 */
function showIncompatibilityMessage() {
  // hide iframe
  demoEl.style.display = 'none';
  // show message
  unsupportedEl.style.display = '';
}
/**
 * @private
 */
function resetIncompatibilityMessage() {
  // show iframe
  demoEl.style.display = '';
  // hide message
  unsupportedEl.style.display = 'none';
}

/**
 * Runs Remarkable on readme text, and drops it into the docs pane.
 * @private
 */
function markdownToHtml(response) {
  const parser = new Remarkable('commonmark');
  docsEl.innerHTML = parser.render(response);
}

/**
 * Checks if the selected demo is compatible with this browser.
 * @private
 */
function isCompatible(selectedId) {
  const browser = Platform.name;

  if (selectedId === 'smil') {
    // only return true if there's a Modernizr 👍 and the browser isn't Safari.
    return Modernizr.smil && (browser !== 'Safari');
  }
  if (selectedId === 'flash') {
    return browser !== 'Safari';
  }
  if (selectedId === 'p5') {
    return Modernizr.webgl;
  }
  return true;
}

/**
 * Runs PrismJS on the page. Designed to be called once the new source is on the page.
 * @private
 */
function highlightSource() {
  const srcLanguage = (selected.id === 'css') ? 'css' :
                      (selected.id === 'css-step') ? 'css' :
                      (selected.id === 'smil') ? 'markup' :
                      (selected.id === 'video') ? 'markup' :
                      (selected.id === 'flash') ? 'markup' :
                      (selected.id === 'animated-gif') ? 'markup' : 'javascript';

  srcCodeEl.className = '';
  srcCodeEl.classList.add(`language-${srcLanguage}`);

  Prism.highlightAll();
}


/**
 * Updates the preview & source panes based to match the currently selected option.
 */
function updatePanes(event) {
  if (event && event.type === 'click') {
    // If a click triggered this function, we'll need to change .is-active
    // and update the url (these don't need to be done when this function
    // is run on the initial page load).
    document.querySelector('.is-active').classList.remove('is-active');
    event.currentTarget.classList.add('is-active');

    window.location.hash = selected.id;
  }

  selected = document.querySelector('.is-active');

  const name = selected.textContent;
  const srcFileName = (selected.id === 'css') ? 'styles.css' :
                      (selected.id === 'css-step') ? 'styles.css' :
                      (selected.id === 'smil') ? 'image.svg' :
                      (selected.id === 'video') ? 'index.html' :
                      (selected.id === 'flash') ? 'index.html' :
                      (selected.id === 'animated-gif') ? 'index.html' : 'script.js';

  const demoFileName = (selected.id === 'smil') ? 'image.svg' : 'index.html';

  // pane content urls
  const srcUrl = `examples/${selected.id}/${srcFileName}`;
  const demoUrl = `examples/${selected.id}/${demoFileName}`;
  const docsUrl = `examples/${selected.id}/readme.md`;

  // Update the source pane (scroll it to the top, and get the new source).
  srcPreEl.scrollTop = 0;
  sourceDump(srcUrl, srcCodeEl, { successCallback: highlightSource });

  // Update the demo pane.
  resetIncompatibilityMessage();
  if (!isCompatible(selected.id)) {
    showIncompatibilityMessage();
  } else {
    demoEl.setAttribute('src', demoUrl);
  }

  // Update the docs pane.
  docsLinkDemoName.textContent = name;
  sourceDump(docsUrl, undefined, { successCallback: markdownToHtml });
}

module.exports = updatePanes;
