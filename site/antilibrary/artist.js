// An artist path: a suggested listening order through one artist's records, starting at a door, with the records
// left out still shown in the timeline. The paths live in the jfricano/anti-lib repository (lists/artist-paths.json,
// built into data/paths.json), like the lists themselves. With no artist named, the page lists every path.
// In owner mode each record gets a Heard box. Ticks wait in the same browser store as the list's marks (albums list,
// "title|artist"), so they go out with the list's Send changes issue and land in progress.json.
(() => {
  const DATA = document.getElementById('main').dataset.source;
  const SPOTIFY = 'https://open.spotify.com/search/', DISCOGS = 'https://www.discogs.com/search/?type=all&q=';
  const root = document.getElementById('ap');
  const head = { crumb: document.getElementById('ap-crumb'), title: document.getElementById('ap-title'), deck: document.getElementById('ap-deck'), facts: document.getElementById('ap-facts') };
  // The heading is in the page itself; each view fills in its words.
  function setHead(crumb, title, deck, facts = '') {
    head.crumb.innerHTML = crumb; head.title.innerHTML = title; head.deck.innerHTML = deck;
    head.deck.hidden = !deck; head.facts.innerHTML = facts; head.facts.hidden = !facts;
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const web = url => (/^https:\/\//.test(url || '') ? url : '');
  const id = new URLSearchParams(location.search).get('a') || '';
  const OWNER_KEY = 'antilibrary-owner-mode', PENDING_KEY = 'antilibrary-pending-marks';
  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  };
  const owner = store.get(OWNER_KEY, false) === true;
  let progress = {}, current = null;

  const key = r => `${r.t}|${r.c}`;
  const waiting = r => (store.get(PENDING_KEY, {}) || {}).albums?.[key(r)];
  const heard = r => {
    if (r.d) return true;
    const mark = owner ? waiting(r) : undefined;
    return Boolean(mark !== undefined && mark !== 'remove' ? mark : progress[key(r)]);
  };
  const unsent = r => owner && waiting(r) !== undefined;
  const heardBox = r => owner ? `<label class="al-toggle${unsent(r) ? ' al-unsent' : ''}"${r.d ? ' title="Marked in the source list"' : ''}>` +
    `<input type="checkbox" data-key="${esc(key(r))}"${heard(r) ? ' checked' : ''}${r.d ? ' disabled' : ''}><span>Heard</span></label>` : '';
  // Ticks and unticks wait in this browser; one that matches what's already published is dropped.
  function setHeard(k, on) {
    const pending = store.get(PENDING_KEY, {}) || {}, albums = (pending.albums ??= {});
    if (Boolean(progress[k]) === on) delete albums[k]; else albums[k] = on ? new Date().toISOString().slice(0, 10) : null;
    if (!Object.keys(albums).length) delete pending.albums;
    store.set(PENDING_KEY, Object.keys(pending).length ? pending : null);
  }
  const steps = p => p.records.filter(r => r.p).sort((a, b) => a.p - b.p);
  const query = r => encodeURIComponent([r.t, r.c].join(' '));
  const pageLink = r => web(r.l) || DISCOGS + query(r);
  const credit = (p, r) => [r.b ? r.c : '', r.y, r.w].filter(Boolean).map(esc).join(' · ');

  function stepHtml(p, r) {
    const cover = web(r.i) ? `<img src="${esc(r.i)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '';
    const tags = [r.p === 1 && '<li class="al-tag ap-tag-door">The door</li>', heard(r) && '<li class="al-tag al-tag-done">Heard</li>'].filter(Boolean);
    return `<li class="al-item ap-step" id="step-${r.p}">` +
      `<a class="al-cover" href="${esc(pageLink(r))}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><span>${esc(r.t.replace(/^(the|a|an)\s+/i, '').charAt(0))}</span>${cover}</a>` +
      `<div class="al-item-head"><p class="ap-num index" aria-hidden="true">${r.p}</p><div class="al-ident"><h3><a href="${esc(pageLink(r))}" target="_blank" rel="noopener noreferrer"${web(r.l) ? '' : ' title="Search for this record"'}>${esc(r.t)}<span class="al-ext" aria-hidden="true"> ↗</span></a></h3>` +
      `<p class="al-by">${credit(p, r)}</p></div>` +
      `<p class="al-more"><a class="al-listen" href="${esc(SPOTIFY + query(r))}" data-app="spotify:search:${esc(query(r))}" target="_blank" rel="noopener noreferrer">Listen on Spotify ↗</a></p>${owner ? `<span class="al-owner-actions">${heardBox(r)}</span>` : ''}</div>` +
      `<div class="al-item-body">${r.n ? `<p class="al-note">${esc(r.n)}</p>` : ''}</div>` +
      `${tags.length ? `<ul class="al-tags">${tags.join('')}</ul>` : ''}</li>`;
  }

  function timelineHtml(p) {
    return p.records.map(r => {
      const mark = r.p ? `<a class="ap-mark" href="#step-${r.p}">${r.p === 1 ? 'Door' : `No. ${r.p}`}</a>` : '<span class="ap-mark">Skipped</span>';
      return `<li class="ap-row${r.p ? '' : ' ap-skipped'}${heard(r) ? ' ap-heard' : ''}"><span class="ap-year">${esc(r.y)}</span>` +
        `<div class="ap-what"><p class="ap-title"><a href="${esc(pageLink(r))}" target="_blank" rel="noopener noreferrer">${esc(r.t)}</a>` +
        `${r.b || r.w ? ` <span class="ap-credit">${[r.b ? r.c : '', r.w].filter(Boolean).map(esc).join(' · ')}</span>` : ''}${heard(r) ? ' <span class="ap-credit">· heard</span>' : ''}</p>` +
        `${!r.p && r.n ? `<p class="ap-why">${esc(r.n)}</p>` : ''}${owner && !r.p ? `<p class="al-owner-actions">${heardBox(r)}</p>` : ''}</div>${mark}</li>`;
    }).join('');
  }

  // Both sections fold like the list's shelves and start folded; they stay as they were when a tick re-renders the page.
  const opened = new Set();
  const fold = (key, num, name, count, body) => `<section class="ap-section"><h2><button type="button" class="al-shelf-toggle" aria-expanded="${opened.has(key)}" aria-controls="ap-${key}" data-fold="${key}">` +
    `<span class="index">${num}</span><span class="al-shelf-name">${name}</span><span class="al-shelf-count">${count}</span><span class="al-fold-mark" aria-hidden="true"></span></button></h2>` +
    `<div id="ap-${key}"${opened.has(key) ? '' : ' hidden'}>${body}</div></section>`;
  function setFold(key, open) {
    open ? opened.add(key) : opened.delete(key);
    const toggle = root.querySelector(`[data-fold="${key}"]`);
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', open);
    document.getElementById(`ap-${key}`).hidden = !open;
  }

  function showPath(p) {
    current = p;
    const order = steps(p), skipped = p.records.length - order.length, years = p.records.map(r => r.y);
    const done = order.filter(heard).length;
    document.title = `${p.artist}: a listening path — Jason Fricano`;
    setHead('<a href="./?list=albums">Anti-library albums</a> / <a href="artist.html">Artist paths</a>', esc(p.artist), p.about ? esc(p.about) : '',
      `<div><dt>The door</dt><dd><a href="#step-1">${esc(order[0].t)}</a> (${esc(order[0].y)})</dd></div>` +
      `<div><dt>The path</dt><dd>${order.length} ${order.length === 1 ? 'record' : 'records'}, in this order</dd></div>` +
      `<div><dt>Left out</dt><dd>${skipped ? `${skipped} more from ${Math.min(...years)} to ${Math.max(...years)}, in the timeline` : 'Nothing worth noting'}</dd></div>` +
      `<div><dt>Heard</dt><dd>${done === order.length ? `Fully heard: all ${order.length} on the path` : `${done} of ${order.length} on the path`}</dd></div>`);
    const count = Object.keys((store.get(PENDING_KEY, {}) || {}).albums || {}).length;
    const bar = owner ? `<div class="al-owner-bar"><p aria-live="polite">${count
      ? `${count} ${count === 1 ? 'album is' : 'albums are'} ticked in this browser and not yet sent. Send them from the <a href="./?list=albums">albums list</a>.`
      : 'Tick each album as you hear it. The artist counts as fully heard once every album on the path is ticked.'}</p></div>` : '';
    root.innerHTML = bar + fold('order', '01', 'Listening order', order.length, `<ol class="al-list ap-steps" data-cover="square">${order.map(r => stepHtml(p, r)).join('')}</ol>`) +
      fold('run', '02', 'The whole run', p.records.length, '<p class="ap-lede">Every record worth knowing about, by year. The ones off the path are here so you can see what was left out, and why.</p>' +
        `<ol class="ap-timeline">${timelineHtml(p)}</ol>`);
    root.dataset.cover = 'square';
  }

  function showIndex(paths) {
    document.title = 'Artist paths — Jason Fricano';
    setHead('<a href="./?list=albums">Anti-library albums</a> / Artist paths', 'Artist <em>paths.</em>',
      "For the artists worth going deep on: a door to start with, then the records that make the study feel complete, in the order I'd play them.");
    root.innerHTML = `<ol class="ap-index">${paths.map(p => {
        const order = steps(p);
        return `<li><a href="artist.html?a=${encodeURIComponent(p.id)}"><span class="ap-index-name">${esc(p.artist)}</span>` +
          `<span class="ap-index-door">Start with ${esc(order[0].t)} · ${order.length} on the path</span></a></li>`;
      }).join('')}</ol>`;
  }

  function show(paths) {
    if (!id) return showIndex(paths);
    const p = paths.find(x => x.id === id);
    if (p) return showPath(p);
    setHead('<a href="./?list=albums">Anti-library albums</a> / <a href="artist.html">Artist paths</a>', 'No path <em>yet.</em>',
      'There isn\'t a listening path for that artist. <a href="artist.html">See the artists that have one.</a>');
  }

  // As on the list, Listen on Spotify tries the desktop app first and falls back to the web player.
  const desktop = !/Android|iPhone|iPad|iPod|Firefox/i.test(navigator.userAgent) && !(navigator.maxTouchPoints > 0);
  root.addEventListener('click', event => {
    const toggle = event.target.closest('[data-fold]');
    if (toggle) setFold(toggle.dataset.fold, toggle.getAttribute('aria-expanded') !== 'true');
  });
  // A link to a step (the door in the header, a mark in the timeline) opens the listening order first. It scrolls
  // without adding to the history, so Back to albums still has one step to go back.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#step-"]');
    if (!link) return;
    event.preventDefault();
    setFold('order', true);
    document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  // Back to albums returns to the list as it was left (filters, open shelves, scroll) when the visitor came from it;
  // otherwise it opens the albums list.
  const back = document.getElementById('ap-back');
  let from = null;
  try { from = new URL(document.referrer); } catch {}
  if (from && from.origin === location.origin && /\/antilibrary\/(index\.html)?$/.test(from.pathname)) {
    back.href = from.href;
    back.addEventListener('click', event => {
      if (history.length < 2 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.back();
    });
  }
  root.addEventListener('click', event => {
    const link = event.target.closest('.al-listen');
    if (!link || !desktop || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    let left = false;
    const away = () => { left = true; };
    addEventListener('blur', away, { once: true });
    document.addEventListener('visibilitychange', away, { once: true });
    setTimeout(() => {
      removeEventListener('blur', away);
      document.removeEventListener('visibilitychange', away);
      if (!left) window.open(link.href, '_blank', 'noopener');
    }, 800);
    location.href = link.dataset.app;
  });
  // Re-rendering keeps the page where it is; focus returns to the same box.
  root.addEventListener('change', event => {
    const box = event.target.closest('.al-owner-actions input');
    if (!box || !owner || !current) return;
    const at = [...root.querySelectorAll('.al-owner-actions input')].indexOf(box);
    setHeard(box.dataset.key, box.checked);
    showPath(current);
    root.querySelectorAll('.al-owner-actions input')[at]?.focus();
  });
  root.addEventListener('error', event => { if (event.target.tagName === 'IMG') event.target.remove(); }, true);

  Promise.all([
    fetch(`${DATA}paths.json`).then(r => r.json()),
    fetch(`${DATA}progress.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : {})).catch(() => ({})),
  ]).then(([paths, done]) => { progress = done.albums || {}; show(paths); })
    .catch(() => { head.deck.textContent = 'The artist paths could not be loaded. Try refreshing the page.'; });
})();
