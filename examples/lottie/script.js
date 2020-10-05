// You can see the data that was exported from After Effects at
// https://sparkbox.github.io/bouncy-ball/examples/lottie/data.json
lottie.loadAnimation({
  container: document.querySelector('ball'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: 'data.json'
});
