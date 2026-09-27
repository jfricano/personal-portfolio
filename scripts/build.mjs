import { cp, mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
export const root = fileURLToPath(new URL('../', import.meta.url));
export async function build() {
  const out = path.join(root, 'dist');
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(path.join(root, 'site'), out, { recursive: true });
  for (const folder of ['branding', 'artwork']) {
    await cp(path.join(root, folder), path.join(out, folder), {
      recursive: true,
      filter: source => !/\.(md|png)$/i.test(source),
    });
  }
  await cp(path.join(root, 'mockups/assets'), path.join(out, 'assets'), { recursive: true });
  for (const name of await readdir(out)) {
    if (!/\.(html|css)$/.test(name)) continue;
    const file = path.join(out, name);
    const text = await readFile(file, 'utf8');
    await writeFile(file, text.replaceAll('../mockups/assets/', 'assets/').replaceAll('../branding/', 'branding/').replaceAll('../artwork/', 'artwork/'));
  }
  console.log('Built standalone site in dist/');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) await build();
