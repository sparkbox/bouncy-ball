(function() {
  const updatePanes = require('./updatePanes'),
        toggleDocs = require('./toggleDocs'),

        // DOM queries and a URL lookup.
        options = document.querySelectorAll('input[type="radio"]'),
        unsupportedLink = document.querySelector('.unsupported-details'),
        docsToggleLink = document.querySelector('.docs-toggle-link'),
        hashOption = window.location.hash;

  // Pre-select an option, if it is found in the URL fragment.
  if (hashOption) {
    document.querySelector('input[checked]').removeAttribute('checked');
    document.getElementById(hashOption.slice(1)).setAttribute('checked', true);
  }

  updatePanes();

  // Set listeners for future updates:
  for (var i = 0; i < options.length; i++) {
    options[i].addEventListener('change', updatePanes);
  }
  docsToggleLink.addEventListener('click', toggleDocs);
  unsupportedLink.addEventListener('click', toggleDocs);
})();
