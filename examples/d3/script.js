var width = window.innerWidth;
var height = window.innerHeight;

var svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

svg.append("rect")
	.attr("width", width)
	.attr("height", (height * 0.2))
	.attr("y", (height * 0.8))
	.attr("fill","white");

var ball = svg.append("g")
	.attr("transform","translate(" + (width * 0.5) + "," + (height * 0.5) + ")");

ball.append("circle")
	.attr("r", "50px")
	.attr("fill", "tomato");



function bounce() {
	ball.transition()
		.duration(1500)
		.ease("cubic-in")
		.attr("transform","translate(" + (width * 0.5) + "," + (height * 0.8) + "), scale(1.1,0.9)")
		.transition()
		.ease("cubic-out")
		.duration(1500)
		.attr("transform","translate(" + (width * 0.5) + "," + (height * 0.2) + "), scale(0.9,1.1)")
		.each("end", bounce);
};

bounce();

