console.log('hello world!')

var margin = {
	top: 40,
	right: 50,
	bottom: 70,
	left: 50
};

// setting up our own abbreviated names for days of week
var days = ['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat', 'Sun'];
// ranges gives back an array with 24 elements (0-23)
var times = d3.range(24)

// why -20?
var width = 750 - margin.left - margin.right - 20,
// set size for each rectangle
	gridSize = Math.floor(width / times.length),
	// +2 gives a buffer so we have room for our legend
	height = gridSize * (days.length + 2),
	legendWidth = Math.floor(width * 0.6),
	legendHeight = 10;

// title for the chart
var chartTitle = d3.select('body')
	.append('h3')
	.style('color', '#333')
	.text('New York City Vehicle Collision Injuries 2016');

// SVG Container
var svg = d3.select('body')
	.append('svg')
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)

// main group element
var g = svg.append('g')
	.classed('main-group', true)
	.attr('transform', `translate(${margin.left}, ${margin.top})`);

// color scale
// ordinal scales: assign unique color for unique things
// linear scales: assign color to values
// d3 scale chromatic: not in the original d3 (have to write a script for it)
// look in index.html
// colorbrewer: go to look at different color scales
var color = d3.scaleLinear()
	.range(d3.schemeRdPu[3])		// default RGB color space	// use [3] too access the correct array
	.interpolate(d3.interpolateHcl);

var defs = svg.append('defs');

var linearGradient = defs.append('linearGradient')
	// ids are different because they're unique
	// classes are able to be used for multiple things
	.attr('id', 'linear-gradient');

linearGradient
	.attr('x1', '0%')
	.attr('y1', '0%')
	.attr('x2', '100%')
	.attr('y2', '0%');

// easier to use d3 than to write hexcode for all colors
linearGradient.selectAll('stop')
	.data(color.range())
	.enter().append('stop')
	.attr('offset', function(d, i) { return i / (color.range().length - 1); })		// remember: order of operations
	.attr('stop-color', function(d) { return d; });		// return d (our xCode)

// legendContained is a SVG group element
var legendContainer = g.append('g')
	.classed('legend', true)
	.attr('transform', `translate(${legendWidth/4}, ${height})`);

legendContainer.append('rect')
	.attr('width', legendWidth)
	.attr('height', legendHeight)
	.style('fill', 'url(#linear-gradient)');		

// legend title
legendContainer.append('text')
	.classed('legend-title', true)
	.attr('x', legendWidth / 3)
	.attr('y', -5)
	.text('Number of Persons Injured');

// day labels
var dayLabels = g.selectAll('.dayLabel')
	.data(days)
	.enter().append('text')
	.text(function(d) { return d; })
	.classed('dayLabel', true)
	.attr('x', 0)
	.attr('y', function(d, i) { return i * gridSize; })
	.style('text-anchor', 'middle')		// you can do this in css too
	.attr('transform', `translate(-25, ${gridSize / 1.5})`);

// time labels
var timeLabels = g.selectAll('timeLabel')
	.data(times)
	.enter().append('text')
	.text(function(d) { return d; })
	.classed('timeLabel', true)
	.attr('x', function(d, i) { return i * gridSize; })
	.attr('y', 0)
	.style('text-anchor', 'middle')
	.attr('transform', `translate(${gridSize / 2}, -6)`);

// load data
d3.csv('data/nyc_collisions.csv', function(error, data) {
	if (error) throw error;

	data.forEach(function(d){
		// can use parseInt, but this is easier
		d.day = +d.day;
		d.hour = +d.hour;
		d.total_injured = +d.total_injured;
	});

	console.log(data);

	// max person injured per given cell
	var maxInjured = d3.max(data, function(d) {
		return d.total_injured;
	});

	// set color scale
	// each corresponds to the three colors chosen from color scale
	color.domain([
		0,
		maxInjured / 2,
		maxInjured
	]);

	// make grid
	g.selectAll('.hour')
		.data(data)
		.enter().append('rect')
		.attr('x', function(d) { return d.hour * gridSize })
		.attr('y', function(d) { return (d.day - 1) * gridSize })
		.classed('hour bordered', true)
		.attr('width', gridSize)
		.attr('height', gridSize)
		.style('stroke', '#fff')
		.style('stroke-opacity', 0.6)
		.style('fill', function(d) { return color(d.total_injured); });

	// add scale
	var xScale = d3.scaleLinear()
		.range([0, legendWidth])
		.domain([0, maxInjured]);

	// did this manually so we get the last value
	var xAxis = d3.axisBottom(xScale)
		.tickValues([0, 100, 200, 300, 400, 500, 600, maxInjured]);

	legendContainer.append('g')
		.classed('no-axis', true)
		.attr('transform', `translate(0, ${legendHeight})`)
		.call(xAxis);


//	debugger;
// helpful when trying to debug while using async
// or you could use breakpoints on server
	
});