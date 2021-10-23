const motion = window.Motion;
const ball = document.getElementsByTagName("ball");

motion.animate(
  ball, 
  { y: [160, 0] },
  {
    duration: .575,
    repeat: Infinity,
    direction: "alternate-reverse",
    ease: "ease-in"
  },
);
