import { useCallback, useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  StandaloneSearchBox,
  Marker,
} from "@react-google-maps/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const mapContainerStyle = {
  height: "100vh",
  width: "100%",
};

const center = {
  lat: 40.75378,
  lng: -73.55658,
};

const zoom = 10;

export default function Map() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_CLOUD_API_KEY, // **REPLACE WITH YOUR API KEY**
    libraries: ["places"],
  });

  const searchBoxRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);

  const onSearchBoxLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    const searchBox = searchBoxRef.current;
    if (!searchBox) return;

    const places = searchBox.getPlaces();
    if (!places || places.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    places.forEach((place) => {
      if (place.geometry && place.geometry.viewport) {
        const viewport = place.geometry.viewport;
        bounds.extend(viewport.getNorthEast());
        bounds.extend(viewport.getSouthWest());
      } else if (place.geometry && place.geometry.location) {
        bounds.extend(place.geometry.location);
      }
    });

    if (map) {
      map.fitBounds(bounds);
    }
    console.log(bounds);
  };
  const onMapClick = useCallback((event) => {
    // New function for map clicks
    setMarkers((current) => [
      ...current,
      {
        // Add new marker to markers array
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
        time: new Date(), // Optional: You can add timestamp for ordering
      },
    ]);
  }, []);
  const onMapLoad = useCallback(function callback(map) {
    setMap(map);
    console.log(map);
  }, []);

  const onClick = (e) => {
    console.log("onClick args: ", e, { map });
    console.log(e.latLng.lat() + ", " + e.latLng.lng());
  };

  if (loadError) {
    return <div>Error loading Google Maps API: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Map Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="App">
        {isLoaded && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            zoom={zoom}
            center={center}
            onLoad={onMapLoad}
            onClick={onClick}
          >
            <StandaloneSearchBox
              onLoad={onSearchBoxLoad}
              onPlacesChanged={onPlacesChanged}
            >
              <input
                type="text"
                placeholder="Enter your location"
                style={{
                  boxSizing: `border-box`,
                  border: `1px solid transparent`,
                  width: `240px`,
                  height: `32px`,
                  padding: `0 12px`,
                  borderRadius: `3px`,
                  boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                  backgroundColor: "white",
                  fontSize: `14px`,
                  outline: `none`,
                  textOverflow: `ellipses`,
                  position: "absolute",
                  left: "50%",
                  marginLeft: "-120px",
                }}
              />
            </StandaloneSearchBox>
            {markers.map(
              (
                marker // Render markers on the map
              ) => (
                <Marker
                  key={`${marker.lat}-${marker.lng}-${marker.time.getTime()}`} // Unique key for each marker
                  position={{ lat: marker.lat, lng: marker.lng }}
                  // You can add icon, title, etc., to the Marker component
                />
              )
            )}
          </GoogleMap>
        )}
      </div>
      <Footer />
    </div>
  );
}
