import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../site/theme.js', import.meta.url), 'utf8');

function fixture({ saved = null, dark = false, blocked = false } = {}) {
  const events = {};
  const root = { dataset: {}, style: { setProperty() {} } };
  const inserted = [];
  const storage = new Map(saved ? [['portfolio-theme', saved]] : []);
  const system = { matches: dark, addEventListener: (_, fn) => { events.system = fn; } };
  const nav = {};
  const masthead = {
    getBoundingClientRect: () => ({ height: 120 }),
    querySelector: selector => selector === '.nav' ? nav : null,
    insertBefore: (el, before) => inserted.push([el, before]),
  };
  const document = {
    documentElement: root,
    querySelector: selector => selector === '.masthead' ? masthead : null,
    addEventListener: (name, fn) => { events[name] = fn; },
    createElement: tag => {
      const el = { tag, attrs: {}, setAttribute: (k, v) => { el.attrs[k] = v; }, addEventListener: (name, fn) => { el[name] = fn; } };
      return el;
    },
  };
  const guard = fn => (...args) => { if (blocked) throw new Error('Storage denied'); return fn(...args); };
  vm.runInNewContext(source, {
    document,
    window: { matchMedia: () => system, addEventListener: (name, fn) => { events[name] = fn; } },
    localStorage: { getItem: guard(k => storage.get(k)), setItem: guard((k, v) => storage.set(k, v)), removeItem: guard(k => storage.delete(k)) },
  });
  events.DOMContentLoaded();
  const [[toggle, before]] = inserted;
  return { root, events, system, storage, toggle, before, nav };
}

test('The switch is a labelled button placed just before the links', () => {
  const f = fixture();
  assert.equal(f.toggle.tag, 'button');
  assert.equal(f.toggle.type, 'button');
  assert.equal(f.toggle.attrs['aria-label'], 'Dark theme');
  assert.equal(f.toggle.attrs['aria-pressed'], 'false');
  assert.equal(f.before, f.nav);
});

test('Auto follows OS changes, including an invalid saved value', () => {
  const f = fixture({ saved: 'invalid', dark: true });
  assert.equal(f.root.dataset.theme, 'dark');
  assert.equal(f.toggle.attrs['aria-pressed'], 'true');
  f.system.matches = false;
  f.events.system();
  assert.equal(f.root.dataset.theme, 'light');
  assert.equal(f.toggle.attrs['aria-pressed'], 'false');
});

test('Flipping away from the device setting persists; flipping back follows the device again', () => {
  const f = fixture();
  f.toggle.click();
  assert.equal(f.root.dataset.theme, 'dark');
  assert.equal(f.storage.get('portfolio-theme'), 'dark');
  f.system.matches = true;
  f.events.system();
  f.system.matches = false;
  f.events.system();
  assert.equal(f.root.dataset.theme, 'dark', 'an explicit choice ignores OS changes');
  f.toggle.click();
  assert.equal(f.root.dataset.theme, 'light');
  assert.equal(f.storage.has('portfolio-theme'), false);
  f.system.matches = true;
  f.events.system();
  assert.equal(f.root.dataset.theme, 'dark', 'back on Auto, the page follows the device');
});

test('A saved choice that matches the device still flips to the other theme', () => {
  const f = fixture({ saved: 'dark', dark: true });
  f.toggle.click();
  assert.equal(f.root.dataset.theme, 'light');
  assert.equal(f.storage.get('portfolio-theme'), 'light');
  f.toggle.click();
  assert.equal(f.root.dataset.theme, 'dark');
  assert.equal(f.storage.has('portfolio-theme'), false);
});

test('Storage denial still allows a page-local choice', () => {
  const f = fixture({ blocked: true });
  f.toggle.click();
  assert.equal(f.root.dataset.theme, 'dark');
  assert.equal(f.toggle.attrs['aria-pressed'], 'true');
});

test('Other tabs synchronize changes and clearing storage restores Auto', () => {
  const f = fixture();
  f.events.storage({ key: 'unrelated', newValue: 'dark' });
  assert.equal(f.root.dataset.theme, 'light');
  f.events.storage({ key: 'portfolio-theme', newValue: 'dark' });
  assert.equal(f.root.dataset.theme, 'dark');
  assert.equal(f.toggle.attrs['aria-pressed'], 'true');
  f.events.storage({ key: null, newValue: null });
  assert.equal(f.root.dataset.theme, 'light');
});
