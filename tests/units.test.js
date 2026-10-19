import test from "node:test";
import assert from "node:assert/strict";
import { convertPrecipitation, convertTemperature, convertWindSpeed, formatTemperature } from "../src/js/units.js";

test("converts temperatures consistently and handles missing values", () => {
  assert.equal(convertTemperature(0, "fahrenheit"), 32);
  assert.equal(convertTemperature(20, "fahrenheit"), 68);
  assert.equal(convertTemperature(20, "celsius"), 20);
  assert.equal(convertTemperature(null, "fahrenheit"), null);
  assert.equal(formatTemperature(Number.NaN, "celsius"), "—");
});

test("converts wind and precipitation units with temperature selection", () => {
  assert.equal(convertWindSpeed(16.09344, "fahrenheit"), 10);
  assert.equal(convertWindSpeed(16.09344, "celsius"), 16.09344);
  assert.equal(convertPrecipitation(25.4, "fahrenheit"), 1);
  assert.equal(convertPrecipitation(25.4, "celsius"), 25.4);
});
