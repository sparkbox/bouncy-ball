const updatePanes = require('./updatePanes');

// Update panes once for initial page load, then set listeners for future updates:
updatePanes();
document.querySelectorAll('input[type="radio"]').forEach(el => {
  el.addEventListener('change', updatePanes);
});
