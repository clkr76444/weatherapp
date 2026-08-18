const weatherForm = document.querySelector("#weatherForm");
const cityInput = document.querySelector("#cityInput");

const cityName = document.querySelector("#cityName");
const countryName = document.querySelector("#countryName");

const temperature = document.querySelector("#temperature");
const description = document.querySelector("#description");
const weatherIcon = document.querySelector("#weatherIcon");

const humidity = document.querySelector("#humidity");
const wind = document.querySelector("#wind");

const forecastList = document.querySelector("#forecastList");
const errorMessage = document.querySelector("#errorMessage");


// ---------------------------------
// WEATHER CODES
// ---------------------------------

const weatherDescriptions = {

    0: {
        description: "Klar himmel",
        icon: "☀️",
        background: "sunny"
    },

    1: {
        description: "Primært klart",
        icon: "🌤️",
        background: "sunny"
    },

    2: {
        description: "Delvist overskyet",
        icon: "⛅",
        background: "cloudy"
    },

    3: {
        description: "Overskyet",
        icon: "☁️",
        background: "cloudy"
    },

    45: {
        description: "Tåget",
        icon: "🌫️",
        background: "cloudy"
    },

    48: {
        description: "Rimtåge",
        icon: "🌫️",
        background: "cloudy"
    },

    51: {
        description: "Let støvregn",
        icon: "🌦️",
        background: "rainy"
    },

    53: {
        description: "Støvregn",
        icon: "🌦️",
        background: "rainy"
    },

    55: {
        description: "Kraftigt støvregn",
        icon: "🌧️",
        background: "rainy"
    },

    61: {
        description: "Let regn",
        icon: "🌧️",
        background: "rainy"
    },

    63: {
        description: "Regn",
        icon: "🌧️",
        background: "rainy"
    },

    65: {
        description: "Kraftig regn",
        icon: "🌧️",
        background: "rainy"
    },

    71: {
        description: "Let sne",
        icon: "🌨️",
        background: "snow"
    },

    73: {
        description: "Sne",
        icon: "🌨️",
        background: "snow"
    },

    75: {
        description: "Kraftig sne",
        icon: "❄️",
        background: "snow"
    },

    80: {
        description: "Regnbyger",
        icon: "🌦️",
        background: "rainy"
    },

    81: {
        description: "Kraftige regnbyger",
        icon: "🌧️",
        background: "rainy"
    },

    82: {
        description: "Meget kraftige regnbyger",
        icon: "⛈️",
        background: "storm"
    },

    95: {
        description: "Tordenvejr",
        icon: "⛈️",
        background: "storm"
    },

    96: {
        description: "Torden og hagl",
        icon: "⛈️",
        background: "storm"
    },

    99: {
        description: "Kraftigt tordenvejr",
        icon: "⛈️",
        background: "storm"
    }
};


// ---------------------------------
// CHANGE BACKGROUND
// ---------------------------------

function setWeatherBackground(weatherCode) {

    const weatherInfo =
        weatherDescriptions[weatherCode];

    // Fjern alle tidligere vejr-klasser
    document.body.classList.remove(
        "weather--sunny",
        "weather--cloudy",
        "weather--rainy",
        "weather--snow",
        "weather--storm"
    );

    // Tilføj den nye vejrklasse
    document.body.classList.add(
        `weather--${weatherInfo.background}`
    );
}


// ---------------------------------
// SEARCH CITY
// ---------------------------------

async function searchCity(city) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=da&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Kunne ikke finde byen.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("Byen blev ikke fundet.");
    }

    return data.results[0];
}


// ---------------------------------
// GET WEATHER
// ---------------------------------

async function getWeather(latitude, longitude) {

    const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max&timezone=auto&forecast_days=4`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Kunne ikke hente vejret.");
    }

    return await response.json();
}


// ---------------------------------
// DISPLAY WEATHER
// ---------------------------------

function displayWeather(city, weather) {

    const current = weather.current;

    const weatherInfo =
        weatherDescriptions[current.weather_code] ||
        {
            description: "Ukendt vejr",
            icon: "🌡️",
            background: "cloudy"
        };


    cityName.textContent = city.name;

    countryName.textContent =
        city.country || "Ukendt land";

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°`;

    description.textContent =
        weatherInfo.description;

    weatherIcon.textContent =
        weatherInfo.icon;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    wind.textContent =
        `${Math.round(current.wind_speed_10m)} km/t`;


    // Skifter baggrundsbilledet
    setWeatherBackground(current.weather_code);


    displayForecast(weather);
}


// ---------------------------------
// DISPLAY FORECAST
// ---------------------------------

function displayForecast(weather) {

    forecastList.innerHTML = "";

    const days = weather.daily.time;
    const codes = weather.daily.weather_code;
    const temperatures = weather.daily.temperature_2m_max;


    for (let i = 1; i < days.length; i++) {

        const date = new Date(days[i]);

        const dayName = date.toLocaleDateString(
            "da-DK",
            {
                weekday: "short"
            }
        );


        const weatherInfo =
            weatherDescriptions[codes[i]] ||
            {
                icon: "🌡️"
            };


        const forecastCard =
            document.createElement("article");

        forecastCard.classList.add(
            "forecast__day"
        );


        forecastCard.innerHTML = `
            <p class="forecast__day-name">
                ${dayName}
            </p>

            <p class="forecast__icon">
                ${weatherInfo.icon}
            </p>

            <p class="forecast__temperature">
                ${Math.round(temperatures[i])}°
            </p>
        `;


        forecastList.appendChild(
            forecastCard
        );
    }
}


// ---------------------------------
// SEARCH WEATHER
// ---------------------------------

async function searchWeather(city) {

    errorMessage.textContent = "";

    try {

        const location =
            await searchCity(city);

        const weather =
            await getWeather(
                location.latitude,
                location.longitude
            );

        displayWeather(
            location,
            weather
        );

    } catch (error) {

        errorMessage.textContent =
            error.message;
    }
}


// ---------------------------------
// FORM EVENT
// ---------------------------------

weatherForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const city =
            cityInput.value.trim();

        if (!city) {

            errorMessage.textContent =
                "Skriv venligst en by.";

            return;
        }

        searchWeather(city);
    }
);


// ---------------------------------
// DEFAULT CITY
// ---------------------------------

searchWeather("Odense");