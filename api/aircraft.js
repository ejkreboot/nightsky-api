export default async function handler(req, res) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lon, dist = 50 } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'lat and lon are required' });
  }

  try {
    const url = `https://api.adsb.lol/v2/lat/${lat}/lon/${lon}/dist/${dist}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Upstream API error' });
    }

    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=10'); // cache 10s at edge
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch aircraft data' });
  }
}