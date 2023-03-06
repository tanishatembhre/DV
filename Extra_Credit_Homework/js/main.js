// Hint: This is a good place to declare your global variables
var data;
var svg;
var x_scale;
var y_scale;
var z_scale;
var circle_group;
var tooltip;
const margin = {top: 10, right: 20, bottom: 50, left: 50}
// const margin = {top: 30, right: 30, bottom: 60, left: 60    },
width = 1000 ,
height = 600 ;

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function

   

   // This will load your two CSV files and store them into two arrays.
   // Step 3: Data loaded in global variables and converted into correct format (data wrangling)
   Promise.all([d3.csv('./data/data.csv', (d) => {
    return {
        Country: d.country,
        Continent: d.continent,
        LifeExpectancy: d.lifeExp,
        Population: d.pop,
        GdpPercapita: d.gdpPercap
    };
})])
        .then(function (values) {
            data = values[0]
            // console.log('loaded data.csv');
            // console.log(data)
   
            drawBubbleChart();
            tooltip = d3.select("#my_dataviz")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
        });
});

function drawBubbleChart(){
    
    var continent = document.getElementById("continent").value;
    countries_arr = new Array()
    data.forEach(element => {
        if (element.Continent == continent) {
            countries_arr.push(element)
        }
    });
    console.log(countries_arr)
    

//Step 1: Creating svg with given width and height

width = 1000 - margin.left - margin.right,
height = 600 - margin.top - margin.bottom;  
console.log('hello')
svg = d3.select("#my_dataviz")
.append("svg")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
.append("g")
.attr("transform", `translate(${margin.left},${margin.top})`);

// Add X axis
x_scale = d3.scaleLinear()
.domain([0, 10000])
.range([ 0, width ]);
svg.append("g")
.attr("transform", `translate(0, ${height})`)
.call(d3.axisBottom(x_scale))
.call(g => g.append("text")
                    .attr("fill", "black")
                    .style("font", "16px times")
                    .attr("transform", "translate("+((width/2))+", "+(margin.bottom-8)+")")
                    .text("GDP per capita"));
// Add Y axis
 y_scale = d3.scaleLinear()
.domain([35, 90])
.range([ height, 0]);
svg.append("g")
.call(d3.axisLeft(y_scale))
.call(g => g.append("text")
                .attr("fill", "black")
                .style("font", "16px times")
                .attr("transform", "translate(-"+(margin.left-15)+", "+((height/2)-50)+") rotate(-90)")
                .text("Life Expectancy"));

// Add a scale for bubble size
 z_scale = d3.scaleLinear()
.domain([200000, 1310000000])
.range([ 1, 40]);

  // -2- Create 3 functions to show / update (when mouse move but stay on same circle) / hide the tooltip
  

// Add dots
circle_group = svg.append('g')
var inst = circle_group.selectAll("dot")
.data(countries_arr)
.join("circle")
.attr('class', "bubbles")
  .attr("cx", d => x_scale(d.GdpPercapita))
  .attr("cy", d => y_scale(d.LifeExpectancy))
  .attr("r", d => 0)
  .style("fill", "blue")
  .style("opacity", "0.7")
  .attr("stroke", "gray")
  inst.on("mouseover", showTooltip )
    .on("mousemove", moveTooltip )
    .on("mouseleave", hideTooltip )
  inst.transition()
        .duration(1000)
        .attr("r", function(d) { return z_scale(d.Population)*2; })
  
  console.log('tan2')

}
const showTooltip = function(event, d) {
    tooltip
      .transition()
      .duration(1000)
    tooltip
      .style("opacity", 1)
      .html( d.Country)
      .style("left", (event.x)+2 + "px")
      .style("top", (event.y)-15 + "px")
  }
  const moveTooltip = function(event, d) {
    tooltip
      .style("left", (event.x)+2 + "px")
      .style("top", (event.y)-15 + "px")
  }
  const hideTooltip = function(event, d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
}
function addCircles(){
    svg.selectAll("circle").remove()
    var continent = document.getElementById("continent").value;
    countries_arr = new Array()
    data.forEach(element => {
        if (element.Continent == continent) {
            countries_arr.push(element)
        }
    });
    var inst = circle_group.selectAll("dot")
        .data(countries_arr)
        .join("circle")
        .attr("class", "bubbles")
        .attr("cx", d => x_scale(d.GdpPercapita))
        .attr("cy", d => y_scale(d.LifeExpectancy))
        .attr("r", 0)
        .style("fill", "blue")
        .style("opacity", "0.7")
        .attr("stroke", "white")
    
    inst.on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )
    inst.transition()
        .duration(1000)
        .attr("r", function(d) { return z_scale(d.Population)*2 ; })
       
}

function updateBubbleChart(){
    svg.selectAll("circle")
      .transition()
      .duration(1000)
      .attr("r", function(d) { return 0; }).on('end', addCircles)
}