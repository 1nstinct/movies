import React, { Component, createRef } from 'react';

import http from '../../services/http';
import createMarker from "./components/Marker";
import createGoogleMap from "./components/GoogleMap";
import { GOOGLE_KEY } from "../../main/config";

class Map extends Component {
  constructor() {
    super();

    this.state = {
      googleMapRef: createRef(),
      googleMap: null,
      bounds: null,
      movies: [],
    };
  }

  componentDidMount() {
    const googleScript = document.createElement('script');
    googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}`;
    window.document.body.appendChild(googleScript);

    googleScript.addEventListener('load', () => {
      const { googleMapRef } = this.state;
      this.setState({
        googleMap: createGoogleMap(googleMapRef),
        bounds: new window.google.maps.LatLngBounds(),
      });
    });

    http().then((data) => {
      console.log(data);
      data.map((movie) => {
        if (!movie.lat || !movie.lng) return;
        const position = {
          lat: parseFloat(movie.lat),
          lng: parseFloat(movie.lng),
        };
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
      });
    })
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
