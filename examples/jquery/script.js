const DURATION = 575;
const $ball = $('ball');

function dropBall() {
  // We animate 'top' because jquery can't
  // animate transforms (without plugins):
  // See https://bugs.jquery.com/ticket/4171
  $ball.animate({ top: '160px' }, DURATION, 'easeInQuad', restoreBall);
}

function restoreBall() {
  $ball.animate({ top: '0' }, DURATION, 'easeOutQuad', dropBall);
}

$(document).ready(() => {
  dropBall();
});
