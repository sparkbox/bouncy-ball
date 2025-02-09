const ball = document.querySelector('ball');

// I'm declaring multiple keyframes
// until single keyframes are supported.
// See https://github.com/web-animations/web-animations-js/issues/14
const keyframes = { transform: ['translateY(0)', 'translateY(160px)'] };
const timing = {
  duration: 575,
  iterations: Infinity,
  direction: 'alternate',
  easing: 'cubic-bezier(.6, 0.08, 0.8, .6)'
};

ball.animate(keyframes, timing);
