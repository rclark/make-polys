// Make a map
var mapboxAttr = "Basemap design © <a href='http://mapbox.com/about/maps'>MapBox</a> — Basemap data © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap contributors</a>"

var map = new L.Map("map", {
    center: new L.LatLng(32.185, -110.432),
    zoom: 12,
    layers: [ L.tileLayer("http://{s}.tiles.mapbox.com/v3/rclark.map-lgs3w52k/{z}/{x}/{y}.png", { attribution: mapboxAttr }) ],    
});

// Override default Leaflet.draw tooltips
L.drawLocal.draw.simpleshape.tooltip.end = "Release to select some lines";
L.drawLocal.draw.toolbar.polyline = "First step...";

// Add drawing controls
var lineOptions = {
    color: "#221BE0",
    weight: 2,
    opacity: 1
};

var youDrewThese = new L.GeoJSON(null, {
        style: lineOptions
    }),
    drawTool = new L.Control.Draw({
        edit: {
            featureGroup: youDrewThese
        },
        draw: {
            polygon: false,
            circle: false,
            marker: false,
            polyline: {
                title: "Draw some lines",
                shapeOptions: lineOptions
            },
            rectangle: {
                title: "Select some lines",
                shapeOptions: {
                    color: "#000",
                    weight: 5,
                    opacity: 1,
                    fillOpacity: 0,
                    dashArray: "20 20"
                }
            }
        }
    });
map.addLayer(youDrewThese);
map.addControl(drawTool);

// Add the "create polygons" button
var tutorial = Tutorial();
map.addControl(new topology.buildPolysBtn());

// Start the tutorial
tutorial.initialize();
tutorial.next();

// Wire up the reaction to newly created features
map.on("draw:created", function (e) {
    if (e.layerType === "polyline") {
        youDrewThese.addData(e.layer.toGeoJSON());
        tutorial.toStep(2);
    } else if (e.layerType === "rectangle") {
        topology.highlightIntersecting(e.layer, youDrewThese);
        topology.selectedFeatures.addTo(map);
        tutorial.toStep(3);
    }
});