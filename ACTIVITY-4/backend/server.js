const express = require('express');
const cors = require('cors');
const axios = require('axios');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather Proxy API',
      version: '1.1.0',
      description: 'Proxy service to fetch weather data from OpenWeatherMap (with Open‑Meteo fallback) and an 8‑day forecast.',
    },
    servers: [{ url: 'http://localhost:5000' }],
  },
  apis: ['server.js'],
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const cache = new Map(); // key: cityLower, value: { data, expires }

// Ensure we always return 8 placeholder days if upstream daily forecast missing
function buildPlaceholderForecast() {
  const out = [];
  for (let i = 0; i < 8; i++) {
    const dt = new Date(Date.now() + i * 86400000).toISOString().slice(0, 10);
    out.push({
      date: dt,
      minC: null,
      maxC: null,
      minF: null,
      maxF: null,
      condition: 'N/A',
      icon: null,
    });
  }
  return out;
}

// Map Open-Meteo weather codes to simple conditions
function mapOpenMeteoCodeToCondition(code) {
  const groups = {
    Clear: [0, 1],
    Cloudy: [2, 3],
    Fog: [45, 48],
    Drizzle: [51, 53, 55, 56, 57],
    Rain: [61, 63, 65, 66, 67, 80, 81, 82],
    Snow: [71, 73, 75, 77, 85, 86],
    Thunderstorm: [95, 96, 99],
  };
  for (const [name, codes] of Object.entries(groups)) {
    if (codes.includes(code)) return name;
  }
  return 'Unknown';
}

// Approximate Open‑Meteo codes to OpenWeather icon codes (daytime variants)
function mapMeteoCodeToOwmIcon(code) {
  if ([0, 1].includes(code)) return '01d'; // clear
  if ([2].includes(code)) return '02d'; // few clouds
  if ([3].includes(code)) return '03d'; // scattered clouds
  if ([45, 48].includes(code)) return '50d'; // fog/mist
  if ([51, 53, 55, 56, 57].includes(code)) return '09d'; // drizzle
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '10d'; // rain
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '13d'; // snow
  if ([95, 96, 99].includes(code)) return '11d'; // thunderstorm
  return '03d';
}

// Map OpenWeather main condition to icon code
function mapMainToOwmIcon(main) {
  const m = String(main || '').toLowerCase();
  if (m.includes('thunder')) return '11d';
  if (m.includes('drizzle')) return '09d';
  if (m.includes('rain')) return '10d';
  if (m.includes('snow')) return '13d';
  if (m.includes('mist') || m.includes('fog') || m.includes('haze') || m.includes('smoke')) return '50d';
  if (m.includes('few')) return '02d';
  if (m.includes('scattered')) return '03d';
  if (m.includes('broken') || m.includes('overcast') || m.includes('cloud')) return '04d';
  if (m.includes('clear')) return '01d';
  return '03d';
}

// Helper: round to 1 decimal
const round1 = (n) => Number(Number(n).toFixed(1));

/**
 * @openapi
 * /api/weather:
 *   get:
 *     summary: Get current weather and 8-day forecast by city.
 *     parameters:
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         required: true
 *         description: City name (e.g. Manila)
 *     responses:
 *       200:
 *         description: Weather info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 city: { type: string }
 *                 temperatureC: { type: number }
 *                 temperatureF: { type: number }
 *                 condition: { type: string }
 *                 icon: { type: string, nullable: true }
 *                 provider: { type: string }
 *                 forecast:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date: { type: string }
 *                       minC: { type: number }
 *                       maxC: { type: number }
 *                       minF: { type: number }
 *                       maxF: { type: number }
 *                       condition: { type: string }
 *                       icon: { type: string, nullable: true }
 *                 humidity: { type: number, nullable: true }
 *                 windKph: { type: number, nullable: true }
 *                 sunrise: { type: string, nullable: true }
 *                 sunset: { type: string, nullable: true }
 *       400:
 *         description: Missing city
 *       500:
 *         description: Upstream error
 */
app.get('/api/weather', async (req, res) => {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: 'city is required' });

  const cityKey = String(city).trim().toLowerCase();
  const now = Date.now();
  const skipCache = String(req.query.refresh || '') === '1';
  const hit = cache.get(cityKey);
  if (!skipCache && hit && hit.expires > now) return res.json(hit.data);

  const apiKey = process.env.OPENWEATHER_API_KEY;

  const respond = (payload) => {
    cache.set(cityKey, { data: payload, expires: now + 2 * 60 * 1000 });
    return res.json(payload);
  };

  // Try OpenWeatherMap first
  try {
    if (!apiKey) throw Object.assign(new Error('missing key'), { code: 'NO_KEY' });

    // Current weather + coordinates
    const { data: cur } = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: { q: city, appid: apiKey, units: 'metric' },
      timeout: 8000,
    });

    const lat = cur.coord?.lat;
    const lon = cur.coord?.lon;

    let forecast = [];
    try {
      const oc = await axios.get('https://api.openweathermap.org/data/3.0/onecall', {
        params: { lat, lon, exclude: 'minutely,hourly,alerts', units: 'metric', appid: apiKey },
        timeout: 8000,
      });
      const daily = Array.isArray(oc.data?.daily) ? oc.data.daily : [];
      console.log('OWM daily length:', daily.length);
      forecast = daily.slice(0, 8).map((d) => {
        const minC = d?.temp?.min ?? null;
        const maxC = d?.temp?.max ?? null;
        const w = Array.isArray(d?.weather) && d.weather[0] ? d.weather[0] : {};
        return {
          date: d?.dt ? new Date(d.dt * 1000).toISOString().slice(0, 10) : null,
          minC,
          maxC,
          minF: minC != null ? round1((minC * 9) / 5 + 32) : null,
          maxF: maxC != null ? round1((maxC * 9) / 5 + 32) : null,
          condition: w.main || 'Unknown',
          icon: w.icon || mapMainToOwmIcon(w.main),
        };
      });
    } catch (e) {
      console.warn('OWM onecall failed or missing daily:', e?.response?.status || e?.message);
    }

    // Always try Open‑Meteo daily as a secondary source to fill/augment forecast
    try {
      if (!forecast.length && lat != null && lon != null) {
        const meteoDaily = await axios.get('https://api.open-meteo.com/v1/forecast', {
          params: {
            latitude: lat,
            longitude: lon,
            daily: 'temperature_2m_min,temperature_2m_max,weather_code',
            forecast_days: 8,
            timezone: 'auto',
          },
          timeout: 8000,
        });
        const daily = meteoDaily.data?.daily || {};
        const times = Array.isArray(daily.time) ? daily.time : [];
        console.log('Open‑Meteo times length:', times.length);
        if (times.length) {
          forecast = times.map((t, i) => {
            const minC = daily.temperature_2m_min?.[i];
            const maxC = daily.temperature_2m_max?.[i];
            const wcode = daily.weather_code?.[i];
            return {
              date: t,
              minC,
              maxC,
              minF: minC != null ? round1((minC * 9) / 5 + 32) : null,
              maxF: maxC != null ? round1((maxC * 9) / 5 + 32) : null,
              condition: mapOpenMeteoCodeToCondition(wcode),
              icon: mapMeteoCodeToOwmIcon(wcode),
            };
          });
        }
      }
    } catch (e) {
      console.warn('Open‑Meteo daily fetch failed:', e?.response?.status || e?.message);
    }

    // Final safety: never return an empty forecast
    if (!forecast.length) {
      console.warn('Using placeholder forecast (no upstream daily data)');
      forecast = buildPlaceholderForecast();
    }

    const result = {
      city: cur.name,
      temperatureC: cur?.main?.temp,
      temperatureF: cur?.main?.temp != null ? round1((cur.main.temp * 9) / 5 + 32) : null,
      condition: Array.isArray(cur?.weather) && cur.weather[0]?.main ? cur.weather[0].main : 'Unknown',
      icon: Array.isArray(cur?.weather) ? cur.weather[0]?.icon || null : null,
      humidity: cur?.main?.humidity ?? null,
      windKph: cur?.wind?.speed != null ? round1(cur.wind.speed * 3.6) : null,
      sunrise: cur?.sys?.sunrise ? new Date(cur.sys.sunrise * 1000).toISOString() : null,
      sunset: cur?.sys?.sunset ? new Date(cur.sys.sunset * 1000).toISOString() : null,
      provider: 'openweathermap',
      forecast,
    };

    console.log('Final forecast length:', Array.isArray(result.forecast) ? result.forecast.length : 'n/a');

    if (!result.forecast || !result.forecast.length) {
      result.forecast = buildPlaceholderForecast();
    }

    return respond(result);
  } catch (err) {
    const status = err?.response?.status;
    const shouldFallback = !apiKey || [401, 403, 429, 500, 502, 503, 504].includes(status || 0);
    if (!shouldFallback) {
      const message = err?.response?.data?.message || err.message || 'Failed to fetch weather data';
      return res.status(status || 500).json({ error: message });
    }
  }

  // Fallback: Open‑Meteo for current and 8‑day
  try {
    const geo = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name: city, count: 1, language: 'en', format: 'json' },
      timeout: 8000,
    });
    if (!geo.data?.results?.length) return res.status(404).json({ error: `City not found: ${city}` });

    const { latitude, longitude, name } = geo.data.results[0];

    const meteo = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        current: 'temperature_2m,weather_code,relative_humidity_2m,wind_speed_10m',
        daily: 'temperature_2m_min,temperature_2m_max,weather_code,sunrise,sunset',
        forecast_days: 8,
        timezone: 'auto',
      },
      timeout: 8000,
    });

    const tempC = meteo.data?.current?.temperature_2m;
    const code = meteo.data?.current?.weather_code;
    const humidity = meteo.data?.current?.relative_humidity_2m ?? null;
    const windKph = meteo.data?.current?.wind_speed_10m ?? null;

    const d = meteo.data?.daily || {};

    const result = {
      city: name,
      temperatureC: tempC,
      temperatureF: tempC != null ? round1((tempC * 9) / 5 + 32) : null,
      condition: mapOpenMeteoCodeToCondition(code),
      icon: mapMeteoCodeToOwmIcon(code),
      humidity,
      windKph,
      sunrise: Array.isArray(d.sunrise) ? d.sunrise[0] : null,
      sunset: Array.isArray(d.sunset) ? d.sunset[0] : null,
      provider: 'open-meteo',
      forecast: Array.isArray(d.time)
        ? d.time.map((t, i) => {
            const minC = d.temperature_2m_min?.[i];
            const maxC = d.temperature_2m_max?.[i];
            const wcode = d.weather_code?.[i];
            return {
              date: t,
              minC,
              maxC,
              minF: minC != null ? round1((minC * 9) / 5 + 32) : null,
              maxF: maxC != null ? round1((maxC * 9) / 5 + 32) : null,
              condition: mapOpenMeteoCodeToCondition(wcode),
              icon: mapMeteoCodeToOwmIcon(wcode),
            };
          })
        : [],
    };

    if (!result.forecast || !result.forecast.length) {
      result.forecast = buildPlaceholderForecast();
    }

    return respond(result);
  } catch (err) {
    const message = err?.response?.data || err.message || 'Failed to fetch weather data';
    return res.status(500).json({ error: typeof message === 'string' ? message : 'Upstream error' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server running on port ${port}`));
