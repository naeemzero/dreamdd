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

  // 3. Router ──────────────────────────────────────────────────────────────────
  Router.init();

})();
