// Normalizes anti-library source lists into site/antilibrary/data/.
// Usage: node scripts/antilibrary-import.mjs <source-folder>
// A new list is one more entry in LISTS; sources that are missing are skipped.
import { readFile, writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { root } from './build.mjs';

const LISTS = [
  {
    id: 'books', label: 'Books', noun: ['book', 'books'], source: 'anti-library.json',
    fields: { title: 'title', creator: 'author', group: 'part', shelf: 'section', note: 'hook' },
    creatorLabel: 'Author', groupLabel: 'Part', shelfLabel: 'Section', doneLabel: 'Read',
    flags: { owned: { field: 'owned', label: 'On my shelf' }, star: { field: 'star', label: 'Vonnegut frequency' } },
  },
  {
    id: 'films', label: 'Films', noun: ['film', 'films'], source: 'movies.csv',
    fields: { title: 'title', creator: 'director', year: 'year', shelf: 'shelf', sub: 'section', note: 'note', done: 'watched' },
    creatorLabel: 'Director', shelfLabel: 'Shelf', doneLabel: 'Watched',
    flags: { start: { field: 'start_here', label: 'Start here' } },
  },
  {
    id: 'albums', label: 'Albums', noun: ['album', 'albums'], source: 'albums.csv',
    fields: { title: 'title', creator: 'artist', year: 'year', shelf: 'shelf', sub: 'section', note: 'note', done: 'heard' },
    creatorLabel: 'Artist', shelfLabel: 'Shelf', doneLabel: 'Heard',
    flags: { start: { field: 'start_here', label: 'Start here' } },
  },
];

function parseCsv(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter(r => r.some(Boolean));
  return body.map(r => Object.fromEntries(head.map((key, i) => [key.trim(), (r[i] ?? '').trim()])));
}

const truthy = value => value === true || /^(yes|y|x|true|1|✓|★)$/i.test(String(value ?? '').trim());
const clean = value => String(value ?? '').trim();

const sourceDir = process.argv[2];
if (!sourceDir) { console.error('Usage: node scripts/antilibrary-import.mjs <source-folder>'); process.exit(1); }
const out = path.join(root, 'site/antilibrary/data');
await mkdir(out, { recursive: true });
const manifest = [];
for (const list of LISTS) {
  const file = path.join(sourceDir, list.source);
  try { await access(file); } catch { console.log(`Skipped ${list.id}: no ${list.source}`); continue; }
  const text = await readFile(file, 'utf8');
  const records = list.source.endsWith('.json') ? JSON.parse(text) : parseCsv(text);
  const { fields } = list;
  const items = records.filter(r => clean(r[fields.title])).map(r => {
    const item = { t: clean(r[fields.title]) };
    for (const [key, field] of [['c', fields.creator], ['y', fields.year], ['g', fields.group], ['s', fields.shelf], ['u', fields.sub], ['n', fields.note]]) {
      const value = field && clean(r[field]);
      if (value) item[key] = key === 'y' && /^\d+$/.test(value) ? Number(value) : value;
    }
    const flags = Object.entries(list.flags).filter(([, flag]) => truthy(r[flag.field])).map(([key]) => key);
    if (flags.length) item.f = flags;
    if (fields.done && truthy(r[fields.done])) item.d = 1;
    return item;
  });
  await writeFile(path.join(out, `${list.id}.json`), JSON.stringify(items));
  const { source, fields: _, ...meta } = list;
  manifest.push({ ...meta, flags: Object.fromEntries(Object.entries(list.flags).map(([key, flag]) => [key, flag.label])),
    hasYear: items.some(item => item.y), count: items.length });
  console.log(`Imported ${items.length} ${list.noun[1]}`);
}
await writeFile(path.join(out, 'lists.json'), JSON.stringify(manifest, null, 1) + '\n');
