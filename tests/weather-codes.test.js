import test from "node:test";
import assert from "node:assert/strict";
import { interpretWeatherCode } from "../src/js/weather-codes.js";

test("maps documented clear and cloud cover codes", () => {
  assert.deepEqual(interpretWeatherCode(0), { description: "Clear sky", icon: "clear" });
  assert.deepEqual(interpretWeatherCode(2), { description: "Partly cloudy", icon: "partly-cloudy" });
  assert.deepEqual(interpretWeatherCode(3), { description: "Overcast", icon: "cloudy" });
});

test("describes night conditions when day/night data is available", () => {
  assert.deepEqual(interpretWeatherCode(0, false), { description: "Clear night", icon: "night" });
  assert.deepEqual(interpretWeatherCode(1, false), { description: "Mostly clear night", icon: "night" });
  assert.equal(interpretWeatherCode(2, false).icon, "partly-cloudy");
});

test("maps precipitation and storm codes and handles unknown values", () => {
  assert.equal(interpretWeatherCode(65).description, "Heavy rain");
  assert.equal(interpretWeatherCode(73).icon, "snow");
  assert.equal(interpretWeatherCode(95).icon, "thunderstorm");
  assert.deepEqual(interpretWeatherCode(999), { description: "Conditions unavailable", icon: "unknown" });
});
