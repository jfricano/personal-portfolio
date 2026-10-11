// The anti-library browser: lists come from data/lists.json, items from data/<id>.json, and
// finished titles from data/progress.json.
// Owner mode (turned on by visiting ?owner=on, never linked from the page) adds a mark button
// to each title and a spreadsheet export. Marks wait in this browser until the owner sends
// them as one prefilled GitHub issue; a repository workflow applies issues opened by the owner
// to progress.json, so GitHub's own sign-in is the permission check and the page holds no secrets.
(() => {
  const REPO = 'jfricano/personal-portfolio';
  const OWNER_KEY = 'antilibrary-owner-mode', PENDING_KEY = 'antilibrary-pending-marks';
  const $ = id => document.getElementById(id);
  const els = {
    tabs: $('al-tabs'), q: $('al-q'), group: $('al-group'), groupField: $('al-group-field'), groupLabel: $('al-group-label'),
    shelf: $('al-shelf'), shelfLabel: $('al-shelf-label'), sort: $('al-sort'), flags: $('al-flags'),
    count: $('al-count'), results: $('al-results'), random: $('al-random'), reset: $('al-reset'),
    owner: $('al-owner'), ownerBar: $('al-owner-bar'), ownerText: $('al-owner-text'), send: $('al-send'), discard: $('al-discard'),
    exportButton: $('al-export'),
  };
  const cache = {};
  let lists = [], list = null, items = [], visible = [];
  let progress = {}, pending = {}, owner = false;
  const blank = () => ({ q: '', group: '', shelf: '', sort: 'shelf', flags: new Set(), hide: false });
  const state = { list: '', ...blank() };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const number = n => n.toLocaleString('en-US');
  const splitShelf = s => { const m = /^(\d+)\.\s*(.*)$/.exec(s || ''); return m ? [m[1].padStart(2, '0'), m[2]] : ['', s || '']; };
  const titleKey = t => fold(t).replace(/^(the|a|an)\s+/, '');
  const creatorKey = c => {
    const first = fold(c || '~').split(/\s*(?:&|,|\band\b)\s*/)[0].replace(/\(.*?\)/g, '').trim();
    const words = first.split(/\s+/).filter(w => !/^(jr\.?|sr\.?|ii|iii|iv)$/.test(w));
    return `${words.at(-1) || '~'} ${first}`;
  };
  const itemKey = i => `${i.t}|${i.c || ''}`;
  const pendingFor = i => pending[list.id]?.[itemKey(i)];
  const isDone = i => {
    const mark = pendingFor(i);
    return Boolean(i.d || (mark !== undefined ? mark : progress[list.id]?.[itemKey(i)]));
  };
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
    state.group = p.get('part') || '';
    state.shelf = p.get('shelf') || '';
    state.sort = SORTS[p.get('sort')] ? p.get('sort') : 'shelf';
    state.flags = new Set((p.get('only') || '').split(',').filter(Boolean));
    state.hide = p.get('hide') === '1';
  }
  function writeUrl() {
    const p = new URLSearchParams();
    if (list && list.id !== lists[0].id) p.set('list', list.id);
    if (state.q) p.set('q', state.q);
    if (state.group) p.set('part', state.group);
    if (state.shelf) p.set('shelf', state.shelf);
    if (state.sort !== 'shelf') p.set('sort', state.sort);
    if (state.flags.size) p.set('only', [...state.flags].join(','));
    if (state.hide) p.set('hide', '1');
    const query = p.toString();
    try { history.replaceState(null, '', query ? `?${query}` : location.pathname); } catch {}
  }

  function options(select, values, allLabel, current) {
    select.innerHTML = `<option value="">${esc(allLabel)}</option>` +
      values.map(v => `<option value="${esc(v)}"${v === current ? ' selected' : ''}>${esc(v)}</option>`).join('');
  }
  const unique = values => [...new Set(values.filter(Boolean))];

  function renderTabs() {
    els.tabs.innerHTML = lists.map(l => `<button type="button" role="tab" id="al-tab-${esc(l.id)}" data-id="${esc(l.id)}" aria-controls="al-results" aria-selected="${l === list}" tabindex="${l === list ? 0 : -1}">${esc(l.label)} <span>${number(l.count)}</span></button>`).join('');
    els.results.setAttribute('role', 'tabpanel');
    els.results.setAttribute('aria-labelledby', `al-tab-${list.id}`);
  }

  function renderControls() {
    const groups = unique(items.map(i => i.g));
    els.groupField.hidden = !groups.length;
    els.groupLabel.textContent = list.groupLabel || 'Part';
    if (!groups.includes(state.group)) state.group = '';
    options(els.group, groups, `All ${(list.groupLabel || 'part').toLowerCase()}s`, state.group);
    renderShelves();
    els.shelfLabel.textContent = list.shelfLabel || 'Shelf';
    const sorts = Object.entries(SORTS).filter(([, s]) => !s.year || list.hasYear);
    if (!sorts.some(([key]) => key === state.sort)) state.sort = 'shelf';
    els.sort.innerHTML = sorts.map(([key, s]) => `<option value="${key}"${key === state.sort ? ' selected' : ''}>${key === 'creator' ? `${esc(list.creatorLabel)} A–Z` : s.label}</option>`).join('');
    for (const key of state.flags) if (!list.flags[key]) state.flags.delete(key);
    els.flags.innerHTML = '<legend class="label">Only show</legend>' + Object.entries(list.flags).map(([key, label]) =>
      `<label class="al-chip al-chip-${esc(key)}"><input type="checkbox" value="${esc(key)}"${state.flags.has(key) ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('') +
      `<label class="al-chip al-chip-hide"><input type="checkbox" value="" data-hide${state.hide ? ' checked' : ''}><span>Hide ${esc(list.doneLabel.toLowerCase())}</span></label>`;
    els.q.value = state.q;
  }
  function renderShelves() {
    const shelves = unique(items.filter(i => !state.group || i.g === state.group).map(i => i.s));
    if (!shelves.includes(state.shelf)) state.shelf = '';
    options(els.shelf, shelves, `All ${(list.shelfLabel || 'shelf').toLowerCase().replace(/f$/, 've')}s`, state.shelf);
  }

  function filter() {
    const terms = fold(state.q).split(/\s+/).filter(Boolean);
    visible = items.filter(i => (!state.group || i.g === state.group) && (!state.shelf || i.s === state.shelf) &&
      [...state.flags].every(f => i.f && i.f.includes(f)) && (!state.hide || !isDone(i)) && terms.every(t => i._h.includes(t)));
    const sort = SORTS[state.sort];
    if (sort.cmp) visible = [...visible].sort(sort.cmp);
  }

  function itemHtml(i) {
    const by = [i.c, i.y].filter(Boolean).map(esc).join(' · ');
    const where = [];
    if (state.sort !== 'shelf' && i.s) where.push(splitShelf(i.s)[1]);
    if (i.u) where.push(i.u);
    const done = isDone(i);
    const tags = (i.f || []).map(f => `<li class="al-tag al-tag-${esc(f)}">${esc(list.flags[f])}</li>`);
    if (done) tags.push(`<li class="al-tag al-tag-done">${esc(list.doneLabel)}</li>`);
    const suffix = i.f && i.f.includes('path') ? '' : list.searchSuffix;
    const href = i.l || `${list.search}${encodeURIComponent([i.t, i.c, suffix].filter(Boolean).join(' '))}`;
    const cover = i.i ? `<img src="${esc(i.i)}" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer">` : '';
    const label = list.doneLabel.toLowerCase();
    const mark = owner ? `<button type="button" class="al-mark${pendingFor(i) !== undefined ? ' al-unsent' : ''}" data-key="${esc(itemKey(i))}" aria-pressed="${done}"${i.d ? ' disabled title="Marked in the source list"' : ''}>${done ? `✓ ${esc(label)}` : `Mark ${esc(label)}`}</button>` : '';
    return `<article class="al-item${done ? ' al-done' : ''}" id="item-${i._id}" tabindex="-1">` +
      `<a class="al-cover" href="${esc(href)}" target="_blank" rel="noopener noreferrer" tabindex="-1" aria-hidden="true"><span>${esc(i.t.replace(/^(the|a|an)\s+/i, '').charAt(0))}</span>${cover}</a>` +
      `<div class="al-item-head"><h3><a href="${esc(href)}" target="_blank" rel="noopener noreferrer"${i.l ? '' : ' title="Search for this title"'}>${esc(i.t)}<span class="al-ext" aria-hidden="true"> ↗</span></a></h3>${by ? `<p class="al-by">${by}</p>` : ''}${mark}</div>` +
      `<div class="al-item-body">${i.n ? `<p class="al-note">${esc(i.n)}</p>` : ''}${where.length ? `<p class="al-where">${where.map(esc).join(' / ')}</p>` : ''}</div>` +
      `${tags.length ? `<ul class="al-tags">${tags.join('')}</ul>` : ''}</article>`;
  }

  function render() {
    filter();
    const noun = list.noun[items.length === 1 ? 0 : 1];
    const finished = items.filter(isDone).length;
    els.count.textContent = (visible.length === items.length
      ? `All ${number(items.length)} ${noun}`
      : `Showing ${number(visible.length)} of ${number(items.length)} ${noun}`) +
      (finished ? `, ${number(finished)} ${list.doneLabel.toLowerCase()}.` : '.');
    els.random.disabled = !visible.length;
    renderOwnerBar();
    if (!visible.length) {
      els.results.innerHTML = `<p class="al-empty">Nothing on these shelves matches. Try fewer words, or clear the filters.</p>`;
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
      html += `<section class="al-shelf"><h2><span class="index">${esc(num)}</span>${esc(name || 'Unshelved')}<span class="al-shelf-count">${number(rows.length)}</span></h2><div class="al-list">${rows.map(itemHtml).join('')}</div></section>`;
    }
    els.results.innerHTML = html;
  }

  async function loadItems(id) {
    if (!cache[id]) {
      const data = await fetch(`data/${encodeURIComponent(id)}.json`).then(r => r.json());
      data.forEach((i, n) => {
        i._id = n; i._t = titleKey(i.t); i._c = creatorKey(i.c);
        i._h = fold([i.t, i.c, i.y, i.g, i.s, i.u, i.n].filter(Boolean).join(' '));
      });
      cache[id] = data;
    }
    return cache[id];
  }

  async function selectList(id, fromUrl) {
    list = lists.find(l => l.id === id) || lists[0];
    if (!fromUrl) Object.assign(state, blank());
    renderTabs();
    els.results.dataset.cover = list.cover || 'tall';
    els.count.textContent = 'Loading the shelves…';
    items = await loadItems(list.id);
    renderControls();
    render();
    writeUrl();
  }

  // Owner mode.
  const pendingCount = () => Object.values(pending).reduce((n, marks) => n + Object.keys(marks).length, 0);
  function renderOwnerBar() {
    els.ownerBar.hidden = !owner;
    if (!owner) return;
    const count = pendingCount();
    els.ownerText.textContent = count
      ? `${number(count)} ${count === 1 ? 'change is' : 'changes are'} saved in this browser and not yet on the site.`
      : 'Mark titles as you finish them, then send the changes to the site.';
    els.send.hidden = els.discard.hidden = !count;
    if (count) els.send.href = issueUrl();
  }
  function issueUrl() {
    const lines = [];
    for (const [listId, marks] of Object.entries(pending)) {
      const meta = lists.find(l => l.id === listId);
      for (const [key, value] of Object.entries(marks)) {
        const [title, creator] = key.split('|');
        lines.push(`- ${value ? meta.doneLabel : 'Back on the list'}: ${title}${creator ? ` (${creator})` : ''}`);
      }
    }
    const body = `${lines.join('\n')}\n\nThe anti-library page wrote this issue. Submit it to update the site.\n\n\`\`\`json\n${JSON.stringify(pending)}\n\`\`\`\n`;
    const count = pendingCount();
    return `https://github.com/${REPO}/issues/new?${new URLSearchParams({ title: `Anti-library: update ${count} ${count === 1 ? 'title' : 'titles'}`, labels: 'antilibrary', body })}`;
  }
  function setOwner(on) {
    owner = on;
    store.set(OWNER_KEY, on || null);
    if (list) render();
  }
  // Drop browser-held marks the published progress already matches.
  function prunePending() {
    for (const [listId, marks] of Object.entries(pending)) {
      for (const [key, value] of Object.entries(marks)) if (Boolean(progress[listId]?.[key]) === Boolean(value)) delete marks[key];
      if (!Object.keys(marks).length) delete pending[listId];
    }
    store.set(PENDING_KEY, Object.keys(pending).length ? pending : null);
  }
  els.results.addEventListener('click', event => {
    const button = event.target.closest('.al-mark');
    if (!button || !owner) return;
    const key = button.dataset.key, item = items.find(i => itemKey(i) === key);
    const next = !isDone(item);
    pending[list.id] ??= {};
    pending[list.id][key] = next ? new Date().toISOString().slice(0, 10) : null;
    prunePending();
    button.closest('.al-item').outerHTML = itemHtml(item);
    $(`item-${item._id}`).querySelector('.al-mark').focus();
    const finished = items.filter(isDone).length;
    els.count.textContent = els.count.textContent.replace(/(, [\d,]+ \w+)?\.$/, finished ? `, ${number(finished)} ${list.doneLabel.toLowerCase()}.` : '.');
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
        const rows = all.map(i => {
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
  els.discard.addEventListener('click', () => { pending = {}; store.set(PENDING_KEY, null); render(); });

  // A cover that fails to load leaves the lettered placeholder showing.
  els.results.addEventListener('error', event => { if (event.target.tagName === 'IMG') event.target.remove(); }, true);

  let timer;
  els.q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = els.q.value.trim(); render(); writeUrl(); }, 120); });
  els.group.addEventListener('change', () => { state.group = els.group.value; renderShelves(); render(); writeUrl(); });
  els.shelf.addEventListener('change', () => { state.shelf = els.shelf.value; render(); writeUrl(); });
  els.sort.addEventListener('change', () => { state.sort = els.sort.value; render(); writeUrl(); });
  els.flags.addEventListener('change', event => {
    const box = event.target;
    if ('hide' in box.dataset) state.hide = box.checked;
    else box.checked ? state.flags.add(box.value) : state.flags.delete(box.value);
    render(); writeUrl();
  });
  els.reset.addEventListener('click', () => { Object.assign(state, blank()); renderControls(); render(); writeUrl(); });
  els.random.addEventListener('click', () => {
    if (!visible.length) return;
    const pick = visible[Math.floor(Math.random() * visible.length)];
    document.querySelectorAll('.al-picked').forEach(el => el.classList.remove('al-picked'));
    const el = $(`item-${pick._id}`);
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
  Promise.all([
    fetch('data/lists.json').then(r => r.json()),
    fetch('data/progress.json', { cache: 'no-store' }).then(r => (r.ok ? r.json() : {})).catch(() => ({})),
  ]).then(([data, done]) => { lists = data; progress = done; prunePending(); return selectList(state.list, true); })
    .catch(() => { els.count.textContent = 'The shelves could not be loaded. Try refreshing the page.'; });
})();
