import { useEffect, useState, type ChangeEvent } from 'react'
import { fetchCities, fetchWeather } from '../../services/api'
import type { CityRecord, SearchHistoryItem, WeatherData } from '../../models/Weather'

const STORAGE_KEY = 'weather-search-history'

function loadHistory(): SearchHistoryItem[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as SearchHistoryItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHistory(history: SearchHistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
}

export default function Home() {
  const [cities, setCities] = useState<CityRecord[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingWeather, setLoadingWeather] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    async function load() {
      setLoadingCities(true)
      setError(null)
      try {
        const records = await fetchCities()
        const sorted = [...records].sort((a, b) => a.city_name_he.localeCompare(b.city_name_he, 'he'))
        setCities(sorted)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load city list')
      } finally {
        setLoadingCities(false)
      }
    }

    load()
  }, [])

  async function handleCityChange(event: ChangeEvent<HTMLSelectElement>) {
    const cityEn = event.target.value
    setSelectedCity(cityEn)
    setWeather(null)
    setError(null)

    if (!cityEn) {
      return
    }

    const selectedRecord = cities.find((city) => city.city_name_en === cityEn)
    setLoadingWeather(true)

    try {
      const data = await fetchWeather(cityEn)
      setWeather(data)

      const item: SearchHistoryItem = {
        id: crypto.randomUUID?.() ?? `${Date.now()}`,
        when: new Date().toLocaleString('he-IL', {
          dateStyle: 'short',
          timeStyle: 'short',
        }),
        cityHe: selectedRecord?.city_name_he ?? cityEn,
        cityEn,
        country: data.location.country,
      }

      setHistory((previousHistory) => {
        const nextHistory = [item, ...previousHistory].slice(0, 20)
        saveHistory(nextHistory)
        return nextHistory
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load weather data')
    } finally {
      setLoadingWeather(false)
    }
  }

  return (
    <section className="page-card">
      <h2 className="section-title">Current Weather by Location</h2>
      <div className="content-box">
        <label htmlFor="city-select" className="label">
          Choose a city:
        </label>
        <div className="select-row">
          <select
            id="city-select"
            value={selectedCity}
            onChange={handleCityChange}
            disabled={loadingCities}
          >
            <option value="">Select a city</option>
            {cities.map((city) => (
              <option key={city.city_name_en} value={city.city_name_en}>
                {city.city_name_he}
              </option>
            ))}
          </select>
          {loadingCities && <span className="pill">Loading cities...</span>}
        </div>

        {error && <p className="error-message">{error}</p>}

        {loadingWeather && <p className="status-message">Loading weather...</p>}

        {weather && (
          <article className="weather-card">
            <div className="weather-header">
              <div>
                <p className="meta-label">Country</p>
                <p>{weather.location.country}</p>
              </div>
              <div>
                <p className="meta-label">City</p>
                <p>{weather.location.name}</p>
              </div>
              <div>
                <p className="meta-label">Temperature</p>
                <p>{weather.current.temp_c.toFixed(1)}°C</p>
              </div>
            </div>
            <div className="weather-details">
              <div className="weather-field">
                <p className="meta-label">Description</p>
                <p>{weather.current.condition.text}</p>
              </div>
              <div className="weather-field">
                <p className="meta-label">Wind speed</p>
                <p>{weather.current.wind_kph.toFixed(1)} kph</p>
              </div>
              <div className="weather-icon">
                <img src={weather.current.condition.icon} alt={weather.current.condition.text} />
              </div>
            </div>
          </article>
        )}
      </div>

      <section className="history-teaser">
        <h3 className="section-subtitle">Recent search history</h3>
        {history.length === 0 ? (
          <p className="status-message">No searches yet.</p>
        ) : (
          <div className="history-inline">
            {history.slice(0, 3).map((item) => (
              <div key={item.id} className="history-item">
                <span>{item.when}</span>
                <strong>{item.cityHe}</strong>
                <span>{item.country}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  )
}
