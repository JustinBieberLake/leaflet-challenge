// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(data => {

  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);

  function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup("Place: " + feature.properties.place + "<br>Time: " + feature.properties.time + 
            "<br> Magnitude: " + feature.properties.mag + "<br> Depth (per km): " + feature.geometry.coordinates[2]);
    }
  
    // Circle size by magnitude
    function circleSize(magnitude) {
        return magnitude * 5;
    }
  
    // Circle color by depth
    function circleColor(depth) {
        // Create a color scale for the depth
        var colorScale = d3.scaleLinear()
                            .range(['#00FF00', '#880808'])
                            .domain([-10, 90]);
  
        return colorScale(depth);
    }
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                opacity: 1,
                fillOpacity: 1,
                fillColor: circleColor(feature.geometry.coordinates[2]),
                color: "#000000",
                radius: circleSize(feature.properties.mag),
                stroke: true,
                weight: 0.5
            });
        }
    });

    createMap (earthquakes);

    function createMap(earthquakes) {
  
        // Create the base layers.
        var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
      
        var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        });
      
        // Create a baseMaps object.
        var baseMaps = {
          "Street Map": street,
          "Topographic Map": topo
        };
      
        // Create an overlay object to hold our overlay.
        var overlayMaps = {
          Earthquakes: earthquakes
        };
    
      
        // Create our map, giving it the streetmap and earthquakes layers to display on load.
        var myMap = L.map("map", {
          center: [
            37.09, -95.71
          ],
          zoom: 5,
          layers: [street, earthquakes]
        });
      
        // Create a layer control.
        // Pass it our baseMaps and overlayMaps.
        // Add the layer control to the map.
        L.control.layers(baseMaps, overlayMaps).addTo(myMap);
    
    // Create the legend control.
    var legend = L.control({ position: "bottomright" });

    // When the legend is added to the map.
    legend.onAdd = function() {
        // Create a div element for the legend.
        var div = L.DomUtil.create("div", "legend");

        var depthSegments = [[-10, 10], [10, 30], [30, 50], [50, 70], [70, 90], [90, Infinity]];

           // Create a color scale for the legend.
        var colorScale = d3.scaleLinear()
                          .range(['#00FF00', '#880808'])
                          .domain([-10, 90]);

    for (var i = 0; i < depthSegments.length; i++) {
        var segment = depthSegments[i];
        var segmentMin = segment[0];
        var segmentMax = segment[1];
        var color = colorScale(segmentMin);
        var label = segmentMin + "-" + segmentMax;
        if(segmentMax === Infinity) label = "90+";
        div.innerHTML += "<div class='legend-item'><div class='circle' style='background-color:"+color+"'></div>" + label + "</div>";
    }

  return div;
};

    legend.addTo(myMap);
}}});