const { styler, tween, easing } = popmotion;
const ballStyler = styler(document.querySelector('ball'));

tween({
  to: 160,
  duration: 575,
  ease: easing.easeIn,
  yoyo: Infinity,
}).start((v) => ballStyler.set('y', v));
