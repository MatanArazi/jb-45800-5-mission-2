import type { CityRecord, WeatherData } from '../models/Weather'

const CITIES_URL =
  'https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=5000'

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export async function fetchCities(): Promise<CityRecord[]> {
  const response = await fetch(CITIES_URL)
  if (!response.ok) {
    throw new Error('Unable to load city list')
  }

  const data = await response.json()
  const records = data?.result?.records
  if (!Array.isArray(records)) {
    throw new Error('City list data format is invalid')
  }

  return records
    .filter(
      (record: any) =>
        typeof record.city_name_he === 'string' &&
        typeof record.city_name_en === 'string' &&
        record.city_name_en.trim().length > 0,
    )
    .map((record: any) => ({
      city_name_he: record.city_name_he,
      city_name_en: record.city_name_en,
    }))
}

export async function fetchWeather(cityEn: string): Promise<WeatherData> {
  if (!WEATHER_API_KEY) {
    throw new Error(
      'Missing API key. Create a .env file with VITE_WEATHER_API_KEY=<api-key>',
    )
  }

  const url = `https://api.weatherapi.com/v1/current.json?key=${encodeURIComponent(
    WEATHER_API_KEY,
  )}&q=${encodeURIComponent(cityEn)}`
  const response = await fetch(url)

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Weather API error: ${response.status} ${text}`)
  }

  const data = await response.json()
  return data as WeatherData
}
