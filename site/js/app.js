(function() {
  const updatePanes = require('./updatePanes'),
        docsToggle = require('./docsToggle'),
        options = document.querySelectorAll('input[type="radio"]');

  // Pre-select an option, if it is found in the URL fragment.
  if (window.location.hash) {
    document.querySelector('input[checked]').removeAttribute('checked');
    document.getElementById(window.location.hash.slice(1)).setAttribute('checked', true);
  }

  updatePanes();
  docsToggle.setup();
  // Set listeners for future updates:
  for (var i = 0; i < options.length; i++) {
    options[i].addEventListener('change', updatePanes);
  }
})();
