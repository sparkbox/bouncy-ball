const updatePanes = require('./updatePanes');
const toggleDocs = require('./toggleDocs');

function init() {
  // DOM queries and a URL lookup.
  const options = document.querySelectorAll('input[type="radio"]');
  const unsupportedLink = document.querySelector('.unsupported-details');
  const docsToggleLink = document.querySelector('.docs-toggle-link');
  const hashOption = window.location.hash;

  // Pre-select an option, if it is found in the URL fragment.
  if (hashOption) {
    document.querySelector('input[checked]').removeAttribute('checked');
    document.getElementById(hashOption.slice(1)).setAttribute('checked', true);
  }

  updatePanes();

  // Set listeners for future updates:
  options.forEach((option) => {
    option.addEventListener('change', updatePanes);
  });
  docsToggleLink.addEventListener('click', toggleDocs);
  unsupportedLink.addEventListener('click', toggleDocs);
}

module.exports = { init };
