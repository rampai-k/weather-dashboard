export function convertTemperature(celsius, unit) {
  if (!Number.isFinite(celsius)) return null;
  return unit === "fahrenheit" ? (celsius * 9) / 5 + 32 : celsius;
}

export function formatNumber(value, digits = 0) {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

export function formatTemperature(celsius, unit) {
  const temperature = convertTemperature(celsius, unit);
  return temperature === null ? "—" : `${formatNumber(temperature)}°`;
}

export function convertWindSpeed(kilometresPerHour, unit) {
  if (!Number.isFinite(kilometresPerHour)) return null;
  return unit === "fahrenheit" ? kilometresPerHour / 1.609344 : kilometresPerHour;
}

export function convertPrecipitation(millimetres, unit) {
  if (!Number.isFinite(millimetres)) return null;
  return unit === "fahrenheit" ? millimetres / 25.4 : millimetres;
}

export function unitLabel(unit) {
  return unit === "fahrenheit"
    ? { temperature: "°F", wind: "mph", precipitation: "in" }
    : { temperature: "°C", wind: "km/h", precipitation: "mm" };
}
