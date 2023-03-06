var movies_data;
var margin = {top: 10, right: 20, bottom: 190, left: 60},
    width = 614 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

document.addEventListener('DOMContentLoaded', function () {

    
    Promise.all([d3.csv('./data/movies_extract.csv', (d) => {
        return {
			movie: d.movie,
			budget: parseFloat(d.budget)/1e6,
			revenue: parseFloat(d.revenue)/1e6,
			revenueCostRatio: parseFloat(d.revenue)/parseFloat(d.budget)
		}
    })]).then(function (values) {
		movies_data = values[0]
		drawCharts()
	})
	
})

function drawBarGraph(svg, X, Y, plan, ylabel){
	var xlabels = []
	movies_data.forEach(d=> { 
		console.log(d); 
		xlabels.push(d[X]);
	})
	var x = d3.scaleBand()
	  .range([ 0, width ])
	  .domain(xlabels)
	  .padding(0.2);
	var ylabels = []
	movies_data.forEach(d=> { 
		ylabels.push(d[Y]);
	})
	var ymax = Math.max(...ylabels)
	var y = d3.scaleLinear()
	  .domain([0, Math.max(...ylabels)])
	  .range([ height, 0]);
	
	var xAxis = svg.append("g")
	  .attr("transform", "translate(0," + height + ")")
	  .call(d3.axisBottom(x))
	  
	xAxis.selectAll("text")
	    .attr("transform", "translate(-10,0)rotate(-45)")
	    .style("text-anchor", "end")
	xAxis.call(g => g.append("text")
		.attr("fill", "black")
		.style("font", "16px times")
		.attr("transform", "translate("+((width/2))+", "+(margin.bottom-10)+")")
		.text("Movies"));
  
  
	svg.append("g")
	  .call(d3.axisLeft(y))
	  .call(g => g.append("text")
                .attr("fill", "black")
                .style("font", "16px times")
                .attr("transform", "translate(-"+(margin.left-20)+", "+((height/2)-50)+") rotate(-90)")
                .text(ylabel));
	
	svg.selectAll("."+plan)
      .data(movies_data)
    .enter().append("rect")
      .attr("class", plan)
	  .attr("fill", function(d) {if(d[Y]==ymax) {return "#a41e3b"} else {return "#dcc76d"}})
      .attr("x", function(d) { return x(d[X]); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d[Y]); })
      .attr("height", function(d) { return height - y(d[Y]); });
	
	

}
function drawCharts(){
	var planASVG = d3.select("#planASvg")
    	.attr("width", width + margin.left + margin.right)
   		.attr("height", height + margin.top + margin.bottom)
  		.append("g")
   			 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	var planBSVG = d3.select("#planBSvg")
    	.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
			.attr("transform","translate(" + margin.left + "," + margin.top + ")");

	drawBarGraph(planASVG, "movie", "revenue", "planA", "Revenue (in millions)")
	drawBarGraph(planBSVG, "movie", "revenueCostRatio", "planB", "Revenue to cost ratio")

}