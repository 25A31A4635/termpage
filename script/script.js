// ============================================================================
// Main Application Entry Point & Global Lifecycles
// ============================================================================

/**
 * Loads the active theme configuration from storage and applies it as CSS classes
 * on both document.body and document.documentElement.
 */
function loadTheme() {
  // Retrieve the stored theme name (defaults to 'dark' if none set)
  const theme = getStoredTheme();
  
  // Strip all existing theme mode classes from body and document elements
  THEMES.forEach(t => {
    document.body.classList.remove(`${t}-mode`);
    document.documentElement.classList.remove(`${t}-mode`);
  });
  
  // If theme is light, we don't append classes as light is the standard stylesheet fallback.
  // Otherwise, we apply the active theme class wrapper.
  if (theme !== 'light') {
    document.body.classList.add(`${theme}-mode`);
    document.documentElement.classList.add(`${theme}-mode`);
  }
}

// Default placeholder strings displayed in setup input fields
const CONFIG_PLACEHOLDERS = {
  'config-username': 'e.g., quanglius',
  'weather-location': 'e.g., London, Tokyo, New York',
  'time-zone': 'e.g., America/New_York, Europe/London, Asia/Tokyo',
};

/**
 * Populate standard config text input placeholders
 */
function initPlaceholders() {
  // Loop through entry definitions and map them to DOM input elements
  for (const [id, text] of Object.entries(CONFIG_PLACEHOLDERS)) {
    const el = document.getElementById(id);
    if (el) el.placeholder = text;
  }
}

// Time update tick interval (check/redraw clock every 60 seconds)
const TIME_UPDATE_INTERVAL = 60 * 1000;
// Weather lookup refresh interval (poll Open-Meteo API every 30 minutes)
const WEATHER_UPDATE_INTERVAL = 30 * 60 * 1000;

// Firefox / Opera: aggressively reclaim focus from the browser omnibox.
// These browsers give omnibox focus on newtab overrides by default.
// Strategy: poll focus state for a short period, and hook keys to pull focus back.
(function nonChromeFocusGrab() {
  /**
   * Focus terminal input unless a config modal is currently active
   */
  function grab() {
    const input = document.getElementById('terminal-input');
    if (!input) return false;
    // Do not steal focus if user is actively configuring settings inside a modal
    if (document.querySelector('.config-modal.active')) return true; 
    // Already focused, nothing to do
    if (document.activeElement === input) return true;
    // Set focus prevent scroll jump
    input.focus({ preventScroll: true });
    return document.activeElement === input;
  }

  // Poll focus yanks for up to 3 seconds after load. Firefox/Opera allow JS focus()
  // once the document becomes interactive, just not instantly on DOM load.
  let attempts = 0;
  const poll = setInterval(() => {
    // Stop polling once focus succeeds or we exceed 30 attempts
    if (grab() || ++attempts > 30) clearInterval(poll);
  }, 100);

  // Firefox-specific: the browser omnibox steals focus AFTER our initial poll wins.
  // Watch for focus leaving the page and yank it back to our terminal.
  document.addEventListener('focusin', (e) => {
    const input = document.getElementById('terminal-input');
    if (!input) return;
    if (document.querySelector('.config-modal.active')) return;
    if (e.target === input) return;
    // Reclaim focus only if it went to the root document elements (meaning focus left the page content)
    if (e.target === document.body || e.target === document.documentElement) {
      input.focus({ preventScroll: true });
    }
  }, { capture: true });

  // Also reclaim focus when the tab becomes active/visible again
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      setTimeout(() => grab(), 50);
    }
  });

  // Reclaim focus when clicking anywhere outside of an active overlay modal
  document.addEventListener('click', (e) => {
    if (!document.querySelector('.config-modal.active')) grab();
  }, { capture: true });

  // Reclaim focus on keyboard presses so that direct typing lands in the input bar
  document.addEventListener('keydown', (e) => {
    const input = document.getElementById('terminal-input');
    if (!input) return;
    if (document.activeElement === input) return;
    if (document.querySelector('.config-modal.active')) return;
    // Focus if key produces a character or is backspace
    if (e.key.length === 1 || e.key === 'Backspace') {
      input.focus({ preventScroll: true });
    }
  }, { capture: true });
})();

// Hide loading overlay transition on back navigation (browser bfcache restore support)
window.addEventListener('pageshow', (e) => {
  const el = document.getElementById('loading-overlay');
  if (!el) return;
  el.classList.remove('visible');
  el.classList.add('hiding');
  setTimeout(() => el.classList.remove('hiding'), 300);
});

// Primary lifecycle hook triggered when document is ready
document.addEventListener("DOMContentLoaded", async () => {
  // Set default settings input placeholders
  initPlaceholders();
  // Restore user selected theme class
  loadTheme();
  // Restore syntax highlight colors
  applySyntaxColors(getStoredSyntaxColors());
  // Apply custom fonts if declared
  if (typeof applyCustomFonts === 'function') applyCustomFonts();
  // Apply custom layout class overrides
  if (typeof applyCustomLayouts === 'function') applyCustomLayouts();
  // Render quicklinks upfront bookmark grid
  try { generateBookmarks(); } catch (e) { console.error('Bookmarks init error:', e); }
  // Setup auto-suggestions and command keybindings on terminal input
  initializeTerminal();
  // Perform first clock draw tick
  updateTime();
  // Perform initial weather fetch
  try { updateWeather(); } catch (e) { console.error('Weather init error:', e); }

  // Set recurring ticks for clock and weather updates
  setInterval(updateTime, TIME_UPDATE_INTERVAL);
  setInterval(updateWeather, WEATHER_UPDATE_INTERVAL);

  // Hook clicks outside active modal contents to close them naturally
  [
    ['config-modal', closeConfig],
    ['help-modal', closeHelp],
    ['customize-modal', closeCustomizeModal],
    ['tags-modal',      closeTagsModal],
    ['history-modal',   closeHistoryModal],
  ].forEach(([id, fn]) => {
    if (typeof fn === 'function') {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', (e) => {
          if (e.target.id === id) fn();
        });
      }
    }
  });
});

// Global keyboard events listener: Escape to close modals, refocus terminal input
document.addEventListener('keydown', (e) => {
  // Ignore trigger if modifier keys (Ctrl, Alt, Meta) are held down
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  // Check if an active configuration modal overlay exists on screen
  const activeModal = document.querySelector('.config-modal.active') || document.getElementById('sp-modal-overlay');

  // Handle Escape keypress to close any open panels/modals
  if (e.key === 'Escape') {
    if (typeof closeConfig === 'function') closeConfig();
    if (typeof closeHelp === 'function') closeHelp();
    if (typeof closeBookmarksModal === 'function') closeBookmarksModal();
    if (typeof closeCustomizeModal === 'function') closeCustomizeModal();
    if (typeof closeTagsModal === 'function') closeTagsModal();
    if (typeof closeHistoryModal === 'function') closeHistoryModal();
    return;
  }

  // Keyboard accessibility focus-trap inside modals (toggles selection among modal focusable inputs on Tab)
  if (activeModal && e.key === 'Tab') {
    const focusableElements = activeModal.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements.length > 0) {
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) { // Shift + Tab back-tab cycle
        if (document.activeElement === first || document.activeElement === activeModal || document.activeElement === document.body) {
          last.focus();
          e.preventDefault();
        }
      } else { // Standard Tab forward cycle
        if (document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      }
    }
    return;
  }

  // Refocus the terminal input if typing occurs outside of modals and active input boxes
  if (!activeModal && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
    // Only attempt focus if keypress is an alphanumeric character or backspace
    if (e.key.length === 1 || e.key === 'Backspace') {
      const terminalInput = document.getElementById('terminal-input');
      if (terminalInput) terminalInput.focus();
    }
  }
});