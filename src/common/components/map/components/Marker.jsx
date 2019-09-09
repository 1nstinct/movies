/**
 * Create google marker
 * @param newMovie
 * @param map
 * @returns {window.google.maps.Marker}
 */
const createMarker = (newMovie, map) => {
  const infowindow = new window.google.maps.InfoWindow({
    content: `<p><b>Title: </b>${newMovie.Title}</p>
<p><b>Writer: </b>${newMovie.Writer}</p>
<p><b>Fun Facts: </b>${newMovie['Fun Facts']}</p>
<p><b>Release Year: </b>${newMovie['Release Year']}</p>`,
  });
  const marker = new window.google.maps.Marker({
    position: newMovie.position,
    map,
  });
  marker.addListener('click', () => {
    infowindow.open(map, marker);
  });

  return marker;
};
export default createMarker;
