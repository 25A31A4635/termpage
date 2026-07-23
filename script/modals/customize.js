// ========================================
// Customize Modal — Syntax Colors + Theme Switcher
// ========================================

const SYNTAX_COLOR_DEFS = [
  { key: 'cmd',     label: ':commands',       example: ':config'   },
  { key: 'theme',   label: ':theme commands', example: ':dark'     },
  { key: 'search',  label: 'search prefixes', example: 'yt:query'  },
  { key: 'version', label: ':version',        example: ':version'  },
  { key: 'url',     label: 'direct URLs',     example: 'chess.com' },
  { key: 'unknown', label: 'unknown command', example: ':???'      },
];

const THEME_DEFS = [
  { value: 'light',                label: 'Light'            },
  { value: 'dark',                 label: 'Dark'             },
  { value: 'black',                label: 'Black'            },
  { value: 'nord',                 label: 'Nord'             },
  { value: 'newspaper',            label: 'Newspaper'        },
  { value: 'coffee',               label: 'Coffee'           },
  { value: 'root',                 label: 'Root'             },
  { value: 'neon',                 label: 'Neon'             },
  { value: 'catppuccin-latte',     label: 'Latte'            },
  { value: 'catppuccin-frappe',    label: 'Frappé'           },
  { value: 'catppuccin-macchiato', label: 'Macchiato'        },
  { value: 'catppuccin-mocha',     label: 'Mocha'            },
  { value: 'gruvbox-light',        label: 'Gruvbox Light'    },
  { value: 'gruvbox-dark',         label: 'Gruvbox Dark'     },
  { value: 'dracula',              label: 'Dracula'          },
  { value: 'kanagawa',             label: 'Kanagawa'         },
  { value: 'everforest-light',     label: 'Everforest Light' },
  { value: 'everforest-dark',      label: 'Everforest Dark'  },
  { value: 'rose-pine',            label: 'Rosé Pine'        },
  { value: 'rose-pine-moon',       label: 'Rosé Pine Moon'   },
  { value: 'tokyo-night',          label: 'Tokyo Night'      },
];

// ---- Open / Close ----
function openCustomizeModal() {
  _renderCustomizeModal();
  document.getElementById('customize-modal').classList.add('active');
  const first = document.querySelector('#customize-modal .customize-hex');
  if (first) first.focus();
}

function closeCustomizeModal() {
  document.getElementById('customize-modal').classList.remove('active');
}

// ---- Render ----
function _renderCustomizeModal() {
  const colors = getStoredSyntaxColors();
  const currentTheme = getStoredTheme();

  // ---- Fonts Setup ----
  const baseSelect = document.getElementById('customize-base-font');
  const baseCustom = document.getElementById('customize-base-font-custom');
  const monoSelect = document.getElementById('customize-mono-font');
  const monoCustom = document.getElementById('customize-mono-font-custom');

  if (baseSelect && baseCustom && monoSelect && monoCustom) {
    const savedBase = getStoredBaseFont();
    const savedBaseCustom = getStoredBaseFontCustom();
    const savedMono = getStoredMonoFont();
    const savedMonoCustom = getStoredMonoFontCustom();

    baseSelect.value = savedBase;
    baseCustom.value = savedBaseCustom;
    if (savedBase === 'custom') {
      baseCustom.classList.remove('hidden');
    } else {
      baseCustom.classList.add('hidden');
    }

    monoSelect.value = savedMono;
    monoCustom.value = savedMonoCustom;
    if (savedMono === 'custom') {
      monoCustom.classList.remove('hidden');
    } else {
      monoCustom.classList.add('hidden');
    }

    if (!baseSelect._listenerAttached) {
      baseSelect.addEventListener('change', () => {
        if (baseSelect.value === 'custom') {
          baseCustom.classList.remove('hidden');
          baseCustom.focus();
        } else {
          baseCustom.classList.add('hidden');
        }
      });
      baseSelect._listenerAttached = true;
    }

    if (!monoSelect._listenerAttached) {
      monoSelect.addEventListener('change', () => {
        if (monoSelect.value === 'custom') {
          monoCustom.classList.remove('hidden');
          monoCustom.focus();
        } else {
          monoCustom.classList.add('hidden');
        }
      });
      monoSelect._listenerAttached = true;
    }
  }

  // ---- Layout Options Setup ----
  const hideInfoCheck = document.getElementById('customize-hide-info');
  const blockCursorCheck = document.getElementById('customize-block-cursor');
  if (hideInfoCheck) hideInfoCheck.checked = getStoredHideInfo();
  if (blockCursorCheck) blockCursorCheck.checked = getStoredBlockCursor();

  const frameEnabledCheck = document.getElementById('customize-frame-enabled');
  const frameRadiusInput = document.getElementById('customize-frame-radius');
  const frameRadiusVal = document.getElementById('customize-frame-radius-value');

  if (frameEnabledCheck && frameRadiusInput && frameRadiusVal) {
    const isEnabled = getStoredFrameEnabled();
    const radius = getStoredFrameRadius();

    frameEnabledCheck.checked = isEnabled;
    frameRadiusInput.value = radius;
    frameRadiusVal.textContent = `${radius}px`;

    if (!frameRadiusInput._listenerAttached) {
      frameRadiusInput.addEventListener('input', () => {
        frameRadiusVal.textContent = `${frameRadiusInput.value}px`;
      });
      frameRadiusInput._listenerAttached = true;
    }
  }


  // ---- Custom Colors Setup ----
  _setupCustomColorControl('customize-frame-color', 'customize-frame-color-hex', getStoredFrameColor);
  _setupCustomColorControl('customize-theme-bg', 'customize-theme-bg-hex', getStoredThemeBgColor);
  _setupCustomColorControl('customize-theme-text', 'customize-theme-text-hex', getStoredThemeTextColor);

  // ---- Syntax color rows ----
  const grid = document.getElementById('customize-color-grid');
  grid.replaceChildren();

  SYNTAX_COLOR_DEFS.forEach(({ key, label, example }) => {
    const color = colors[key] || DEFAULT_SYNTAX_COLORS[key];

    const row = document.createElement('div');
    row.className = 'customize-row';
    row.dataset.key = key;

    const labelSpan = document.createElement('span');
    labelSpan.className = 'customize-label';
    labelSpan.textContent = label;

    const preview = document.createElement('span');
    preview.className = 'customize-preview';
    preview.style.color = color;
    preview.textContent = example;

    const wrapDiv = document.createElement('div');
    wrapDiv.className = 'customize-color-wrap';

    const swatch = document.createElement('input');
    swatch.type = 'color';
    swatch.className = 'customize-swatch';
    swatch.value = color;
    swatch.dataset.key = key;
    swatch.title = 'Pick color';

    const hex = document.createElement('input');
    hex.type = 'text';
    hex.className = 'customize-hex';
    hex.value = color.toUpperCase();
    hex.dataset.key = key;
    hex.maxLength = 7;
    hex.spellCheck = false;

    wrapDiv.appendChild(swatch);
    wrapDiv.appendChild(hex);

    const resetBtn = document.createElement('button');
    resetBtn.className = 'customize-reset-btn';
    resetBtn.dataset.key = key;
    resetBtn.title = 'Reset';
    resetBtn.textContent = '↺';

    row.appendChild(labelSpan);
    row.appendChild(preview);
    row.appendChild(wrapDiv);
    row.appendChild(resetBtn);

    swatch.addEventListener('input', () => {
      const v = swatch.value;
      hex.value = v.toUpperCase();
      preview.style.color = v;
      _applyLiveColor(key, v);
    });

    hex.addEventListener('input', () => {
      const v = hex.value.trim();
      if (/^#[0-9a-f]{6}$/i.test(v)) {
        swatch.value = v;
        preview.style.color = v;
        _applyLiveColor(key, v);
      }
    });

    hex.addEventListener('blur', () => {
      let v = hex.value.trim();
      if (!v.startsWith('#')) v = '#' + v;
      if (/^#[0-9a-f]{6}$/i.test(v)) {
        hex.value = v.toUpperCase();
        swatch.value = v;
        preview.style.color = v;
        _applyLiveColor(key, v);
      } else {
        const stored = getStoredSyntaxColors();
        hex.value = (stored[key] || DEFAULT_SYNTAX_COLORS[key]).toUpperCase();
        swatch.value = stored[key] || DEFAULT_SYNTAX_COLORS[key];
        preview.style.color = stored[key] || DEFAULT_SYNTAX_COLORS[key];
      }
    });

    row.querySelector('.customize-reset-btn').addEventListener('click', () => {
      const def = DEFAULT_SYNTAX_COLORS[key];
      swatch.value = def;
      hex.value = def.toUpperCase();
      preview.style.color = def;
      _applyLiveColor(key, def);
    });

    grid.appendChild(row);
  });

  // ---- Theme buttons ----
  const themeGrid = document.getElementById('customize-theme-grid');
  themeGrid.replaceChildren();

  THEME_DEFS.forEach(({ value, label }) => {
    const btn = document.createElement('button');
    btn.className = 'customize-theme-btn' + (value === currentTheme ? ' active-theme' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      _applyTheme(value);
      themeGrid.querySelectorAll('.customize-theme-btn').forEach(b => b.classList.remove('active-theme'));
      btn.classList.add('active-theme');
    });
    themeGrid.appendChild(btn);
  });
}

function _applyLiveColor(key, value) {
  document.documentElement.style.setProperty(`--syn-${key}`, value);
}

function _applyTheme(theme) {
  THEMES.forEach(t => {
    document.body.classList.remove(`${t}-mode`);
    document.documentElement.classList.remove(`${t}-mode`);
  });
  if (theme !== 'light') {
    document.documentElement.classList.add(`${theme}-mode`);
  }
  saveTheme(theme);
}

// ---- Save ----
function saveCustomize() {
  const colors = { ...getStoredSyntaxColors() };

  document.querySelectorAll('#customize-color-grid .customize-row').forEach(row => {
    const key = row.dataset.key;
    const hex = row.querySelector('.customize-hex').value.trim();
    if (/^#[0-9a-f]{6}$/i.test(hex)) {
      colors[key] = hex.toLowerCase();
    }
  });

  saveSyntaxColors(colors);
  applySyntaxColors(colors);

  const baseSelect = document.getElementById('customize-base-font');
  const baseCustom = document.getElementById('customize-base-font-custom');
  const monoSelect = document.getElementById('customize-mono-font');
  const monoCustom = document.getElementById('customize-mono-font-custom');

  if (baseSelect && baseCustom && monoSelect && monoCustom) {
    saveBaseFont(baseSelect.value);
    saveBaseFontCustom(baseCustom.value.trim());
    saveMonoFont(monoSelect.value);
    saveMonoFontCustom(monoCustom.value.trim());
    
    if (typeof applyCustomFonts === 'function') {
      applyCustomFonts();
    }
  }

  const hideInfoCheck = document.getElementById('customize-hide-info');
  const blockCursorCheck = document.getElementById('customize-block-cursor');
  const frameEnabledCheck = document.getElementById('customize-frame-enabled');
  const frameRadiusInput = document.getElementById('customize-frame-radius');

  if (hideInfoCheck) saveHideInfo(hideInfoCheck.checked);
  if (blockCursorCheck) saveBlockCursor(blockCursorCheck.checked);
  if (frameEnabledCheck) saveFrameEnabled(frameEnabledCheck.checked);
  if (frameRadiusInput) saveFrameRadius(parseInt(frameRadiusInput.value, 10));


  const frameColorHex = document.getElementById('customize-frame-color-hex');
  const themeBgHex = document.getElementById('customize-theme-bg-hex');
  const themeTextHex = document.getElementById('customize-theme-text-hex');

  if (frameColorHex) {
    let val = frameColorHex.value.trim();
    if (val !== '' && !val.startsWith('#')) val = '#' + val;
    saveFrameColor(/^#[0-9a-f]{6}$/i.test(val) ? val.toLowerCase() : '');
  }
  if (themeBgHex) {
    let val = themeBgHex.value.trim();
    if (val !== '' && !val.startsWith('#')) val = '#' + val;
    saveThemeBgColor(/^#[0-9a-f]{6}$/i.test(val) ? val.toLowerCase() : '');
  }
  if (themeTextHex) {
    let val = themeTextHex.value.trim();
    if (val !== '' && !val.startsWith('#')) val = '#' + val;
    saveThemeTextColor(/^#[0-9a-f]{6}$/i.test(val) ? val.toLowerCase() : '');
  }

  if (typeof applyCustomLayouts === 'function') applyCustomLayouts();

  closeCustomizeModal();
  showToast('Customization saved', 'success');
}

// ---- Reset all syntax colors ----
async function resetAllSyntaxColors() {
  const confirmed = await showConfirm('Reset all syntax colors to defaults?', {
    title: 'Reset Colors',
    confirmLabel: 'Reset',
    cancelLabel: 'Cancel'
  });
  if (!confirmed) return;
  saveSyntaxColors({ ...DEFAULT_SYNTAX_COLORS });
  applySyntaxColors(DEFAULT_SYNTAX_COLORS);
  _renderCustomizeModal();
  showToast('Colors reset to defaults', 'info');
}

function _setupCustomColorControl(swatchId, hexId, getterFn) {
  const swatch = document.getElementById(swatchId);
  const hex = document.getElementById(hexId);
  if (!swatch || !hex) return;

  const savedColor = getterFn();
  hex.value = savedColor;
  if (savedColor && /^#[0-9a-f]{6}$/i.test(savedColor)) {
    swatch.value = savedColor;
  } else {
    if (swatchId === 'customize-theme-bg') {
      swatch.value = '#1e1e2e';
    } else if (swatchId === 'customize-theme-text') {
      swatch.value = '#cdd6f4';
    } else {
      swatch.value = '#cdd6f4';
    }
  }

  if (!swatch._listenerAttached) {
    swatch.addEventListener('input', () => {
      hex.value = swatch.value.toUpperCase();
    });
    swatch._listenerAttached = true;
  }

  if (!hex._listenerAttached) {
    hex.addEventListener('input', () => {
      let val = hex.value.trim();
      if (val === '') {
        return;
      }
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9a-f]{6}$/i.test(val)) {
        swatch.value = val;
      }
    });
    hex._listenerAttached = true;
  }
}