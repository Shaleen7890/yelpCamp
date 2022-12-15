mapboxgl.accessToken =mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: campground.features.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
    style: 'mapbox://styles/mapbox/dark-v10', // style URL or style object
    hash: true, // sync `center`, `zoom`, `pitch`, and `bearing` with URL
    // Use `transformRequest` to modify requests that begin with `http://myHost`.
    transformRequest: (url, resourceType) => {
        if (resourceType === 'Source' && url.startsWith('http://myHost')) {
            return {
                url: url.replace('http', 'https'),
                headers: { 'my-custom-header': true },
                credentials: 'include'  // Include cookies for cross-origin requests
            };
        }
    }
});
map.addControl(new mapboxgl.NavigationControl(),'bottom-left');

new mapboxgl.Marker()
   .setLngLat(campground.features.geometry.coordinates)
   .setPopup(
      new mapboxgl.Popup({offset:25})
      .setHTML(
        `<h3>${campground.title}</h3><p>${campground.location}</p>`
      )
   )
   .addTo(map)