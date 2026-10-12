// The anti-library browser. The lists live in the jfricano/anti-lib repository, which builds them into
// JSON; the page reads lists.json, one <id>.json per list and progress.json from there (the data-source
// attribute on <main>), so list changes show up without redeploying this site.
// Owner mode (turned on by visiting ?owner=on, never linked from the page) adds a mark button
// to each title and a spreadsheet export. Marks wait in this browser until the owner sends
// them as one prefilled GitHub issue; a repository workflow applies issues opened by the owner
// to its progress.json, so GitHub's own sign-in is the permission check and the page holds no secrets.
(() => {
  const REPO = 'jfricano/anti-lib';
  // Digests live in a private repository; in owner mode, a browser holding the digests page's
  // read-only key also links each title that has a finished digest and shows its digest marks.
  const DIGESTS_REPO = 'jfricano/reading-list', DIGESTS_TOKEN_KEY = 'digests-token';
  const DATA = document.getElementById('main').dataset.source;
  const OWNER_KEY = 'antilibrary-owner-mode', PENDING_KEY = 'antilibrary-pending-marks', TAGS_KEY = 'antilibrary-pending-tags', OPENED_KEY = 'antilibrary-opened';
  const $ = id => document.getElementById(id);
  const els = {
    tabs: $('al-tabs'), q: $('al-q'), shelf: $('al-shelf'), shelfLabel: $('al-shelf-label'), show: $('al-show'), showField: $('al-show-field'),
    thread: $('al-thread'), threadField: $('al-thread-field'), sort: $('al-sort'), count: $('al-count'), applied: $('al-applied'), results: $('al-results'), random: $('al-random'),
    hide: $('al-hide'), hideLabel: $('al-hide-label'), fold: $('al-fold'),
    owner: $('al-owner'), ownerBar: $('al-owner-bar'), ownerText: $('al-owner-text'), send: $('al-send'), discard: $('al-discard'),
    exportButton: $('al-export'),
  };
  const cache = {};
  let lists = [], list = null, items = [], visible = [];
  let progress = {}, removed = {}, pending = {}, pendingTags = {}, owner = false, picked = false, digestLinks = {};
  // Shelves start folded, so a list opens as its table of contents. Shelves opened while browsing are remembered in
  // this browser per list; while a search, shelf or filter is on, every shelf with matches opens instead, and folds
  // made then last only until the filters change.
  let opened = {}, foldedNow = new Set();
  const filtering = () => Boolean(state.q || state.only || state.thread || state.group || state.shelf || (owner && state.hide));
  const isOpen = shelf => (filtering() ? !foldedNow.has(shelf) : Boolean(opened[list.id]?.has(shelf)));
  const blank = () => ({ q: '', group: '', shelf: '', sort: 'shelf', only: '', thread: '', hide: false });
  const state = { list: '', ...blank() };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const number = n => Number(n).toLocaleString('en-US');
  const splitShelf = s => { const m = /^(\d+)\.\s*(.*)$/.exec(s || ''); return m ? [m[1].padStart(2, '0'), m[2]] : ['', s || '']; };
  const titleKey = t => fold(t).replace(/^(the|a|an)\s+/, '');
  const creatorKey = c => {
    const first = fold(c || '~').split(/\s*(?:&|,|\band\b)\s*/)[0].replace(/\(.*?\)/g, '').trim();
    const words = first.split(/\s+/).filter(w => !/^(jr\.?|sr\.?|ii|iii|iv)$/.test(w));
    return `${words.at(-1) || '~'} ${first}`;
  };
  const itemKey = i => `${i.t}|${i.c || ''}`;
  const pendingFor = i => pending[list.id]?.[itemKey(i)];
  const REMOVE = 'remove';
  const isRemoving = i => pendingFor(i) === REMOVE;
  // Owner-toggle flags (list.toggles, such as On my shelf) switched in this browser apply over the published flags
  // in i._f until they are sent, so the tags, Show filter and counts all read the same i.f.
  function applyTags(id) {
    const meta = lists.find(l => l.id === id), tagged = pendingTags[id] || {};
    for (const i of cache[id] || []) {
      const set = tagged[itemKey(i)];
      if (set) for (const flag of Object.keys(set)) if (set[flag] === i._f.includes(flag) || !(meta.toggles || []).includes(flag)) delete set[flag];
      if (set && !Object.keys(set).length) delete tagged[itemKey(i)];
      const f = set ? Object.keys(meta.flags).filter(flag => set[flag] ?? i._f.includes(flag)) : i._f;
      if (f.length) i.f = f; else delete i.f;
    }
    if (cache[id] && !Object.keys(tagged).length) delete pendingTags[id];
    store.set(TAGS_KEY, Object.keys(pendingTags).length ? pendingTags : null);
  }
  const isDone = i => {
    const mark = pendingFor(i);
    return Boolean(i.d || (mark !== undefined && mark !== REMOVE ? mark : progress[list.id]?.[itemKey(i)]));
  };
  // Flags such as "Start here" are Jason's own and only show in owner mode. Of the flags a visitor sees, the ones
  // that are not private filters make up the Show menu, and their tags on each title apply the same filter.
  const shownFlags = () => Object.entries(list.flags).filter(([key]) => owner || !(list.privateFlags || []).includes(key));
  const filterFlags = () => shownFlags().filter(([key]) => owner || !(list.privateFilters || []).includes(key));
  const SORTS = {
    shelf: { label: 'Shelf order' },
    title: { label: 'Title A–Z', cmp: (a, b) => a._t.localeCompare(b._t) },
    creator: { label: 'Creator A–Z', cmp: (a, b) => a._c.localeCompare(b._c) || a._t.localeCompare(b._t) },
    newest: { label: 'Newest first', year: true, cmp: (a, b) => (b.y || 0) - (a.y || 0) || a._t.localeCompare(b._t) },
    oldest: { label: 'Oldest first', year: true, cmp: (a, b) => (a.y || 9999) - (b.y || 9999) || a._t.localeCompare(b._t) },
  };
  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  };

  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.list = p.get('list') || '';
    state.q = p.get('q') || '';
    state.shelf = p.get('shelf') || '';
    state.group = state.shelf ? '' : p.get('part') || '';
    state.sort = SORTS[p.get('sort')] ? p.get('sort') : 'shelf';
    state.only = (p.get('only') || '').split(',')[0];
    state.thread = p.get('thread') || '';
    state.hide = p.get('hide') === '1';
  }
  function writeUrl() {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.group) p.set('part', state.group);
    if (state.shelf) p.set('shelf', state.shelf);
    if (state.sort !== 'shelf') p.set('sort', state.sort);
    if (state.only) p.set('only', state.only);
    if (state.thread) p.set('thread', state.thread);
    if (owner && state.hide) p.set('hide', '1');
    // A visit with no list in the URL opens a random one. The list goes into the URL once someone
    // picks a tab or narrows the view, so a shared link opens the same list.
    if (list && (picked || p.size)) p.set('list', list.id);
    const query = p.toString();
    try { history.replaceState(null, '', query ? `?${query}` : location.pathname); } catch {}
  }

  // Threads are named paths through titles on the list; picking one shows its titles in path order.
  const threadOf = id => (list.threads || []).find(t => t.id === id);
  const unique = values => [...new Set(values.filter(Boolean))];
  const shelfName = shelf => splitShelf(shelf)[1] || 'Unshelved';
  // Menu choices carry their counts; the chosen one and the "all" choice leave it off, since the count line says it.
  const option = (value, text, n, current) => value === current || !value
    ? `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(text)}</option>`
    : `<option value="${esc(value)}"${n ? '' : ' disabled'}>${esc(text)} (${number(n)})</option>`;

  function renderTabs() {
    els.tabs.innerHTML = lists.map(l => `<button type="button" role="tab" id="al-tab-${esc(l.id)}" data-id="${esc(l.id)}" aria-controls="al-results" aria-selected="${l === list}" tabindex="${l === list ? 0 : -1}">${esc(l.label)} <span>${number(l.count)}</span></button>`).join('');
    els.results.setAttribute('role', 'tabpanel');
    els.results.setAttribute('aria-labelledby', `al-tab-${list.id}`);
  }

  // Checks run once per list change: drop filters the list (or the visitor) cannot use, then build the sort menu.
  function renderControls() {
    if (state.group && !items.some(i => i.g === state.group)) state.group = '';
    if (state.shelf && !items.some(i => i.s === state.shelf)) state.shelf = '';
    if (state.only && !filterFlags().some(([key]) => key === state.only)) state.only = '';
    if (state.thread && !threadOf(state.thread)) state.thread = '';
    if (!owner) state.hide = false;
    els.shelfLabel.textContent = list.shelfLabel || 'Shelf';
    const sorts = Object.entries(SORTS).filter(([, s]) => !s.year || list.hasYear);
    if (!sorts.some(([key]) => key === state.sort)) state.sort = 'shelf';
    els.sort.innerHTML = sorts.map(([key, s]) => `<option value="${key}"${key === state.sort ? ' selected' : ''}>${key === 'creator' ? `${esc(list.creatorLabel)} A–Z` : s.label}</option>`).join('');
    els.hide.checked = state.hide;
    els.hideLabel.textContent = `Hide ${list.doneLabel.toLowerCase()}`;
    els.q.value = state.q;
  }

  // The Shelf and Show menus count what each choice would show alongside the other filters in use, the way the
  // shelf headings below count their titles, and a choice that would show nothing is greyed out.
  function renderMenus() {
    const others = items.filter(i => matches(i, 'shelf')), byFlag = items.filter(i => matches(i, 'only'));
    const shelves = new Map(), parts = new Map();
    for (const i of items) {
      if (!parts.has(i.g || '')) parts.set(i.g || '', []);
      if (!shelves.has(i.s)) { shelves.set(i.s, 0); parts.get(i.g || '').push(i.s); }
    }
    for (const i of others) shelves.set(i.s, shelves.get(i.s) + 1);
    const plural = (list.shelfLabel || 'shelf').toLowerCase().replace(/f$/, 've') + 's';
    const current = state.shelf ? `shelf:${state.shelf}` : state.group ? `part:${state.group}` : '';
    let html = option('', `All ${plural}`, others.length, current);
    for (const [part, names] of parts) {
      const rows = names.map(name => option(`shelf:${name}`, name, shelves.get(name), current)).join('');
      html += part ? `<optgroup label="${esc(part)}">${option(`part:${part}`, `All of ${part}`, others.filter(i => i.g === part).length, current)}${rows}</optgroup>` : rows;
    }
    els.shelf.innerHTML = html;
    const flags = filterFlags();
    els.showField.hidden = !flags.length;
    els.show.innerHTML = option('', 'Everything', byFlag.length, state.only) +
      flags.map(([key, label]) => option(key, label, byFlag.filter(i => i.f && i.f.includes(key)).length, state.only)).join('');
    const threads = list.threads || [], byThread = items.filter(i => matches(i, 'thread'));
    els.threadField.hidden = !threads.length;
    els.thread.innerHTML = option('', 'None', 0, state.thread) +
      threads.map(t => option(t.id, t.name, byThread.filter(i => i.th && i.th[t.id]).length, state.thread)).join('');
  }

  // Every filter in use shows as a removable chip beside the count, so the view never narrows without saying how.
  function renderApplied() {
    const chips = [];
    if (state.q) chips.push(['q', `“${state.q}”`]);
    if (state.group) chips.push(['group', state.group]);
    if (state.shelf) chips.push(['shelf', shelfName(state.shelf)]);
    if (state.only) chips.push(['only', list.flags[state.only]]);
    if (state.thread) chips.push(['thread', `Thread: ${threadOf(state.thread).name}`]);
    if (owner && state.hide) chips.push(['hide', `Hiding ${list.doneLabel.toLowerCase()}`]);
    els.applied.hidden = !chips.length;
    els.applied.innerHTML = chips.map(([key, text]) =>
      `<li><button type="button" class="al-chip" data-clear="${key}" aria-label="Remove filter: ${esc(text)}">${esc(text)}<span aria-hidden="true">×</span></button></li>`).join('') +
      (chips.length > 1 ? '<li><button type="button" class="al-link" data-clear="all">Clear all</button></li>' : '');
  }

  function matches(i, skip) {
    return !(owner && isRemoving(i)) &&
      (skip === 'shelf' || ((!state.group || i.g === state.group) && (!state.shelf || i.s === state.shelf))) &&
      (skip === 'only' || !state.only || (i.f && i.f.includes(state.only))) &&
      (skip === 'thread' || !state.thread || Boolean(i.th && i.th[state.thread])) &&
      (!owner || !state.hide || !isDone(i)) && filter.terms.every(t => i._h.includes(t));
  }
  function filter() {
    filter.terms = fold(state.q).split(/\s+/).filter(Boolean);
    visible = items.filter(i => matches(i));
    // A thread keeps its own order, whatever the Sort menu says.
    const sort = state.thread ? { cmp: (a, b) => a.th[state.thread][0] - b.th[state.thread][0] } : SORTS[state.sort];
    if (sort.cmp) visible = [...visible].sort(sort.cmp);
  }

  function itemHtml(i) {
    const by = [i.c, i.y].filter(Boolean).map(esc).join(' · ');
    const where = [];
    if ((state.sort !== 'shelf' || state.thread) && i.s) where.push(splitShelf(i.s)[1]);
    if (i.u) where.push(i.u);
    const done = isDone(i);
    const visibleFlags = new Set(shownFlags().map(([key]) => key)), filters = new Set(filterFlags().map(([key]) => key));
    const tags = (i.f || []).filter(f => visibleFlags.has(f)).map(f => filters.has(f)
      ? `<li><button type="button" class="al-tag al-tag-${esc(f)}" data-only="${esc(f)}" title="Show only ${esc(list.flags[f].toLowerCase())}">${esc(list.flags[f])}</button></li>`
      : `<li class="al-tag al-tag-${esc(f)}">${esc(list.flags[f])}</li>`);
    if (done) tags.push(`<li class="al-tag al-tag-done">${esc(list.doneLabel)}</li>`);
    const digest = owner ? digestLinks[list.id]?.[itemKey(i)] : null;
    if (digest?.read) tags.push('<li class="al-tag al-tag-digested">Digested</li>');
    if (digest?.deeper) tags.push(`<li class="al-tag al-tag-deeper">${{ films: 'Watching', tv: 'Watching', albums: 'Listening to' }[list.id] || 'Reading'} in full</li>`);
    const suffix = i.f && i.f.includes('path') ? '' : list.searchSuffix;
    const href = i.l || `${list.search}${encodeURIComponent([i.t, i.c, suffix].filter(Boolean).join(' '))}`;
    const cover = i.i ? `<img src="${esc(i.i)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '';
    const genres = i.k ? `<p class="al-genres">${i.k.map(esc).join(' · ')}</p>` : '';
    const extra = [list.listen && `<a class="al-listen" href="${esc(list.listen + encodeURIComponent([i.t, i.c].filter(Boolean).join(' ')))}" data-app="spotify:search:${esc(encodeURIComponent([i.t, i.c].filter(Boolean).join(' ')))}" target="_blank" rel="noopener noreferrer">Listen on Spotify ↗</a>`,
      digest?.id && `<a class="al-digest" href="../digests/#${esc(digest.id)}">${digest.read ? 'Reread digest' : 'Read digest'}</a>`].filter(Boolean);
    const step = state.thread && i.th?.[state.thread]?.[1];
    const more = extra.length ? `<p class="al-more">${extra.join('')}</p>` : '';
    const key = esc(itemKey(i)), tagged = pendingTags[list.id]?.[itemKey(i)] || {};
    const toggle = (flag, text, on, unsent, attrs = '') => `<label class="al-toggle${unsent ? ' al-unsent' : ''}"${attrs}>` +
      `<input type="checkbox" data-key="${key}" data-flag="${flag}"${on ? ' checked' : ''}${attrs ? ' disabled' : ''}><span>${esc(text)}</span></label>`;
    const mark = owner ? `<span class="al-owner-actions">${toggle('', list.doneLabel, done, pendingFor(i) !== undefined, i.d ? ' title="Marked in the source list"' : '')}` +
      (list.toggles || []).map(flag => toggle(esc(flag), list.flags[flag], i.f?.includes(flag), flag in tagged)).join('') +
      `<button type="button" class="al-remove" data-key="${key}">Remove</button></span>` : '';
    return `<article class="al-item${done ? ' al-done' : ''}" id="item-${i._id}" tabindex="-1">` +
      `<a class="al-cover" href="${esc(href)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><span>${esc(i.t.replace(/^(the|a|an)\s+/i, '').charAt(0))}</span>${cover}</a>` +
      `<div class="al-item-head"><div class="al-ident"><h3><a href="${esc(href)}" target="_blank" rel="noopener noreferrer"${i.l ? '' : ' title="Search for this title"'}>${esc(i.t)}<span class="al-ext" aria-hidden="true"> ↗</span></a></h3>${by ? `<p class="al-by">${by}</p>` : ''}</div>${genres}${more}${mark}</div>` +
      `<div class="al-item-body">${step ? `<p class="al-step">${esc(step)}</p>` : ''}${i.n ? `<p class="al-note">${esc(i.n)}</p>` : ''}${where.length ? `<p class="al-where">${where.map(esc).join(' / ')}</p>` : ''}</div>` +
      `${tags.length ? `<ul class="al-tags">${tags.join('')}</ul>` : ''}</article>`;
  }

  // Titles the owner is removing drop out of the view (and the totals) at once.
  function updateCount() {
    const kept = owner ? items.filter(i => !isRemoving(i)) : items;
    const noun = list.noun[kept.length === 1 ? 0 : 1];
    const finished = kept.filter(isDone).length;
    els.count.textContent = (visible.length === kept.length
      ? `All ${number(kept.length)} ${noun}`
      : `Showing ${number(visible.length)} of ${number(kept.length)} ${noun}`) +
      (finished ? `, ${number(finished)} ${list.doneLabel.toLowerCase()}.` : '.');
  }

  function render() {
    filter();
    updateCount();
    renderMenus();
    renderApplied();
    els.random.disabled = !visible.length;
    foldedNow = new Set();
    renderOwnerBar();
    els.fold.hidden = !visible.length || state.sort !== 'shelf' || Boolean(state.shelf || state.thread);
    if (!visible.length) {
      els.results.innerHTML = `<div class="al-empty"><p>Nothing on these shelves matches. Try fewer words, or start over.</p><button type="button" class="al-button al-quiet" data-clear="all">Clear all filters</button></div>`;
      return;
    }
    if (state.thread) {
      const thread = threadOf(state.thread);
      els.results.innerHTML = `<header class="al-thread-head"><p class="label">Thread · ${number(thread.count)} stops</p><h2>${esc(thread.name)}</h2>` +
        `${thread.why ? `<p>${esc(thread.why)}</p>` : ''}</header><div class="al-list al-thread-list">${visible.map(itemHtml).join('')}</div>`;
      return;
    }
    if (state.sort !== 'shelf') {
      els.results.innerHTML = `<div class="al-list">${visible.map(itemHtml).join('')}</div>`;
      return;
    }
    const groups = new Map();
    for (const i of visible) {
      if (!groups.has(i.s)) groups.set(i.s, []);
      groups.get(i.s).push(i);
    }
    let html = '', part = null;
    for (const [shelf, rows] of groups) {
      const g = rows[0].g;
      if (g && g !== part && !state.group) { html += `<p class="al-part label">${esc(g)}</p>`; part = g; }
      const [num, name] = splitShelf(shelf);
      const n = shelfIndex.get(shelf), open = isOpen(shelf);
      html += `<section class="al-shelf"><h2><button type="button" class="al-shelf-toggle" aria-expanded="${open}" aria-controls="al-shelf-${n}" data-shelf="${esc(shelf)}">` +
        `<span class="index">${esc(num)}</span><span class="al-shelf-name">${esc(name || 'Unshelved')}</span><span class="al-shelf-count">${number(rows.length)}</span><span class="al-fold-mark" aria-hidden="true"></span></button></h2>` +
        `<div class="al-list" id="al-shelf-${n}"${open ? '' : ' hidden'}>${rows.map(itemHtml).join('')}</div></section>`;
    }
    els.results.innerHTML = html;
    updateFold();
  }

  // Shelf headings fold their shelf away; nothing re-renders, so scroll position and focus stay put.
  const shelfIndex = new Map();
  function setFold(toggle, open) {
    toggle.setAttribute('aria-expanded', open);
    $(toggle.getAttribute('aria-controls')).hidden = !open;
    const shelf = toggle.dataset.shelf;
    if (filtering()) open ? foldedNow.delete(shelf) : foldedNow.add(shelf);
    else { const set = (opened[list.id] ??= new Set()); open ? set.add(shelf) : set.delete(shelf); }
  }
  function saveFolds() {
    store.set(OPENED_KEY, Object.fromEntries(Object.entries(opened).filter(([, set]) => set.size).map(([id, set]) => [id, [...set]])));
  }
  function updateFold() {
    const anyOpen = [...els.results.querySelectorAll('.al-shelf-toggle')].some(t => t.getAttribute('aria-expanded') === 'true');
    els.fold.textContent = anyOpen ? 'Collapse all' : 'Expand all';
  }
  els.results.addEventListener('click', event => {
    const toggle = event.target.closest('.al-shelf-toggle');
    if (!toggle) return;
    setFold(toggle, toggle.getAttribute('aria-expanded') !== 'true');
    if (!filtering()) saveFolds();
    updateFold();
  });
  els.fold.addEventListener('click', () => {
    const open = els.fold.textContent === 'Expand all';
    els.results.querySelectorAll('.al-shelf-toggle').forEach(t => setFold(t, open));
    if (!filtering()) saveFolds();
    updateFold();
  });

  // Each list's illustration lives at art/<list id>.jpg and sits beside the headline; a list without one shows no
  // picture. On phones the picture moves down between the two intro paragraphs, where it reads better.
  const narrow = matchMedia('(max-width: 700px)');
  function placeArt() {
    const figure = $('al-art');
    if (narrow.matches) $('al-intro-body').querySelector('.al-intro-note').before(figure);
    else $('al-intro-head').after(figure);
  }
  narrow.addEventListener('change', placeArt);
  placeArt();
  function showArt() {
    const figure = $('al-art'), image = $('al-art-img');
    figure.classList.remove('is-shown');
    image.onload = () => { if (image.dataset.list === list.id) { figure.hidden = false; figure.classList.add('is-shown'); } };
    image.onerror = () => { figure.hidden = true; };
    image.dataset.list = list.id;
    image.src = `art/${encodeURIComponent(list.id)}.jpg`;
  }

  async function loadItems(id) {
    if (!cache[id]) {
      const data = await fetch(`${DATA}${encodeURIComponent(id)}.json`).then(r => r.json());
      data.forEach((i, n) => {
        // The data comes from another repository, so only web links are kept.
        for (const key of ['l', 'i']) if (i[key] && !/^https:\/\//.test(i[key])) delete i[key];
        i._f = i.f || []; i._id = n; i._t = titleKey(i.t); i._c = creatorKey(i.c);
        if (!shelfIndex.has(i.s)) shelfIndex.set(i.s, shelfIndex.size);
        i._h = fold([i.t, i.c, i.y, i.g, i.s, i.u, i.n, ...(i.k || [])].filter(Boolean).join(' '));
      });
      cache[id] = data;
      applyTags(id);
    }
    return cache[id];
  }

  async function selectList(id, fromUrl) {
    list = lists.find(l => l.id === id) || lists[Math.floor(Math.random() * lists.length)];
    if (!fromUrl || lists.some(l => l.id === id)) picked = true;
    if (!fromUrl) Object.assign(state, blank());
    renderTabs();
    showArt();
    els.results.dataset.cover = list.cover || 'tall';
    els.count.textContent = 'Loading the shelves…';
    items = await loadItems(list.id);
    renderControls();
    render();
    writeUrl();
  }

  // Owner mode.
  const pendingCount = () => Object.values(pending).reduce((n, marks) => n + Object.keys(marks).length, 0) +
    Object.values(pendingTags).reduce((n, tagged) => n + Object.values(tagged).reduce((m, set) => m + Object.keys(set).length, 0), 0);
  function renderOwnerBar() {
    els.ownerBar.hidden = !owner;
    if (!owner) return;
    const count = pendingCount();
    els.ownerText.textContent = count
      ? `${number(count)} ${count === 1 ? 'change is' : 'changes are'} saved in this browser and not yet on the site.`
      : 'Tick titles as you finish them, retag them or remove ones you no longer want, then send the changes to the site.';
    if (count) els.ownerText.textContent += ' Discard brings back anything you removed.';
    els.send.hidden = els.discard.hidden = !count;
    if (count) els.send.href = issueUrl();
  }
  function issueUrl() {
    const lines = [];
    for (const [listId, marks] of Object.entries(pending)) {
      const meta = lists.find(l => l.id === listId);
      for (const [key, value] of Object.entries(marks)) {
        const [title, creator] = key.split('|');
        lines.push(`- ${value === REMOVE ? 'Remove from the list' : value ? meta.doneLabel : 'Back on the list'}: ${title}${creator ? ` (${creator})` : ''}`);
      }
    }
    for (const [listId, tagged] of Object.entries(pendingTags)) {
      const meta = lists.find(l => l.id === listId);
      for (const [key, set] of Object.entries(tagged)) {
        const [title, creator] = key.split('|');
        for (const [flag, on] of Object.entries(set)) lines.push(`- ${on ? meta.flags[flag] : `Not ${meta.flags[flag].toLowerCase()}`}: ${title}${creator ? ` (${creator})` : ''}`);
      }
    }
    const marks = Object.keys(pendingTags).length ? { ...pending, tags: pendingTags } : pending;
    const body = `${lines.join('\n')}\n\nThe anti-library page wrote this issue. Submit it to update the site.\n\n\`\`\`json\n${JSON.stringify(marks)}\n\`\`\`\n`;
    const count = pendingCount();
    return `https://github.com/${REPO}/issues/new?${new URLSearchParams({ title: `Anti-library: update ${count} ${count === 1 ? 'title' : 'titles'}`, body })}`;
  }
  function setOwner(on) {
    owner = on;
    store.set(OWNER_KEY, on || null);
    if (list) { renderControls(); render(); writeUrl(); }
  }
  async function loadDigests() {
    const token = store.get(DIGESTS_TOKEN_KEY, '');
    if (!owner || !token) return;
    try {
      const get = path => fetch(`https://api.github.com/repos/${DIGESTS_REPO}/contents/${path}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.raw+json', 'X-GitHub-Api-Version': '2022-11-28' },
        cache: 'no-cache',
      });
      const [index, marks] = await Promise.all([get('index.json'), get('marks.json')]);
      if (!index.ok) return;
      const marked = marks.ok ? await marks.json() : {};
      digestLinks = {};
      for (const d of await index.json()) {
        if (d.status !== 'ready' || !/^[a-z0-9-]+$/.test(d.slug || '')) continue;
        const m = marked[d.list]?.[d.key] || {};
        (digestLinks[d.list] ??= {})[d.key] = { id: `${d.list}/${d.slug}`, read: Boolean(m.read), deeper: Boolean(m.deeper) };
      }
      if (list) render();
    } catch {}
  }
  // Drop browser-held marks the published data already matches (a removal is published once removed.json lists it).
  function prunePending() {
    for (const [listId, marks] of Object.entries(pending)) {
      for (const [key, value] of Object.entries(marks)) {
        if (value === REMOVE ? removed[listId]?.[key] : Boolean(progress[listId]?.[key]) === Boolean(value)) delete marks[key];
      }
      if (!Object.keys(marks).length) delete pending[listId];
    }
    store.set(PENDING_KEY, Object.keys(pending).length ? pending : null);
  }
  els.results.addEventListener('click', event => {
    const button = event.target.closest('.al-remove');
    if (!button || !owner) return;
    const key = button.dataset.key, item = items.find(i => itemKey(i) === key);
    const article = button.closest('.al-item');
    (pending[list.id] ??= {})[key] = REMOVE;
    if (pendingTags[list.id]) delete pendingTags[list.id][key];
    applyTags(list.id);
    prunePending();
    // The title leaves the page now; Discard brings it back until the changes are sent.
    const shelf = article.closest('.al-shelf'), next = article.nextElementSibling || article.previousElementSibling;
    visible = visible.filter(i => i !== item);
    article.remove();
    if (shelf) {
      const left = shelf.querySelectorAll('.al-item').length;
      if (left) shelf.querySelector('.al-shelf-count').textContent = number(left); else shelf.remove();
    }
    (next?.isConnected ? next : els.results).focus?.();
    updateCount();
    renderOwnerBar();
  });
  // Each owner checkbox changes one title in place: Read (or Watched, Heard) is a progress mark, the rest are tags.
  els.results.addEventListener('change', event => {
    const box = event.target.closest('.al-owner-actions input');
    if (!box || !owner) return;
    const key = box.dataset.key, flag = box.dataset.flag, item = items.find(i => itemKey(i) === key);
    if (flag) {
      ((pendingTags[list.id] ??= {})[key] ??= {})[flag] = box.checked;
      applyTags(list.id);
      renderMenus();
    } else {
      (pending[list.id] ??= {})[key] = box.checked ? new Date().toISOString().slice(0, 10) : null;
      prunePending();
    }
    $(`item-${item._id}`).outerHTML = itemHtml(item);
    $(`item-${item._id}`).querySelector(`input[data-flag="${flag || ''}"]`).focus();
    updateCount();
    renderOwnerBar();
  });
  els.owner.addEventListener('click', () => setOwner(false));

  // The spreadsheet library loads only when the owner exports.
  const loadScript = src => new Promise((resolve, reject) => {
    const script = Object.assign(document.createElement('script'), { src, onload: resolve, onerror: reject });
    document.head.append(script);
  });
  els.exportButton.addEventListener('click', async () => {
    els.exportButton.disabled = true;
    els.exportButton.textContent = 'Preparing…';
    try {
      if (!window.XLSX) await loadScript('vendor/xlsx.full.min.js');
      const book = XLSX.utils.book_new();
      for (const meta of lists) {
        const all = await loadItems(meta.id);
        const saved = list;
        list = meta;
        const rows = all.filter(i => pending[meta.id]?.[itemKey(i)] !== REMOVE).map(i => {
          const mark = pending[meta.id]?.[itemKey(i)], date = mark !== undefined ? mark : progress[meta.id]?.[itemKey(i)];
          return {
            ...(meta.groupLabel && { [meta.groupLabel]: i.g || '' }),
            [meta.shelfLabel]: i.s || '', Subsection: i.u || '', Title: i.t, [meta.creatorLabel]: i.c || '', Year: i.y || '',
            ...Object.fromEntries(Object.entries(meta.flags).map(([key, label]) => [label, i.f?.includes(key) ? 'yes' : ''])),
            Status: isDone(i) ? meta.doneLabel : 'Anti-library', [`${meta.doneLabel} on`]: date || '', Note: i.n || '', Link: i.l || '',
          };
        });
        list = saved;
        const sheet = XLSX.utils.json_to_sheet(rows);
        sheet['!autofilter'] = { ref: sheet['!ref'] };
        XLSX.utils.book_append_sheet(book, sheet, meta.label);
      }
      XLSX.writeFile(book, `anti-library-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch {
      els.ownerText.textContent = 'The spreadsheet could not be made. Reload the page and try again.';
    } finally {
      els.exportButton.disabled = false;
      els.exportButton.textContent = 'Export spreadsheet';
    }
  });
  els.discard.addEventListener('click', () => {
    pending = {}; pendingTags = {};
    store.set(PENDING_KEY, null);
    Object.keys(cache).forEach(applyTags);
    render();
  });

  // On a computer, Listen on Spotify tries the Spotify app first. If the page keeps focus (no app took over) the web
  // player opens instead, soon enough to count as the same click so pop-up blockers allow it. Phones and tablets keep
  // the plain web link, which their Spotify app already claims when it is installed.
  // Firefox shows an error page for an app link nothing handles, so it keeps the web link too.
  const desktop = !/Android|iPhone|iPad|iPod|Firefox/i.test(navigator.userAgent) && !(navigator.maxTouchPoints > 0);
  els.results.addEventListener('click', event => {
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

  // A cover that fails to load leaves the lettered placeholder showing.
  els.results.addEventListener('error', event => { if (event.target.tagName === 'IMG') event.target.remove(); }, true);

  let timer;
  els.q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = els.q.value.trim(); render(); writeUrl(); }, 120); });
  els.shelf.addEventListener('change', () => {
    const [kind, ...rest] = els.shelf.value.split(':'), value = rest.join(':');
    state.group = kind === 'part' ? value : '';
    state.shelf = kind === 'shelf' ? value : '';
    render(); writeUrl();
  });
  els.show.addEventListener('change', () => { state.only = els.show.value; render(); writeUrl(); });
  els.thread.addEventListener('change', () => { state.thread = els.thread.value; render(); writeUrl(); });
  els.sort.addEventListener('change', () => { state.sort = els.sort.value; render(); writeUrl(); });
  els.hide.addEventListener('change', () => { state.hide = els.hide.checked; render(); writeUrl(); });
  // Chips beside the count and the empty-shelf message take filters off; a tag on a title puts its filter on.
  document.querySelector('.al-browser').addEventListener('click', event => {
    const clear = event.target.closest('[data-clear]'), tag = event.target.closest('[data-only]');
    if (clear) {
      const key = clear.dataset.clear;
      if (key === 'all') Object.assign(state, blank(), { sort: state.sort });
      else if (key === 'hide') state.hide = false;
      else state[key] = '';
      renderControls(); render(); writeUrl();
      // Focus moves to the next chip, or to the search box once none are left.
      (els.applied.querySelector('button') || els.q).focus();
    } else if (tag) {
      state.only = tag.dataset.only;
      render(); writeUrl();
      // Back to the top of the results, just under the filter bar when it is pinned, so the new chip is in view.
      const controls = $('al-controls'), status = els.count.closest('.al-status');
      const style = getComputedStyle(controls);
      const pinned = style.position === 'sticky' ? controls.offsetHeight + (parseFloat(style.top) || 0) : 0;
      scrollTo({ top: status.getBoundingClientRect().top + scrollY - pinned, behavior: 'instant' });
      els.applied.querySelector(`[data-clear=only]`)?.focus({ preventScroll: true });
    }
  });
  els.random.addEventListener('click', () => {
    // Finished titles are skipped unless nothing else is left in view.
    const pool = visible.filter(i => !isDone(i)).length ? visible.filter(i => !isDone(i)) : visible;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    document.querySelectorAll('.al-picked').forEach(el => el.classList.remove('al-picked'));
    const el = $(`item-${pick._id}`);
    const shelf = el.closest('.al-list');
    if (shelf?.hidden) { setFold(els.results.querySelector(`[aria-controls="${shelf.id}"]`), true); if (!filtering()) saveFolds(); updateFold(); }
    el.classList.add('al-picked');
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
  });
  els.tabs.addEventListener('click', event => {
    const tab = event.target.closest('[role=tab]');
    if (tab && tab.dataset.id !== list.id) selectList(tab.dataset.id);
  });
  els.tabs.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...els.tabs.querySelectorAll('[role=tab]')];
    const at = tabs.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (at + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    selectList(tabs[next].dataset.id).then(() => $(`al-tab-${tabs[next].dataset.id}`).focus());
  });

  readUrl();
  const ownerParam = new URLSearchParams(location.search).get('owner');
  if (ownerParam) store.set(OWNER_KEY, ownerParam === 'on' || null);
  owner = store.get(OWNER_KEY, false) === true;
  pending = store.get(PENDING_KEY, {});
  pendingTags = store.get(TAGS_KEY, {}) || {};
  opened = Object.fromEntries(Object.entries(store.get(OPENED_KEY, {}) || {}).filter(([, v]) => Array.isArray(v)).map(([id, v]) => [id, new Set(v)]));
  Promise.all([
    fetch(`${DATA}lists.json`).then(r => r.json()),
    fetch(`${DATA}progress.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : {})).catch(() => ({})),
    fetch(`${DATA}removed.json`, { cache: 'no-store' }).then(r => (r.ok ? r.json() : {})).catch(() => ({})),
  ]).then(([data, done, gone]) => {
    lists = data.filter(l => /^https:\/\//.test(l.search));
    lists.forEach(l => { if (l.listen && !/^https:\/\//.test(l.listen)) delete l.listen; });
    progress = done; removed = gone; prunePending(); loadDigests(); return selectList(state.list, true);
  }).catch(() => { els.count.textContent = 'The shelves could not be loaded. Try refreshing the page.'; });
})();
