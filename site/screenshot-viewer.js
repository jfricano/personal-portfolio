const links = document.querySelectorAll('[data-screenshot]');

if (links.length && typeof HTMLDialogElement !== 'undefined' &&
    typeof HTMLDialogElement.prototype.showModal === 'function') {
  const viewer = document.createElement('dialog');
  viewer.className = 'screenshot-viewer';
  viewer.setAttribute('aria-labelledby', 'screenshot-viewer-title');
  viewer.setAttribute('aria-describedby', 'screenshot-viewer-note');

  const header = document.createElement('div');
  header.className = 'screenshot-viewer-header';
  const description = document.createElement('div');
  const title = document.createElement('p');
  title.id = 'screenshot-viewer-title';
  title.className = 'screenshot-viewer-title';
  const note = document.createElement('p');
  note.id = 'screenshot-viewer-note';
  note.className = 'screenshot-viewer-note';
  note.textContent = 'GetFit v1 reference. Scroll to see the full view.';
  description.append(title, note);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'screenshot-viewer-close';
  close.textContent = 'Close ×';
  close.autofocus = true;
  header.append(description, close);

  const body = document.createElement('div');
  body.className = 'screenshot-viewer-body';
  body.tabIndex = 0;
  body.setAttribute('role', 'region');
  body.setAttribute('aria-label', 'Enlarged screenshot');
  const image = document.createElement('img');
  image.className = 'screenshot-viewer-image';
  body.append(image);
  viewer.append(header, body);
  document.body.append(viewer);

  let opener;
  links.forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      opener = link;
      const thumbnail = link.querySelector('img');
      image.src = thumbnail.currentSrc || thumbnail.src;
      image.alt = thumbnail.alt;
      title.textContent = link.dataset.screenshot;
      viewer.showModal();
      body.scrollTop = 0;
      document.body.classList.add('screenshot-open');
    });
  });

  close.addEventListener('click', () => viewer.close());
  // Only a click that starts and ends on the backdrop closes the viewer.
  let startedOutside = false;
  const outside = event => {
    const rect = viewer.getBoundingClientRect();
    return event.clientX < rect.left || event.clientX > rect.right ||
      event.clientY < rect.top || event.clientY > rect.bottom;
  };
  viewer.addEventListener('pointerdown', event => { startedOutside = outside(event); });
  viewer.addEventListener('click', event => {
    if (startedOutside && outside(event)) viewer.close();
    startedOutside = false;
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('screenshot-open');
    opener?.focus({ preventScroll: true });
  });
}
