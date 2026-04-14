import type { CityRecord, WeatherDataWithFallback } from '../models/Weather'

const CITIES_URL =
  'https://data.gov.il/api/3/action/datastore_search?resource_id=8f714b6f-c35c-4b40-a0e7-547b675eee0e&limit=5000'

const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY

const PIABA_BUREAU_TRANSLATIONS: Record<string, string> = {
  'ירושלים': 'Jerusalem',
  'בית שמש': 'Beit Shemesh',
  'באר שבע': "Be'er Sheva",
  'אילת': 'Eilat',
  'אשדוד': 'Ashdod',
  'אשקלון': 'Ashkelon',
  'בני ברק': 'Bnei Brak',
  'הרצליה': 'Herzliya',
  'חדרה': 'Hadera',
  'חולון': 'Holon',
  'חיפה': 'Haifa',
  'טבריה': 'Tiberias',
  'כפר סבא': 'Kfar Saba',
  'כרמיאל': 'Karmiel',
  'נוף הגליל': 'Nof HaGalil',
  'נתניה': 'Netanya',
  'עכו': 'Acre',
  'עפולה': 'Afula',
}

function translatePibaBureauName(name?: string): string | undefined {
  if (!name) {
    return undefined
  }
  const normalized = name.trim()
  return PIABA_BUREAU_TRANSLATIONS[normalized]
}

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
      piba_bureau_code: record.PIBA_bureau_code ?? undefined,
      piba_bureau_name: record.PIBA_bureau_name ?? undefined,
      region_name: record.region_name ?? undefined,
    }))
}

async function fetchCurrentWeather(query: string): Promise<WeatherDataWithFallback> {
  const url = `https://api.weatherapi.com/v1/current.json?key=${encodeURIComponent(
    WEATHER_API_KEY,
  )}&q=${encodeURIComponent(query)}`
  const response = await fetch(url)
  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Weather API error: ${response.status} ${text}`)
  }

  return (await response.json()) as WeatherDataWithFallback
}

async function searchIsraeliCity(cityEn: string) {
  const url = `https://api.weatherapi.com/v1/search.json?key=${encodeURIComponent(
    WEATHER_API_KEY,
  )}&q=${encodeURIComponent(cityEn)}`
  const response = await fetch(url)
  if (!response.ok) {
    return null
  }

  const results = await response.json()
  if (!Array.isArray(results)) {
    return null
  }

  return results.find(
    (item: any) =>
      item && typeof item.country === 'string' &&
      item.country.toLowerCase() === 'israel',
  ) as { name: string; region: string } | null
}

type WeatherQueryFallback = {
  piba_bureau_code?: string
  piba_bureau_name?: string
}

function isIsraeliWeather(data: WeatherDataWithFallback): boolean {
  return data.location?.country?.toLowerCase() === 'israel'
}

export async function fetchWeather(
  cityEn: string,
  fallbackData?: WeatherQueryFallback,
): Promise<WeatherDataWithFallback> {
  if (!WEATHER_API_KEY) {
    throw new Error(
      'Missing API key. Create a .env file with VITE_WEATHER_API_KEY=<api-key>',
    )
  }

  const queries = [cityEn, `${cityEn}, Israel`]
  const fallbackPibaEnglish = translatePibaBureauName(fallbackData?.piba_bureau_name)
  if (fallbackPibaEnglish) {
    queries.push(`${fallbackPibaEnglish}, Israel`)
  } else if (fallbackData?.piba_bureau_name) {
    queries.push(`${fallbackData.piba_bureau_name}, Israel`)
  }

  let firstSuccess: WeatherDataWithFallback | null = null

  for (const query of queries) {
    try {
      const result = await fetchCurrentWeather(query)
      if (!firstSuccess) {
        firstSuccess = result
      }
      if (isIsraeliWeather(result)) {
        if (query === cityEn || query === `${cityEn}, Israel`) {
          return result
        }

        return {
          ...result,
          fallbackLocation: query,
          fallbackSource: 'piba',
          fallbackBureauCode: fallbackData?.piba_bureau_code,
        }
      }
    } catch {
      continue
    }
  }

  const fallback = await searchIsraeliCity(cityEn)
  if (fallback) {
    const query = `${fallback.name}${fallback.region ? `, ${fallback.region}` : ''}`
    const result = await fetchCurrentWeather(query)
    return {
      ...result,
      fallbackLocation: query,
      fallbackSource: 'search',
    }
  }

  if (firstSuccess) {
    return firstSuccess
  }

  throw new Error('Unable to retrieve weather for selected city')
}
