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
    var startAngle = 0;

    for (var i = 0; i < options.numPoints; i++) {
        var angle = startAngle + i * slice;
        var minradius = Math.sqrt(Math.pow(options.xradius,2) * Math.pow(Math.cos(angle),2) + Math.pow(options.yradius,2) * Math.pow(Math.sin(angle),2));
        var radius = minradius * 0.8 + Math.random() * (minradius* 0.1);
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
        numPoints: 12,
        centerX: 0,
        centerY: 0,
        xradius: widthScale(d.depth),
        yradius: widthScale(d.depth),
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

function removeOverlay(){
    // if (typeof overlay != "undefined") {
    //     overlay.remove();
    //     overlay = undefined;
    // }
    if (typeof overlay != "undefined"){
        overlay.transition().duration(1000).style("opacity",0);
        setTimeout(() => {
            overlay.remove();
            overlay = undefined;
        }, 1000);
        return 1000;
    }
    return 0;
}

function nodeClick(d) {
    console.log("a");
    if (acquire()) {
        var time = removeOverlay();
        console.log(time);
        d3.selectAll(".nodes").classed("hidden", false);
        d3.event.stopPropagation();
        var x = d.x,
            y = d.y,
            k = maxNodeSize / widthScale(d.depth) * 2;
        setTimeout(() => {
            if (d.depth == 0) {
                k = 1;
            }
            else { //deeper nodes get clicked cause graph to fade out and create overlay
                d3.selectAll(".nodes").classed("hidden", true);
                setTimeout(() => createOverlay(d), time + 100);
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
        }, time)
        setTimeout(release, time + 1000);
    }
}

function backgroundClick() {
    console.log("b");
    if (acquire()) {
        var time = removeOverlay();
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
        setTimeout(release, time + 1000);
    }
}

function createOverlay(node){
    //Links: source is always the parent, target is always the child
    var parentLinks = links.filter((l) => l.target.id == node.id);
    var childrenLinks = links.filter((l) => l.source.id == node.id);
    var siblings = nodes.filter((n) => n.id != node.id && node.hasOwnProperty("parent") && n.parent == node.parent);

    overlay = svg.append("g");

    var overlay_bg1 = overlay.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", "white")
    .style("opacity", 0)
    var overlay_bg2 = overlay.append("rect")
    .attr("width", width)
    .attr("height", height)
    .attr("fill", node.brush)
    .style("opacity", 0)
    .on("click", backgroundClick);

    overlay_bg1.transition()
    .duration(1000)
    .style("opacity", 1);
    overlay_bg2.transition()
    .duration(1000)
    .style("opacity", 0.5);

    //draw node
    if (node.depth <= 1){
        var ngroup = overlay.append("g");
        var nnode = ngroup.append("path")
        .attr("fill", node.brush)
        .attr("d", getBlobPath({
            numPoints: 15,
            centerX: width/2,
            centerY: height/2,
            xradius: height * 0.25,
            yradius: height * 0.25,
        })).style("opacity", 0);
        var nlabel = ngroup.append("text")
        .text(node.id)
        .attr('text-anchor', "middle")
        .attr('x', width/2)
        .attr('y', height/2)
        .attr("font-size", "48px")
        .attr("fill", node.hasOwnProperty("txtcolor") ? node.txtcolor : "black")
        .style("opacity", 0);
        nnode.transition().duration(1000).style("opacity", 0.8);
        nlabel.transition().duration(1000).style("opacity", 0.8);
        ngroup.on("click", () => d3.event.stopPropagation());
    } else {
        var drawing = overlay.append("rect")
        .attr("x", width*0.2).attr("y", height*0.2)
        .attr("width", width*0.6).attr("height", height*0.6)
        .attr("fill", "silver")
        .style("opacity", 0);
        drawing.transition().duration(1000).style("opacity", 0.75);
        drawing.on("click", () => d3.event.stopPropagation());
    }

    if (parentLinks.length > 0){ //node has parent
        var parentLink = parentLinks[0];
        var ppos = calculateOverlayPosition(parentLink.target, parentLink.source);
        var pgroup = overlay.append("g");
        var pnode = pgroup.append("path")
        .attr("fill", parentLink.source.brush)
        .attr("d", getBlobPath({
            numPoints: 15,
            centerX: ppos[0],
            centerY: ppos[1],
            xradius: height * 0.3,
            yradius: height * 0.2
        }))
        .attr("stroke", parentLink.source.brush)
        .attr("class", "pulse")
        .style("opacity", 0);

        var plabel = pgroup.append("text")
        .text(parentLink.source.id)
        .attr('text-anchor', "middle")
        .attr('x', ppos[0] + (width/2 - ppos[0]) * 0.1)
        .attr('y', ppos[1] + (height/2 - ppos[1]) * 0.2)
        .attr("font-size", "24px")
        .attr("fill", parentLink.source.hasOwnProperty("txtcolor") ? parentLink.source.txtcolor : "black")
        .style("opacity", 0);

        pnode.transition().duration(1000).style("opacity", 1);
        plabel.transition().duration(1000).style("opacity", 1);
        pgroup.on("click", () => d3.select("#" + parentLink.source.url).dispatch('click'));
    }

    if (childrenLinks.length > 0){ //node has children
        childrenLinks.forEach((l) => {
            var cpos = calculateOverlayPosition(l.source, l.target);
            var cgroup = overlay.append("g");

            var cnode = cgroup.append("path")
            .attr("fill", l.target.brush)
            .attr("d", getBlobPath({
                numPoints: 15,
                centerX: cpos[0],
                centerY: cpos[1],
                xradius: height * 0.3,
                yradius: height * 0.2
            }))
            .attr("stroke", l.target.brush)
            .attr("class", "pulse")
            .style("opacity", 0);

            var clabel = cgroup.append("text")
            .text(l.target.id)
            .attr('text-anchor', "middle")
            .attr('x', cpos[0] + (width/2 - cpos[0]) * 0.1)
            .attr('y', cpos[1] + (height/2 - cpos[1]) * 0.2)
            .attr("font-size", "24px")
            .attr("fill", l.target.hasOwnProperty("txtcolor") ? l.target.txtcolor : "black")
            .style("opacity", 0);

            cnode.transition().duration(1000).style("opacity", 1);
            clabel.transition().duration(1000).style("opacity", 1);
            cgroup.on("click", () => d3.select("#" + l.target.url).dispatch('click'));
        })
    }

    if (siblings.length > 0){//node has siblings
        console.log(siblings);
    }

    overlay.on("click", () => overlay.transition().duration(1000).style("opacity", 0));
}

//calculate the position of node B preserving relative positioning
//assuming that node A is the center of the chart and B is centered on an edge
function calculateOverlayPosition(a, b){
    var ax = a.x, ay = a.y, bx = b.x, by = b.y;
    var diffx = bx - ax, diffy = by - ay;
    var scalingRatio = width/2 / Math.abs(diffx);
    if (scalingRatio * Math.abs(diffy) > height/2) {
        scalingRatio = height/2 / Math.abs(diffy);
    }
    return [width/2 + scalingRatio * diffx, height/2 + scalingRatio * diffy];
}

//allow zooming to specific nodes with # in the URL
let url = window.location.href;
if (url.lastIndexOf("#") >= 0) {
    let element_id = url.substring(url.lastIndexOf('#'));
    d3.select(element_id).dispatch('click');
}