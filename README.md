# termpage

Created by **Abhidatta Benda**

> A minimalist, keyboard-first browser start page and new tab extension.

---

<!-- Demo Video -->
<!-- <video src="https://user-images.githubusercontent.com/your-video-link.mp4" width="100%" autoplay loop muted controls></video> -->

---

## ⚡ Features

- **Keyboard-First Terminal**: Type queries directly to search or launch links. Features live syntax highlighting, tab autocompletion, and command history (`↑` / `↓`).
- **Dynamic Shelf Layer**: Keeps your grid clean. Upfront links show by default, while hidden "Shelf" links automatically surface when they match your search.
- **3-Tier Visual Search**:
  - **1st Match**: 100% brightness & bold text (`Enter` to launch).
  - **Secondary Matches**: 85% brightness (crisp and legible).
  - **Non-Matches**: 15% brightness with line-through.
- **21 Developer Themes**: Built-in presets including Catppuccin (4 variants), Gruvbox, Nord, Dracula, Tokyo Night, Kanagawa, Everforest, Rosé Pine, and retro classics (`:mocha`, `:nord`, `:dracula`, etc.).
- **Custom Styling**: Toggle a frame border with custom radius, set custom background/text hex colors, and enable retro block caret cursors (`caret-shape: block`).
- **100% Private**: Runs entirely in your browser using local storage. Zero analytics, zero trackers.

---

## 📦 Installation

Pre-built extension packages are available in the **`Releases/`** folder:
- **`chrome.zip`** (Chrome, Brave, Edge, Vivaldi)
- **`firefox.zip`** (Firefox)
- **`opera.zip`** (Opera)

### Chromium (Chrome / Brave / Edge)
1. Download `Releases/chrome.zip` and extract it (or load unpacked directly from this repo folder).
2. Go to `chrome://extensions` and enable **Developer mode**.
3. Click **Load unpacked** and select the folder.

### Firefox
1. Download `Releases/firefox.zip` (or run `node build.js firefox`).
2. Go to `about:debugging` → **This Firefox** → **Load Temporary Add-on...** and select `manifest.json`.
3. *(Optional)* In `about:config`, set `browser.newtabpage.activity-stream.improvesearch.handoffToAwesomebar` to `false` to keep new tab focus inside the terminal.

---

## ⌨️ Command Cheatsheet

| Command | Action |
| :--- | :--- |
| `:help` | Show commands list |
| `:config` | Identity, timezone, & weather settings |
| `:customize` / `:custom` | Themes, colors, & font settings |
| `:bookmarks` / `:bm` | Edit Upfront & Shelf link grids |
| `:tags` | Custom search shortcuts & URL overrides |
| `:history` | Browse command history |
| `:export` / `:import` | Backup & restore settings (JSON) |
| `:reset` | Reset all settings to default |

### Search Prefixes
- `yt:` YouTube
- `r:` Reddit
- `maps:` Google Maps
- `ddg:` DuckDuckGo
- `ggl:` Google
- `bing:` Bing
- `amazon:` Amazon
- `imdb:` IMDb
- `alt:` AlternativeTo
- `def:` Dictionary (OneLook)

---

## 💖 Contributing

Contributions, feature suggestions, and pull requests are always welcome!