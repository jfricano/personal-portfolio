// Builds a Word file (.docx) from the open digest, in the browser, with no library or service.
// A .docx is a ZIP of a few XML parts; this writes them uncompressed. The text comes from the
// rendered digest, so it matches the page: headings, paragraphs, quotes, lists, bold, italics,
// code and links. Embedded videos are left out; their links stay in the text.
window.digestDocx = (() => {
  const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
  const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
  const xml = s => String(s).replace(/[^\x09\x0A\x0D\x20-퟿-�\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Store-only ZIP.
  const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc32 = bytes => { let c = 0xFFFFFFFF; for (const b of bytes) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  function zip(files) {
    const enc = new TextEncoder(), local = [], central = [];
    const now = new Date();
    const time = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const date = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    let offset = 0;
    for (const [name, text] of files) {
      const nameBytes = enc.encode(name), data = enc.encode(text), crc = crc32(data);
      const head = new DataView(new ArrayBuffer(30));
      [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, time, 2], [12, date, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, nameBytes.length, 2], [28, 0, 2]]
        .forEach(([at, v, size]) => size === 4 ? head.setUint32(at, v, true) : head.setUint16(at, v, true));
      const entry = new DataView(new ArrayBuffer(46));
      [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, time, 2], [14, date, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, nameBytes.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, offset, 4]]
        .forEach(([at, v, size]) => size === 4 ? entry.setUint32(at, v, true) : entry.setUint16(at, v, true));
      local.push(head, nameBytes, data);
      central.push(entry, nameBytes);
      offset += 30 + nameBytes.length + data.length;
    }
    const size = central.reduce((n, part) => n + part.byteLength, 0);
    const end = new DataView(new ArrayBuffer(22));
    [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, offset, 4], [20, 0, 2]]
      .forEach(([at, v, s]) => s === 4 ? end.setUint32(at, v, true) : end.setUint16(at, v, true));
    return new Blob([...local, ...central, end], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  }

  const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W}">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia" w:eastAsia="Georgia" w:cs="Georgia"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:lang w:val="en-US"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="160" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:spacing w:after="80"/></w:pPr><w:rPr><w:sz w:val="56"/><w:szCs w:val="56"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:color w:val="555555"/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Label"><w:name w:val="Label"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:pPr><w:spacing w:after="60"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:caps/><w:color w:val="9A4A2E"/><w:spacing w:val="10"/><w:sz w:val="17"/><w:szCs w:val="17"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Facts"><w:name w:val="Facts"/><w:basedOn w:val="Label"/><w:next w:val="Normal"/><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="8" w:color="222222"/></w:pBdr><w:spacing w:after="240"/></w:pPr><w:rPr><w:color w:val="555555"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:sz w:val="34"/><w:szCs w:val="34"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="80"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:sz w:val="27"/><w:szCs w:val="27"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:keepNext/><w:spacing w:before="200" w:after="60"/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Quote"><w:name w:val="Quote"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:pPr><w:pBdr><w:left w:val="single" w:sz="12" w:space="12" w:color="9A4A2E"/></w:pBdr><w:ind w:left="360"/></w:pPr><w:rPr><w:i/><w:sz w:val="24"/><w:szCs w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:after="80"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Rule"><w:name w:val="Rule"/><w:basedOn w:val="Normal"/><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="BBBBBB"/></w:pBdr></w:pPr></w:style>
<w:style w:type="character" w:styleId="Hyperlink"><w:name w:val="Hyperlink"/><w:rPr><w:color w:val="9A4A2E"/><w:u w:val="single"/></w:rPr></w:style>
</w:styles>`;

  return function build(meta, prose) {
    const links = [], body = [];
    const linkId = href => { let i = links.indexOf(href); if (i < 0) i = links.push(href) - 1; return `rIdL${i + 1}`; };
    const run = (text, f = {}) => text ? `<w:r>${f.b || f.i || f.code || f.link ? `<w:rPr>${f.link ? '<w:rStyle w:val="Hyperlink"/>' : ''}${f.code ? '<w:rFonts w:ascii="Courier New" w:hAnsi="Courier New"/>' : ''}${f.b ? '<w:b/>' : ''}${f.i ? '<w:i/>' : ''}</w:rPr>` : ''}<w:t xml:space="preserve">${xml(text)}</w:t></w:r>` : '';
    // Inline content of an element, skipping nested lists and video figures.
    function runs(node, f = {}) {
      let out = '';
      for (const child of node.childNodes) {
        if (child.nodeType === 3) { out += run(child.textContent.replace(/\s+/g, ' '), f); continue; }
        if (child.nodeType !== 1) continue;
        const tag = child.tagName;
        if (tag === 'UL' || tag === 'OL' || tag === 'FIGURE' || tag === 'BLOCKQUOTE') continue;
        if (tag === 'BR') { out += '<w:r><w:br/></w:r>'; continue; }
        if (tag === 'A' && /^https?:/.test(child.href)) { out += `<w:hyperlink r:id="${linkId(child.href)}">${runs(child, { ...f, link: true })}</w:hyperlink>`; continue; }
        out += runs(child, { ...f, b: f.b || tag === 'STRONG' || tag === 'B', i: f.i || tag === 'EM' || tag === 'I', code: f.code || tag === 'CODE' });
      }
      return out;
    }
    const para = (style, content, ppr = '') => body.push(`<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ''}${ppr}</w:pPr>${content}</w:p>`);
    function blocks(node, quote, depth) {
      for (const el of node.children) {
        const tag = el.tagName;
        if (/^H[3-6]$/.test(tag)) para(`Heading${Math.min(+tag[1] - 2, 3)}`, runs(el));
        else if (tag === 'P') para(quote ? 'Quote' : null, runs(el));
        else if (tag === 'BLOCKQUOTE') blocks(el, true, depth);
        else if (tag === 'HR') para('Rule', '');
        else if (tag === 'UL' || tag === 'OL') {
          [...el.children].filter(li => li.tagName === 'LI').forEach((li, n) => {
            const marker = tag === 'OL' ? `${n + 1}.` : '•';
            para(quote ? 'Quote' : 'ListParagraph', run(marker) + '<w:r><w:tab/></w:r>' + runs(li), `<w:tabs><w:tab w:val="left" w:pos="${360 * (depth + 1)}"/></w:tabs><w:ind w:left="${360 * (depth + 1)}" w:hanging="360"/>`);
            [...li.children].filter(c => c.tagName === 'UL' || c.tagName === 'OL' || c.tagName === 'BLOCKQUOTE').forEach(c => blocks({ children: [c] }, quote, depth + 1));
          });
        }
      }
    }

    if (meta.label) para('Label', run(meta.label));
    para('Title', run(meta.title));
    if (meta.by) para('Subtitle', run(meta.by));
    if (meta.hook) para('Subtitle', run(meta.hook, { i: true }));
    if (meta.facts?.length) para('Facts', run(meta.facts.join('  ·  ')));
    blocks(prose, false, 0);

    const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W}" xmlns:r="${R}"><w:body>${body.join('')}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body></w:document>`;
    const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="${R}/styles" Target="styles.xml"/>${links.map((href, i) => `<Relationship Id="rIdL${i + 1}" Type="${R}/hyperlink" Target="${xml(href)}" TargetMode="External"/>`).join('')}</Relationships>`;
    const core = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${xml(meta.title)}</dc:title><dc:creator>Jason Fricano</dc:creator><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().replace(/\.\d+Z$/, 'Z')}</dcterms:created></cp:coreProperties>`;
    return zip([
      ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`],
      ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${R}/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`],
      ['docProps/core.xml', core],
      ['word/document.xml', document],
      ['word/styles.xml', STYLES],
      ['word/_rels/document.xml.rels', rels],
    ]);
  };
})();
