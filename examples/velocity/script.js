const ball = document.querySelector('ball');

ball.velocity({
  transform: [
    'translateY(150px)',
    'translateY(0px)',
    'translateY(150px)',
  ],
}, {
  duration: 575,
  easing: 'easeInQuad',
  loop: true,
});
