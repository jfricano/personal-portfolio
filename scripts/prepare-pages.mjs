import { readFile, writeFile, readdir } from 'node:fs/promises';
import { root } from './build.mjs';
import path from 'node:path';
const base = 'https://jfricano.github.io/personal-portfolio/';
const directory = path.join(root, 'dist');
const urls = [];
// /moreprojects/ and archived case studies retain noindex and stay out of the sitemap.
const archivedPages = new Set(['statbatt.html']);
for (const name of await readdir(directory)) {
  if (!name.endsWith('.html')) continue;
  const file = path.join(directory, name);
  let html = await readFile(file, 'utf8');
  if (name === '404.html') {
    // A missing nested URL must still resolve CSS, identity assets and home links.
    html = html.replace('<head>', `<head><base href="${base}">`);
  } else if (!archivedPages.has(name)) {
    const url = new URL(name === 'index.html' ? '' : name, base).href;
    html = html.replace('<meta name="robots" content="noindex, nofollow">', '');
    html = html.replace('</head>', `<link rel="canonical" href="${url}"><meta property="og:url" content="${url}"></head>`);
    urls.push(url);
  }
  await writeFile(file, html);
}
await writeFile(path.join(directory, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>\n`);
await writeFile(path.join(directory, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n`);
await writeFile(path.join(directory, '.nojekyll'), '');
console.log(`Prepared ${urls.length} public pages for ${base}`);
