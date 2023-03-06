// Hint: This is a good place to declare your global variables
var female_data;
var male_data;
var svg;
var x_scale;
var y_scale;
var y_axis;
const margin = {top: 30, right: 30, bottom: 60, left: 60    },
width = 1000 ,
height = 600 ;
var currentCountry;

// This function is called once the HTML page is fully loaded by the browser
document.addEventListener('DOMContentLoaded', function () {
   // Hint: create or set your svg element inside this function

   //Step 1: Creating svg with given width and height
    svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

   // This will load your two CSV files and store them into two arrays.
   // Step 3: Data loaded in global variables and converted into correct format (data wrangling)
   Promise.all([d3.csv('./data/females_data.csv', (d) => {
    return {
        Year:  new Date (d.Year+"-01-01"),
        Argentina: parseFloat(d.Argentina),
        India: parseFloat(d.India),
        France: parseFloat(d.France),
        China: parseFloat(d.China),
        Germany: parseFloat(d.Germany),
    };
}),d3.csv('./data/males_data.csv', (d) => {
    return {
        Year:  new Date(d.Year+"-01-01"),
        Argentina: parseFloat(d.Argentina),
        India: parseFloat(d.India),
        France: parseFloat(d.France),
        China: parseFloat(d.China),
        Germany: parseFloat(d.Germany),
    };

})])
        .then(function (values) {
            console.log('loaded females_data.csv and males_data.csv');
            female_data = values[0];
            male_data = values[1];
   
            drawLolliPopChart();
        });
});

//Extra credit work - adding transition when chart changes for one country to another
function updatePopChart(country, y_scale){
    svg.selectAll("circle")
      .transition()
      .duration(2000)
      .attr("cy", function(d) { return y_scale(d[country]); })
    svg.selectAll("line")
      .transition()
      .duration(2000)
      .attr("y2", function(d) { return y_scale(d[country]); })
}
// Use this function to draw the lollipop chart.
//Step 7: Function called (chart changes) whenever user selects a new country from the select dropdown menu
function drawLolliPopChart() {
    prevCountry = currentCountry;
    var country = document.getElementById("country").value;
    
    //Code to draw lollipop chart for the first time
    if(!prevCountry){
        currentCountry = country;

        //Step 4: Adding y-axis (employment rates)
        //Create scale
        y_scale = d3.scaleLinear()
            .domain([0, Math.max(d3.max(female_data, d => d[country]), d3.max(male_data, d => d[country]))])
            .range([height-margin.bottom, margin.top]);

        y_axis = svg.append("g")
            .attr("transform", "translate("+margin.left+", 0)")
            .call(d3.axisLeft().scale(y_scale))
            .call(g => g.append("text")
                .attr("fill", "black")
                .style("font", "16px times")
                .attr("transform", "translate(-"+(margin.left-20)+", "+((height/2)-50)+") rotate(-90)")
                .text("Employment Rate"));

        //Step 4: Adding x-axis (years)
        // Create scale
        x_scale = d3.scaleTime()
            .domain([new Date("1990-01-01"), new Date("2023-01-01")])
            .range([margin.left, width-margin.right]);

        //Append group and insert axis
        x_axis = svg.append("g")
            .attr("transform", "translate(0,"+(height-margin.bottom)+")")
            .call(d3.axisBottom().scale(x_scale))
            .call(g => g.append("text")
                    .attr("fill", "black")
                    .style("font", "16px times")
                    .attr("transform", "translate("+((width/2))+", "+(margin.bottom-25)+")")
                    .text("Year"));

        //Step 5: Create lines and circles for lollipop chart
        //Female chart - Lines
        svg.selectAll("linefemale")
            .data(female_data)
            .enter()
            .append("line")
            .attr("x1", function(d) { return x_scale(d.Year)+5; })
            .attr("x2", function(d) { return x_scale(d.Year)+5; })
            .attr("y1", function(d) { return y_scale(0); })
            .attr("y2", function(d) { return y_scale(0)})
            .attr("stroke", "#D417a5");

        //Female chart - Circles
        svg.selectAll("circlefemale")
            .data(female_data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x_scale(d.Year)+5; })
            .attr("cy", function(d) { return y_scale(0); })
            .attr("r", "4")
            .style("fill", "#D417a5");

        //Male chart - Lines
        svg.selectAll("linemale")
            .data(male_data)
            .enter()
            .append("line")
            .attr("x1", function(d) { return x_scale(d.Year)-5; })
            .attr("x2", function(d) { return x_scale(d.Year)-5; })
            .attr("y1", function(d) { return y_scale(0); })
            .attr("y2", function(d) { return y_scale(0)})
            .attr("stroke", "#3dc1b6");

        //Male chart - Circles
        svg.selectAll("circlemale")
            .data(male_data)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return x_scale(d.Year)-5; })
            .attr("cy", function(d) { return y_scale(0); })
            .attr("r", "4")
            .style("fill", "#3dc1b6");

        //Step 6: Adding legends (text for x and y axis added in Step 4 above)
        svg.append("rect").attr("x",750).attr("y",10).attr('width', 12).attr('height', 12).style("fill", "#D417a5")
        svg.append("rect").attr("x",750).attr("y",30).attr('width', 12).attr('height', 12).style("fill", "#3dc1b6")
        svg.append("text").attr("x", 770).attr("y",21).text("Female Employment Rate").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", 770).attr("y",41).text("Male Employment Rate").style("font-size", "15px").attr("alignment-baseline","middle")

        updatePopChart(country, y_scale);

    }else{
        //Code to rescale y axis according to selected country
        y_scale = d3.scaleLinear()
                .domain([0, Math.max(d3.max(female_data, d => d[country]), d3.max(male_data, d => d[country]))])
                .range([height-margin.bottom, margin.top]);
        
        //Adding transition to y-axis
        y_axis .transition().duration(2000).call(d3.axisLeft().scale(y_scale));

        updatePopChart(country, y_scale);
    }
}

