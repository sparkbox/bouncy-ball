const h = 575; // x vertex, half of total bounce duration
const k = 160; // total bounce height
const a = 4 * k / Math.pow(h * 2, 2); // coefficient: 0.000483932
const ballColor = getComputedStyle(document.documentElement).getPropertyValue('--canvas');
let ypos, start, time, timestamp;

// Canvas setup
const canvasEl = document.querySelector('canvas');
const offset = canvasEl.width / 2;
const ctx = canvasEl.getContext('2d');
ctx.fillStyle = ballColor;

// Animation Loop
(function drawPosition(timestamp) {
  if (!start) { start = timestamp };
  time = timestamp - start;

  // Position as a function of time, using the vertex form
  // of the quadratic formula:  f(x) = a(x - h)^2 + k,
  // (where [h, k] is the vertex). See it graphically at:
  //    https://www.desmos.com/calculator/8qdvfgxw6v
  ypos = a * Math.pow(((time + h) % (h * 2) - h), 2) + offset;

  // Draw the ball (includes clearing the previous frame)
  ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.beginPath();
  ctx.ellipse(offset, ypos, 25, 25, 0, 0, 2 * Math.PI);
  ctx.fill();

  window.requestAnimationFrame(drawPosition);
})(performance.now());
