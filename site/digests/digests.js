// The private digests shelf. Digests live in a private GitHub repository (data-repo on <main>), so
// this page holds nothing private: it reads that repository through GitHub's API with a read-only
// key the owner pastes once per browser. Marks work like owner mode on the anti-library: they wait in
// this browser until the owner sends them as one prefilled issue, and a workflow in the digests
// repository applies issues the owner opens to its marks.json.
(() => {
  const REPO = document.getElementById('main').dataset.repo;
  const TOKEN_KEY = 'digests-token', PENDING_KEY = 'digests-pending-marks';
  const LISTS = { books: 'Books', films: 'Films', tv: 'TV', albums: 'Albums' };
  // "In full" means reading a book, watching a film or show, listening to an album.
  const VERBS = { books: ['Read', 'Reading'], films: ['Watch', 'Watching'], tv: ['Watch', 'Watching'], albums: ['Listen to', 'Listening to'] };
  const verbs = list => VERBS[list] || VERBS.books;
  // The second mark records finishing the title itself: "Fully read" for a book (not "Read", which reads as "reed").
  const FULLY = { books: 'Fully read', films: 'Fully watched', tv: 'Fully watched', albums: 'Fully heard' };
  const MARKS = { read: () => ['Digested', 'Mark digested'], deeper: list => [FULLY[list] || FULLY.books, `Mark ${(FULLY[list] || FULLY.books).toLowerCase()}`] };
  const VERDICTS = { yes: list => `Worth ${verbs(list)[1].toLowerCase()} in full`, sample: () => 'Sample it', enough: () => 'The digest is enough' };
  const SHOW = { '': () => 'Everything', unread: () => 'Not digested yet', read: () => 'Digested', deeper: list => MARKS.deeper(list)[0], draft: () => 'Drafts' };
  const TAB_KEY = 'digests-tab';
  const $ = id => document.getElementById(id);
  const els = {
    lock: $('dg-lock'), lockForm: $('dg-lock-form'), key: $('dg-key'), unlock: $('dg-unlock'), lockError: $('dg-lock-error'),
    browser: $('dg-browser'), tabs: $('dg-tabs'), q: $('dg-q'), show: $('dg-show'), count: $('dg-count'), results: $('dg-results'),
    queue: $('dg-queue'), queueList: $('dg-queue-list'), ownerText: $('dg-owner-text'), send: $('dg-send'), discard: $('dg-discard'),
    forget: $('dg-forget'), reader: $('dg-reader'), intro: document.querySelector('.dg-intro'),
  };
  const store = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } },
    set(key, value) { try { value === null ? localStorage.removeItem(key) : localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const fold = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const today = () => new Date().toISOString().slice(0, 10);
  const longDate = d => new Date(`${d}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  let token = store.get(TOKEN_KEY, '');
  let digests = [], marks = {}, queue = [], pending = store.get(PENDING_KEY, {});
  const state = { q: '', list: store.get(TAB_KEY, 'books'), show: '' };

  class Locked extends Error {}
  async function get(path) {
    const response = await fetch(`https://api.github.com/repos/${REPO}/contents/${path.split('/').map(encodeURIComponent).join('/')}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github.raw+json', 'X-GitHub-Api-Version': '2022-11-28' },
      cache: 'no-cache',
    });
    if (response.status === 401 || response.status === 403) throw new Locked();
    if (response.status === 404) return null;
    if (!response.ok) throw Error(`GitHub answered ${response.status}`);
    return response.text();
  }
  const json = async (path, fallback) => { const text = await get(path); return text ? JSON.parse(text) : fallback; };

  // Marks: the published ones from marks.json, overridden by any still waiting in this browser.
  const markOf = (d, mark) => {
    const waiting = pending[d.list]?.[d.key];
    if (waiting && mark in waiting) return waiting[mark];
    return marks[d.list]?.[d.key]?.[mark] || null;
  };
  const isUnsent = (d, mark) => Boolean(pending[d.list]?.[d.key] && mark in pending[d.list][d.key]);
  function setMark(d, mark, value) {
    pending[d.list] ??= {};
    pending[d.list][d.key] ??= {};
    pending[d.list][d.key][mark] = value;
    prunePending();
  }
  function prunePending() {
    for (const [list, entries] of Object.entries(pending)) {
      for (const [key, fields] of Object.entries(entries)) {
        for (const [mark, value] of Object.entries(fields)) if (Boolean(marks[list]?.[key]?.[mark]) === Boolean(value)) delete fields[mark];
        if (!Object.keys(fields).length) delete entries[key];
      }
      if (!Object.keys(entries).length) delete pending[list];
    }
    store.set(PENDING_KEY, Object.keys(pending).length ? pending : null);
  }
  const pendingCount = () => Object.values(pending).reduce((n, entries) => n + Object.values(entries).reduce((m, f) => m + Object.keys(f).length, 0), 0);
  function issueUrl() {
    const lines = [];
    for (const [list, entries] of Object.entries(pending)) for (const [key, fields] of Object.entries(entries)) {
      const [title, creator] = key.split('|');
      for (const [mark, value] of Object.entries(fields)) { const on = MARKS[mark](list)[0]; lines.push(`- ${value ? on : `Not ${on.toLowerCase()}`}: ${title}${creator ? ` (${creator})` : ''}`); }
    }
    const count = pendingCount();
    const body = `${lines.join('\n')}\n\nThe digests page wrote this issue. Submit it to update the marks.\n\n\`\`\`json\n${JSON.stringify(pending)}\n\`\`\`\n`;
    return `https://github.com/${REPO}/issues/new?${new URLSearchParams({ title: `Digests: update ${count} ${count === 1 ? 'mark' : 'marks'}`, body })}`;
  }
  function renderOwnerBar() {
    const count = pendingCount();
    els.ownerText.textContent = count
      ? `${count} ${count === 1 ? 'mark is' : 'marks are'} saved in this browser and not yet sent.`
      : 'Mark digests as you read them, then send the marks.';
    els.send.hidden = els.discard.hidden = !count;
    if (count) els.send.href = issueUrl();
  }

  const markButtons = d => Object.entries(MARKS).map(([mark, words]) => {
    const [on, off] = words(d.list), value = markOf(d, mark);
    return `<button type="button" class="al-mark${isUnsent(d, mark) ? ' al-unsent' : ''}" data-mark="${mark}" data-id="${esc(d.id)}" aria-pressed="${Boolean(value)}">${value ? `✓ ${esc(on)}` : esc(off)}</button>`;
  }).join('');
  const tagsFor = d => [
    d.status === 'draft' && '<li class="al-tag dg-tag-draft">Draft</li>',
    d.fringe && '<li class="al-tag dg-tag-fringe">Respectful fringe</li>',
    markOf(d, 'read') && '<li class="al-tag al-tag-done">Digested</li>',
    markOf(d, 'deeper') && `<li class="al-tag al-tag-start">${esc(MARKS.deeper(d.list)[0])}</li>`,
  ].filter(Boolean).join('');

  // The list.
  function filtered() {
    const terms = fold(state.q).split(/\s+/).filter(Boolean);
    const tests = {
      unread: d => !markOf(d, 'read'), read: d => markOf(d, 'read'), deeper: d => markOf(d, 'deeper'), draft: d => d.status === 'draft',
    };
    return digests.filter(d => d.list === state.list && (!state.show || tests[state.show](d)) && terms.every(t => d._h.includes(t)));
  }
  function cardHtml(d) {
    const by = [d.creator, d.year].filter(Boolean).map(esc).join(' · ');
    const meta = [d.track, d.minutes && `${d.minutes} min read`].filter(Boolean).map(esc).join(' / ');
    return `<article class="al-item dg-item${markOf(d, 'read') ? ' dg-read' : ''}" id="dg-${esc(d.id.replace('/', '-'))}">` +
      `<div class="al-item-head"><h3><a href="#${esc(d.id)}">${esc(d.title)}</a></h3>${by ? `<p class="al-by">${by}</p>` : ''}<div class="dg-marks">${markButtons(d)}</div></div>` +
      `<div class="al-item-body">${d.hook ? `<p class="al-note">${esc(d.hook)}</p>` : ''}${meta ? `<p class="al-where">${meta}</p>` : ''}</div>` +
      `<ul class="al-tags">${tagsFor(d)}</ul></article>`;
  }
  function renderList() {
    const shown = filtered(), inList = digests.filter(d => d.list === state.list);
    const read = inList.filter(d => markOf(d, 'read')).length;
    els.count.textContent = inList.length
      ? `${shown.length === inList.length ? `All ${inList.length}` : `Showing ${shown.length} of ${inList.length}`} ${inList.length === 1 ? 'digest' : 'digests'}, ${read} digested.`
      : 'No digests here yet. The first ones are on their way.';
    els.results.innerHTML = shown.length ? `<div class="al-list">${shown.map(cardHtml).join('')}</div>`
      : inList.length ? '<p class="al-empty">Nothing matches. Try fewer words, or show everything.</p>' : '';
    const waiting = queue.filter(q => q.list === state.list && !digests.some(d => d.list === q.list && d.key === `${q.title}|${q.creator || ''}`));
    els.queue.hidden = !waiting.length;
    els.queueList.innerHTML = waiting.map(q => `<li><span class="dg-queue-title">${esc(q.title)}</span>${q.creator ? ` <span class="dg-queue-by">${esc(q.creator)}</span>` : ''}${q.why ? `<span class="dg-queue-why">${esc(q.why)}</span>` : ''}</li>`).join('');
    renderOwnerBar();
  }
  // One tab per list that has digests or titles waiting, like the anti-library's tab row.
  const tabLists = () => Object.keys(LISTS).filter(id => digests.some(d => d.list === id) || queue.some(q => q.list === id));
  function renderControls() {
    const ids = tabLists();
    if (ids.length && !ids.includes(state.list)) state.list = ids[0];
    els.tabs.innerHTML = ids.map(id => `<button type="button" role="tab" id="dg-tab-${id}" data-id="${id}" aria-controls="dg-results" aria-selected="${id === state.list}" tabindex="${id === state.list ? 0 : -1}">${LISTS[id]} <span>${digests.filter(d => d.list === id).length}</span></button>`).join('');
    els.show.innerHTML = Object.entries(SHOW).map(([key, label]) => `<option value="${key}"${key === state.show ? ' selected' : ''}>${esc(label(state.list))}</option>`).join('');
    els.q.value = state.q;
    showArt();
  }
  function selectList(id) {
    state.list = id;
    store.set(TAB_KEY, id);
    renderControls();
    renderList();
  }
  // The anti-library's illustration for the list sits beside the headline.
  function showArt() {
    const figure = $('dg-art'), image = $('dg-art-img');
    if (image.dataset.list === state.list) return;
    figure.classList.remove('is-shown');
    image.onload = () => { if (image.dataset.list === state.list) { figure.hidden = false; figure.classList.add('is-shown'); } };
    image.onerror = () => { figure.hidden = true; };
    image.dataset.list = state.list;
    image.src = `../antilibrary/art/${encodeURIComponent(state.list)}.jpg`;
  }

  // One digest.
  const stripFrontMatter = text => text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  async function openDigest(d) {
    if (d.list !== state.list) { state.list = d.list; store.set(TAB_KEY, d.list); renderControls(); }
    els.reader.innerHTML = `<p class="dg-back"><a href="#">← All digests</a></p><p class="dg-count">Opening ${esc(d.title)}…</p>`;
    showView('reader');
    let body;
    try { body = stripFrontMatter(await get(d.path) || ''); } catch (error) { return handleError(error); }
    if (location.hash.slice(1) !== d.id) return;
    const facts = [
      [LISTS[d.list], d.track].filter(Boolean).join(' · '),
      d.axis && `Style: ${d.axis}`,
      d.neighbor && `Shelf neighbor: ${d.neighbor}`,
      d.verdict && VERDICTS[d.verdict]?.(d.list),
      d.minutes && `${d.minutes} min read`,
      (d.updated || d.written) && `Updated ${longDate(d.updated || d.written)}`,
    ].filter(Boolean);
    els.reader.innerHTML = `<p class="dg-back"><a href="#">← All digests</a></p>` +
      `<header class="dg-reader-head"><p class="label">${esc(LISTS[d.list] || 'Digest')}${d.status === 'draft' ? ' · draft' : ''}</p><h2 class="dg-reader-title">${esc(d.title)}</h2>` +
      `${d.creator || d.year ? `<p class="dg-reader-by">${[d.creator, d.year].filter(Boolean).map(esc).join(' · ')}</p>` : ''}` +
      `${d.hook ? `<p class="dg-reader-hook">${esc(d.hook)}</p>` : ''}<ul class="dg-facts">${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` +
      `<div class="dg-marks">${markButtons(d)}</div><ul class="al-tags dg-reader-tags"${tagsFor(d) ? '' : ' hidden'}>${tagsFor(d)}</ul>` +
      `<div class="dg-export"><button type="button" class="al-button al-quiet" data-export="print">Print or save as PDF</button><button type="button" class="al-button al-quiet" data-export="docx">Download Word file</button></div></header>` +
      `<div class="dg-prose">${window.renderDigest(body)}</div>` +
      `<p class="dg-back dg-back-end"><a href="#">← All digests</a> · <a href="../antilibrary/?list=${encodeURIComponent(d.list)}&amp;q=${encodeURIComponent(d.title)}">Find it in the anti-library</a></p>`;
    current = { d, facts };
    els.reader.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }

  // Printing uses the print styles in digests.css; the browser's print dialog also saves a PDF.
  // The Word file is built in this browser by docx.js, loaded the first time it's asked for.
  let current = null;
  const loadScript = src => new Promise((resolve, reject) => {
    document.head.append(Object.assign(document.createElement('script'), { src, onload: resolve, onerror: reject }));
  });
  async function downloadDocx(button) {
    const { d, facts } = current;
    button.disabled = true;
    button.textContent = 'Preparing…';
    try {
      if (!window.digestDocx) await loadScript('docx.js');
      const blob = window.digestDocx({
        label: `${LISTS[d.list] || 'Digest'}${d.status === 'draft' ? ' · draft' : ''}`, title: d.title,
        by: [d.creator, d.year].filter(Boolean).join(' · '), hook: d.hook, facts,
      }, els.reader.querySelector('.dg-prose'));
      const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `${d.slug || 'digest'}.docx` });
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 10000);
      button.textContent = 'Download Word file';
    } catch {
      button.textContent = 'Couldn’t build it. Try again';
    } finally {
      button.disabled = false;
    }
  }

  function showView(view) {
    els.lock.hidden = view !== 'lock';
    els.browser.hidden = view !== 'list';
    els.reader.hidden = view !== 'reader';
    els.intro.hidden = view === 'reader';
  }
  function route() {
    const id = decodeURIComponent(location.hash.slice(1));
    const d = id && digests.find(x => x.id === id);
    if (d) return openDigest(d);
    showView('list');
    renderList();
  }
  function handleError(error) {
    if (error instanceof Locked) {
      token = ''; store.set(TOKEN_KEY, null);
      els.lockError.textContent = 'GitHub didn’t accept that key. Check that it can read the digests repository and hasn’t expired.';
    } else {
      els.lockError.textContent = 'The digests couldn’t be loaded. Check the connection and try again.';
    }
    showView('lock');
  }

  async function load() {
    if (!token) { showView('lock'); return; }
    els.unlock.disabled = true;
    try {
      const index = await json('index.json', null);
      if (!index) { token = ''; store.set(TOKEN_KEY, null); els.lockError.textContent = 'That key can’t see the digests repository. Give it read access to reading-list.'; showView('lock'); return; }
      [marks, queue] = await Promise.all([json('marks.json', {}), json('queue.json', [])]);
      digests = index.filter(d => LISTS[d.list] && d.title && d.path).map(d => ({
        ...d, id: `${d.list}/${d.slug}`,
        _h: fold([d.title, d.creator, d.year, d.track, d.hook, d.neighbor, d.axis, LISTS[d.list]].filter(Boolean).join(' ')),
      }));
      prunePending();
      els.lockError.textContent = '';
      renderControls();
      route();
    } catch (error) {
      handleError(error);
    } finally {
      els.unlock.disabled = false;
    }
  }

  els.lockForm.addEventListener('submit', event => {
    event.preventDefault();
    token = els.key.value.trim();
    els.key.value = '';
    store.set(TOKEN_KEY, token || null);
    load();
  });
  els.forget.addEventListener('click', () => {
    token = ''; digests = []; store.set(TOKEN_KEY, null);
    els.results.innerHTML = '';
    els.lockError.textContent = '';
    if (location.hash) history.replaceState(null, '', location.pathname);
    showView('lock');
  });
  els.discard.addEventListener('click', () => { pending = {}; store.set(PENDING_KEY, null); route(); });
  els.reader.addEventListener('click', event => {
    const button = event.target.closest('[data-export]');
    if (!button || !current) return;
    if (button.dataset.export === 'print') window.print();
    else downloadDocx(button);
  });
  document.addEventListener('click', event => {
    const button = event.target.closest('.al-mark[data-mark]');
    if (!button) return;
    const d = digests.find(x => x.id === button.dataset.id);
    const mark = button.dataset.mark;
    setMark(d, mark, markOf(d, mark) ? null : today());
    const pressed = Boolean(markOf(d, mark));
    button.setAttribute('aria-pressed', pressed);
    button.classList.toggle('al-unsent', isUnsent(d, mark));
    const [on, off] = MARKS[mark](d.list);
    button.textContent = pressed ? `✓ ${on}` : off;
    const tags = button.closest('.al-item, .dg-reader-head')?.querySelector('.al-tags');
    if (tags) { tags.innerHTML = tagsFor(d); tags.hidden = !tags.innerHTML; }
    if (!els.browser.hidden) { els.count.textContent = els.count.textContent.replace(/[\d,]+ digested\.$/, `${digests.filter(x => markOf(x, 'read')).length} digested.`); renderOwnerBar(); }
    else renderOwnerBar();
  });
  let timer;
  els.q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.q = els.q.value.trim(); renderList(); }, 120); });
  els.show.addEventListener('change', () => { state.show = els.show.value; renderList(); });
  els.tabs.addEventListener('click', event => { const tab = event.target.closest('[role=tab]'); if (tab) selectList(tab.dataset.id); });
  els.tabs.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...els.tabs.querySelectorAll('[role=tab]')], at = tabs.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (at + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault();
    selectList(tabs[next].dataset.id);
    $(`dg-tab-${tabs[next].dataset.id}`).focus();
  });
  window.addEventListener('hashchange', () => { if (token && els.lock.hidden) route(); });

  load();
})();
