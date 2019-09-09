import React, { Component, createRef } from 'react';

import http from '../../services/http';
import createMarker from "./components/Marker";
import createGoogleMap from "./components/GoogleMap";
import { GOOGLE_KEY, MIN_SEARCH_STR_LENGTH } from "../../main/config";

import "./map.css";

class Map extends Component {
  constructor() {
    super();

    this.state = {
      googleMapRef: createRef(),
      googleMap: null,
      bounds: null,
      movies: [],
      inputVal: '',
      invalidInput: false,
      disableFiltering: false,
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
    // making API request for data
    http().then((data) => {
      data.map((movie) => {
        if (!movie.lat || !movie.lng) return; // do not process if movie does not have lat, lng

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
    });
  }

  /**
   * Filer the list of movies and their markers
   */
  filter() {
    const { movies, googleMap, inputVal, disableFiltering } = this.state;
    if (disableFiltering) return;
    const searchName = inputVal
      .trim()
      .toLowerCase();
    // init new markets view
    const bounds = new window.google.maps.LatLngBounds();
    // input validation
    if (searchName.length > 0 && searchName.length < MIN_SEARCH_STR_LENGTH) {
      this.setState({ invalidInput: true });
    } else {
      this.setState({ invalidInput: false });
    }

    // filtering movies
    if (searchName && searchName.length >= MIN_SEARCH_STR_LENGTH) {
      this.setState({ disableFiltering: true });
      // clear all markers
      movies.forEach((movie) => {
        movie.marker.setMap(null);
      });
      // search for matches
      movies.forEach((movie) => {
        if (movie.Title.toLowerCase().includes(searchName)
        || movie.Writer.toLowerCase().includes(searchName)
        || movie['Release Year'] === searchName) {
          bounds.extend(movie.position);
          googleMap.fitBounds(bounds);
          movie.marker.setMap(googleMap);
        }
        return false;
      });
    } else {
      this.setState({ disableFiltering: true });
      // return back all movies and their markers
      movies.forEach((movie) => {
        bounds.extend(movie.position);
        googleMap.fitBounds(bounds);
        movie.marker.setMap(googleMap);
        return false;
      });
    }
    // fit map to the bound
    this.setState({ bounds });
    this.setState({ disableFiltering: false });
  }

  /**
   * Keyboard actions handler
   * @param e
   */
  onKeyPress(e) {
    if (e.keyCode === 13) {
      // enter
      this.filter();
    }
  }

  render() {
    const { googleMapRef, invalidInput, disableFiltering } = this.state;
    return (
      <div style={{ width: '100%', height: '600px' }}>
        <input
          style={{ height: '30px', marginTop: '30px', width: '200px' }}
          type="text"
          className={`${invalidInput ? 'invalidClass' : ''}`}
          id="mname"
          placeholder={`${invalidInput ? MIN_SEARCH_STR_LENGTH + ' characters is min' : 'Search by title or writer or year...'}`}
          onKeyPress={(e) => this.onKeyPress(e)}
          onChange={(e) => this.setState({ inputVal: e.target.value })}
        />
        <button
          className="btn"
          onClick={() => this.filter()}
          disabled={disableFiltering}
        >
          Filter
        </button>
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
