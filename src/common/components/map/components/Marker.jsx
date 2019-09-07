/**
 * Create google marker
 * @param newMovie
 * @param map
 * @returns {window.google.maps.Marker}
 */
const createMarker = (newMovie, map) => {
  const infowindow = new window.google.maps.InfoWindow({
    content: `<p><b>Title: </b>${newMovie.title}</p>
<p><b>Writer: </b>${newMovie.writer}</p>
<p><b>Release Year: </b>${newMovie.release_year}</p>`,
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
