// ========================================
// Config Modal
// ========================================
function openConfig() {
  document.getElementById('weather-location').value = getStoredWeatherLocation();
  document.getElementById('time-zone').value = getStoredTimezone();
  document.getElementById('config-username').value = getStoredUsername();
  document.getElementById('search-engine').value = getStoredSearchEngine();
  document.getElementById('terminal-placeholder').value = getStoredTerminalPlaceholder();
  document.getElementById('config-modal').classList.add('active');
}

function closeConfig() {
  document.getElementById('config-modal').classList.remove('active');
}

function saveConfig() {
  const sanitize = (str) => typeof str === 'string' ? str.replace(/[<>]/g, '').trim() : '';

  const weatherInput = document.getElementById('weather-location');
  const timezoneInput = document.getElementById('time-zone');
  const usernameInput = document.getElementById('config-username');
  const searchEngineInput = document.getElementById('search-engine');
  const placeholderInput = document.getElementById('terminal-placeholder');

  const loc = sanitize(weatherInput.value) || (typeof DEFAULT_WEATHER_LOCATION !== 'undefined' ? DEFAULT_WEATHER_LOCATION : '');
  const tz = sanitize(timezoneInput.value) || (typeof DEFAULT_TIMEZONE !== 'undefined' ? DEFAULT_TIMEZONE : '');

  saveWeatherLocation(loc);
  saveTimezone(tz);
  if (usernameInput.value.trim()) saveUsername(usernameInput.value.trim());
  saveSearchEngine(searchEngineInput.value);
  saveTerminalPlaceholder(placeholderInput.value);

  const terminalInput = document.getElementById('terminal-input');
  if (terminalInput) {
    terminalInput.placeholder = getStoredTerminalPlaceholder();
  }

  updateWeather();
  closeConfig();
  document.getElementById('username').textContent = getStoredUsername();
  showToast('Configuration saved', 'success');
}