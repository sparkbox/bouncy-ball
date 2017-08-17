const docsPane = document.querySelector('.docs-pane');
const docsToggle = document.querySelector('.docs-toggle-link');

/**
 * Function that toggles the docs pane.
 * @param    Object e - The event object
 */
function toggleDocs(e) {
  docsPane.classList.toggle('docs-pane_is-open');
  docsToggle.classList.toggle('docs-toggle-link_is-less');
  e.preventDefault();
}

module.exports = toggleDocs;
