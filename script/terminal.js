// ============================================================================
// Terminal Services: Keyboard Capture, Autocomplete Hints, Syntax Coloring
// ============================================================================

/**
 * Initialize username prompt and browser name text overlays.
 */
function initializeBrowserInfo() {
  document.getElementById("username").textContent = getStoredUsername();
  document.getElementById("browser-info").textContent = getBrowser();
}

/**
 * Perform live prefix inspection and inject inline autocomplete preview hints and 
 * color code types (syntax class highlights) directly onto the input text box.
 * @param {string} rawValue - Current typed input string
 */
function updateSyntaxHighlight(rawValue) {
  const value = rawValue.toLowerCase();
  const hintEl = document.getElementById('command-hint');
  const input = document.getElementById('terminal-input');

  // Register command shorthand lookup table for Tab autocomplete preview
  const suggestions = {
    'r': 'r:',
    'y': 'yt:',
    'a': 'alt:',
    'am': 'amazon:',
    'd': 'def:',
    'dd': 'ddg:',
    'i': 'imdb:',
    't': 'the:',
    's': 'syn:',
    'q': 'quote:',
    'm': 'maps:',
    'c': 'cws:',
    'gg': 'ggl:',
    'bi': 'bing:',
    ':c': ':config',
    ':cu': ':customize',
    ':ta': ':tags',
    ':d': ':dark',
    ':b': ':black',
    ':am': ':amoled',
    ':bm': ':bookmarks',
    ':l': ':light',
    ':h': ':help',
    ':hi': ':history',
    ':to': ':tour',
    ':w': ':weather',
    ':ti': ':time',
    ':ve': ':version',
    ':up': ':update',
    ':ex': ':export',
    ':im': ':import',
    ':re': ':reset',
    ':no': ':nord',
    ':ne': ':newspaper',
    ':co': ':coffee',
    ':ro': ':root',
    ':neo': ':neon',
    ':lat': ':latte',
    ':fr': ':frappe',
    ':mac': ':macchiato',
    ':moch': ':mocha',
    ':gru': ':gruvbox-dark',
    ':dra': ':dracula',
    ':ka': ':kanagawa',
    ':ev': ':everforest-dark',
    ':ros': ':rose-pine',
    ':rose': ':rose-pine-moon',
    ':tok': ':tokyo-night'
  };

  // Inject custom search overrides prefixes into autocomplete lookup lists
  const customTags = typeof getStoredCustomTags === 'function' ? getStoredCustomTags() : [];
  customTags.forEach(tag => {
    if (tag.prefix && tag.prefix.length >= 2) {
      suggestions[tag.prefix.slice(0, 2)] = tag.prefix + ':';
    }
  });
  const customTagPrefixes = customTags.map(t => t.prefix).filter(Boolean);

  // Group theme switcher commands
  const themeCommands = [
    ':dark', ':black', ':amoled', ':light', ':nord', ':newspaper', ':coffee', ':root', ':neon',
    ':catppuccin-latte', ':catppuccin-frappe', ':catppuccin-macchiato', ':catppuccin-mocha',
    ':latte', ':frappe', ':macchiato', ':mocha',
    ':gruvbox-light', ':gruvbox-dark', ':gruvbox',
    ':dracula', ':kanagawa',
    ':everforest-light', ':everforest-dark', ':everforest',
    ':rose-pine', ':rose-pine-moon', ':tokyo-night'
  ];
  
  // Group system commands
  const knownCommands = [
    ':help', ':bookmarks', ':bm', ':config', ':customize', ':custom', ':tags', 
    ':weather', ':time', ':update', ':export', ':import', ':reset', ':history', 
    ':tour', ':hacker', ':cyberpunk', ...themeCommands
  ];
  
  // Group version lookup commands
  const versionCommands = [':version', ':ver', ':update'];
  
  // Compile regular expressions matching default search engines
  const knownSearch = /^(r|yt|alt|def|ddg|ggl|bing|amazon|imdb|the|syn|quote|maps|cws):/;
  const knownSearchDynamic = customTagPrefixes.length
    ? new RegExp(`^(r|yt|alt|def|ddg|ggl|bing|amazon|imdb|the|syn|quote|maps|cws|${customTagPrefixes.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')}):`)
    : knownSearch;

  // Search for matching autocomplete suggestion strings
  for (const [prefix, full] of Object.entries(suggestions)) {
    if (value && full.startsWith(value) && value !== full) {
      // Stash suggestion payload inside custom DOM property
      input.setAttribute('data-suggestion', full);
      const remaining = full.substring(value.length);
      // Overlay ghost autocomplete text behind text cursor
      hintEl.innerHTML = `<span style="visibility:hidden">${escapeHTML(rawValue)}</span><span class="suggestion">${escapeHTML(remaining)}</span>`;

      // Set corresponding syntax colors on the input text box
      if (value.startsWith(':')) {
        if (versionCommands.some(c => c.startsWith(value))) input.className = 'input-version';
        else if (themeCommands.some(c => c.startsWith(value))) input.className = 'input-theme';
        else input.className = 'input-cmd';
      } else if (knownSearchDynamic.test(value)) {
        input.className = 'input-search';
      } else if (value.length > 3 && /[a-z0-9]\.[a-z]+/.test(value) && !value.includes(' ')) {
        input.className = 'input-url';
      } else {
        input.className = '';
      }
      return;
    }
  }

  // Clear suggestions overlay if no prefix match succeeds
  input.removeAttribute('data-suggestion');

  // Perform split rendering if prefix key is matched (color prefix and query text differently)
  const rawPrefixMatch = rawValue.match(/^([^:\s]+:)(.+)$/);
  if (rawPrefixMatch && knownSearchDynamic.test(value)) {
    const [, rawPrefix, rawRest] = rawPrefixMatch;
    hintEl.innerHTML = `<span class="search">${escapeHTML(rawPrefix)}</span><span style="visibility:hidden">${escapeHTML(rawRest)}</span>`;
    input.className = '';
    return;
  }

  // Clear visual overlays
  hintEl.textContent = '';

  // Apply default syntax color mapping
  if (value.startsWith(':') && versionCommands.some(c => c === value || c.startsWith(value))) {
    input.className = 'input-version';
  } else if (value.startsWith(':') && themeCommands.some(c => c === value || c.startsWith(value))) {
    input.className = 'input-theme';
  } else if (value.startsWith(':') && knownCommands.some(c => c === value || c.startsWith(value))) {
    input.className = 'input-cmd';
  } else if (value.startsWith(':') && value.length > 1) {
    input.className = 'input-unknown';
  } else if (knownSearchDynamic.test(value)) {
    input.className = 'input-search';
  } else if (value.length > 3 && /[a-z0-9]\.[a-z]+/.test(value) && !value.includes(' ')) {
    input.className = 'input-url';
  } else {
    input.className = '';
  }
}

/**
 * Clean strings to prevent markup injections
 * @param {string} str - Unescaped text
 * @returns {string} - Cleaned text
 */
function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Resolve display title text from a bookmark anchor node
 * @param {HTMLElement} anchor - Bookmark anchor tag
 * @returns {string} - Resolved clean title text
 */
function getBookmarkTitle(anchor) {
  const label = anchor.querySelector('span');
  return (label ? label.textContent : anchor.textContent || '').trim() || 'Bookmark';
}

/**
 * Simple startswith and includes pattern match scanner through upfront bookmarks
 * @param {NodeList} elements - Bookmark links list
 * @param {string} rawValue - Match query string
 * @returns {Object|null} - Best matching bookmark URL metadata
 */
function findFirstBookmarkMatch(elements, rawValue) {
  const value = (rawValue || '').trim().toLowerCase();
  if (!value) return null;

  let bestMatch = null;

  // Search links list
  for (const el of elements) {
    const title = getBookmarkTitle(el).toLowerCase();

    // Priority 1: prefix starts with query
    if (title.startsWith(value)) {
      return {
        href: el.href,
        title: getBookmarkTitle(el),
        element: el
      };
    }

    // Priority 2: title includes query
    if (!bestMatch && title.includes(value)) {
      bestMatch = {
        href: el.href,
        title: getBookmarkTitle(el),
        element: el
      };
    }
  }

  return bestMatch;
}

/**
 * Set input listeners to trigger autocomplete hints and bookmarks matching
 * @param {HTMLInputElement} input - Terminal input element
 * @param {NodeList} elements - Bookmarks links list
 */
function handleInput(input, elements) {
  // Hide autocomplete hint if input scrolls horizontally (prevents overlapping rendering issues)
  input.addEventListener("scroll", () => {
    const hintEl = document.getElementById('command-hint');
    if (!hintEl) return;
    if (input.scrollLeft > 0) {
      hintEl.style.visibility = 'hidden';
    } else {
      hintEl.style.visibility = '';
    }
  });

  input.addEventListener("input", () => {
    // Stop layout processing if an overlay settings modal is visible
    if (document.querySelector('.config-modal.active, #sp-modal-overlay')) return;

    // Reset hints visibility
    const hintEl = document.getElementById('command-hint');
    if (hintEl) hintEl.style.visibility = '';

    const rawValue = input.value;
    updateSyntaxHighlight(rawValue);

    // Fetch active upfront grid link elements
    const liveElements = document.querySelectorAll("#bookmarks a");

    // Perform grid filtering. Swap in shelf items if shelf matching is supported
    let bookmarkMatch = null;
    if (typeof filterBookmarksWithShelf === 'function') {
      bookmarkMatch = filterBookmarksWithShelf(rawValue);
    } else {
      // Static fallback highlights check if shelf module isn't loaded
      bookmarkMatch = findFirstBookmarkMatch(liveElements, rawValue);
      liveElements.forEach(el => {
        const title = getBookmarkTitle(el).toLowerCase();
        const href = el.href.toLowerCase();
        if (!rawValue.trim() || rawValue.startsWith(':')) {
          el.parentElement?.classList.remove("bookmark-match", "bookmark-nomatch", "primary-match");
          return;
        }
        const isMatch = title.includes(rawValue.toLowerCase()) || href.includes(rawValue.toLowerCase());
        el.parentElement?.classList.toggle("bookmark-match", isMatch);
        el.parentElement?.classList.toggle("bookmark-nomatch", !isMatch);
      });
      if (bookmarkMatch?.element) {
        bookmarkMatch.element.parentElement?.classList.add("primary-match");
      }
    }
  });
}

// LocalStorage history settings configurations
const HISTORY_KEY = 'terminal-history-v1';
const HISTORY_MAX = 30;

/**
 * Fetch commands history list
 * @returns {Array} - History strings list
 */
function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch { return []; }
}

/**
 * Save commands history list
 * @param {Array} history - History strings list
 */
function saveHistory(history) {
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history)); } catch {}
}

/**
 * Append command string to queries history stack
 * @param {string} entry - Executed command text
 */
function pushHistory(entry) {
  if (!entry || !entry.trim()) return;
  const h = loadHistory();
  // Move duplicate to end of array stack
  const deduped = h.filter(e => e !== entry.trim());
  deduped.push(entry.trim());
  // Splice top elements if history exceeds max capacity (30 items limit)
  if (deduped.length > HISTORY_MAX) deduped.splice(0, deduped.length - HISTORY_MAX);
  saveHistory(deduped);
}

/**
 * Keyboard bindings handler: Tab completion, Ctrl+Enter redirects, Arrow history lookup
 * @param {HTMLInputElement} input - Terminal input text box
 * @param {NodeList} elements - Bookmarks link elements list
 */
function handleKeyboardEvents(input, elements) {
  let filteredHistory = [];
  let historyIndex    = -1;
  let historyPrefix   = '';

  /**
   * Filter commands history items starting with input prefix
   * @param {string} prefix - Query search prefix
   * @returns {Array} - Filtered history list
   */
  function buildFilteredHistory(prefix) {
    const h = loadHistory();
    const reversed = [...h].reverse();
    if (!prefix) return reversed;
    const lp = prefix.toLowerCase();
    return reversed.filter(e => e.toLowerCase().startsWith(lp));
  }

  input.addEventListener("keydown", (e) => {
    const rawValue = input.value;
    const value = rawValue.toLowerCase();

    // Check overlay structures
    const activeModal = document.querySelector('.config-modal.active');
    const anyModalOpen = activeModal || document.getElementById('sp-modal-overlay');
    
    // Redirect arrow key scrolling directly to modal container if a modal is visible
    if (activeModal) {
      const content = activeModal.querySelector('.config-content') || activeModal;
      const scrollAmount = 40;
      const pageAmount = 300;
      if (e.key === 'ArrowUp')   { content.scrollTop -= scrollAmount; e.preventDefault(); return; }
      if (e.key === 'ArrowDown') { content.scrollTop += scrollAmount; e.preventDefault(); return; }
      if (e.key === 'PageUp')    { content.scrollTop -= pageAmount;   e.preventDefault(); return; }
      if (e.key === 'PageDown')  { content.scrollTop += pageAmount;   e.preventDefault(); return; }
    }

    if (anyModalOpen) return;

    // Handle Tab completion or ArrowRight completion triggers
    if ((e.key === "Tab" || e.key === "ArrowRight") && input.hasAttribute('data-suggestion')) {
      e.preventDefault();
      const suggestion = input.getAttribute('data-suggestion');
      input.value = suggestion;
      updateSyntaxHighlight(suggestion);
      input.placeholder = '';
      return;
    }

    // Ctrl/Alt + Enter opens target in new background tab
    if ((e.ctrlKey || e.altKey) && !e.shiftKey && e.key === "Enter") {
      e.preventDefault(); e.stopPropagation();
      const url = resolveUrl(input.value, elements);
      if (url) openInNewTab(url, false);
      return;
    }
    
    // Ctrl/Alt + Shift + Enter opens target in new focused tab
    if ((e.ctrlKey || e.altKey) && e.shiftKey && e.key === "Enter") {
      e.preventDefault(); e.stopPropagation();
      const url = resolveUrl(input.value, elements);
      if (url) openInNewTab(url, true);
      return;
    }

    // ArrowUp: search back through commands history list
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex === -1) {
        historyPrefix   = input.value;
        filteredHistory = buildFilteredHistory(historyPrefix);
        if (!filteredHistory.length) return;
        historyIndex = 0;
      } else {
        if (historyIndex < filteredHistory.length - 1) historyIndex++;
        else return;
      }
      input.value = filteredHistory[historyIndex];
      updateSyntaxHighlight(input.value);

    // ArrowDown: search forward through commands history list
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex > 0) {
        historyIndex--;
        input.value = filteredHistory[historyIndex];
        updateSyntaxHighlight(input.value);
      } else {
        historyIndex    = -1;
        filteredHistory = [];
        input.value     = historyPrefix;
        updateSyntaxHighlight(historyPrefix);
      }

    // Enter key dispatcher
    } else if (e.key === "Enter") {
      handleEnterKey(rawValue, value, elements);
      historyIndex = -1; filteredHistory = []; historyPrefix = '';
    } else {
      if (historyIndex !== -1) { historyIndex = -1; filteredHistory = []; historyPrefix = ''; }
    }
  });
}

/**
 * Resolve what target URL the current typed query resolves to
 * @param {string} rawValue - Raw input string
 * @param {NodeList} elements - Bookmarks link elements list
 * @returns {string|null} - Resolved target URL destination
 */
function resolveUrl(rawValue, elements) {
  const value = rawValue.trim().toLowerCase();
  if (!value) return null;

  // Verify command formats
  const isCommand = value.startsWith(':') && !value.match(/^:(gemini)$/);
  if (isCommand) return null;

  // Resolve matching bookmark link if active
  const bookmarkMatch = (typeof getLastBookmarkMatch === 'function')
    ? getLastBookmarkMatch()
    : findFirstBookmarkMatch(elements, rawValue);
  if (bookmarkMatch) return bookmarkMatch.href;

  const enc = (str) => encodeURIComponent(str);
  const strip = (prefix) => rawValue.replace(new RegExp(`^${prefix}`, 'i'), '').trim();

  // Custom search overrides lookups
  if (/^yt:/i.test(value))     return `https://www.youtube.com/results?search_query=${enc(strip('yt:'))}`;
  if (/^r:/i.test(value))      return `https://google.com/search?q=site:reddit.com ${enc(strip('r:'))}`;
  if (/^ddg:/i.test(value))    return `https://duckduckgo.com/?q=${enc(strip('ddg:'))}`;
  if (/^bing:/i.test(value))   return `https://www.bing.com/search?q=${enc(strip('bing:'))}`;
  if (/^ggl:/i.test(value))    return `https://www.google.com/search?q=${enc(strip('ggl:'))}`;
  if (/^amazon:/i.test(value)) return `https://www.amazon.com/s?k=${enc(strip('amazon:'))}`;
  if (/^imdb:/i.test(value))   return `https://www.imdb.com/find?q=${enc(strip('imdb:'))}`;
  if (/^alt:/i.test(value))    return `https://alternativeto.net/browse/search/?q=${enc(strip('alt:'))}`;
  if (/^def:/i.test(value))    return `https://onelook.com/?w=${enc(strip('def:'))}`;
  if (/^the:/i.test(value))    return `https://onelook.com/thesaurus/?s=${enc(strip('the:'))}`;
  if (/^syn:/i.test(value))    return `https://onelook.com/?related=1&w=${enc(strip('syn:'))}`;
  if (/^quote:/i.test(value))  return `https://onelook.com/?mentions=1&w=${enc(strip('quote:'))}`;
  if (/^maps:/i.test(value))   return `https://www.google.com/maps/search/${enc(strip('maps:'))}`;
  if (/^cws:/i.test(value)) {
    const q = enc(strip('cws:'));
    return typeof getBrowser === 'function' && getBrowser() === 'firefox'
      ? `https://addons.mozilla.org/en-US/firefox/search/?q=${q}`
      : `https://chromewebstore.google.com/search/${q}`;
  }

  // Fallback domain lookup
  if (rawValue.split('.').length >= 2 && !rawValue.includes(' '))
    return rawValue.startsWith('http') ? rawValue : `https://${rawValue}`;

  // Default fallback search engine lookup
  const engine = typeof getStoredSearchEngine === 'function' ? getStoredSearchEngine() : 'google';
  const q = enc(rawValue.trim());
  if (engine === 'ddg')  return `https://duckduckgo.com/?q=${q}`;
  if (engine === 'bing') return `https://www.bing.com/search?q=${q}`;
  return `https://google.com/search?q=${q}`;
}

/**
 * Open target address in browser tab using dynamic anchor tags click triggers
 * @param {string} url - Target URL address
 * @param {boolean} focus - True if new tab should capture window focus
 */
function openInNewTab(url, focus) {
  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Dispatch navigation routing when Enter is pressed on input bar
 * @param {string} rawValue - Raw text query
 * @param {string} value - Normalized text query
 * @param {NodeList} elements - Bookmark link node elements
 */
function handleEnterKey(rawValue, value, elements) {
  const isSearch = value.match(/^(r|yt|alt|ddg|imdb|def|the|syn|quote|maps|cws):/);
  const isCommand = value.startsWith(':');
  const hasTrailingSpace = /\s$/.test(rawValue);

  // If command or search prefix, dispatch command router
  if (isSearch || isCommand) {
    handleSpecialCommands(rawValue.trim());
    pushHistory(rawValue.trim());
    return;
  }

  // Handle fallback space queries
  if (hasTrailingSpace && /[a-z0-9]\.[a-z]+/i.test(rawValue.trim()) && !rawValue.trim().includes(' ')) {
    const q = encodeURIComponent(rawValue.trim());
    const engine = typeof getStoredSearchEngine === 'function' ? getStoredSearchEngine() : 'google';
    if (engine === 'ddg') navigate(`https://duckduckgo.com/?q=${q}`);
    else if (engine === 'bing') navigate(`https://www.bing.com/search?q=${q}`);
    else navigate(`https://google.com/search?q=${q}`);
    pushHistory(rawValue.trim());
    return;
  }

  // Navigate matching bookmark if highlighted
  const bookmarkMatch = (typeof getLastBookmarkMatch === 'function')
    ? getLastBookmarkMatch()
    : findFirstBookmarkMatch(document.querySelectorAll("#bookmarks a"), rawValue);
  let matched = false;
  if (bookmarkMatch) {
    matched = true;
    if (typeof showLoading === 'function') showLoading();
    window.location.href = bookmarkMatch.href;
  }

  // Default fallback router
  if (!matched) {
    handleSpecialCommands(rawValue.trim());
  }
  pushHistory(rawValue.trim());
}

/**
 * Configure and register input hooks on terminal input bar
 */
function initializeTerminal() {
  const input = document.getElementById("terminal-input");
  const elements = document.querySelectorAll("#bookmarks a");

  // Load browser engine branding details
  initializeBrowserInfo();
  input.placeholder = typeof getStoredTerminalPlaceholder === 'function' ? getStoredTerminalPlaceholder() : "search anything...";

  // Hook listener handlers once
  if (!input._listenersAttached) {
    handleInput(input, elements);
    handleKeyboardEvents(input, elements);
    input._listenersAttached = true;
  }

  // Clear selection classes and focus target
  resetStyles(elements);
  input.focus();
}