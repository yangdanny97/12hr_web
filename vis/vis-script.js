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
        "id": "Wisdom",
        "url": "Wisdom",
        "brush": "whitesmoke",
        "background":"white",
        "txtcolor": "black",
    },
    {
        "key": 1,
        "parent": 0,
        "id": "Heart",
        "url": "Heart",
        "brush": "#FF9A3A",
        "background":"#FFE9DE",
        "txtcolor": "white",
    },
    {
        "key": 11,
        "parent": 1,
        "id": "Romance",
        "url": "Romance",
        "brush": "#FFFC33",
        "background":"#FFE9DE",
        "txtcolor": "black",
    },
    {
        "key": 12,
        "parent": 1,
        "id": "Family",
        "url": "Family",
        "brush": "#FF7141",
        "background":"#FFE9DE",
        "txtcolor": "black",
    },
    {
        "key": 13,
        "parent": 1,
        "id": "Friends",
        "url": "Friends",
        "brush": "#FFD33C",
        "background":"#FFE9DE",
        "txtcolor": "black",
    },
    {
        "key": 2,
        "parent": 0,
        "id": "Mind",
        "url": "Mind",
        "brush": "#150E7E",
        "background":"#E4FAFF",
        "txtcolor": "white",
    },
    {
        "key": 21,
        "parent": 2,
        "id": "Learning",
        "url": "Learning",
        "brush": "#7E9AFF",
        "background":"#E4FAFF",
        "txtcolor": "black",
    },
    {
        "key": 22,
        "parent": 2,
        "id": "Bias",
        "url": "Bias",
        "brush": "#8CE3F3",
        "background":"#E4FAFF",
        "txtcolor": "black",
    },
    {
        "key": 23,
        "parent": 2,
        "id": "Thinking",
        "url": "Thinking",
        "brush": "#FFFC33",
        "background":"#E4FAFF",
        "txtcolor": "black",
    },
    {
        "key": 3,
        "parent": 0,
        "id": "Soul",
        "url": "Soul",
        "brush": "#59B371",
        "background":"#DFFFDC",
        "txtcolor": "white",
    },
    {
        "key": 31,
        "parent": 3,
        "id": "Purpose",
        "url": "Purpose",
        "brush": "#FFFC33",
        "background":"#DFFFDC",
        "txtcolor": "black",
    },
    {
        "key": 32,
        "parent": 3,
        "id": "Wellbeing",
        "url": "Wellbeing",
        "brush": "#5BDD5B",
        "background":"#DFFFDC",
        "txtcolor": "black",
    },
    {
        "key": 33,
        "parent": 3,
        "id": "Lorem",
        "url": "Lorem",
        "brush": "#B3DC4E",
        "background":"#DFFFDC",
        "txtcolor": "black",
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
    height = window.innerHeight * 0.9;
var svg = d3.select("#vis").attr("width", width).attr("height", height);
var background = svg.append("rect")
    .attr("id", "back")
    .attr("width", width)
    .attr("height", height)
    .attr("stroke", "black")
    .style("opacity", 0.5)
    .attr("fill", "white");
var zoomable_layer = svg.append("g");
var offsetX, offsetY, zoomLevel;

var maxNodeSize = 180;

var widthScale = d3.scaleLinear().domain([0, 3]).range([maxNodeSize, maxNodeSize / 4]);

var selected; 
//define forces
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id((d) => d.id)
        .strength(1)
        .distance(0)
    )
    .force("charge", d3.forceManyBody().strength(-10000))
    .force("centerX", d3.forceX(width / 2)
        .strength((d) => (d.hasOwnProperty('parent')) ? 0.1 : 1)
    )
    .force("centerY", d3.forceY(height / 2)
        .strength((d) => (d.hasOwnProperty('parent')) ? 0.1 : 1)
    )
    .force("collide", d3.forceCollide()
        .radius((d) => widthScale(d.depth))
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
    .attr("font-size", "25px")
    .attr("fill", (d) => d.hasOwnProperty("txtcolor") ? d.txtcolor : "black")
    .style("opacity", (d) => Math.abs(d.depth - currentDepth) > 2.5 ? 0 : 0.8);

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
    node.classed("hidden", false);
    labels.classed("hidden", false);
    d3.selectAll(".overlay").remove();
    node.transition().duration(500)
    .attr("transform", function (d) {
        return "translate(" + d.x + "," + d.y + ")";
    });
}

function nodeClick(d) {
    if (selected != d.url){
        if (acquire()) {
            removeOverlay();
            d3.event.stopPropagation();
            var x = d.x,
                y = d.y,
                k = maxNodeSize / widthScale(d.depth) * 1.5, 
                currentDepth = d.depth;
            if (d.depth == 0) {
                k = 1;
            }
            else { //deeper nodes get clicked cause graph to fade out and create overlay
                setTimeout(() => createOverlay(d, k, x, y), 1000);
                labels.transition()
                .duration(500).style("opacity", (d) => d.depth == currentDepth ? 0.8 : 0);
            }
    
            zoomable_layer.transition()
                .duration(1000)
                .style("transform", "matrix(" + k + ",0,0," + k + "," + (-x * (k - 1) + (width / 2 - x)) + "," + (-y * (k - 1) + (height / 2 - y)) + ")");
    
            background.transition()
                .duration(1000)
                .attr("fill", d.brush);
            setTimeout(release, 2500);
            selected = d.url;
        }
    }
}

function backgroundClick() {
    if (acquire()) {
        removeOverlay();
        var x = width / 2,
            y = height / 2,
            k = 0.5;
        d3.selectAll(".nodes").classed("hidden", false);
        currentDepth = 0;
        labels.transition()
            .duration(500).style("opacity", (d) => Math.abs(d.depth - currentDepth) > 2.5 ? 0 : 0.8);
        zoomable_layer.transition()
            .duration(1000)
            .style("transform", "matrix(" + k + ",0,0," + k + "," + (-x) * (k - 1) + "," + (-y) * (k - 1) + ")");
        background.transition()
            .duration(1000)
            .attr("fill", "white");
        setTimeout(release, 1000);
        selected = "";
    }
}

function createOverlay(d, k){
    node.classed("hidden", true);
    d3.select("#" + d.url).classed("hidden", false);
    //Links: source is always the parent, target is always the child
    var parentLinks = links.filter((l) => l.target.id == d.id);
    var childrenLinks = links.filter((l) => l.source.id == d.id);
    var siblings = nodes.filter((n) => n.id != d.id && d.hasOwnProperty("parent") && n.parent == d.parent);
    if (parentLinks.length > 0){ //node has parent
        var parentLink = parentLinks[0];

        //TODO - adjust this number according to parent node size;
        var pos = calculateOverlayPosition(parentLink.target, parentLink.source, k, (d.depth == 1) ? 1.1 : 1.2);
        var parentNode = d3.select("#" + parentLink.source.url);
        parentNode.classed("hidden", false);
        parentNode.transition().duration(1000)
        .attr("transform", function (d) {
            return "translate(" + (pos[0] + parentLink.source.x)+ "," + (pos[1] + parentLink.source.y) + ")";
        });
        setTimeout(() => {
            var labelpos = calculateOverlayPositionAbsolute(parentLink.target, parentLink.source, 0.9);
            drawOverlabel(parentLink.source, labelpos);
        }, 500);
        
    }

    if (childrenLinks.length > 0){ //node has children
        childrenLinks.forEach((l) => {
            var pos = calculateOverlayPosition(l.source, l.target, k, 1);
            var childNode = d3.select("#" + l.target.url);
            childNode.classed("hidden", false);
            childNode.transition().duration(1000)
            .attr("transform", function (d) {
                return "translate(" + (pos[0] + l.target.x) + "," + (pos[1] + l.target.y) + ")";
            });
            setTimeout(() => {
                var labelpos = calculateOverlayPositionAbsolute(l.source,l.target, 0.9);
                drawOverlabel(l.target, labelpos);
            }, 500);
        });
    }

    if (siblings.length > 0 && node.depth > 1){//node has siblings
        siblings.forEach((s) => {
            var siblingNode = d3.select("#" + s.url);
            setTimeout(() => {
                var labelpos = calculateOverlayPositionAbsolute(d, s, 0.8);
                var labelpos_ = calculateOverlayPositionAbsolute(d, s, 0.9);
                var overlay = svg.append("line")
                    .attr("x1",labelpos[0])  
                    .attr("y1",labelpos[1])  
                    .attr("x2",labelpos_[0])  
                    .attr("y2",labelpos_[1]) 
                    .attr("class", "overlay") 
                    .attr("stroke","gray")  
                    .attr("stroke-width", 8)  
                    .attr("marker-end","url(#arrow)")
                    .on("click", () => siblingNode.dispatch('click'));
                overlay.transition().duration(500)
                .style("opacity", 1);
            }, 500);
        });
    }
}

function drawOverlabel(node, position){
    var overlabel = svg.append("text")
    .text(node.id)
    .attr('text-anchor', "middle")
    .attr('x', position[0])
    .attr('y', position[1])
    .attr("font-size", 24)
    .attr("fill", node.hasOwnProperty("txtcolor") ? node.txtcolor : "black")
    .style("opacity", 0)
    .attr("class","overlay");
    overlabel.transition().duration(500)
    .style("opacity", 1);
    return overlabel;
}

//calculate the position of node B preserving relative positioning
//assuming that node A is the center of the chart and B is centered on an edge
function calculateOverlayPosition(a, b, k, m){
    var ax = a.x, ay = a.y, bx = b.x, by = b.y;
    var diffx = bx - ax, diffy = by - ay;
    var scalingRatio = width/2/k / Math.abs(diffx);
    if (scalingRatio * Math.abs(diffy) > height/2/k) {
        scalingRatio = height/2/k / Math.abs(diffy);
    }
    scalingRatio = scalingRatio * m;
    var posx = (scalingRatio * diffx) - diffx,
    posy = (scalingRatio * diffy) * 1.25 - diffy; //force larger offset in y direction to reduce overlap
    return [posx, posy];
}

function calculateOverlayPositionAbsolute(a, b, r){
    //smaller r means closer to center
    var ax = a.x, ay = a.y, bx = b.x, by = b.y;
    var diffx = bx - ax, diffy = by - ay;
    var scalingRatio = width/2 / Math.abs(diffx);
    if (scalingRatio * Math.abs(diffy) > height/2) {
        scalingRatio = height/2 / Math.abs(diffy);
    }
    var posx = (scalingRatio * diffx) * r + width/2,
    posy = (scalingRatio * diffy) * r + height/2;
    return [posx, posy];
}

//allow zooming to specific nodes with # in the URL
let url = window.location.href;
if (url.lastIndexOf("#") >= 0) {
    let element_id = url.substring(url.lastIndexOf('#'));
    d3.select(element_id).dispatch('click');
} else {
    backgroundClick();
}