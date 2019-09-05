import React, { Component, createRef } from 'react';

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

class Map extends Component {
  constructor() {
    super();

    this.state = {
      googleMapRef: createRef(),
      googleMap: null,
      geocoder: null,
      bounds: null,
      movies: [],
    };
  }

  componentDidMount() {
    const googleScript = document.createElement('script');
    googleScript.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAPW4UhhJ8ciXSMOIrhy6SgnyO5nY_kyMk';
    window.document.body.appendChild(googleScript);

    googleScript.addEventListener('load', () => {
      this.setState({
        googleMap: this.createGoogleMap(),
        geocoder: new window.google.maps.Geocoder(),
        bounds: new window.google.maps.LatLngBounds(),
      });
    });
    // fetching data from the API
    fetch('https://data.sfgov.org/resource/yitu-d5am.json')
      .then((res) => res.json())
      .then((data) => {
        let i = 1;
        setInterval(() => {
          // TODO: Geocode was not successful for the following reason: OVER_QUERY_LIMIT
          data.slice(i - 1, i * 5).map((movie) => { // eslint-disable-line
            // geocoding
            return this.getLocation(movie.locations, (results, status) => {
              if (status === 'OK') {
                const position = results[0].geometry.location;
                const { movies, bounds, googleMap } = this.state;

                this.setState({
                  movies,
                  bounds: bounds.extend(position), // extend the bound by marker location
                }, () => {
                  googleMap.fitBounds(bounds); // fit the bound to the map
                });
                let newMovie = {
                  ...movie,
                  position,
                };
                // creating the marker
                const marker = createMarker(newMovie, googleMap);
                newMovie = {
                  ...newMovie,
                  marker,
                };
                // saving the marker
                movies.push(newMovie);
                return false;
              }
              console.log(`Geocode was not successful for the following reason: ${status}`); // eslint-disable-line
              return false;
            });
          });
          i += 1;
        }, 2000);
      })
      .catch(console.log); // eslint-disable-line
  }

  /**
   * Decode location by address
   * @param address
   * @param cb
   */
  getLocation(address, cb) {
    const { geocoder } = this.state;
    geocoder.geocode({ address: `San Francisco, ${address}` }, cb);
  }

  /**
   * Init google map
   * @returns {window.google.maps.Map}
   */
  createGoogleMap() {
    const { googleMapRef } = this.state;
    return new window.google.maps.Map(googleMapRef.current, {
      zoom: 10,
      center: {
        lat: 43.64,
        lng: -79.38,
      },
      disableDefaultUI: true,
    });
  }

  filter(e) {
    const { bounds, movies, googleMap } = this.state;
    const searchName = e.target.value.replace(/\s/g, '');

    // clear all markers
    movies.forEach((movie) => {
      movie.marker.setMap(null);
    });

    // filtering movies
    if (searchName && searchName.length > 3) {
      movies.forEach((movie) => {
        if (movie.title.includes(searchName)
          || movie.writer.includes(searchName)
          || movie.release_year.includes(searchName)
        ) {
          bounds.extend(movie.position);
          googleMap.fitBounds(bounds);
          movie.marker.setMap(googleMap);
        }
        return false;
      });
    } else {
      movies.forEach((movie) => {
        bounds.extend(movie.position);
        googleMap.fitBounds(bounds);
        movie.marker.setMap(googleMap);
        return false;
      });
    }
  }

  render() {
    const { googleMapRef } = this.state;
    return (
      <div style={{ width: '100%', height: '600px' }}>
        <input style={{ height: '30px', marginTop: '30px', width: '200px' }} type="text" className="form-control" id="mname" placeholder="Search by title or writer or year..." onChange={(e) => this.filter(e)} />
        <p />
        <div
          id="google-map"
          ref={googleMapRef}
          style={{ width: '100%', height: '400px' }}
        />
      </div>
    );
  }
}

export default Map;
