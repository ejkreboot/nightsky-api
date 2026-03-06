# NightSky API

A serverless API for fetching real-time aircraft position data based on geographic coordinates.

## Description

NightSky API provides a simple endpoint to query aircraft positions within a specified distance from a given latitude/longitude coordinate. The API proxies requests to [adsb.lol](https://api.adsb.lol) with built-in CORS support and edge caching.

## API Endpoint

```
GET /api/aircraft?lat={latitude}&lon={longitude}&dist={distance}
```

### Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `lat` | float | Yes | - | Latitude coordinate (-90 to 90) |
| `lon` | float | Yes | - | Longitude coordinate (-180 to 180) |
| `dist` | integer | No | 50 | Distance radius in nautical miles |

### Example Request

```bash
curl "https://your-domain.com/api/aircraft?lat=40.7128&lon=-74.0060&dist=100"
```

### Response

Returns JSON data containing aircraft information within the specified radius, including:
- Aircraft identification
- Position (lat/lon/altitude)
- Speed and heading
- Flight number (if available)


### Local Development

Deploy to Vercel or another serverless platform that supports Node.js functions.

## Deployment

This API is designed for serverless deployment on platforms like:
- Vercel
- Netlify Functions
- AWS Lambda

The `/api` directory contains the serverless function handlers.

## CORS Configuration

The API is configured to allow requests from `https://ejkreboot.github.io`. To modify the allowed origin, update the `Access-Control-Allow-Origin` header in [api/aircraft.js](api/aircraft.js).

## License

See LICENSE file for details.

## Credits

Aircraft data provided by [adsb.lol](https://api.adsb.lol)
