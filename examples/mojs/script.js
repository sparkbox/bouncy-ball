var ball = new mojs.Shape({
  shape:    'circle',
  radius:   25,
  top:      33,
  left:     33,
  y:        { 0 : 160 },
  duration: 575,
  repeat:   1,
  easing:   'quad.in',
  isYoyo:   true,
  onComplete: function() { ball.replay(); }
}).play();
