const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const message = document.getElementById("message");
const currentWeather = document.getElementById("currentWeather");
const forecastSection = document.getElementById("forecastSection");

const cityName = document.getElementById("cityName");
const date = document.getElementById("date");
const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const forecast = document.getElementById("forecast");

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();

    if (city === "") {
        showMessage("Please enter a city name.");
        return;
    }

    getWeather(city);
});

cityInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        searchBtn.click();
    }
});

async function getWeather(city) {
    try {
        showMessage("Loading weather...");

        currentWeather.classList.add("hidden");
        forecastSection.classList.add("hidden");

        const locationURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const locationResponse = await fetch(locationURL);

        if (!locationResponse.ok) {
            throw new Error("Location API failed.");
        }

        const locationData = await locationResponse.json();

        if (!locationData.results || locationData.results.length === 0) {
            throw new Error("City not found. Please check the spelling.");
        }

        const location = locationData.results[0];
        const latitude = location.latitude;
        const longitude = location.longitude;
        const foundCity = location.name;
        const country = location.country;

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Weather API failed.");
        }

        const weatherData = await weatherResponse.json();

        cityName.textContent = `${foundCity}, ${country}`;
        temperature.textContent =
            Math.round(weatherData.current.temperature_2m);

        humidity.textContent =
            weatherData.current.relative_humidity_2m;

        windSpeed.textContent =
            Math.round(weatherData.current.wind_speed_10m);

        weatherDescription.textContent =
            getWeatherDescription(weatherData.current.weather_code);

        const today = new Date(weatherData.current.time);

        date.textContent = today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        currentWeather.classList.remove("hidden");

        displayForecast(weatherData.daily);

        forecastSection.classList.remove("hidden");
        showMessage("");

    } catch (error) {
        console.error(error);

        currentWeather.classList.add("hidden");
        forecastSection.classList.add("hidden");

        showMessage(error.message);
    }
}

function displayForecast(dailyData) {
    forecast.innerHTML = "";

    for (let i = 0; i < dailyData.time.length; i++) {
        const forecastDate = new Date(dailyData.time[i]);

        const dayName = forecastDate.toLocaleDateString("en-US", {
            weekday: "short"
        });

        const maxTemp = Math.round(
            dailyData.temperature_2m_max[i]
        );

        const minTemp = Math.round(
            dailyData.temperature_2m_min[i]
        );

        const description = getWeatherDescription(
            dailyData.weather_code[i]
        );

        const card = document.createElement("div");
        card.classList.add("forecast-card");

        card.innerHTML = `
            <h3>${dayName}</h3>
            <p>${description}</p>
            <p class="temp">${maxTemp}° / ${minTemp}°</p>
        `;

        forecast.appendChild(card);
    }
}

function getWeatherDescription(code) {
    const weatherCodes = {
        0: "☀️ Clear sky",
        1: "🌤️ Mainly clear",
        2: "⛅ Partly cloudy",
        3: "☁️ Overcast",
        45: "🌫️ Fog",
        48: "🌫️ Rime fog",
        51: "🌦️ Light drizzle",
        53: "🌦️ Moderate drizzle",
        55: "🌧️ Dense drizzle",
        61: "🌧️ Slight rain",
        63: "🌧️ Moderate rain",
        65: "🌧️ Heavy rain",
        71: "🌨️ Slight snow",
        73: "🌨️ Moderate snow",
        75: "❄️ Heavy snow",
        80: "🌦️ Rain showers",
        81: "🌧️ Moderate showers",
        82: "⛈️ Heavy showers",
        95: "⛈️ Thunderstorm",
        96: "⛈️ Thunderstorm + hail",
        99: "⛈️ Thunderstorm + heavy hail"
    };

    return weatherCodes[code] || "Unknown weather";
}

function showMessage(text) {
    message.textContent = text;
}

// Load a default city when the page opens.
getWeather("Delhi");
