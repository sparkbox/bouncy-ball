const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

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
    var<private> pos : array<vec2f, 4> = array<vec2f, 4>(
      vec2f(-1, -1),
      vec2f(1, -1),
      vec2f(-1, 1),
      vec2f(1, 1),
    );

    struct Uniforms {
      time: f32,
      h: f32,
      k: f32,
      a: f32,
      canvasSize: vec2f,
    }
    @group(0) @binding(0) var<uniform> u: Uniforms;

    struct VertexOut {
      @builtin(position) pos: vec4f,
      @location(0) center: vec2f,
      @location(1) worldPos: vec2f,
    }

    @vertex
    fn vertexMain(@builtin(vertex_index) i: u32) -> VertexOut {
      let ypos = (u.a * pow((((u.time + u.h) % (u.h * 2.0)) - u.h), 2.0) + u.k) - u.k/2.0;

      let circleSize = vec2f(100) / u.canvasSize;

      var out: VertexOut;
      out.center = vec2f(0, ypos);
      out.worldPos = (pos[i] * circleSize) + out.center;
      out.pos = vec4f(out.worldPos, 0, 1);
      return out;
    }

    @fragment
    fn fragmentMain(in: VertexOut) -> @location(0) vec4f {
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

const uniformBuffer = device.createBuffer({
  size: 8 * Float32Array.BYTES_PER_ELEMENT,
  usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
});

const uniformArray = new Float32Array(8);

// Calculating variables for animation.
const h = 575;
const k = 2 - (2*(50/canvas.clientHeight));
const a = -4 * k / Math.pow(h * 2, 2);

uniformArray[0] = 0; // time
uniformArray[1] = h;
uniformArray[2] = k;
uniformArray[3] = a;
uniformArray[4] = canvas.clientWidth;
uniformArray[5] = canvas.clientHeight;

const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [{
    binding: 0,
    resource: { buffer: uniformBuffer }
  }]
});

let start, time;
(function drawFrame(timestamp) {
  if (!start) { start = timestamp };
  time = timestamp - start;

  // Update the variables for the animation on the GPU
  uniformArray[0] = time;
  device.queue.writeBuffer(uniformBuffer, 0, uniformArray);

  const encoder = device.createCommandEncoder();
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      loadOp: 'clear',
      clearValue: [0, 0, 0, 0],
      storeOp: 'store',
    }]
  });

  renderPass.setPipeline(pipeline);
  renderPass.setBindGroup(0, bindGroup);
  renderPass.draw(4);

  renderPass.end();

  device.queue.submit([ encoder.finish() ]);

  window.requestAnimationFrame(drawFrame);
})(performance.now());
