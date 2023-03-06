var attribute_region_data={}
var region2countrymap = {};
var country2regionmap = {};
var country2geomap = {};
var countries = new Set();  
var visiblePaths={}
var region2codes={}
var codes2region={}
var years= new Set();
var animationTime = 1000;
var playAnimationTime = 2000;
var rescaleTime=500;
var x_scale;
var y_scale;
var yAxisGroup;
var xAxisGroup;
var svg;
var color;
var margin = {top: 10, right: 80, bottom: 50, left: 50},
    width = 1175 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;
const selected_attributes= [
                        "Data.Health.Birth Rate",
                        "Data.Health.Death Rate",
                        "Data.Health.Fertility Rate",
                        "Data.Health.Life Expectancy at Birth, Female",
                        // "Data.Health.Life Expectancy at Birth, Male",
                        // "Data.Health.Life Expectancy at Birth, Total",
                        "Data.Health.Population Growth",
                        // "Data.Health.Total Population",
                        // "Data.Infrastructure.Mobile Cellular Subscriptions",
                        "Data.Infrastructure.Mobile Cellular Subscriptions per 100 People",
                        // "Data.Infrastructure.Telephone Lines",
                        "Data.Infrastructure.Telephone Lines per 100 People",
                        // "Data.Rural Development.Agricultural Land",
                        "Data.Rural Development.Agricultural Land Percent",
                        // "Data.Rural Development.Arable Land",
                        // "Data.Rural Development.Arable Land Percent",
                        // "Data.Rural Development.Land Area",
                        // "Data.Rural Development.Rural Population",
                        "Data.Rural Development.Rural Population Growth",
                        // "Data.Rural Development.Surface Area",
                        // "Data.Urban Development.Population Density",
                        "Data.Urban Development.Urban Population Percent",
                        // "Data.Urban Development.Urban Population Percent Growth"
                    ]

function createFormChecks(id, name){
    var form_check = document.createElement("div");
    form_check.classList.add("form-check")
    var form_check_input = document.createElement("input");
    form_check_input.classList.add("form-check-input");
    form_check_input.classList.add("countrycheck")
    form_check_input.id=id;
    form_check_input.type="checkbox";
    var form_check_label = document.createElement("label");
    form_check_label.htmlFor=id;
    form_check_label.innerHTML=name;
    form_check.appendChild(form_check_input);
    form_check.appendChild(form_check_label);
    return form_check;
}
function addIndicatorOptions(){
    var attribute_dropdown = document.getElementById("gindicator");
    for(const x of selected_attributes){
        var option = document.createElement("option");
        option.text = x;
        attribute_dropdown.add(option);
    }
}
function createCode(name){
    const tokens = name.replace(/[^a-zA-Z0-9 ]/g, ' ').split(" ")
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var code = "";
    for(const token of tokens){
        if( token.length>0 && characters.includes(token[0].toLowerCase())){
            code+=token[0].toLowerCase()
        }
    }
    return code;

}
function populateRegionChecklist(regions){
    var wbr_regions = new Set();
    regions.forEach(d=>wbr_regions.add(d.wbr));
    var regioncheckboxholder = document.getElementById("regioncheckbox");
    var selectAll = createFormChecks("sla", "(Select All)");
    regioncheckboxholder.appendChild(selectAll);
    for(const r of wbr_regions){
        code = createCode(r)
        region2codes[r] = code
        codes2region[code] = r
        var form_check = createFormChecks(code, r)
        regioncheckboxholder.appendChild(form_check);   
    }
}
document.addEventListener('DOMContentLoaded', function () {

    
    Promise.all([d3.csv('./data/global_development.csv', (d) => {
        if(new Date ("1980-01-01") <=new Date (d.Year+"-01-01")){
            data = {
                Country: d.Country,
                Year:  new Date (d.Year+"-01-01")
            }
            years.add(new Date (d.Year+"-01-01"));
            for (const x of selected_attributes) { data[x]=parseFloat(d[x]); }
            return data;
        }
    }), d3.csv('./data/countries_regions.csv',(d)=>{
        data = {
            geo: d.geo,
            name: d.name,
            wbr: d["World bank region"]
        }           
        return data;
    })]).then(function (values) {
        // Sort and dedup years 
        years = Array.from(years).sort((a, b) => a - b);
        years=years
            .map(function (date) { return date.getTime() })
            .filter(function (date, i, array) {
                return array.indexOf(date) === i;
            })
            .map(function (time) { return new Date(time); });
        // Add region checkboxes
        var regions = values[1];
        populateRegionChecklist(regions);
 
        // Wrangle data
        // All countries
        var developmentdata = values[0];
        developmentdata.forEach(d=>countries.add(d.Country));

        // Filter region and countries
        //Initialize
        regions.forEach(d=>region2countrymap[d.wbr]=new Set());
        // Fill the set
        regions.forEach(d=>{
            if(countries.has(d.name)){
                region2countrymap[d.wbr].add(d.name)
                country2regionmap[d.name] = d.wbr;
                country2geomap[d.name] = d.geo;
            }
        });
        color = d3.scaleOrdinal()
            .domain(Object.keys(region2countrymap))
            .range(d3.schemeCategory10);
        for(const attr of selected_attributes){
            attribute_region_data[attr]={}
            for(const region of regions){
                attribute_region_data[attr][region.wbr] = []
            }
        }
        console.log(attribute_region_data)
        for(const attr of selected_attributes){
            developmentdata.forEach(d=>{
                var country = d.Country;
                if(countries.has(country)){
                    var region = country2regionmap[country]
                    var year = d.Year;
                    var value = d[attr];
                    if(!region){
                      //      console.log("No region found for " + country)
                    }else{
                        var found=false;
                        for( const reg of attribute_region_data[attr][region]){
                            if(reg.country==country){
                                reg.series.push({Year:year, value:value})
                                found=true
                            }
                        }
                        if(!found){
                            attribute_region_data[attr][region].push({
                                country: country,
                                region: region,
                                series: [{Year:year, value:value}]
                            })
                        }
                    }
                }
            });
        }
        console.log(attribute_region_data)

        
        // Add select all functionality
        $("input[id='sla']").change(function(event) { 
            if(this.checked) {
                var addedRegions=[]
                // Iterate each checkbox
                $('.countrycheck').each(function() {
                    if (this.id != "(Select All)" && !this.checked){
                        this.checked = true;
                        addedRegions.push(this.id)
                    }                       
                });
                addRegionsChart( document.getElementById("gindicator").value, addedRegions)  
            } else {
                var regionsToRemove = []
                $('.countrycheck').each(function() {
                    if (this.id != "(Select All)"){
                        this.checked = false;
                        regionsToRemove.push(this.id)
                    }                        
                });
                regionsToRemove.forEach(d=>removeRegion(d))
            }
        });

        // Add onchange event to other checkbox
        $(".form-check-input").change(function(event) { 
            if(this.id != "sla")
                {if(this.checked) {
                    addRegionChart( document.getElementById("gindicator").value,this.id)
                } else {
                    removeRegion( this.id)
                }
            }
        });

        const checkbox = document.getElementById('countryflag')

        checkbox.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            d3.selectAll(".countryimg").style("display","block");
            d3.selectAll(".countrytext").style("display","none");
        } else {
            d3.selectAll(".countrytext").style("display","block");
            d3.selectAll(".countryimg").style("display","none");
        }
        })
        addIndicatorOptions();
        drawChart();
        slider = new Slider('#ex2', {});
    });
    
 });

function updateOpacity(opacity){
    console.log(opacity)
    d3.select("#graph_svg").selectAll(".cpath").style("opacity", opacity/100)
    d3.select("#graph_svg").selectAll(".marker").style("opacity", opacity/100)
}

function drawlinescircle(region_data, region){
    var valueline = d3.line()   
    .x(function(d) { return x_scale(d.Year); })
    .y(function(d) { return y_scale(d.value); });

    pathssvg = svg
    .selectAll("."+region2codes[region])
    .data(region_data)

    pathssvg
    .join((enter)=>{
        g = enter.append('g')
            .attr("clip-path", "url(#clip)")
            .attr("class",function(d,i){ return "cpath "+ region2codes[region]})
        g.append('path')
        .attr("id", function(d,i){ return country2geomap[d.country]})
        .attr("class",function(d,i){ return "cpath copath "+ region2codes[region]})
        .attr("fill", "none")
        .attr("stroke", function(d,i){ return color(country2regionmap[d.country])})
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 3)
        .style('opacity', 0)
        .attr("d", function(d, i){
            return valueline(d.series)})
        .on("mouseover", function(d,i){
            d3.selectAll(".copath").style("opacity", 0.15)
            d3.selectAll(".marker").style("opacity", 0.15)
            this.style.opacity=document.getElementById("opa").value/100
            d3.selectAll("g#"+this.id).style("opacity", document.getElementById("opa").value/100)
            
        })
        .on("mouseout", function(d,i){
            d3.selectAll(".copath").style("opacity", document.getElementById("opa").value/100)
            d3.selectAll(".marker").style("opacity", document.getElementById("opa").value/100)
        })

        var flagstatus = document.getElementById("countryflag").checked;
        var enddate = new Date (slider.getValue()[1]+"-01-01");
        g = enter.append('g')
                .attr('class', 'marker '+region2codes[region])
                .attr('id', function(d,i) {return country2geomap[d.country]})
                .attr("transform", function(d,i) {
                    var x,y;
                    d.series.forEach(ele=>{
                        if(ele.Year.getTime() == enddate.getTime()){
                            x= x_scale(ele.Year);
                            y= y_scale(ele.value);
                        }
                    })
                    if(!x){
                        x= x_scale(d.series[d.series.length-1].Year);
                        y= y_scale(d.series[d.series.length-1].value);
                    }
                    return "translate("+x+","+y+")";
                })
                .style('opacity', 0)
            g.append('circle')
                // .attr('class', 'cpath')
                .attr('r', 5)
                
                .attr('fill', function(d,i) {return color(country2regionmap[d.country])})
                .attr('stroke-width', 2)
                .attr('stroke',function(d,i) {return  color(country2regionmap[d.country])})

            g.append("text")
                .attr("class","countrytext")
                .attr("font-family", "sans-serif")
                .style("display", function(){
                    if(flagstatus){
                        return "none";
                    }
                    else{
                        return "block";
                    }})
                .attr("font-size", 10)
                .attr("fill", function(d,i) {return  color(country2regionmap[d.country])})
                .attr("text-anchor", "start")
                .attr("dy", 2.5).attr("dx", 7)
                .text(function(d,i){ return d.country});
            g.append("image")
            .attr("class","countryimg")
            .attr("xlink:href",function(d,i){ return "./data/flags/"+country2geomap[d.country]+".svg"})
            .style("display", function(){
                if(flagstatus){
                    return "block";
                }
                else{
                    return "none";
                }})
            .attr("width", 40)
            .attr("height", 20)
            .attr("x", 7)
            .attr("y", -10)

    })
}
function showPath2(region_data, region){
    drawlinescircle(region_data, region)
    const transitionPath = d3
        .transition()
        // .ease(d3.easeSin)
        .duration(animationTime);
    
    d3.selectAll("."+region2codes[region]).transition(transitionPath).style("opacity", document.getElementById("opa").value/100)
}

function displayPath(region_data, region){
    drawlinescircle(region_data, region)
    d3.selectAll("."+region2codes[region]).style("opacity", document.getElementById("opa").value/100)
}

function animatePath( region_data, region){
   
    drawlinescircle(region_data, region)
    d3.selectAll("."+region2codes[region]).style("opacity", document.getElementById("opa").value/100)
    const transitionPath = d3
        .transition()
        // .ease(d3.easeSin)
        .duration(playAnimationTime);

    function removeAttrs(){
        d3.selectAll("path.cpath")
        .attr("stroke-dashoffset", null)
        .attr("stroke-dasharray", null)
    }
    d3.selectAll("path.cpath")
        .attr("stroke-dashoffset", function(d,i){ 
            console.log(d); 
            return this.getTotalLength()})
        .attr("stroke-dasharray", function(d,i){ return this.getTotalLength()} )
        .transition(transitionPath)
        .attr("stroke-dashoffset", 0).on('end', removeAttrs);
    
    function translateAlong() {
        
        return function(d){ 
            var enddate = new Date (slider.getValue()[1]+"-01-01");
            var startdate = new Date (slider.getValue()[0]+"-01-01");
            var endx,endy,startx,starty;
            d.series.forEach(ele=>{
                if(ele.Year.getTime() == enddate.getTime()){
                    endx= x_scale(ele.Year);
                    endy= y_scale(ele.value);
                }
                if(ele.Year.getTime() == startdate.getTime()){
                    startx= x_scale(ele.Year);
                    starty= y_scale(ele.value);
                }
            })
            if(endx===undefined){
                endx= x_scale(d.series[d.series.length-1].Year);
                endy= y_scale(d.series[d.series.length-1].value);
            }
            if(startx=== undefined){
                startx= x_scale(d.series[0].Year);
                starty= y_scale(d.series[0].value);
            }
            
            var path=document.getElementById(this.id);
            var l = path.getTotalLength();
            var t0 = 0;
            return function(t) {
                var p0 = path.getPointAtLength(t0 * l);//previous point
                var p = path.getPointAtLength(t * l);////current point
            
                t0 = t;
                //Shifting center to center of rocket
                var centerX = p.x ,
                centerY = p.y;
                if(centerX<startx){
                    return "translate(" + startx + "," + starty + ")";
                }
                if(centerX<endx ){
                    return "translate(" + centerX + "," + centerY + ")";
                }else{
                    return "translate(" + endx + "," + endy + ")";
                }
            }
        }
        
    }
    d3.selectAll("g.marker")
        .transition()
        .duration(playAnimationTime)
        .attrTween("transform", translateAlong())

    
}
function get_selected_regions(){
    var regions=[]
    for(const ele of document.getElementsByClassName('form-check-input')){
        if(ele.checked){
            regions.push(codes2region[ele.id])
        }
    }
    return regions
}
function get_maxy(){
    var selected_regions= get_selected_regions()
    var attr = document.getElementById("gindicator").value;
    var region_data = attribute_region_data[attr]
    var max_y=0
    for(const region of selected_regions){
        if(region){
            for(const cdata of region_data[region]){
                var series = cdata.series
                for(const d of series){
                    max_y = Math.max(max_y, d.value)
                }
            }
        }
    }
    return max_y
}

function updateYAxis(callback){
    var valueline = d3.line()
    .x(function(d) { return x_scale(d.Year); })
    .y(function(d) { return y_scale(d.value); });
    var max_y= get_maxy()
    if(max_y==0) return;
    y_scale = d3.scaleLinear()  
        .domain([0, max_y])
        .range([height, margin.top]); 
    d3.selectAll(".cpath").transition().duration(rescaleTime).attr('d', d=>{
        return valueline(d.series);
    } )
    var enddate = new Date (slider.getValue()[1]+"-01-01");
    d3.selectAll(".marker").transition().duration(rescaleTime).attr('transform', d=>{
        var x,y;
        d.series.forEach(ele=>{
            if(ele.Year.getTime() == enddate.getTime()){
                x= x_scale(ele.Year);
                y= y_scale(ele.value);
            }
        })
        if(!x){
            x= x_scale(d.series[d.series.length-1].Year);
            y= y_scale(d.series[d.series.length-1].value);
        }
        return "translate("+x+","+y+")";
    })
    yAxisGroup.transition().duration(rescaleTime).call(d3.axisLeft().scale(y_scale)).on('end', callback);
}
function addRegionChart(attr, regionCode){
    console.log("Adding: "+attr+", regionCode: "+regionCode)
    var region = codes2region[regionCode]

     function drawNewLines(){
        var region_data = attribute_region_data[attr]
        showPath2(region_data[region], region)
        // for(const cdata of region_data[region]){
        //     showPath2( cdata.series, cdata.country)
        // }
    }
    updateXAxis(updateYAxis(drawNewLines))
    // drawNewLines()
    
}
function addRegionsChart(attr, regionCodes){
    console.log("Adding: "+attr+", regionCode: "+regionCodes)
    // var region = codes2region[regionCode]

    function drawNewLines(){
        for(const regionCode of regionCodes){
            var region = codes2region[regionCode]
            if(region){
                var region_data = attribute_region_data[attr]
                showPath2(region_data[region], region)
                // for(const cdata of region_data[region]){
                //     showPath2( cdata.series, cdata.country)
                // }
            }
        }
    }
    updateXAxis(updateYAxis(drawNewLines))
}
function playRegionsChart(attr, regionCodes){
    console.log("Adding: "+attr+", regionCode: "+regionCodes)
    // var region = codes2region[regionCode]

    function drawNewLines(){
        for(const regionCode of regionCodes){
            var region = codes2region[regionCode]
            if(region){
                var region_data = attribute_region_data[attr]
                animatePath(region_data[region], region)
            }
        }
    }
    updateXAxis(updateYAxis(drawNewLines))
}
function drawChart(){
    svg = d3
        .select("#graph_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Add X axis
    x_scale = d3.scaleTime()
          .domain(d3.extent(years, function(d) { return d; }))
          .range([ 0    , width ]);
    xAxisGroup = svg.append("g")
        .attr("transform", "translate("+0+"," + height + ")")
        .call(d3.axisBottom(x_scale))
        .call(g => g.append("text")
                    .attr("fill", "black")
                    .style("font", "16px times")
                    .attr("transform", "translate("+((width/2))+", "+(margin.bottom-15)+")")
                    .text("Year"));
    
    yAxis = d3.scaleLinear()
        .domain([0, 50])
        .range([ height, margin.top ]);
    yAxisGroup = svg.append("g")
        // .attr("transform", "translate("+margin.left+", 0)")
        .call(d3.axisLeft(yAxis))
        .call(g => g.append("text")
                .attr("fill", "black")
                .style("font", "16px times")
                .attr("text-anchor", "middle")
                .attr("transform", "translate(-"+(margin.left-20)+", "+((height/2))+") rotate(-90)")
                .text(document.getElementById("gindicator").value));

    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);
    
 }
 function removeAllRegions(){
    d3.select("#graph_svg").selectAll(".cpath").remove();
    d3.select("#graph_svg").selectAll(".marker").remove();
    // drawChart()
 }

 function updateGraph(){
    d3.select("#graph_svg").selectAll("*").remove();
    drawChart()
    var selected_region = get_selected_regions()
    for(var i=0;i<selected_region.length;i++){
        selected_region[i] = region2codes[selected_region[i]]
    }
    addRegionsChart(document.getElementById("gindicator").value, selected_region)
 }
 function removeRegion(regionCode){
    var allpaths = d3.selectAll("."+regionCode)
    function deleteEle(){
        allpaths.remove();
    }
    function empty(){}
    function updateAxis(){
        deleteEle()
        updateYAxis(empty)
    }
    allpaths.transition().duration(animationTime).style("opacity",0).on('end', updateAxis )
    
 }

 function play(){
    removeAllRegions()
    var selected_region = get_selected_regions()
    for(var i=0;i<selected_region.length;i++){
        selected_region[i] = region2codes[selected_region[i]]
    }
    playRegionsChart(document.getElementById("gindicator").value, selected_region)
 }

function updateXAxis(callback){
    var valueline = d3.line()
    .x(function(d) { return x_scale(d.Year); })
    .y(function(d) { return y_scale(d.value); });

    x_scale = d3.scaleTime()
          .domain([new Date(slider.getValue()[0]+"-01-01"), new Date (slider.getValue()[1]+"-01-01")])
          .range([ 0    , width ]); 
    d3.selectAll(".copath").transition().duration(rescaleTime).attr('d', d=>{
        return valueline(d.series);
    } )
    var enddate = new Date (slider.getValue()[1]+"-01-01");
    d3.selectAll(".marker").transition().duration(rescaleTime).attr('transform', d=>{
        var x,y;
        d.series.forEach(ele=>{
            if(ele.Year.getTime() == enddate.getTime()){
                x= x_scale(ele.Year);
                y= y_scale(ele.value);
            }
        })
        if(!x){
            x= x_scale(d.series[d.series.length-1].Year);
            y= y_scale(d.series[d.series.length-1].value);
        }
        return "translate("+x+","+y+")";
    })
    xAxisGroup.transition().duration(rescaleTime).call(d3.axisBottom().scale(x_scale)).on('end', callback);
}