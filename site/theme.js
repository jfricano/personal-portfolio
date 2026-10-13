// Apply the saved appearance before the first paint; the OS preference is the default.
(() => {
  const key = 'portfolio-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark'].includes(value) ? value : 'system';
  const resolve = () => choice === 'system' ? (system.matches ? 'dark' : 'light') : choice;
  let choice = 'system';
  let toggle;

  try { choice = valid(localStorage.getItem(key)); } catch { /* Storage is optional. */ }

  function apply() {
    const theme = resolve();
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#24211f' : '#f5f0e7');
    if (!toggle) return;
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.title = theme === 'dark' ? 'Switch to the light theme' : 'Switch to the dark theme';
  }

  // One switch flips between light and dark. Landing back on the device's own setting forgets the choice,
  // so the page follows the device again (and keeps following it if the device changes at sunset).
  function flip() {
    const next = resolve() === 'dark' ? 'light' : 'dark';
    const follows = next === (system.matches ? 'dark' : 'light');
    choice = follows ? 'system' : next;
    try {
      if (follows) localStorage.removeItem(key);
      else localStorage.setItem(key, next);
    } catch { /* The choice still applies for this page. */ }
    apply();
  }

  apply();
  system.addEventListener('change', apply);
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = valid(event.newValue);
    apply();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const masthead = document.querySelector('.masthead');
    const nav = masthead?.querySelector('.nav');
    if (!nav) return;

    // A half-filled disc, the old contrast mark: small and typographic, between the name and the links.
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'theme-toggle';
    toggle.setAttribute('aria-label', 'Dark theme');
    toggle.innerHTML = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">'
      + '<circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" stroke-width="1.2"/>'
      + '<path d="M8 1.4a6.6 6.6 0 0 1 0 13.2z" fill="currentColor"/></svg>';
    toggle.addEventListener('click', flip);
    masthead.insertBefore(toggle, nav);
    apply();

    const measure = () => root.style.setProperty('--masthead-h', `${masthead.getBoundingClientRect().height}px`);
    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(masthead);
  });
})();
