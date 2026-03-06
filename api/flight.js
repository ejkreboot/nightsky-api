// /api/flight.js
// Usage: GET /api/flight?callsign=EDV5010&hex=A12345

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300'); // routes don't change mid-flight

  const { callsign, hex } = req.query;
  if (!callsign) {
    return res.status(400).json({ error: 'callsign is required' });
  }

  const clean = callsign.trim().toUpperCase();

  try {
    // 1. Route + airline info from callsign
    const routeRes = await fetch(`https://hexdb.io/api/v1/route/icao/${clean}`);

    if (!routeRes.ok) {
      return res.status(404).json({ error: 'Flight route not found' });
    }

    const routeData = await routeRes.json();
    // routeData: { flight, route: "KGRR-KDTW", updatetime }

    if (!routeData?.route) {
      return res.status(404).json({ error: 'No route data for this callsign' });
    }

    const [originIcao, destIcao] = routeData.route.split('-');

    // 2. Resolve both airports in parallel
    const [originRes, destRes] = await Promise.all([
      fetch(`https://hexdb.io/api/v1/airport/icao/${originIcao}`),
      fetch(`https://hexdb.io/api/v1/airport/icao/${destIcao}`),
    ]);

    const [origin, dest] = await Promise.all([
      originRes.ok ? originRes.json() : null,
      destRes.ok  ? destRes.json()  : null,
    ]);

    // 3. Fetch aircraft info using hex code if provided
    let aircraft = null;
    if (hex) {
      const cleanHex = hex.trim().toUpperCase();
      const aircraftRes = await fetch(`https://hexdb.io/api/v1/aircraft/${cleanHex}`);
      aircraft = aircraftRes.ok ? await aircraftRes.json() : null;
    }

    return res.status(200).json({
      callsign: clean,
      route: routeData.route,
      routeDataAge: routeData.updatetime, // unix ts — useful to know how stale it is
      origin: origin ? {
        icao:    origin.icao,
        iata:    origin.iata,
        name:    origin.airport,
        city:    origin.region_name,
        country: origin.country_code,
        lat:     origin.latitude,
        lon:     origin.longitude,
      } : { icao: originIcao },          // fallback: at least return the code
      destination: dest ? {
        icao:    dest.icao,
        iata:    dest.iata,
        name:    dest.airport,
        city:    dest.region_name,
        country: dest.country_code,
        lat:     dest.latitude,
        lon:     dest.longitude,
      } : { icao: destIcao },
      aircraft: aircraft ? {
        registration: aircraft.Registration,
        type:         aircraft.Type,           // e.g. "CRJ 900 LR NG"
        icaoType:     aircraft.ICAOTypeCode,   // e.g. "CRJ9" — use this for sprite mapping
        manufacturer: aircraft.Manufacturer,
        operator:     aircraft.RegisteredOwners,
        photoUrl:     aircraft.url_photo_thumbnail ?? null,
      } : null,
    });

  } catch (err) {
    console.error('flight.js error:', err);
    res.status(500).json({ error: 'Failed to fetch flight data' });
  }
}