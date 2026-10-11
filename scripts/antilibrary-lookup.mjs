// Finds a public page and cover image for each anti-library item, using keyless public APIs:
// Open Library for books, Wikipedia for films. Music uses Wikipedia for the link and Deezer
// for artwork, then MusicBrainz and the Cover Art Archive for anything still missing.
// Results are cached in site/antilibrary/data/lookups.json so each title is looked up once.
// Usage: node scripts/antilibrary-lookup.mjs [--retry]   (--retry re-checks titles with no match)
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { root } from './build.mjs';

const dataDir = path.join(root, 'site/antilibrary/data');
const cacheFile = path.join(dataDir, 'lookups.json');
const UA = 'jfricano-antilibrary/1.0 (https://github.com/jfricano/personal-portfolio)';

export const lookupKey = (listId, item) => `${listId}|${item.t}|${item.c || ''}`;

export async function readLookups() {
  try { return JSON.parse(await readFile(cacheFile, 'utf8')); } catch { return {}; }
}

// Copies cached links (l) and images (i) onto items in place.
export function applyLookups(listId, items, lookups) {
  for (const item of items) {
    const hit = lookups[lookupKey(listId, item)];
    delete item.l; delete item.i;
    if (hit?.l) item.l = hit.l;
    if (hit?.i) item.i = hit.i;
  }
  return items;
}

const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  .replace(/&/g, ' and ').replace(/\(.*?\)/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/^\s*(the|a|an)\s+/, '').replace(/\s+/g, ' ').trim();
const short = s => fold(String(s || '').split(/[:;]/)[0]);
const sameTitle = (a, b) => {
  const [x, y] = [short(a), short(b)];
  return Boolean(x && y) && (x === y || (Math.min(x.length, y.length) > 6 && (x.startsWith(y) || y.startsWith(x))));
};
const surname = name => fold(String(name || '').split(/\s*(?:&|,| and )\s*/)[0]).split(' ').filter(w => !/^(jr|sr|ii|iii)$/.test(w)).at(-1) || '';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function getJson(url, headers = {}) {
  for (let attempt = 0; attempt < 5; attempt++) {
    const response = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', ...headers } }).catch(() => null);
    if (response?.ok) return response.json();
    if (response && response.status < 500 && response.status !== 429) throw Error(`${response.status} ${url}`);
    const wait = Number(response?.headers.get('retry-after'));
    await sleep(wait ? wait * 1000 + 250 : 1500 * 2 ** attempt);
  }
  throw Error(`Gave up on ${url}`);
}

async function book(item) {
  const params = new URLSearchParams({ title: item.t.split(':')[0], limit: '8', fields: 'key,title,author_name,cover_i,edition_count' });
  const author = item.c && !/various|anonymous/i.test(item.c) ? surname(item.c) : '';
  if (author) params.set('author', author);
  const { docs = [] } = await getJson(`https://openlibrary.org/search.json?${params}`);
  const matches = docs.filter(d => sameTitle(d.title, item.t) && (!author || (d.author_name || []).some(a => fold(a).includes(author))));
  const doc = matches.find(d => d.cover_i) || matches[0];
  if (!doc) return null;
  return { s: 'openlibrary', l: `https://openlibrary.org${doc.key}`, ...(doc.cover_i && { i: `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` }) };
}

async function wikipedia(query, accept) {
  const params = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', generator: 'search', gsrsearch: query, gsrlimit: '6',
    prop: 'pageimages|description', piprop: 'thumbnail', pithumbsize: '400', pilicense: 'any', redirects: '1', origin: '*' });
  const { query: result } = await getJson(`https://en.wikipedia.org/w/api.php?${params}`);
  const page = (result?.pages || []).sort((a, b) => a.index - b.index).find(accept);
  if (!page) return null;
  return { s: 'wikipedia', l: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`, ...(page.thumbnail && { i: page.thumbnail.source }) };
}
const nearYear = (description, year) => !year || [year - 1, year, year + 1].some(y => description.includes(String(y)));

const film = item => wikipedia(`${item.t} ${item.y || ''} film`, p => {
  const d = p.description || '';
  return sameTitle(p.title, item.t) && /film|documentary|miniseries|series|anime/i.test(d) && nearYear(d, item.y);
});

function wikipediaAlbum(item) {
  if (item.f?.includes('path')) {
    return wikipedia(`${item.t} musician band`, p => sameTitle(p.title, item.t) &&
      /band|musician|singer|rapper|composer|group|songwriter|artist|duo|pianist|saxophonist|trumpeter|guitarist|producer|DJ|ensemble|orchestra/i.test(p.description || ''));
  }
  const artist = surname(item.c);
  return wikipedia(`${item.t} ${item.c || ''} album`, p => {
    const d = p.description || '';
    return sameTitle(p.title, item.t) && /album|soundtrack|compilation|\bEP\b|recording|record|live/i.test(d) &&
      (!artist || fold(d).includes(artist) || fold(p.title).includes(artist));
  });
}

async function deezer(kind, q) {
  const result = await getJson(`https://api.deezer.com/search/${kind}?${new URLSearchParams({ q, limit: '8' })}`);
  if (result.error) throw Error(`Deezer: ${result.error.message || result.error.type}`);
  return result.data || [];
}

async function deezerArt(item) {
  if (item.f?.includes('path')) {
    const match = (await deezer('artist', item.t)).filter(a => sameTitle(a.name, item.t)).sort((a, b) => (b.nb_fan || 0) - (a.nb_fan || 0))[0];
    return match && !/\/artist\/\//.test(match.picture_medium) ? { l: match.link, i: match.picture_medium } : null;
  }
  const artist = surname(item.c);
  const q = item.c ? `artist:"${item.c.split(/\s*(?:&| and |,)\s*/)[0]}" album:"${item.t.split(':')[0]}"` : item.t;
  const match = (await deezer('album', q)).find(a => sameTitle(a.title, item.t) && (!artist || fold(a.artist?.name).includes(artist)));
  return match && !/\/cover\/\//.test(match.cover_medium) ? { l: match.link, i: match.cover_medium } : match ? { l: match.link } : null;
}

// MusicBrainz asks for at most one request per second.
let musicbrainzQueue = Promise.resolve();
const musicbrainz = url => (musicbrainzQueue = musicbrainzQueue.then(() => sleep(1100)).then(() => getJson(url)));

async function musicbrainzArt(item) {
  const path = item.f?.includes('path');
  const q = path ? `artist:"${item.t}"` : `releasegroup:"${item.t.split(':')[0]}"${item.c ? ` AND artist:"${item.c.split(/\s*(?:&| and |,)\s*/)[0]}"` : ''}`;
  const kind = path ? 'artist' : 'release-group';
  const result = await musicbrainz(`https://musicbrainz.org/ws/2/${kind}/?${new URLSearchParams({ query: q, fmt: 'json', limit: '5' })}`);
  const rows = result[path ? 'artists' : 'release-groups'] || [];
  const match = rows.find(r => r.score >= 85 && sameTitle(path ? r.name : r.title, item.t));
  if (!match) return null;
  const hit = { l: `https://musicbrainz.org/${kind}/${match.id}` };
  if (!path) {
    const cover = `https://coverartarchive.org/release-group/${match.id}/front-250`;
    const response = await fetch(cover, { method: 'HEAD', redirect: 'follow', headers: { 'User-Agent': UA } }).catch(() => null);
    if (response?.ok) hit.i = cover;
  }
  return hit;
}

// The Wikipedia page is the better link; Deezer has the more complete artwork; MusicBrainz fills gaps.
async function album(item) {
  const quiet = promise => promise.catch(error => { console.warn(error.message); return null; });
  const [wiki, art] = await Promise.all([wikipediaAlbum(item), quiet(deezerArt(item))]);
  let link = wiki?.l || art?.l, image = art?.i || wiki?.i, source = wiki ? 'wikipedia' : art ? 'deezer' : '';
  if (!image || !link) {
    const brainz = await quiet(musicbrainzArt(item));
    if (brainz) { link ||= brainz.l; image ||= brainz.i; source ||= 'musicbrainz'; }
  }
  return link || image ? { s: source, ...(link && { l: link }), ...(image && { i: image }) } : null;
}

const FINDERS = { books: book, films: film, albums: album };
const LIMITS = { books: 2, films: 4, albums: 3 };

async function run() {
  const retry = process.argv.includes('--retry');
  const lookups = await readLookups();
  const lists = JSON.parse(await readFile(path.join(dataDir, 'lists.json'), 'utf8'));
  let saved = Date.now();
  const save = () => writeFile(cacheFile, JSON.stringify(Object.fromEntries(Object.entries(lookups).sort())));
  for (const list of lists) {
    const find = FINDERS[list.id];
    if (!find) { console.log(`No lookup source for ${list.id}`); continue; }
    const file = path.join(dataDir, `${list.id}.json`);
    const items = JSON.parse(await readFile(file, 'utf8'));
    const todo = items.filter(item => { const key = lookupKey(list.id, item); return !(key in lookups) || (retry && !lookups[key]); });
    console.log(`${list.id}: looking up ${todo.length} of ${items.length}`);
    let next = 0, failed = 0;
    await Promise.all(Array.from({ length: LIMITS[list.id] }, async () => {
      while (next < todo.length) {
        const item = todo[next++];
        try { lookups[lookupKey(list.id, item)] = await find(item); }
        catch (error) { failed++; console.warn(error.message); }
        if (Date.now() - saved > 30000) { saved = Date.now(); await save(); }
      }
    }));
    await writeFile(file, JSON.stringify(applyLookups(list.id, items, lookups)));
    const found = items.filter(item => item.l).length, covers = items.filter(item => item.i).length;
    console.log(`${list.id}: ${found} linked, ${covers} with covers, ${failed} requests failed`);
  }
  await save();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await run();
