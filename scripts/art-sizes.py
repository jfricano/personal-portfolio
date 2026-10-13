"""Makes the smaller copies of the page art that browsers download in place of the 1536 px originals.

The per-list picture by the tabs shows about 175 px wide, the headline still life up to 440 px, and the thread
picture 300 px, so the originals (about 500 KB each) were ten to twenty times more than those slots need. Run this
after replacing any image listed below; `npm run check` fails until the copies match their originals.

    python3 scripts/art-sizes.py      (needs Pillow: python3 -m pip install pillow)
"""
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
# original -> widths of the copies, named <name>-<width>.jpg beside it
SIZES = {
    'antilibrary/art/books.jpg': [480],
    'antilibrary/art/films.jpg': [480],
    'antilibrary/art/tv.jpg': [480],
    'antilibrary/art/albums.jpg': [480],
    'antilibrary/art/general.jpg': [960, 1536],
    'assets/lavender-thread.jpg': [600],
}
MANIFEST = ROOT / 'scripts' / 'art-sizes.json'

manifest = {}
for name, widths in SIZES.items():
    source = SITE / name
    image = Image.open(source).convert('RGB')
    for width in widths:
        height = round(image.height * width / image.width)
        target = source.with_name(f'{source.stem}-{width}.jpg')
        image.resize((width, height), Image.LANCZOS).save(target, quality=82, optimize=True, progressive=True)
        print(f'{target.relative_to(ROOT)}  {target.stat().st_size // 1024} KB')
    manifest[name] = {'sha256': hashlib.sha256(source.read_bytes()).hexdigest(), 'widths': widths}
MANIFEST.write_text(json.dumps(manifest, indent=2) + '\n')
