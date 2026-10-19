<div align="center">

# ☁️ Weather Dashboard

### A clearer view of your day.

A polished, responsive weather dashboard built with **vanilla JavaScript** and live forecast data from **Open-Meteo**.

<br>

![License: MIT](https://img.shields.io/badge/license-MIT-315c49?style=flat-square)
![Vanilla JavaScript](https://img.shields.io/badge/JavaScript-ES_modules-f1d28a?style=flat-square&logo=javascript&logoColor=252525)
![No API key](https://img.shields.io/badge/API_key-not_required-6e9a75?style=flat-square)
![Responsive](https://img.shields.io/badge/layout-responsive-879bba?style=flat-square)

<br>

[Features](#-features) · [Getting started](#-getting-started) · [Architecture](#-project-structure) · [API](#-data--attribution) · [Tests](#-testing)

</div>

---

## ✨ Features

- **Find a place** — Search cities and choose between matching regions and countries.
- **See the full picture** — Current conditions, feels-like temperature, humidity, wind, precipitation, plus hourly and seven-day forecasts.
- **Switch units** — Toggle °C/°F; wind speed and precipitation units update alongside temperature.
- **Pick up where you left off** — Up to five recent searches are saved in your browser.
- **Use your location** — Request geolocation only when you choose to.
- **Designed for everyday use** — Responsive layouts, keyboard-accessible controls, reduced-motion support, and clear loading and error states.
- **Easy to run** — No framework, API key, build pipeline, or runtime dependencies.

## 📸 Screenshots

> Screenshot placeholders — replace these with real captures before publishing.

| Desktop | Mobile |
|:---:|:---:|
| `screenshots/desktop.png` — add screenshot | `screenshots/mobile.png` — add screenshot |

## 🚀 Getting started

### Requirements

- Python 3 to serve the static site
- Node.js 18+ to run the test suite

### Run locally

```bash
git clone https://github.com/rampai-k/weather-dashboard.git
cd weather-dashboard
npm run dev
```

Open **[http://localhost:4173](http://localhost:4173)** in your browser. The app is static, so there are no packages to install and no build command.

### Run tests

```bash
npm test
```

## 🧱 Project structure

```text
weather-dashboard/
├── index.html                 # App shell and accessible page structure
├── package.json               # Local server and test scripts
├── src/
│   ├── css/
│   │   └── styles.css         # Responsive design system and layouts
│   └── js/
│       ├── app.js             # App state and interaction orchestration
│       ├── api.js             # Open-Meteo requests and input validation
│       ├── storage.js         # Recent-location persistence
│       ├── ui.js              # DOM rendering and presentation
│       ├── units.js           # Temperature, wind, and precipitation units
│       └── weather-codes.js   # WMO weather-code descriptions and icons
└── tests/
    ├── api.test.js
    ├── storage.test.js
    ├── units.test.js
    └── weather-codes.test.js
```

## 🛠️ Built with

| Layer | Technology |
| --- | --- |
| Markup & styling | HTML5, CSS3 |
| Application | Vanilla JavaScript, ES modules, async/await |
| Weather data | Open-Meteo Geocoding API and Forecast API |
| Tests | Node.js built-in `node:test` runner |

## 🌦️ Data & attribution

This project uses the public Open-Meteo APIs:

- **Geocoding:** [`geocoding-api.open-meteo.com/v1/search`](https://geocoding-api.open-meteo.com/v1/search)
- **Forecast:** [`api.open-meteo.com/v1/forecast`](https://api.open-meteo.com/v1/forecast)

Forecast requests use documented current, hourly, and daily variables, including WMO weather codes, and request `timezone=auto` for the selected location’s local forecast times. Values are requested in °C, km/h, and mm; the dashboard converts them for display when Fahrenheit is selected.

Weather data are provided by [Open-Meteo](https://open-meteo.com/). Keep the visible attribution and link to Open-Meteo when deploying. Check the latest [Open-Meteo terms](https://open-meteo.com/en/terms) for current licensing and attribution requirements, especially for commercial use.

## 🧪 Testing

```bash
npm test
```

The offline tests cover weather-code interpretation, day/night conditions, unit conversions, search validation, recent-location storage, mocked API requests, and unsuccessful or malformed API responses. They do not depend on a live weather service.

## 🌍 Deployment

### GitHub Pages

1. Push the project to a GitHub repository.
2. Open **Settings → Pages**.
3. Select **Deploy from a branch**, then choose the branch and `/ (root)` folder.
4. Save and open the published Pages URL.

### Netlify

1. Import the repository into Netlify or use Netlify Drop.
2. Leave the build command blank and set the publish directory to `.`.
3. Deploy — no environment variables are required.

## 📝 Notes

- Forecast freshness and availability depend on Open-Meteo and its weather models.
- The public API may rate-limit requests; the app displays a retry message if that happens.
- Recent searches live in this browser only; they are not synced between devices.
- Browser geolocation requires permission and a secure context (localhost is supported).
- Location search uses geocoder matches; it is not address-level autocomplete.

## 🧭 Ideas for later

- Saved favourite locations and richer forecast visualisations
- An installable, offline-friendly PWA experience
- Real desktop and mobile screenshots

---

<div align="center">

Made with care by **[rampai-k](https://github.com/rampai-k)**

</div>
