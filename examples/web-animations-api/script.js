var ball = document.getElementsByTagName('ball')[0],

  // I'm declaring multiple keyframes
  // until single keyframes are supported.
  // See https://github.com/web-animations/web-animations-js/issues/14
  keyframes = [{ transform: 'translate3d(0, 0, 0)' },
               { transform: 'translate3d(0, 160px, 0)' }],
  timing = {
    duration: 575,
    iterations: Infinity,
    direction: 'alternate',
    easing: 'cubic-bezier(.6, 0.08, 0.8, .6)'
  };

ball.animate(keyframes, timing);
