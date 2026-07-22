// ============================================================================
// Shared Utilities & Constants
// ============================================================================

// Symbol used to tag terminal commands that are executed entirely in the local client
// rather than being redirected to a web search engine or external URL.
const HANDLED_INTERNALLY = Symbol('handled');

// Complete catalog of registered themes supported by the page layout stylesheet.
// Used to cleanly toggle classes on document body/html on theme switches.
const THEMES = [
    'light', 'dark', 'black', 'nord', 'newspaper', 'coffee', 'root', 'neon',
    'catppuccin-latte', 'catppuccin-frappe', 'catppuccin-macchiato', 'catppuccin-mocha',
    'gruvbox-light', 'gruvbox-dark', 'dracula', 'kanagawa', 'everforest-light', 'everforest-dark',
    'rose-pine', 'rose-pine-moon', 'tokyo-night'
];

/**
 * Remove bookmark matching styles and active search highlights from elements
 * @param {NodeList|Array} elements - Quicklink elements to restore to default style
 */
function resetStyles(elements) {
    // Loop through each anchor element
    elements.forEach(el => {
        // Strip the visual match classes (fading out non-matches, highlighting matches)
        el.classList.remove("bookmark-match", "bookmark-nomatch", "primary-match");
        // Reset custom blend styles
        el.style.mixBlendMode = "";
    });
}

/**
 * Debounce utility to prevent highly frequent operations (e.g. keypress triggers)
 * @param {Function} func - Function to execute after the wait duration
 * @param {number} wait - Wait duration in milliseconds
 * @returns {Function} - Wrapped debounced function
 */
function debounce(func, wait) {
    // Reference pointer for the running timeout timer
    let timeout;
    
    // Return a closure that handles the delay logic
    return function executedFunction(...args) {
        // Callback function triggered when delay duration is reached
        const later = () => {
            // Cancel active timeout reference
            clearTimeout(timeout);
            // Execute the inner target function
            func(...args);
        };
        // Reset any existing timeout
        clearTimeout(timeout);
        // Set a new timer to wait before executing
        timeout = setTimeout(later, wait);
    };
}
