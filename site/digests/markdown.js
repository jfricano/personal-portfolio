// A small Markdown renderer for digests: headings, paragraphs, lists, block quotes, rules, bold,
// italics, code and links. Everything is escaped first, so raw HTML in a digest shows as text.
// A YouTube link in a block also gets an embedded player after that block, starting at its &t= time.
window.renderDigest = (() => {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Accepts youtube.com/watch?v=, youtu.be/, /embed/ and /shorts/ links; t= may be 4360, 4360s or 1h12m40s.
  function youtube(href) {
    let url;
    try { url = new URL(href); } catch { return null; }
    const host = url.hostname.replace(/^(www|m)\./, '');
    let id = '';
    if (host === 'youtu.be') id = url.pathname.slice(1);
    else if (host === 'youtube.com' || host === 'youtube-nocookie.com') id = url.searchParams.get('v') || (/^\/(?:embed|shorts|live)\/([^/]+)/.exec(url.pathname) || [])[1] || '';
    if (!/^[\w-]{11}$/.test(id)) return null;
    const t = url.searchParams.get('t') || url.searchParams.get('start') || '';
    const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/.exec(t);
    const start = m ? (+m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
    return { id, start };
  }
  const clock = s => [Math.floor(s / 3600), Math.floor(s / 60) % 60, s % 60].map((n, i) => (i ? String(n).padStart(2, '0') : n)).join(':').replace(/^0:/, '');

  function inline(text, videos) {
    const links = [];
    const hold = html => `\u0000${links.push(html) - 1}\u0000`;
    const link = (label, href) => {
      const video = youtube(href);
      if (video) videos.push(video);
      const bare = label.replace(/&amp;/g, '&') === href ? ' class="dg-bare"' : '';
      return hold(`<a href="${esc(href)}"${bare} target="_blank" rel="noopener noreferrer">${label}</a>`);
    };
    let s = esc(text);
    s = s.replace(/`([^`]+)`/g, (_, code) => hold(`<code>${code}</code>`));
    s = s.replace(/\[([^\]]+)\]\((https:\/\/[^\s)]+)\)/g, (_, label, href) => link(label, href.replace(/&amp;/g, '&')));
    s = s.replace(/(^|[\s(])(https:\/\/[^\s<]+[^\s<.,;:!?)'"])/g, (_, before, href) => before + link(href, href.replace(/&amp;/g, '&')));
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/__(.+?)__/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^\w*])\*(?!\s)(.+?)\*(?!\w)/g, '$1<em>$2</em>').replace(/(^|[^\w])_(?!\s)(.+?)_(?!\w)/g, '$1<em>$2</em>');
    return s.replace(/\u0000(\d+)\u0000/g, (_, n) => links[n]);
  }

  const players = videos => videos.map(({ id, start }) =>
    `<figure class="dg-video"><div class="dg-video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${start}` : ''}" title="YouTube video${start ? ` from ${clock(start)}` : ''}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div></figure>`).join('');

  function blocks(lines) {
    let html = '', i = 0;
    const para = [];
    const flush = () => {
      if (!para.length) return;
      const videos = [];
      html += `<p>${inline(para.join(' '), videos)}</p>${players(videos)}`;
      para.length = 0;
    };
    while (i < lines.length) {
      const line = lines[i];
      let m;
      if (!line.trim()) { flush(); i++; continue; }
      if ((m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line))) {
        flush();
        // A digest's own headings start at ##; they render one level below the page's title.
        const level = Math.min(6, Math.max(2, m[1].length + 1));
        const videos = [];
        html += `<h${level}>${inline(m[2], videos)}</h${level}>${players(videos)}`;
        i++; continue;
      }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { flush(); html += '<hr>'; i++; continue; }
      if (/^\s*>/.test(line)) {
        flush();
        const quote = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''));
        html += `<blockquote>${blocks(quote)}</blockquote>`;
        continue;
      }
      if ((m = /^(\s*)([-*+]|\d+[.)])\s+/.exec(line))) {
        flush();
        const ordered = /\d/.test(m[2]);
        const items = [];
        while (i < lines.length) {
          const item = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/.exec(lines[i]);
          if (item && /\d/.test(item[2]) === ordered && item[1].length <= m[1].length + 1) { items.push([item[3]]); i++; continue; }
          // Indented lines (including nested lists) belong to the item above.
          if (items.length && lines[i].trim() && /^\s{2,}/.test(lines[i])) { items.at(-1).push(lines[i].replace(/^\s{2,4}/, '')); i++; continue; }
          break;
        }
        const tag = ordered ? 'ol' : 'ul';
        html += `<${tag}>${items.map(([first, ...rest]) => {
          const videos = [];
          const head = inline(first, videos);
          return `<li>${head}${players(videos)}${rest.length ? blocks(rest) : ''}</li>`;
        }).join('')}</${tag}>`;
        continue;
      }
      para.push(line.trim());
      i++;
    }
    flush();
    return html;
  }

  return markdown => blocks(String(markdown).replace(/\r\n?/g, '\n').split('\n'));
})();
