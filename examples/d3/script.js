const ballColor = getComputedStyle(document.documentElement).getPropertyValue('--d3');
const svg = d3.select('body')
  .append('svg')
  .attr('width', 50)
  .attr('height', 210)
  .append('g')
  .attr('transform', 'translate(25,25)');

const ball = svg.append('circle')
  .attr('r', 25)
  .attr('fill', ballColor);

function bounce() {
  ball.transition()
    .duration(575)
    .ease(d3.easeQuadOut)
    .attr('cy', 0)
    .transition()
    .duration(575)
    .ease(d3.easeQuadIn)
    .attr('cy', 160)
    .on('end', bounce);
}

bounce();
