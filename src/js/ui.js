import { interpretWeatherCode } from "./weather-codes.js";
import { convertPrecipitation, convertTemperature, convertWindSpeed, formatNumber, formatTemperature, unitLabel } from "./units.js";

const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);

function iconMarkup(kind, size = "normal") {
  const common = `class="weather-svg weather-svg--${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true"`;
  const cloud = '<path class="icon-cloud" d="M45.4 40.5H20a12.5 12.5 0 1 1 2.2-24.8A16 16 0 0 1 52 23.1a9 9 0 0 1-6.6 17.4Z"/>';
  const rays = '<g class="icon-rays"><path d="M32 4v7m0 42v7M4 32h7m42 0h7M12.2 12.2l5 5m29.6 29.6 5 5m0-39.6-5 5m-29.6 29.6-5 5"/></g>';
  let content;
  switch (kind) {
    case "clear": content = `${rays}<circle class="icon-sun" cx="32" cy="32" r="13"/>`; break;
    case "night": content = '<path class="icon-moon" d="M42 43.5A22 22 0 0 1 20.5 10 23 23 0 1 0 54 39a21 21 0 0 1-12 4.5Z"/>'; break;
    case "partly-cloudy": content = `${rays}<circle class="icon-sun" cx="39" cy="25" r="10"/>${cloud}`; break;
    case "cloudy": content = cloud; break;
    case "fog": content = `${cloud}<path class="icon-rain" d="M13 49h34M19 56h27"/>`; break;
    case "drizzle":
    case "rain":
    case "showers":
    case "heavy-rain":
    case "freezing-rain": content = `${cloud}<path class="icon-rain" d="m23 47-3 7m15-7-3 7m15-7-3 7"/>`; break;
    case "snow":
    case "heavy-snow": content = `${cloud}<path class="icon-snow" d="M21 49v8m-3-5 6 3m0-6-6 6m15-6v8m-3-5 6 3m0-6-6 6m15-6v8m-3-5 6 3m0-6-6 6"/>`; break;
    case "thunderstorm": content = `${cloud}<path class="icon-lightning" d="m34 43-9 12h9l-4 8 14-16h-9l5-4"/>`; break;
    default: content = '<circle class="icon-unknown" cx="32" cy="32" r="21"/><path class="icon-unknown" d="M32 29v13m0-21v2"/>';
  }
  return `<svg ${common}>${content}</svg>`;
}

function formatLocalTime(value, options = {}) {
  if (typeof value !== "string") return "—";
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (!match) return "—";
  const hour = Number(match[1]);
  const minute = match[2];
  const date = new Date(Date.UTC(2020, 0, 1, hour, Number(minute)));
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    ...(options.weekday ? { weekday: "short" } : {}),
    timeZone: "UTC"
  }).format(date);
}

function formatDay(value, index) {
  if (index === 0) return "Today";
  const date = new Date(`${value}T12:00:00Z`);
  return new Intl.DateTimeFormat(undefined, { weekday: "long", timeZone: "UTC" }).format(date);
}

function directionLabel(degrees) {
  if (!Number.isFinite(degrees)) return "";
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(degrees / 45) % 8];
}

function setText(id, value) {
  byId(id).textContent = value;
}

export function showFeedback(message, type = "info") {
  const feedback = byId("feedback");
  feedback.textContent = message;
  feedback.className = `feedback feedback--${type}`;
  feedback.hidden = false;
}

export function clearFeedback() {
  byId("feedback").hidden = true;
  byId("feedback").textContent = "";
}

export function setLoading(loading) {
  document.body.classList.toggle("is-loading", loading);
  byId("refresh-button").disabled = loading;
  byId("geolocation-button").disabled = loading;
  document.querySelector("#search-form button[type='submit']").disabled = loading;
  byId("search-form").setAttribute("aria-busy", String(loading));
  byId("search-form").classList.toggle("is-loading", loading);
}

export function renderSearchResults(locations) {
  const feedback = byId("feedback");
  if (locations.length === 0) {
    showFeedback("We couldn’t find that place. Check the spelling or try adding a region or country.", "error");
    return;
  }
  feedback.className = "feedback feedback--results";
  feedback.innerHTML = `<span class="results-label">${locations.length === 1 ? "ONE PLACE FOUND" : `${locations.length} PLACES FOUND`}</span><div class="result-list">${locations.map((location, index) => {
    const detail = [location.admin1, location.country].filter(Boolean).join(", ");
    return `<button class="result-option" type="button" data-result-index="${index}"><span><strong>${escapeHtml(location.name)}</strong><small>${escapeHtml(detail || location.timezone || "Location")}</small></span><span class="result-arrow" aria-hidden="true">↗</span></button>`;
  }).join("")}</div>`;
  feedback.hidden = false;
}

export function renderRecentLocations(locations) {
  const wrap = byId("recent-wrap");
  const select = byId("recent-select");
  wrap.hidden = locations.length === 0;
  select.replaceChildren(new Option("Recent locations", ""));
  locations.forEach((location, index) => {
    const detail = [location.name, location.admin1, location.country].filter(Boolean).join(", ");
    select.add(new Option(detail, String(index)));
  });
}

export function renderWeather(location, data, unit, retrievedAt = new Date()) {
  const labels = unitLabel(unit);
  const current = data.current;
  const place = [location.name, location.country].filter(Boolean).join(", ");
  const detail = [location.admin1, location.country].filter(Boolean).join(" · ");
  setText("location-name", place || "Selected location");
  setText("location-detail", detail || data.timezone || "");
  const currentTemperature = formatTemperature(current.temperature_2m, unit);
  setText("current-temperature", currentTemperature === "—" ? "—" : `${currentTemperature}${labels.temperature.slice(1)}`);
  const currentCondition = interpretWeatherCode(current.weather_code, current.is_day !== 0);
  setText("current-condition", currentCondition.description);
  byId("current-icon").innerHTML = iconMarkup(currentCondition.icon, "large");
  const retrievalTime = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    ...(data.timezone ? { timeZone: data.timezone } : {})
  }).format(retrievedAt);
  setText("updated-at", `Retrieved at ${retrievalTime}${data.timezone_abbreviation ? ` ${data.timezone_abbreviation}` : ""}`);

  const feels = convertTemperature(current.apparent_temperature, unit);
  setText("feels-like", feels === null ? "—" : `${formatNumber(feels)}${labels.temperature}`);
  setText("humidity", Number.isFinite(current.relative_humidity_2m) ? `${formatNumber(current.relative_humidity_2m)}%` : "—");
  const wind = convertWindSpeed(current.wind_speed_10m, unit);
  const bearing = directionLabel(current.wind_direction_10m);
  setText("wind", wind === null ? "—" : `${bearing ? `${bearing} ` : ""}${formatNumber(wind)} ${labels.wind}`);
  const precipitation = convertPrecipitation(current.precipitation, unit);
  setText("precipitation", precipitation === null ? "—" : `${formatNumber(precipitation, 1)} ${labels.precipitation}`);
  renderHourly(data.hourly, current.time, unit);
  renderDaily(data.daily, unit);
  byId("empty-state").hidden = true;
  byId("weather-content").hidden = false;
}

function renderHourly(hourly, currentTime, unit) {
  const container = byId("hourly-forecast");
  let start = hourly.time.findIndex((time) => time >= currentTime);
  if (start < 0) start = 0;
  const entries = hourly.time.slice(start, start + 24);
  if (!entries.length) {
    container.innerHTML = '<p class="forecast-unavailable">Hourly forecast is not available.</p>';
    return;
  }
  container.innerHTML = entries.map((time, offset) => {
    const index = start + offset;
    const info = interpretWeatherCode(hourly.weather_code?.[index], (hourly.is_day?.[index] ?? 1) !== 0);
    const probability = hourly.precipitation_probability?.[index];
    return `<article class="hour-card"><span class="hour-time">${offset === 0 ? "Now" : formatLocalTime(time)}</span>${iconMarkup(info.icon)}<strong class="hour-temp">${formatTemperature(hourly.temperature_2m?.[index], unit)}</strong><span class="hour-rain">${Number.isFinite(probability) ? `<span aria-label="${formatNumber(probability)} percent chance of precipitation">⌁ ${formatNumber(probability)}%</span>` : "—"}</span></article>`;
  }).join("");
}

function renderDaily(daily, unit) {
  const container = byId("daily-forecast");
  const entries = daily.time.slice(0, 7);
  if (!entries.length) {
    container.innerHTML = '<p class="forecast-unavailable">Daily forecast is not available.</p>';
    return;
  }
  container.innerHTML = entries.map((date, index) => {
    const info = interpretWeatherCode(daily.weather_code?.[index], true);
    const probability = daily.precipitation_probability_max?.[index];
    return `<article class="day-row"><span class="day-name">${formatDay(date, index)}</span><span class="day-condition">${iconMarkup(info.icon)}<span>${info.description}</span></span><span class="day-rain">${Number.isFinite(probability) ? `⌁ ${formatNumber(probability)}%` : "—"}</span><span class="day-temperatures"><span>${formatTemperature(daily.temperature_2m_min?.[index], unit)}</span><strong>${formatTemperature(daily.temperature_2m_max?.[index], unit)}</strong></span></article>`;
  }).join("");
}

export function renderUnitSelection(unit) {
  document.querySelectorAll("[data-unit]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.unit === unit));
  });
}

export function setSearchValue(value) {
  byId("location-search").value = value;
}

export function showLoadingMessage(message) {
  showFeedback(message, "loading");
}
