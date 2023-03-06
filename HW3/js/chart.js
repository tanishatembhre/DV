const vowel = new Set(['a', 'e', 'i', 'o', 'u', 'y'])
const consonant = new Set(['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z'])
const punctuations = new Set(['.', ',', '?', '!', ':', ';'])
const typedict = { 'vowels': vowel, 'consonants': consonant, 'punctuations': punctuations }
const allchar = new Set([...consonant, ...punctuations, ...vowel]);

// Building a dictionary for characters and their counts
function buildCharDict(text) {
	text = text.toLowerCase()
	chardict = {}
	for (let i = 0; i < text.length; i++) {
		if (allchar.has(text[i])) {
			if (text[i] in chardict) {
				chardict[text[i]] += 1;
			} else {
				chardict[text[i]] = 1;
			}
		}
	}
	return chardict;
}

// Bulding donut chart
function drawDonut(chardict) {
	var donutdict = { 'consonants': 0, 'vowels': 0, 'punctuations': 0 }
	for (var key in chardict) {
		if (vowel.has(key)) {
			donutdict['vowels'] = donutdict['vowels'] + chardict[key]
		} else if (consonant.has(key)) {
			donutdict['consonants'] = donutdict['consonants'] + chardict[key]
		} else if (punctuations.has(key)) {
			donutdict['punctuations'] = donutdict['punctuations'] + chardict[key]
		}
	}

	// Getting dimensions of bounding pie_div
	const divdim = document.getElementById('pie_div').getBoundingClientRect()
	const margin = 40;
	const width = divdim.width - margin,
		height = divdim.height - margin

	// radius of donut chart
	const radius = Math.min(width, height) / 2

	// set height and width of svg
	const svg = d3.select("#pie_svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", `translate(${width / 2},${height / 2})`);

	// Append text tag
	svg.append("text")
		.attr("text-anchor", "middle")
		.text("");

	// set the color scale
	const color = d3.scaleOrdinal()
		.domain(Object.keys(donutdict))
		.range(d3.schemeSet3);

	const pie = d3.pie()
		.sort(null)
		.value(d => d[1])
	const data_ready = pie(Object.entries(donutdict))

	// Generating arc
	const arc = d3.arc()
		.innerRadius(radius * 0.5)
		.outerRadius(radius * 0.8)

	var g = svg.selectAll(".arc")
		.data(data_ready)
		.enter()
		.append("g")
		.attr("class", "arc");

	// Building the donut chart
	g.append("path")
		.attr('d', arc)
		.attr('fill', d => color(d.data[1]))
		.attr("stroke", "black")
		.style("stroke-width", "1px")
		.style("opacity", 1.0)
		.on('mouseover', function (d, i) {

			d3.select(this).style("stroke-width", "4px");
			svg.select("text")
				.text(i.data[0] + ": " + i.data[1]);
		})
		.on('mouseout', function () {
			d3.select(this)
				.style("stroke-width", "1px");
			d3.select("text")
				.text("");
		})
		.on("click", function (d, i) {
			drawBarGraph(chardict, i.data[0], d3.select(this).attr("fill"));
			var barText = document.getElementById('character-name');
			// Dynamically changing bar chart heading - extra credit
			barText.innerHTML = "in " + i.data[0]
		});

}

// Drawing bar chart
function drawBarGraph(chardict, bartype, color) {

	var data_dict = {}
	typedict[bartype].forEach((value) => {
		if (value in chardict) {
			data_dict[value] = chardict[value]
		} else {
			data_dict[value] = 0
		}
	})

	const divdim = document.getElementById('bar_div').getBoundingClientRect()

	var margin = { top: 10, right: 30, bottom: 80, left: 40 }
	const width = divdim.width - margin.left - margin.right,
		height = divdim.height - margin.top - margin.bottom;

	// remove previous barplot
	d3.select("#bar_svg").selectAll("*").remove();

	var svg = d3.select("#bar_svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scaleBand()
		.range([0, width])
		.domain(Object.keys(data_dict))
		.padding(0.2);

	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x))
		.selectAll("text")
		.style("text-anchor", "end");

	var y = d3.scaleLinear()
		.domain([0, Math.max(...Object.values(data_dict))])
		.range([height, 0]);


	// Creating a tooltip
	var tooltip = d3.select("#bar_div")
		.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")

	// Functions to change the tooltip when user hovers / moves / leaves a bar
	var mouseover = function (d, i) {
		tooltip
			.html("Character: " + i[0] + "<br>" + "Count: " + i[1])
			.style("opacity", 1)
	}
	const mousemove = function (event, d) {
		tooltip
			.style("left", (event.pageX + 5) + "px")
			.style("top", (event.pageY - 40) + "px")
	}
	const mouseleave = function (event, d) {
		tooltip
			.style("opacity", 0)
	}

	svg.append("g")
		.call(d3.axisLeft(y));

	svg.selectAll("mybar")
		.data(Object.entries(data_dict))
		.join("rect")
		.attr("x", function (d) { console.log("s", d); return x(d[0]); })
		.attr("width", x.bandwidth())
		.attr("fill", color)
		.attr("stroke", "black")
		.style("border", "solid")
		.style("border-width", "1px")
		// no bar at the beginning thus:
		.attr("height", function (d) { return height - y(d[1]); }) // always equal to 0
		.attr("y", function (d) { return y(d[1]); })
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave)
}

// Function called when user clicks submit button
function submitText() {
	var text = document.getElementById('wordbox').value;
	var chardict = buildCharDict(text);
	var barText = document.getElementById('character-name');
	barText.innerHTML = ""
	// clear all previous graphs
	d3.select("#pie_svg").selectAll("*").remove();
	d3.select("#bar_svg").selectAll("*").remove();
	if (Object.keys(chardict).length !== 0) {
		drawDonut(chardict);
	}
}