const fs = require('fs');
const postcss = require('postcss');

// This task is based on Example A in the stylelint postcss docs:
// https://github.com/stylelint/stylelint/blob/d9690ba788b343338a24b319bd4376d3eac7f2b3/docs/user-guide/postcss-plugin.md#example-a

// CSS to be processed
const css = fs.readFileSync('../css/*.css', 'utf8');

postcss([
  require('stylelint')(),
  require('postcss-reporter')({ clearMessages: true })
])
  .process(css, {
    from: 'input.css',
  })
  .then()
  .catch(err => console.error(err.stack));
