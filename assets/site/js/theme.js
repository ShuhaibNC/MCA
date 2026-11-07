/* MCA Notes Hub theme picker — same themes + storage key as the main
 * VitePress site (shuhaib-site-prefs-v1), so a choice made on either
 * site follows the visitor to the other. "default" = the VitePress
 * default look (light, or dark when the OS prefers dark). The early
 * script in <head> applies the saved theme before first paint; this
 * file wires the picker panel. */
(function () {
  var PREFS_KEY = 'shuhaib-site-prefs-v1';
  var THEMES = [
    { id: 'default', name: 'Default', desc: 'The current look', bg: '#ffffff', accent: '#3451b2', isDefault: true },
    { id: 'amoled', name: 'AMOLED', desc: 'Pure black, high contrast', bg: '#000000', accent: '#64b5f6' },
    { id: 'midnight', name: 'Midnight', desc: 'Deep navy dark', bg: '#0a1128', accent: '#7cb3ff' },
    { id: 'forest', name: 'Forest', desc: 'Deep green dark', bg: '#0a1a12', accent: '#4ade80' },
    { id: 'mocha', name: 'Catppuccin Mocha', desc: 'Warm dark, mauve accent', bg: '#1e1e2e', accent: '#cba6f7' },
    { id: 'paper', name: 'Paper', desc: 'Warm light, amber accent', bg: '#faf7f0', accent: '#b45309' }
  ];
  var ACCENTS = [
    { name: 'Theme default', value: '' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Sky', value: '#0284c7' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Red', value: '#ef4444' }
  ];
  var DEFAULTS = { theme: 'default', accent: '', fontSize: 'default', density: 'comfortable', radius: 'default' };

  function mix(hex, target, amount) {
    var n = parseInt(hex.slice(1), 16);
    var rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    return 'rgb(' + rgb.map(function (v, i) { return Math.round(v + (target[i] - v) * amount); }).join(', ') + ')';
  }
  function loadPrefs() {
    try {
      var raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return { ...DEFAULTS };
      var p = JSON.parse(raw);
      return {
        theme: THEMES.some(function (t) { return t.id === p.theme; }) ? p.theme : 'default',
        accent: typeof p.accent === 'string' ? p.accent : '',
        fontSize: p.fontSize === 'small' || p.fontSize === 'large' ? p.fontSize : 'default',
        density: p.density === 'compact' ? 'compact' : 'comfortable',
        radius: p.radius === 'sharp' || p.radius === 'rounded' ? p.radius : 'default'
      };
    } catch (e) { return { ...DEFAULTS }; }
  }
  function applyPrefs(p) {
    var root = document.documentElement;
    root.dataset.siteTheme = p.theme;
    root.dataset.fontSize = p.fontSize;
    root.dataset.density = p.density;
    root.dataset.radius = p.radius;
    var style = root.style;
    if (p.accent) {
      style.setProperty('--blue', p.accent);
      style.setProperty('--blue-d', mix(p.accent, [0, 0, 0], 0.18));
      style.setProperty('--blue-soft', mix(p.accent, [255, 255, 255], 0.86));
    } else {
      style.removeProperty('--blue');
      style.removeProperty('--blue-d');
      style.removeProperty('--blue-soft');
    }
  }
  function savePrefs(p) {
    try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch (e) {}
    applyPrefs(p);
  }

  var prefs = loadPrefs();
  applyPrefs(prefs);

  var btn = document.getElementById('themePickerBtn');
  var panel = document.getElementById('themePanel');
  if (!btn || !panel) return;

  function render() {
    var grid = document.getElementById('themeGrid');
    grid.innerHTML = '';
    THEMES.forEach(function (t) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'theme-card' + (prefs.theme === t.id ? ' active' : '');
      b.innerHTML = '<span class="theme-swatch" style="background:' + t.bg + ';--sw-accent:' + t.accent + '"><span class="theme-swatch-dot"></span></span>' +
        '<span class="theme-name"></span><span class="theme-desc"></span>' +
        (t.isDefault ? '<span class="theme-default-badge">Default</span>' : '');
      b.querySelector('.theme-name').textContent = t.name;
      b.querySelector('.theme-desc').textContent = t.desc;
      b.addEventListener('click', function () { prefs.theme = t.id; savePrefs(prefs); render(); });
      grid.appendChild(b);
    });
    var row = document.getElementById('accentRow');
    row.innerHTML = '';
    ACCENTS.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'accent-swatch' + (prefs.accent === a.value ? ' active' : '');
      b.title = a.name;
      b.setAttribute('aria-label', a.name);
      if (a.value) b.style.background = a.value;
      else b.textContent = '✕';
      b.addEventListener('click', function () { prefs.accent = a.value; savePrefs(prefs); render(); });
      row.appendChild(b);
    });
    var custom = document.createElement('label');
    custom.className = 'accent-custom';
    custom.title = 'Custom accent colour';
    custom.innerHTML = '<input type="color" aria-label="Custom accent colour" value="' + (prefs.accent || '#3b82f6') + '"><span>+</span>';
    custom.querySelector('input').addEventListener('input', function (e) {
      prefs.accent = e.target.value; savePrefs(prefs); render();
    });
    row.appendChild(custom);
    [['fontSize', 'fontSizeRow', ['small', 'default', 'large'], ['Small', 'Default', 'Large']],
     ['density', 'densityRow', ['comfortable', 'compact'], ['Comfortable', 'Compact']],
     ['radius', 'radiusRow', ['default', 'sharp', 'rounded'], ['Default', 'Sharp', 'Rounded']]
    ].forEach(function (cfg) {
      var key = cfg[0], rowEl = document.getElementById(cfg[1]), ids = cfg[2], names = cfg[3];
      rowEl.innerHTML = '';
      ids.forEach(function (id, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = prefs[key] === id ? 'active' : '';
        b.textContent = names[i];
        b.addEventListener('click', function () { prefs[key] = id; savePrefs(prefs); render(); });
        rowEl.appendChild(b);
      });
    });
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
  });
  document.addEventListener('click', function (e) {
    if (!panel.hidden && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
  });
  document.getElementById('themeReset').addEventListener('click', function () {
    prefs = { ...DEFAULTS };
    savePrefs(prefs);
    render();
  });
  render();
})();
