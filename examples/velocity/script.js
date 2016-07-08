var ball = document.getElementsByTagName('ball');

function bounce() {
  Velocity(ball, { translateY: '160px' }, {
    duration: 575,
    easing: 'easeInQuad'
  });
  Velocity(ball, 'reverse', {
    easing: 'easeOutQuad',
    complete: bounce
  });
}

bounce();
