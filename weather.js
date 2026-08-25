// ==========================================
// WEATHER DASHBOARD
// Open-Meteo API
// ==========================================

let currentCity = "Jaffna";
let currentUnit = "C";


// ==========================================
// DOM ELEMENTS
// ==========================================

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const unitToggleBtn = document.getElementById("unitToggleBtn");
const unitText = document.getElementById("unitText");

const loading = document.getElementById("loading");
const weatherContent = document.getElementById("weatherContent");
const forecastSection = document.getElementById("forecastSection");


// ==========================================
// WEATHER CODE
// ==========================================

function getWeatherInfo(code) {

    const weather = {

        0: {
            text: "Clear Sky",
            icon: "☀️",
            background: "sunny"
        },

        1: {
            text: "Mainly Clear",
            icon: "🌤️",
            background: "sunny"
        },

        2: {
            text: "Partly Cloudy",
            icon: "⛅",
            background: "cloudy"
        },

        3: {
            text: "Overcast",
            icon: "☁️",
            background: "cloudy"
        },

        45: {
            text: "Foggy",
            icon: "🌫️",
            background: "cloudy"
        },

        48: {
            text: "Foggy",
            icon: "🌫️",
            background: "cloudy"
        },

        51: {
            text: "Light Drizzle",
            icon: "🌦️",
            background: "rainy"
        },

        53: {
            text: "Drizzle",
            icon: "🌦️",
            background: "rainy"
        },

        55: {
            text: "Heavy Drizzle",
            icon: "🌧️",
            background: "rainy"
        },

        61: {
            text: "Light Rain",
            icon: "🌦️",
            background: "rainy"
        },

        63: {
            text: "Rain",
            icon: "🌧️",
            background: "rainy"
        },

        65: {
            text: "Heavy Rain",
            icon: "🌧️",
            background: "rainy"
        },

        71: {
            text: "Light Snow",
            icon: "🌨️",
            background: "cloudy"
        },

        73: {
            text: "Snow",
            icon: "❄️",
            background: "cloudy"
        },

        75: {
            text: "Heavy Snow",
            icon: "❄️",
            background: "cloudy"
        },

        80: {
            text: "Rain Showers",
            icon: "🌦️",
            background: "rainy"
        },

        81: {
            text: "Rain Showers",
            icon: "🌧️",
            background: "rainy"
        },

        82: {
            text: "Heavy Rain Showers",
            icon: "⛈️",
            background: "rainy"
        },

        95: {
            text: "Thunderstorm",
            icon: "⛈️",
            background: "rainy"
        },

        96: {
            text: "Thunderstorm with Hail",
            icon: "⛈️",
            background: "rainy"
        },

        99: {
            text: "Heavy Thunderstorm",
            icon: "⛈️",
            background: "rainy"
        }

    };

    return weather[code] || {
        text: "Unknown",
        icon: "🌤️",
        background: "default"
    };
}


// ==========================================
// SEARCH CITY
// ==========================================

async function searchCity(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?` +
        `name=${encodeURIComponent(city)}` +
        `&count=1` +
        `&language=en` +
        `&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search city.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found.");
    }

    return data.results[0];
}


// ==========================================
// GET WEATHER
// ==========================================

async function getWeather(city) {

    showLoading();

    try {

        // -------------------------------
        // FIND CITY
        // -------------------------------

        const location = await searchCity(city);

        const latitude = location.latitude;
        const longitude = location.longitude;

        currentCity = location.name;


        // -------------------------------
        // WEATHER API
        // -------------------------------

        const weatherUrl =
            `https://api.open-meteo.com/v1/forecast?` +
            `latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,` +
            `weather_code,wind_speed_10m,surface_pressure,visibility` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
            `sunrise,sunset,uv_index_max` +
            `&timezone=auto` +
            `&forecast_days=5`;


        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Weather API failed.");
        }

        const weather = await weatherResponse.json();


        // -------------------------------
        // AIR QUALITY
        // -------------------------------

        let airQuality = null;

        try {

            const airUrl =
                `https://air-quality-api.open-meteo.com/v1/air-quality?` +
                `latitude=${latitude}` +
                `&longitude=${longitude}` +
                `&current=european_aqi,pm2_5` +
                `&timezone=auto`;

            const airResponse = await fetch(airUrl);

            if (airResponse.ok) {
                airQuality = await airResponse.json();
            }

        } catch (error) {
            console.warn("Air quality unavailable:", error);
        }


        // -------------------------------
        // DISPLAY
        // -------------------------------

        displayWeather(
            location,
            weather,
            airQuality
        );

        displayForecast(weather);

        hideLoading();

    } catch (error) {

        console.error(error);

        hideLoading();

        weatherContent.classList.add("hidden");
        forecastSection.classList.add("hidden");

        alert(
            "Unable to find weather data. Please check the city name and try again."
        );
    }
}


// ==========================================
// DISPLAY CURRENT WEATHER
// ==========================================

function displayWeather(
    location,
    weather,
    airQuality
) {

    const current = weather.current;
    const daily = weather.daily;


    // Weather information
    const info = getWeatherInfo(
        current.weather_code
    );


    // Background
    document.body.className = info.background;


    // -------------------------------
    // Location
    // -------------------------------

    document.getElementById("cityName").textContent =
        `${location.name}, ${location.country || ""}`;


    document.getElementById("footerLocation").textContent =
        `${location.name}, ${location.country || ""}`;


    // -------------------------------
    // Current weather
    // -------------------------------

    const temperature =
        convertTemperature(current.temperature_2m);

    const feelsLike =
        convertTemperature(current.apparent_temperature);


    document.getElementById("temperature").textContent =
        Math.round(temperature);


    document.getElementById("temperatureUnit").textContent =
        `°${currentUnit}`;


    document.getElementById("feelsLike").textContent =
        Math.round(feelsLike);


    document.getElementById("condition").textContent =
        info.text;


    document.getElementById("currentIcon").textContent =
        info.icon;


    // -------------------------------
    // Humidity
    // -------------------------------

    document.getElementById("humidity").textContent =
        `${current.relative_humidity_2m}%`;


    document.getElementById("humidityCircle").textContent =
        `${current.relative_humidity_2m}%`;


    // -------------------------------
    // Wind
    // -------------------------------

    const wind = convertWind(
        current.wind_speed_10m
    );

    document.getElementById("wind").textContent =
        Math.round(wind);

    document.getElementById("windUnit").textContent =
        currentUnit === "C" ? "km/h" : "mph";

    document.getElementById("windCircle").textContent =
        Math.round(wind);


    // -------------------------------
    // Pressure
    // -------------------------------

    document.getElementById("pressure").textContent =
        Math.round(current.surface_pressure);


    // -------------------------------
    // Visibility
    // -------------------------------

    const visibilityKm =
        current.visibility / 1000;

    document.getElementById("visibility").textContent =
        visibilityKm.toFixed(1);


    // -------------------------------
    // Sunrise / Sunset
    // -------------------------------

    document.getElementById("sunrise").textContent =
        formatTime(daily.sunrise[0]);

    document.getElementById("sunset").textContent =
        formatTime(daily.sunset[0]);


    // -------------------------------
    // UV
    // -------------------------------

    const uv =
        Math.round(daily.uv_index_max[0]);

    document.getElementById("uvIndex").textContent =
        uv;

    document.getElementById("uvText").textContent =
        getUVText(uv);


    // -------------------------------
    // Air Quality
    // -------------------------------

    if (
        airQuality &&
        airQuality.current &&
        airQuality.current.european_aqi !== undefined
    ) {

        const aqi =
            Math.round(
                airQuality.current.european_aqi
            );

        document.getElementById("airQuality").textContent =
            aqi;

        document.getElementById("airText").textContent =
            getAirQualityText(aqi);

    } else {

        document.getElementById("airQuality").textContent =
            "--";

        document.getElementById("airText").textContent =
            "Unavailable";
    }


    // -------------------------------
    // Date / Time
    // -------------------------------

    document.getElementById("dateTime").textContent =
        formatDateTime(
            current.time
        );


    document.getElementById("lastUpdated").textContent =
        formatTime(
            current.time
        );


    // Show
    weatherContent.classList.remove("hidden");
}


// ==========================================
// FORECAST
// ==========================================

function displayForecast(weather) {

    const daily = weather.daily;

    const grid =
        document.getElementById("forecastGrid");

    grid.innerHTML = "";


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const info =
            getWeatherInfo(
                daily.weather_code[i]
            );


        const date =
            new Date(
                daily.time[i] + "T12:00:00"
            );


        const dayName =
            i === 0
                ? "Today"
                : date.toLocaleDateString(
                    "en-US",
                    { weekday: "short" }
                );


        const dateText =
            date.toLocaleDateString(
                "en-US",
                {
                    day: "numeric",
                    month: "short"
                }
            );


        const max =
            Math.round(
                convertTemperature(
                    daily.temperature_2m_max[i]
                )
            );


        const min =
            Math.round(
                convertTemperature(
                    daily.temperature_2m_min[i]
                )
            );


        grid.innerHTML += `

            <div class="forecast-card">

                <div class="forecast-day">
                    ${dayName}
                </div>

                <div class="forecast-date">
                    ${dateText}
                </div>

                <div class="forecast-icon">
                    ${info.icon}
                </div>

                <div class="forecast-temp">

                    ${max}°${currentUnit}

                    <span>
                        ${min}°${currentUnit}
                    </span>

                </div>

                <div class="forecast-condition">
                    ${info.text}
                </div>

            </div>

        `;
    }


    forecastSection.classList.remove("hidden");
}


// ==========================================
// UNIT CONVERSION
// ==========================================

function convertTemperature(celsius) {

    if (currentUnit === "C") {
        return celsius;
    }

    return (celsius * 9 / 5) + 32;
}


function convertWind(kmh) {

    if (currentUnit === "C") {
        return kmh;
    }

    return kmh * 0.621371;
}


// ==========================================
// UV
// ==========================================

function getUVText(uv) {

    if (uv <= 2) {
        return "Low";
    }

    if (uv <= 5) {
        return "Moderate";
    }

    if (uv <= 7) {
        return "High";
    }

    if (uv <= 10) {
        return "Very High";
    }

    return "Extreme";
}


// ==========================================
// AIR QUALITY
// ==========================================

function getAirQualityText(aqi) {

    if (aqi <= 20) {
        return "Good";
    }

    if (aqi <= 40) {
        return "Fair";
    }

    if (aqi <= 60) {
        return "Moderate";
    }

    if (aqi <= 80) {
        return "Poor";
    }

    if (aqi <= 100) {
        return "Very Poor";
    }

    return "Extremely Poor";
}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(time) {

    if (!time) {
        return "--:--";
    }

    const date =
        new Date(time);

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ==========================================
// FORMAT DATE
// ==========================================

function formatDateTime(time) {

    const date =
        new Date(time);

    return date.toLocaleDateString(
        "en-US",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    ) +
    " • " +
    date.toLocaleTimeString(
        "en-US",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ==========================================
// LOADING
// ==========================================

function showLoading() {

    loading.classList.remove("hidden");

    weatherContent.classList.add("hidden");

    forecastSection.classList.add("hidden");
}


function hideLoading() {

    loading.classList.add("hidden");
}


// ==========================================
// SEARCH BUTTON
// ==========================================

searchBtn.addEventListener(
    "click",
    () => {

        const city =
            cityInput.value.trim();

        if (!city) {

            cityInput.focus();

            return;
        }

        getWeather(city);
    }
);


// ==========================================
// ENTER KEY
// ==========================================

cityInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            searchBtn.click();
        }
    }
);


// ==========================================
// UNIT TOGGLE
// ==========================================

unitToggleBtn.addEventListener(
    "click",
    () => {

        currentUnit =
            currentUnit === "C"
                ? "F"
                : "C";


        unitText.textContent =
            currentUnit === "C"
                ? "°C / °F"
                : "°F / °C";


        if (currentCity) {
            getWeather(currentCity);
        }
    }
);


// ==========================================
// INITIAL LOAD
// ==========================================

window.addEventListener(
    "DOMContentLoaded",
    () => {

        getWeather("Jaffna");
    }
);