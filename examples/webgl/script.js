var canvas = document.getElementById('canvas');
var gl = canvas.getContext('webgl');
gl.viewport(0, 0, canvas.clientWidth, canvas.clientHeight);

// Setting up vertex shader. It is used to compute position of the circle.
var vertex = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertex, `
  uniform float time;
  uniform float a;
  uniform float k;
  uniform float h;

  void main (void) {
    float ypos = (a * pow((mod(time + h, h * 2.0) - h), 2.0) + k) - k/2.0;
    gl_Position = vec4(0.0, ypos, 0.0, 1.0);
    gl_PointSize = 50.0;
  }
`);
gl.compileShader(vertex);

// Setting up the fragment shader. This is used to color the individual pixels of the circle.
var fragment = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragment, `
  precision mediump float;

  void main (void) {
    float d = distance(gl_PointCoord, vec2(0.5, 0.5));
    if (d > 0.5) {
      gl_FragColor = vec4(0, 0, 0, 0.0); // Color for points outside the circle.
    } else {
      gl_FragColor = vec4(0.2 + d, 0.2 + d, 0.2 + d, 1.0); // Color for points within circle.
    }
  }
`);
gl.compileShader(fragment);

// Linking shaders to the program.
var program = gl.createProgram();
gl.attachShader(program, vertex);
gl.attachShader(program, fragment);
gl.linkProgram(program);
gl.useProgram(program);

// Calculating variables for animation and sending them to the program.
var h = 575;
var k = 2 - (2*(50/canvas.clientHeight));
var a = -4 * k / Math.pow(h * 2, 2);
gl.uniform1f(gl.getUniformLocation(program, "h"), h);
gl.uniform1f(gl.getUniformLocation(program, "k"), k);
gl.uniform1f(gl.getUniformLocation(program, "a"), a);

var start, time;
(function drawPosition(timestamp) {
  if (!start) { start = timestamp };
  time = timestamp - start;

  gl.uniform1f(gl.getUniformLocation(program, "time"), time); // Send "time" to the program.
  gl.drawArrays(gl.POINTS, 0, 1);

  window.requestAnimationFrame(drawPosition);
})(performance.now());
