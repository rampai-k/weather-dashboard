const conditions = new Map([
  [0, ["Clear sky", "clear"]],
  [1, ["Mainly clear", "clear"]],
  [2, ["Partly cloudy", "partly-cloudy"]],
  [3, ["Overcast", "cloudy"]],
  [45, ["Fog", "fog"]],
  [48, ["Rime fog", "fog"]],
  [51, ["Light drizzle", "drizzle"]],
  [53, ["Drizzle", "drizzle"]],
  [55, ["Dense drizzle", "drizzle"]],
  [56, ["Light freezing drizzle", "freezing-rain"]],
  [57, ["Dense freezing drizzle", "freezing-rain"]],
  [61, ["Light rain", "rain"]],
  [63, ["Rain", "rain"]],
  [65, ["Heavy rain", "heavy-rain"]],
  [66, ["Light freezing rain", "freezing-rain"]],
  [67, ["Heavy freezing rain", "freezing-rain"]],
  [71, ["Light snow", "snow"]],
  [73, ["Snow", "snow"]],
  [75, ["Heavy snow", "heavy-snow"]],
  [77, ["Snow grains", "snow"]],
  [80, ["Light rain showers", "showers"]],
  [81, ["Rain showers", "showers"]],
  [82, ["Heavy rain showers", "heavy-rain"]],
  [85, ["Light snow showers", "snow"]],
  [86, ["Heavy snow showers", "heavy-snow"]],
  [95, ["Thunderstorm", "thunderstorm"]],
  [96, ["Thunderstorm with light hail", "thunderstorm"]],
  [99, ["Thunderstorm with heavy hail", "thunderstorm"]]
]);

export function interpretWeatherCode(code, isDay = true) {
  const entry = conditions.get(Number(code));
  if (!entry) return { description: "Conditions unavailable", icon: "unknown" };

  let [description, icon] = entry;
  if (!isDay && icon === "clear") {
    description = Number(code) === 0 ? "Clear night" : "Mostly clear night";
    icon = "night";
  }
  return { description, icon };
}
