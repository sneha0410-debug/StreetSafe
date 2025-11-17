import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("../components/LeafletMap"), { ssr: false });

// Compute safety index
function computeSafetyIndex(counts, radius_km) {
  const hospitals = counts.hospital || 0;
  const clinics = counts.clinic || 0;
  const shelters = counts.shelter || 0;
  const score = hospitals * 3 + clinics * 1.5 + shelters * 4;
  const density_factor = Math.max(1, radius_km / 5);
  const safety_index = Math.round((score / density_factor) * 100) / 100;

  let label = "🔴 Risk Zone", color = "red";
  if (safety_index > 12) { label = "🟢 Safe Zone"; color = "green"; }
  else if (safety_index > 6) { label = "🟠 Moderate Zone"; color = "orange"; }
  return { safety_index, label, color };
}

export default function MapPage() {
  const [step, setStep] = useState(0);
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [manualCity, setManualCity] = useState("");
  const [radius, setRadius] = useState(5);
  const [loading, setLoading] = useState(false);
  const [markers, setMarkers] = useState([]);
  const [counts, setCounts] = useState({ hospital: 0, clinic: 0, shelter: 0 });
  const [safety, setSafety] = useState(null);
  const [error, setError] = useState("");
  const mountedRef = useRef(false);

  useEffect(() => { mountedRef.current = true; return () => (mountedRef.current = false); }, []);

  // ----------------- Detect location -----------------
  const detectLocation = () => {
    setError(""); setLoading(true);
    if (!navigator.geolocation) { setError("Geolocation not supported"); setLoading(false); return; }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lon = pos.coords.longitude;
        await reverseGeocodeAndSet(lat, lon);
        if (mountedRef.current) { setLoading(false); fetchMarkers(lat, lon); setStep(4); }
      },
      async () => {
        await reverseGeocodeAndSet(26.9124, 75.7873, "Fallback Location");
        if (mountedRef.current) { setLoading(false); fetchMarkers(26.9124, 75.7873); setStep(4); }
      }
    );
  };

  const reverseGeocodeAndSet = async (lat, lon, fallbackName) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
      const json = await res.json();
      const name = json?.display_name || fallbackName || "Detected location";
      if (mountedRef.current) setDetectedLocation({ lat, lon, name });
    } catch { if (mountedRef.current) setDetectedLocation({ lat, lon, name: fallbackName || "Detected location" }); }
  };

  const resolveManualCity = async () => {
    if (!manualCity.trim()) { setError("Enter a place name"); return; }
    setLoading(true);
    try {
      const q = encodeURIComponent(manualCity.trim());
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&limit=1`);
      const json = await res.json();
      if (!json || !json.length) { setError("Location not found"); setLoading(false); return; }
      const place = json[0];
      if (mountedRef.current) { 
        setDetectedLocation({ lat: parseFloat(place.lat), lon: parseFloat(place.lon), name: place.display_name }); 
        setLoading(false); 
        fetchMarkers(parseFloat(place.lat), parseFloat(place.lon)); 
        setStep(4); 
      }
    } catch { setError("Error during geocoding"); setLoading(false); }
  };

  // ----------------- Fetch markers -----------------
  const fetchMarkers = async (lat, lon) => {
    setError(""); setLoading(true);
    try {
      // fetch up to 30km to get nearest shelter if none in radius
      const res = await fetch(`/api/map?lat=${lat}&lon=${lon}&radius=30`);
      const json = await res.json();
      if (!res.ok || json.error) { setError("Error fetching nearby services"); setMarkers([]); setCounts({ hospital:0, clinic:0, shelter:0 }); setSafety(null); setLoading(false); return; }

      // Helper function to calculate distance
      const getDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // Count only facilities within the user's selected radius
      const countsObj = { hospital:0, clinic:0, shelter:0 };
      (json.elements || []).forEach(el => {
        const dist = getDistance(lat, lon, el.lat, el.lon);
        if (dist <= radius) {
          const amen = el.tags?.amenity;
          if (amen==="hospital") countsObj.hospital++;
          else if (amen==="clinic") countsObj.clinic++;
          else if (amen==="shelter") countsObj.shelter++;
        }
      });

      if (mountedRef.current) {
        setMarkers(json.elements || []);
        setCounts(countsObj);
        setSafety(computeSafetyIndex(countsObj, radius));
        setLoading(false);
      }
    } catch {
      setError("Failed to fetch data"); setLoading(false);
    }
  };

  // ----------------- UI -----------------
  if (step === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🏥</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Emergency Services Finder</h1>
            <p className="text-gray-600">Find nearby hospitals, clinics, and shelters</p>
          </div>

          {/* Auto-detect section */}
          <div className="mb-6">
            <button 
              className="w-full px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2" 
              onClick={detectLocation} 
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting...
                </>
              ) : (
                <>
                  📍 Detect My Location
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Manual entry section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enter Location Manually</label>
            <input 
              type="text" 
              value={manualCity} 
              onChange={(e)=>setManualCity(e.target.value)} 
              placeholder="e.g., Pune, Mumbai, Delhi" 
              className="w-full border-2 border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 px-4 py-3 rounded-lg outline-none transition-all"
              onKeyPress={(e) => e.key === 'Enter' && resolveManualCity()}
            />
            <button 
              className="w-full mt-3 px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={resolveManualCity} 
              disabled={loading}
            >
              {loading ? "Looking up..." : "Search Location"}
            </button>
          </div>

          {/* Radius selector */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Radius</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                value={radius} 
                min={1} 
                max={30} 
                onChange={e=>setRadius(Number(e.target.value))} 
                className="flex-1 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <span className="text-xl font-bold text-indigo-600 min-w-[60px]">{radius} km</span>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 4: Full-page map + compact info panel
  return (
    <div className="flex h-screen w-screen">
      {/* Left panel - compact version */}
      <div className="w-80 p-4 bg-white shadow overflow-y-auto">
        <h2 className="text-lg font-semibold mb-2">Nearby Emergency Services</h2>
        <div className="text-sm text-gray-600 mb-3">{detectedLocation?.name} • Radius: {radius} km</div>

        {safety && <div className="mb-3">
          <div className="font-semibold" style={{ color: safety.color }}>{safety.label}</div>
          <div className="text-sm text-gray-600">Safety Index: {safety.safety_index}</div>
        </div>}

        <div className="mb-3">
          <div className="font-medium mb-1">Counts</div>
          <ul className="text-sm">
            <li>Hospitals: {counts.hospital}</li>
            <li>Clinics: {counts.clinic}</li>
            <li>Shelters: {counts.shelter}</li>
          </ul>
        </div>

        <button className="px-3 py-2 bg-gray-200 rounded mb-2 mr-2" onClick={()=>fetchMarkers(detectedLocation.lat, detectedLocation.lon)}>Refresh</button>
        <button className="px-3 py-2 bg-gray-200 rounded" onClick={()=>setStep(0)}>Start Over</button>
      </div>

      {/* Right: Map */}
      <div className="flex-1">
        <LeafletMap center={[detectedLocation.lat, detectedLocation.lon]} markers={markers} radius={radius}/>
      </div>
    </div>
  );
}