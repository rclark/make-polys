var topology = {
    selectedFeatures: L.geoJson(null, {
        style: {
            color: "#F28F0C",
            weight: 4,
            opacity: 1
        }
    }),
    
    polygons: L.geoJson(null, {
        style: {
            color: "#F28F0C"
        }
    }),
    
    highlightIntersecting: function (rectangle, lines) {
        var reader = new jsts.io.GeoJSONReader(),
            jstsArea = reader.read(rectangle.toGeoJSON());
        
        this.selectedFeatures.clearLayers();
        
        lines.toGeoJSON().features.forEach(function (feature) {
            var jstsLine = reader.read(feature);
            if (jstsArea.geometry.intersects(jstsLine.geometry)) {
                topology.selectedFeatures.addData(feature);
            }
        });
    },
    
    buildPolysBtn: L.Control.extend({
        options: {
            position: "topleft",
            title: "Step #3..."
        },
        
        onAdd: function (map) {
            var container = L.DomUtil.create("div", "build-polys leaflet-bar"),
                buildThem = L.DomUtil.create("a", "build-polys-button", container),
                sampleLines = L.DomUtil.create("a", "sample-lines", container),
                helpMe = L.DomUtil.create("a", "start-tutorial", container);
            buildThem.href = "#";
            helpMe.href = "#";
            
            _buildPolys = function (e) {
                topology.buildPolygons();
                this.addLayer(topology.polygons);
                topology.selectedFeatures.clearLayers();
                tutorial.cancel();
            };
            
            _addSampleData = function (e) {
                window.gotData = function (data) {
                    youDrewThese.addData(data);
                };
                
                $("body").append("<script src='js/sample-lines.js'></script>");
            };
                
            L.DomEvent
                .on(buildThem, 'click', L.DomEvent.stopPropagation)
                .on(buildThem, 'mousedown', L.DomEvent.stopPropagation)
                .on(buildThem, 'dblclick', L.DomEvent.stopPropagation)
                .on(buildThem, 'click', L.DomEvent.preventDefault)
                .on(buildThem, 'click', _buildPolys, map);
            
            L.DomEvent
                .on(helpMe, 'click', L.DomEvent.stopPropagation)
                .on(helpMe, 'mousedown', L.DomEvent.stopPropagation)
                .on(helpMe, 'dblclick', L.DomEvent.stopPropagation)
                .on(helpMe, 'click', L.DomEvent.preventDefault)
                .on(helpMe, 'click', tutorial.restart, tutorial);
            
            L.DomEvent
                .on(sampleLines, 'click', L.DomEvent.stopPropagation)
                .on(sampleLines, 'mousedown', L.DomEvent.stopPropagation)
                .on(sampleLines, 'dblclick', L.DomEvent.stopPropagation)
                .on(sampleLines, 'click', L.DomEvent.preventDefault)
                .on(sampleLines, 'click', _addSampleData, {});
            
            return container;
        }
    }),
    
    buildPolygons: function () {
        var reader = new jsts.io.GeoJSONReader(),
            writer = new jsts.io.GeoJSONWriter(),
            polygonizer = new jsts.operation.polygonize.Polygonizer(),
            noder = new jsts.noding.MCIndexNoder(),
            intersector = new jsts.noding.IntersectionAdder(new jsts.algorithm.RobustLineIntersector()),
            factory = new jsts.geom.GeometryFactory(),
            segments = new javascript.util.ArrayList(),
            lines = topology.selectedFeatures.toGeoJSON();
        
        // Convert the GeoJSON Lines into jsts NodedSegmentStrings
        reader.read(lines).features.forEach(function (jstsFeature) {
            if (jstsFeature.geometry.geometries) {
                // The case of MultiLineStrings
                jstsFeature.geometry.geometries.forEach(function (line) {
                    segments.add(new jsts.noding.NodedSegmentString(line.points));
                });
            } else {
                // The case of LineStrings
                segments.add(new jsts.noding.NodedSegmentString(jstsFeature.geometry.points));
            }
        });
        
        // "Clean", "Planarize" or "Node" the network of lines (whatever you call it)
        noder.setSegmentIntersector(intersector);
        noder.computeNodes(segments);
        var cleanedSegments = noder.getNodedSubstrings();
        
        //var segmentLayer = L.geoJson(null, { style: { color: "red" } });
        
        // Extract jsts LineStrings from the cleaned segments, add them to the polygonizer
        var i = cleanedSegments.iterator();
        while (i.hasNext()) {
            var segment = i.next(),
                coords = segment.getCoordinates(),
                line = factory.createLineString(coords);
            //segmentLayer.addData(writer.write(line));
            polygonizer.add(line);
        }
        
        //console.log(JSON.stringify(segmentLayer.toGeoJSON()));
        
        // Generate polygons, add them to the GeoJSON layer
        topology.polygons.clearLayers();
        polygonizer.getPolygons().array.forEach(function (poly) {
            var feature = {type: "Feature", properties: {}, geometry: writer.write(poly)};
            topology.polygons.addData(feature);
        });
    }
};