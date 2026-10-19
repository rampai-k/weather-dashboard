import test from "node:test";
import assert from "node:assert/strict";
import { fetchForecast, searchLocations, WeatherApiError, validateLocationQuery } from "../src/js/api.js";

const originalFetch = globalThis.fetch;

test.afterEach(() => {
  globalThis.fetch = originalFetch;
});

test("validates location input before making a request", () => {
  assert.equal(validateLocationQuery("  Paris  "), "Paris");
  assert.throws(() => validateLocationQuery(" "), /at least two characters/);
  assert.throws(() => validateLocationQuery("x"), /at least two characters/);
  assert.throws(() => validateLocationQuery("x".repeat(101)), /100 characters or fewer/);
});

test("searches geocoding with the documented endpoint and safely filters malformed results", async () => {
  let requestedUrl;
  globalThis.fetch = async (url) => {
    requestedUrl = new URL(url);
    return { ok: true, json: async () => ({ results: [
      { name: "Paris", latitude: 48.8, longitude: 2.3 },
      { name: "Invalid", latitude: "north", longitude: 2 }
    ] }) };
  };
  const result = await searchLocations("Paris");
  assert.equal(requestedUrl.origin, "https://geocoding-api.open-meteo.com");
  assert.equal(requestedUrl.pathname, "/v1/search");
  assert.equal(requestedUrl.searchParams.get("name"), "Paris");
  assert.deepEqual(result, [{ name: "Paris", latitude: 48.8, longitude: 2.3 }]);
});

test("uses documented local-time forecast fields and rejects incomplete responses", async () => {
  let requestedUrl;
  const payload = { current: { time: "2026-10-19T12:00" }, hourly: { time: [] }, daily: { time: [] } };
  globalThis.fetch = async (url) => {
    requestedUrl = new URL(url);
    return { ok: true, json: async () => payload };
  };
  await fetchForecast({ latitude: 1, longitude: 2 });
  assert.equal(requestedUrl.pathname, "/v1/forecast");
  assert.equal(requestedUrl.searchParams.get("timezone"), "auto");
  assert.equal(requestedUrl.searchParams.get("temperature_unit"), "celsius");
  assert.equal(requestedUrl.searchParams.get("wind_speed_unit"), "kmh");
  assert.match(requestedUrl.searchParams.get("daily"), /temperature_2m_max/);

  globalThis.fetch = async () => ({ ok: true, json: async () => ({ current: {} }) });
  await assert.rejects(fetchForecast({ latitude: 1, longitude: 2 }), /incomplete forecast data/);
});

test("surfaces HTTP, rate-limit, network, and unreadable response errors", async () => {
  globalThis.fetch = async () => ({ ok: false, status: 429 });
  await assert.rejects(searchLocations("Paris"), (error) => error instanceof WeatherApiError && error.status === 429 && /Too many requests/.test(error.message));
  globalThis.fetch = async () => ({ ok: false, status: 503 });
  await assert.rejects(searchLocations("Paris"), /temporarily unavailable/);
  globalThis.fetch = async () => { throw new TypeError("offline"); };
  await assert.rejects(searchLocations("Paris"), /internet connection/);
  globalThis.fetch = async () => ({ ok: true, json: async () => { throw new SyntaxError("bad json"); } });
  await assert.rejects(searchLocations("Paris"), /unreadable response/);
});
