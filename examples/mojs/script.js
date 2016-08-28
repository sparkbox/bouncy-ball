var ball = new mojs.Shape({
  shape:    'circle',
  fill:     '#613961',
  radius:   25,
  top:      33,
  left:     33,
  y:        { 0 : 160 },
  duration: 575,
  repeat:   1,
  easing:   'quad.in',
  isYoyo:   true,
  onComplete () { ball.replay(); }
}).play();
