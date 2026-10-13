// Dark-theme artwork. Each illustration has a dark cut-out (transparent, so it sits straight on the charcoal page).
// In the dark theme every picture swaps to its cut-out, and back when the theme turns light. Light pictures are
// matched by file name, so pages and scripts keep naming the light files (and their smaller copies) as before.
// Until a picture is swapped, theme.css hides a light picture in the dark theme, so it never shows for a frame.
(() => {
  const base = new URL('.', document.currentScript.src);
  const DARK = [
    [/\/antilibrary\/art\/(books|films|tv|albums|general)(?:-\d+)?\.jpg$/, name => `antilibrary/art/dark/${name}.webp`],
    [/\/digests\/art\/digests(?:-\d+)?\.jpg$/, () => 'digests/art/dark/digests.webp'],
    [/\/assets\/lavender-thread(?:-\d+)?\.jpg$/, () => 'assets/dark/spool.webp'],
    [/\/artwork\/attention-still-life\.jpg$/, () => 'assets/dark/hero.webp'],
  ];
  const darkFor = url => {
    const path = new URL(url, location.href).pathname;
    for (const [pattern, file] of DARK) {
      const match = path.match(pattern);
      if (match) return new URL(file(match[1]), base).href;
    }
    return '';
  };
  const dark = () => document.documentElement.dataset.theme === 'dark';

  function swap(img) {
    if (dark()) {
      if (img.dataset.lightSrc) return;
      const src = img.getAttribute('src'), to = src && darkFor(src);
      if (!to) return;
      img.dataset.lightSrc = src;
      if (img.hasAttribute('srcset')) { img.dataset.lightSrcset = img.getAttribute('srcset'); img.removeAttribute('srcset'); }
      img.src = to;
    } else if (img.dataset.lightSrc) {
      const light = img.dataset.lightSrc;
      if (img.dataset.lightSrcset) img.setAttribute('srcset', img.dataset.lightSrcset);
      delete img.dataset.lightSrc;
      delete img.dataset.lightSrcset;
      img.src = light;
    }
  }
  const swapAll = () => document.querySelectorAll('img').forEach(swap);

  // Pictures added or re-pointed later (a list's picture when its tab is chosen, a thread's spool) swap as they
  // arrive, before the next paint. A script pointing a picture at a new light file starts it over.
  new MutationObserver(records => {
    for (const record of records) {
      if (record.attributeName === 'data-theme') { swapAll(); continue; }
      if (record.type === 'attributes') {
        const img = record.target, src = img.getAttribute('src');
        if (img.tagName !== 'IMG') continue;
        if (src && darkFor(src)) { delete img.dataset.lightSrc; delete img.dataset.lightSrcset; swap(img); }
        continue;
      }
      for (const node of record.addedNodes) {
        if (node.nodeType !== 1) continue;
        if (node.tagName === 'IMG') swap(node); else node.querySelectorAll('img').forEach(swap);
      }
    }
  }).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'data-theme'] });
  swapAll();
})();
