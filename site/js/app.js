const updatePanes = require('./updatePanes'),
      options = document.querySelectorAll('input[type="radio"]');

// Update panes once for initial page load, then set listeners for future updates:
updatePanes();
for (var i = 0; i < options.length; i++) {
  options[i].addEventListener('change', updatePanes);
}
