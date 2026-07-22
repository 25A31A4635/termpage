// ============================================================================
// Defaults & Storage Initializations
// ============================================================================

// Default bookmark grid structure displayed on first load (upfront links)
const DEFAULT_BOOKMARKS = [
  { href: "https://stuffifound.pages.dev/", title: "StuffIFound" },
  { href: "https://huggingface.co/spaces", title: "HuggingFace" },
  { href: "https://youtube.com", title: "YouTube" },
  { href: "https://drive.google.com/", title: "Drive" },
  { href: "https://discord.com/app", title: "Discord" },
  { href: "https://deepsite.hf.co/", title: "Deepsite" },
  { href: "https://web.whatsapp.com/", title: "WhatsApp" },
  { href: "https://www.reddit.com/", title: "Reddit" },
  { href: "https://stuffifound.pages.dev/", title: "StuffIFound" },
  { href: "https://pinterest.com/", title: "Pinterest" },
  { href: "https://chat.deepseek.com/", title: "DeepSeek" },
  { href: "https://grok.com/", title: "Grock" },
  { href: "https://stuffifound.pages.dev/", title: "StuffIFound" },
  { href: "https://alternativeto.net/", title: "AlternativeTo" },
  { href: "https://stuffifound.pages.dev/", title: "StuffIFound" },
  { href: "https://gemini.google.com/app", title: "Gemini" },
  { href: "https://www.instagram.com/", title: "Instagram" },
  { href: "https://stuffifound.pages.dev/", title: "StuffIFound" },
  { href: "https://fmhy.net/", title: "FMHY" },
  { href: "https://claude.ai/new", title: "Claude" }
];

// Default general configuration values
const DEFAULT_USERNAME = "quanglius";
const DEFAULT_WEATHER_LOCATION = "Kakinada";
const DEFAULT_WEATHER_UNIT = "celsius";
// Automatically detect the system timezone string
const DEFAULT_TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
const DEFAULT_SEARCH_ENGINE = "google"; // "google" | "ddg" | "bing"
const DEFAULT_TERMINAL_PLACEHOLDER = "search anything...";

// Default shelf bookmarks (starts empty)
const DEFAULT_SHELF_BOOKMARKS = [];

// ============================================================================
// Syntax Highlighting Colors (Customizable, independent of layouts themes)
// ============================================================================
const DEFAULT_SYNTAX_COLORS = {
  cmd:     '#667eea', // :commands
  theme:   '#f6ad55', // :theme commands
  search:  '#f39c12', // search prefixes (yt:, maps:, etc.)
  version: '#00b894', // :version
  url:     '#5fafaf', // direct URLs (chess.com)
  unknown: '#e74c3c', // unrecognised commands starting with :
};

/**
 * Retrieve syntax colors mapping from storage
 * @returns {Object} - Parsed hex colors mapping
 */
function getStoredSyntaxColors() {
  try {
    const stored = localStorage.getItem('syntaxColors');
    if (!stored) return { ...DEFAULT_SYNTAX_COLORS };
    return { ...DEFAULT_SYNTAX_COLORS, ...JSON.parse(stored) };
  } catch (e) {
    return { ...DEFAULT_SYNTAX_COLORS };
  }
}

/**
 * Save syntax colors mapping to storage
 * @param {Object} colors - Hex colors mapping
 */
function saveSyntaxColors(colors) {
  try {
    localStorage.setItem('syntaxColors', JSON.stringify(colors));
  } catch (e) { console.error('Failed to save syntax colors:', e); }
}

/**
 * Set custom syntax CSS variables on document element
 * @param {Object} colors - Hex colors mapping
 */
function applySyntaxColors(colors) {
  const root = document.documentElement;
  root.style.setProperty('--syn-cmd',     colors.cmd     || DEFAULT_SYNTAX_COLORS.cmd);
  root.style.setProperty('--syn-theme',   colors.theme   || DEFAULT_SYNTAX_COLORS.theme);
  root.style.setProperty('--syn-search',  colors.search  || DEFAULT_SYNTAX_COLORS.search);
  root.style.setProperty('--syn-version', colors.version || DEFAULT_SYNTAX_COLORS.version);
  root.style.setProperty('--syn-url',     colors.url     || DEFAULT_SYNTAX_COLORS.url);
  root.style.setProperty('--syn-unknown', colors.unknown || DEFAULT_SYNTAX_COLORS.unknown);
}

// ============================================================================
// Bookmarks Storage Managers
// ============================================================================

/**
 * Get upfront bookmarks array
 * @returns {Array} - Array of bookmark objects
 */
function getStoredBookmarks() {
  try {
    const stored = localStorage.getItem('bookmarks');
    return stored ? JSON.parse(stored) : DEFAULT_BOOKMARKS;
  } catch (e) {
    console.error('Failed to parse bookmarks:', e);
    return DEFAULT_BOOKMARKS;
  }
}

/**
 * Save upfront bookmarks array
 * @param {Array} bookmarks - Array of bookmark objects
 */
function saveBookmarks(bookmarks) {
  if (!Array.isArray(bookmarks)) throw new Error('Invalid bookmarks data');
  try {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save bookmarks:', e);
    showToast('Could not save bookmarks. Storage may be full.', 'error', 4000);
  }
}

// ============================================================================
// Shelf Bookmarks (hidden bookmarks surfaced on search filters)
// ============================================================================

/**
 * Get shelf bookmarks array
 * @returns {Array} - Array of shelf bookmark objects
 */
function getStoredShelfBookmarks() {
  try {
    const stored = localStorage.getItem('shelfBookmarks');
    return stored ? JSON.parse(stored) : DEFAULT_SHELF_BOOKMARKS;
  } catch (e) {
    console.error('Failed to parse shelf bookmarks:', e);
    return DEFAULT_SHELF_BOOKMARKS;
  }
}

/**
 * Save shelf bookmarks array
 * @param {Array} bookmarks - Array of shelf bookmark objects
 */
function saveShelfBookmarks(bookmarks) {
  if (!Array.isArray(bookmarks)) throw new Error('Invalid shelf bookmarks data');
  try {
    localStorage.setItem('shelfBookmarks', JSON.stringify(bookmarks));
  } catch (e) {
    console.error('Failed to save shelf bookmarks:', e);
    showToast('Could not save shelf bookmarks. Storage may be full.', 'error', 4000);
  }
}

// ============================================================================
// Identity Settings
// ============================================================================

/**
 * Get username string
 * @returns {string} - Username string
 */
function getStoredUsername() {
  return localStorage.getItem('username') || DEFAULT_USERNAME;
}

/**
 * Save username string
 * @param {string} name - Username string
 */
function saveUsername(name) {
  if (!name || typeof name !== 'string') throw new Error('Invalid username');
  try {
    localStorage.setItem('username', name.trim());
  } catch (e) {
    console.error('Failed to save username:', e);
  }
}

// ============================================================================
// Theme Settings
// ============================================================================

/**
 * Get active theme name
 * @returns {string} - Theme name
 */
function getStoredTheme() {
  return localStorage.getItem('theme') || 'light';
}

/**
 * Save active theme name
 * @param {string} theme - Theme name
 */
function saveTheme(theme) {
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.error('Failed to save theme:', e);
  }
}

// ============================================================================
// Weather & Timezone Settings
// ============================================================================

/**
 * Get weather city location
 * @returns {string} - City location string
 */
function getStoredWeatherLocation() {
  return localStorage.getItem('weatherLocation') || DEFAULT_WEATHER_LOCATION;
}

/**
 * Save weather city location
 * @param {string} location - City location string
 */
function saveWeatherLocation(location) {
  try {
    localStorage.setItem('weatherLocation', location);
  } catch (e) { console.error(e); }
}

/**
 * Get weather units ('celsius' or 'fahrenheit')
 * @returns {string} - Weather units
 */
function getStoredWeatherUnit() {
  return localStorage.getItem('weatherUnit') || DEFAULT_WEATHER_UNIT;
}

/**
 * Save weather units
 * @param {string} unit - Weather units
 */
function saveWeatherUnit(unit) {
  try {
    localStorage.setItem('weatherUnit', unit);
  } catch (e) { console.error(e); }
}

/**
 * Get active timezone override
 * @returns {string} - Timezone string
 */
function getStoredTimezone() {
  return localStorage.getItem('timezone') || DEFAULT_TIMEZONE;
}

/**
 * Save timezone override
 * @param {string} tz - Timezone string
 */
function saveTimezone(tz) {
  try {
    localStorage.setItem('timezone', tz);
  } catch (e) { console.error(e); }
}

// ============================================================================
// Custom Shortcuts (Overrides and Custom Tags)
// ============================================================================

// Catalog of built-in overrideable search prefixes
const OVERRIDEABLE_PREFIXES = {
  'yt':     { label: 'YouTube',       default: 'https://www.youtube.com/results?search_query=' },
  'r':      { label: 'Reddit',        default: 'https://google.com/search?q=site:reddit.com ' },
  'ddg':    { label: 'DuckDuckGo',    default: 'https://duckduckgo.com/?q=' },
  'bing':   { label: 'Bing',          default: 'https://www.bing.com/search?q=' },
  'ggl':    { label: 'Google',        default: 'https://www.google.com/search?q=' },
  'amazon': { label: 'Amazon',        default: 'https://www.amazon.com/s?k=' },
  'imdb':   { label: 'IMDb',          default: 'https://www.imdb.com/find?q=' },
  'alt':    { label: 'AlternativeTo', default: 'https://alternativeto.net/browse/search/?q=' },
  'maps':   { label: 'Maps',          default: 'https://www.google.com/maps/search/' },
};

/**
 * Get custom search prefixes URL overrides mapping
 * @returns {Object} - Key-value override URLs mapping
 */
function getStoredSearchOverrides() {
  try {
    const stored = localStorage.getItem('searchOverrides');
    return stored ? JSON.parse(stored) : {};
  } catch (e) { return {}; }
}

/**
 * Save custom search prefixes URL overrides mapping
 * @param {Object} overrides - Key-value overrides mapping
 */
function saveSearchOverrides(overrides) {
  try { localStorage.setItem('searchOverrides', JSON.stringify(overrides)); }
  catch (e) { console.error('Failed to save search overrides:', e); }
}

/**
 * Get custom user tags list
 * @returns {Array} - Array of custom tags ({prefix, url})
 */
function getStoredCustomTags() {
  try {
    const stored = localStorage.getItem('customTags');
    return stored ? JSON.parse(stored) : [];
  } catch (e) { return []; }
}

/**
 * Save custom user tags list
 * @param {Array} tags - Array of custom tags
 */
function saveCustomTags(tags) {
  try { localStorage.setItem('customTags', JSON.stringify(tags)); }
  catch (e) { console.error('Failed to save custom tags:', e); }
}

/**
 * Get fallback search engine selection
 * @returns {string} - Default engine name
 */
function getStoredSearchEngine() {
  const stored = localStorage.getItem('searchEngine') || DEFAULT_SEARCH_ENGINE;
  return ['google', 'ddg', 'bing'].includes(stored) ? stored : DEFAULT_SEARCH_ENGINE;
}

/**
 * Save fallback search engine selection
 * @param {string} engine - Default engine name
 */
function saveSearchEngine(engine) {
  const normalized = String(engine || '').toLowerCase();
  localStorage.setItem('searchEngine', ['google', 'ddg', 'bing'].includes(normalized) ? normalized : DEFAULT_SEARCH_ENGINE);
}

/**
 * Get terminal placeholder string
 * @returns {string} - Terminal placeholder text
 */
function getStoredTerminalPlaceholder() {
  const stored = localStorage.getItem('terminalPlaceholder');
  return stored !== null ? stored : DEFAULT_TERMINAL_PLACEHOLDER;
}

/**
 * Save terminal placeholder string
 * @param {string} text - Terminal placeholder text
 */
function saveTerminalPlaceholder(text) {
  localStorage.setItem('terminalPlaceholder', String(text || ''));
}

// ============================================================================
// Custom Fonts Configuration
// ============================================================================

const DEFAULT_BASE_FONT = 'default';
const DEFAULT_MONO_FONT = 'default';

/**
 * Get custom base font family selection
 * @returns {string} - Font selection name
 */
function getStoredBaseFont() {
  return localStorage.getItem('userBaseFont') || DEFAULT_BASE_FONT;
}

/**
 * Save custom base font family selection
 * @param {string} font - Font selection name
 */
function saveBaseFont(font) {
  try {
    localStorage.setItem('userBaseFont', font);
  } catch (e) { console.error('Failed to save base font:', e); }
}

/**
 * Get custom mono font family selection
 * @returns {string} - Font selection name
 */
function getStoredMonoFont() {
  return localStorage.getItem('userMonoFont') || DEFAULT_MONO_FONT;
}

/**
 * Save custom mono font family selection
 * @param {string} font - Font selection name
 */
function saveMonoFont(font) {
  try {
    localStorage.setItem('userMonoFont', font);
  } catch (e) { console.error('Failed to save mono font:', e); }
}

/**
 * Get raw custom base font string
 * @returns {string} - Raw base font string
 */
function getStoredBaseFontCustom() {
  return localStorage.getItem('userBaseFontCustom') || '';
}

/**
 * Save raw custom base font string
 * @param {string} font - Raw base font string
 */
function saveBaseFontCustom(font) {
  try {
    localStorage.setItem('userBaseFontCustom', font);
  } catch (e) { console.error('Failed to save custom base font:', e); }
}

/**
 * Get raw custom mono font string
 * @returns {string} - Raw mono font string
 */
function getStoredMonoFontCustom() {
  return localStorage.getItem('userMonoFontCustom') || '';
}

/**
 * Save raw custom mono font string
 * @param {string} font - Raw mono font string
 */
function saveMonoFontCustom(font) {
  try {
    localStorage.setItem('userMonoFontCustom', font);
  } catch (e) { console.error('Failed to save custom mono font:', e); }
}

/**
 * Resolve UI font name to browser font stack configurations
 * @param {string} value - Selected preset font name
 * @param {string} customVal - Raw custom typed font string
 * @param {boolean} isMono - True if resolving monospace font stack
 * @returns {string} - Fully declared CSS font-family string
 */
function resolveFontFamily(value, customVal, isMono) {
  if (value === 'default') {
    return '"JetBrainsMono Nerd Font", "JetBrains Mono", ui-monospace, monospace';
  }
  if (value === 'custom') {
    return customVal || (isMono ? 'monospace' : 'sans-serif');
  }
  
  // Standard preset font family stacks mapping
  const fontStacks = {
    'Inter': '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
    'Source Code Pro': '"Source Code Pro", ui-monospace, monospace',
    'Fira Code': '"Fira Code", ui-monospace, monospace',
    'Playfair Display': '"Playfair Display", serif',
    'Libre Baskerville': '"Libre Baskerville", serif',
    'Courier New': '"Courier New", Courier, monospace',
    'sans-serif': 'sans-serif',
    'serif': 'serif',
    'monospace': 'monospace'
  };
  
  return fontStacks[value] || value;
}

/**
 * Apply resolved font families to document styles
 */
function applyCustomFonts() {
  const baseSelect = getStoredBaseFont();
  const baseCustom = getStoredBaseFontCustom();
  const monoSelect = getStoredMonoFont();
  const monoCustom = getStoredMonoFontCustom();

  const baseFont = resolveFontFamily(baseSelect, baseCustom, false);
  const monoFont = resolveFontFamily(monoSelect, monoCustom, true);

  // Set CSS variables on body stylesheet
  document.body.style.setProperty('--font-family', baseFont);
  document.body.style.setProperty('--monospace-font-family', monoFont);
}

// ============================================================================
// Layout and Outer Borders Frame Styling Customizers
// ============================================================================

/**
 * Get hide info status (hide top timezone and weather bar)
 * @returns {boolean} - True if timezone/weather is hidden
 */
function getStoredHideInfo() {
  return localStorage.getItem('userHideInfo') === 'true';
}

/**
 * Save hide info status
 * @param {boolean} hide - Status flag
 */
function saveHideInfo(hide) {
  try {
    localStorage.setItem('userHideInfo', hide ? 'true' : 'false');
  } catch (e) { console.error('Failed to save hide info setting:', e); }
}

/**
 * Get block cursor style setting
 * @returns {boolean} - True if block cursor is enabled
 */
function getStoredBlockCursor() {
  return localStorage.getItem('userBlockCursor') === 'true';
}

/**
 * Save block cursor style setting
 * @param {boolean} block - Status flag
 */
function saveBlockCursor(block) {
  try {
    localStorage.setItem('userBlockCursor', block ? 'true' : 'false');
  } catch (e) { console.error('Failed to save block cursor setting:', e); }
}

/**
 * Get frame enabled layout setting
 * @returns {boolean} - True if border frame is active
 */
function getStoredFrameEnabled() {
  return localStorage.getItem('userFrameEnabled') === 'true';
}

/**
 * Save frame enabled layout setting
 * @param {boolean} enabled - Status flag
 */
function saveFrameEnabled(enabled) {
  try {
    localStorage.setItem('userFrameEnabled', enabled ? 'true' : 'false');
  } catch (e) { console.error('Failed to save frame enabled setting:', e); }
}

/**
 * Get outer frame border-radius
 * @returns {number} - Radius integer in pixels
 */
function getStoredFrameRadius() {
  const stored = localStorage.getItem('userFrameRadius');
  return stored !== null ? parseInt(stored, 10) : 8;
}

/**
 * Save outer frame border-radius
 * @param {number} radius - Radius integer in pixels
 */
function saveFrameRadius(radius) {
  try {
    localStorage.setItem('userFrameRadius', String(radius));
  } catch (e) { console.error('Failed to save frame radius setting:', e); }
}

/**
 * Get custom outer frame border color hex override
 * @returns {string} - Stored hex string
 */
function getStoredFrameColor() {
  return localStorage.getItem('userFrameColor') || '';
}

/**
 * Save custom outer frame border color hex override
 * @param {string} color - Stored hex string
 */
function saveFrameColor(color) {
  try {
    localStorage.setItem('userFrameColor', String(color || '').trim());
  } catch (e) { console.error('Failed to save frame color:', e); }
}

/**
 * Get custom theme background color hex override
 * @returns {string} - Stored hex string
 */
function getStoredThemeBgColor() {
  return localStorage.getItem('userThemeBgColor') || '';
}

/**
 * Save custom theme background color hex override
 * @param {string} color - Stored hex string
 */
function saveThemeBgColor(color) {
  try {
    localStorage.setItem('userThemeBgColor', String(color || '').trim());
  } catch (e) { console.error('Failed to save theme bg color:', e); }
}

/**
 * Get custom theme text color hex override
 * @returns {string} - Stored hex string
 */
function getStoredThemeTextColor() {
  return localStorage.getItem('userThemeTextColor') || '';
}

/**
 * Save custom theme text color hex override
 * @param {string} color - Stored hex string
 */
function saveThemeTextColor(color) {
  try {
    localStorage.setItem('userThemeTextColor', String(color || '').trim());
  } catch (e) { console.error('Failed to save theme text color:', e); }
}

/**
 * Apply layout settings, toggling CSS classes and CSS styling overrides variables on document.body
 */
function applyCustomLayouts() {
  const hideInfo = getStoredHideInfo();
  const infoSection = document.querySelector('.info-section');
  if (infoSection) {
    if (hideInfo) {
      infoSection.style.display = 'none';
    } else {
      infoSection.style.display = '';
    }
  }

  // Always force classic terminal layout mode
  document.body.classList.add('layout-classic-terminal');

  const blockCursor = getStoredBlockCursor();
  if (blockCursor) {
    document.body.classList.add('layout-block-cursor');
  } else {
    document.body.classList.remove('layout-block-cursor');
  }

  const frameEnabled = getStoredFrameEnabled();
  const frameRadius = getStoredFrameRadius();
  const frameEl = document.getElementById('terminal-frame');
  if (frameEl) {
    if (frameEnabled) {
      frameEl.classList.add('layout-frame-enabled');
      frameEl.style.setProperty('--frame-border-radius', `${frameRadius}px`);
    } else {
      frameEl.classList.remove('layout-frame-enabled');
      frameEl.style.removeProperty('--frame-border-radius');
    }
  }

  // Apply custom color overrides directly to document.body inline style
  const frameColor = getStoredFrameColor();
  const bgOverride = getStoredThemeBgColor();
  const textOverride = getStoredThemeTextColor();

  if (frameColor) {
    document.body.style.setProperty('--frame-border-color', frameColor);
  } else {
    document.body.style.removeProperty('--frame-border-color');
  }

  if (bgOverride) {
    document.body.style.setProperty('--background-color', bgOverride);
    document.body.style.setProperty('--terminal-bg', bgOverride);
  } else {
    document.body.style.removeProperty('--background-color');
    document.body.style.removeProperty('--terminal-bg');
  }

  if (textOverride) {
    document.body.style.setProperty('--text-color', textOverride);
  } else {
    document.body.style.removeProperty('--text-color');
  }
}