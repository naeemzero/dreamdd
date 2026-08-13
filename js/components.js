// =============================================================================
// js/components.js  —  Dream Development DD · v2 Shared Components
// =============================================================================

const Components = (() => {

  const NAV_ITEMS = [
    { label:'Home', href:'#/' },
    {
      label:'Investment & Growth',
      children:[
        { label:'Our Portfolio',           href:'#/portfolio',   icon:'📈' },
        { label:'Financial Transparency',  href:'#/financials',  icon:'📊' },
      ],
    },
    {
      label:'Membership Hub',
      children:[
        { label:'Apply for Membership',    href:'#/apply',              icon:'📝' },
        { label:'New Member Requirements', href:'#/new-member',         icon:'📋' },
        { label:'Membership Benefits',     href:'#/benefits',           icon:'⭐' },
        { label:'Nominee & Succession',    href:'#/nominee-succession', icon:'🔁' },
        { label:'FAQ',                     href:'#/faq',                icon:'❓' },
        { label:'Member Login',            href:'#/login',              icon:'🔐' },
      ],
    },
    {
      label:'Our Leadership',
      children:[
        { label:'Board of Founders',    href:'#/founders',   icon:'🏆' },
        { label:'Executive Committee',  href:'#/committee',  icon:'🏛️' },
        { label:'Our Members',          href:'#/members',    icon:'👥' },
      ],
    },
    {
      label:'Community Standards',
      children:[
        { label:'Core Values & Ethics', href:'#/values',   icon:'🌟' },
        { label:'Code of Conduct',      href:'#/conduct',  icon:'📜' },
        { label:'Rules & Regulations',  href:'#/rules',    icon:'⚖️' },
        { label:'CSR & Social Impact',  href:'#/csr',      icon:'🤝' },
      ],
    },
  ];

  // ── NAVBAR ───────────────────────────────────────────────────────────────────

  const Navbar = {
    render() {
      const nav = document.getElementById('navbar'); if(!nav) return;
      const logo = Utils.getCustomLogo();

      nav.innerHTML = `
        <div class="nav-inner container">
          <a href="#/" class="nav-brand" aria-label="${CONFIG.ORG_NAME} home">
            ${logo
              ? `<img src="${logo}" alt="${CONFIG.ORG_SHORT} logo" class="nav-brand__custom-logo">`
              : `<div class="nav-brand__logo" aria-hidden="true"><span>D</span><span>D</span></div>`}
            <div class="nav-brand__text">
              <span class="nav-brand__name">${CONFIG.ORG_NAME}</span>
              <span class="nav-brand__tagline">${CONFIG.ORG_TAGLINE}</span>
            </div>
          </a>

          <ul class="nav-menu" role="menubar" id="nav-desktop-menu">
            ${NAV_ITEMS.map((item) => this._renderItem(item)).join('')}
          </ul>

          <div class="nav-auth" id="nav-auth-area">${this._renderAuth()}</div>

          <button class="nav-hamburger" id="nav-hamburger"
                  aria-label="Toggle navigation" aria-expanded="false"
                  aria-controls="nav-mobile-panel">
            <span></span><span></span><span></span>
          </button>
        </div>

        <div class="nav-mobile-panel" id="nav-mobile-panel" aria-hidden="true">
          <div class="nav-mobile-inner">
            ${NAV_ITEMS.map((item) => this._renderMobileItem(item)).join('')}
            <div class="nav-mobile-auth" id="nav-mobile-auth">${this._renderAuth(true)}</div>
          </div>
        </div>`;

      this._bindEvents();
    },

    _renderItem(item) {
      if (!item.children) return `
        <li role="none">
          <a href="${item.href}" class="nav-link" role="menuitem">${item.label}</a>
        </li>`;
      return `
        <li class="nav-dropdown" role="none">
          <button class="nav-link nav-link--dropdown" aria-haspopup="true" aria-expanded="false" role="menuitem">
            ${item.label}
            <svg class="nav-caret" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
          </button>
          <ul class="nav-dropdown__menu" role="menu">
            ${item.children.map((c) => `
              <li role="none">
                <a href="${c.href}" class="nav-dropdown__item" role="menuitem">
                  <span class="nav-dropdown__icon" aria-hidden="true">${c.icon}</span>
                  <span>${c.label}</span>
                </a>
              </li>`).join('')}
          </ul>
        </li>`;
    },

    _renderMobileItem(item) {
      if (!item.children) return `<a href="${item.href}" class="nav-mob-link">${item.label}</a>`;
      return `
        <div class="nav-mob-group">
          <button class="nav-mob-toggle" aria-expanded="false">
            ${item.label}
            <svg class="nav-caret" width="10" height="6" viewBox="0 0 10 6" aria-hidden="true">
              <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="nav-mob-submenu" hidden>
            ${item.children.map((c) => `
              <a href="${c.href}" class="nav-mob-sublink"><span aria-hidden="true">${c.icon}</span> ${c.label}</a>`).join('')}
          </div>
        </div>`;
    },

    _renderAuth(mobile=false) {
      const cls = mobile ? 'btn btn--outline btn--sm btn--full' : 'btn btn--outline btn--sm';
      const pCls = mobile ? 'btn btn--primary btn--sm btn--full mt-2' : 'btn btn--primary btn--sm';
      if (!Auth.isLoggedIn()) {
        return `<a href="#/login" class="${cls}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>
          Member Login
        </a>`;
      }
      const user = Auth.getUser();
      return `
        <div class="nav-user ${mobile?'nav-user--mobile':''}">
          <img src="${user.photo||'https://i.pravatar.cc/40?img=1'}"
               alt="${Utils.escapeHtml(user.name)}'s avatar"
               class="nav-user__avatar" width="32" height="32" loading="lazy">
          <span class="nav-user__name">${Utils.escapeHtml(user.name.split(' ')[0])}</span>
        </div>
        <a href="${Auth.portalRoute()}" class="${pCls}">
          ${Auth.getRole()==='admin' ? '⚙️ Admin' : '📋 Dashboard'}
        </a>
        <button class="${mobile?'btn btn--ghost btn--sm btn--full mt-2':'btn btn--ghost btn--sm'}"
                id="${mobile?'nav-mob-logout':'nav-logout'}">Sign Out</button>`;
    },

    updateAuthState() {
      const a = document.getElementById('nav-auth-area');
      const m = document.getElementById('nav-mobile-auth');
      if(a) a.innerHTML = this._renderAuth(false);
      if(m) m.innerHTML = this._renderAuth(true);
      this._bindAuthEvents();
      // Refresh logo in case admin changed it
      const brandLogo = document.querySelector('.nav-brand__custom-logo');
      const brandLogoWrap = document.querySelector('.nav-brand');
      if (!brandLogo) {
        const cl = Utils.getCustomLogo();
        if (cl && brandLogoWrap) {
          const logoEl = brandLogoWrap.querySelector('.nav-brand__logo');
          if (logoEl) {
            const img = document.createElement('img');
            img.src = cl; img.alt = `${CONFIG.ORG_SHORT} logo`; img.className = 'nav-brand__custom-logo';
            logoEl.replaceWith(img);
          }
        }
      }
    },

    _bindAuthEvents() {
      ['nav-logout','nav-mob-logout'].forEach((id) => {
        document.getElementById(id)?.addEventListener('click', async () => {
          await Auth.logout();
          this.updateAuthState();
          Router.navigate('#/');
          Utils.toast('You have been signed out.','info');
        });
      });
    },

    _bindEvents() {
      // Dropdown
      document.querySelectorAll('.nav-dropdown').forEach((dd) => {
        const btn=dd.querySelector('.nav-link--dropdown');
        const menu=dd.querySelector('.nav-dropdown__menu');
        const open  = () => { btn.setAttribute('aria-expanded','true');  dd.classList.add('nav-dropdown--open'); };
        const close = () => { btn.setAttribute('aria-expanded','false'); dd.classList.remove('nav-dropdown--open'); };
        dd.addEventListener('mouseenter', open);
        dd.addEventListener('mouseleave', close);
        btn.addEventListener('click', ()=> btn.getAttribute('aria-expanded')==='true' ? close() : open());
        btn.addEventListener('keydown', (e) => {
          if(e.key==='Enter'||e.key===' '){ e.preventDefault(); open(); menu.querySelector('a')?.focus(); }
          if(e.key==='Escape') close();
        });
        menu.querySelectorAll('a').forEach((a,i,arr) => {
          a.addEventListener('keydown', (e) => {
            if(e.key==='Escape')     { close(); btn.focus(); }
            if(e.key==='ArrowDown')  { e.preventDefault(); arr[i+1]?.focus(); }
            if(e.key==='ArrowUp')    { e.preventDefault(); i===0?btn.focus():arr[i-1]?.focus(); }
          });
          a.addEventListener('click', close);
        });
      });

      // Outside click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
          document.querySelectorAll('.nav-dropdown--open').forEach((dd) => {
            dd.classList.remove('nav-dropdown--open');
            dd.querySelector('.nav-link--dropdown').setAttribute('aria-expanded','false');
          });
        }
      });

      // Hamburger
      const ham=document.getElementById('nav-hamburger'), panel=document.getElementById('nav-mobile-panel');
      ham?.addEventListener('click', ()=>{
        const open = ham.getAttribute('aria-expanded')==='true';
        ham.setAttribute('aria-expanded',String(!open));
        panel.setAttribute('aria-hidden',String(open));
        panel.classList.toggle('nav-mobile-panel--open',!open);
        ham.classList.toggle('nav-hamburger--open',!open);
      });
      panel?.querySelectorAll('a').forEach((a) => a.addEventListener('click', ()=>{
        ham.setAttribute('aria-expanded','false');
        panel.setAttribute('aria-hidden','true');
        panel.classList.remove('nav-mobile-panel--open');
        ham.classList.remove('nav-hamburger--open');
      }));

      // Mobile sub-menus
      document.querySelectorAll('.nav-mob-toggle').forEach((btn) => {
        btn.addEventListener('click', ()=>{
          const sub=btn.nextElementSibling, open=sub.hidden;
          sub.hidden=!open; btn.setAttribute('aria-expanded',String(open));
          btn.classList.toggle('nav-mob-toggle--open',open);
        });
      });

      // Scroll shadow
      window.addEventListener('scroll', ()=>{
        document.getElementById('site-header')?.classList.toggle('header--scrolled', window.scrollY>8);
      }, {passive:true});

      this._bindAuthEvents();
    },
  };

  // ── FOOTER ───────────────────────────────────────────────────────────────────

  const Footer = {
    render() {
      const footer = document.getElementById('site-footer'); if(!footer) return;
      const year = new Date().getFullYear();

      footer.innerHTML = `
        <div class="footer-body">
          <div class="container footer-grid">

            <div class="footer-col footer-col--brand">
              <div class="footer-brand">
                <div class="footer-logo" aria-hidden="true"><span>D</span><span>D</span></div>
                <div>
                  <p class="footer-org">${CONFIG.ORG_NAME}</p>
                  <p class="footer-tagline-text">"${CONFIG.ORG_TAGLINE}"</p>
                </div>
              </div>
              <p class="footer-about">
                A ${CONFIG.ORG_MEMBERS}-member democratic investment collective where every voice is equal,
                every decision is transparent, and every contribution builds a shared future.
                Founded ${CONFIG.ORG_FOUNDED} in Dhaka, Bangladesh.
              </p>
              <p class="footer-term-badge">${CONFIG.TERM_LABEL}</p>
            </div>

            <div class="footer-col">
              <h3 class="footer-heading">Quick Links</h3>
              <ul class="footer-links">
                <li><a href="#/portfolio">Our Portfolio</a></li>
                <li><a href="#/financials">Financial Transparency</a></li>
                <li><a href="#/founders">Board of Founders</a></li>
                <li><a href="#/committee">Executive Committee</a></li>
                <li><a href="#/csr">CSR &amp; Social Impact</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h3 class="footer-heading">Membership</h3>
              <ul class="footer-links">
                <li><a href="#/benefits">Membership Benefits</a></li>
                <li><a href="#/faq">FAQ</a></li>
                <li><a href="#/values">Core Values</a></li>
                <li><a href="#/rules">Rules &amp; Regulations</a></li>
                <li><a href="#/nominee-succession">Nominee &amp; Succession</a></li>
              </ul>
              <a href="#/apply" class="btn btn--gold btn--sm footer-join-btn">
                ✚ Apply for Membership
              </a>
            </div>

            <div class="footer-col">
              <h3 class="footer-heading">Contact Us</h3>
              <ul class="footer-contact">
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <a href="mailto:${CONFIG.CONTACT_EMAIL}">${CONFIG.CONTACT_EMAIL}</a>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M22 16.92v3a2 2 0 01-2.18 2A19.79 19.79 0 0112 18.69a19.5 19.5 0 01-5.39-5.39 19.79 19.79 0 01-3.23-8.63A2 2 0 015.18 2.5H8a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L9.91 9.91a16 16 0 006.12 6.12l.76-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <a href="tel:${CONFIG.CONTACT_PHONE}">${CONFIG.CONTACT_PHONE}</a>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  <a href="https://wa.me/${CONFIG.CONTACT_WHATSAPP.replace(/\D/g,'')}" target="_blank" rel="noopener">
                    WhatsApp: ${CONFIG.CONTACT_WHATSAPP}
                  </a>
                </li>
                <li>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>${CONFIG.CONTACT_ADDRESS}</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

        <div class="footer-bottom">
          <div class="container footer-bottom-inner">
            <p class="footer-copy">© ${year} ${CONFIG.ORG_NAME}. All rights reserved.</p>
            <nav class="footer-legal" aria-label="Legal links">
              <a href="#/rules">Terms of Use</a>
              <a href="#/values">Privacy Policy</a>
              <a href="#/conduct">Code of Conduct</a>
            </nav>
          </div>
        </div>`;
    },
  };

  // ── WHATSAPP FLOATING BUTTON ──────────────────────────────────────────────────

  const WhatsAppBtn = {
    render() {
      const num = CONFIG.CONTACT_WHATSAPP.replace(/\D/g,'');
      const btn = document.createElement('a');
      btn.href      = `https://wa.me/${num}?text=Hello%20Dream%20Development%20DD!`;
      btn.target    = '_blank';
      btn.rel       = 'noopener noreferrer';
      btn.className = 'wa-fab';
      btn.setAttribute('aria-label', 'Chat on WhatsApp');
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span class="wa-fab__label">WhatsApp</span>`;
      document.body.appendChild(btn);
    },
  };

  return { Navbar, Footer, WhatsAppBtn };

})();
