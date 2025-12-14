import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapView = () => {
  const [earthquakes, setEarthquakes] = useState([]);
  const [minMagnitude, setMinMagnitude] = useState(0);

  useEffect(() => {
    axios
      .get(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
      )
      .then((response) => {
        setEarthquakes(response.data.features);
      })
      .catch((error) => {
        console.error("Error fetching earthquake data:", error);
      });
  }, []);

  const filteredEarthquakes = earthquakes.filter(
    (eq) => eq.properties.mag >= minMagnitude
  );

  return (
    <div>
      {/* Magnitude Filter */}
      <div
        style={{
          textAlign: "center",
          padding: "10px",
          background: "#f4f4f4",
          borderBottom: "1px solid #ddd",
        }}
      >
        <label style={{ marginRight: "10px", fontWeight: "bold" }}>
          Minimum Magnitude:
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={minMagnitude}
          onChange={(e) => setMinMagnitude(parseFloat(e.target.value) || 0)}
          style={{
            padding: "5px",
            borderRadius: "5px",
            border: "1px solid #ccc",
            width: "80px",
          }}
        />
      </div>

      {/* Map Section */}
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: "90vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {filteredEarthquakes.map((eq) => {
          const [longitude, latitude] = eq.geometry.coordinates;
          const mag = eq.properties.mag;
          const color =
            mag < 3
              ? "green"
              : mag < 5
              ? "orange"
              : "red"; // Color based on magnitude

          const customIcon = L.divIcon({
            className: "custom-marker",
            html: `<div style="background-color:${color};
                    width:12px;height:12px;border-radius:50%;"></div>`,
          });

          return (
            <Marker
              key={eq.id}
              position={[latitude, longitude]}
              icon={customIcon}
            >
              <Popup>
                <strong>Location:</strong> {eq.properties.place} <br />
                <strong>Magnitude:</strong> {mag} <br />
                <strong>Time:</strong>{" "}
                {new Date(eq.properties.time).toLocaleString()}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
