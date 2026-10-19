const STORAGE_KEY = "weather-dashboard.recent-locations";
const MAX_RECENT_LOCATIONS = 5;

function browserStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function readLocations(storage) {
  if (!storage) return [];
  try {
    const parsed = JSON.parse(storage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((location) =>
      location &&
      typeof location.name === "string" &&
      Number.isFinite(location.latitude) &&
      Number.isFinite(location.longitude)
    ).slice(0, MAX_RECENT_LOCATIONS);
  } catch {
    return [];
  }
}

function locationKey(location) {
  return `${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`;
}

export function getRecentLocations(storage = browserStorage()) {
  try {
    return readLocations(storage);
  } catch {
    return [];
  }
}

export function saveRecentLocation(location, storage = browserStorage()) {
  if (!location || typeof location.name !== "string" ||
      !Number.isFinite(location.latitude) || !Number.isFinite(location.longitude)) {
    return getRecentLocations(storage);
  }
  const next = [
    { name: location.name, admin1: location.admin1 || "", country: location.country || "",
      country_code: location.country_code || "", latitude: location.latitude, longitude: location.longitude },
    ...getRecentLocations(storage).filter((item) => locationKey(item) !== locationKey(location))
  ].slice(0, MAX_RECENT_LOCATIONS);
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return getRecentLocations(storage);
  }
}

export function clearRecentLocations(storage = browserStorage()) {
  if (!storage) return false;
  try {
    storage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
