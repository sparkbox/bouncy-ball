var bounceUp = anime({
  autoplay: false,    //We don't want to immediately start the animation
  targets:  '#ball',  //target the div '#ball'
  translateY: {
    value:    ['160px', '0px'], //When bouncing up, start at 160px and end at 0px
    duration: 575,
    easing:   'easeOutQuad',
  },
  direction: 'normal',
  loop:      false,
  complete:  function(){ bounceDown.play() }, //Function encapsulation is necessary, otherwise we run into not defined error
});

var bounceDown = anime({
  autoplay: false,    //See similar comments above
  targets:  '#ball',
  translateY: {
    value:    ['0px', '160px'], //When bouncing down, start at 0px and end at 160px
    duration: 575,
    easing:   'easeInQuad',
  },
  direction: 'normal',
  loop:      false,
  complete:  function(){ bounceUp.play() }, //After we bounce down, start the bounce up animation
});

bounceDown.play(); //Start the animation!