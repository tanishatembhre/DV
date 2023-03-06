var original_data;
var data_events_location;
var unique_locations;
var formated_data;
var color = d3.interpolateSinebow;
var scale = d3.scaleLinear().range([0.5, 1.0])
// var scale = function(d){
    
// }


var colors= [
    "rgb(110, 64, 170)",
    "rgb(47, 150, 224)",
    "rgb(243, 161, 48)",
    "rgb(82, 246, 103)",
    "rgb(238, 67, 20)",
    "rgb(70, 90, 100)",
    "rgb(0, 0, 0)",
    "rgb(120, 33, 0)",
    "rgb(30, 87, 110)",
    "rgb(255, 120, 71)",
    "rgb(191, 60, 175)",
    "rgb(110, 0, 110)",
    "rgb(175, 240, 91)",
    "rgb(28, 190, 203)",
    "rgb(255, 102, 89)",
    "rgb(20, 109, 68)",
    "rgb(226, 183, 47)",
    "rgb(200, 40, 29)",
    "rgb(207, 204, 54)",
    "rgb(61, 130, 225)",
    "rgb(40, 234, 141)",
    "rgb(255, 140, 56)",
    "rgb(216, 63, 164)",
    "rgb(35, 171, 216)",
    "rgb(143, 244, 87)",
    "rgb(102, 77, 191)",
    "rgb(76, 110, 219)",
    "rgb(136, 62, 177)",
    "rgb(164, 61, 179)",
    "rgb(25, 208, 184)",
]
var m;
var n;
var width = 335,
    height = 360,
    padding = 1.5, // separation between same-color nodes
    clusterPadding = 6, // separation between different-color nodes
    maxRadius = 5;
var data;


document.addEventListener('DOMContentLoaded', async function () {
    await d3.csv("./data/final_dataset_v1.csv").then(function(data) {
        original_data = data;
    });

    data_events_location = d3.group(original_data, d => d.location);
    unique_locations = Array.from(data_events_location.keys());

    formated_data = {
        children: d3.map(Array.from(data_events_location.values()), d => {
            var i=1;
            d = d.sort(function(x, y){
                // console.log("sort", x, y)
                return d3.ascending(parseInt(x.tweets_count), parseInt(y.tweets_count));
            })
            var max_val_d = d3.max(d.map(f => parseInt(f.tweets_count)))
            var min_val_d = d3.min(d.map(f => parseInt(f.tweets_count)))
            var scale = d3.scaleLinear().domain([min_val_d, max_val_d]).range([0.5, 1.0])
            return {
                children: d3.map(d, dd => {
                    dd["group"] = unique_locations.indexOf(dd.location)
                    console.log("f", dd.location, dd.tweets_count, scale(parseInt(dd.tweets_count)))
                    return {
                        group: dd.group,
                        location: dd.location,
                        value: +dd.tweets_count,
                        color: color((+dd.group)/unique_locations.length),
                        // ord_val: scale(parseFloat(i++/d.length)),
                        ord_val: scale(parseInt(dd.tweets_count)),
                        event_id: dd.event_id
                    };
                })
            }
        })
    }

    console.log(formated_data);
    n = original_data.length
    m = unique_locations.length
    data = formated_data;

    drawBubbleGraph();
})

var d_bubbles_id = []
var d_bubbles_class = []
var d_bubbles_opacity = {}
var d_bubbles_cls_opacity = {}
function drawBubbleGraph() {
    var width = 345,
        height = 360;
    pack = () => d3.pack()
        .size([width, height])
        .padding(1)
        (d3.hierarchy(data)
            .sum(d => d.value))

    const nodes = pack().leaves();

    const simulation = d3.forceSimulation(nodes)
        .force("x", d3.forceX(width / 2).strength(0.01))
        .force("y", d3.forceY(height / 2).strength(0.01))
        .force("cluster", forceCluster())
        .force("collide", forceCollide());

    const svg = d3.select("#panelD_svg");

    var tooltip = d3.select("body")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        // .style("background-color", "black")
        // .style("border-radius", "3px")
        // .style("padding", "10px")
        // .style("position", "absolute")
        // .style("color", "white")

    var showTooltip = function(event, d) {
        // console.log(event.pageX, event.pageY)
        console.log(d.data.group)
        console.log(colors[d.data.group])
        tooltip
            .style("opacity", 1)
            .html("<p>Tweets: "+d.data.value+"<br/>Location: "+d.data.location+"</p>")
            // .style("width", "auto")
            // .style("height", "auto")
            .style("left", event.pageX+5 + "px")
            .style("top", event.pageY+5 + "px")
        
        var cls_name = "circle-"+d.data.location
        d3.select(this).style("stroke", "black").style("stroke-width", "2")
        
        // console.log(d3.select(this))
    }
    var moveTooltip = function(event, d) {
        tooltip
            .style("left", event.pageX+5 + "px")
            .style("top", event.pageY+5 + "px")
            // highlightLocation(d.data.location)
            highlightEventsForEventId(d.data.event_id)
            highlightKeyWords(d.data.event_id)
            highlightMapLocation(d.data.location)
            // draw_panel_e_event(d.data.event_id);
    }
    var hideTooltip = function(event, d) {

        tooltip
            .style("opacity", 0)
            .style("left", 0+"px")
            .style("top", 0+"px")
            d3.select(this).style("stroke", "none")
            restorepanelA()
            deHighlightKeyWords()
            unhighlightMapLocation()
            
    }

    const node = svg.append("g")
        .attr("transform", "translate(0,0)")
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("id", d=>{
            // var ord_ = parseInt(d.data.ord_val * 1000)
            var val = "circle-d-"+d.data.location.replace(" ","-")+"-"+d.data.group+"-"+d.data.event_id;
            d_bubbles_opacity[val] = d.data.ord_val;
            d_bubbles_id.push(val);
            return val;
        })
        .attr("class", d => {
            var cls = "circle-"+d.location+" circle-d-"+d.data.event_id;
            d_bubbles_class.push("circle-d-"+d.data.event_id) 
            d_bubbles_cls_opacity[d.data.event_id] = d.data.ord_val;
            return cls
        })
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d => colors[d.data.group])
        .style("opacity", d => d.data.ord_val)
        .on("mouseover", showTooltip )
        .on("mousemove", moveTooltip )
        .on("mouseleave", hideTooltip )
        .on("click", function(event, d){
            console.log(d);
            draw_panel_e_event(d.data.event_id);
        })
        .call(drag(simulation));

    node.transition()
        .delay((d, i) => Math.random() * 500)
        .duration(750)
        .attrTween("r", d => {
            const i = d3.interpolate(0, 9);
            return t => d.r = i(t);
        });

    simulation.on("tick", () => {
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    });


}

function centroid(nodes) {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const d of nodes) {
        let k = d.r ** 2;
        x += d.x * k;
        y += d.y * k;
        z += k;
    }
    return {x: x / z, y: y / z};
}

drag = simulation => {

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
}

function forceCollide() {
    const alpha = 0.4; // fixed for greater rigidity!
    const padding1 = 2; // separation between same-color nodes
    const padding2 = 6; // separation between different-color nodes
    let nodes;
    let maxRadius = 10;

    function force() {
        const quadtree = d3.quadtree(nodes, d => d.x, d => d.y);
        for (const d of nodes) {
            const r = d.r + maxRadius;
            const nx1 = d.x - r, ny1 = d.y - r;
            const nx2 = d.x + r, ny2 = d.y + r;
            quadtree.visit((q, x1, y1, x2, y2) => {
                if (!q.length) do {
                    if (q.data !== d) {
                        const r = d.r + q.data.r + (d.data.group === q.data.data.group ? padding1 : padding2);
                        let x = d.x - q.data.x, y = d.y - q.data.y, l = Math.hypot(x, y);
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l, d.y -= y *= l;
                            q.data.x += x, q.data.y +=y ;
                        }
                    }
                } while (q = q.next);
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            });
        }
    }

    force.initialize = _ => maxRadius = d3.max(nodes = _, d => d.r) + Math.max(padding1, padding2);

    return force;
}

function forceCluster() {
    const strength = 0.2;
    let nodes;

    function force(alpha) {
        const centroids = d3.rollup(nodes, centroid, d => d.data.group);
        const l = alpha * strength;
        for (const d of nodes) {
            const {x: cx, y: cy} = centroids.get(d.data.group);
            d.vx -= (d.x - cx) * l;
            d.vy -= (d.y - cy) * l;
        }
    }

    force.initialize = _ => nodes = _;

    return force;
}

function highlight_location_d(location){
    d_bubbles_id.forEach(d => {
        if(!d.includes(location.replace(" ", "-"))){
            console.log("not there", d)
            d3.select("#"+d).style("opacity", 0.05);
        }
    })
}

function de_highlight_location_d(){
    d_bubbles_id.forEach(d => {
        // var vals = d.split("-");
        d3.select("#"+d).style("opacity", d_bubbles_opacity[d])
    })
}

function highlight_event_d(event_id){
    d_bubbles_class.forEach(d => {
        vals = d.split("-")
        // console.log(vals)
        if(parseInt(vals[vals.length-1])!=event_id){
            console.log(d, event_id)
            d3.select("."+d).style("opacity", 0.05);
        }
    })
}

function de_highlight_event_d(){
    console.log(d_bubbles_cls_opacity)
    d_bubbles_class.forEach(d => {
        var dd = d.split("-")
        d3.select("."+d).style("opacity", d_bubbles_cls_opacity[dd[dd.length-1]])
    })
}