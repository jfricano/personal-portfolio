// Apply the saved appearance before the first paint; the OS preference is the default.
(() => {
  const key = 'portfolio-theme';
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark'].includes(value) ? value : 'system';
  let choice = 'system';
  let select;

  try { choice = valid(localStorage.getItem(key)); } catch { /* Storage is optional. */ }

  function apply() {
    const theme = choice === 'system' ? (system.matches ? 'dark' : 'light') : choice;
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#24211f' : '#f5f0e7');
    if (select) select.value = choice;
  }

  apply();
  system.addEventListener('change', apply);
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    choice = valid(event.newValue);
    apply();
  });

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.masthead .nav');
    if (!nav) return;

    const label = document.createElement('label');
    label.className = 'theme-control';
    label.textContent = 'Theme';
    select = document.createElement('select');
    select.setAttribute('aria-label', 'Color theme');
    for (const [value, text] of [['system', 'Auto'], ['light', 'Light'], ['dark', 'Dark']]) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = text;
      select.append(option);
    }
    label.append(select);
    nav.append(label);
    select.addEventListener('change', () => {
      choice = valid(select.value);
      try {
        if (choice === 'system') localStorage.removeItem(key);
        else localStorage.setItem(key, choice);
      } catch { /* The choice still applies for this page. */ }
      apply();
    });
    apply();

    const masthead = document.querySelector('.masthead');
    const measure = () => root.style.setProperty('--masthead-h', `${masthead.getBoundingClientRect().height}px`);
    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(masthead);
  });
})();
