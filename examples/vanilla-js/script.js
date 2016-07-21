(function() {
  var initialPosition = 160,               // px
      initialVelocity = 0,                 // px/second
      initialTime = (Date.now() / 1000),   // seconds
      acceleration = -1000,                // px/second^2

      // this is either the initial height or the ground height
      referencePosition = initialPosition,

      // this is either the initial velocity or rebound velocity
      referenceVelocity = initialVelocity,

      // this is either the initial time or time at the ground
      referenceTime = initialTime,
      reboundVelocity,
      elapsedTime,

      ballEl = document.getElementsByTagName('ball')[0],
      ball = {
        position: initialPosition
      };

  function update() {
    elapsedTime = (Date.now() / 1000) - referenceTime; // seconds

    // Kinematic Equation 1
    //   d = Vi*t + (1/2)a*t^2
    distance = referenceVelocity * elapsedTime +
               0.5 * acceleration * Math.pow(elapsedTime, 2);
    ball.position = referencePosition + distance;

    if (ball.position < 0 ) {
      // This animation doesn't account for bounce decay
      // so we can save processing by only calculating
      // the return velocity on the first bounce.
      if (!reboundVelocity) {

        // Kinematic Equation 2
        //   Vf = Vi + a*t
        reboundVelocity = initialVelocity + acceleration * elapsedTime;

        // reverse ball direction with 100% velocity preserved.
        referenceVelocity = -reboundVelocity;
      }

      // Reset initial states.
      ball.position = 0;
      referencePosition = 0; // Our new initial position.
      referenceTime = Date.now() / 1000; // Our new initial time.
    }

    // Draw the ball.
    translatedPos = initialPosition - ball.position;
    ballEl.style.transform = 'translate3d(0px,' + translatedPos + 'px, 0px)';
    window.requestAnimationFrame(update);
  }

  update();
})();
