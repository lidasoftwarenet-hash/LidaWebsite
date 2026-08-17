(() => {
    const WEATHER_REFRESH_MS = 5 * 60 * 1000;
    let lastLoadedAt = 0;
    let loadingPromise = null;

    const cities = [
        {
            id: 'weatherTelAviv',
            latitude: 32.0853,
            longitude: 34.7818,
            timezone: 'Asia/Jerusalem'
        },
        {
            id: 'weatherBucharest',
            latitude: 44.4268,
            longitude: 26.1025,
            timezone: 'Europe/Bucharest'
        }
    ];

    function getWeatherPresentation(code) {
        const c = Number(code);
        if (c === 0) return { icon: '☀️', text: 'בהיר' };
        if (c === 1) return { icon: '🌤️', text: 'בהיר לרוב' };
        if (c === 2) return { icon: '⛅', text: 'מעונן חלקית' };
        if (c === 3) return { icon: '☁️', text: 'מעונן' };
        if ([45, 48].includes(c)) return { icon: '🌫️', text: 'ערפל' };
        if ([51, 53, 55, 56, 57].includes(c)) return { icon: '🌦️', text: 'טפטוף' };
        if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c)) return { icon: '🌧️', text: 'גשם' };
        if ([71, 73, 75, 77, 85, 86].includes(c)) return { icon: '🌨️', text: 'שלג' };
        if ([95, 96, 99].includes(c)) return { icon: '⛈️', text: 'סופות רעמים' };
        return { icon: '🌤️', text: 'מזג אוויר משתנה' };
    }

    async function fetchCurrentWeather(city) {
        const params = new URLSearchParams({
            latitude: String(city.latitude),
            longitude: String(city.longitude),
            current: 'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m',
            temperature_unit: 'celsius',
            wind_speed_unit: 'kmh',
            timezone: city.timezone
        });

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`Weather request failed: ${response.status}`);
        }

        const json = await response.json();
        if (!json.current) {
            throw new Error('Weather response missing current conditions');
        }

        return json.current;
    }

    function renderWeather(city, current) {
        const root = document.getElementById(city.id);
        const dataEl = root?.querySelector('.weather-city-data');
        if (!dataEl) return;

        const presentation = getWeatherPresentation(current.weather_code);
        const temperature = Math.round(current.temperature_2m);
        const apparentTemperature = Math.round(current.apparent_temperature);
        const humidity = Math.round(current.relative_humidity_2m);
        const windSpeed = Math.round(current.wind_speed_10m);

        dataEl.innerHTML = `
            <div class="weather-temp">
                <span class="weather-temp-icon">${presentation.icon}</span>
                <span class="weather-temp-value">${temperature}°</span>
            </div>
            <div class="weather-condition">${presentation.text}</div>
            <div class="weather-details">
                <span>מרגיש כמו ${apparentTemperature}°</span>
                <span>לחות ${humidity}%</span>
                <span>רוח ${windSpeed} קמ״ש</span>
            </div>
        `;
    }

    async function loadWeather(force = false) {
        if (!force && Date.now() - lastLoadedAt < WEATHER_REFRESH_MS) return;
        if (loadingPromise) return loadingPromise;

        loadingPromise = Promise.all(cities.map(async city => {
            const root = document.getElementById(city.id);
            const dataEl = root?.querySelector('.weather-city-data');
            if (!dataEl) return;

            try {
                const current = await fetchCurrentWeather(city);
                renderWeather(city, current);
            } catch (error) {
                console.error(`Failed to load weather for ${city.id}:`, error);
                dataEl.textContent = 'לא ניתן לטעון נתוני מזג אוויר';
            }
        })).finally(() => {
            lastLoadedAt = Date.now();
            loadingPromise = null;
        });

        return loadingPromise;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const weatherButton = document.getElementById('weatherToggleBtn');
        const weatherPanel = document.getElementById('weatherPanel');
        if (!weatherButton || !weatherPanel) return;

        // app.js still contains the legacy wttr.in click handler. Use a capture
        // listener so the weather panel is driven only by this fresher provider.
        weatherButton.addEventListener('click', event => {
            event.preventDefault();
            event.stopImmediatePropagation();

            const opening = weatherPanel.classList.toggle('hidden') === false;
            if (opening) {
                loadWeather(false);
            }
        }, true);

        // Keep an open panel fresh even when the news page stays open for hours.
        setInterval(() => {
            if (!weatherPanel.classList.contains('hidden')) {
                loadWeather(true);
            }
        }, WEATHER_REFRESH_MS);
    });
})();
