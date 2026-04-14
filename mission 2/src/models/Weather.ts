export interface CityRecord {
  city_name_he: string
  city_name_en: string
  piba_bureau_code?: string
  piba_bureau_name?: string
  region_name?: string
}

export interface WeatherCondition {
  text: string
  icon: string
}

export interface WeatherCurrent {
  temp_c: number
  wind_kph: number
  condition: WeatherCondition
}

export interface WeatherLocation {
  name: string
  country: string
}

export interface WeatherData {
  location: WeatherLocation
  current: WeatherCurrent
}

export interface WeatherDataWithFallback extends WeatherData {
  fallbackLocation?: string
  fallbackSource?: 'piba' | 'search'
  fallbackBureauCode?: string
}

export interface SearchHistoryItem {
  id: string
  when: string
  cityHe: string
  cityEn: string
  country: string
}
