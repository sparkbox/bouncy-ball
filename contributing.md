# Contributing

Hey! You're thinking about contributing? That's awesome! You're awesome.

Here's a few things you should know before you submit your PR:

1. Bouncy Ball is a curation, not a collection. Not every technique makes sense in this format. For example, submissions using immature libraries, unstable APIs, or slight variations on existing techniques probably wouldn't be accepted.
2. New animation code should not require a build/compile step. For example, you'll want to use CSS instead of SCSS and browser-compatible ES5 instead of transpiled ES6.
3. Write concise, clean code. For style recommendations, check out [AirBnB's ES5 Javscript Styleguide](https://github.com/airbnb/javascript/tree/b4d8543f120ba761ae7f39caf850c1e4efdc2727/es5).
4. Any new animation should work on the demo page and be visually indistinguishable from existing animations (except for the color of the ball).
5. Please test your animation across modern browsers. If some browsers don't support the animation, ensure the incompatibilty message is displayed.
6. The browser compatibility requirement for the bouncy-ball site itself is modern browsers (Edge, Chrome, Firefox, and Safari).

When in doubt on how to organize your example, start by copying the `examples/template` folder and using it as a base. You can look at the structure of existing examples for reference.

## Development Workflow

1. Clone the project down to your computer.
2. From the project folder, run `npm ci` in your terminal.
3. Start a local static server with `npm start` in your terminal and visit the URL given by the output to see the site.
4. Make file changes, and refresh to see them updated.

## Updating Dependencies

1. Animation examples using a library have a downloaded copy of the library in their folder. To update it, replace it with a newer version of the file and rename it accordingly.
2. Other JavaScript dependencies are declared in `packaged.json`. They use Snowpack to generate ES6 modules bundles which are saved in `site/web_modules`. To update them:
    - Update the version number in `package.json`
    - Run `npm install`
    - Rebuild the dependencies with Snowpack: `npm run build`
    - Test the functionality and check the files into version control.
3. Dependencies with custom builds are kept in `site/vendor_custom`. To update these, browse to the URL at the top of the file, regenerate the code snippet, and paste it over the existing snippet.

## Contribution Workflow

1. Fork and clone the repo.
2. Make your changes on a [feature-branch](https://bocoup.com/weblog/git-workflow-walkthrough-feature-branches).
3. Submit a Pull Request to the `master` branch.
