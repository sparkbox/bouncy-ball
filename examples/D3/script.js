var svg = d3.select("body").append("svg")
      .attr("width", 1000)
      .attr("height", 500)
      .append('g')
      .attr('transform', 'translate(600,76)');

    var ball = svg.append("circle")
      .attr('r', 50);

    bounce();

    function bounce() {
      ball
        .transition()
        .duration(675)
        .ease(d3.easeQuadIn)
        .attr('cy', 300)
        .transition()
        .duration(675)
        .ease(d3.easeQuadOut)
        .attr('cy', 0)
        .on('end', bounce);
    }