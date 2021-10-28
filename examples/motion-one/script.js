const ball = document.getElementsByTagName("ball");

Motion.animate(
  ball,
  { y: [160, 0] },
  {
    duration: .575,
    repeat: Infinity,
    direction: "alternate-reverse",
    ease: "cubic-bezier(.6, 0.08, 0.8, .6)"
  },
);
