var animationLock = false;
var currentDepth = 0;

//lock for animations
function acquire() {
    if (animationLock == false) {
        animationLock = true;
        return true;
    } else {
        return false;
    }
}

function release() {
    animationLock = false;
}

//https://codepen.io/osublake/pen/vdzjyg (making blobs with d3)
function getBlobPath(options) {
    var points = [];
    var slice = (Math.PI * 2) / options.numPoints;
    var startAngle = Math.random() * Math.PI * 2;

    for (var i = 0; i < options.numPoints; i++) {
        var angle = startAngle + i * slice;
        var radius = options.minRadius + Math.random() * (options.maxRadius - options.minRadius)
        var point = {
            x: options.centerX + Math.cos(angle) * radius,
            y: options.centerY + Math.sin(angle) * radius
        };
        points.push(point);
    }
    options.points = points;
    return cardinal(points, true, 1);
}

// Cardinal spline - a uniform Catmull-Rom spline with a tension option
function cardinal(data, closed, tension) {
    if (data.length < 1) return "M0 0";
    if (tension == null) tension = 1;
    var size = data.length - (closed ? 0 : 1);
    var path = "M" + data[0].x + " " + data[0].y + " C";
    for (var i = 0; i < size; i++) {
        var p0, p1, p2, p3;
        if (closed) {
            p0 = data[(i - 1 + size) % size];
            p1 = data[i];
            p2 = data[(i + 1) % size];
            p3 = data[(i + 2) % size];
        } else {
            p0 = i == 0 ? data[0] : data[i - 1];
            p1 = data[i];
            p2 = data[i + 1];
            p3 = i == size - 1 ? p2 : data[i + 2];
        }
        var x1 = p1.x + (p2.x - p0.x) / 6 * tension;
        var y1 = p1.y + (p2.y - p0.y) / 6 * tension;
        var x2 = p2.x - (p3.x - p1.x) / 6 * tension;
        var y2 = p2.y - (p3.y - p1.y) / 6 * tension;
        path += " " + x1 + " " + y1 + " " + x2 + " " + y2 + " " + p2.x + " " + p2.y;
    }
    return closed ? path + "z" : path;
}

let nodes = [{
        "key": "",
        "id": "Mind Map",
        "url": "Mind_Map",
        "brush": "silver",
        "txtcolor": "black",
    },
    {
        "key": 1,
        "parent": 0,
        "id": "Heart",
        "url": "Getting_more_time",
        "brush": "blue",
        "txtcolor": "white",
    },
    {
        "key": 11,
        "parent": 1,
        "id": "Wake up early",
        "url": "Wake_up_early",
        "brush": "blue",
        "txtcolor": "white",
    },
    {
        "key": 12,
        "parent": 1,
        "id": "Delegate",
        "url": "Delegate",
        "brush": "blue",
        "txtcolor": "white",
    },
    {
        "key": 13,
        "parent": 1,
        "id": "Simplify",
        "url": "Simplify",
        "brush": "blue",
        "txtcolor": "white",
    },
    {
        "key": 2,
        "parent": 0,
        "id": "Mind",
        "url": "More_effective_use",
        "brush": "indigo",
        "txtcolor": "white",
    },
    {
        "key": 21,
        "parent": 2,
        "id": "Planning",
        "url": "Planning",
        "brush": "indigo",
        "txtcolor": "white",
    },
    {
        "key": 211,
        "parent": 21,
        "id": "Priorities",
        "url": "Priorities",
        "brush": "indigo",
        "txtcolor": "white",
    },
    {
        "key": 212,
        "parent": 21,
        "id": "Ways to focus",
        "url": "Ways_to_focus",
        "brush": "indigo",
        "txtcolor": "white",
    },
    {
        "key": 22,
        "parent": 2,
        "id": "Goals",
        "url": "Goals",
        "brush": "indigo",
        "txtcolor": "white",
    },
    {
        "key": 3,
        "parent": 0,
        "id": "Soul",
        "url": "Time_wasting",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 31,
        "parent": 3,
        "id": "Too many meetings",
        "url": "Too_many_meetings",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 32,
        "parent": 3,
        "id": "Too much time spent on details",
        "url": "Too_much_time_spent_on_details",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 33,
        "parent": 3,
        "id": "Message fatigue",
        "url": "Message_fatigue",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 331,
        "parent": 31,
        "id": "Check messages less",
        "url": "Check_messages_less",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 332,
        "parent": 31,
        "id": "Message filters",
        "url": "Message_filters",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 341,
        "parent": 32,
        "id": "AAA",
        "url": "AAA",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 350,
        "parent": 33,
        "id": "BBB",
        "url": "BBB",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 351,
        "parent": 33,
        "id": "CCC",
        "url": "CCC",
        "brush": "deeppink",
        "txtcolor": "white",
    },
    {
        "key": 352,
        "parent": 33,
        "id": "DDD",
        "url": "DDD",
        "brush": "deeppink",
        "txtcolor": "white",
    },
];

//some preprocessing
nodes.forEach((d) => d.depth = d.key.toString().length);

let links = [];
nodes.forEach(function (d) {
    if (d.hasOwnProperty('parent')) {
        links.push({
            "source": nodes.find((x) => x.key == d.parent).id,
            "target": d.id,
        });
    }
});

var width = window.innerWidth,
    height = window.innerHeight;
var svg = d3.select("body").append("svg").attr("width", width).attr("height", height);
var background = svg.append("rect")
    .attr("id", "back")
    .attr("width", width)
    .attr("height", height)
    .attr("stroke", "black")
    .style("opacity", 0.5)
    .attr("fill", "white");
var zoomable_layer = svg.append("g");
var offsetX, offsetY, zoomLevel;

var maxNodeSize = 120;

var widthScale = d3.scaleLinear().domain([0, 5]).range([maxNodeSize, maxNodeSize / 5]);

var overlay;

//define forces
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id((d) => d.id)
        .strength(1)
        .distance((d) => 30)
    )
    .force("charge", d3.forceManyBody().strength(-6000))
    .force("centerX", d3.forceX(width / 2)
        .strength((d) => (d.hasOwnProperty('parent')) ? 0.1 : 1)
    )
    .force("centerY", d3.forceY(height / 2)
        .strength((d) => (d.hasOwnProperty('parent')) ? 0.1 : 1)
    )
    .force("collide", d3.forceCollide()
        .radius((d) => 5 + widthScale(d.depth))
    )
    .stop();

//create nodes and links
var link = zoomable_layer.append("g")
    .selectAll("line")
    .data(links)
    .enter().append("line")
    .attr("stroke", "silver")
    .attr("class", "links")
    .attr("stroke-width", 0);

var node = zoomable_layer.append("g")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", "nodes")
    .attr("id", (d) => d.url);

var blobs = node.append("path")
    .attr("fill", (d) => d.brush)
    .attr("d", (d) => getBlobPath({
        numPoints: 10,
        centerX: 0,
        centerY: 0,
        minRadius: widthScale(d.depth) * 0.75,
        maxRadius: widthScale(d.depth) * 1,
    }))
    .attr("stroke", (d) => d.brush)
    .attr("class", "pulse");

var labels = node.append("text")
    .text((d) => d.id)
    .attr('text-anchor', "middle")
    .attr('x', 0)
    .attr('y', 0)
    .attr("fill", (d) => d.hasOwnProperty("txtcolor") ? d.txtcolor : "black")
    .style("opacity", (d) => Math.abs(d.depth - currentDepth) > 1.5 ? 0 : 0.8);

//set up simlation
simulation.nodes(nodes);
simulation.force("link")
    .links(links);

for (var i = 0; i < 600; ++i) simulation.tick();
//place nodes and links in final positions
link.attr("x1", function (d) {
        return d.source.x;
    })
    .attr("y1", function (d) {
        return d.source.y;
    })
    .attr("x2", function (d) {
        return d.target.x;
    })
    .attr("y2", function (d) {
        return d.target.y;
    });

node.attr("transform", function (d) {
    return "translate(" + d.x + "," + d.y + ")";
});

//event handlers
node.on('click', nodeClick);
background.on("click", backgroundClick);

function nodeClick(d) {
    if (acquire()) {
        if (typeof overlay != "undefined"){
            overlay.remove();
        }
        d3.selectAll(".nodes").classed("hidden", false);
        d3.event.stopPropagation();
        var x = d.x,
            y = d.y,
            k = maxNodeSize / widthScale(d.depth) * 2;
        if (d.depth == 0) {
            k = 1;
        }
        if (d.depth >= 2) {
            d3.select("#" + d.url).classed("hidden", true);
        }
        currentDepth = d.depth;

        labels.transition()
            .duration(500).style("opacity", (d) => Math.abs(d.depth - currentDepth) > 1.5 ? 0 : 0.8);

        zoomable_layer.transition()
            .duration(1000)
            .style("transform", "matrix(" + k + ",0,0," + k + "," + (-x * (k - 1) + (width / 2 - x)) + "," + (-y * (k - 1) + (height / 2 - y)) + ")");

        background.transition()
            .duration(1000)
            .attr("fill", d.brush);
        setTimeout(release, 1000);
    }
}

function backgroundClick() {
    if (acquire()) {
        if (typeof overlay != "undefined"){
            overlay.remove();
        }
        var x = width / 2,
            y = height / 2,
            k = 0.5;
        d3.selectAll(".nodes").classed("hidden", false);
        currentDepth = 0;
        labels.transition()
            .duration(500).style("opacity", (d) => Math.abs(d.depth - currentDepth) > 1.5 ? 0 : 0.8);
        zoomable_layer.transition()
            .duration(1000)
            .style("transform", "matrix(" + k + ",0,0," + k + "," + (-x) * (k - 1) + "," + (-y) * (k - 1) + ")");
        background.transition()
            .duration(1000)
            .attr("fill", "white");
        setTimeout(release, 1000);
    }
}

//allow zooming to specific nodes with # in the URL
let url = window.location.href;
if (url.lastIndexOf("#") >= 0) {
    let element_id = url.substring(url.lastIndexOf('#'));
    d3.select(element_id).dispatch('click');
}