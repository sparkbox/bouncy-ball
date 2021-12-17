const ball = document.getElementsByTagName("ball");

Motion.animate(
  ball,
  { y: [0, 160] },
  {
    duration: .575,
    repeat: Infinity,
    direction: "alternate",
    easing: "cubic-bezier(.6, 0.08, 0.8, .6)"
  }
);
