// ============================================================================
// Command Router & Search Override Mappings
// ============================================================================

/**
 * Open the version details popup.
 * Resolves browser manifest version if available, falling back to local constants.
 */
function openVersion() {
  // Try WebExtension chrome.runtime or browser.runtime, fallback to window global
  const ver = (typeof browser !== 'undefined' && browser.runtime?.getManifest?.()?.version) || 
              (typeof chrome !== 'undefined' && chrome.runtime?.getManifest?.()?.version) || 
              window.APP_VERSION || 
              'unknown';
  
  // Display standard popup alert with application info
  showAlert('Version: ' + ver, { title: 'Start Page', type: 'info' });
}

/**
 * Fetch the latest master branch version file from GitHub and check if local version is outdated.
 */
async function checkForUpdate() {
  // Remote location for raw version file matching this repository version source
  const REMOTE_URL = 'https://raw.githubusercontent.com/caffienerd/startpage/refs/heads/master/version/version.js';
  
  // Resolve current active local extension version
  const local = (typeof browser !== 'undefined' && browser.runtime?.getManifest?.()?.version) || 
                (typeof chrome !== 'undefined' && chrome.runtime?.getManifest?.()?.version) || 
                window.APP_VERSION || 
                'unknown';

  // Display checking status toast
  showToast('Checking for updates...', 'info', 2500);

  try {
    // Poll version script from remote, bypass caches using timestamp
    const res = await fetch(REMOTE_URL + '?_=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    // Extract version content and locate matching constant declaration line
    const text = await res.text();
    const match = text.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
    if (!match) throw new Error('Could not parse remote version');
    const remote = match[1];

    // Trigger success notification or warn on outdated version
    if (remote === local) {
      showAlert(`You're up to date!\n\nCurrent version: v${local}`, { title: 'No Updates', type: 'success' });
    } else {
      showAlert(
        `New version available!\n\nInstalled:  v${local}\nLatest:     v${remote}\n\ngithub.com/caffienerd/startpage`,
        { title: 'Update Available', type: 'warning' }
      );
    }
  } catch (err) {
    // Notify update check lookup failure
    showAlert(`Could not reach GitHub.\n\n${err.message}`, { title: 'Update Check Failed', type: 'error' });
  }
}

/**
 * Main command entry dispatcher. Analyzes raw input bar contents and decides whether
 * to toggle visual modals, change active styling themes, trigger custom user search shortcuts, 
 * or navigate to external URLs.
 * @param {string} value - Raw search query or terminal command from input element
 */
function handleSpecialCommands(value) {
  // Trim spaces and prepare variables
  const rawValue = value.trim();
  const normalized = rawValue.toLowerCase();
  const input = document.getElementById('terminal-input');
  const elements = document.querySelectorAll("a");

  // Inline helper to clear the terminal input and reset visual highlights
  const clear = () => {
    input.value = '';
    resetStyles(elements);
    updateSyntaxHighlight("");
  };

  // ---- 1. System/Modal Command Dispatches ----
  if (normalized === ":help") { openHelp(); clear(); return; }
  if (normalized === ":version" || normalized === ":ver") { openVersion(); clear(); return; }
  if (normalized === ":update") { checkForUpdate(); clear(); return; }
  if (normalized === ":history") { openHistory(); clear(); return; }
  if (normalized === ":tour") { openTour(true); clear(); return; }
  if (normalized === ":export") { exportBackup(); clear(); return; }
  if (normalized === ":import") { importBackup(); clear(); return; }
  if (normalized === ":reset") { handleResetCommand(); clear(); return; }
  if (normalized === ":bookmarks" || normalized === ":bm") { openBookmarksModal(); clear(); return; }
  if (normalized === ":customize" || normalized === ":custom") { openCustomizeModal(); clear(); return; }
  if (normalized === ":tags") { openTagsModal(); clear(); return; }
  if (normalized === ":config" || normalized === ":weather" || normalized === ":time") { openConfig(); clear(); return; }

  // ---- 2. Visual Theme Switchers ----
  // Strip starting colon to check theme name match (e.g. ":mocha" -> "mocha")
  const themeMatch = normalized.replace(/^:/, '');
  
  // Register theme abbreviations/aliases for fast switching
  const THEME_ALIASES = {
    'amoled': 'black',
    'hacker': 'root',
    'cyberpunk': 'neon',
    'latte': 'catppuccin-latte',
    'frappe': 'catppuccin-frappe',
    'macchiato': 'catppuccin-macchiato',
    'mocha': 'catppuccin-mocha',
    'gruvbox': 'gruvbox-dark',
    'everforest': 'everforest-dark'
  };
  
  // Map shorthand alias to its full theme name wrapper
  const targetTheme = THEME_ALIASES[themeMatch] || themeMatch;

  // Verify theme target exists in catalog, apply classes, and save selection
  if (THEMES.includes(targetTheme) || targetTheme === 'light') {
    THEMES.forEach(t => {
      document.body.classList.remove(`${t}-mode`);
      document.documentElement.classList.remove(`${t}-mode`);
    });
    if (targetTheme !== 'light') {
      document.documentElement.classList.add(`${targetTheme}-mode`);
    }
    saveTheme(targetTheme);
    clear();
    return;
  }

  // ---- 3. Custom Search Overrides and Custom User Prefixes ----
  // Fetch custom tags mapped from tags editor panel
  const customTags = typeof getStoredCustomTags === 'function' ? getStoredCustomTags() : [];
  for (const tag of customTags) {
    if (!tag.prefix || !tag.url) continue;
    // Perform case-insensitive start prefix regex check (e.g. "gh: query" -> tag.prefix === "gh")
    const re = new RegExp(`^${tag.prefix}:`, 'i');
    if (re.test(rawValue)) {
      const q = encodeURIComponent(rawValue.replace(re, '').trim());
      // Replace placeholder `$q` in target URL mapping with query string
      navigate(tag.url.replace(/\$q/g, q) + (tag.url.includes('$q') ? '' : q));
      return;
    }
  }

  // Check search engine override parameters
  const overrides = typeof getStoredSearchOverrides === 'function' ? getStoredSearchOverrides() : {};

  // ---- 4. Built-in Static Search Shortcuts ----
  if (/^yt:/i.test(rawValue)) { navigate(`${overrides.yt || 'https://www.youtube.com/results?search_query='}${encodeSearchQuery(rawValue, 'yt:')}`); return; }
  if (/^r:/i.test(rawValue)) { navigate(`${overrides.r || 'https://google.com/search?q=site:reddit.com '}${rawValue.replace(/^r:/i, '')}`); return; }
  if (/^ddg:/i.test(rawValue)) { navigate(`${overrides.ddg || 'https://duckduckgo.com/?q='}${encodeSearchQuery(rawValue, 'ddg:')}`); return; }
  if (/^bing:/i.test(rawValue)) { navigate(`${overrides.bing || 'https://www.bing.com/search?q='}${encodeSearchQuery(rawValue, 'bing:')}`); return; }
  if (/^ggl:/i.test(rawValue)) { navigate(`${overrides.ggl || 'https://www.google.com/search?q='}${encodeSearchQuery(rawValue, 'ggl:')}`); return; }
  if (/^amazon:/i.test(rawValue)) { navigate(`${overrides.amazon || 'https://www.amazon.com/s?k='}${encodeSearchQuery(rawValue, 'amazon:')}`); return; }
  if (/^imdb:/i.test(rawValue)) { navigate(`${overrides.imdb || 'https://www.imdb.com/find?q='}${encodeSearchQuery(rawValue, 'imdb:')}`); return; }
  if (/^alt:/i.test(rawValue)) { navigate(`${overrides.alt || 'https://alternativeto.net/browse/search/?q='}${encodeSearchQuery(rawValue, 'alt:')}`); return; }
  if (/^maps:/i.test(rawValue)) { navigate(`${overrides.maps || 'https://www.google.com/maps/search/'}${encodeSearchQuery(rawValue, 'maps:')}`); return; }
  if (/^def:/i.test(rawValue)) { navigate(`https://onelook.com/?w=${encodeSearchQuery(rawValue, "def:")}`); return; }
  if (/^the:/i.test(rawValue)) { navigate(`https://onelook.com/thesaurus/?s=${encodeSearchQuery(rawValue, "the:")}`); return; }
  if (/^syn:/i.test(rawValue)) { navigate(`https://onelook.com/?related=1&w=${encodeSearchQuery(rawValue, "syn:")}`); return; }
  if (/^quote:/i.test(rawValue)) { navigate(`https://onelook.com/?mentions=1&w=${encodeSearchQuery(rawValue, "quote:")}`); return; }
  if (/^cws:/i.test(rawValue)) {
    const q = rawValue.replace(/^cws:/i, "").trim();
    navigate(getBrowser() === "firefox"
      ? `https://addons.mozilla.org/en-US/firefox/search/?q=${encodeURIComponent(q)}`
      : `https://chromewebstore.google.com/search/${encodeURIComponent(q)}`);
    return;
  }

  // ---- 5. URL Redirection / Default Web Search Engines ----
  // Simple check: if input string splits into dots with no spaces, treat it as a direct domain URL
  if (rawValue.split(".").length >= 2 && !rawValue.includes(" ")) {
    navigate(rawValue.startsWith("http") ? rawValue : `https://${rawValue}`);
  } else {
    // If not a URL, route to user's configured fallback search engine
    const engine = (typeof getStoredSearchEngine === 'function') ? getStoredSearchEngine() : 'google';
    const q = encodeURIComponent(rawValue);
    if (engine === 'ddg') navigate(`https://duckduckgo.com/?q=${q}`);
    else if (engine === 'bing') navigate(`https://www.bing.com/search?q=${q}`);
    else navigate(`https://google.com/search?q=${q}`);
  }
}

/**
 * Turn on visual loading page transitions overlay
 */
function showLoading() {
  const el = document.getElementById('loading-overlay');
  if (!el) return;
  el.classList.remove('hiding');
  el.classList.add('visible');
}

/**
 * Handle browser window navigation changes safely
 * @param {string} url - Target URL address redirect destination
 */
function navigate(url) {
  try {
    showLoading();
    window.location.href = url;
  } catch (e) { console.error('Navigation failed', e); }
}

/**
 * Strip command prefix tokens and extract search query payloads
 * @param {string} value - Raw terminal input text
 * @param {string} prefix - Command prefix to look for and strip
 * @returns {string} - Extracted search payload
 */
function encodeSearchQuery(value, prefix) {
  return encodeURIComponent(value.startsWith(prefix) ? value.slice(prefix.length).trim() : value.trim());
}

/**
 * Reset layout data command: clears all local settings, bookmarks, and reloads page back to defaults
 */
async function handleResetCommand() {
  const confirmed = await showConfirm(
    'This will clear ALL settings, bookmarks, API keys, themes, syntax colors, favicon cache, command history, and any other stored data.\n\nThe page will reload with factory defaults.',
    { title: 'Reset Everything?', confirmLabel: 'Yes, reset', cancelLabel: 'Cancel' }
  );
  if (!confirmed) return;

  // Attempt to wipe extension local storage API structures if executing inside extension context
  try {
    const extStorage = (typeof browser !== 'undefined' && browser?.storage?.local)
      ? browser.storage.local
      : (typeof chrome !== 'undefined' && chrome?.storage?.local)
        ? chrome.storage.local
        : null;
    if (extStorage) extStorage.clear();
  } catch (e) {}

  // Wipe standard localStorage keys completely
  localStorage.clear();

  // Reload page
  showToast('All data cleared — reloading...', 'success', 1500);
  setTimeout(() => location.reload(), 1500);
}

// Target index pointer for keyboard navigation through history lists
let _historySelectedIndex = -1;

/**
 * Open the Command History popup list overlay
 */
function openHistory() {
  // Render current history listing
  _renderHistoryModal();
  document.getElementById('history-modal').classList.add('active');
  _historySelectedIndex = -1;

  // Keyboard navigation logic within the history modal listing
  const modal = document.getElementById('history-modal');
  modal._historyKeydown = (e) => {
    const entries = [...document.querySelectorAll('#history-list .history-entry')];

    // Escape closes history
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeHistoryModal();
      return;
    }

    if (!entries.length) return;

    // PgUp/PgDn jumps count
    const LIST_SCROLL_PAGE = 5; 

    // Handle arrow navigation and page adjustments
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _historySelectedIndex = Math.min(_historySelectedIndex + 1, entries.length - 1);
      if (_historySelectedIndex < 0) _historySelectedIndex = 0;
      entries[_historySelectedIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _historySelectedIndex = Math.max(_historySelectedIndex - 1, 0);
      entries[_historySelectedIndex].focus();
    } else if (e.key === 'PageDown') {
      e.preventDefault();
      _historySelectedIndex = Math.min(_historySelectedIndex + LIST_SCROLL_PAGE, entries.length - 1);
      if (_historySelectedIndex < 0) _historySelectedIndex = 0;
      entries[_historySelectedIndex].focus();
    } else if (e.key === 'PageUp') {
      e.preventDefault();
      _historySelectedIndex = Math.max(_historySelectedIndex - LIST_SCROLL_PAGE, 0);
      entries[_historySelectedIndex].focus();
    }
  };
  modal.addEventListener('keydown', modal._historyKeydown);

  // Set focus on first entry automatically
  requestAnimationFrame(() => {
    const first = document.querySelector('#history-list .history-entry');
    if (first) { _historySelectedIndex = 0; first.focus(); }
  });
}

/**
 * Close the Command History overlay modal
 */
function closeHistoryModal() {
  const modal = document.getElementById('history-modal');
  if (modal._historyKeydown) {
    modal.removeEventListener('keydown', modal._historyKeydown);
    delete modal._historyKeydown;
  }
  modal.classList.remove('active');
  document.getElementById('terminal-input')?.focus();
}

/**
 * Render history elements dynamically inside overlay list
 */
function _renderHistoryModal() {
  const h = loadHistory();
  const list = document.getElementById('history-list');
  list.replaceChildren();

  // Show placeholders if history is empty
  if (!h.length) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'history-empty';
    emptyDiv.textContent = 'No history yet.';
    list.appendChild(emptyDiv);
    return;
  }

  // Render entries in reverse order (most recent queries on top)
  [...h].reverse().forEach((entry, i) => {
    const el = document.createElement('div');
    el.className = 'history-entry';
    el.tabIndex = 0;
    el.dataset.entry = entry;

    const idxSpan = document.createElement('span');
    idxSpan.className = 'history-index';
    idxSpan.textContent = String(i + 1);

    const textSpan = document.createElement('span');
    textSpan.className = 'history-text';
    textSpan.textContent = entry;

    el.appendChild(idxSpan);
    el.appendChild(textSpan);

    // Click/Enter action handler
    el.addEventListener('click', () => _fillFromHistory(entry));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); _fillFromHistory(entry); }
    });

    list.appendChild(el);
  });
}

/**
 * Populates terminal input with history item and closes overlay
 * @param {string} entry - Selected history text
 */
function _fillFromHistory(entry) {
  closeHistoryModal();
  const input = document.getElementById('terminal-input');
  if (input) {
    input.value = entry;
    input.focus();
    if (typeof updateSyntaxHighlight === 'function') updateSyntaxHighlight(entry);
  }
}

/**
 * Clears terminal queries history list from storage
 */
function clearHistory() {
  localStorage.removeItem('terminal-history-v1');
  _renderHistoryModal();
  showToast('History cleared', 'success');
}