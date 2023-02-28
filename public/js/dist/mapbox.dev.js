"use strict";

/* eslint-disable */
// var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
var locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);
mapboxgl.accessToken = 'pk.eyJ1IjoidXRrYXJzaC1ndXB0YSIsImEiOiJjbGUzOHpsYmowNm1sM29tcTF3OGh4ZnpsIn0.t74RsP-YRp24RIoT79XyJw';
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/utkarsh-gupta/clen1ln9a002b01qtxn4a6ief',
  scrollZoom: false // center: [-118.113491, 34.111745],
  // zoom: 4,
  // interactive: false,

});
var bounds = new mapboxgl.LngLatBounds();
locations.forEach(function (loc) {
  // Create marker
  var el = document.createElement('div');
  el.className = 'marker'; // Add marker

  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  }).setLngLat(loc.coordinates).addTo(map); // Add popup

  new mapboxgl.Popup({
    offset: 30
  }).setLngLat(loc.coordinates).setHTML("<p>Day ".concat(loc.day, ": ").concat(loc.description, "</p>")).addTo(map); // Extend map bounds to include the current location

  bounds.extend(loc.coordinates);
});
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});