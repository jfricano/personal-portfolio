import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { build, root } from './build.mjs';
await build();
const directory = path.join(root, 'dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg'};
const server = http.createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) return res.writeHead(405, {Allow:'GET, HEAD'}).end();
  try {
    const url = new URL(req.url, 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    let file = path.resolve(directory, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (!file.startsWith(directory + path.sep)) throw Error('Not found');
    if ((await stat(file)).isDirectory()) {
      if (!pathname.endsWith('/')) return res.writeHead(301, {Location: `${url.pathname}/${url.search}`}).end();
      file = path.join(file, 'index.html');
    }
    if (!(await stat(file)).isFile()) throw Error('Not found');
    const data = await readFile(file);
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    const page = (await readFile(path.join(directory, '404.html'), 'utf8'))
      .replace('<head>', '<head><base href="/">');
    res.writeHead(404, {'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : page);
  }
});
server.listen(Number(process.env.PORT || 4175), '127.0.0.1', () => console.log(`Personal site: http://127.0.0.1:${process.env.PORT || 4175}`));
server.on('error', error => { console.error(error.message); process.exit(1); });
