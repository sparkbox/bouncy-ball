// Requests a WebGPU adapter and create a device from it.
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

// Get a WebGPU context from the canvas and configure it for use with the device.
const canvas = document.getElementById('canvas');
const context = canvas.getContext('webgpu');
context.configure({
  device,
  format: navigator.gpu.getPreferredCanvasFormat(),
  alphaMode: 'premultiplied',
});

// Set up the vertex and fragment shaders.
const module = device.createShaderModule({
  code: `
    // Define the four corners of the square being rendered
    var<private> pos : array<vec2f, 4> = array<vec2f, 4>(
      vec2f(-1, -1),
      vec2f(1, -1),
      vec2f(-1, 1),
      vec2f(1, 1),
    );

    // Define the uniform values that will be read from the uniformBuffer
    struct Uniforms {
      time: f32,
      h: f32,
      k: f32,
      a: f32,
      canvasSize: vec2f,
    }
    @group(0) @binding(0) var<uniform> u: Uniforms;

    // Define the vertex shader outputs/fragment shader inputs
    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) center: vec2f,
      @location(1) worldPos: vec2f,
    }

    @vertex
    fn vertexMain(@builtin(vertex_index) i: u32) -> VertexOut {
      // Calculate the y position of the ball center
      let ypos = (u.a * pow((((u.time + u.h) % (u.h * 2.0)) - u.h), 2.0) + u.k) - u.k/2.0;

      var out: VertexOut;

      // Scale the ball size appropriately for the canvas
      let circleSize = vec2f(100) / u.canvasSize;
      out.center = vec2f(0, ypos);
      out.worldPos = (pos[i] * circleSize) + out.center;

      // Set the vertex positions in Normalized Device Coordinates
      out.pos = vec4f(out.worldPos, 0, 1);
      return out;
    }

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
      // Compute the distance from the center of the circle in pixels.
      let circleSize = vec2f(100) / u.canvasSize;
      let diff = (in.worldPos - in.center) / circleSize;
      let d = distance(diff, vec2f(0));

      if (d > 0.5) {
        discard; // Don't write to any pixels outside the circle.
      }

      return vec4f(d, d, 0.2 + d, 1); // Color for pixels within circle.
    }
  `
});

// Create a render pipeline that uses the above shader.
const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: {
    module,
    entryPoint: 'vertexMain',
  },
  primitive: {
    topology: 'triangle-strip',
  },
  fragment: {
    module,
    entryPoint: 'fragmentMain',
    targets: [{ format: navigator.gpu.getPreferredCanvasFormat() }]
  }
});

// Create a buffer for the shader uniforms.
const uniformBuffer = device.createBuffer({
  size: 8 * Float32Array.BYTES_PER_ELEMENT,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

// Calculating variables for animation.
const h = 575;
const k = 2 - (2*(50/canvas.clientHeight));
const a = -4 * k / Math.pow(h * 2, 2);

// Prepare the animation variables to be copied to the uniformBuffer.
const uniformArray = new Float32Array(8);
uniformArray[0] = 0; // time
uniformArray[1] = h;
uniformArray[2] = k;
uniformArray[3] = a;
uniformArray[4] = canvas.clientWidth;
uniformArray[5] = canvas.clientHeight;

// Create a bind group with the uniformBuffer.
const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: { buffer: uniformBuffer }
  }]
});

// The main frame loop.
let start, time;
(function drawFrame(timestamp) {
  if (!start) { start = timestamp };
  time = timestamp - start;

  // Update the variables for the animation on the GPU
  uniformArray[0] = time;
  device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

  // Begin a command encoder and start a render pass
  const encoder = device.createCommandEncoder();
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      clearValue: [0, 0, 0, 0],
      storeOp: 'store',
    }]
  });

  // Draw 4 vertices with the pipeline and bind group created above
  renderPass.setPipeline(pipeline);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.draw(4);

  // End the render pass and submit the commands.
  renderPass.end();
  device.queue.submit([ encoder.finish() ]);

  // Queue up the next animation frame.
  window.requestAnimationFrame(drawFrame);
})(performance.now());
