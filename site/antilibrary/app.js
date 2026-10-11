// The anti-library browser: lists come from data/lists.json, items from data/<id>.json.
(() => {
  const $ = id => document.getElementById(id);
  const els = {
    tabs: $('al-tabs'), q: $('al-q'), group: $('al-group'), groupField: $('al-group-field'), groupLabel: $('al-group-label'),
    shelf: $('al-shelf'), shelfLabel: $('al-shelf-label'), sort: $('al-sort'), flags: $('al-flags'),
    count: $('al-count'), results: $('al-results'), random: $('al-random'), reset: $('al-reset'),
  };
  const cache = {};
  let lists = [], list = null, items = [], visible = [];
  const state = { list: '', q: '', group: '', shelf: '', sort: 'shelf', flags: new Set() };

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fold = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const number = n => n.toLocaleString('en-US');
  const splitShelf = s => { const m = /^(\d+)\.\s*(.*)$/.exec(s || ''); return m ? [m[1].padStart(2, '0'), m[2]] : ['', s || '']; };
  const titleKey = t => fold(t).replace(/^(the|a|an)\s+/, '');
  const creatorKey = c => {
    const first = fold(c || '~').split(/\s*(?:&|,|\band\b)\s*/)[0].replace(/\(.*?\)/g, '').trim();
    const words = first.split(/\s+/).filter(w => !/^(jr\.?|sr\.?|ii|iii|iv)$/.test(w));
    return `${words.at(-1) || '~'} ${first}`;
  };
  const SORTS = {
    shelf: { label: 'Shelf order' },
    title: { label: 'Title A–Z', cmp: (a, b) => a._t.localeCompare(b._t) },
    creator: { label: 'Creator A–Z', cmp: (a, b) => a._c.localeCompare(b._c) || a._t.localeCompare(b._t) },
    newest: { label: 'Newest first', year: true, cmp: (a, b) => (b.y || 0) - (a.y || 0) || a._t.localeCompare(b._t) },
    oldest: { label: 'Oldest first', year: true, cmp: (a, b) => (a.y || 9999) - (b.y || 9999) || a._t.localeCompare(b._t) },
  };

  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.list = p.get('list') || '';
    state.q = p.get('q') || '';
    state.group = p.get('part') || '';
    state.shelf = p.get('shelf') || '';
    state.sort = SORTS[p.get('sort')] ? p.get('sort') : 'shelf';
    state.flags = new Set((p.get('only') || '').split(',').filter(Boolean));
  }
  function writeUrl() {
    const p = new URLSearchParams();
    if (list && list.id !== lists[0].id) p.set('list', list.id);
    if (state.q) p.set('q', state.q);
    if (state.group) p.set('part', state.group);
    if (state.shelf) p.set('shelf', state.shelf);
    if (state.sort !== 'shelf') p.set('sort', state.sort);
    if (state.flags.size) p.set('only', [...state.flags].join(','));
    const query = p.toString();
    history.replaceState(null, '', query ? `?${query}` : location.pathname);
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
      `<label class="al-chip al-chip-${esc(key)}"><input type="checkbox" value="${esc(key)}"${state.flags.has(key) ? ' checked' : ''}><span>${esc(label)}</span></label>`).join('');
    els.flags.hidden = !Object.keys(list.flags).length;
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
      [...state.flags].every(f => i.f && i.f.includes(f)) && terms.every(t => i._h.includes(t)));
    const sort = SORTS[state.sort];
    if (sort.cmp) visible = [...visible].sort(sort.cmp);
  }

  function itemHtml(i) {
    const by = [i.c, i.y].filter(Boolean).map(esc).join(' · ');
    const where = [];
    if (state.sort !== 'shelf' && i.s) where.push(splitShelf(i.s)[1]);
    if (i.u) where.push(i.u);
    const tags = (i.f || []).map(f => `<li class="al-tag al-tag-${esc(f)}">${esc(list.flags[f])}</li>`);
    if (i.d) tags.push(`<li class="al-tag al-tag-done">${esc(list.doneLabel || 'Done')}</li>`);
    return `<article class="al-item" id="item-${i._id}" tabindex="-1"><div class="al-item-head"><h3>${esc(i.t)}</h3>${by ? `<p class="al-by">${by}</p>` : ''}</div>` +
      `<div class="al-item-body">${i.n ? `<p class="al-note">${esc(i.n)}</p>` : ''}${where.length ? `<p class="al-where">${where.map(esc).join(' / ')}</p>` : ''}</div>` +
      `${tags.length ? `<ul class="al-tags">${tags.join('')}</ul>` : ''}</article>`;
  }

  function render() {
    filter();
    const noun = list.noun[items.length === 1 ? 0 : 1];
    els.count.textContent = visible.length === items.length
      ? `All ${number(items.length)} ${noun}.`
      : `Showing ${number(visible.length)} of ${number(items.length)} ${noun}.`;
    els.random.disabled = !visible.length;
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

  async function selectList(id, fromUrl) {
    list = lists.find(l => l.id === id) || lists[0];
    if (!fromUrl) Object.assign(state, { q: '', group: '', shelf: '', sort: 'shelf', flags: new Set() });
    renderTabs();
    els.count.textContent = 'Loading the shelves…';
    if (!cache[list.id]) {
      const response = await fetch(`data/${encodeURIComponent(list.id)}.json`);
      const data = await response.json();
      data.forEach((i, n) => {
        i._id = n; i._t = titleKey(i.t); i._c = creatorKey(i.c);
        i._h = fold([i.t, i.c, i.y, i.g, i.s, i.u, i.n].filter(Boolean).join(' '));
      });
      cache[list.id] = data;
    }
    items = cache[list.id];
    renderControls();
    render();
    writeUrl();
  }

  let timer;
  els.q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = els.q.value.trim(); render(); writeUrl(); }, 120); });
  els.group.addEventListener('change', () => { state.group = els.group.value; renderShelves(); render(); writeUrl(); });
  els.shelf.addEventListener('change', () => { state.shelf = els.shelf.value; render(); writeUrl(); });
  els.sort.addEventListener('change', () => { state.sort = els.sort.value; render(); writeUrl(); });
  els.flags.addEventListener('change', event => {
    const box = event.target;
    box.checked ? state.flags.add(box.value) : state.flags.delete(box.value);
    render(); writeUrl();
  });
  els.reset.addEventListener('click', () => { Object.assign(state, { q: '', group: '', shelf: '', sort: 'shelf', flags: new Set() }); renderControls(); render(); writeUrl(); });
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
  fetch('data/lists.json').then(r => r.json()).then(data => { lists = data; return selectList(state.list, true); })
    .catch(() => { els.count.textContent = 'The shelves could not be loaded. Try refreshing the page.'; });
})();
