 // Circle size by magnitude
function circleSize(magnitude) {
    return magnitude*5;
};

// circle color by depth
function circleColor(depth) {
    if (depth >= 90) {
        color = "#F94144";
    }
    else if (depth < 10 && depth >= 0) {
        color = "#577590";
    }
    else if (depth < 20 && depth >= 10) {
        color = "#4D908E";
    }
    else if (depth < 30 && depth >= 20) {
        color = "#43AA8B";
    }
    else if (depth < 40 && depth >= 30) {
        color = "#90BE6D";
    }
    else if (depth < 50 && depth >= 40) {
        color = "#C5C35E";
    }
    else if (depth < 60 && depth >= 50) {
        color = "#F9C74F";
    }
    else if (depth < 70 && depth >= 60) {
        color = "#F8961E";
    }
    else if (depth < 80 && depth >= 70) {
        color = "#F3722C";
    }
    else if (depth < 90 && depth >= 80) {
        color = "#F65A38";
    };
    return color;
};

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
            "<br> Magnitude: " + feature.properties.mag + "<br> Deth (per km): " + feature.geometry.coordinates[2]);
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
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }
  
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

    // Set up the legend.
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
            limits = [0,10,20,30,40,50,60,70,80,90];
        var colors = ["#577590","#4D908E","#43AA8B","#90BE6D","#C5C35E","#F9C74F","#F8961E","#F3722C","#F65A38","#F94144"]
        var labels = [];

        // Add the minimum and maximum.
        var legendInfo = "<h1>Depth of Earthquake</br> (per km) </h1>" +
            "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
            "</div>";

        div.innerHTML = legendInfo;

        limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
        });

        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        return div;
    };

    // Adding the legend to the map
    legend.addTo(myMap);
  }});