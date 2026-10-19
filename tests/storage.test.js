import test from "node:test";
import assert from "node:assert/strict";
import { clearRecentLocations, getRecentLocations, saveRecentLocation } from "../src/js/storage.js";

function createStorage(initial = null, fail = false) {
  const data = new Map(initial ? [["weather-dashboard.recent-locations", initial]] : []);
  return {
    getItem(key) { if (fail) throw new Error("storage unavailable"); return data.get(key) ?? null; },
    setItem(key, value) { if (fail) throw new Error("storage unavailable"); data.set(key, value); },
    removeItem(key) { if (fail) throw new Error("storage unavailable"); data.delete(key); }
  };
}

const location = (name, latitude = 1) => ({ name, latitude, longitude: latitude, country: "Example" });

test("loads, deduplicates, moves to front, and caps recent locations", () => {
  const storage = createStorage();
  saveRecentLocation(location("Alpha"), storage);
  saveRecentLocation(location("Beta", 2), storage);
  saveRecentLocation(location("Alpha"), storage);
  for (let index = 3; index < 9; index += 1) saveRecentLocation(location(`City ${index}`, index), storage);
  const result = getRecentLocations(storage);
  assert.equal(result.length, 5);
  assert.equal(result[0].name, "City 8");
  assert.equal(result.at(-1).name, "City 4");
  assert.equal(result.filter((item) => item.name === "Alpha").length, 0);
});

test("handles corrupted and unavailable storage without throwing", () => {
  const corrupt = createStorage("{not json");
  assert.deepEqual(getRecentLocations(corrupt), []);
  const unavailable = createStorage(null, true);
  assert.deepEqual(getRecentLocations(unavailable), []);
  assert.deepEqual(saveRecentLocation(location("Paris"), unavailable), []);
  assert.equal(clearRecentLocations(unavailable), false);
});

test("clears recent locations and ignores invalid coordinates", () => {
  const storage = createStorage();
  saveRecentLocation(location("Paris"), storage);
  assert.equal(clearRecentLocations(storage), true);
  assert.deepEqual(getRecentLocations(storage), []);
  assert.deepEqual(saveRecentLocation({ name: "Nowhere", latitude: NaN, longitude: 0 }, storage), []);
});
