export class WeatherApiError extends Error {
  constructor(message, status = null) {
    super(message);
    this.name = "WeatherApiError";
    this.status = status;
  }
}

async function requestJson(url, signal) {
  let response;
  try {
    response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new WeatherApiError("Could not connect. Check your internet connection and try again.");
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new WeatherApiError("Too many requests right now. Please wait a moment and try again.", 429);
    }
    if (response.status >= 500) {
      throw new WeatherApiError("The weather service is temporarily unavailable. Please try again shortly.", response.status);
    }
    throw new WeatherApiError("The weather service could not complete your request. Please try again.", response.status);
  }

  try {
    return await response.json();
  } catch {
    throw new WeatherApiError("The weather service returned an unreadable response.");
  }
}

export function validateLocationQuery(value) {
  const query = typeof value === "string" ? value.trim() : "";
  if (query.length < 2) {
    throw new WeatherApiError("Enter at least two characters to search for a place.");
  }
  if (query.length > 100) {
    throw new WeatherApiError("Search terms must be 100 characters or fewer.");
  }
  return query;
}

export async function searchLocations(value, signal) {
  const query = validateLocationQuery(value);
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: query,
    count: "8",
    language: "en",
    format: "json"
  });
  const result = await requestJson(url, signal);
  if (!result || (result.results !== undefined && !Array.isArray(result.results))) {
    throw new WeatherApiError("The location service returned invalid search results.");
  }
  return (result.results || []).filter((item) =>
    item && typeof item.name === "string" &&
    Number.isFinite(item.latitude) && Number.isFinite(item.longitude)
  );
}

export async function fetchForecast(location, signal) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,wind_direction_10m",
    hourly: "temperature_2m,precipitation_probability,weather_code,is_day",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    forecast_days: "7",
    timezone: "auto",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm"
  });
  const result = await requestJson(url, signal);
  const validCurrent = result?.current && typeof result.current.time === "string";
  const validHourly = result?.hourly && Array.isArray(result.hourly.time);
  const validDaily = result?.daily && Array.isArray(result.daily.time);
  if (!validCurrent || !validHourly || !validDaily) {
    throw new WeatherApiError("The weather service returned incomplete forecast data.");
  }
  return result;
}
