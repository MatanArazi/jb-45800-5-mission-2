export interface CityRecord {
  city_name_he: string
  city_name_en: string
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

export interface SearchHistoryItem {
  id: string
  when: string
  cityHe: string
  cityEn: string
  country: string
}
