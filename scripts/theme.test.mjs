import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';

const source = readFileSync(new URL('../site/theme.js', import.meta.url), 'utf8');

function fixture({ saved = null, dark = false, blocked = false } = {}) {
  const events = {};
  const root = { dataset: {}, style: { setProperty() {} } };
  const elements = [];
  const storage = new Map(saved ? [['portfolio-theme', saved]] : []);
  const system = { matches: dark, addEventListener: (_, fn) => { events.system = fn; } };
  const document = {
    documentElement: root,
    querySelector: selector => selector === '.masthead' ? { getBoundingClientRect: () => ({ height: 120 }) } :
      selector === '.masthead .nav' ? { append() {} } : null,
    addEventListener: (name, fn) => { events[name] = fn; },
    createElement: tag => {
      const el = { tag, append() {}, setAttribute() {}, addEventListener: (name, fn) => { el[name] = fn; } };
      elements.push(el);
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
  return { root, events, system, storage, select: elements.find(el => el.tag === 'select') };
}

test('Auto follows OS changes, including an invalid saved value', () => {
  const f = fixture({ saved: 'invalid', dark: true });
  assert.equal(f.root.dataset.theme, 'dark');
  assert.equal(f.select.value, 'system');
  f.system.matches = false;
  f.events.system();
  assert.equal(f.root.dataset.theme, 'light');
});

test('Explicit choice persists and ignores OS changes; Auto clears it', () => {
  const f = fixture({ saved: 'dark' });
  f.events.system();
  assert.equal(f.root.dataset.theme, 'dark');
  f.select.value = 'light';
  f.select.change();
  assert.equal(f.storage.get('portfolio-theme'), 'light');
  f.system.matches = true;
  f.select.value = 'system';
  f.select.change();
  assert.equal(f.storage.has('portfolio-theme'), false);
  assert.equal(f.root.dataset.theme, 'dark');
});

test('Storage denial still allows a page-local choice', () => {
  const f = fixture({ blocked: true });
  f.select.value = 'dark';
  f.select.change();
  assert.equal(f.root.dataset.theme, 'dark');
});

test('Other tabs synchronize changes and clearing storage restores Auto', () => {
  const f = fixture();
  f.events.storage({ key: 'unrelated', newValue: 'dark' });
  assert.equal(f.root.dataset.theme, 'light');
  f.events.storage({ key: 'portfolio-theme', newValue: 'dark' });
  assert.equal(f.select.value, 'dark');
  f.events.storage({ key: null, newValue: null });
  assert.equal(f.select.value, 'system');
  assert.equal(f.root.dataset.theme, 'light');
});
