var $ball = $('ball'),
    DURATION = 575;

function dropBall() {
  // We animate 'top' because jquery can't animate tranforms (wihtout plugins):
  // See https://bugs.jquery.com/ticket/4171
  $ball.animate({ top: '160px' }, DURATION, 'easeInQuad', restoreBall);
}

function restoreBall() {
  // Easings ('easeInQuad' & 'easeOutQuad') provided by jQuery UI.
  // See https://jqueryui.com/easing/
  $ball.animate({ top: '0' }, DURATION, 'easeOutQuad', dropBall);
}

$(document).ready(function(){
  dropBall();
});
