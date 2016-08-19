function setup() {
  document.querySelector('.docs-toggle-link').addEventListener('click', (e) => {
    const docsPane = document.querySelector('.docs-pane');
    docsPane.classList.toggle('docs-pane_is-open');
    e.currentTarget.classList.toggle('docs-toggle-link_is-less');
    e.preventDefault();
  });
}

module.exports = { setup: setup };
