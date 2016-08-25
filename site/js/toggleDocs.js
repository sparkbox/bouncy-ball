/**
 * Function that toggles the docs pane.
 * @param    Object e - The event object
 */
function toggleDocs(e) {
  const docsPane = document.querySelector('.docs-pane'),
        docsToggle = document.querySelector('.docs-toggle-link');

  docsPane.classList.toggle('docs-pane_is-open');
  docsToggle.classList.toggle('docs-toggle-link_is-less');

  e.preventDefault();
}

module.exports = toggleDocs;
