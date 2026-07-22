# ⌨️ Terminal Start Page

Created by **Abhidatta Benda**

A keyboard-first, ultra-minimalist browser start page and new tab extension. Designed for developer workflows, terminal aesthetic enthusiasts, and anyone who wants to navigate their bookmarks and search the web with raw speed.

---

## 💡 Why This Exists

Most new tab pages are cluttered, slow, or constantly trying to sell you something. This start page does exactly one thing: gets you where you want to go as fast as humanly possible. 

No loading screens, no heavy framework boilerplate, and no telemetry. Just a clean, command-line interface that loads instantly and keeps your hands on the home row.

---

## 🎯 Highlights

- **Instant Terminal Interface**: Just start typing to search the web or launch a link. Includes tab autocompletion, commands history, and color highlighting as you type.
- **Double-Layered Bookmark Grid**: Keep your screen clean. Surfaces secondary "Shelf" bookmarks only when they match your query, sliding seamlessly into place.
- **21 Pixel-Perfect Themes**: Features popular developer color schemes (Catppuccin, Gruvbox, Nord, Dracula, Tokyo Night, Kanagawa, Everforest, Rosé Pine, and more).
- **Custom CSS Overrides**: Directly override borders, backgrounds, and text colors inside the customize panel to make it uniquely yours.
- **Classic Block Caret**: Standard retro terminal block cursor (`caret-shape: block`) for that authentic terminal emulation feel.
- **100% Client-Side & Private**: All config, shortcuts, and custom configurations are stored locally in your browser storage. No login, no trackers, and no external calls.

---

## 🚀 Getting Started

### Load it as a Local Page

To load it locally, you just need a simple static file server:

#### Option 1: Python (Quick & Easy)
```bash
python -m http.server 6174
```

#### Option 2: Caddy
An example `Caddyfile.example` is included. Copy it to `Caddyfile`, replace your workspace path, and run:
```bash
caddy run --config Caddyfile
```

Now open `http://localhost:6174` in your browser.

---

## 📦 Installing as a Browser Extension

Loading it as an override extension ensures it opens instantly on every new tab.

### 🤖 Chromium Browsers (Chrome, Brave, Edge)
1. Run the build script to set manifest configurations for Chrome:
   ```bash
   node build.js chrome
   ```
2. Open `chrome://extensions` (or `brave://extensions`, `edge://extensions`).
3. Toggle **Developer mode** (top-right switcher).
4. Click **Load unpacked** (top-left button) and select this repository folder.

### 🦊 Firefox
1. Run the build script to target Firefox:
   ```bash
   node build.js firefox
   ```
2. Open `about:debugging` inside Firefox.
3. Click **This Firefox** → click **Load Temporary Add-on...** and select `manifest.json` inside this repository folder.
4. **Tip for Firefox users**: Firefox steals focus from JS pages on new tabs to the URL search bar. To fix this, go to `about:config` and set `browser.newtabpage.activity-stream.improvesearch.handoffToAwesomebar` to `false`.

### 🔴 Opera
1. Run the build script to set configurations for Opera:
   ```bash
   node build.js opera
   ```
2. Load manually using Opera's unpacked extensions manager. (Note: Opera requires a background service worker to capture new tabs, which is automatically configured by our build script).

---

## 🗂️ Shelf Bookmarks: The Dynamic Grid

Standard link grids clutter up quickly. To solve this, this page uses a **Shelf layer**:

- **Upfront Grid**: The 20 bookmarks that appear immediately when the search bar is empty.
- **The Shelf**: Hidden bookmarks that do not display on load. 
- **The Swap**: As you type, upfront bookmarks that don't match your query fade away, and matching Shelf bookmarks slide into their empty grid positions automatically.

**Example**: 
You have `YouTube` upfront and `CyberChef` on your shelf. 
Type `c` → YouTube fades out, and `CyberChef` instantly slides into its position. 
Delete your text → grid resets to your default upfront view.

Manage both sets visually by running `:bookmarks` and clicking the **Upfront** or **Shelf** tabs.

---

## 🎨 3-Tier Visual Search Hierarchy

When you type a query in the terminal input, matching bookmarks are dynamically highlighted in a clean, high-contrast visual hierarchy:

- 🌟 **Top Preferred Match (100% Brightness & Bold)**: The top-ranked result that will launch immediately when you hit `Enter`.
- 🔆 **Secondary Matches (85% Brightness)**: Crisp, bright, and legible, making it effortless to scan secondary options while keeping primary focus on the top result.
- 🌫️ **Non-Matching Items (15% Brightness & Line-Through)**: Dimmed smoothly into the background.

---

## ⌨️ Command Reference

| Command | Description |
| :--- | :--- |
| `:help` | Show all command lists and descriptions |
| `:config` | Open general configuration modal (identity, timezone, weather) |
| `:customize` / `:custom` | Open color customization modal (themes, custom overrides, syntax highlights) |
| `:bookmarks` / `:bm` | Edit links grid (Upfront and Shelf layouts tabs) |
| `:tags` | Map search shortcuts and override URLs (e.g. override `amazon:` destination) |
| `:history` | Open search and commands history manager |
| `:tour` | Replay the onboarding helper tour |
| `:version` / `:ver` | Display current application version details |
| `:update` | Query GitHub to check if a newer release version exists |
| `:export` | Save all local configurations, custom tags, and bookmarks to a JSON backup file |
| `:import` | Restore configurations from a JSON backup file |
| `:reset` | Clear all configurations, storage keys, and cache (requires confirmation) |

### 🎨 Theme Toggles

Type any of the following commands directly to change themes:
- `:light` / `:dark` / `:amoled` / `:black`
- `:nord` / `:newspaper` / `:coffee` / `:root` (Hacker) / `:neon` (Cyberpunk)
- Catppuccin variants: `:latte` / `:frappe` / `:macchiato` / `:mocha`
- Gruvbox: `:gruvbox` / `:gruvbox-dark` / `:gruvbox-light`
- Dracula: `:dracula`
- Kanagawa: `:kanagawa`
- Everforest: `:everforest` / `:everforest-dark` / `:everforest-light`
- Rosé Pine: `:rose-pine` / `:rose-pine-moon`
- Tokyo Night: `:tokyo-night`

---

## 🔍 Built-in Search Prefixes

Type these prefixes followed by a query to search specific web engines:

| Prefix | Destination |
| :--- | :--- |
| `yt:` | YouTube Search |
| `r:` | Reddit Search |
| `maps:` | Google Maps |
| `ddg:` | DuckDuckGo Search |
| `ggl:` | Google Search (explicit) |
| `bing:` | Bing Search |
| `amazon:` | Amazon Shopping Search |
| `imdb:` | IMDb Movie Search |
| `alt:` | AlternativeTo Software Search |
| `def:` | Word Definitions lookup (via OneLook) |
| `the:` | Thesaurus lookup (via OneLook) |
| `syn:` | Synonyms lookup (via OneLook) |
| `quote:` | Literary Quotes lookup (via OneLook) |
| `cws:` | Extension Store lookup (Firefox/Chrome Web Store based on browser) |

---

## ⚙️ Customization & Shortcuts

### Visual Color Overrides
Inside `:customize`, click the hex swatches or type hex values to set custom colors for:
1. **Border Color**: Outer frame frame border color override.
2. **Background Color**: Layout background color override. Modals and text fields adapt automatically to match.
3. **Text Color**: Global font color override.

### Block Cursor & Frame Border
Inside `:customize`, you can toggle a structural frame border (`.terminal-frame`) to wrap your links grid and terminal input, change its border radius dynamically via a slider, and switch on the retro solid block text cursor.

### Font Customization
Load presets like `Inter`, `Fira Code`, `Source Code Pro` or type any system font stack (e.g. `Segoe UI`, `SF Pro Text`) to customize base and monospace fonts.

### Custom Search Tags
Run `:tags` to create new search overrides (e.g. map `gh:` to search GitHub repositories) or redefine standard presets.

---

## 🔒 Offline-First & Private

Everything is sandboxed inside your local environment.
- No analytics.
- No remote telemetry reporting.
- Extension settings (like custom color selections and configuration preferences) are stored in the browser's native local storage framework.
- External connections are only made by your browser to fetch current weather details from **Open-Meteo** (no api keys needed) and word lookups from **OneLook**.

---

## 💖 Contributing & Feedback

This is an open-source hobby project. If you find a bug, have an idea for an override style, or want to suggest improvements, feel free to open an issue or submit a pull request!