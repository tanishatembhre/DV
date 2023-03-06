const data_path = "./data/final_dataset_v1.csv"
var original_data;
var countries = new Set();
var countries_events = new Map();
var categories = new Set();
var x_f;
var y_f;
var xAxis_f;
var yAxis_f;
var svg_f;
document.addEventListener('DOMContentLoaded', async function () {
    await d3.csv(data_path).then(function(data) {
        original_data = data;
    });
    
    original_data.forEach(element => {
        countries.add(element.location);
        categories.add(element.classification);
    });

    countries.forEach(element => {
        countries_events.set(element, new Map());
        var temp = countries_events.get(element);
        categories.forEach(c => temp.set(c, 0));
        countries_events.set(element, temp); 
    });

    original_data.forEach(element => {
        var temp1 = countries_events.get(element.location);
        temp1.set(element.classification, (temp1.get(element.classification)+1));
        countries_events.set(element.location, temp1);
    });

    var select = document.getElementById("country_f")

    countries.forEach(value => {
        var option = document.createElement("option")
        option.value = value
        option.innerHTML = value
        select.appendChild(option)
    });

    // drawBarGraph();
    svg_f = d3.select("#panelF_svg")
        .append("g")
        .attr("transform", "translate(" + 80 + "," + 40 + ")")

    width_f = 360
    height_f = 300
    var margin = {top: 20, right: 20, bottom: 30, left: 60}
    width_f = width_f - margin.left - margin.right;
    height_f = height_f - margin.top - margin.bottom;

    x_f = d3.scaleBand()
        .range([0, width_f])
        .padding(0.2);
    xAxis_f = svg_f.append("g")
        .attr("transform", "translate(10," + (height_f) + ")")

    y_f = d3.scaleLinear()
        .range([height_f, 0]);
    yAxis_f = svg_f.append("g")
        .attr("transform", "translate(10,0)")

    drawBarGraph();
})

function drawBarGraph(){

    var ind = d3.select("#country_f").node().selectedIndex;
    var val = d3.select("#country_f").node()[ind].text;
    var values = countries_events.get(val);

    data_points = [];
    max_height = 0;

    categories.forEach(cat => {
        var temp = []
        temp.push(cat);
        temp.push(values.get(cat));
        data_points.push(temp);
        max_height = Math.max(max_height, values.get(cat));
    });

    x_f.domain(Array.from(categories).map(function(d){
        d[0] = d[0].toUpperCase()
        var dd = d[0].toUpperCase() + d.substring(1, d.length)
        return dd;
    }));
    xAxis_f.transition().duration(500).call(d3.axisBottom(x_f));

    y_f.domain([0, max_height]);
    yAxis_f.transition().duration(500).call(d3.axisLeft(y_f));

    const u = svg_f.selectAll("rect")
        .data(data_points)

    u.enter()
        .append("rect")
        .merge(u)
        .transition()
        .duration(500)
        .attr("x", function(d) {
            var dd = d[0]
            var ddd = dd[0].toUpperCase() + dd.substring(1, dd.length);
            return x_f(ddd)+20;
        })
        .attr("y", function(d) { return y_f(d[1]); })
        .attr("width", x_f.bandwidth()-20)
        .attr("height", function(d) {return height_f-y_f(d[1]);})
        .attr("fill", "#69b3a2");

    svg_f.append("text")
        .attr("class", "x_label_f")
        .attr("text-anchor", "end")
        .attr("x", width_f/2+30)
        .attr("y", height_f +40)
        .text("Category");

    svg_f.append("text")
        .attr("class", "x_label_f")
        .attr("text-anchor", "end")
        .attr("x", -100)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .text("Events count");
}