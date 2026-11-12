// OpenWeatherMap API Key
let API_KEY = '3eb428c218d1c662ccb9fc8161347f55'; 
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';

// DOM Elements
const welcomeScreen = document.getElementById('welcome-screen');
const mainApp = document.getElementById('main-app');
const getStartedBtn = document.getElementById('get-started-btn');
const continueBtn = document.getElementById('continue-btn');
const loginCard = document.getElementById('login-card');
const greetingCard = document.getElementById('greeting-card');
const dynamicWelcomeText = document.getElementById('dynamic-welcome-text');
const userNameInput = document.getElementById('user-name-input');
const userGreeting = document.getElementById('user-greeting');
const logoutBtn = document.getElementById('logout-btn');
const cityInput = document.getElementById('city-input');
const countrySelect = document.getElementById('country-select');
const citySelect = document.getElementById('city-select');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const settingsBtn = document.getElementById('settings-btn');
const apiModal = document.getElementById('api-modal');
const apiKeyInput = document.getElementById('api-key-input');
const saveKeyBtn = document.getElementById('save-key-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const weatherDisplay = document.getElementById('weather-display');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');
const infoMessage = document.getElementById('info-message');
const forecastContainer = document.getElementById('forecast-container');
const recentSearches = document.getElementById('recent-searches');
const recentList = document.getElementById('recent-list');
const bgOverlay = document.getElementById('bg-overlay');
const exportExcelBtn = document.getElementById('export-excel-btn');

// Elements to update
const cityName = document.getElementById('city-name');
const currentDate = document.getElementById('current-date');
const temperature = document.getElementById('temperature');
const weatherIcon = document.getElementById('weather-icon');
const weatherDescription = document.getElementById('weather-description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const pressure = document.getElementById('pressure');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const visibility = document.getElementById('visibility');
const cloudiness = document.getElementById('cloudiness');
const windDeg = document.getElementById('wind-deg');
const feelsLike = document.getElementById('feels-like');
const tempMax = document.getElementById('temp-max');
const tempMin = document.getElementById('temp-min');
const weatherBadge = document.getElementById('weather-badge');
const weatherTip = document.getElementById('weather-tip');
const aqiCard = document.getElementById('aqi-card');
const aqiValue = document.getElementById('aqi-value');
const uvIndex = document.getElementById('uv-index');
const windGust = document.getElementById('wind-gust');
const dewPoint = document.getElementById('dew-point');

// Country to City Mapping
const countryCities = {
    "IN": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad"],
    "US": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"],
    "UK": ["London", "Birmingham", "Manchester", "Glasgow", "Liverpool", "Leeds", "Sheffield", "Edinburgh"],
    "FR": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier"],
    "JP": ["Tokyo", "Osaka", "Nagoya", "Yokohama", "Fukuoka", "Sapporo", "Kyoto", "Kobe"],
    "AE": ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
    "AU": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Hobart"]
};

// State
let searches = JSON.parse(localStorage.getItem('recent_searches')) || [];
let appLogs = JSON.parse(localStorage.getItem('app_logs')) || [];

// Initialization
function init() {
    renderRecentSearches();
    const savedKey = localStorage.getItem('weather_api_key');
    if (savedKey) API_KEY = savedKey;

    // Check if user has seen welcome screen
    const hasSeenWelcome = localStorage.getItem('has_seen_welcome');
    const savedName = localStorage.getItem('user_name');
    
    if (hasSeenWelcome) {
        if (savedName) {
            userGreeting.textContent = `Welcome back, ${savedName}!`;
        }
        showMainApp();
    }
}

// Logging System
function logEvent(type, details) {
    const logEntry = {
        timestamp: new Date().toLocaleString(),
        user: localStorage.getItem('user_name') || 'Guest',
        type: type,
        details: details
    };
    appLogs.push(logEntry);
    localStorage.setItem('app_logs', JSON.stringify(appLogs));
}

// Event Listeners
getStartedBtn.addEventListener('click', () => {
    const name = userNameInput.value.trim();
    if (!name) {
        userNameInput.placeholder = "Please enter your name...";
        userNameInput.parentElement.style.borderColor = "#ef4444";
        return;
    }
    
    // Save name and update UI
    localStorage.setItem('user_name', name);
    userGreeting.textContent = `Welcome, ${name}!`;
    dynamicWelcomeText.textContent = `Hi, ${name}!`;
    
    // Switch cards
    loginCard.classList.add('hidden');
    setTimeout(() => {
        loginCard.style.display = 'none';
        greetingCard.classList.remove('hidden');
    }, 500);
    
    logEvent('Login', `User ${name} entered the app`);
});

continueBtn.addEventListener('click', () => {
    localStorage.setItem('has_seen_welcome', 'true');
    fadeOutWelcome();
});

logoutBtn.addEventListener('click', () => {
    if (confirm("Go back to welcome screen? This will reset your name but keep your API key.")) {
        localStorage.removeItem('has_seen_welcome');
        localStorage.removeItem('user_name');
        window.location.reload();
    }
});

// Excel Export Logic
exportExcelBtn.addEventListener('click', () => {
    if (appLogs.length === 0) {
        showError("No logs found to export.");
        return;
    }

    try {
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Convert logs array to worksheet
        const ws = XLSX.utils.json_to_sheet(appLogs);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, "App Logs");
        
        // Generate filename with current date
        const date = new Date().toISOString().split('T')[0];
        const filename = `SkyCast_Logs_${date}.xlsx`;
        
        // Save file
        XLSX.writeFile(wb, filename);
        showInfo("Excel file exported successfully!");
    } catch (error) {
        console.error("Excel Export Error:", error);
        showError("Failed to export Excel file.");
    }
});

function fadeOutWelcome() {
    welcomeScreen.classList.add('fade-out');
    setTimeout(() => {
        welcomeScreen.style.display = 'none';
        showMainApp();
    }, 800);
}

function showMainApp() {
    welcomeScreen.style.display = 'none';
    mainApp.classList.remove('hidden');
    // Ensure the container is visible and animated
    mainApp.style.opacity = '1';
    mainApp.style.transform = 'scale(1) translateY(0)';
    
    // Automatically try to get weather for a default city if no searches yet
    if (searches.length === 0) {
        getWeatherDataByCity("Mumbai");
    } else {
        getWeatherDataByCity(searches[0]);
    }
}
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) getWeatherDataByCity(city);
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) getWeatherDataByCity(city);
    }
});

countrySelect.addEventListener('change', () => {
    const selectedCountry = countrySelect.value;
    citySelect.innerHTML = '<option value="">City</option>';
    
    if (selectedCountry && countryCities[selectedCountry]) {
        citySelect.disabled = false;
        countryCities[selectedCountry].forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citySelect.appendChild(option);
        });
    } else {
        citySelect.disabled = true;
    }
});

citySelect.addEventListener('change', () => {
    const selectedCity = citySelect.value;
    if (selectedCity) {
        cityInput.value = selectedCity;
        getWeatherDataByCity(selectedCity);
    }
});

locationBtn.addEventListener('click', () => {
    console.log("Location button clicked");
    if (navigator.geolocation) {
        showLoading();
        hideError();
        console.log("Requesting current position...");
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Location received: ${latitude}, ${longitude}`);
                getWeatherDataByCoords(latitude, longitude);
            },
            (error) => {
                hideLoading();
                console.error("Geolocation error:", error);
                let errorMsg = "Location access denied.";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg = "Location access denied. Please enable location permissions in your browser settings.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        errorMsg = "The request to get user location timed out.";
                        break;
                }
                showError(errorMsg);
            },
            options
        );
    } else {
        showError("Geolocation is not supported by your browser.");
    }
});

settingsBtn.addEventListener('click', () => {
    apiKeyInput.value = API_KEY;
    apiModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    apiModal.classList.add('hidden');
});

saveKeyBtn.addEventListener('click', () => {
    const newKey = apiKeyInput.value.trim();
    if (newKey) {
        API_KEY = newKey;
        localStorage.setItem('weather_api_key', newKey);
        apiModal.classList.add('hidden');
        showInfo("API Settings applied!");
    }
});

window.addEventListener('click', (e) => {
    if (e.target === apiModal) apiModal.classList.add('hidden');
});

// Fetching Logic
async function getWeatherDataByCity(city) {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError("Please set your OpenWeatherMap API key in settings.");
        settingsBtn.click();
        return;
    }
    showLoading();
    hideError();
    hideInfo();
    hideWeather();

    try {
        console.log(`Fetching coordinates for: ${city}`);
        // First, get geo-coordinates and full location details (state/country)
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
        const geoData = await geoRes.json();
        
        if (!geoRes.ok) throw new Error(geoData.message || "Geocoding failed");
        if (!geoData || geoData.length === 0) throw new Error(`Location "${city}" not found.`);
        
        const { lat, lon, name, state, country } = geoData[0];
        const fullLocation = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;

        console.log(`Fetching weather for: ${lat}, ${lon} (${fullLocation})`);
        const weatherRes = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const weatherData = await weatherRes.json();

        if (!weatherRes.ok) throw new Error(weatherData.message || "An error occurred while fetching weather data.");

        const forecastRes = await fetch(`${BASE_URL}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();

        if (!forecastRes.ok) throw new Error(forecastData.message || "Forecast fetch failed");

        // Fetch Air Quality Data
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const aqiData = await aqiRes.json();

        // Fetch UV Index
        let uvData = null;
        try {
            const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
            if (uvRes.ok) uvData = await uvRes.json();
        } catch (e) { console.log("UV Index not available"); }

        // Inject the full location string into the data for display
        weatherData.fullLocationName = fullLocation;

        displayWeather(weatherData, uvData);
        displayForecast(forecastData);
        displayAQI(aqiData);
        addToRecentSearches(name);
        updateBackground(weatherData.weather[0].main);
        logEvent('Search', `Location: ${fullLocation}`);
    } catch (error) {
        console.error("Weather App Error:", error);
        if (error.message.includes('401')) {
            showError("Invalid API Key. Please check your settings.");
        } else if (error.message.includes('429')) {
            showError("API limit reached. Please try again later.");
        } else if (error.message.includes('404')) {
            showError("Location not found. Please check the spelling.");
        } else {
            showError(error.message || "An unexpected error occurred.");
        }
    } finally {
        hideLoading();
    }
}

async function getWeatherDataByCoords(lat, lon) {
    if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
        showError("Please set your OpenWeatherMap API key in settings.");
        settingsBtn.click();
        return;
    }
    showLoading();
    hideError();
    hideInfo();
    hideWeather();
    
    try {
        // Get full location details for the coordinates
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`);
        const geoData = await geoRes.json();
        
        if (!geoRes.ok) throw new Error(geoData.message || "Geocoding failed");

        const locationName = geoData && geoData.length > 0 
            ? (geoData[0].state ? `${geoData[0].name}, ${geoData[0].state}, ${geoData[0].country}` : `${geoData[0].name}, ${geoData[0].country}`)
            : "Unknown Location";

        const weatherRes = await fetch(`${BASE_URL}weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const weatherData = await weatherRes.json();
        
        if (!weatherRes.ok) throw new Error(weatherData.message || "Weather fetch failed");

        const forecastRes = await fetch(`${BASE_URL}forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        const forecastData = await forecastRes.json();

        if (!forecastRes.ok) throw new Error(forecastData.message || "Forecast fetch failed");

        // Fetch Air Quality Data
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const aqiData = await aqiRes.json();

        // Fetch UV Index
        let uvData = null;
        try {
            const uvRes = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
            if (uvRes.ok) uvData = await uvRes.json();
        } catch (e) { console.log("UV Index not available"); }

        weatherData.fullLocationName = locationName;

        displayWeather(weatherData, uvData);
        displayForecast(forecastData);
        displayAQI(aqiData);
        updateBackground(weatherData.weather[0].main);
        logEvent('Geolocation', `Lat: ${lat}, Lon: ${lon}, Location: ${locationName}`);
    } catch (error) {
        console.error("Geolocation Weather Error:", error);
        if (error.message.includes('401')) {
            showError("Invalid API Key. Please check your settings.");
        } else {
            showError("Failed to fetch weather for your location.");
        }
    } finally {
        hideLoading();
    }
}

// UI Updates
function displayWeather(data, uvData = null) {
    // Use the full location name (City, State, Country) if available
    cityName.textContent = data.fullLocationName || `${data.name}, ${data.sys.country}`;
    
    currentDate.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    temperature.textContent = Math.round(data.main.temp);
    weatherDescription.textContent = data.weather[0].description;
    weatherBadge.textContent = data.weather[0].main;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    sunrise.textContent = formatTime(data.sys.sunrise, data.timezone);
    sunset.textContent = formatTime(data.sys.sunset, data.timezone);
    cloudiness.textContent = `${data.clouds.all}%`;
    windDeg.textContent = `${data.wind.deg}°`;
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    tempMax.textContent = `${Math.round(data.main.temp_max)}°`;
    tempMin.textContent = `${Math.round(data.main.temp_min)}°`;

    // New detailed metrics
    if (uvData) {
        uvIndex.textContent = uvData.value;
    } else {
        uvIndex.textContent = "N/A";
    }

    if (data.wind.gust !== undefined && data.wind.gust !== null) {
        windGust.textContent = `${Math.round(data.wind.gust * 3.6)} km/h`;
    } else {
        windGust.textContent = "0 km/h";
    }

    // Dew point calculation: Td = T - ((100 - RH) / 5)
    const dewPointVal = Math.round(data.main.temp - ((100 - data.main.humidity) / 5));
    dewPoint.textContent = `${dewPointVal}°C`;

    weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
    updateWeatherTip(data);
    showWeather();
}

function updateWeatherTip(data) {
    const temp = data.main.temp;
    const condition = data.weather[0].main;
    let tip = "";

    if (condition === 'Rain') {
        tip = "Don't forget your umbrella today! It's going to be a wet one.";
    } else if (condition === 'Snow') {
        tip = "Bundle up! It's snowing outside. Perfect for some hot cocoa.";
    } else if (temp > 30) {
        tip = "It's quite hot! Stay hydrated and try to stay in the shade.";
    } else if (temp < 10) {
        tip = "Chilly weather today. A warm jacket is recommended.";
    } else if (condition === 'Clear') {
        tip = "Beautiful clear skies! A great day for outdoor activities.";
    } else {
        tip = "Have a wonderful day! Check the forecast before heading out.";
    }

    weatherTip.textContent = tip;
}

function displayAQI(data) {
    if (!data || !data.list || !data.list[0]) {
        aqiValue.textContent = "N/A";
        return;
    }
    const aqi = data.list[0].main.aqi;
    const levels = {
        1: "Good",
        2: "Fair",
        3: "Moderate",
        4: "Poor",
        5: "Very Poor"
    };

    aqiValue.textContent = levels[aqi] || "Unknown";
    
    // Remove old classes and add new one for coloring
    aqiCard.className = 'stat-card';
    aqiCard.classList.add(`aqi-${aqi}`);
}

function displayForecast(data) {
    forecastContainer.innerHTML = '';
    
    // Group forecast data by date and pick the one closest to 12:00
    const dailyData = [];
    const dates = new Set();
    
    data.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!dates.has(date)) {
            dates.add(date);
            // Try to find the entry for 12:00 for this date
            const noonEntry = data.list.find(entry => entry.dt_txt === `${date} 12:00:00`);
            dailyData.push(noonEntry || item);
        }
    });

    // Limit to 5 days and skip the current day if it's already late
    dailyData.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const card = document.createElement('div');
        card.className = 'forecast-card';
        card.innerHTML = `
            <p class="day">${date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
            <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="icon">
            <p class="temp">${Math.round(day.main.temp)}°C</p>
            <p class="desc">${day.weather[0].main}</p>
        `;
        forecastContainer.appendChild(card);
    });
}

// Helpers
function formatTime(ts, timezoneOffset) {
    // ts is UTC timestamp in seconds
    // timezoneOffset is offset from UTC in seconds
    const date = new Date((ts + timezoneOffset) * 1000);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZone: 'UTC' // Use UTC because we manually added the offset
    });
}

function updateBackground(condition) {
    const gradients = {
        Clear: 'linear-gradient(135deg, #FF8C00 0%, #FFD700 100%)',
        Clouds: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
        Rain: 'linear-gradient(135deg, #0984e3 0%, #2f3640 100%)',
        Snow: 'linear-gradient(135deg, #dfe6e9 0%, #b2bec3 100%)',
        Thunderstorm: 'linear-gradient(135deg, #2d3436 0%, #000000 100%)',
        Drizzle: 'linear-gradient(135deg, #74b9ff 0%, #636e72 100%)',
        Mist: 'linear-gradient(135deg, #b2bec3 0%, #636e72 100%)',
        Smoke: 'linear-gradient(135deg, #636e72 0%, #2d3436 100%)',
        Haze: 'linear-gradient(135deg, #e17055 0%, #636e72 100%)',
        Dust: 'linear-gradient(135deg, #fdcb6e 0%, #636e72 100%)',
        Fog: 'linear-gradient(135deg, #b2bec3 0%, #636e72 100%)',
    };
    
    bgOverlay.style.background = gradients[condition] || 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)';
    
    // Add weather class to body for additional styling
    document.body.className = '';
    document.body.classList.add(`weather-${condition.toLowerCase()}`);
}

function addToRecentSearches(city) {
    if (!searches.includes(city)) {
        searches.unshift(city);
        if (searches.length > 5) searches.pop();
        localStorage.setItem('recent_searches', JSON.stringify(searches));
        renderRecentSearches();
    }
}

function renderRecentSearches() {
    recentList.innerHTML = '';
    if (searches.length > 0) {
        recentSearches.classList.remove('hidden');
        searches.forEach(city => {
            const item = document.createElement('span');
            item.className = 'recent-item';
            item.textContent = city;
            item.onclick = () => getWeatherDataByCity(city);
            recentList.appendChild(item);
        });
    }
}

function showLoading() { loading.classList.remove('hidden'); }
function hideLoading() { loading.classList.add('hidden'); }
function showWeather() { weatherDisplay.classList.remove('hidden'); }
function hideWeather() { weatherDisplay.classList.add('hidden'); }
function showError(msg) { errorMessage.querySelector('p').textContent = msg; errorMessage.classList.remove('hidden'); }
function hideError() { errorMessage.classList.add('hidden'); }
function showInfo(msg) { infoMessage.querySelector('p').textContent = msg; infoMessage.classList.remove('hidden'); }
function hideInfo() { infoMessage.classList.add('hidden'); }

init();
