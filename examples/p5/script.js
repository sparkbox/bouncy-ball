const h = 575; // x vertex, half of total bounce duration
const k = 160; // y vertex, total bounce height
const a = -4 * k / Math.pow(h * 2, 2); // coefficient: -.000483932
const ballColor = getComputedStyle(document.documentElement).getPropertyValue('--p5');
let ypos, start, time, timestamp;

function setup() {
  createCanvas(66, 226);
  fill(ballColor);
  noStroke();
}

function draw() {
  timestamp = millis();
  if (!start) { start = timestamp };
  time = timestamp - start;

  // Position as a function of time, using the vertex form
  // of the quadratic formula:  f(x) = a(x - h)^2 + k,
  // (where [h, k] is the vertex). See it graphically at:
  //    https://www.desmos.com/calculator/i6yunccp7v
  ypos = a * Math.pow(((time + h) % (h * 2) - h), 2) + k;

  clear();
  ellipse(33, 200 - ypos, 50, 50);
}
