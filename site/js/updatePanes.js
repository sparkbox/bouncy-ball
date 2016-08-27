const Prism = require('prismjs'),
      Remarkable = require('remarkable'),
      sourceDump = require('./sourceDump'),
      Platform = require('platform'),

      // DOM queries
      srcPreEl = document.querySelector('.source-pane > pre'),
      srcCodeEl = document.querySelector('.source-pane > pre > code'),
      demoEl = document.querySelector('.demo-frame'),
      docsEl = document.querySelector('.docs-pane-content'),
      docsLinkDemoName = document.querySelector('.demo-name'),
      unsupportedEl = document.querySelector('.unsupported');

// We pull this value to the top level, so callbacks can access its latest value.
let selected;

/**
 * Updates the preview & source panes based to match the currently selected option.
 */
function updatePanes(event) {
  selected = document.querySelector('input[type="radio"]:checked');
  const name = selected.nextElementSibling.textContent,
        srcFileName = (selected.id === 'css') ? 'styles.css' :
                      (selected.id === 'smil') ? 'image.svg' : 'script.js',
        demoFileName = (selected.id === 'smil') ? 'image.svg' : 'index.html',
        // pane content urls
        srcUrl = 'examples/' + selected.id + '/' + srcFileName,
        demoUrl = 'examples/' + selected.id + '/' + demoFileName,
        docsUrl = 'examples/' + selected.id + '/readme.md';

  // Update the page URL, when an option is changed.
  // We only do this on the change event to prevent hash updates on initial page load.
  if (event && event.type === 'change') {
    window.location.hash = selected.id;
  }

  // Update the source pane (scroll it to the top, and get the new source).
  srcPreEl.scrollTop = 0;
  sourceDump(srcUrl, srcCodeEl, { successCallback: _highlightSource });

  // Update the demo pane.
  demoEl.setAttribute('src', demoUrl);
  _resetIncompatibilityMessage();
  if (!_isCompatible(selected.id)) {
    _showIncompatibilityMessage();
  }

  // Update the docs pane.
  docsLinkDemoName.textContent = name;
  sourceDump(docsUrl, undefined, { successCallback: _markdownToHtml});
}

/**
 * Runs PrismJS on the page. Designed to be called once the new source is on the page.
 * @private
 */
function _highlightSource() {
  const srcLanguage = (selected.id === 'css') ? 'css' :
                      (selected.id === 'smil') ? 'markup' : 'javascript';
  srcCodeEl.className = '';
  srcCodeEl.classList.add('language-' + srcLanguage);

  Prism.highlightAll();
}

/**
 * Runs Remarkable on readme text, and drops it into the docs pane.
 * @private
 */
function _markdownToHtml(response) {
  const parser = new Remarkable('commonmark');
  docsEl.innerHTML = parser.render(response);
}

/**
 * Checks if the selected demo is compatible with this browser.
 * @private
 */
function _isCompatible(selected) {
  const browser = Platform.name;

  if (selected === 'smil') {
    // only return true if there's a Modernizr 👍 and the browser isn't Safari.
    return Modernizr.smil && (browser !== 'Safari');
  }
  return true;
}

/**
 * @private
 */
function _showIncompatibilityMessage() {
  // hide iframe
  demoEl.style.display = 'none';
  // show message
  unsupportedEl.style.display = '';
}
function _resetIncompatibilityMessage() {
  // show iframe
  demoEl.style.display = '';
  // hide message
  unsupportedEl.style.display = 'none';
}

module.exports = updatePanes;
