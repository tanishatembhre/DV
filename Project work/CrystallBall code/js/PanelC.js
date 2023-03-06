
var keywords_map = {}
var final_keywords_weight = [];
var panelC_data;
var colors = anychart.color.singleHueProgression('#000000');
var chart;
var selected_points = [];
var hoveredState;
var counter = 0;
var svg;
document.addEventListener('DOMContentLoaded',function() {

          // code to create a word cloud chart will be here
  Promise.all([d3.csv("data/final_keywords_list.csv"), d3.csv("data/final_dataset_v1.csv")]).then(function (values) {
    console.log(values[0])
  panelC_data = values[0];
   
  
    panelC_data.forEach((d) => {
      key = d["keyword"];
     
      val = d["weight"];
      if(key in keywords_map){
        if(keywords_map[key] > val){
          keywords_map[key] = val;
        }
      }else{
        keywords_map[key] = val;
      }
      
    })          
    
    svg = d3.select('#panelC');
    drawWordCloud();
});
       
});



function drawWordCloud(){

console.log(keywords_map)
 for(const [key, val] of Object.entries(keywords_map)){
    let obj = {};
    obj["x"] = key.toString();
    obj["value"] =  parseFloat(val)*10000000000.0;
    obj["value"] = parseInt(val);
    
    final_keywords_weight.push(obj);
 }
 
  console.log(final_keywords_weight.length)
  console.log(final_keywords_weight)

     
  chart = anychart.tagCloud(final_keywords_weight);

   // set a chart title
    chart.title('Events Summary')
  // set an array of angles at which the words will be laid out
    chart.angles([0])
    chart.normal().fill("#000000");
    chart.selected().fill("#FF0000");
    chart.mode("spiral");
    data = chart.data();
    var tooltip = chart.tooltip();
    tooltip.enabled(false);
    console.log(data);

  //adding event listener for chart
  chart.listen('click', function (e) {
        selected_word = chart.getSelectedPoints();
        index = selected_word[0]["index"]
        console.log(selected_word[0]["index"]);
        callOnClickFunction(final_keywords_weight[index]["x"]);
    });

    chart.container("panelC");
    chart.draw();
    chart.autoRedraw(true);
    
}

//function for drawing word cloud according to a given date
function drawChartForDate(date){

  final_keywords_weight = []
  console.log(date)
  keywords_map = {}
  var [monthInput, dayInput, yearInput] = date.split("-");
  if(monthInput.length === 1){
    monthInput = "0"+monthInput;
  }
  if(dayInput.length === 1){
    dayInput = "0"+dayInput;
  }
  panelC_data.forEach((d) => {
    var [month, day, year] = d["date"].split("-");
      if(month === monthInput && day === dayInput && year === yearInput){
        key = d["keyword"];
        val = d["weight"];
        console.log(val);
        if(key in keywords_map){
          if(keywords_map[key] > val){
            keywords_map[key] = val;
          }
        }else{
          keywords_map[key] = val;
        }  
    }
      
      
   })

 console.log(final_keywords_weight)

  svg.selectAll("*").remove();
  drawWordCloud();
  
    
}


function callOnClickFunction(onclick_keyword){
  console.log(onclick_keyword);
  highlightEventsForKeyword(onclick_keyword)
  highlightMapLocationWithKeyword(onclick_keyword)
}

function highlightKeyWords(eventId){
  highlighted_map = {}
  selected_points = [];
   panelC_data.forEach((d) => {
      if(d["event_id"] === eventId){
        key = d["keyword"];
     
        val = d["weight"];
        if(key in highlighted_map){
          if(highlighted_map[key] > val){
            highlighted_map[key] = val;
          }
        }else{
          highlighted_map[key] = val;
        }
      }
      
    })

   console.log(highlighted_map);
    highlightedWords = []
    for(const [key, val] of Object.entries(highlighted_map)){
        let obj = {};
        obj["x"] = key.toString();
        obj["value"] =  parseFloat(val)*10000000000.0;
        obj["value"] = parseInt(val);
        highlightedWords.push(obj);
    }

    console.log(highlightedWords);
    for(var i=0; i<highlightedWords.length; i++){
      word = highlightedWords[i]["x"];
      for(var j=0; j<final_keywords_weight.length; j++){
        if(final_keywords_weight[j]["x"] === word){
            selected_points.push(j);
        }
      }
    }


    console.log(selected_points);
    chart.select(selected_points); 

}

//function to un-select all the highlighted points
function deHighlightKeyWords(){
  chart.unselect(selected_points);
}

function drawWordCloudForLocation(location){
  final_keywords_weight = []
  keywords_map = {}
  panelC_data.forEach((d) => {
    var loc = d["location"]
      if(loc === location){
        key = d["keyword"];
        val = d["weight"];
        if(key in keywords_map){
          if(keywords_map[key] > val){
            keywords_map[key] = val;
          }
        }else{
          keywords_map[key] = val;
        }  
    }
      
      
   })

 
 
  svg.selectAll("*").remove();
  drawWordCloud();
  
}
