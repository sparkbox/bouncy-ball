const { anime } = window;

function bounce() {
  const bounceUp = anime({
    autoplay: false, // We don't want to immediately start the animation
    targets: 'ball', // target the <ball></ball>
    translateY: {
      value: ['160px', '0px'], // When bouncing up, start at 160px and end at 0px
      duration: 575,
      easing: 'easeOutQuad',
    },
    complete: bounce,
  });

  const bounceDown = anime({
    autoplay: false, // See similar comments above
    targets: 'ball',
    translateY: {
      value: ['0px', '160px'], // When bouncing down, start at 0px and end at 160px
      duration: 575,
      easing: 'easeInQuad',
    },
    complete() {
      bounceUp.play(); // After we bounce down, start the bounce up animation
    },
  });

  bounceDown.play();
}

bounce(); // Start the animation!
