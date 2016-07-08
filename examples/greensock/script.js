var ball = document.getElementsByTagName('ball');

TweenMax.to(ball, 0.575, {
  transform: 'translate3d(0px, 160px, 0px)',
  repeat: -1,
  yoyo: true,
  ease: Power1.easeIn
});
