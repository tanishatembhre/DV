var panelA_data;
var dates = []
var event_date_dict ={}
var event_location_dict = {};
var height;
var width;
var margin = {top: 10, right: 0, bottom: 0, left: 10}
var Ag_end_y = 10;
var Ag_top_y = 10;
var Ag_row_height = 25;
var color;
var solid_hop_color;
var Ag;
var dim_strength = 0.1
var common_keywords = [];
var keyword_map = {};
var event_keywords_list = [];
var common_keyword_map = {};
var keyword2eventId = {}
var tooltip_solid_line ;
var tooltip_dotted_line;
document.addEventListener('DOMContentLoaded', function () {

    Promise.all([d3.csv('./data/final_dataset_v1.csv', (d) => {
        console.log(d);
        var [ month, day, year] = d.date.split('-');
        // console.log(day, month, year)
        var date = new Date(+year, +month - 1, +day);
        data = {
            date: date,
            location: d.location,
            evendId: parseInt(d.event_id),
            emotion: d.event_sentiment,
            common: d.Common_keywords_id
        }         
        return data;
    }), d3.csv('data/common_keyword_events.csv'),
    d3.csv('./data/final_keywords_list.csv', (d) => {
        data = {
            event_id : parseInt(d.event_id),
            keyword : d.keyword
        }
        return data;
        })]).then(function (values) {
        panelA_data = values[0]
        console.log(panelA_data);
        panelA_data.forEach(element => { dates.push(element.date)})
        event_keywords_list = values[0]
        common_keywords = values[1]
        values[2].forEach(d=>keyword2eventId[d.keyword]=[])
        values[2].forEach(d=>keyword2eventId[d.keyword].push(d.event_id))

         panelA_data.forEach(element => {
            console.log(element)
            if(element.common != null && element.common.length != 0){
                if (element.common in keyword_map) {
                //add location in the dictionary
                keyword_map[element.common].push({events:element.evendId, location: element.location})
                }
                else {
                 keyword_map[element.common] = [{events:element.evendId, location: element.location}];
                }   
            }
            
        });

        console.log(keyword_map)

        //create common keywords map
        for(var i=0; i<common_keywords.length; i++){
            common_id = common_keywords[i]["common_keywords_id"];
            console.log(common_id)
            console.log(common_keywords[i]["common_keywords"].substring(2, common_keywords[i]["common_keywords"].length-2))
            common_keyword_map[common_id] = [common_keywords[i]["common_keywords"].substring(2, common_keywords[i]["common_keywords"].length-2)];
            
        }

        console.log(common_keyword_map)
        dates = dates.sort((a, b) => a - b);

        // Remove duplicate years
        dates = dates
            .map(function (date) { return date.getTime() })
            .filter(function (date, i, array) {
                return array.indexOf(date) === i;
            })
            .map(function (time) { return new Date(time); });

        // Creating dictionary where key is year and value is list of eventIds
        panelA_data.forEach(element => {
            console.log(element)
            if (element.date in event_date_dict) {
                //add location in the dictionary
                event_date_dict[element.date].push({events:element.evendId, emotion:element.emotion, location: element.location, common: element.common})
            }
            else {
                event_date_dict[element.date] = [{events:element.evendId, emotion:element.emotion, location: element.location, common: element.common}]
            }


            if(element.location in event_location_dict){
                event_location_dict[element.location].push({events:element.evendId, emotion:element.emotion})
            }else{
                event_location_dict[element.location] = [{events:element.evendId, emotion:element.emotion}]
            }
            
        });
        color = d3.scaleOrdinal().domain(['Positive', 'Neutral', 'Negative']).range(["#2d8534", "#fab802", "#96341c"])
        solid_hop_color = d3.scaleOrdinal().domain(['1-5', '6-10', '>10']).range(d3.schemeCategory10)
        // console.log(event_location_dict)

        // Sending list of sorted unique dates and date vs event dictionary to draw panel A
        drawPanelA(dates, event_date_dict, event_location_dict);
        addLegend()
    }); 
 });

function makeAbsoluteContext(element, svgDocument) {
  return function(x,y) {
    var offset = svgDocument.getBoundingClientRect();
    var matrix = element.getScreenCTM();
    return {
      x: (matrix.a * x) + (matrix.c * y) + matrix.e - offset.left,
      y: (matrix.b * x) + (matrix.d * y) + matrix.f - offset.top
    };
  };
}

function drawPanelA(dates, event_date_dict, event_location_dict){
    height = document.getElementById("panelA_graph").clientHeight-margin.top-margin.bottom;
    width = document.getElementById("panelA_graph").clientWidth-margin.left -margin.right;
    var panelAgroup = d3.select("#panelA_svg")
                        .attr("width", width+margin.left+margin.right)
                        .attr("height", height+margin.top+margin.bottom)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

    
    var rect_group = panelAgroup.append("g").attr("id", "rect_group").attr("transform", `translate(${margin.left},0)`);
    var line_group = panelAgroup.append("g").attr("id","line_group") .attr("transform", `translate(-${margin.left},-${margin.top})`);
    var dotted_line_group = panelAgroup.append("g").attr("id","dotted_line_group") .attr("transform", `translate(-${margin.left},-${margin.top})`);
    var circle_date_group = panelAgroup.append("g").attr("id", "circle_date_group")
    var circle_group = circle_date_group.append("g").attr("id", "circle_group")
    var date_group = circle_date_group.append("g").attr("id", "date_group")
    
    dates.forEach((date, index) => {
        events = event_date_dict[date]
        drawEventsRow(circle_group, date_group, rect_group, date, events)
    });
    var svgHandle = document.getElementById("panelA_svg")
    var link = d3.linkHorizontal()
      .x(function(d) {
        return d.x;
      })
      .y(function(d) {
        return d.y;
    });


    for (const [location, arr] of Object.entries(event_location_dict)) {
        tooltip_solid_line = d3.select("#panelA")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip-panelA-solid")
        var hop_count = arr.length
        if (hop_count >1 && hop_count <= 5){
            hop_count = "1-5"
        }
        else if (hop_count >5 && hop_count <= 10){
            hop_count = "6-10"
        }
        else {
            hop_count = ">10"
        }
        for(var i=0; i<arr.length-1; i++){
            var prev_id = arr[i].events;
            var curr_id = arr[i+1].events;

            console.log("Joining: " + (location+ prev_id) +", "+ (location+ curr_id))
            var prevElem = document.getElementById((location+ prev_id).replace(/ /g,"_"))
            var curElem = document.getElementById((location+ curr_id).replace(/ /g,"_"))
            
            var prevbbox = prevElem.getBBox(),
                prevMiddleX = prevbbox.x + (prevbbox.width / 2),
                prevMiddleY = prevbbox.y + (prevbbox.height / 2);

            var curbbox = curElem.getBBox(),
                curMiddleX = curbbox.x + (curbbox.width / 2),
                curMiddleY = curbbox.y + (curbbox.height / 2);

            var prevConvert = makeAbsoluteContext(prevElem, svgHandle)
            var prevCoord = prevConvert(prevMiddleX, prevMiddleY)
            var curConvert = makeAbsoluteContext(curElem, svgHandle)
            var curCoord = curConvert(curMiddleX, curMiddleY)



            var data = {
              source: {
                x: curCoord.x,
                y: curCoord.y
              },
              target: {
                x: prevCoord.x,
                y: prevCoord.y
              }
            };
            console.log(data)

            line_group.append("path").datum(location)
            .attr("class", location.replace(/ /g, "_")+" "+"pointer")
            .attr("d", link(data))
            .style('stroke', solid_hop_color(hop_count))
            .style("stroke-width", 3)
            .style("fill", "none")
            .style("opacity", 0.2)
        }
    }

    //dotted lines logic
    
    for(const [common_keyword, arr] of Object.entries(keyword_map)){
        tooltip_dotted_line = d3.select("#panelA")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip-dotted")
        keywords = common_keyword_map[common_keyword][0];
        const myArray = keywords.split(" ");
        if(myArray.length > 2){
            

            var hop_count = myArray.length
            if (hop_count >1 && hop_count <= 5){
                hop_count = "1-5"
            }
            else if (hop_count >5 && hop_count <= 10){
                hop_count = "6-10"
            }
            else {
                hop_count = ">10"
            }
            for(var i=0; i<arr.length-1; i++){

            var prev_id = arr[i].events;
            var curr_id = arr[i+1].events;
            console.log(prev_id)
            var prev_location = arr[i].location;
            var curr_location = arr[i+1].location;
            console.log(prev_location+prev_id)
            console.log(curr_location+curr_id)
            console.log("Joining: " + (common_keyword+ prev_id) +", "+ (common_keyword+ curr_id))
            var prevElem = document.getElementById((prev_location+ prev_id).replace(/ /g,"_"))
            var curElem = document.getElementById((curr_location+ curr_id).replace(/ /g,"_"))
            
            var prevbbox = prevElem.getBBox(),
                prevMiddleX = prevbbox.x + (prevbbox.width / 2),
                prevMiddleY = prevbbox.y + (prevbbox.height / 2);

            var curbbox = curElem.getBBox(),
                curMiddleX = curbbox.x + (curbbox.width / 2),
                curMiddleY = curbbox.y + (curbbox.height / 2);

            var prevConvert = makeAbsoluteContext(prevElem, svgHandle)
            var prevCoord = prevConvert(prevMiddleX, prevMiddleY)
            var curConvert = makeAbsoluteContext(curElem, svgHandle)
            var curCoord = curConvert(curMiddleX, curMiddleY)



            var data = {
              source: {
                x: curCoord.x,
                y: curCoord.y
              },
              target: {
                x: prevCoord.x,
                y: prevCoord.y
              }
            };
              
            console.log(data)
            dotted_line_group.append("path")
            .attr("class", common_keyword.replace(/ /g, "_"))
            .attr("id", common_keyword)
            .attr("d", link(data))
            .style('stroke', solid_hop_color(hop_count))
            .style("stroke-width", 3)
            .style("stroke-dasharray", ("3, 3"))
            .style("fill", "none")
            .style("opacity", dim_strength)
            .on("mouseover", function(d,i){
                var c = this.classList[0];
                console.log(c);
                tooltip_dotted_line
                .html("" + common_keyword_map[c])
                .style("opacity", 1)
                //d3.selectAll("#"+common_keyword).style("opacity", 1.0)

                 var c = this.classList[0];
                d3.select("#dotted_line_group").selectAll("."+c.replace(/ /g, "_")).style("opacity", 1.0)
                d3.select("#panelA_graph").selectAll("circle").style("opacity", dim_strength)
                // console.log(d3.selectAll("#"+(d.prev_location + d.prev_id).replace(/ /g,"_")))
                // console.log(d.prev_location+d.prev_id)
                console.log(d)
                d3.selectAll("."+c).style("opacity", 1.0)
                //d3.selectAll("#"+(d.curr_location + d.curr_id).replace(/ /g,"_")).style("opacity", 1.0)
                
            })
            .on("mouseout", function(d,i){
                
                //d3.selectAll("#"+common_keyword).style("opacity", dim_strength)
                tooltip_dotted_line
                .style("opacity", 0)
                d3.select("#panelA_graph").selectAll("circle").style("opacity", 1.0)
                d3.select("#dotted_line_group").selectAll("path").style("opacity", dim_strength)
            }).on("mousemove", function(d, i){
                tooltip_dotted_line.style("transform","translateY(-55%)")
               .style("left",(d.x)+"px")
               .style("top",(d.y)-20+"px")
                 
            })
        }

        }

    }
    // ----------------
    // Create a tooltip
    // ----------------
    

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function(d, i) {
        var location = this.classList[0];
        console.log(location);
        tooltip_solid_line
            .html("" + location.replace("_"," "))
            .style("opacity", 1)
        console.log(this.classList)
        var location = this.classList[0];
        d3.select("#line_group").selectAll("."+location.replace(/ /g, "_")).style("opacity", 1.0)
        d3.select("#panelA_graph").selectAll("circle").style("opacity", dim_strength)
        d3.select("#panelA_graph").selectAll("circle."+location.replace(/ /g,"_")).style("opacity", 1.0)
        
        highlightMapLocation(location.replace("_"," "))
        highlight_location_d(location.replace("_"," "))
                
    }
    const mousemove = function(event, d) {
        tooltip_solid_line.style("transform","translateY(-55%)")
               .style("left",(event.x)+"px")
               .style("top",(event.y)-20+"px")
    }
    const mouseleave = function(event, d) {
        tooltip_solid_line
          .style("opacity", 0)
        d3.select("#panelA_graph").selectAll("circle").style("opacity", 1.0)
        d3.select("#line_group").selectAll("path").style("opacity", dim_strength)
        unhighlightMapLocation()
        de_highlight_location_d()
        
    } 

    d3.select("#line_group").selectAll('path')
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave)
    .on("mousedown", (e, d)=>{
        drawWordCloudForLocation(d);
        draw_panel_e_loc(d);
    })
    
}

function highlightLocation(location){
    d3.select("#circle_date_group").selectAll("circle").style("opacity", dim_strength)
    d3.select("#circle_date_group").selectAll("circle."+location.replace(/ /g,"_")).style("opacity", 1.0)
}

function restorepanelA(){
    d3.select("#circle_date_group").selectAll("circle").style("opacity", 1.0)
}

function highlightEventsForKeyword(keyword){
    var eventlist = keyword2eventId[keyword]
    d3.select("#circle_date_group").selectAll("circle").style("opacity", dim_strength)
    eventlist.forEach(d=>{
        d3.select(".e"+d).style("opacity", 1.0)
    })
    
}

function highlightEventsForEventId(eventId){
    d3.select("#circle_date_group").selectAll("circle").style("opacity", dim_strength)
    d3.select(".e"+eventId).style("opacity", 1.0)
}

function drawEventsRow( circle_group, date_group, rect_group, date, events){
    // Fetch the date
    dday = date.getDay()
    ddate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    
    // Draw date at Ag_top_y
    var A_date = date_group.append("g").datum(date).attr("transform", `translate(0,${Ag_top_y+5})`).attr('height', 20).attr('class','pointer')
    .append("text")
	.text(ddate)
    .attr('font-family', "Arial")
    .style("font-size", "14px")
    .attr("font-weight", 100)
    
    A_date.on("mousedown", function(event,d){
        var ddate =(d.getMonth() + 1) + '-' + d.getDate() + '-' + d.getFullYear() 
    
        drawChartForDate(ddate)
    })

    // Coloring weekends red
    if (dday == 5 || dday == 6){
        A_date.style('fill', 'red')
    }

    Ag_top_y = Ag_top_y + Ag_row_height

    var div = width;
    var currentRow =0
    var delta=0
    
    // Draw circle and rectangle group and position
    
    var Ag = circle_group.append("g").style('fill', 'orange')
                .attr('id', date)

 
    var rect_group = rect_group.append("g").attr("transform", `translate(0,${Ag_top_y})`)
    
    // Insert circles in circle group
    circle_row = Ag.selectAll('circle')
            .data(events)
            .join('circle')
            .attr('cx', function(d, i) {
                if(parseInt(i*15/ width)!=currentRow){
                    delta = (i*15)%div
                    currentRow= parseInt(i*15/ width)
                }
                return (i*15)%div-delta;
                
            })
            .attr('cy', function(d, i) {
                totalWidth = i*15
                rowPosition = parseInt(totalWidth/ width)
                // console.log(rowPosition*15);
                return rowPosition*15
            })
            .attr('r', 5)
            .attr("id", function(d){
                return (d.location + d.events).replace(/ /g,"_");
            })
            .attr("class", function(d){
                console.log(d.common + d.location);
                return (d.common + " " +(d.location).replace(/ /g,"_")  + " e" +(d.events)+" "+"pointer")
            })
            .style('fill', function(d,i) {
                return color(d.emotion);
            }).on("mouseover", function(event,d){
                tooltip_solid_line
                .html("" + d.location.replace("_"," "))
                .style("opacity", 1)
                tooltip_solid_line.style("transform","translateY(-55%)")
                .style("left",(event.x)+"px")
                .style("top",(event.y)-10+"px")
                highlightKeyWords(d.events.toString())
                
            })
            .on("mouseout", function(d,i){
                tooltip_solid_line
                .style("opacity", 0)
                deHighlightKeyWords()
            })
            .on("mousedown", (event,d)=>{
                draw_panel_e_event(d.events.toString())
            })
    
    
    var Ag_width = Ag.node().getBoundingClientRect().width
    var div_center = width/2;
    Ag.attr("transform", `translate(${div_center-Ag_width/2},${Ag_top_y})`)     
    
    Ag_top_y += Ag_row_height
    //         console.log('hello', Ag_top_y)

    // Ag_end_y = Ag.node().getBoundingClientRect().bottom - 10
    Ag_height = Ag.node().getBoundingClientRect().height
    
    
    // Making background gray based on group size
    background_rect = rect_group.append('rect')
    .data(events)
    .attr('x', -20)
    .attr('y', function(d, i) {
        totalWidth = i*15
        rowPosition = parseInt(totalWidth/ width)
        return rowPosition*15 - 11
    })
    .attr('width', width +margin.left +margin.right)
    .attr('height', Ag_height + 12)
    .attr('fill', '#Eceeee');
    
    //Increase svg height if appending the next group overflows div height - this will enable scrollable
    var div_h = document.getElementById("panelA_graph").clientHeight
    if (Ag_top_y > div_h) {
        d3.select("#panelA_svg").attr('height', Ag_top_y+"px")
    }
 }
function createLegend(color_map, group, title_text, shift){


    var title = group.append('g')
    title.append('text')
            .text(title_text)
            .attr('x', function(d,i){ return i * 20+3 })
            .attr('y', function(d){ return  10; })
            .attr('dy', 10-3)
            .style('fill', "black")
            .style("font-size", "15px")
    var le_group = group.append('g').attr('transform',`translate(${shift},15)`)
    le_group.selectAll('g').data(color_map.domain())
    .join(
        enter=>{
            var newgroup = enter.append('g')
            
            newgroup.append('rect')
                .attr('x', function(d,i){return 30*i})
                .attr('y', 5)
                .attr('width', 27)
                .attr('height', 15)
                .attr('fill', 10).attr('fill', function(d,i){
                return color_map(d);
            })
            newgroup.append('text')
            .text(function(d){ return d; })
            .attr('x', function(d,i){ return i * 30+3 })
            .attr('y', function(d){ return  10; })
            .attr('dy', 10-3)
            .style('fill', "white")
            .style("font-size", "10px")
            
        }    
    )
}
function addLegend(){
    var svg = d3.select("#panelA_svg_legend");
    var g = svg.append('g').attr('transform', "translate(70,0)")
    createLegend(solid_hop_color, g, "\u2500\u2500 geo hops", 7)
    var g = svg.append('g').attr('transform', "translate(200,0)")
    createLegend(solid_hop_color, g, "---- keyword hops", 20)
}