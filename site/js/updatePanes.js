const Prism = require('prismjs'),
      sourceDump = require('./sourceDump');

// Some function declarations.
function updatePanes() {
  const selected = document.querySelector('input[type="radio"]:checked'),
        name = selected.nextElementSibling.textContent,
        srcFileName = (selected.id === 'css') ? 'styles.css' : 'script.js',
        srcUrl = 'examples/' + selected.id + '/' + srcFileName,
        srcEl = document.querySelector('.source-pane > pre > code'),
        demoUrl = 'examples/' + selected.id + '/index.html',
        demoName = document.querySelector('.demo-name h2'),
        demoFrame = document.querySelector('.demo-frame');

  // Update the title
  demoName.textContent = name;

  // Update the demo pane
  demoFrame.setAttribute('src', demoUrl);

  // Update the source pane (scroll it to the top, and get the new source).
  document.querySelector('.source-pane > pre').scrollTop = 0;
  sourceDump(srcUrl, srcEl).then(response => {
    const srcLanguage = (selected.id === 'css') ? 'css' : 'javascript';
    srcEl.classList = '';
    srcEl.classList.add('language-' + srcLanguage);

    Prism.highlightAll();
  }, error => {
    console.error('Request Failed :(', error);
  });
}

module.exports = updatePanes;
