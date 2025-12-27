const API_KEY = "fd9cef6b86a320279d199a564e586d9d";

let unit = "metric";
let lastLocation = null;

/* ELEMENTS */
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const forecastEl = document.getElementById("forecast");

const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("description");
const dateTimeEl = document.getElementById("dateTime");
const humidityEl = document.getElementById("humidity");
const iconEl = document.getElementById("weatherIcon");

const unitToggle = document.getElementById("unitToggle");
const themeToggle = document.getElementById("themeToggle");

/* SEARCH */
searchBtn.onclick = () => {
  if (!cityInput.value.trim()) return;
  getCoordinates(cityInput.value.trim());
};

cityInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchBtn.click();
});

/* AUTO UNIT BY COUNTRY */
function getDefaultUnit(country) {
  const fahrenheitCountries = ["US", "BS", "KY", "LR"];
  return fahrenheitCountries.includes(country) ? "imperial" : "metric";
}

/* CITY → LAT/LON */
async function getCoordinates(city) {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        city
      )}&limit=1&appid=${API_KEY}`
    );

    const data = await res.json();
    if (!data.length) throw new Error();

    const { lat, lon, name, country } = data[0];

    if (!lastLocation || lastLocation !== country) {
      unit = getDefaultUnit(country);
      unitToggle.textContent = unit === "metric" ? "°C" : "°F";
    }

    lastLocation = country;
    getWeather(lat, lon, name, country);

  } catch {
    alert("City not found");
  }
}

/* WEATHER */
async function getWeather(lat, lon, name, country) {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${API_KEY}`
  );
  const data = await res.json();

  updateCurrent(data, name, country);
  updateForecast(data);
}

/* CURRENT WEATHER */
function updateCurrent(data, name, country) {
  const current = data.list[0];

  tempEl.textContent = `${Math.round(current.main.temp)}°`;
  descEl.textContent = `${name}, ${country} • ${current.weather[0].description}`;
  humidityEl.textContent = `Humidity: ${current.main.humidity}%`;

  iconEl.src = `https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`;

  updateTime();
}

/* LIVE TIME */
function updateTime() {
  dateTimeEl.textContent = new Date().toLocaleString();
}
setInterval(updateTime, 1000);

/* FORECAST */
function updateForecast(data) {
  forecastEl.innerHTML = "";

  data.list
    .filter(item => item.dt_txt.includes("12:00:00"))
    .forEach(day => {
      const date = new Date(day.dt * 1000);

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h4>${date.toLocaleDateString("en-US", { weekday: "short" })}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png">
        <p>${Math.round(day.main.temp)}°</p>
        <small>${day.main.humidity}% humidity</small>
      `;

      forecastEl.appendChild(card);
    });
}

/* UNIT TOGGLE */
unitToggle.onclick = () => {
  unit = unit === "metric" ? "imperial" : "metric";
  unitToggle.textContent = unit === "metric" ? "°C" : "°F";

  if (cityInput.value.trim()) {
    getCoordinates(cityInput.value.trim());
  }
};

/* NIGHT / DAY TOGGLE */
themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  themeToggle.textContent = document.body.classList.contains("light")
    ? "☀️"
    : "🌙";
};
