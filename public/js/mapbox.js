/* eslint-disable */
// var mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

// mapboxgl.accessToken =
//   // ''
//   ;
var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
});
