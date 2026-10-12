// An artist path: a suggested listening order through one artist's records, starting at a door, with the records
// left out still shown in the timeline. The paths live in the jfricano/anti-lib repository (lists/artist-paths.json,
// built into data/paths.json), like the lists themselves. With no artist named, the page lists every path.
(() => {
  const DATA = document.getElementById('main').dataset.source;
  const SPOTIFY = 'https://open.spotify.com/search/', DISCOGS = 'https://www.discogs.com/search/?type=all&q=';
  const root = document.getElementById('ap');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const web = url => (/^https:\/\//.test(url || '') ? url : '');
  const id = new URLSearchParams(location.search).get('a') || '';
  let progress = {};

  const heard = r => Boolean(r.d || progress[`${r.t}|${r.c}`]);
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
      `<p class="al-more"><a class="al-listen" href="${esc(SPOTIFY + query(r))}" data-app="spotify:search:${esc(query(r))}" target="_blank" rel="noopener noreferrer">Listen on Spotify ↗</a></p></div>` +
      `<div class="al-item-body">${r.n ? `<p class="al-note">${esc(r.n)}</p>` : ''}</div>` +
      `${tags.length ? `<ul class="al-tags">${tags.join('')}</ul>` : ''}</li>`;
  }

  function timelineHtml(p) {
    return p.records.map(r => {
      const mark = r.p ? `<a class="ap-mark" href="#step-${r.p}">${r.p === 1 ? 'Door' : `No. ${r.p}`}</a>` : '<span class="ap-mark">Skipped</span>';
      return `<li class="ap-row${r.p ? '' : ' ap-skipped'}${heard(r) ? ' ap-heard' : ''}"><span class="ap-year">${esc(r.y)}</span>` +
        `<div class="ap-what"><p class="ap-title"><a href="${esc(pageLink(r))}" target="_blank" rel="noopener noreferrer">${esc(r.t)}</a>` +
        `${r.b || r.w ? ` <span class="ap-credit">${[r.b ? r.c : '', r.w].filter(Boolean).map(esc).join(' · ')}</span>` : ''}${heard(r) ? ' <span class="ap-credit">· heard</span>' : ''}</p>` +
        `${!r.p && r.n ? `<p class="ap-why">${esc(r.n)}</p>` : ''}</div>${mark}</li>`;
    }).join('');
  }

  function showPath(p) {
    const order = steps(p), skipped = p.records.length - order.length, years = p.records.map(r => r.y);
    document.title = `${p.artist}: a listening path — Jason Fricano`;
    root.innerHTML = `<header class="ap-head"><p class="label"><a href="./?list=albums">Anti-library albums</a> / <a href="artist.html">Artist paths</a></p>` +
      `<h1>${esc(p.artist)}</h1>${p.about ? `<p class="case-deck">${esc(p.about)}</p>` : ''}` +
      `<dl class="case-facts"><div><dt>The door</dt><dd><a href="#step-1">${esc(order[0].t)}</a> (${esc(order[0].y)})</dd></div>` +
      `<div><dt>The path</dt><dd>${order.length} ${order.length === 1 ? 'record' : 'records'}, in this order</dd></div>` +
      `<div><dt>Left out</dt><dd>${skipped ? `${skipped} more from ${Math.min(...years)} to ${Math.max(...years)}, in the timeline` : 'Nothing worth noting'}</dd></div></dl></header>` +
      `<section class="ap-section" aria-labelledby="ap-order"><h2 id="ap-order"><span class="index">01</span>Listening order</h2><ol class="al-list ap-steps" data-cover="square">${order.map(r => stepHtml(p, r)).join('')}</ol></section>` +
      `<section class="ap-section" aria-labelledby="ap-time"><h2 id="ap-time"><span class="index">02</span>The whole run</h2>` +
      `<p class="ap-lede">Every record worth knowing about, by year. The ones off the path are here so you can see what was left out, and why.</p>` +
      `<ol class="ap-timeline">${timelineHtml(p)}</ol></section>`;
    root.dataset.cover = 'square';
  }

  function showIndex(paths) {
    document.title = 'Artist paths — Jason Fricano';
    root.innerHTML = `<header class="ap-head"><p class="label"><a href="./?list=albums">Anti-library albums</a> / Artist paths</p>` +
      `<h1>Artist <em>paths.</em></h1><p class="case-deck">For the artists worth going deep on: a door to start with, then the records that make the study feel complete, in the order I'd play them.</p></header>` +
      `<ol class="ap-index">${paths.map(p => {
        const order = steps(p);
        return `<li><a href="artist.html?a=${encodeURIComponent(p.id)}"><span class="ap-index-name">${esc(p.artist)}</span>` +
          `<span class="ap-index-door">Start with ${esc(order[0].t)} · ${order.length} on the path</span></a></li>`;
      }).join('')}</ol>`;
  }

  function show(paths) {
    if (!id) return showIndex(paths);
    const p = paths.find(x => x.id === id);
    if (p) return showPath(p);
    root.innerHTML = `<header class="ap-head"><h1>No path <em>yet.</em></h1><p class="case-deck">There isn't a listening path for that artist. <a href="artist.html">See the artists that have one.</a></p></header>`;
  }

  // As on the list, Listen on Spotify tries the desktop app first and falls back to the web player.
  const desktop = !/Android|iPhone|iPad|iPod|Firefox/i.test(navigator.userAgent) && !(navigator.maxTouchPoints > 0);
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
  root.addEventListener('error', event => { if (event.target.tagName === 'IMG') event.target.remove(); }, true);

  Promise.all([
    fetch(`${DATA}paths.json`).then(r => r.json()),
    fetch(`${DATA}progress.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : {})).catch(() => ({})),
  ]).then(([paths, done]) => { progress = done.albums || {}; show(paths); })
    .catch(() => { root.innerHTML = '<p class="al-empty">The artist paths could not be loaded. Try refreshing the page.</p>'; });
})();
