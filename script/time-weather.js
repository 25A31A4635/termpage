// ============================================================================
// Clock & Weather Services & Browser Engine Sniffer
// ============================================================================

/**
 * Clock ticker: updates the #time-display element with local time format.
 * Respects custom timezone overrides if configured, falling back to local system time.
 */
function updateTime() {
  const timeDisplay = document.getElementById('time-display');
  const now = new Date();
  const tz = getStoredTimezone();
  let timeStr;
  
  try {
    // Try to format current timestamp using Intl API matching timezone setting
    timeStr = new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(now);
  } catch (e) {
    // Simple fallback string parser in case Intl throws timezone error
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    timeStr = `${hours}:${minutes}`;
  }
  
  // Render calculated time string to DOM clock panel
  timeDisplay.textContent = timeStr;
}

// Open-Meteo Geocoding Lookup API
const GEO_API = 'https://geocoding-api.open-meteo.com/v1/search';
// Open-Meteo Forecast Weather Lookup API
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
// Cache expiration setting (TTL): check weather every 30 minutes to stay within API limits
const WEATHER_CACHE_TTL = 30 * 60 * 1000;

/**
 * Retrieves the current weather forecast using Open-Meteo API.
 * Uses localStorage cache to prevent excessive requests on quick tab reloads.
 */
async function updateWeather() {
  const weatherDisplay = document.getElementById('weather-display');
  const location = getStoredWeatherLocation();
  const unit = getStoredWeatherUnit();

  // Create query cache key identifier
  const cacheKey = `weather_${location}_${unit}`;
  const cached = localStorage.getItem(cacheKey);
  
  // Verify if cache data is active and valid (less than 30 minutes old)
  if (cached) {
    try {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < WEATHER_CACHE_TTL) {
        weatherDisplay.innerHTML = `<span>${data.name} ${data.temp}°${unit === 'fahrenheit' ? 'F' : 'C'}</span>`;
        return;
      }
    } catch (e) { /* ignore cache parse error */ }
  }

  // Display status indicator
  weatherDisplay.innerHTML = `<span>Loading...</span>`;

  try {
    // 1) Translate city name into geographic coordinates using Open-Meteo Geocoding
    const geoRes = await fetch(`${GEO_API}?name=${encodeURIComponent(location)}&count=1&language=en&format=json`);
    const geoData = await geoRes.json();

    if (geoData.results && geoData.results.length > 0) {
      const { latitude, longitude, name } = geoData.results[0];
      
      // 2) Fetch current weather values for resolved latitude/longitude
      const weatherRes = await fetch(`${WEATHER_API}?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const weatherData = await weatherRes.json();

      let temp = weatherData.current_weather.temperature;
      // Convert standard Celsius temperature to Fahrenheit if specified
      if (unit === 'fahrenheit') temp = (temp * 9 / 5) + 32;
      temp = Math.round(temp);

      // Save payload to local cache
      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: Date.now(),
        name,
        temp
      }));

      // Render weather details
      weatherDisplay.innerHTML = `<span>${name} ${temp}°${unit === 'fahrenheit' ? 'F' : 'C'}</span>`;
    } else {
      // Fallback display city name directly if geo lookup returns empty
      weatherDisplay.innerHTML = `<span>${location}</span>`;
    }
  } catch (error) {
    // Graceful error recovery: fallback to displaying raw city name
    console.error('Weather fetch error:', error);
    weatherDisplay.innerHTML = `<span>${location}</span>`;
  }
}

// Generic browser brand tokens to skip in userAgentData (noise matches)
const _GENERIC_BRANDS = new Set([
  'chromium', 'google chrome', 'not a brand', 'not;a brand', 'not/a)brand',
  'not_a brand', 'not?a_brand', 'not-a.brand',
]);

// Browser UserAgent matching rules in priority order (more specific engines first)
const _UA_RULES = [
  [/Brave/i,            'brave'],
  [/Helium/i,           'helium'],
  [/EdgA?\//i,          'edge'],
  [/OPR\//i,            'opera'],
  [/YaBrowser\//i,      'yandex'],
  [/Vivaldi\//i,        'vivaldi'],
  [/Firefox\//i,        'firefox'],
  [/SamsungBrowser\//i, 'samsung'],
  [/Chrome\//i,         'chrome'],
  [/Safari\//i,         'safari'],
];

/**
 * Detect the browser brand name to display inside terminal prompt (e.g. user@chrome$)
 * @returns {string} - Detected browser name
 */
function getBrowser() {
  // Check 1: Brave-specific API
  if (typeof navigator.brave?.isBrave === 'function') return 'brave';

  // Check 2: userAgentData brands (modern Chromium API)
  const brands = navigator.userAgentData?.brands;
  if (Array.isArray(brands)) {
    for (const { brand } of brands) {
      if (!_GENERIC_BRANDS.has(brand.toLowerCase())) return brand;
    }
  }

  // Check 3: Check matching rules against legacy navigator.userAgent string
  const ua = navigator.userAgent;
  for (const [re, name] of _UA_RULES) {
    if (re.test(ua)) return name;
  }

  // Default fallback identifier if detection returns empty
  return 'browser';
}