var svg = d3.select("body").append("svg")
      .attr("width", 500)
      .attr("height", 500)
      .append('g')
      .attr('transform', 'translate(30,76)');

    var ball = svg.append("circle")
      .attr('r', 25);

    bounce();

    function bounce() {
      ball
        .transition()
        .duration(475)
        .ease(d3.easeQuadIn)
        .attr('cy', 120)
        .transition()
        .duration(475)
        .ease(d3.easeQuadOut)
        .attr('cy', 0)
        .on('end', bounce);
    }