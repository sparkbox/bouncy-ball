const ballColor = getComputedStyle(document.documentElement).getPropertyValue('--matterjs');
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  World = Matter.World;

const engine = Engine.create();
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: 66,
    height: 226,
    wireframes: false,
    background: '#111'
  }
});
const runner = Runner.create({
  isFixed: true,
  delta: 1000 / 120,
});

// Use a many-sided polygon as a ball, to ensure 100% elasticity.
// See https://github.com/liabru/matter-js/issues/256
const ball = Bodies.polygon(33, 25, 30, 25, {
  restitution: 1,
  friction: 0,
  frictionAir: 0,
  frictionStatic: 0,
  inertia: Infinity,
  render: { fillStyle: ballColor }
});
const ground = Bodies.rectangle(33, 225, 66, 1, {
  isStatic: true,
  render: { fillStyle: '#111' }
});

World.add(engine.world, [ball, ground]);
Runner.run(runner, engine);
Render.run(render);
