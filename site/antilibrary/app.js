// The anti-library browser. The lists live in the jfricano/anti-lib repository, which builds them into
// JSON; the page reads lists.json, one <id>.json per list and progress.json from there (the data-source
// attribute on <main>), so list changes show up without redeploying this site.
// Owner mode (turned on by visiting ?owner=on, never linked from the page) adds a mark button
// to each title and a spreadsheet export. Marks wait in this browser until the owner saves them as a
// GitHub issue (opened through the API with the owner's key, or as a prefilled link without one); a
// repository workflow applies issues opened by the owner to its progress.json.
(() => {
  const REPO = 'jfricano/anti-lib';
  // Digests live in a private repository; in owner mode, a browser holding the digests page's
  // read-only key also links each title that has a finished digest and shows its digest marks.
  const DIGESTS_REPO = 'jfricano/reading-list', DIGESTS_TOKEN_KEY = 'digests-token', DIGEST_MARKS_KEY = 'digests-pending-marks';
  // Two private marks live with the digests: Digested and Fully read (watched, heard). The public page only ever
  // shows a title crossed off. A book comes off when it is digested or fully read; a film, show or album only when
  // it is fully watched or heard, since a digest doesn't stand in for it.
  const FULLY = { books: 'Fully read', films: 'Fully watched', tv: 'Fully watched', albums: 'Fully heard' };
  const fullyLabel = id => FULLY[id] || FULLY.books;
  const digestCounts = id => id === 'books';
  const DATA = document.getElementById('main').dataset.source;
  const OWNER_KEY = 'antilibrary-owner-mode', PENDING_KEY = 'antilibrary-pending-marks', TAGS_KEY = 'antilibrary-pending-tags', OPENED_KEY = 'antilibrary-opened';
  const $ = id => document.getElementById(id);
  const els = {
    tabs: $('al-tabs'), q: $('al-q'), controls: $('al-controls'), filtersToggle: $('al-filters-toggle'),
    shelfMenu: $('al-shelf-menu'), shelf: $('al-shelf-panel'), show: $('al-show-panel'), showMenu: $('al-show-menu'), showField: $('al-show-field'),
    thread: $('al-thread'), threadField: $('al-thread-field'), sort: $('al-sort'), count: $('al-count'), applied: $('al-applied'), results: $('al-results'), random: $('al-random'),
    hide: $('al-hide'), hideLabel: $('al-hide-label'), fold: $('al-fold'),
    owner: $('al-owner'), ownerBar: $('al-owner-bar'), ownerText: $('al-owner-text'), save: $('al-save'), send: $('al-send'), sendMarks: $('al-send-marks'), discard: $('al-discard'),
    exportButton: $('al-export'),
  };
  const cache = {};
  let lists = [], list = null, items = [], visible = [];
  let progress = {}, removed = {}, pending = {}, pendingTags = {}, owner = false, picked = false, digestLinks = {}, digestMarks = {};
  // Paths: an order through one artist's albums (artist.html), one author's books (author.html) or one director's films
  // (director.html). They aren't shelves and have no rows: every step is a title on its own shelf. Each list with paths
  // gets an unnumbered Paths aside above its shelves, and every title by a path's artist, author or director links to the
  // path under the name.
  const PATHS = {
    albums: { file: 'paths.json', page: 'artist.html', who: 'artist', label: 'Artist path', heading: 'Artist paths',
      lede: 'Not a shelf. A listening order for each artist worth going deep on, through albums already on these shelves.' },
    books: { file: 'author-paths.json', page: 'author.html', who: 'author', label: 'Author path', heading: 'Author paths',
      lede: 'Not a shelf. A reading order for each author worth going deep on, through books already on these shelves.' },
    films: { file: 'director-paths.json', page: 'director.html', who: 'director', label: 'Director path', heading: 'Director paths',
      lede: 'Not a shelf. A viewing order for each director worth going deep on, through films already on these shelves.' },
  };
  const paths = {};
  const pathFor = i => paths[list.id]?.byName.get(fold(i.c || '')) || null;
  // A path is done (fully heard, read or watched) once every title on its main line is crossed off, published or waiting in
  // this browser; it can't be ticked on its own. A work read inside a book on the list (v) counts with that book.
  const pathDone = (p, id) => p.records.filter(r => r.p).every(r => {
    if (r.d) return true;
    const key = `${r.v || r.t}|${r.c}`, mark = pending[id]?.[key];
    return Boolean(mark !== undefined && mark !== REMOVE ? mark : progress[id]?.[key]);
  });
  // Shelves start folded, so a list opens as its table of contents. Shelves opened while browsing are remembered in
  // this browser per list; while a search, shelf or filter is on, every shelf with matches opens instead, and folds
  // made then last only until the filters change.
  let opened = {}, foldedNow = new Set();
  const filtering = () => Boolean(state.q || state.only.length || state.thread || state.shelves.length || (owner && state.hide));
  const isOpen = shelf => (filtering() ? !foldedNow.has(shelf) : Boolean(opened[list.id]?.has(shelf)));
  // Shelves and tags are sets of choices: none chosen means all. A title shows when it is on any chosen shelf and has
  // any chosen tag.
  const blank = () => ({ q: '', shelves: [], sort: 'shelf', only: [], thread: '', hide: false });
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
  // in i._f until they are sent, so the tags, Tags menu and counts all read the same i.f.
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
  // Digest marks: published ones from marks.json, overridden by any still waiting in this browser. The waiting ones
  // share the digests page's store, so a mark made on either page is sent from either.
  const digestPending = () => store.get(DIGEST_MARKS_KEY, {}) || {};
  const markUnsent = (i, mark) => Boolean(owner && mark in (digestPending()[list.id]?.[itemKey(i)] || {}));
  const markOf = (i, mark, id = list.id) => {
    const waiting = digestPending()[id]?.[itemKey(i)];
    return Boolean(waiting && mark in waiting ? waiting[mark] : digestMarks[id]?.[itemKey(i)]?.[mark]);
  };
  // A title crossed off before the digest marks existed counts as fully read unless it is marked digested.
  const isFully = i => (digestLinks[list.id]?.[itemKey(i)] ? markOf(i, 'deeper') || (isDone(i) && !(digestCounts(list.id) && markOf(i, 'read'))) : isDone(i));
  const isDone = i => {
    const mark = pendingFor(i);
    return Boolean(i.d || (mark !== undefined && mark !== REMOVE ? mark : progress[list.id]?.[itemKey(i)]));
  };
  // Flags such as "Start here" are Jason's own and only show in owner mode. Of the flags a visitor sees, the ones
  // that are not private filters make up the Tags menu, and their tags on each title apply the same filter.
  const shownFlags = () => Object.entries(list.flags).filter(([key]) => owner || !(list.privateFlags || []).includes(key));
  const filterFlags = () => shownFlags().filter(([key]) => owner || !(list.privateFilters || []).includes(key));
  // Dates: y is first publication or release (for ancient works, when written; BCE is negative) and w, on a few books,
  // the year written where that is far off. A title without a date sorts after the dated ones either way.
  const NO_DATE = 1e5;
  const year = i => i.y ?? NO_DATE, written = i => i.w ?? i.y ?? NO_DATE;
  const fmtYear = y => (y < 0 ? `c. ${-y} BCE` : String(y));
  const SORTS = {
    shelf: { label: () => 'Shelf order' },
    title: { label: () => 'Title A–Z', cmp: (a, b) => a._t.localeCompare(b._t) },
    // Each creator's titles run oldest first, and a heavier rule marks where the next creator starts.
    creator: { label: l => `${l.creatorLabel} A–Z`, cmp: (a, b) => a._c.localeCompare(b._c) || year(a) - year(b) || a._t.localeCompare(b._t) },
    oldest: { label: l => `${l.dateLabel || 'Year'}, oldest first`, year: true, cmp: (a, b) => year(a) - year(b) || a._t.localeCompare(b._t) },
    newest: { label: l => `${l.dateLabel || 'Year'}, newest first`, year: true, cmp: (a, b) => (b.y ?? -NO_DATE) - (a.y ?? -NO_DATE) || a._t.localeCompare(b._t) },
    written: { label: () => 'Written, oldest first', written: true, cmp: (a, b) => written(a) - written(b) || a._t.localeCompare(b._t) },
    'written-newest': { label: () => 'Written, newest first', written: true, cmp: (a, b) => (b.w ?? b.y ?? -NO_DATE) - (a.w ?? a.y ?? -NO_DATE) || a._t.localeCompare(b._t) },
  };
  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  };

  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.list = p.get('list') || '';
    state.q = p.get('q') || '';
    urlShelves = p.getAll('shelf').filter(Boolean);
    state.shelves = [];
    urlPart = urlShelves.length ? '' : p.get('part') || '';
    state.sort = SORTS[p.get('sort')] ? p.get('sort') : 'shelf';
    state.only = p.getAll('only').flatMap(v => v.split(',')).filter(Boolean);
    state.thread = p.get('thread') || '';
    state.hide = p.get('hide') === '1';
  }
  // Shelves go in the address by number (?shelf=01,04), or as ?part= when they are exactly one part's shelves; the
  // list resolves them once it loads. A shelf named in full (older links) still works.
  let urlPart = '', urlShelves = [];
  function resolveUrlShelves() {
    const all = unique(items.map(i => i.s));
    if (urlPart) state.shelves = unique(items.filter(i => i.g === urlPart).map(i => i.s));
    else if (urlShelves.length) state.shelves = unique(urlShelves.flatMap(value => (all.includes(value) ? [value]
      : value.split(',').map(v => all.find(shelf => shelf === v || splitShelf(shelf)[0] === v.padStart(2, '0'))))));
    urlPart = ''; urlShelves = [];
  }
  function shelvesParam(p) {
    if (!state.shelves.length) return;
    const chosen = new Set(state.shelves), parts = unique(items.map(i => i.g));
    const part = parts.find(g => { const names = unique(items.filter(i => i.g === g).map(i => i.s)); return names.length === chosen.size && names.every(n => chosen.has(n)); });
    if (part) p.set('part', part);
    else p.set('shelf', state.shelves.map(shelf => splitShelf(shelf)[0] || shelf).join(','));
  }
  // Switching lists, shelves or a thread is a step the Back button undoes (push); search, tags and sort just update
  // the address in place, so Back doesn't have to walk through every keystroke.
  function writeUrl(push = false) {
    const p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (list) shelvesParam(p);
    if (state.sort !== 'shelf') p.set('sort', state.sort);
    if (state.only.length) p.set('only', state.only.join(','));
    if (state.thread) p.set('thread', state.thread);
    if (owner && state.hide) p.set('hide', '1');
    // A visit with no list in the URL opens a random one. The list goes into the URL once someone
    // picks a tab or narrows the view, so a shared link opens the same list.
    if (list && (picked || p.size)) p.set('list', list.id);
    const query = p.toString(), url = query ? `?${query}` : location.pathname;
    try { push && (query ? `?${query}` : '') !== location.search ? history.pushState(null, '', url) : history.replaceState(null, '', url); } catch {}
  }

  // Threads are named paths through titles on the list; picking one shows its titles in path order.
  const threadOf = id => (list.threads || []).find(t => t.id === id);
  const unique = values => [...new Set(values.filter(Boolean))];
  const shelfName = shelf => splitShelf(shelf)[1] || 'Unshelved';
  // Menu choices carry their counts; the chosen one and the "none" choice leave it off, since the count line says it.
  const option = (value, text, n, current) => value === current || !value
    ? `<option value="${esc(value)}"${value === current ? ' selected' : ''}>${esc(text)}</option>`
    : `<option value="${esc(value)}"${n === 0 ? ' disabled' : ''}>${esc(text)}${n === null ? '' : ` (${number(n)})`}</option>`;
  // A checkbox in the Shelves or Tags menu, with what it would show beside it. One that would show nothing is greyed
  // out unless it's already on, so it can always be taken off.
  const box = (attr, value, text, n, on, cls = '') => `<label class="al-menu-item${cls}"><input type="checkbox" ${attr}="${esc(value)}"${on ? ' checked' : ''}${n || on ? '' : ' disabled'}>` +
    `<span>${esc(text)}</span><span class="al-menu-n">${number(n)}</span></label>`;
  const toggleIn = (values, value, on) => (on ? unique([...values, value]) : values.filter(v => v !== value));

  function renderTabs() {
    els.tabs.innerHTML = lists.map(l => `<button type="button" role="tab" id="al-tab-${esc(l.id)}" data-id="${esc(l.id)}" aria-controls="al-results" aria-selected="${l === list}" tabindex="${l === list ? 0 : -1}">${esc(l.label)} <span>${number(l.count)}</span></button>`).join('');
    els.results.setAttribute('role', 'tabpanel');
    els.results.setAttribute('aria-labelledby', `al-tab-${list.id}`);
  }

  // Checks run once per list change: drop filters the list (or the visitor) cannot use, then build the sort menu.
  function renderControls() {
    resolveUrlShelves();
    state.shelves = state.shelves.filter(shelf => items.some(i => i.s === shelf));
    state.only = state.only.filter(flag => filterFlags().some(([key]) => key === flag));
    if (state.thread && !threadOf(state.thread)) state.thread = '';
    if (!owner) state.hide = false;
    const sorts = Object.entries(SORTS).filter(([, s]) => (!s.year || list.hasYear) && (!s.written || list.hasWritten));
    if (!sorts.some(([key]) => key === state.sort)) state.sort = 'shelf';
    els.sort.innerHTML = sorts.map(([key, s]) => `<option value="${key}"${key === state.sort ? ' selected' : ''}>${esc(s.label(list))}</option>`).join('');
    els.hide.checked = state.hide;
    els.hideLabel.textContent = 'Hide crossed off';
    els.q.value = state.q;
  }

  // The Shelves and Tags menus count what each choice would show alongside the other filters in use, the way the
  // shelf headings below count their titles. Shelves are grouped by part, and a part's box picks all of its shelves.
  function renderMenus() {
    const others = items.filter(i => matches(i, 'shelf')), byFlag = items.filter(i => matches(i, 'only'));
    const shelves = new Map(), parts = new Map();
    for (const i of items) {
      if (!parts.has(i.g || '')) parts.set(i.g || '', []);
      if (!shelves.has(i.s)) { shelves.set(i.s, 0); parts.get(i.g || '').push(i.s); }
    }
    for (const i of others) shelves.set(i.s, shelves.get(i.s) + 1);
    const chosen = new Set(state.shelves);
    let html = `<p class="al-menu-head"><button type="button" class="al-link" data-menu-all="shelves"${chosen.size ? '' : ' disabled'}>Clear</button></p>`;
    for (const [part, names] of parts) {
      const rows = names.map(name => box('data-shelf', name, shelfName(name), shelves.get(name), chosen.has(name), part ? ' al-menu-sub' : '')).join('');
      const n = names.reduce((sum, name) => sum + shelves.get(name), 0);
      html += part ? `<div class="al-menu-group" role="group" aria-label="${esc(part)}">${box('data-part', part, part, n, names.every(name => chosen.has(name)), ' al-menu-part')}${rows}</div>` : rows;
    }
    keepFocus(els.shelf, () => { els.shelf.innerHTML = html; });
    for (const input of els.shelf.querySelectorAll('[data-part]')) {
      const names = parts.get(input.dataset.part);
      input.indeterminate = !input.checked && names.some(name => chosen.has(name));
    }
    const whole = [...parts].find(([part, names]) => part && names.length === chosen.size && names.every(name => chosen.has(name)));
    els.shelfMenu.querySelector('summary').textContent = !chosen.size ? 'All shelves' : chosen.size === 1 ? shelfName(state.shelves[0])
      : whole ? whole[0] : `${chosen.size} shelves`;

    const flags = filterFlags();
    els.showField.hidden = !flags.length;
    keepFocus(els.show, () => {
      els.show.innerHTML = `<p class="al-menu-head"><button type="button" class="al-link" data-menu-all="tags"${state.only.length ? '' : ' disabled'}>Clear</button></p>` +
        flags.map(([key, label]) => box('data-flag', key, label, byFlag.filter(i => i.f && i.f.includes(key)).length, state.only.includes(key))).join('');
    });
    els.showMenu.querySelector('summary').textContent = !state.only.length ? 'All tags' : state.only.length === 1 ? list.flags[state.only[0]] : `${state.only.length} tags`;

    // Paths: the list's threads, which narrow the page to one route in order, and the artist, author or director paths,
    // which each have a page of their own.
    const threads = list.threads || [], byThread = items.filter(i => matches(i, 'thread'));
    const kind = PATHS[list.id], people = (kind && paths[list.id]?.all) || [];
    els.threadField.hidden = !threads.length && !people.length;
    els.thread.innerHTML = option('', 'No path', 0, state.thread) +
      (threads.length ? `<optgroup label="Threads">${threads.map(t => option(t.id, t.name, byThread.filter(i => i.th && i.th[t.id]).length, state.thread)).join('')}</optgroup>` : '') +
      (people.length ? `<optgroup label="${esc(kind.heading)}">${people.map(p => option(`path:${p.id}`, `${p[kind.who]} →`, null, state.thread)).join('')}</optgroup>` : '');
    updateFiltersToggle();
  }
  // Redrawing a menu while someone is ticking boxes in it keeps focus on the same box.
  function keepFocus(panel, draw) {
    const active = panel.contains(document.activeElement) ? document.activeElement : null;
    const attr = active && ['data-shelf', 'data-part', 'data-flag', 'data-menu-all'].find(a => active.hasAttribute(a));
    const value = attr && active.getAttribute(attr);
    draw();
    if (attr) [...panel.querySelectorAll(`[${attr}]`)].find(el => el.getAttribute(attr) === value)?.focus();
  }

  // Tags in use show as chips that take themselves off, since several can be on at once and each is easy to lose
  // track of. Shelves and the path say what is chosen in their own menus. Clear filters takes everything off.
  function renderApplied() {
    const chips = state.only.map(flag => [`only:${flag}`, list.flags[flag]]);
    const any = filtering();
    els.applied.hidden = !any;
    els.applied.innerHTML = chips.map(([key, text]) =>
      `<li><button type="button" class="al-chip" data-clear="${esc(key)}" aria-label="Remove tag: ${esc(text)}">${esc(text)}<span aria-hidden="true">×</span></button></li>`).join('') +
      (any ? '<li><button type="button" class="al-link" data-clear="all">Clear filters</button></li>' : '');
  }
  // On phones the menus fold behind one Filters button, which says how many are in use.
  function updateFiltersToggle() {
    const n = (state.shelves.length ? 1 : 0) + state.only.length + (state.thread ? 1 : 0) + (state.sort !== 'shelf' ? 1 : 0);
    els.filtersToggle.textContent = n ? `Filters and sort (${n})` : 'Filters and sort';
  }

  function matches(i, skip) {
    return !(owner && isRemoving(i)) &&
      (skip === 'shelf' || !state.shelves.length || state.shelves.includes(i.s)) &&
      (skip === 'only' || !state.only.length || Boolean(i.f && state.only.some(flag => i.f.includes(flag)))) &&
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
    const by = [i.c, i.y != null && (i.w != null ? `${fmtYear(i.y)}, written ${fmtYear(i.w)}` : fmtYear(i.y))].filter(Boolean).map(esc).join(' · ');
    const where = [];
    if ((state.sort !== 'shelf' || state.thread) && i.s) where.push(splitShelf(i.s)[1]);
    if (i.u) where.push(i.u);
    const done = isDone(i);
    const href = i.l || `${list.search}${encodeURIComponent([i.t, i.c, list.searchSuffix].filter(Boolean).join(' '))}`, away = ' target="_blank" rel="noopener noreferrer"';
    const visibleFlags = new Set(shownFlags().map(([key]) => key)), filters = new Set(filterFlags().map(([key]) => key));
    // A title by an artist, author or director with a path links to it under the name, where it's easy to find, not with the tags.
    const path = pathFor(i), kind = PATHS[list.id];
    const pathLink = path ? `<p class="al-path-link"><a class="al-tag al-tag-path" href="${esc(`${kind.page}?a=${encodeURIComponent(path.id)}`)}">${esc(kind.label)} →</a></p>` : '';
    const tags = (i.f || []).filter(f => visibleFlags.has(f)).map(f => filters.has(f)
      ? `<li><button type="button" class="al-tag al-tag-${esc(f)}" data-only="${esc(f)}" title="Show only ${esc(list.flags[f].toLowerCase())}">${esc(list.flags[f])}</button></li>`
      : `<li class="al-tag al-tag-${esc(f)}">${esc(list.flags[f])}</li>`);
    const digest = owner ? digestLinks[list.id]?.[itemKey(i)] : null;
    // Books show Digested as a checkbox; elsewhere a digest doesn't cross a title off, so it stays a note.
    if (digest && !digestCounts(list.id) && markOf(i, 'read')) tags.push('<li class="al-tag al-tag-digested">Digested</li>');
    const cover = i.i ? `<img src="${esc(i.i)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '';
    const genres = i.k ? `<p class="al-genres">${i.k.map(esc).join(' · ')}</p>` : '';
    const extra = [list.listen && `<a class="al-listen" href="${esc(list.listen + encodeURIComponent([i.t, i.c].filter(Boolean).join(' ')))}" data-app="spotify:search:${esc(encodeURIComponent([i.t, i.c].filter(Boolean).join(' ')))}" target="_blank" rel="noopener noreferrer">Listen on Spotify ↗</a>`,
      digest?.id && `<a class="al-digest" href="../digests/#${esc(digest.id)}" target="_blank" rel="noopener">${markOf(i, 'read') ? 'Reread digest' : 'Read digest'} ↗</a>`].filter(Boolean);
    const step = state.thread && i.th?.[state.thread]?.[1];
    const more = extra.length ? `<p class="al-more">${extra.join('')}</p>` : '';
    const key = esc(itemKey(i)), tagged = pendingTags[list.id]?.[itemKey(i)] || {};
    const toggle = (flag, text, on, unsent, attrs = '') => `<label class="al-toggle${unsent ? ' al-unsent' : ''}"${attrs}>` +
      `<input type="checkbox" data-key="${key}" data-flag="${flag}"${on ? ' checked' : ''}${attrs ? ' disabled' : ''}><span>${esc(text)}</span></label>`;
    const marks = (digest && digestCounts(list.id) ? toggle('digest:read', 'Digested', markOf(i, 'read'), markUnsent(i, 'read')) : '') +
      toggle(digest ? 'digest:deeper' : '', fullyLabel(list.id), isFully(i), digest ? markUnsent(i, 'deeper') : pendingFor(i) !== undefined,
        i.d ? ' title="Marked in the source list"' : '');
    // Progress (Digested, Fully read) comes first; the few tags owner mode can change (list.toggles, Formative on
    // books) follow behind a rule. Every other tag is edited in the source lists.
    const tagBoxes = (list.toggles || []).map(flag => toggle(esc(flag), list.flags[flag], i.f?.includes(flag), flag in tagged)).join('');
    const mark = owner ? `<div class="al-owner-actions"><span class="al-owner-group" role="group" aria-label="Progress">${marks}</span>` +
      (tagBoxes ? `<span class="al-owner-group al-owner-tags" role="group" aria-label="Tags">${tagBoxes}</span>` : '') +
      `<button type="button" class="al-remove" data-key="${key}">Remove</button></div>` : '';
    return `<article class="al-item${done ? ' al-done' : ''}" id="item-${i._id}" tabindex="-1">` +
      `<a class="al-cover" href="${esc(href)}"${away} tabindex="-1" aria-hidden="true"><span>${esc(i.t.replace(/^(the|a|an)\s+/i, '').charAt(0))}</span>${cover}</a>` +
      `<div class="al-item-head"><div class="al-ident"><h3><a href="${esc(href)}"${away}${i.l ? '' : ' title="Search for this title"'}>${esc(i.t)}<span class="al-ext" aria-hidden="true"> ↗</span></a></h3>${by ? `<p class="al-by">${by}</p>` : ''}</div>${pathLink}${genres}${more}${mark}</div>` +
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
      (finished ? `, ${number(finished)} crossed off.` : '.');
  }

  function render() {
    filter();
    updateCount();
    renderMenus();
    renderApplied();
    els.random.disabled = !visible.length;
    foldedNow = new Set();
    renderOwnerBar();
    els.fold.hidden = !visible.length || state.sort !== 'shelf' || state.shelves.length === 1 || Boolean(state.thread);
    if (!visible.length) {
      els.results.innerHTML = `<div class="al-empty"><p>Nothing on these shelves matches. Try fewer words, or start over.</p><button type="button" class="al-button al-quiet" data-clear="all">Clear all filters</button></div>`;
      return;
    }
    if (state.thread) {
      const thread = threadOf(state.thread);
      els.results.innerHTML = `<header class="al-thread-head"><div class="al-thread-text"><p class="label">Thread · ${number(thread.count)} stops</p><h2>${esc(thread.name)}</h2>` +
        `${thread.why ? `<p>${esc(thread.why)}</p>` : ''}<p class="al-thread-out"><button type="button" class="al-link" data-clear="thread">Leave this thread</button></p></div>` +
        `<figure class="al-thread-art"><img src="../assets/lavender-thread.jpg" alt="" width="1536" height="1024" decoding="async" onerror="this.parentNode.hidden=true"></figure></header><div class="al-list al-thread-list">${visible.map(itemHtml).join('')}</div>`;
      return;
    }
    if (state.sort !== 'shelf') {
      // By creator, each new name starts under a heavier rule; there are too many one-title creators for headings.
      const rows = visible.map((i, n) => (state.sort === 'creator' && n && visible[n - 1]._c !== i._c
        ? itemHtml(i).replace('<article class="al-item', '<article class="al-item al-creator-start') : itemHtml(i)));
      els.results.innerHTML = `<div class="al-list${state.sort === 'creator' ? ' al-by-creator' : ''}">${rows.join('')}</div>`;
      return;
    }
    const groups = new Map();
    for (const i of visible) {
      if (!groups.has(i.s)) groups.set(i.s, []);
      groups.get(i.s).push(i);
    }
    let html = filtering() ? '' : pathsAside() + threadsAside(), part = null;
    for (const [shelf, rows] of groups) {
      const g = rows[0].g;
      if (g && g !== part) { html += `<p class="al-part label">${esc(g)}</p>`; part = g; }
      const [num, name] = splitShelf(shelf);
      const n = shelfIndex.get(shelf), open = isOpen(shelf);
      html += `<section class="al-shelf"><h2><button type="button" class="al-shelf-toggle" aria-expanded="${open}" aria-controls="al-shelf-${n}" data-shelf="${esc(shelf)}">` +
        `<span class="index">${esc(num)}</span><span class="al-shelf-name">${esc(name || 'Unshelved')}</span><span class="al-shelf-count">${number(rows.length)}</span><span class="al-fold-mark" aria-hidden="true"></span></button></h2>` +
        `<div class="al-list" id="al-shelf-${n}"${open ? '' : ' hidden'}>${rows.map(itemHtml).join('')}</div></section>`;
    }
    els.results.innerHTML = html;
    updateFold();
  }

  // The Paths aside sits above the shelves, outside their numbering, and folds like a shelf. It names everyone with a path;
  // a name is struck through once the path is fully heard, read or watched. It shows only while nothing narrows the list.
  function pathsAside() {
    const kind = PATHS[list.id], all = paths[list.id]?.all || [];
    if (!all.length) return '';
    const open = isOpen(PATHS_FOLD);
    const names = all.map(p => {
      const done = pathDone(p, list.id);
      return `<li${done ? ' class="al-done"' : ''}><a href="${esc(`${kind.page}?a=${encodeURIComponent(p.id)}`)}"${done ? ` title="${fullyLabel(list.id)}"` : ''}>${esc(p[kind.who])}</a></li>`;
    }).join('');
    return `<aside class="al-shelf al-paths" aria-label="${esc(kind.heading)}"><h2><button type="button" class="al-shelf-toggle" aria-expanded="${open}" aria-controls="al-paths" data-shelf="${PATHS_FOLD}">` +
      `<span class="al-shelf-name">${esc(kind.heading)}</span><span class="al-shelf-count">${number(all.length)}</span><span class="al-fold-mark" aria-hidden="true"></span></button></h2>` +
      `<div class="al-paths-body" id="al-paths"${open ? '' : ' hidden'}><p class="al-paths-lede">${esc(kind.lede)} <a href="${kind.page}">See every path →</a></p>` +
      `<ul class="al-paths-names">${names}</ul></div></aside>`;
  }
  const PATHS_FOLD = '(paths)';

  // Threads sit with the paths above the shelves: named routes through titles already on the list. Picking one shows
  // its stops in order, the same as picking it from the Paths menu.
  function threadsAside() {
    const threads = list.threads || [];
    if (!threads.length) return '';
    const open = isOpen(THREADS_FOLD);
    const names = threads.map(t => `<li><button type="button" data-thread="${esc(t.id)}"${t.why ? ` title="${esc(t.why)}"` : ''}>${esc(t.name)} <span>${number(t.count)}</span></button></li>`).join('');
    return `<aside class="al-shelf al-paths al-threads" aria-label="Threads"><h2><button type="button" class="al-shelf-toggle" aria-expanded="${open}" aria-controls="al-threads" data-shelf="${THREADS_FOLD}">` +
      `<span class="al-shelf-name">Threads</span><span class="al-shelf-count">${number(threads.length)}</span><span class="al-fold-mark" aria-hidden="true"></span></button></h2>` +
      `<div class="al-paths-body" id="al-threads"${open ? '' : ' hidden'}><p class="al-paths-lede">Not a shelf. Routes through titles already on these shelves, each in its own order with a line on why each stop comes where it does.</p>` +
      `<ul class="al-paths-names">${names}</ul></div></aside>`;
  }
  const THREADS_FOLD = '(threads)';

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

  // Each list's illustration lives at art/<list id>.jpg and sits small at the end of the tab row; a list without one
  // shows no picture there. The combined still life beside the headline is static markup.
  function showArt() {
    const figure = $('al-medium'), image = $('al-medium-img');
    figure.classList.remove('is-shown');
    image.onload = () => { if (image.dataset.list === list.id) { figure.hidden = false; figure.classList.add('is-shown'); } };
    image.onerror = () => { figure.hidden = true; };
    image.dataset.list = list.id;
    image.src = `art/${encodeURIComponent(list.id)}.jpg`;
  }

  // In owner mode with a key, the published data is read through the GitHub API, which is current the moment a save
  // lands; the raw files everyone else reads can lag a few minutes behind.
  async function getData(name) {
    if (owner && token()) {
      const response = await github(`${REPO}/contents/data/${name}`, { headers: { Accept: 'application/vnd.github.raw+json' } }).catch(() => null);
      if (response?.ok) return response.json();
    }
    const response = await fetch(`${DATA}${name}`, { cache: 'no-store' });
    if (!response.ok) throw Error(`${name} could not be loaded`);
    return response.json();
  }
  async function loadItems(id) {
    if (!cache[id]) {
      const data = await getData(`${encodeURIComponent(id)}.json`);
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

  // A list's paths load with it, once; a list whose paths can't be read just has none.
  async function loadPaths(id) {
    const kind = PATHS[id];
    const all = await fetch(`${DATA}${kind.file}`).then(r => (r.ok ? r.json() : [])).catch(() => []);
    const byName = new Map();
    for (const p of all) for (const name of [p[kind.who], ...(p.names || [])]) byName.set(fold(name), p);
    paths[id] = { all, byName };
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
    if (PATHS[list.id] && !paths[list.id]) await loadPaths(list.id);
    renderControls();
    render();
    writeUrl(!fromUrl);
    restoreScroll();
  }

  // Coming back from an artist, author or director page (or any page) lands where the visitor left the list, once the shelves are drawn.
  const SCROLL_KEY = 'antilibrary-scroll';
  addEventListener('pagehide', () => { try { sessionStorage.setItem(SCROLL_KEY, JSON.stringify({ href: location.href, y: scrollY })); } catch {} });
  function restoreScroll() {
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(SCROLL_KEY)); sessionStorage.removeItem(SCROLL_KEY); } catch {}
    if (saved?.href === location.href && saved.y > 0) scrollTo(0, saved.y);
  }

  // Owner mode.
  // Changes wait in this browser until they are saved. With the digests key extended to write issues (Issues: Read
  // and write on anti-lib and reading-list), Save opens the issues itself through the GitHub API, watches the
  // workflows close them and reloads the data. Without it, the page falls back to prefilled issue links, split into
  // parts since GitHub turns away links much past 8,000 characters. A unit is [line, path into the json, value].
  const MAX_URL = 7000, MAX_BODY = 60000;
  // A unit counts as sent once its issue is opened, so it isn't sent twice while the site catches up. If the site
  // still hasn't applied it after SENT_WAIT (a link's issue was never submitted), it's back.
  const SENT_KEY = 'antilibrary-sent', SAVING_KEY = 'antilibrary-saving', SENT_WAIT = 20 * 60 * 1000;
  const sentAt = () => Object.fromEntries(Object.entries(store.get(SENT_KEY, {}) || {}).filter(([, at]) => Date.now() - at < SENT_WAIT));
  const markSent = (ids, on = true) => {
    const sent = sentAt();
    for (const id of ids) if (on) sent[id] = Date.now(); else delete sent[id];
    store.set(SENT_KEY, Object.keys(sent).length ? sent : null);
  };
  const partIds = new WeakMap();
  const SITE_FOOTER = 'The anti-library page wrote this issue. Submit it to update the site.';
  const MARKS_FOOTER = 'The anti-library page wrote this issue. Submit it to update the marks.';
  const newIssueUrl = (repo, part) => `https://github.com/${repo}/issues/new?${new URLSearchParams({ title: part.title, body: part.body })}`;
  function issueParts(repo, prefix, noun, all, footer, tooBig) {
    const sent = sentAt(), unitId = ([, keys, value]) => JSON.stringify([repo, ...keys, value]);
    const units = all.filter(u => !sent[unitId(u)]);
    const build = (chunk, part) => {
      const data = {};
      for (const [, keys, value] of chunk) keys.slice(0, -1).reduce((o, k) => (o[k] ??= {}), data)[keys.at(-1)] = value;
      const body = `${chunk.map(u => u[0]).join('\n')}\n\n${footer}\n\n\`\`\`json\n${JSON.stringify(data)}\n\`\`\`\n`;
      return { repo, title: `${prefix}: update ${chunk.length} ${chunk.length === 1 ? noun : `${noun}s`}${part}`, body, ids: chunk.map(unitId) };
    };
    const parts = [];
    let chunk = [];
    for (const unit of units) {
      if (chunk.length && tooBig(build([...chunk, unit], ' (part 10 of 10)'))) { parts.push(chunk); chunk = []; }
      chunk.push(unit);
    }
    if (chunk.length) parts.push(chunk);
    const built = parts.map((c, i) => build(c, parts.length > 1 ? ` (part ${i + 1} of ${parts.length})` : ''));
    built.waiting = all.length - units.length;
    return built;
  }
  // Without a key, a batch goes as one prefilled link. To fit, the issue's json names each title by an 8-character
  // code (a hash of "title|creator") grouped under its list and value, which the workflows match back against the
  // list data: {"v":2,"m":{list:{value:codes}},"t":{list:{flag:{"1"|"0":codes}}}}. That holds MAX_LINK_CHANGES
  // with room to spare; owner mode stops new marks at that count until they're sent.
  const MAX_LINK_CHANGES = 500, CODE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  function shortKey(key) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < key.length; i++) { const ch = key.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    let n = 4294967296 * (2097151 & h2) + (h1 >>> 0), code = '';
    for (let i = 0; i < 8; i++) { code += CODE[n % 64]; n = Math.floor(n / 64); }
    return code;
  }
  function linkPart(repo, prefix, noun, all, footer) {
    const sent = sentAt(), unitId = ([, keys, value]) => JSON.stringify([repo, ...keys, value]);
    const units = all.filter(u => !sent[unitId(u)]);
    if (!units.length) return Object.assign([], { waiting: all.length });
    const m = {}, t = {}, add = (group, value, key) => { group[value] = (group[value] || '') + shortKey(key); };
    for (const [, keys, value] of units) {
      if (keys[0] === 'tags') add(((t[keys[1]] ??= {})[keys[3]] ??= {}), value ? '1' : '0', keys[2]);
      else if (keys.length === 3) add(((m[keys[0]] ??= {})[keys[2]] ??= {}), String(value), keys[1]);
      else add((m[keys[0]] ??= {}), String(value), keys[1]);
    }
    const tally = {};
    for (const [line] of units) { const what = line.slice(2, line.indexOf(':')).replace('Remove from the list', 'Removed'); tally[what] = (tally[what] || 0) + 1; }
    const summary = `${units.length} ${units.length === 1 ? 'change' : 'changes'}: ${Object.entries(tally).map(([what, n]) => `${n} ${what.toLowerCase()}`).join(', ')}.`;
    const json = `\`\`\`json\n${JSON.stringify({ v: 2, m, ...(Object.keys(t).length ? { t } : {}) })}\n\`\`\`\n`;
    const title = `${prefix}: update ${units.length} ${units.length === 1 ? noun : `${noun}s`}`;
    const full = { repo, title, body: `${summary}\n\n${units.map(u => u[0]).join('\n')}\n\n${footer}\n\n${json}`, ids: units.map(unitId) };
    const part = newIssueUrl(repo, full).length <= MAX_URL ? full : { ...full, body: `${summary}\n\n${footer}\n\n${json}` };
    // Past the cap, fall back to parts rather than a link GitHub won't open.
    if (newIssueUrl(repo, part).length > MAX_URL) return issueParts(repo, prefix, noun, all, footer, p => newIssueUrl(repo, p).length > MAX_URL);
    return Object.assign([part], { waiting: all.length - units.length });
  }
  const linkCount = () => {
    const sent = sentAt();
    return siteUnits().filter(([, keys, value]) => !sent[JSON.stringify([REPO, ...keys, value])]).length
      + markUnits().filter(([, keys, value]) => !sent[JSON.stringify([DIGESTS_REPO, ...keys, value])]).length;
  };
  // Without a key, owner mode stops at MAX_LINK_CHANGES unsent changes; returns true (and says so) when it's full.
  function atCap() {
    if (canSave && token()) return false;
    if (linkCount() < MAX_LINK_CHANGES) return false;
    renderOwnerBar();
    return true;
  }
  // Shows one send link per part, cloning the first for the rest.
  function setLinks(anchor, parts, label) {
    document.querySelectorAll(`[data-part-of="${anchor.id}"]`).forEach(a => a.remove());
    anchor.hidden = !parts.length;
    if (!parts.length) return;
    let last = anchor;
    parts.forEach((part, i) => {
      const a = i ? anchor.cloneNode() : anchor;
      if (i) { a.removeAttribute('id'); a.dataset.partOf = anchor.id; last.after(a); last = a; }
      a.href = newIssueUrl(part.repo, part);
      partIds.set(a, part.ids);
      a.textContent = parts.length > 1 ? `${label}, part ${i + 1} of ${parts.length} ↗` : `${label} ↗`;
    });
  }
  const nested = data => Object.values(data).reduce((n, entries) => n + Object.values(entries).reduce((m, set) => m + Object.keys(set).length, 0), 0);
  const pendingCount = () => Object.values(pending).reduce((n, marks) => n + Object.keys(marks).length, 0) + nested(pendingTags);
  const token = () => store.get(DIGESTS_TOKEN_KEY, '');
  const github = (path, options = {}) => fetch(`https://api.github.com/repos/${path}`, {
    ...options, cache: 'no-store',
    headers: { Authorization: `Bearer ${token()}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', ...options.headers },
  });
  let saving = false, saveNote = '', canSave = true;
  function renderOwnerBar() {
    els.ownerBar.hidden = !owner;
    if (!owner) return;
    const direct = canSave && Boolean(token());
    const tooBig = direct ? part => part.body.length > MAX_BODY : part => newIssueUrl(part.repo, part).length > MAX_URL;
    const sends = !pendingCount() ? [] : direct ? issueParts(REPO, 'Anti-library', 'title', siteUnits(), SITE_FOOTER, tooBig) : linkPart(REPO, 'Anti-library', 'title', siteUnits(), SITE_FOOTER);
    const markSends = !nested(digestPending()) ? [] : direct ? issueParts(DIGESTS_REPO, 'Digests', 'mark', markUnits(), MARKS_FOOTER, tooBig) : linkPart(DIGESTS_REPO, 'Digests', 'mark', markUnits(), MARKS_FOOTER);
    const units = parts => parts.reduce((n, p) => n + p.ids.length, 0);
    const count = units(sends), marks = units(markSends), waiting = (sends.waiting || 0) + (markSends.waiting || 0);
    const words = n => `${number(n)} ${n === 1 ? 'change' : 'changes'}`;
    const text = [];
    if (saving) text.push(`Saving ${words(count + marks)}…`);
    else if (count || marks) text.push(direct ? `${words(count + marks)} not saved yet.` : `${count + marks === 1 ? '1 change is' : `${number(count + marks)} changes are`} saved in this browser and not yet sent.`);
    if (waiting && !saving) text.push(direct ? `Saved ${words(waiting)}; the site is updating.` : `${words(waiting)} sent and waiting for the site to update, which takes a few minutes.`);
    if (saveNote) text.push(saveNote);
    if (!text.length) text.push(`Tick titles as you finish them${list?.toggles?.length ? ', retag them' : ''} or remove ones you no longer want, then save.`);
    if (!direct && count && marks) text.push('Send both: the site gets what’s crossed off, and the digests get whether it was digested or fully read.');
    if ((count || marks) && !saving) text.push('Discard brings back anything you removed.');
    if (!direct && count + marks >= MAX_LINK_CHANGES) text.push(`Max ${number(MAX_LINK_CHANGES)} changes reached: send these before marking more.`);
    else if (!direct && count + marks >= MAX_LINK_CHANGES * 0.8) text.push(`${number(count + marks)} of max ${number(MAX_LINK_CHANGES)} changes.`);
    if (!direct && (sends.length > 1 || markSends.length > 1)) text.push('That’s too much for one GitHub issue, so it’s split into parts: send each one.');
    els.ownerText.textContent = text.join(' ');
    els.save.hidden = !direct || (!count && !marks && !saving);
    els.save.disabled = saving;
    els.save.textContent = saving ? 'Saving…' : 'Save changes';
    setLinks(els.send, direct ? [] : sends, 'Send changes to the site');
    setLinks(els.sendMarks, direct ? [] : markSends, 'Send digest marks');
    els.discard.hidden = saving || (!pendingCount() && !nested(digestPending()));
  }
  // The same issue the digests page writes, for its own repository's workflow.
  function markUnits() {
    const units = [];
    for (const [id, entries] of Object.entries(digestPending())) for (const [key, fields] of Object.entries(entries)) {
      const [title, creator] = key.split('|');
      for (const [mark, value] of Object.entries(fields)) {
        const on = mark === 'read' ? 'Digested' : fullyLabel(id);
        units.push([`- ${value ? on : `Not ${on.toLowerCase()}`}: ${title}${creator ? ` (${creator})` : ''}`, [id, key, mark], value]);
      }
    }
    return units;
  }
  function siteUnits() {
    const units = [];
    for (const [listId, marks] of Object.entries(pending)) {
      for (const [key, value] of Object.entries(marks)) {
        const [title, creator] = key.split('|');
        units.push([`- ${value === REMOVE ? 'Remove from the list' : value ? 'Crossed off' : 'Back on the list'}: ${title}${creator ? ` (${creator})` : ''}`, [listId, key], value]);
      }
    }
    for (const [listId, tagged] of Object.entries(pendingTags)) {
      const meta = lists.find(l => l.id === listId);
      for (const [key, set] of Object.entries(tagged)) {
        const [title, creator] = key.split('|');
        for (const [flag, on] of Object.entries(set)) units.push([`- ${on ? meta.flags[flag] : `Not ${meta.flags[flag].toLowerCase()}`}: ${title}${creator ? ` (${creator})` : ''}`, ['tags', listId, key, flag], on]);
      }
    }
    return units;
  }
  // Save: one click opens every issue needed (site and digest marks) and then watches them.
  async function save() {
    if (saving) return;
    saving = true; saveNote = '';
    renderOwnerBar();
    try { await saveParts(); } catch (error) { saveNote = `The save didn’t go through (${error.message || error}). Try again.`; }
    saving = false;
    renderOwnerBar();
    watchSaves();
  }
  async function saveParts() {
    // Changes the published data already has (saved from another tab or an earlier link) are dropped, not resent.
    await refreshPublished();
    if (!pendingCount() && !nested(digestPending())) { saveNote = 'Those changes were already saved.'; return; }
    const tooBig = part => part.body.length > MAX_BODY;
    const parts = [
      ...(pendingCount() ? issueParts(REPO, 'Anti-library', 'title', siteUnits(), SITE_FOOTER, tooBig) : []),
      ...(nested(digestPending()) ? issueParts(DIGESTS_REPO, 'Digests', 'mark', markUnits(), MARKS_FOOTER, tooBig) : []),
    ];
    const watched = store.get(SAVING_KEY, []) || [];
    for (const part of parts) {
      const response = await github(`${part.repo}/issues`, { method: 'POST', body: JSON.stringify({ title: part.title, body: part.body }) }).catch(() => null);
      if (!response?.ok) {
        if (response && [401, 403, 404].includes(response.status)) {
          canSave = false;
          saveNote = 'Saving needs the digests key to have Issues set to Read and write on anti-lib and reading-list. Until then, send the changes with the links below.';
        } else saveNote = 'The save didn’t go through. Check the connection and try again.';
        break;
      }
      const issue = await response.json();
      watched.push({ repo: part.repo, number: issue.number, ids: part.ids, at: Date.now() });
      markSent(part.ids);
      store.set(SAVING_KEY, watched);
    }
  }
  // Polls the saved issues: the workflow closes one once it's applied, or comments on it and leaves it open if not.
  let watchTimer = 0;
  async function watchSaves() {
    clearTimeout(watchTimer);
    const watched = store.get(SAVING_KEY, []) || [];
    if (!watched.length || !owner || !token()) return;
    const left = [];
    let applied = false;
    for (const s of watched) {
      const issue = await github(`${s.repo}/issues/${s.number}`).then(r => (r.ok ? r.json() : null)).catch(() => null);
      if (issue?.state === 'closed') { applied = true; continue; }
      if (issue && (issue.comments > 0 || Date.now() - s.at > SENT_WAIT)) {
        markSent(s.ids, false);
        saveNote = `Some changes couldn’t be applied (issue #${s.number} in ${s.repo.split('/')[1]}). They’re back in the list to save again.`;
        continue;
      }
      left.push(s);
    }
    store.set(SAVING_KEY, left.length ? left : null);
    if (applied) await refreshData();
    if (!left.length && !saveNote && !pendingCount() && !nested(digestPending())) saveNote = 'All changes saved.';
    renderOwnerBar();
    if (left.length) watchTimer = setTimeout(watchSaves, 5000);
  }
  // Re-reads the published data (through the API, so it's current) once a save is applied.
  async function refreshPublished() {
    const [done, gone] = await Promise.all(['progress.json', 'removed.json'].map(name => getData(name).catch(() => null)));
    if (done) progress = done;
    if (gone) removed = gone;
    prunePending();
    await loadDigests();
  }
  async function refreshData() {
    await refreshPublished();
    for (const id of Object.keys(cache)) delete cache[id];
    if (list) { items = await loadItems(list.id); renderControls(); render(); }
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
      digestLinks = {}; digestMarks = marked;
      // Waiting marks the published ones already match have been saved.
      const waiting = digestPending();
      for (const [id, entries] of Object.entries(waiting)) {
        for (const [key, fields] of Object.entries(entries)) {
          for (const [mark, value] of Object.entries(fields)) if (Boolean(marked[id]?.[key]?.[mark]) === Boolean(value)) delete fields[mark];
          if (!Object.keys(fields).length) delete entries[key];
        }
        if (!Object.keys(entries).length) delete waiting[id];
      }
      store.set(DIGEST_MARKS_KEY, Object.keys(waiting).length ? waiting : null);
      for (const d of await index.json()) {
        if (d.status !== 'ready' || !/^[a-z0-9-]+$/.test(d.slug || '')) continue;
        (digestLinks[d.list] ??= {})[d.key] = { id: `${d.list}/${d.slug}` };
      }
      syncCrossedOff();
      if (list) { render(); renderOwnerBar(); }
    } catch {}
  }
  // A digest mark that crosses a title off (made here or on the digests page) queues the public crossing-off too.
  function syncCrossedOff() {
    const waiting = digestPending();
    for (const id of new Set([...Object.keys(digestMarks), ...Object.keys(waiting)])) {
      for (const key of new Set([...Object.keys(digestMarks[id] || {}), ...Object.keys(waiting[id] || {})])) {
        const i = { t: key.split('|')[0], c: key.split('|').slice(1).join('|') };
        if (pending[id]?.[key] !== undefined || progress[id]?.[key]) continue;
        if (markOf(i, 'deeper', id) || (digestCounts(id) && markOf(i, 'read', id))) (pending[id] ??= {})[key] = new Date().toISOString().slice(0, 10);
      }
    }
    prunePending();
  }
  function setDigestMark(i, mark, on) {
    const waiting = digestPending(), key = itemKey(i);
    ((waiting[list.id] ??= {})[key] ??= {})[mark] = on ? new Date().toISOString().slice(0, 10) : null;
    if (Boolean(digestMarks[list.id]?.[key]?.[mark]) === on) delete waiting[list.id][key][mark];
    if (!Object.keys(waiting[list.id][key]).length) delete waiting[list.id][key];
    if (!Object.keys(waiting[list.id]).length) delete waiting[list.id];
    store.set(DIGEST_MARKS_KEY, Object.keys(waiting).length ? waiting : null);
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
    if (!button || !owner || atCap()) return;
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
  // Each owner checkbox changes one title in place. Fully read (watched, heard) crosses a title off; on titles with a
  // digest it and Digested are digest marks, and the crossing-off follows them. The rest are tags.
  els.results.addEventListener('change', event => {
    const box = event.target.closest('.al-owner-actions input');
    if (!box || !owner) return;
    if (atCap()) { box.checked = !box.checked; return; }
    const key = box.dataset.key, flag = box.dataset.flag, item = items.find(i => itemKey(i) === key);
    if (flag.startsWith('digest:')) {
      setDigestMark(item, flag.slice(7), box.checked);
      const off = item.d || markOf(item, 'deeper') || (digestCounts(list.id) && markOf(item, 'read'));
      if (Boolean(progress[list.id]?.[key]) === Boolean(off)) delete pending[list.id]?.[key];
      else (pending[list.id] ??= {})[key] = off ? new Date().toISOString().slice(0, 10) : null;
      prunePending();
    } else if (flag) {
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
            Status: isDone(i) ? 'Crossed off' : 'Anti-library', 'Crossed off on': date || '', Note: i.n || '', Link: i.l || '',
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
  // A send button opens its issue in a new tab; this tab then counts that part as sent.
  els.ownerBar.addEventListener('click', e => {
    const ids = partIds.get(e.target.closest('a'));
    if (!ids) return;
    markSent(ids);
    setTimeout(renderOwnerBar, 500);
  });
  els.save.addEventListener('click', save);
  // Coming back to the tab re-reads what's published, so changes saved elsewhere stop showing as unsaved.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden || !owner || saving || !lists.length) return;
    rereadPending();
    refreshPublished().then(() => { if (list) { render(); renderOwnerBar(); } });
  });
  // Ticks made on an artist page (or in another tab) are written to the browser store at once. When the browser
  // brings this page back from its cache (Back, or Back to albums) the copy held here is stale, so read it again;
  // otherwise the next tick here would overwrite them.
  function rereadPending() {
    pending = store.get(PENDING_KEY, {}) || {};
    pendingTags = store.get(TAGS_KEY, {}) || {};
    Object.keys(cache).forEach(applyTags);
    prunePending();
  }
  addEventListener('pageshow', event => {
    if (!event.persisted || !lists.length) return;
    rereadPending();
    if (list) { render(); renderOwnerBar(); }
  });
  addEventListener('storage', event => {
    if (![PENDING_KEY, TAGS_KEY].includes(event.key) || !lists.length) return;
    rereadPending();
    if (list) { render(); renderOwnerBar(); }
  });
  els.discard.addEventListener('click', () => {
    pending = {}; pendingTags = {};
    store.set(SENT_KEY, null);
    store.set(PENDING_KEY, null);
    store.set(DIGEST_MARKS_KEY, null);
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
  els.shelf.addEventListener('change', event => {
    const input = event.target;
    if (input.dataset.part !== undefined) {
      const names = unique(items.filter(i => (i.g || '') === input.dataset.part).map(i => i.s));
      state.shelves = input.checked ? unique([...state.shelves, ...names]) : state.shelves.filter(name => !names.includes(name));
    } else state.shelves = toggleIn(state.shelves, input.dataset.shelf, input.checked);
    render(); writeUrl(true);
  });
  els.show.addEventListener('change', event => { state.only = toggleIn(state.only, event.target.dataset.flag, event.target.checked); render(); writeUrl(); });
  for (const panel of [els.shelf, els.show]) panel.addEventListener('click', event => {
    const all = event.target.closest('[data-menu-all]');
    if (!all) return;
    if (all.dataset.menuAll === 'shelves') state.shelves = []; else state.only = [];
    render(); writeUrl(all.dataset.menuAll === 'shelves');
    panel.querySelector('input:not(:disabled)')?.focus();
  });
  // An artist, author or director path opens its own page; a thread narrows this one.
  els.thread.addEventListener('change', () => {
    if (els.thread.value.startsWith('path:')) {
      location.href = `${PATHS[list.id].page}?a=${encodeURIComponent(els.thread.value.slice(5))}`;
      return;
    }
    state.thread = els.thread.value; render(); writeUrl(true);
  });
  // The Shelves and Tags menus close when another opens, on a click outside them, and on Escape.
  const menus = [els.shelfMenu, els.showMenu];
  for (const menu of menus) menu.addEventListener('toggle', () => { if (menu.open) menus.forEach(m => { if (m !== menu) m.open = false; }); });
  // The path is read from the event, since ticking a box redraws the menu and detaches the box that was clicked.
  document.addEventListener('click', event => menus.forEach(m => { if (m.open && !event.composedPath().includes(m)) m.open = false; }));
  document.addEventListener('keydown', event => {
    const typing = event.target.closest?.('input, select, textarea, [contenteditable]');
    if (event.key === 'Escape') {
      const menu = menus.find(m => m.open);
      if (menu) { menu.open = false; menu.querySelector('summary').focus(); event.preventDefault(); }
    } else if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
      // "/" jumps to the search box, as on most sites with one.
      event.preventDefault();
      els.q.focus();
      els.q.select();
    }
  });
  els.filtersToggle.addEventListener('click', () => {
    const open = !els.controls.classList.contains('is-open');
    els.controls.classList.toggle('is-open', open);
    els.filtersToggle.setAttribute('aria-expanded', open);
  });
  // Back and Forward step between lists, shelves and threads.
  addEventListener('popstate', () => {
    const before = list?.id;
    readUrl();
    if (state.list && lists.some(l => l.id === state.list) && state.list !== before) { selectList(state.list, true); return; }
    renderControls(); render();
  });
  els.sort.addEventListener('change', () => { state.sort = els.sort.value; render(); writeUrl(); });
  els.hide.addEventListener('change', () => { state.hide = els.hide.checked; render(); writeUrl(); });
  // Chips beside the count and the empty-shelf message take filters off; a tag on a title puts its filter on.
  document.querySelector('.al-browser').addEventListener('click', event => {
    const clear = event.target.closest('[data-clear]'), tag = event.target.closest('[data-only]'), thread = event.target.closest('[data-thread]');
    if (thread) {
      state.thread = thread.dataset.thread;
      render(); writeUrl(true);
      els.results.querySelector('.al-thread-head h2')?.scrollIntoView({ block: 'center' });
    } else if (clear) {
      const key = clear.dataset.clear;
      if (key === 'all') Object.assign(state, blank(), { sort: state.sort });
      else if (key === 'thread') state.thread = '';
      else if (key.startsWith('only:')) state.only = state.only.filter(flag => flag !== key.slice(5));
      renderControls(); render(); writeUrl(key === 'all' || key === 'thread');
      // Focus moves to the next chip, or to the search box once none are left.
      (els.applied.querySelector('button') || els.q).focus();
    } else if (tag) {
      state.only = unique([...state.only, tag.dataset.only]);
      render(); writeUrl();
      // Back to the top of the results, just under the filter bar when it is pinned, so the new chip is in view.
      const controls = $('al-controls'), status = els.count.closest('.al-status');
      const style = getComputedStyle(controls);
      const pinned = style.position === 'sticky' ? controls.offsetHeight + (parseFloat(style.top) || 0) : 0;
      scrollTo({ top: status.getBoundingClientRect().top + scrollY - pinned, behavior: 'instant' });
      els.applied.querySelector(`[data-clear="only:${tag.dataset.only}"]`)?.focus({ preventScroll: true });
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
    getData('progress.json').catch(() => ({})),
    getData('removed.json').catch(() => ({})),
  ]).then(([data, done, gone]) => {
    lists = data.filter(l => /^https:\/\//.test(l.search));
    lists.forEach(l => { if (l.listen && !/^https:\/\//.test(l.listen)) delete l.listen; });
    progress = done; removed = gone; prunePending(); loadDigests(); watchSaves(); return selectList(state.list, true);
  }).catch(() => { els.count.textContent = 'The shelves could not be loaded. Try refreshing the page.'; });
})();
