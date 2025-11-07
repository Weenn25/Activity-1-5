import { useState } from 'react';

interface ForecastDay { date: string; minC: number; maxC: number; minF: number; maxF: number; condition: string; icon?: string | null }
interface WeatherResult {
  city: string;
  temperatureC: number;
  temperatureF: number | string;
  condition: string;
  icon?: string | null;
  provider?: string;
  humidity?: number | null;
  windKph?: number | null;
  sunrise?: string | null;
  sunset?: string | null;
  forecast?: ForecastDay[];
}

function Stat({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-lg bg-white/60 backdrop-blur border border-white/40 p-3 text-center">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-lg font-semibold text-gray-800">{value ?? '—'}</div>
    </div>
  );
}

function App() {
  const [city, setCity] = useState('');
  const [data, setData] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setData(null);
    if (!city.trim()) {
      setError('Please enter a city');
      return;
    }
    setLoading(true);
    try {
      const url = `${API_BASE}/weather?city=${encodeURIComponent(city)}`;
      const res = await fetch(url);
      const contentType = res.headers.get('content-type') || '';
      let json: any;
      if (contentType.includes('application/json')) {
        json = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text.slice(0, 120) + (text.length > 120 ? '...' : ''));
      }
      if (!res.ok) throw new Error(json.error || 'Failed to fetch');
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-indigo-100 via-sky-100 to-cyan-100">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <header className="flex flex-col items-center gap-2 mb-8">
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">Weathering With You</h1>
          <p className="text-gray-600">Panapanahon ang pagkakataon maibabalik ba ang kahapon.</p>
        </header>

        <form onSubmit={onSubmit} className="card shadow-lg border border-white/40 bg-white/70 backdrop-blur flex flex-col sm:flex-row gap-3 items-stretch">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city (e.g., Manila, Tokyo, Paris)"
            className="flex-1 rounded-lg border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 text-white px-6 py-3 font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Fetching...' : 'Get Weather'}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 border border-red-200 text-red-700 p-4 whitespace-pre-wrap">{error}</div>
        )}

        {data && (
          <section className="mt-8">
            <div className="card shadow-lg border border-white/40 bg-white/80 backdrop-blur">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  {data.icon && (
                    <img alt="icon" className="h-16 w-16" src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`} />
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">{data.city}</h2>
                    <p className="text-gray-600">{data.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-6xl leading-none font-extrabold text-indigo-600">{data.temperatureC}°C</div>
                  <div className="text-gray-500">{data.temperatureF}°F</div>
                  {'provider' in (data as any) && (
                    <div className="text-xs text-gray-400 mt-1">source: {(data as any).provider}</div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <Stat label="Humidity" value={data.humidity != null ? `${data.humidity}%` : undefined} />
                <Stat label="Wind" value={data.windKph != null ? `${data.windKph} km/h` : undefined} />
                <Stat label="Sunrise" value={data.sunrise ? new Date(data.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined} />
                <Stat label="Sunset" value={data.sunset ? new Date(data.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined} />
              </div>

              {/* 8‑day forecast */}
              {!!data.forecast?.length && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold mb-3">8‑day forecast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                    {data.forecast.map((d) => (
                      <div key={d.date} className="rounded-xl border border-gray-200 p-4 text-center bg-gradient-to-b from-white to-gray-50">
                        <div className="text-sm text-gray-600">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                        <div className="text-xs text-gray-400">{new Date(d.date).toLocaleDateString()}</div>
                        {d.icon ? (
                          <img alt="icon" className="mx-auto h-10 w-10" src={`https://openweathermap.org/img/wn/${d.icon}.png`} />
                        ) : (
                          <div className="h-10" />
                        )}
                        <div className="mt-1 text-sm"><span className="font-semibold">{d.maxC}°C</span> / <span className="text-gray-600">{d.minC}°C</span></div>
                        <div className="text-xs text-gray-500">{d.condition}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="mt-10 text-center text-sm text-gray-500">
          API Docs: <a className="text-indigo-600 underline" href="http://localhost:5000/api-docs" target="_blank">/api-docs</a>
        </footer>
      </div>
    </div>
  );
}

export default App;
