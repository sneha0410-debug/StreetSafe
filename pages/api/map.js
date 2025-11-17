// pages/api/map.js

export default async function handler(req, res) {
  const { lat, lon, radius } = req.query;
  
  // Use multiple Overpass mirrors for reliability
  const overpassUrls = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter"
  ];

  try {
    // Use actual radius for hospitals/clinics, but 30km for shelters
    const meters = parseInt(radius || "5") * 1000;
    const shelterMeters = 30000; // Always search 30km for shelters
    
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${meters},${lat},${lon});
        node["amenity"="clinic"](around:${meters},${lat},${lon});
        node["amenity"="shelter"](around:${shelterMeters},${lat},${lon});
      );
      out body;
    `;

    // Try each Overpass server until one works
    let lastError;
    for (const overpassUrl of overpassUrls) {
      try {
        const response = await fetch(overpassUrl, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: `data=${encodeURIComponent(query)}`,
        });

        if (!response.ok) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          continue; // Try next server
        }

        const data = await response.json();
        
        // Check if we got valid data
        if (data.elements) {
          return res.status(200).json(data);
        }
        
        lastError = new Error("No elements in response");
        continue;
      } catch (err) {
        lastError = err;
        console.log(`Failed with ${overpassUrl}, trying next...`);
        continue;
      }
    }

    // All servers failed
    throw lastError || new Error("All Overpass servers failed");

  } catch (err) {
    console.error("Overpass API failed:", err);
    res.status(500).json({ 
      error: "Failed to fetch map data", 
      message: err.message 
    });
  }
}