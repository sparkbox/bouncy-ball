var ball = document.querySelector('ball');
var h = 575; // x vertex, half of total bounce duration
var k = 160; // y vertex, total bounce height
var a = -4 * k / Math.pow(h * 2, 2); // coefficient: -.000483932
var ypos, start, time;

(function drawPosition(timestamp) {
  if (!start) { start = timestamp };
  time = timestamp - start;

  // Position as a function of time, using the vertex form
  // of the quadratic formula:  f(x) = a(x - h)^2 + k,
  // (where [h, k] is the vertex). See it graphically at:
  //    https://www.desmos.com/calculator/i6yunccp7v
  ypos = a * Math.pow(((time + h) % (h * 2) - h), 2) + k;

  ball.style.transform = 'translateY(' + -ypos + 'px)';
  window.requestAnimationFrame(drawPosition);
})(performance.now());
