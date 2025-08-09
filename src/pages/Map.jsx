import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Map() {
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [status, setStatus] = useState("Idle");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }
    setStatus("Fetching location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("Location acquired");
      },
      (err) => {
        console.error("Geolocation error", err);
        setStatus("Location access denied or unavailable");
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Your Location</h1>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <p className="mb-2 text-gray-800 dark:text-gray-100">
            Status: {status}
          </p>
          {coords.lat && coords.lng ? (
            <div className="space-y-1 text-gray-800 dark:text-gray-100">
              <div>Latitude: {coords.lat.toFixed(6)}</div>
              <div>Longitude: {coords.lng.toFixed(6)}</div>
              <a
                className="text-blue-600 underline"
                href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lng}#map=16/${coords.lat}/${coords.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                Open in OpenStreetMap
              </a>
            </div>
          ) : (
            <div className="text-gray-500">No coordinates yet.</div>
          )}
          <button
            onClick={getLocation}
            className="mt-4 px-3 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
          >
            Refresh Location
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
