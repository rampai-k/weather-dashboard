import { fetchForecast, searchLocations, WeatherApiError } from "./api.js";
import { clearRecentLocations, getRecentLocations, saveRecentLocation } from "./storage.js";
import * as ui from "./ui.js";

let selectedLocation = null;
let currentForecast = null;
let lastRetrievedAt = null;
let temperatureUnit = "celsius";
let searchController = null;
let forecastController = null;
let searchSequence = 0;
let forecastSequence = 0;
let availableResults = [];

function formatLocationLabel(location) {
  return [location.name, location.country].filter(Boolean).join(", ");
}

async function loadForecast(location, { saveRecent = true } = {}) {
  searchController?.abort();
  searchSequence += 1;
  forecastController?.abort();
  forecastController = new AbortController();
  const sequence = ++forecastSequence;
  selectedLocation = location;
  ui.clearFeedback();
  ui.setLoading(true);
  ui.showLoadingMessage(`Loading the forecast for ${formatLocationLabel(location)}…`);
  try {
    const forecast = await fetchForecast(location, forecastController.signal);
    if (sequence !== forecastSequence) return;
    currentForecast = forecast;
    lastRetrievedAt = new Date();
    ui.renderWeather(location, forecast, temperatureUnit, lastRetrievedAt);
    ui.clearFeedback();
    if (saveRecent) ui.renderRecentLocations(saveRecentLocation(location));
  } catch (error) {
    if (error.name === "AbortError" || sequence !== forecastSequence) return;
    ui.showFeedback(error instanceof WeatherApiError ? error.message : "Something went wrong while loading the forecast. Please try again.", "error");
  } finally {
    if (sequence === forecastSequence) ui.setLoading(false);
  }
}

async function handleSearch(query) {
  searchController?.abort();
  searchController = new AbortController();
  const sequence = ++searchSequence;
  try {
    ui.clearFeedback();
    ui.setLoading(true);
    ui.showLoadingMessage("Finding places…");
    const results = await searchLocations(query, searchController.signal);
    if (sequence !== searchSequence) return;
    availableResults = results;
    ui.setLoading(false);
    ui.renderSearchResults(results);
  } catch (error) {
    if (error.name === "AbortError" || sequence !== searchSequence) return;
    ui.setLoading(false);
    ui.showFeedback(error instanceof WeatherApiError ? error.message : "Something went wrong while searching. Please try again.", "error");
  }
}

function selectLocation(location, options) {
  ui.setSearchValue(location.name);
  void loadForecast(location, options);
}

function handleGeolocation() {
  if (!navigator.geolocation) {
    ui.showFeedback("Location services aren’t available in this browser. Search for a city instead.", "error");
    return;
  }
  ui.setLoading(true);
  ui.showLoadingMessage("Finding your current location…");
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => selectLocation({
      name: "Your location",
      latitude: coords.latitude,
      longitude: coords.longitude
    }, { saveRecent: false }),
    (error) => {
      ui.setLoading(false);
      const messages = {
        1: "Location permission was denied. You can search for a city instead.",
        2: "Your location couldn’t be determined. Check your device location settings and try again.",
        3: "Location lookup took too long. Please try again."
      };
      ui.showFeedback(messages[error.code] || "Your location is unavailable. Search for a city instead.", "error");
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
}

document.getElementById("search-form").addEventListener("submit", (event) => {
  event.preventDefault();
  void handleSearch(document.getElementById("location-search").value);
});

document.getElementById("feedback").addEventListener("click", (event) => {
  const button = event.target.closest("[data-result-index]");
  if (!button) return;
  const location = availableResults[Number(button.dataset.resultIndex)];
  if (location) selectLocation(location);
});

document.querySelectorAll("[data-query]").forEach((button) => {
  button.addEventListener("click", () => {
    const query = button.dataset.query;
    ui.setSearchValue(query);
    void handleSearch(query);
  });
});

document.querySelectorAll("[data-unit]").forEach((button) => {
  button.addEventListener("click", () => {
    temperatureUnit = button.dataset.unit;
    ui.renderUnitSelection(temperatureUnit);
    if (currentForecast && selectedLocation) {
      ui.renderWeather(selectedLocation, currentForecast, temperatureUnit, lastRetrievedAt);
    }
  });
});

document.getElementById("geolocation-button").addEventListener("click", handleGeolocation);
document.getElementById("refresh-button").addEventListener("click", () => {
  if (selectedLocation) void loadForecast(selectedLocation, { saveRecent: false });
});
document.getElementById("clear-recent").addEventListener("click", () => {
  clearRecentLocations();
  ui.renderRecentLocations([]);
});
document.getElementById("recent-select").addEventListener("change", (event) => {
  const location = getRecentLocations()[Number(event.target.value)];
  if (location) selectLocation(location);
  event.target.value = "";
});

ui.renderRecentLocations(getRecentLocations());
ui.renderUnitSelection(temperatureUnit);
