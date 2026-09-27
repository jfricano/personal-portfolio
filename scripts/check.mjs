import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { build, root } from './build.mjs';
await build();
const directory = path.join(root, 'dist');
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(path.join(dir, entry.name)) : path.join(dir, entry.name)))).flat();
}
let checks = 0;
const pages = (await files(directory)).filter(file => file.endsWith('.html'));
for (const file of pages) {
  const name = path.relative(directory, file);
  const html = await readFile(file, 'utf8');
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1) throw Error(`${name}: expected one H1`);
  if ((html.match(/<main(?:\s|>)/g) || []).length !== 1) throw Error(`${name}: expected one main landmark`);
  if (!html.includes('name="viewport"')) throw Error(`${name}: missing viewport`);
  if (!/<html\s[^>]*lang="[^"]+"/.test(html)) throw Error(`${name}: missing language`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) throw Error(`${name}: duplicate IDs`);
  for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https:|mailto:|data:)/.test(value)) continue;
    const [target, anchor] = value.split('#');
    const destination = target ? path.resolve(path.dirname(file), target) : file;
    if (!destination.startsWith(directory + path.sep)) throw Error(`${name}: outside build ${value}`);
    await stat(destination);
    if (anchor) {
      const content = await readFile(destination, 'utf8');
      if (!content.includes(`id="${anchor}"`)) throw Error(`${name}: missing anchor ${value}`);
    }
    checks++;
  }
  for (const [tag] of html.matchAll(/<img\b[^>]*>/g)) {
    if (!/\balt=/.test(tag)) throw Error(`${name}: image missing alternative text`);
    checks++;
  }
}
console.log(`Passed ${checks} local references, anchors, and image alternatives across ${pages.length} pages; H1, main, language, viewport, and unique IDs checked.`);
