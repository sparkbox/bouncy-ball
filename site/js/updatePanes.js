const Prism = require('prismjs'),
      Remarkable = require('remarkable'),
      sourceDump = require('./sourceDump');

/**
 * Updates the preview & source panes based to match the currently selected option.
 */
function updatePanes(event) {
  const selected = document.querySelector('input[type="radio"]:checked'),
        name = selected.nextElementSibling.textContent,
        srcFileName = (selected.id === 'css') ? 'styles.css' : 'script.js',
        // pane content urls
        srcUrl = 'examples/' + selected.id + '/' + srcFileName,
        demoUrl = 'examples/' + selected.id + '/index.html',
        docsUrl = 'examples/' + selected.id + '/readme.md',
        // pane elements
        srcEl = document.querySelector('.source-pane > pre > code'),
        demoEl = document.querySelector('.demo-frame'),
        docsEl = document.querySelector('.docs-pane'),

        docsLinkDemoName = document.querySelector('.demo-name');

  // Update the page URL, when an option is changed.
  // We only do this on the change event to prevent hash updates on initial page load.
  if (event && event.type === 'change') {
    window.location.hash = selected.id;
  }

  // Update the source pane (scroll it to the top, and get the new source).
  document.querySelector('.source-pane > pre').scrollTop = 0;
  sourceDump(srcUrl, srcEl, { successCallback: _highlightSource });

  // Update the demo pane.
  demoEl.setAttribute('src', demoUrl);

  // Update the docs pane.
  docsLinkDemoName.textContent = name;
  sourceDump(docsUrl, undefined, { successCallback: _markdownToHtml});

  /**
   * Runs PrismJS on the page. Designed to be called once the new source is on the page.
   * @private
   */
  function _highlightSource() {
    const srcLanguage = (selected.id === 'css') ? 'css' : 'javascript';
    srcEl.className = '';
    srcEl.classList.add('language-' + srcLanguage);

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
}

module.exports = updatePanes;
