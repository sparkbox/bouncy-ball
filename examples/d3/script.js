var svg, ball;

svg = d3.select('body')
        .append('svg')
        .attr('width', 50)
        .attr('height', 210)
        .append('g')
        .attr('transform', 'translate(25,25)');

ball = svg.append('circle')
          .attr('r', 25)
          .attr('fill', '#FF7B39');

function bounce() {
  ball
    .transition()
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
