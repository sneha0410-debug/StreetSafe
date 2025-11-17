// components/LeafletMap.js
import { MapContainer, TileLayer, Marker, Circle, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo } from "react";

// Custom icons
const hospitalIcon = new L.Icon({ 
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", 
  iconSize:[25,41], 
  iconAnchor:[12,41], 
  popupAnchor:[1,-34]
});

const clinicIcon = new L.Icon({ 
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png", 
  iconSize:[25,41], 
  iconAnchor:[12,41], 
  popupAnchor:[1,-34]
});

const hereIcon = new L.Icon({ 
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png", 
  iconSize:[25,41], 
  iconAnchor:[12,41], 
  popupAnchor:[1,-34]
});

const shelterIcon = new L.Icon({ 
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png", 
  iconSize:[25,41], 
  iconAnchor:[12,41], 
  popupAnchor:[1,-34]
});

// Haversine distance in km
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1 * Math.PI / 180) * 
            Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function LeafletMap({ center, markers = [], radius }) {
  // Find shelters: ones in radius + nearest one outside radius (only if none in radius)
  const { sheltersInRadius, nearestOutside } = useMemo(() => {
    const shelters = markers.filter(m => m.tags?.amenity === "shelter");
    const inRadius = [];
    let nearest = null;
    let minDist = Infinity;
    
    shelters.forEach(s => {
      const d = getDistance(center[0], center[1], s.lat, s.lon);
      if (d <= radius) {
        inRadius.push(s);
      } else if (d <= 30 && d < minDist) {
        minDist = d;
        nearest = { ...s, distance: d };
      }
    });
    
    // Only show nearest outside if NO shelters in radius
    return { 
      sheltersInRadius: inRadius, 
      nearestOutside: inRadius.length === 0 ? nearest : null 
    };
  }, [markers, center, radius]);

  return (
    <MapContainer center={center} zoom={13} style={{ width: "100%", height: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Radius circle */}
      <Circle 
        center={center} 
        radius={radius * 1000} 
        pathOptions={{ color: "green", fillOpacity: 0.05 }} 
      />

      {/* User location */}
      <Marker position={center} icon={hereIcon}>
        <Popup>You are here</Popup>
      </Marker>

      {/* Emergency markers - only show hospitals and clinics in radius */}
      {markers.map(m => {
        const dist = getDistance(center[0], center[1], m.lat, m.lon);
        
        if (m.tags?.amenity === "hospital" && dist <= radius) {
          return (
            <Marker key={m.id} position={[m.lat, m.lon]} icon={hospitalIcon}>
              <Popup>{m.tags?.name || "Hospital"}</Popup>
            </Marker>
          );
        }
        if (m.tags?.amenity === "clinic" && dist <= radius) {
          return (
            <Marker key={m.id} position={[m.lat, m.lon]} icon={clinicIcon}>
              <Popup>{m.tags?.name || "Clinic"}</Popup>
            </Marker>
          );
        }
        return null;
      })}

      {/* Show shelters within radius */}
      {sheltersInRadius.map(s => (
        <Marker key={s.id} position={[s.lat, s.lon]} icon={shelterIcon}>
          <Popup>{s.tags?.name || "Shelter"}</Popup>
        </Marker>
      ))}

      {/* Dashed line to nearest shelter OUTSIDE radius */}
      {nearestOutside && (
        <>
          <Marker position={[nearestOutside.lat, nearestOutside.lon]} icon={shelterIcon}>
            <Popup>{nearestOutside.tags?.name || "Nearest Shelter"}</Popup>
          </Marker>
          <Polyline 
            positions={[center, [nearestOutside.lat, nearestOutside.lon]]} 
            pathOptions={{ color: "blue", dashArray: "10,10", weight: 2 }}
          >
            <Popup>
              Nearest shelter outside radius: {nearestOutside.tags?.name || "Unnamed"} <br />
              Distance: {nearestOutside.distance.toFixed(2)} km
            </Popup>
          </Polyline>
        </>
      )}
    </MapContainer>
  );
}