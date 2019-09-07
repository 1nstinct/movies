/**
 * Init google map
 * @returns {window.google.maps.Map}
 */

const createGoogleMap = (googleMapRef) => {
  return new window.google.maps.Map(googleMapRef.current, {
    zoom: 10,
    center: {
      lat: 43.64,
      lng: -79.38,
    },
    disableDefaultUI: true,
  });
};

export default createGoogleMap;
