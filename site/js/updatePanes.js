const Prism = require('prismjs'),
      sourceDump = require('./sourceDump');

/**
 * Updates the preview & source panes based to match the currently selected option.
 */
function updatePanes(event) {
  const selected = document.querySelector('input[type="radio"]:checked'),
        name = selected.nextElementSibling.textContent,
        srcFileName = (selected.id === 'css') ? 'styles.css' : 'script.js',
        srcUrl = 'examples/' + selected.id + '/' + srcFileName,
        srcEl = document.querySelector('.source-pane > pre > code'),
        demoUrl = 'examples/' + selected.id + '/index.html',
        demoName = document.querySelector('.demo-name h2'),
        demoFrame = document.querySelector('.demo-frame');

  // Update the page URL, when an option is changed.
  // We only do this on the change event to prevent hash updates on initial page load.
  if (event && event.type === 'change') {
    window.location.hash = selected.id;
  }

  // Update the title
  demoName.textContent = name;

  // Update the demo pane
  demoFrame.setAttribute('src', demoUrl);

  // Update the source pane (scroll it to the top, and get the new source).
  document.querySelector('.source-pane > pre').scrollTop = 0;
  sourceDump(srcUrl, srcEl, { successCallback: _highlightSource });

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
}

module.exports = updatePanes;
