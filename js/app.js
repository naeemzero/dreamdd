// =============================================================================
// js/app.js  —  Dream Development DD · v2 Application Entry Point
// =============================================================================
// Boot sequence:
//   1. Render persistent shell (Navbar, Footer, WhatsApp FAB)
//   2. Bind global UI event listeners (modal, keyboard)
//   3. Load live announcement bar
//   4. Start the router
// =============================================================================

(async function boot() {

  // 1. Shell ──────────────────────────────────────────────────────────────────
  Components.Navbar.render();
  Components.Footer.render();
  Components.WhatsAppBtn.render();

  // 2. Global UI ──────────────────────────────────────────────────────────────
  const overlay = document.getElementById('modal-overlay');
  overlay?.addEventListener('click', (e) => { if (e.target === overlay) Utils.modal.close(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('modal--active')) Utils.modal.close();
  });
  document.getElementById('modal-close')?.addEventListener('click', Utils.modal.close);

  // 3. Announcement bar ────────────────────────────────────────────────────────
  try {
    const { data } = await API.getNotices(1);
    const bar  = document.getElementById('announcement-bar');
    const text = document.getElementById('announcement-text');
    if (data.length && bar && text) {
      const latest = data[0];
      text.innerHTML = `
        <strong>${Utils.escapeHtml(latest.category)}:</strong>
        ${Utils.escapeHtml(latest.title)}
        <a href="#notice-board" onclick="window.location.hash='#/'">View all notices →</a>`;
      bar.removeAttribute('aria-hidden');
    } else {
      document.getElementById('announcement-bar')?.remove();
    }
  } catch {
    document.getElementById('announcement-bar')?.remove();
  }

  // 4. Router ──────────────────────────────────────────────────────────────────
  Router.init();

})();
