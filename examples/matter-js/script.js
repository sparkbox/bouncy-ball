var Engine = Matter.Engine,
    Render = Matter.Render,
    Bodies = Matter.Bodies,
    World = Matter.World;

var engine = Engine.create();
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: 66,
      height: 226,
      wireframes: false,
      background: '#111'
    }
});

// Use a many-sided polygon as a ball, to ensure 100% elasticity.
// See https://github.com/liabru/matter-js/issues/256
var ball = Bodies.polygon(33, 25, 30, 25, {
  restitution: 1,
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0,
  inertia: Infinity,
  render: { fillStyle: '#76F09B' }
});
var ground = Bodies.rectangle(33, 225, 66, 1, {
  isStatic: true,
  render: { fillStyle: '#111' }
});

World.add(engine.world, [ball, ground]);
Engine.run(engine);
Render.run(render);
