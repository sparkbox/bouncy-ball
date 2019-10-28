const updatePanes = require('./updatePanes');
const toggleDocs = require('./toggleDocs');

function init() {
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
}

module.exports = { init };
