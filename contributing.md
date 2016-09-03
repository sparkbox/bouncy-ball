# Contribute

Hey! You're thinking about contributing? That's awesome! You're awesome.

Here's a few things you should know before you submit your PR:

1. Bouncy Ball is a curation, not a collection. Not every technique makes sense in this format. For example, submissions using immature libraries, unstable APIs, or slight variations on existing techniques probably wouldn't be accepted.
2. New animation code should not require a build/compile step. For example, you'll want to use CSS instead of SCSS and browser-compatible ES5 instead of transpiled ES6.
3. Write concise, clean code. For style recommendations, check out [AirBnB's ES5 Javscript Styleguide](https://github.com/airbnb/javascript/tree/master/es5).
4. Any new animation should work on the demo page and be visually indistinguishable from existing animations (except for the color of the ball).
5. Please check your change across modern browsers. If some browsers don't support the animation, ensure the incompatibilty message is displayed.
6. Make your changes on a topic branch and submit PRs against the gh-pages branch.
7. The browser compatibility requirement is modern browsers (IE9+, and latest: Chrome, Firefox, Opera, and Safari).

When in doubt on how to organize your example, look at the structure of an existing example.
