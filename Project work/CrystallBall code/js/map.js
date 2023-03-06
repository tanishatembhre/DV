
var events_per_location={};
// [{'key':"location","value":{"totalCount":0, "5days":0, "10days":0, "30days":0}];
var count_data=[];
var address = "Paris";
var data2 =[];
var map_svg;
var map;
var loc;
var zoomlevel;
var markers;
var prevzoom;
var latlongCities =[]; 
var div; 
var keywords_data =[];
document.addEventListener('DOMContentLoaded', function () {
  map = L.map('map').setView(new L.latLng(40.737, -73.923), 4);
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
    maxZoom: 6,
    }).addTo(map);

  map.setZoom(3);
  // Add a svg layer to the map
  L.svg().addTo(map);
  map_svg = d3.select("#map")
  .select("svg");

  markers = 
    {"Wisconsin":{ lat: 44.500000, long:-89.500000},
    "West Virginia":{lat:	39.000000, long:	-80.500000},
    "Vermont": {lat:	44.000000, long:	-72.699997},
    "Texas":{ lat: 31.000000, long:	-100.000000},
    "SouthDakota":{ lat:	44.500000, long:	-100.000000},
    "RhodeIsland":{ lat:	41.742325, long:	-71.742332},
    "Oregon": {lat:	44.000000, long:	-120.500000},
    "NewYork":{ lat:	43.000000, long:	-75.000000},
    "New Hampshire": {lat:	44.000000, long:	-71.500000},
    "Nebraska":{ lat:	41.500000, long:	-100.000000},
    "Kansas":{ lat:	38.500000, long:	-98.000000},
    "Mississippi":{ lat:	33.000000, long:	-90.000000},
    "Illinois": {lat:	40.000000, long:	-89.000000},
    "Delaware":{ lat:	39.000000, long:	-75.500000},
    "Connecticut":{	lat: 41.599998, long:	-72.699997},
    "Arkansas":{ lat:	34.799999, long:	-92.199997},
    "Indiana":{ lat:	40.273502, long:	-86.126976},
    "Missouri":{lat:	38.573936, long:	-92.603760},
    "Florida":{ lat:	27.994402, long:	-81.760254},
     "Nevada":{ lat:	39.876019, long:	-117.224121},
    "Maine":{ lat:	45.367584, long:	-68.972168},
    "Michigan":{ lat:	44.182205, long:	-84.506836},
    "Georgia": {lat:	33.247875, long:	-83.441162},
      "Hawaii":{lat:	19.741755, long:	-155.844437},
      "Alaska":{lat:	66.160507, long:	-153.369141},
      "Tennessee":{ lat:	35.860119, long:	-86.660156},
    "Virginia": {lat:	37.926868, long:	-78.024902},
    "NewJersey": {lat:	39.833851, long:	-74.871826},
    "Kentucky":{ lat:	37.839333, long:	-84.270020},
    "North Dakota":{ lat:	47.650589, long:	-100.437012},
    "Minnesota":{ lat:	46.392410, long:-94.636230},
    "Oklahoma":{ lat:	36.084621, long:	-96.921387},
    "Montana":{ lat:	46.965260, long:	-109.533691},
    "Washington":{ lat:	47.751076, long:	-120.740135},
    "Utah":{ lat:	39.419220, long:	-111.950684},
    "Colorado":{ lat:	39.113014, long:	-105.358887},
    "Ohio":{ lat:	40.367474, long:	-82.996216},
    "Alabama":{ lat:	32.318230, long:	-86.902298},
    "Iowa":{  lat:	42.032974, long:	-93.581543},
    "NewMexico":{ lat:	34.307144, long:	-106.018066},
    "SouthCarolina":{ lat:	33.836082, long:	-81.163727},
    "Pennsylvania":{ lat:	41.203323, long:	-77.194527},
    "arizona":{ lat:	34.048927, long:	-111.093735},
    "Maryland":{ lat:	39.045753, long:	-76.641273},
    "Massachusetts":{ lat:	42.407211, long:	-71.382439},
    "California":{ lat:	36.778259, long:	-119.417931},
    "Idaho":{ lat:	44.068203, long:	-114.742043},
    "Wyoming":{ lat:	43.075970, long:	-107.290283},
    "NorthCarolina":{ lat:	35.782169, long:	-80.793457},
    "Louisiana":{ lat:	30.391830, long:	-92.329102},
  "Boston":{lat:42.364506, long: -71.057083 }
};
  div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  //Promise.all([d3.csv('data/event_dummy_data.csv'), d3.csv('data/worldcities.csv')]).then(function(values){
    Promise.all([d3.csv('data/final_dataset_v1.csv'), d3.csv('data/worldcities.csv'), d3.csv("data/final_keywords_list.csv")]).then(function(values){
    console.log("data read");
    events_data = values[0];
    cities_data = values[1];
    keywords_data = values[2];
    // console.log(events_data);
    // console.log(cities_data);
    // console.log(keywords_data);
    for( var i=0; i<events_data.length; i++){
      // console.log(i+" " +events_data[i]['date']);
      date = events_data[i]['date'].split('-');
      // console.log(date);
      event_date = new Date(date[2], date[0], date[1])
      todaydate = new Date("2022","09","01");
      noofdays = (event_date.getTime()- todaydate.getTime())/(1000*3600*24);
      // console.log("noofdays "+noofdays);
      var location = events_data[i]['location'];
      if(events_per_location[location]){
        events_per_location[location]['totalcount']++;
        if(noofdays<2){
          events_per_location[location]['2days']++;
        }else if(noofdays<7){
          events_per_location[location]['7days']++;
        }else if(noofdays<15){
          events_per_location[location]['15days']++;
        }else if(noofdays<30){
          events_per_location[location]['30days']++;
        }else{
          events_per_location[location]['30+days']++;
        }
        events_per_location[location]['events'].push(events_data[i]);
      }else{
        var key = 
        events_per_location[location]= {'totalcount':1, '2days':0,'7days':0, '15days':0, '30days':0, '30+days':0, 'events':[]};
        if(noofdays<2){
          events_per_location[location]['2days']++;
        }else if(noofdays<7){
          events_per_location[location]['7days']++;
        }else if(noofdays<15){
          events_per_location[location]['15days']++;
        }else if(noofdays<30){
          events_per_location[location]['30days']++;
        }else{
          events_per_location[location]['30+days']++;
        }
        events_per_location[location]['events'].push(events_data[i]);
      }
    }
    for(var i in events_per_location){
      count_data.push({location: i, counts:[{label:'2days',count:events_per_location[i]["2days"]},{label:'7days',count:events_per_location[i]["7days"]},{label:'15days', count:events_per_location[i]["15days"]},{label:'30days', count:events_per_location[i]["30days"]}, {label:'30+days',count:events_per_location[i]["30+days"]}]}); 
    }
    // for(var i in cities_data){
    //   latlongCities[cities_data[i]["city_ascii"]] ={'lat':cities_data[i]['lat'],'long':cities_data[i]['lng'],'country':cities_data[i]['country']};
    // }
   
   drawDoughNutChart(count_data);
  });

  // Function that update circle position if something change
  function update(){
    if(prevzoom == 6 && map.getZoom()!=6 ){
      map_svg.selectAll('.spiral').remove();
    }
    drawDoughNutChart(count_data);
      // d3.selectAll(".mapcircle")
      // .attr("cx", function(d){  return map.latLngToLayerPoint([d.lat, d.long]).x })
      // .attr("cy", function(d){  return map.latLngToLayerPoint([d.lat, d.long]).y });
      
  }

  // If the user change the map (zoom or drag), I update circle position:
map.on("moveend", update);

var leg = map_svg.append('g').attr('class','legends').attr("style","position:absolute;");
leg.append("circle").attr("cx",550).attr("cy",230).attr("r", 5).style("fill", "#0000ff")
leg.append("circle").attr("cx",550).attr("cy",250).attr("r", 5).style("fill", "#3388ff")
leg.append("circle").attr("cx",550).attr("cy",270).attr("r", 5).style("fill", "#77ccff")
leg.append("circle").attr("cx",550).attr("cy",290).attr("r", 5).style("fill", "#dbf0f9")
leg.append("circle").attr("cx",550).attr("cy",310).attr("r", 5).style("fill", "white")
leg.append("text").attr("x", 560).attr("y", 230).text("<=Tomorrow").style("font-size", "12px").attr("alignment-baseline","middle")
leg.append("text").attr("x", 560).attr("y", 250).text("<=week").style("font-size", "12px").attr("alignment-baseline","middle")
leg.append("text").attr("x", 560).attr("y", 270).text("<=15days").style("font-size", "12px").attr("alignment-baseline","middle")
leg.append("text").attr("x", 560).attr("y", 290).text("<=30days").style("font-size", "12px").attr("alignment-baseline","middle")
leg.append("text").attr("x", 560).attr("y", 310).text(">30days").style("font-size", "12px").attr("alignment-baseline","middle")
});

function drawDoughNutChart(data){
  var width = 30;
  var height = 30;
  var radius = Math.min(width, height) / 2;
  var donutWidth = 5;                            


  var color = d3.scaleOrdinal(["2days","7days", "15days", "30days","30+days"], ["#0000ff","#3388ff", "#77ccff","#dbf0f9", "white"]);
  
  map_svg.selectAll('.mypath').remove();
  map_svg.selectAll('.totalcount').remove();
  var arc = d3.arc()
  .innerRadius(radius - donutWidth)            
  .outerRadius(radius);     
  var pie = d3.pie()
  .value(function(d) { return d.count; })
  .sort(null);

  for(var i=0;i<data.length;i++){
    var ltext = map_svg.append("g");
    ltext.append()
    var g=map_svg.append("g");
     var loc = markers[data[i]["location"]];
     console.log(data[i]["location"]);
   
  var path = g.selectAll('.mypath')
        .data(pie(data[i]["counts"]))
        .enter()
        .append('path')
        .attr('class', function(){
          // var location = data[i]["location"];
          return "mypath "+nospaces(data[i]["location"]);})
        .attr("transform", "translate(" +map.latLngToLayerPoint([loc.lat, loc.long]).x + "," + map.latLngToLayerPoint([loc.lat, loc.long]).y + ")")
        .attr('d', arc)
        .attr('fill', function(d, i) { 
          return color(d.data.label);
        })
        .style("stroke-width","1px")
        .attr("stroke", "black")
        .on("click", function(e, d){
          var location = e.path[0]["classList"][1];
          map_svg.selectAll("."+location).attr("opacity", 0);
          map_svg.selectAll(".mypath").attr("opacity", 0.2);
          map.setZoom(6);
          prevzoom =6;
          drawWordCloudForLocation(location);
          drawSpiralLineChart(location);
          draw_panel_e_loc(location);
        }).on("mouseover", function(e){
          var location = e.path[0]["classList"][1];
          highlightLocation(location);
          // drawWordCloudForLocation(location);
          highlightMapLocation(location);
          highlight_location_d(location);
          div
            .style("opacity", .9); 
          div.html("<b>Location:" + location +" Events: "+events_per_location[location]["totalcount"]+"</b>")
            .style("left", (event.pageX+20) + "px")
            .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseout", function(e){
       unhighlightMapLocation();
       de_highlight_location_d();
       restorepanelA();
          div 
          .style("opacity", 0);
      });

        ltext.append("text")
        .attr('class',"totalcount")
        .attr('x',map.latLngToLayerPoint([loc.lat, loc.long]).x )
        .attr('y',map.latLngToLayerPoint([loc.lat, loc.long]).y + 4 )
        .text(function(){
          return events_per_location[data[i]["location"]]["totalcount"];})
          // return data[i]["counts"]["2days"]+data[i]["counts"]["7days"]+data[i]["counts"]["15days"]+data[i]["counts"]["30days"]+data[i]["counts"]["30+days"];})
        .style("fill", 'black')
        .attr("text-anchor", "middle ").on("mouseover", function(e){
          var location = e.path[0]["classList"][1];
          highlightLocation(location);
          highlightMapLocation(location);
          highlight_location_d(location);
          div
            .style("opacity", .9); 
          div.html("<b>Location: " + location +", events: "+events_per_location[location]["totalcount"]+"</b>")
            .style("left", (event.pageX+20) + "px")
            .style("top", (event.pageY - 40) + "px");
      }).on("click", function(e,d){
          var location = e.path[0]["classList"][1];
          map_svg.selectAll("."+location).attr("opacity", 0);
          map_svg.selectAll(".mypath").attr("opacity", 0.2);
          map.setZoom(6);
          prevzoom =6;
          drawWordCloudForLocation(location);
          drawSpiralLineChart(location);
          draw_panel_e_loc(loc);
      })
      .on("mouseout", function(e){
        unhighlightMapLocation();
        de_highlight_location_d();
        restorepanelA();
          div 
          .style("opacity", 0);
      });
      }
}

function drawSpiralLineChart(location){
  var loc = markers[location];
  console.log(events_per_location[location]);
 var width = 200,
    height = 200;
 var color = d3.scaleOrdinal(["2days","7days", "15days", "30days","30+days"], ["#0000ff","#3388ff", "#77ccff","#dbf0f9", "white"]);
  
d3.selectAll(".spiral").remove();
var centerX = map.latLngToLayerPoint([loc.lat, loc.long]).x,
    centerY = map.latLngToLayerPoint([loc.lat, loc.long]).y,
    radius = 50,
    sides = events_per_location[location]["totalcount"],
    // sides =10,
    coils = 3,
    rotation = 0;
  var awayStep = radius/sides; 
// How far to rotate around center for each side.
var aroundStep = coils/sides;// 0 to 1 based.
// Convert aroundStep to radians.
var aroundRadians = aroundStep * Math.PI;
// Convert rotation to radians.
rotation = 2 * Math.PI;

var new_time = [];
// For every side, step around and away from center.
new_time.push({ind: 0, x: map.latLngToLayerPoint([loc.lat, loc.long]).x, y: map.latLngToLayerPoint([loc.lat, loc.long]).y});
for(var i=2; i<=sides+1; i++){
  // How far away from center
  var away = i * awayStep*2;
 
  // How far around the center.
  var around = i * aroundRadians + rotation;

  // Convert 'around' and 'away' to X and Y.
  var x = centerX + Math.cos(around) * away;
  var y = centerY + Math.sin(around) * away;
  var eid = events_per_location[location]["events"][i-2]["event_id"];
  var edate = events_per_location[location]["events"][i-2]["date"];
  new_time.push({ind: i-1, x: x, y: y, event_id:eid, event_date:edate });
}

console.log(new_time);
var g = map_svg.append('g').attr("style","pointer-events: auto;" );
var spiral_data =[]
for (var i=1; i<new_time.length;i++){
  spiral_data.push(new_time[i]);
}
var lines =  g.selectAll(".spiralline")
                .data(spiral_data)
                .enter()
                .append("line")
                .attr("class","spiral")
                .attr("x1", function (d) { return d.x; })
                .attr("y1", function (d) { return d.y; })
                .attr("x2", new_time[0].x)
                .attr("y2", new_time[0].y)
                .attr("stroke", "black")
                .on("click", function(e, d){
                 // console.log("clicked1 "+d.event_id);
                });

var count_30plusdays = events_per_location[location]["30+days"];
var count_30days = count_30plusdays+ events_per_location[location]["30days"]
var count_15days = count_30days +events_per_location[location]["15days"]
var count_7days = count_15days +events_per_location[location]["7days"]
var count_2days = count_7days + events_per_location[location]["2days"]
var circles = g.selectAll(".spiralcircle")
      .data(spiral_data)
      .enter()
      .append("circle")
      .attr('class',function(d){ return 'leaflet-interactive spiral event'+d.event_id;})
      .attr("cx", function (d) { return d.x; })
      .attr("cy", function (d) { return d.y; })
      .attr("r", 5)
      .attr("style", "pointer-events: auto;")
      .attr("fill", function(d){
        if(d.ind<=count_30plusdays){
          return color("30+days");
        }else if(d.ind<= count_30days){
          return color("30days");
        }else if(d.ind<= count_15days){
          return color("15days");
        }else if(d.ind<= count_7days){
          return color("7days");
        }else {
          return color("2days");
        }
      });
      circles.on("click",function(e,d){
        // console.log(d);
        // console.log("clicked"+d.event_id);
        draw_panel_e_event(d.event_id);
      }).on("mouseover", function(e,d){
        d3.select(this).attr('r', 8);
        div
          .style("opacity", .9); 
        div.html("<b>Location:" + location +" Date: "+ d.event_date+"</b>")
          .style("left", (event.pageX+20) + "px")
          .style("top", (event.pageY - 40) + "px");
          highlightEventsForEventId(d.event_id);
          highlightKeyWords(d.event_id)
      }).on("mouseout",function(e,d){
        d3.select(this).attr('r', 5);
        div 
        .style("opacity", 0);
        deHighlightKeyWords()
        restorepanelA();
      });
}

  function highlightMapLocation(location){

    map_svg.selectAll('.mypath').attr('opacity', 0.2);
    map_svg.selectAll('.'+nospaces(location)).attr('opacity', 1);
  }

  function unhighlightMapLocation(){
    map_svg.selectAll('.mypath').attr("opacity", 1);
  }

  function nospaces(str){
    return str.split(' ').join('');
  }

  function highlightMapLocationWithKeyword(keyword){
    var locations = [];
    for(var i=0;i<keywords_data.length;i++){
      if(keywords_data[i]["keyword"] == keyword){
        if(!locations.includes(keywords_data[i]["location"]))
          locations.push(keywords_data[i]["location"]);
      }
    }
    map_svg.selectAll('.mypath').attr("opacity", 0.2);
    for( var i in locations){
      map_svg.selectAll('.'+locations[i]).attr('opacity', 1);
    }

    
  }