import { API } from './api.js';
// =============================================================================
// js/pages.js  —  Dream Development DD · v3
// =============================================================================
// CHANGES FROM v2:
//  • Portfolio: hardcoded capital removed; fetched from admin-editable settings
//  • Financial Transparency: full constitutional investment principles added
//  • Apply for Membership: single reference (ID + phone); no 2nd reference
//  • Nominee & Succession: form removed — members contact admin instead
//  • Code of Conduct: extended with 4 new constitutional clauses
//  • Rules & Regulations: full 9-article constitution
//  • CSR: extended with humanitarian philosophy & reserve fund sections
//  • Member Dashboard: nominee tab removed; gallery submission tab added;
//      invoice rows show downloadable receipts when uploaded by admin
//  • Admin Dashboard: nominee requests tab removed; Gallery, Capital &
//      Investment, and committee term-settings tabs added; invoice upload
//      per member added to Members tab
// =============================================================================

const Pages = (() => {

  const main = () => document.getElementById('main-content');

  // ── SHARED HELPERS ────────────────────────────────────────────────────────────

  const pageHero = (eyebrow, title, subtitle, extra='') => `
    <section class="page-hero">
      <div class="container page-hero__inner">
        <span class="eyebrow">${eyebrow}</span>
        <h1 class="page-hero__title">${title}</h1>
        ${subtitle ? `<p class="page-hero__sub">${subtitle}</p>` : ''}
        ${extra}
      </div>
    </section>`;

  const sec = (id, content, cls='') =>
    `<section id="${id}" class="section ${cls}"><div class="container">${content}</div></section>`;

  const sHead = (label, title, sub='') => `
    <div class="section-head">
      <span class="section-rule" aria-hidden="true"></span>
      <p class="section-eyebrow">${label}</p>
      <h2 class="section-title">${title}</h2>
      ${sub ? `<p class="section-sub">${sub}</p>` : ''}
    </div>`;

  const fmtAddr = (a, type) => {
    if (!a) return '—';
    return type === 'present'
      ? [a.house, a.area, a.city, a.postCode].filter(Boolean).join(', ')
      : ['Village: ' + (a.village||''), 'Upazila: ' + (a.upazila||''), a.district, a.postCode].filter(Boolean).join(', ');
  };

  const relationOptions = ['Father','Mother','Spouse','Son','Daughter','Brother','Sister','Other'];

  // ── 404 ──────────────────────────────────────────────────────────────────────

  const render404 = () => {
    main().innerHTML = `
      <div class="error-page">
        <div class="error-page__inner">
          <div class="error-code" aria-hidden="true">404</div>
          <h1>Page not found</h1>
          <p>The page you are looking for does not exist or has been moved.</p>
          <a href="#/" class="btn btn--primary">Return to Home</a>
        </div>
      </div>`;
  };

  // ── HOME ─────────────────────────────────────────────────────────────────────

  const renderHome = async () => {
    main().innerHTML = `
      <section class="hero" aria-label="Welcome to ${CONFIG.ORG_NAME}">
        <div class="hero__bg" aria-hidden="true">
          <div class="hero__geo hero__geo--1"></div>
          <div class="hero__geo hero__geo--2"></div>
          <div class="hero__geo hero__geo--3"></div>
        </div>
        <div class="container hero__inner">
          <div class="hero__content">
            <span class="eyebrow eyebrow--light">Democratic Investment Organisation · Est. ${CONFIG.ORG_FOUNDED_LABEL}</span>
            <h1 class="hero__title">${CONFIG.ORG_TAGLINE}.</h1>
            <p class="hero__sub">
              ${CONFIG.ORG_NAME} is a democratic investment collective built on equal voice, total transparency,
              and the shared belief that disciplined collective effort turns ordinary savings into
              extraordinary futures — 100% interest-free and Shariah-compliant.
            </p>
            <div class="hero__actions">
              <a href="#/apply"    class="btn btn--gold btn--lg">Apply for Membership</a>
              <a href="#/benefits" class="btn btn--outline-light btn--lg">Explore Benefits</a>
            </div>
          </div>
          <div class="hero__stats" aria-label="Key statistics">
            <div class="stat-card"><span class="stat-card__num">${CONFIG.ORG_MEMBERS}</span><span class="stat-card__label">Active Members</span></div>
            <div class="stat-card"><span class="stat-card__num">${CONFIG.ORG_FOUNDER_COUNT}</span><span class="stat-card__label">Founding Members</span></div>
            <div class="stat-card"><span class="stat-card__num">${new Date().getFullYear() - new Date(CONFIG.ORG_FOUNDED).getFullYear()}+</span><span class="stat-card__label">Years Active</span></div>
            <div class="stat-card"><span class="stat-card__num">100%</span><span class="stat-card__label">Interest-Free</span></div>
          </div>
        </div>
        <a href="#notice-board" class="hero__scroll-cue" aria-label="Scroll down">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10l5 5 5-5"/></svg>
        </a>
      </section>

      <section id="notice-board" class="section section--light">
        <div class="container">
          ${sHead('Latest Updates','Notice Board','Official announcements, meeting schedules, and investment updates.')}
          <div id="notices-grid" class="notices-grid" aria-live="polite" aria-busy="true">${Utils.skeleton(6,'card')}</div>
          <div id="notices-pagination" class="pagination-wrap"></div>
        </div>
      </section>

      <section id="gallery" class="section">
        <div class="container">
          ${sHead('Our Journey','Photo Gallery','Moments from our events, milestones, and community activities.')}
          <div id="gallery-grid" class="gallery-grid" aria-live="polite" aria-busy="true">${Utils.skeleton(8,'card')}</div>
          <div id="gallery-pagination" class="pagination-wrap"></div>
        </div>
      </section>

      <section class="cta-banner">
        <div class="container cta-banner__inner">
          <div>
            <h2 class="cta-banner__title">Ready to build your dream with us?</h2>
            <p class="cta-banner__sub">Membership open to Bangladeshi citizens aged 18–45 with SSC qualification or above.</p>
          </div>
          <a href="#/apply" class="btn btn--gold btn--lg">Apply for Membership</a>
        </div>
      </section>`;
    await Promise.all([_loadNotices(1), _loadGallery(1)]);
  };

  const _loadNotices = async (page) => {
    const grid = document.getElementById('notices-grid'); if(!grid) return;
    grid.innerHTML = Utils.skeleton(6,'card');
    try {
      const { data, totalPages } = await API.getNotices(page);
      grid.setAttribute('aria-busy','false');
      grid.innerHTML = data.length ? data.map(_noticeCard).join('') : `<p class="empty-state">No notices published yet.</p>`;
      Utils.renderPagination('notices-pagination', page, totalPages, _loadNotices);
    } catch(err) { grid.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  const _noticeCard = (n) => `
    <article class="notice-card">
      <div class="notice-card__header">
        ${Utils.badge(n.category)}
        <time class="notice-card__time" datetime="${n.createdAt}">${Utils.timeAgo(n.createdAt)}</time>
      </div>
      <h3 class="notice-card__title">${Utils.escapeHtml(n.title)}</h3>
      <p class="notice-card__body">${Utils.escapeHtml(n.body)}</p>
      ${n.attachmentBase64 ? `<a href="${n.attachmentBase64}" download="${Utils.escapeHtml(n.attachmentName||'attachment')}" class="notice-card__attachment">📎 ${n.attachmentName||'Download Attachment'}</a>` : ''}
      <footer class="notice-card__footer">
        <span class="notice-card__author">— ${Utils.escapeHtml(n.author)}</span>
        <time class="notice-card__date">${Utils.fmtDate(n.createdAt)}</time>
      </footer>
    </article>`;

  const _loadGallery = async (page) => {
    const grid = document.getElementById('gallery-grid'); if(!grid) return;
    grid.innerHTML = Utils.skeleton(8,'card');
    try {
      const { data, totalPages } = await API.getGallery(page);
      grid.setAttribute('aria-busy','false');
      grid.innerHTML = data.map(_galleryItem).join('');
      Utils.renderPagination('gallery-pagination', page, totalPages, _loadGallery);
      grid.querySelectorAll('.gallery-item').forEach((item) => {
        item.addEventListener('click', () => Utils.modal.open(`
          <figure class="lightbox-fig">
            <img src="${item.dataset.src}" alt="${Utils.escapeHtml(item.dataset.caption)}" class="lightbox-img" loading="lazy">
            <figcaption class="lightbox-cap">${Utils.escapeHtml(item.dataset.caption)}</figcaption>
          </figure>`));
      });
    } catch(err) { grid.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  const _galleryItem = (g) => `
    <button class="gallery-item" data-src="${g.url}" data-caption="${Utils.escapeHtml(g.caption)}">
      <img src="${g.url}" alt="${Utils.escapeHtml(g.caption)}" loading="lazy" class="gallery-item__img">
      <div class="gallery-item__overlay" aria-hidden="true">
        <span class="gallery-item__caption">${Utils.escapeHtml(g.caption)}</span>
        <span class="gallery-item__date">${Utils.fmtDateShort(g.date)}</span>
      </div>
    </button>`;

  // ── PORTFOLIO ─────────────────────────────────────────────────────────────────

  const renderPortfolio = async () => {
    main().innerHTML =
      pageHero('Investment & Growth','Our Portfolio','A diversified, interest-free, Shariah-compliant investment strategy focused on sustainable capital growth.') +
      sec('portfolio-overview', `
        ${sHead('Where We Invest','Portfolio Overview','Our portfolio is diversified across three primary Shariah-compliant asset classes.')}
        <div class="cards-grid cards-grid--3">
          ${[
            { icon:'🏦', title:'Fixed Deposits & Savings',   desc:'Shariah-compliant savings instruments and fixed deposits with A-rated institutions, forming the stable core of our portfolio.', pct:'45%' },
            { icon:'📈', title:'Ethical Capital Market',      desc:'Selective positions in fundamentally sound, ethically screened DSE-listed equities and Shariah-compliant mutual funds.',       pct:'30%' },
            { icon:'📋', title:'Sukuk & Islamic Instruments', desc:'Government sukuk bonds and profit-sharing instruments aligned with our strictly interest-free investment mandate.',             pct:'25%' },
          ].map((p) => `
            <div class="feature-card">
              <div class="feature-card__icon" aria-hidden="true">${p.icon}</div>
              <h3 class="feature-card__title">${p.title}</h3>
              <p class="feature-card__desc">${p.desc}</p>
              <div class="progress-bar"><div class="progress-bar__fill" style="width:${p.pct}"></div></div>
              <p class="text-muted" style="font-size:.75rem;margin-top:.25rem;text-align:right">${p.pct} of portfolio</p>
            </div>`).join('')}
        </div>
      `) +
      sec('portfolio-live', `
        ${sHead('Live Status','Current Performance')}
        <div id="capital-stats-display" aria-live="polite">${Utils.skeleton(4,'card')}</div>
        <p class="footnote" style="text-align:center;margin-top:1rem">Capital figures are updated by the Admin and reflect the last verified report.</p>
      `,'section--light') +
      sec('portfolio-principles', `
        ${sHead('Our Mandate','Investment Principles')}
        <div class="two-col">
          <div>
            <h3>100% Interest-Free</h3>
            <p>Every investment made by Dream Development DD is strictly free of riba (interest) and compliant with Shariah principles. This is a core clause of our constitution and cannot be amended without a 6/7 vote of the Board of Founders.</p>
            <h3>Collective Decision Making</h3>
            <p>No single individual or committee member holds unilateral authority over investment decisions. Major capital investments require the explicit consent of at least 5 out of 7 Board of Founders members.</p>
          </div>
          <div>
            <h3>Reserve Fund Mandate</h3>
            <p>Fifteen percent (15%) of all net profits are mandatorily allocated to the organisation's Reserve Fund. These funds are preserved for emergencies, humanitarian CSR initiatives, and member support in case of bereavement.</p>
            <h3>Diversification & Risk</h3>
            <p>Funds are never concentrated in a single project. Every proposed investment undergoes mandatory market analysis, feasibility studies, and risk assessment prior to BoF approval.</p>
          </div>
        </div>
      `);

    // Load capital stats from API
    try {
      const cap = await API.getCapitalSettings();
      const el = document.getElementById('capital-stats-display');
      if (!el) return;
      if (!cap.totalCapital && !cap.annualReturn) {
        el.innerHTML = `<div class="capital-placeholder"><p>Capital performance figures have not been published yet. Please check back after the next General Body Meeting.</p></div>`;
        return;
      }
      el.innerHTML = `<div class="stats-row">
        ${cap.totalCapital  ? `<div class="stat-block"><span class="stat-block__val">৳ ${Utils.fmtMoney(cap.totalCapital,'').trim()}</span><span class="stat-block__label">Total Capital</span><span class="stat-block__note">Last audited figure</span></div>` : ''}
        ${cap.annualReturn  ? `<div class="stat-block"><span class="stat-block__val">${cap.annualReturn}%</span><span class="stat-block__label">Annual Return</span><span class="stat-block__note">Net of expenses</span></div>` : ''}
        ${cap.membersOnTime ? `<div class="stat-block"><span class="stat-block__val">${cap.membersOnTime}%</span><span class="stat-block__label">On-Time Contributions</span><span class="stat-block__note">Last 12 months</span></div>` : ''}
        ${cap.reserveFund   ? `<div class="stat-block"><span class="stat-block__val">৳ ${Utils.fmtMoney(cap.reserveFund,'').trim()}</span><span class="stat-block__label">Reserve Fund</span><span class="stat-block__note">15% of net profits</span></div>` : ''}
      </div>
      ${cap.lastUpdated ? `<p class="footnote" style="text-align:right">Last updated: ${Utils.fmtDateShort(cap.lastUpdated)}</p>` : ''}
      ${cap.note ? `<p class="footnote">${Utils.escapeHtml(cap.note)}</p>` : ''}`;
    } catch { /* silently fail — display stays as loading */ }
  };

  // ── FINANCIAL TRANSPARENCY ─────────────────────────────────────────────────────

  const renderFinancials = async () => {
    main().innerHTML =
      pageHero('Investment & Growth','Financial Transparency','Audited accounts, investment reports, and performance data — open to all members. All figures are updated by the Admin after each AGM.') +
      sec('fin-capital', `
        <div id="fin-capital-stats" aria-live="polite">${Utils.skeleton(4,'card')}</div>
      `) +
      sec('fin-approach', `
        ${sHead('Constitutional Mandate','Our Approach & Investment Principles','As defined by the Dream Development DD constitution and binding on all members and committees.')}
        <div class="doc-page">
          ${[
            {
              h:'Democratic Decision Making',
              p:'No single individual — whether a Board of Founders member, an Executive Council officer, or a general member — holds the authority to make unilateral financial or investment decisions. Any major capital investment requires the explicit written consent of at least <strong>5 out of the 7 members of the Board of Founders (BoF)</strong>. Furthermore, any institutional initiative must consider the opinions of all members, ensuring a highly democratic and collaborative decision-making process at every level.',
            },
            {
              h:'Financial Review & Transparency',
              p:'We maintain strict financial transparency through regular reporting and independent audits. A financial summary is prepared at the end of every month by the Treasurer. Additionally, the Treasurer submits a detailed financial report to the Finance Director and the Board of Founders <strong>every three months</strong>. A fully audited comprehensive financial report is presented to all members during the <strong>Annual General Meeting (AGM)</strong>. General members also reserve the right to officially request and view their personal investment ledger and the organisation\'s financial summaries at any time.',
            },
            {
              h:'Capital Preservation & Risk Management',
              p:'Safeguarding members\' capital is our utmost priority. We strictly mitigate risk through <strong>portfolio diversification</strong> — funds are never concentrated in a single project but distributed across multiple small and medium ventures. Every proposed investment undergoes mandatory market analysis, feasibility studies, and risk assessment prior to BoF approval. All investments are <strong>100% interest-free</strong> and strictly adhere to Shariah-compliant, ethical sectors. To ensure long-term security and handle contingencies, <strong>15% of all net profits</strong> are mandatorily allocated to a Reserve Fund.',
            },
            {
              h:'Exit & Settlement Policy',
              p:'Members wishing to resign must submit a written resignation letter at least <strong>30 days in advance</strong>. To protect the organisation\'s cash flow and project liquidity, financial settlements for exiting members involve a <strong>waiting period of 3 to 6 months</strong>. If a member exits within the first 2 years of joining (the <strong>Lock-in Period</strong>), a 5% "Service Deduction" is applied to their total deposited capital. Furthermore, if the organisation is operating at a financial loss at the time of exit, the departing member must bear their proportional share of that loss.',
            },
          ].map((s)=>`<h3>${s.h}</h3><p>${s.p}</p>`).join('')}
        </div>
      `,'section--light') +
      sec('fin-reports', `
        ${sHead('Documents','Published Reports & Notices')}
        <p class="footnote" style="margin-bottom:1.5rem">Finance-category notices published by the Admin appear below with download links when an attachment is available.</p>
        <div id="fin-notices-list" aria-live="polite" aria-busy="true">${Utils.skeleton(3,'table')}</div>
      `);

    // Load capital settings
    try {
      const cap = await API.getCapitalSettings();
      const el = document.getElementById('fin-capital-stats');
      if (!el) return;
      if (!cap.totalCapital && !cap.annualReturn) {
        el.innerHTML = `<div class="capital-placeholder"><p>Capital performance figures will appear here once published by the Admin after the next AGM.</p></div>`;
      } else {
        el.innerHTML = `<div class="stats-row">
          ${cap.totalCapital  ? `<div class="stat-block"><span class="stat-block__val">৳ ${Utils.fmtMoney(cap.totalCapital,'').trim()}</span><span class="stat-block__label">Total Capital</span><span class="stat-block__note">Audited figure</span></div>` : ''}
          ${cap.annualReturn  ? `<div class="stat-block"><span class="stat-block__val">${cap.annualReturn}%</span><span class="stat-block__label">Annual Return</span><span class="stat-block__note">Net of expenses</span></div>` : ''}
          ${cap.membersOnTime ? `<div class="stat-block"><span class="stat-block__val">${cap.membersOnTime}%</span><span class="stat-block__label">On-Time Contributions</span><span class="stat-block__note">Last 12 months</span></div>` : ''}
          ${cap.reserveFund   ? `<div class="stat-block"><span class="stat-block__val">৳ ${Utils.fmtMoney(cap.reserveFund,'').trim()}</span><span class="stat-block__label">Reserve Fund</span><span class="stat-block__note">15% of net profits</span></div>` : ''}
        </div>${cap.lastUpdated?`<p class="footnote" style="text-align:right">Last updated by Admin: ${Utils.fmtDateShort(cap.lastUpdated)}</p>`:''}`;
      }
    } catch { /* ignore */ }

    // Load finance notices
    try {
      const { data } = await API.getNotices(1);
      const finance = data.filter((n) => n.category === 'Finance');
      const el2 = document.getElementById('fin-notices-list');
      if (!el2) return;
      el2.innerHTML = finance.length
        ? `<div class="doc-list">${finance.map((n) => `
            <div class="doc-row">
              <div class="doc-row__icon">📄</div>
              <div class="doc-row__info">
                <strong>${Utils.escapeHtml(n.title)}</strong>
                <span>${Utils.fmtDateShort(n.createdAt)}</span>
              </div>
              ${n.attachmentBase64
                ? `<a href="${n.attachmentBase64}" download="${Utils.escapeHtml(n.attachmentName||'document')}" class="btn btn--outline btn--sm">📥 Download</a>`
                : `<span class="text-muted">No attachment</span>`}
            </div>`).join('')}</div>`
        : `<p class="empty-state">No finance documents published yet.</p>`;
    } catch(err) {
      const el2 = document.getElementById('fin-notices-list');
      if (el2) el2.innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  };

  // ── APPLY FOR MEMBERSHIP (public) ─────────────────────────────────────────────

  const renderApply = () => {
    main().innerHTML =
      pageHero('Membership Hub','Apply for Membership','Complete the form below. Your application is reviewed by the Admin and presented to the General Body for a vote.') +
      sec('apply-form-section', `
        <form id="apply-form" class="application-form" novalidate>

          <fieldset class="form-fieldset">
            <legend>👤 Personal Information</legend>
            <div class="form-grid">
              <div class="form-group"><label for="ap-name">Full Name <span>*</span></label><input type="text" id="ap-name" name="name" class="input" required placeholder="As per NID"><span class="field-err" id="ap-name-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-dob">Date of Birth <span>*</span></label><input type="date" id="ap-dob" name="dob" class="input" required><span class="field-err" id="ap-dob-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-father">Father's Name <span>*</span></label><input type="text" id="ap-father" name="fatherName" class="input" required><span class="field-err" id="ap-father-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-mother">Mother's Name <span>*</span></label><input type="text" id="ap-mother" name="motherName" class="input" required><span class="field-err" id="ap-mother-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-nid">NID Number <span>*</span></label><input type="text" id="ap-nid" name="nidNumber" class="input" required placeholder="10/13/17-digit number"><span class="field-err" id="ap-nid-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-edu">Educational Qualification <span>*</span></label><input type="text" id="ap-edu" name="education" class="input" required placeholder="Minimum SSC / equivalent"><span class="field-err" id="ap-edu-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-occupation">Occupation <span>*</span></label><input type="text" id="ap-occupation" name="occupation" class="input" required><span class="field-err" id="ap-occupation-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-phone">Phone Number <span>*</span></label><input type="tel" id="ap-phone" name="phone" class="input" required placeholder="+8801XXXXXXXXX"><span class="field-err" id="ap-phone-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-email">Email Address <span>*</span></label><input type="email" id="ap-email" name="email" class="input" required><span class="field-err" id="ap-email-err" role="alert"></span></div>
            </div>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend>🏠 Present Address</legend>
            <div class="form-grid">
              <div class="form-group"><label for="ap-pa-house">House / Road <span>*</span></label><input type="text" id="ap-pa-house" name="pa_house" class="input" required></div>
              <div class="form-group"><label for="ap-pa-area">Area <span>*</span></label><input type="text" id="ap-pa-area" name="pa_area" class="input" required></div>
              <div class="form-group"><label for="ap-pa-city">City <span>*</span></label><input type="text" id="ap-pa-city" name="pa_city" class="input" required value="Dhaka"></div>
              <div class="form-group"><label for="ap-pa-post">Post Code <span>*</span></label><input type="text" id="ap-pa-post" name="pa_postCode" class="input" required></div>
            </div>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend>🏡 Permanent Address</legend>
            <div class="form-grid">
              <div class="form-group"><label for="ap-pm-village">Village / Ward <span>*</span></label><input type="text" id="ap-pm-village" name="pm_village" class="input" required></div>
              <div class="form-group"><label for="ap-pm-upazila">Upazila / Thana <span>*</span></label><input type="text" id="ap-pm-upazila" name="pm_upazila" class="input" required></div>
              <div class="form-group"><label for="ap-pm-district">District <span>*</span></label><input type="text" id="ap-pm-district" name="pm_district" class="input" required></div>
              <div class="form-group"><label for="ap-pm-post">Post Code <span>*</span></label><input type="text" id="ap-pm-post" name="pm_postCode" class="input" required></div>
            </div>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend>📎 Document Uploads</legend>
            <div class="upload-grid">
              ${Utils.fileZoneHtml({ id:'ap-photo-zone',     name:'photo',          label:'Your Photo',     kind:'image', accept:'image/*' })}
              ${Utils.fileZoneHtml({ id:'ap-nid-zone',       name:'nidPhoto',       label:'NID Copy',       kind:'doc',   accept:'image/*,application/pdf' })}
              ${Utils.fileZoneHtml({ id:'ap-signature-zone', name:'signaturePhoto', label:'Your Signature', kind:'image', accept:'image/*' })}
            </div>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend>🔁 Nominee Information</legend>
            <p class="fieldset-note">Your nominee (blood relative or legal spouse) is <strong>mandatory</strong> per Article 10 of our constitution. They receive your financial assets in case of death and hold priority to assume your membership.</p>
            <div class="form-grid">
              <div class="form-group"><label for="ap-nom-name">Nominee Full Name <span>*</span></label><input type="text" id="ap-nom-name" name="nom_name" class="input" required></div>
              <div class="form-group">
                <label for="ap-nom-rel">Relationship <span>*</span></label>
                <select id="ap-nom-rel" name="nom_relationship" class="input" required>
                  <option value="">Select relationship</option>
                  ${relationOptions.map((r)=>`<option value="${r}">${r}</option>`).join('')}
                </select>
              </div>
              <div class="form-group"><label for="ap-nom-nid">Nominee NID Number <span>*</span></label><input type="text" id="ap-nom-nid" name="nom_nidNumber" class="input" required></div>
              <div class="form-group"><label for="ap-nom-phone">Nominee Phone <span>*</span></label><input type="tel" id="ap-nom-phone" name="nom_phone" class="input" required></div>
            </div>
            <div class="upload-grid">
              ${Utils.fileZoneHtml({ id:'ap-nom-photo-zone', name:'nomPhoto',    label:"Nominee's Photo",    kind:'image', accept:'image/*' })}
              ${Utils.fileZoneHtml({ id:'ap-nom-nid-zone',   name:'nomNidPhoto', label:"Nominee's NID Copy", kind:'doc',   accept:'image/*,application/pdf' })}
            </div>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend>🤝 Member Reference</legend>
            <p class="fieldset-note">Provide the Member ID and phone number of one existing active member who can endorse your application.</p>
            <div class="form-grid">
              <div class="form-group"><label for="ap-ref-id">Referee Member ID <span>*</span></label><input type="text" id="ap-ref-id" name="refMemberId" class="input" required placeholder="e.g. DD-003"><span class="field-err" id="ap-ref-id-err" role="alert"></span></div>
              <div class="form-group"><label for="ap-ref-phone">Referee Phone Number <span>*</span></label><input type="tel" id="ap-ref-phone" name="refPhone" class="input" required placeholder="+8801XXXXXXXXX"><span class="field-err" id="ap-ref-phone-err" role="alert"></span></div>
            </div>
          </fieldset>

          <fieldset class="form-fieldset">
            <legend>✅ Declaration</legend>
            <div class="form-group form-group--checkbox">
              <label>
                <input type="checkbox" id="ap-declare" name="declaration" required>
                I declare that all information provided is true and accurate. I agree to abide by the Rules &amp; Regulations, Code of Conduct, and the Constitution of ${CONFIG.ORG_NAME} if admitted.
              </label>
            </div>
            <span class="field-err" id="ap-declare-err" role="alert"></span>
          </fieldset>

          <div class="form-err-global" id="apply-global-err" role="alert" style="display:none"></div>
          <button type="submit" class="btn btn--primary btn--lg btn--full" id="apply-submit-btn">Submit Application</button>
        </form>
      `,'section--light');

    ['ap-photo-zone','ap-signature-zone','ap-nom-photo-zone'].forEach((id)=>Utils.initFileZone(id,'image'));
    ['ap-nid-zone','ap-nom-nid-zone'].forEach((id)=>Utils.initFileZone(id,'doc'));

    document.getElementById('apply-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form=e.target; Utils.clearErrors(form);
      const g=document.getElementById('apply-global-err'); g.style.display='none';
      const raw=Utils.formData(form);
      let valid=true;
      const req={'name':'ap-name','dob':'ap-dob','fatherName':'ap-father','motherName':'ap-mother','nidNumber':'ap-nid','education':'ap-edu','occupation':'ap-occupation','phone':'ap-phone','email':'ap-email','refMemberId':'ap-ref-id','refPhone':'ap-ref-phone'};
      Object.entries(req).forEach(([k,eid])=>{ if(!raw[k]?.trim()){ Utils.fieldErr(eid,'This field is required.'); valid=false; } });
      if (!raw.declaration) { Utils.fieldErr('ap-declare','You must accept the declaration.'); valid=false; }
      const photoB64=document.getElementById('ap-photo-zone')?.dataset.base64;
      const nidB64=document.getElementById('ap-nid-zone')?.dataset.base64;
      if (!photoB64) { Utils.toast('Please upload your photo.','error'); valid=false; }
      if (!nidB64)   { Utils.toast('Please upload your NID copy.','error'); valid=false; }
      if (!valid) { g.textContent='Please fix the highlighted fields above.'; g.style.display='block'; return; }
      const btn=document.getElementById('apply-submit-btn');
      Utils.setSubmitting(btn,true);
      try {
        await API.submitApplication({
          name:raw.name, fatherName:raw.fatherName, motherName:raw.motherName, education:raw.education,
          dob:raw.dob, nidNumber:raw.nidNumber, occupation:raw.occupation, phone:raw.phone, email:raw.email,
          presentAddress:{ house:raw.pa_house, area:raw.pa_area, city:raw.pa_city, postCode:raw.pa_postCode },
          permanentAddress:{ village:raw.pm_village, upazila:raw.pm_upazila, district:raw.pm_district, postCode:raw.pm_postCode },
          photo:photoB64, nidPhoto:nidB64, signaturePhoto:document.getElementById('ap-signature-zone')?.dataset.base64||null,
          nominee:{ name:raw.nom_name, relationship:raw.nom_relationship, nidNumber:raw.nom_nidNumber, phone:raw.nom_phone,
                    photo:document.getElementById('ap-nom-photo-zone')?.dataset.base64||null,
                    nidPhoto:document.getElementById('ap-nom-nid-zone')?.dataset.base64||null },
          reference:{ memberId:raw.refMemberId, phone:raw.refPhone },
          declaration:true,
        });
        Utils.toast('Application submitted! The Admin will review it shortly.','success',6000);
        form.reset(); Router.navigate('#/');
      } catch(err) { g.textContent=err.message; g.style.display='block'; }
      finally { Utils.setSubmitting(btn,false); }
    });
  };

  // ── NEW MEMBER REQUIREMENTS ────────────────────────────────────────────────────

  const renderNewMember = () => {
    main().innerHTML =
      pageHero('Membership Hub','New Member Requirements','Everything you need to know before applying to join Dream Development DD.') +
      sec('new-member-req', `
        ${sHead('Eligibility','Who Can Apply?')}
        <div class="two-col">
          <div>
            <h3>Eligibility (Article 8)</h3>
            <ul class="check-list">
              <li>Bangladeshi citizen, aged 18 to 45</li>
              <li>Minimum educational qualification: SSC or equivalent</li>
              <li>Stable, verifiable source of income</li>
              <li>Endorsed by at least one existing active member</li>
              <li>No active criminal or financial fraud record</li>
            </ul>
          </div>
          <div>
            <h3>Financial Requirements</h3>
            <ul class="check-list">
              <li><strong>Dynamic Entry Fee:</strong> 20% of the current average member fund (pro-rated on joining)</li>
              <li><strong>Service Charge:</strong> BDT 150 (non-refundable, one-time)</li>
              <li><strong>Monthly Contribution:</strong> Due by the 20th of each month</li>
              <li>Naming a nominee (blood relative or legal spouse) is mandatory before approval</li>
            </ul>
            <h3>Documents Required</h3>
            <ul class="check-list">
              <li>Your passport-style photo</li>
              <li>NID copy (scan or photograph)</li>
              <li>Your signature on plain paper (photographed)</li>
              <li>Nominee's photo and NID copy</li>
            </ul>
          </div>
        </div>
      `) +
      sec('new-member-process', `
        ${sHead('How to Apply','Application Process')}
        <div class="steps-list">
          ${[
            { n:'01', t:'Submit Online Application',  d:'Complete the Apply for Membership form with your personal information, documents, and reference.' },
            { n:'02', t:'Admin Review',                d:'The Admin verifies your documents and reference within 14 days.' },
            { n:'03', t:'BoF/GBM Vote',                d:'Qualifying applications are presented for a two-thirds majority vote at the next General Body Meeting.' },
            { n:'04', t:'Approval & Member ID',        d:'If approved, the Admin assigns your unique Member ID (e.g. DD-007). Your login credentials are shared by the Admin.' },
            { n:'05', t:'Fee Payment & Onboarding',    d:'Pay the Dynamic Entry Fee and service charge, sign the Membership Agreement, and log in to the Member Portal.' },
          ].map((s)=>`
            <div class="step-item">
              <div class="step-item__num" aria-hidden="true">${s.n}</div>
              <div class="step-item__body"><h4>${s.t}</h4><p>${s.d}</p></div>
            </div>`).join('')}
        </div>
        <div class="cta-inline">
          <a href="#/apply" class="btn btn--primary btn--lg">Start Application</a>
          <a href="https://wa.me/${CONFIG.CONTACT_WHATSAPP.replace(/\D/g,'')}" target="_blank" rel="noopener" class="btn btn--outline btn--lg">Ask via WhatsApp</a>
        </div>
      `,'section--light');
  };

  // ── MEMBERSHIP BENEFITS ────────────────────────────────────────────────────────

  const renderBenefits = () => {
    main().innerHTML =
      pageHero('Membership Hub','Membership Benefits','More than returns — membership offers a network, a voice, and a community.') +
      sec('benefits-grid', `
        ${sHead('What You Gain','Member Benefits')}
        <div class="cards-grid cards-grid--3">
          ${[
            { icon:'💰', t:'Proportional Returns',      d:'Your equal share of annual surplus from the collective portfolio, distributed transparently after the AGM.' },
            { icon:'🗳️', t:'Equal Voting Rights',       d:'One member, one vote — regardless of tenure. All major decisions require your participation.' },
            { icon:'🛡️', t:'Emergency Reserve Fund',   d:'Members in genuine distress may receive interest-free support from the Reserve Fund, subject to BoF approval.' },
            { icon:'📚', t:'Financial Literacy',       d:'Regular workshops on personal finance, investment strategy, and Shariah-compliant wealth management.' },
            { icon:'🤝', t:'Professional Network',     d:'A trusted network of 25 motivated professionals across diverse industries in Dhaka.' },
            { icon:'🌍', t:'CSR Participation',        d:'Contribute to and participate in our community service initiatives, from Iftar programmes to school supply drives.' },
            { icon:'📋', t:'Transparent Governance',   d:'Attend and vote at GBMs. Review audited accounts. Every decision is documented and minuted.' },
            { icon:'🔁', t:'Nominee Protection',       d:'Your investment is secured by a registered nominee who inherits your stake and holds priority membership rights.' },
            { icon:'📥', t:'Digital Invoice System',   d:'Access your personal contribution receipts and payment history digitally through the Member Portal anytime.' },
          ].map((b)=>`
            <div class="feature-card">
              <div class="feature-card__icon" aria-hidden="true">${b.icon}</div>
              <h3 class="feature-card__title">${b.t}</h3>
              <p class="feature-card__desc">${b.d}</p>
            </div>`).join('')}
        </div>
      `);
  };

  // ── NOMINEE & SUCCESSION ───────────────────────────────────────────────────────

  const renderNomineeSucession = () => {
    main().innerHTML =
      pageHero('Membership Hub','Nominee & Succession Policy','A constitutional framework that protects your investment and ensures your family is taken care of.') +
      sec('nominee-policy', `
        ${sHead('The Policy','Understanding Nominee Rights')}
        <div class="two-col">
          <div>
            <h3>Role of a Nominee (Article 10)</h3>
            <p>Designating a nominee — a <strong>blood relative or legal spouse</strong> — is a mandatory condition for membership. In the event of a member's death, the nominee inherits the member's full financial assets and holds <strong>priority to assume the membership</strong>. The nominee does not need to apply through the standard process but must still be approved by the Board of Founders.</p>
            <h3>Financial Protection</h3>
            <p>In the event of a member's sudden death, the Board of Founders may issue an <strong>immediate financial grant</strong> from the Reserve Fund to support the deceased member's family, separate from and prior to the final settlement of their investment share.</p>
          </div>
          <div>
            <h3>Nominee Changes</h3>
            <p>If you need to update your nominee information — whether the name, relationship, NID, or contact details — please <strong>contact the Admin directly</strong>. All changes to member records are managed exclusively by the Admin to maintain the integrity of official documentation.</p>
            <div class="auth-prompt auth-prompt--inline">
              <p>To update your nominee, contact the Admin:</p>
              <a href="mailto:${CONFIG.CONTACT_EMAIL}" class="btn btn--primary btn--sm">Email Admin</a>
              <a href="https://wa.me/${CONFIG.CONTACT_WHATSAPP.replace(/\D/g,'')}" target="_blank" rel="noopener" class="btn btn--outline btn--sm">WhatsApp</a>
            </div>
            <h3>Documentation Required for Changes</h3>
            <ul class="check-list">
              <li>NID copy of the new nominee</li>
              <li>Relationship declaration</li>
              <li>Photo of the new nominee</li>
            </ul>
          </div>
        </div>
      `,'section--light');
  };

  // ── FAQ ────────────────────────────────────────────────────────────────────────

  const renderFAQ = async () => {
    const faqs = [
      { q:'What is Dream Development DD?', a:`${CONFIG.ORG_NAME} is a democratic investment organisation founded in ${CONFIG.ORG_FOUNDED_LABEL} by ${CONFIG.ORG_FOUNDER_COUNT} founding members. All investments are 100% interest-free and Shariah-compliant. Every member holds an equal vote on all major decisions.` },
      { q:'Who can apply for membership?', a:`Bangladeshi citizens aged 18 to 45 with a minimum SSC qualification. You need the endorsement of one existing active member and must provide a mandatory nominee (blood relative or legal spouse) with your application.` },
      { q:'What is the Dynamic Entry Fee?', a:`The entry fee equals 20% of the current average member fund, which serves as your initial capital contribution. A non-refundable service charge of BDT 150 also applies.` },
      { q:'How do I get my Member ID?', a:`Once your application is approved at a General Body Meeting, the Admin generates your unique Member ID (e.g. DD-007) and issues your login credentials. Your ID is your login username; the Admin sets your initial password.` },
      { q:'How do I log in to the Member Portal?', a:`Use the "Member Login" tab on the login page. Enter your Member ID and the password provided by the Admin. You cannot log in with an email address — your Member ID is required.` },
      { q:'When are monthly contributions due?', a:`Contributions must be paid by the 20th of each month. Late fees apply: BDT 50 for the first month of delay, BDT 100 for each subsequent month. After 6 consecutive months of non-payment, membership is automatically cancelled.` },
      { q:'Can I view my payment receipts online?', a:`Yes. Log in to the Member Portal, go to the Contributions tab in your dashboard. The Admin uploads your invoice receipts which you can download as PDF or image files directly from there.` },
      { q:'How do I update my personal information or nominee?', a:`Members cannot directly edit their own records. Please contact the Admin via email (${CONFIG.CONTACT_EMAIL}) or WhatsApp (${CONFIG.CONTACT_WHATSAPP}) with your requested changes and supporting documents. The Admin will update your record.` },
      { q:'What are the two leadership bodies?', a:`The Board of Founders (BoF) is the supreme policy-making body, exclusively comprising the 7 founding members. The Executive Council (EC) is the operational governing body of 7 members elected for 2-year terms. The President and Treasurer of the EC are nominated from the BoF.` },
      { q:'What is the Lock-in Period?', a:`The first 2 years of membership are a lock-in period. If you exit before completing 2 years, a 5% "Service Deduction" is applied to your deposited capital. After the lock-in period, the standard 30-day notice and 3–6 month settlement process applies.` },
    ];
    main().innerHTML =
      pageHero('Membership Hub','Frequently Asked Questions','Answers to the most common questions about membership, contributions, and governance.') +
      sec('faq-list', `
        <div class="accordion" id="faq-accordion">
          ${faqs.map((f,i)=>`
            <div class="accordion__item">
              <button class="accordion__trigger" aria-expanded="false" aria-controls="faq-ans-${i}" id="faq-q-${i}">
                <span>${Utils.escapeHtml(f.q)}</span>
                <svg class="accordion__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div class="accordion__panel" id="faq-ans-${i}" role="region" aria-labelledby="faq-q-${i}" hidden>
                <p>${Utils.escapeHtml(f.a)}</p>
              </div>
            </div>`).join('')}
        </div>
      `,'section--light');
    document.querySelectorAll('.accordion__trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded=btn.getAttribute('aria-expanded')==='true';
        document.querySelectorAll('.accordion__trigger').forEach((b)=>{ b.setAttribute('aria-expanded','false'); document.getElementById(b.getAttribute('aria-controls')).hidden=true; b.closest('.accordion__item').classList.remove('accordion__item--open'); });
        if(!expanded){ btn.setAttribute('aria-expanded','true'); document.getElementById(btn.getAttribute('aria-controls')).hidden=false; btn.closest('.accordion__item').classList.add('accordion__item--open'); }
      });
    });
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────────

  const renderLogin = () => {
    main().innerHTML = `
      <div class="auth-page">
        <div class="auth-card auth-card--wide">
          <div class="auth-card__brand">
            <div class="nav-brand__logo nav-brand__logo--lg"><span>D</span><span>D</span></div>
          </div>
          <h1 class="auth-card__title">${CONFIG.ORG_NAME}</h1>
          <p class="auth-card__sub">Sign in to your portal.</p>
          <div class="auth-tabs" role="tablist">
            <button class="auth-tab auth-tab--active" id="tab-member" role="tab" aria-selected="true">Member Login</button>
            <button class="auth-tab" id="tab-admin"  role="tab" aria-selected="false">Admin Login</button>
          </div>

          <form id="member-login-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="ml-id">Member ID</label>
              <input type="text" id="ml-id" name="memberId" class="input" required autocomplete="username" placeholder="e.g. DD-002">
              <span class="field-err" id="ml-id-err" role="alert"></span>
            </div>
            <div class="form-group">
              <label for="ml-pass">Password <span class="text-muted">(provided by Admin)</span></label>
              <div class="input-wrap">
                <input type="password" id="ml-pass" name="password" class="input" required autocomplete="current-password">
                <button type="button" class="input-eye" id="toggle-ml" aria-label="Toggle password visibility">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <span class="field-err" id="ml-pass-err" role="alert"></span>
            </div>
            <div class="form-err-global" id="ml-global-err" role="alert" style="display:none"></div>
            <button type="submit" class="btn btn--primary btn--full btn--lg" id="ml-btn">Sign In</button>
          </form>

          <form id="admin-login-form" class="auth-form" novalidate hidden>
            <div class="form-group">
              <label for="al-email">Admin Email</label>
              <input type="email" id="al-email" name="email" class="input" required autocomplete="username">
              <span class="field-err" id="al-email-err" role="alert"></span>
            </div>
            <div class="form-group">
              <label for="al-pass">Password</label>
              <div class="input-wrap">
                <input type="password" id="al-pass" name="password" class="input" required autocomplete="current-password">
                <button type="button" class="input-eye" id="toggle-al" aria-label="Toggle password visibility">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <span class="field-err" id="al-pass-err" role="alert"></span>
            </div>
            <div class="form-err-global" id="al-global-err" role="alert" style="display:none"></div>
            <button type="submit" class="btn btn--primary btn--full btn--lg" id="al-btn">Sign In as Admin</button>
          </form>

          <details class="demo-creds">
            <summary>Demo credentials (development only)</summary>
            <table class="creds-table">
              <thead><tr><th>Role</th><th>ID / Email</th><th>Password</th></tr></thead>
              <tbody>
                <tr><td>Admin</td><td>admin@dd.org</td><td>dd@admin2024</td></tr>
                <tr><td>Member</td><td>DD-002</td><td>dd-member-002</td></tr>
                <tr><td>Member</td><td>DD-003</td><td>dd-member-003</td></tr>
              </tbody>
            </table>
          </details>
          <p class="auth-card__footer">Not yet a member? <a href="#/apply">Apply for membership →</a></p>
        </div>
      </div>`;

    const tabM=document.getElementById('tab-member'), tabA=document.getElementById('tab-admin');
    const fM=document.getElementById('member-login-form'), fA=document.getElementById('admin-login-form');
    tabM.addEventListener('click',()=>{ tabM.classList.add('auth-tab--active'); tabA.classList.remove('auth-tab--active'); tabM.setAttribute('aria-selected','true'); tabA.setAttribute('aria-selected','false'); fM.hidden=false; fA.hidden=true; });
    tabA.addEventListener('click',()=>{ tabA.classList.add('auth-tab--active'); tabM.classList.remove('auth-tab--active'); tabA.setAttribute('aria-selected','true'); tabM.setAttribute('aria-selected','false'); fA.hidden=false; fM.hidden=true; });
    document.getElementById('toggle-ml')?.addEventListener('click',()=>{ const i=document.getElementById('ml-pass'); i.type=i.type==='password'?'text':'password'; });
    document.getElementById('toggle-al')?.addEventListener('click',()=>{ const i=document.getElementById('al-pass'); i.type=i.type==='password'?'text':'password'; });

    fM.addEventListener('submit', async (e)=>{ e.preventDefault(); Utils.clearErrors(fM); const g=document.getElementById('ml-global-err'); g.style.display='none'; const {memberId,password}=Utils.formData(fM); let v=true; if(!memberId?.trim()){Utils.fieldErr('ml-id','Member ID is required.');v=false;} if(!password?.trim()){Utils.fieldErr('ml-pass','Password is required.');v=false;} if(!v) return; const btn=document.getElementById('ml-btn'); Utils.setSubmitting(btn,true); try{ const m=await Auth.loginMember(memberId.trim().toUpperCase(),password); Utils.toast(`Welcome back, ${m.name.split(' ')[0]}!`,'success'); Components.Navbar.updateAuthState(); Router.navigate(Auth.portalRoute()); }catch(err){ g.textContent=err.message; g.style.display='block'; }finally{ Utils.setSubmitting(btn,false); } });
    fA.addEventListener('submit', async (e)=>{ e.preventDefault(); Utils.clearErrors(fA); const g=document.getElementById('al-global-err'); g.style.display='none'; const {email,password}=Utils.formData(fA); let v=true; if(!email?.trim()){Utils.fieldErr('al-email','Email is required.');v=false;} if(!password?.trim()){Utils.fieldErr('al-pass','Password is required.');v=false;} if(!v) return; const btn=document.getElementById('al-btn'); Utils.setSubmitting(btn,true); try{ const u=await Auth.loginAdmin(email.trim(),password); Utils.toast(`Welcome back, ${u.name.split(' ')[0]}!`,'success'); Components.Navbar.updateAuthState(); Router.navigate(Auth.portalRoute()); }catch(err){ g.textContent=err.message; g.style.display='block'; }finally{ Utils.setSubmitting(btn,false); } });
  };

  // ── BOARD OF FOUNDERS ──────────────────────────────────────────────────────────

  const renderFounders = async () => {
    main().innerHTML =
      pageHero('Our Leadership','Board of Founders','The visionaries who established Dream Development DD. The BoF is the supreme policy-making body of the organisation.') +
      sec('founders-grid', `
        ${sHead('Founding Body','Board of Founders (BoF)',`Established ${CONFIG.ORG_FOUNDED_LABEL} — a permanent advisory and supreme supervisory body comprising all ${CONFIG.ORG_FOUNDER_COUNT} founding members.`)}
        <div id="founders-list" aria-live="polite" aria-busy="true">${Utils.skeleton(4)}</div>
        <div class="constitution-note">
          <p>🏛️ <strong>Constitutional role:</strong> The BoF undergoes internal restructuring every 2 years. No member can hold the same position for more than one consecutive term. The BoF holds final approval authority for all major investments (requiring 5/7 votes) and constitutional amendments (requiring 6/7 votes).</p>
        </div>
      `);
    try {
      const founders = await API.getBoardOfFounders();
      document.getElementById('founders-list').innerHTML = `
        <div class="committee-grid">
          ${founders.map((m)=>`
            <article class="committee-card committee-card--founder">
              <div class="committee-card__photo-wrap">
                <img src="${m.photo}" alt="${Utils.escapeHtml(m.name)}" class="committee-card__photo" width="120" height="120" loading="lazy">
                <span class="founder-ribbon">🏆 Founder</span>
              </div>
              <div class="committee-card__body">
                <h3 class="committee-card__name">${Utils.escapeHtml(m.name)}</h3>
                <p class="committee-card__role">${Utils.escapeHtml(m.position)}</p>
                <p class="committee-card__term">Since ${Utils.fmtDate(m.termStart,{year:'numeric',month:'short'})}</p>
                <blockquote class="committee-card__quote">"${Utils.escapeHtml(m.message)}"</blockquote>
              </div>
            </article>`).join('')}
        </div>`;
    } catch(err) { document.getElementById('founders-list').innerHTML=`<p class="error-state">${err.message}</p>`; }
  };

  // ── EXECUTIVE COMMITTEE ────────────────────────────────────────────────────────

  const renderCommittee = async () => {
    main().innerHTML =
      pageHero('Our Leadership','Executive Council','The operational governing body elected for the current term.') +
      sec('committee-grid-section', `
        ${sHead(CONFIG.TERM_LABEL,'Executive Council (EC)',`Inaugurated ${Utils.fmtDate(CONFIG.TERM_START)} — serving a two-year democratic mandate.`)}
        <div id="ec-list" aria-live="polite" aria-busy="true">${Utils.skeleton(6)}</div>
        <div class="constitution-note">
          <p>🏛️ <strong>Constitutional role:</strong> The EC consists of 7 members: President, General Secretary, Treasurer, Assistant Treasurer, Organising Secretary, Publicity &amp; Media Secretary, and Executive Member. The President and Treasurer are nominated from the BoF; the remaining 5 positions are elected from general members for a 2-year term.</p>
        </div>
      `);
    try {
      const members = await API.getExecutiveCommittee();
      document.getElementById('ec-list').innerHTML = `
        <div class="committee-grid">
          ${members.map((m)=>`
            <article class="committee-card">
              <div class="committee-card__photo-wrap">
                <img src="${m.photo}" alt="${Utils.escapeHtml(m.name)}" class="committee-card__photo" width="120" height="120" loading="lazy">
              </div>
              <div class="committee-card__body">
                <h3 class="committee-card__name">${Utils.escapeHtml(m.name)}</h3>
                <p class="committee-card__role">${Utils.escapeHtml(m.position)}</p>
                <p class="committee-card__term">${Utils.fmtDateShort(m.termStart)} – ${m.termEnd?Utils.fmtDateShort(m.termEnd):'Present'}</p>
                <blockquote class="committee-card__quote">"${Utils.escapeHtml(m.message)}"</blockquote>
              </div>
            </article>`).join('')}
        </div>`;
    } catch(err) { document.getElementById('ec-list').innerHTML=`<p class="error-state">${err.message}</p>`; }
  };

  // ── MEMBERS DIRECTORY ─────────────────────────────────────────────────────────

  const renderMembersPage = async () => {
    main().innerHTML =
      pageHero('Our Leadership','Our Members',`${CONFIG.ORG_NAME} is built by ${CONFIG.ORG_MEMBERS} equal members — each a stakeholder, each a decision-maker.`) +
      sec('members-section', `
        ${sHead('The Collective','Active Membership')}
        <div id="members-list" aria-live="polite" aria-busy="true">${Utils.skeleton(8)}</div>
      `);
    try {
      const members = await API.getMembers();
      document.getElementById('members-list').innerHTML = `
        <div class="members-grid">
          ${members.filter((m)=>m.status==='active').map((m)=>`
            <div class="member-card">
              <img src="${m.photo}" alt="${Utils.escapeHtml(m.name)}" class="member-card__photo" width="56" height="56" loading="lazy">
              <div class="member-card__info">
                <h3 class="member-card__name">${Utils.escapeHtml(m.name)}</h3>
                <p class="member-card__id">${m.memberId}</p>
                <p class="member-card__joined">Member since ${Utils.fmtDate(m.joinDate,{year:'numeric',month:'short'})}</p>
              </div>
            </div>`).join('')}
        </div>`;
    } catch(err) { document.getElementById('members-list').innerHTML=`<p class="error-state">${err.message}</p>`; }
  };

  // ── CORE VALUES ────────────────────────────────────────────────────────────────

  const renderValues = () => {
    main().innerHTML =
      pageHero('Community Standards','Core Values & Ethics','The principles that guide every decision, every vote, and every interaction within Dream Development DD.') +
      sec('values-grid', `
        <div class="cards-grid cards-grid--3">
          ${[
            { icon:'🔍', t:'Transparency',    d:'100% of financial and administrative operations are transparent. No decision is made behind closed doors. Records are open to all members.' },
            { icon:'⚖️', t:'Equality',        d:'One member, one vote — always. Tenure, contribution amount, and personal relationships have no bearing on voting weight.' },
            { icon:'🤝', t:'Collective First', d:'Collective organisational interest always supersedes personal interest. Internal factionalism or sub-groups are strictly forbidden.' },
            { icon:'🌱', t:'Ethical Growth',  d:'All investment is 100% interest-free and Shariah-compliant. Growth must be halal and sustainable — we never compromise on this.' },
            { icon:'❤️', t:'Humanity',        d:'We deeply nurture human values. Humanitarian service and community development are fundamental philosophies, not optional extras.' },
            { icon:'🛡️', t:'Integrity',       d:'Zero tolerance for financial misconduct, data breaches, or defamation. Members are accountable to each other and to the constitution.' },
          ].map((v)=>`
            <div class="value-card">
              <div class="value-card__icon" aria-hidden="true">${v.icon}</div>
              <h3 class="value-card__title">${v.t}</h3>
              <p class="value-card__desc">${v.d}</p>
            </div>`).join('')}
        </div>
      `);
  };

  // ── CODE OF CONDUCT ───────────────────────────────────────────────────────────

  const renderConduct = () => {
    main().innerHTML =
      pageHero('Community Standards','Code of Conduct','Expected behaviour standards for all members, officers, and Board of Founders members.') +
      sec('conduct-doc', `
        <div class="doc-page">
          <p class="doc-meta">Effective: January 1, 2026 · Approved at General Body Meeting · Next review: January 2028</p>

          <h3>1. Timely Contributions</h3>
          <p>Members commit to paying their monthly contribution by the 20th of each month. Persistent late payments without prior communication to the Treasurer may result in a formal notice from the Committee, and non-payment for 6 consecutive months leads to automatic membership cancellation per Article 3 of the Constitution.</p>

          <h3>2. Active Participation</h3>
          <p>Members are expected to attend General Body Meetings and participate in voting. Absence without prior notice for three consecutive meetings will be noted and addressed by the Executive Council. The quorum for any general meeting is two-thirds (2/3) of total members.</p>

          <h3>3. Data Accuracy & Record Changes</h3>
          <p>Members must inform the Admin of any changes to their personal information — including address, phone number, email, or nominee details. Members themselves cannot directly edit their own records; all changes are routed through the Admin to maintain a single, verified source of truth.</p>

          <h3>4. Conflict of Interest</h3>
          <p>Any member with a personal financial interest in a proposed investment must declare it before the vote and may not vote on that specific matter. Undisclosed conflicts are a serious disciplinary breach.</p>

          <h3>5. Disciplinary Process</h3>
          <p>Breaches of this Code are investigated by a sub-committee of three uninvolved members. Penalties range from a formal written warning to suspension of voting rights to expulsion from the organisation, depending on severity. All proceedings are documented and minuted.</p>

          <h3>6. Mutual Respect</h3>
          <p>Members must maintain mutual respect in all interactions, regardless of personal identity, background, tenure, or position. Any form of discriminatory behaviour, personal attack, harassment, or humiliation — in person, in meetings, or through digital channels — is completely unacceptable and is grounds for immediate disciplinary action.</p>

          <h3>7. Data Privacy & Non-Disclosure</h3>
          <p>Internal business strategies, investment ledgers, digital documents, and the personal information of all members (including NIDs, photos, addresses, and financial data) are <strong>strictly confidential</strong>. No member or officer is permitted to disclose this information to any third party — even after leaving the organisation. Violations may result in legal action under applicable laws.</p>

          <h3>8. Anti-Defamation Policy</h3>
          <p>Sharing false, misleading, or provocative information on social media platforms (such as Facebook, WhatsApp, YouTube, or any other platform) that damages the organisation's reputation, undermines member trust, or incites conflict is <strong>strictly prohibited</strong>. The organisation reserves the right to take legal action under the Cyber Security Act of Bangladesh against any member engaged in defamatory campaigns, even after their departure from the organisation.</p>

          <h3>9. Conflict of Interest & Non-Compete</h3>
          <p>While an active member of Dream Development DD, no member — whether a general member, Executive Council officer, or Board of Founders director — is permitted to individually operate a similar competing business venture or parallel investment group that directly competes with the organisation's activities. This restriction applies for the duration of active membership and is subject to review by the Board of Founders.</p>
        </div>
      `,'section--light');
  };

  // ── RULES & REGULATIONS ────────────────────────────────────────────────────────

  const renderRules = () => {
    const articles = [
      { h:'Article 1 — Organisational Identity', p:'The organisation is formally known as "Dream Development DD". Its motto is <em>"Make Your Dream Come True"</em>. It operates as a member-based development and joint investment organisation. All investments are strictly interest-free and Shariah-compliant. The ultimate long-term goal is to transition into a registered Private Limited Company under the laws of Bangladesh, while maintaining the spirit and values of this constitution.' },
      { h:'Article 2 — Membership & Entry Requirements', p:'Membership is open to Bangladeshi citizens aged 18 to 45 with a minimum educational qualification of SSC or equivalent. New members must pay a <strong>"Dynamic Entry Fee"</strong> equal to 20% of the current average member fund, which serves as their initial capital. A non-refundable service charge of BDT 150 is also required. Naming a nominee (blood relative or legal spouse) is a mandatory condition for membership approval.' },
      { h:'Article 3 — Monthly Contributions & Penalties', p:'Members must pay their designated monthly contribution by the <strong>20th of each month</strong>. A late fee of BDT 50 applies for the first month of delay, increasing to BDT 100 for subsequent months. Failure to pay monthly contributions for <strong>6 consecutive months</strong> will result in the automatic cancellation of membership without further notice.' },
      { h:'Article 4 — Investment Decisions & Financial Security', p:'No organisational funds can be issued as personal loans to any individual under any circumstances. Major capital investments require the explicit consent of at least <strong>5 out of the 7 members of the Board of Founders</strong>. Furthermore, to ensure long-term financial security, <strong>15% of all net profits</strong> must be mandatorily allocated to the organisation\'s Reserve Fund each year.' },
      { h:'Article 5 — Board of Founders (BoF)', p:'The BoF is the highest policy-making and supervisory body, consisting exclusively of the <strong>7 founding members</strong>. The board undergoes internal restructuring every 2 years, and to maintain dynamic leadership, no member can hold the same position for more than one consecutive term. The BoF holds final approval authority for major investments and constitutional amendments.' },
      { h:'Article 6 — Executive Council (EC)', p:'The Executive Council is the operational governing body consisting of <strong>7 members</strong>: President, General Secretary, Treasurer, Assistant Treasurer, Organising Secretary, Publicity &amp; Media Secretary, and Executive Member. The President and Treasurer are strictly <strong>nominated from the BoF</strong>, while the remaining 5 positions are elected from the general membership for a two-year term.' },
      { h:'Article 7 — Record Management & Transparency', p:'All financial transactions and records are maintained digitally and backed up securely on cloud storage. The Treasurer is primarily responsible for daily accounts, regularly audited by the Finance Director of the BoF. Members reserve the right to request access to their personal investment status and the organisation\'s financial summaries. All changes to member records are managed exclusively by the Admin.' },
      { h:'Article 8 — Meetings & Audits', p:'Executive Council meetings are held at least once every 3 months. The Board of Founders meets every 4 to 6 months. An Annual General Meeting (AGM) is held at the end of every financial year to review the fully audited annual report and approve future investment plans. The quorum for any general meeting is two-thirds (2/3) of the total membership.' },
      { h:'Article 9 — Exit Policy & Settlements', p:'A member wishing to exit voluntarily must submit a written resignation letter at least <strong>30 days in advance</strong>. Resigning before completing a <strong>2-year lock-in period</strong> incurs a 5% "Service Deduction" on the deposited capital. Financial settlement processing requires a waiting period of <strong>3 to 6 months</strong>. If the organisation is operating at a loss at the time of resignation, the exiting member must bear a proportional share of that loss.' },
    ];
    main().innerHTML =
      pageHero('Community Standards','Rules & Regulations','The formal governance framework that structures Dream Development DD\'s operations.') +
      sec('rules-doc', `
        <div class="doc-page">
          <p class="doc-meta">Effective: January 1, 2026 · Approved by Board of Founders · Next constitutional review: January 2028</p>
          ${articles.map((a)=>`<h3>${a.h}</h3><p>${a.p}</p>`).join('')}
        </div>
      `,'section--light');
  };

  // ── CSR & SOCIAL IMPACT ────────────────────────────────────────────────────────

  const renderCSR = () => {
    main().innerHTML =
      pageHero('Community Standards','CSR & Social Impact','Our commitment to the communities around us — because building wealth alone is not enough.') +
      sec('csr-philosophy', `
        ${sHead('Our Humanity','The Philosophy Behind Our CSR')}
        <div class="highlight-block">
          <p class="highlight-block__stat">❤️</p>
          <div>
            <h3>More Than Profit</h3>
            <p>Dream Development DD is not solely a profit-driven organisation. We deeply nurture human values. Providing humanitarian service and contributing to the development of underprivileged people is a <strong>fundamental philosophy</strong> of our organisation — not an optional activity. This is enshrined in Article 2 of our constitution.</p>
          </div>
        </div>
      `) +
      sec('csr-reserve', `
        ${sHead('Financial Mandate','Reserve Fund & Humanitarian Allocation')}
        <div class="two-col">
          <div class="highlight-block" style="flex-direction:column;align-items:flex-start">
            <p class="highlight-block__stat">15%</p>
            <div>
              <h3>Mandatory Reserve Fund Allocation</h3>
              <p>By constitutional mandate (Article 4 &amp; 12), a minimum of <strong>15% of all net profits</strong> earned from investments is mandatorily transferred to the Reserve Fund annually. This is not discretionary — it is a constitutional commitment reviewed and reported at every AGM.</p>
            </div>
          </div>
          <div>
            <h3>Authorised Uses of the Reserve Fund</h3>
            <ul class="check-list">
              <li>Special humanitarian and social service (CSR) initiatives decided by the BoF</li>
              <li>Emergency support for members and their families in cases of sudden need</li>
              <li>In the event of a <strong>member's sudden death</strong>, the BoF can issue an immediate financial grant from the Reserve Fund to support the deceased member's family</li>
              <li>Organisational contingency and liquidity buffer during adverse market conditions</li>
            </ul>
          </div>
        </div>
      `,'section--light') +
      sec('csr-initiatives', `
        ${sHead('On the Ground','Our Community Initiatives')}
        <div class="cards-grid cards-grid--2">
          ${[
            { icon:'🍽️', t:'Annual Iftar Programme',           d:'Every Ramadan, we organise a community Iftar for underprivileged families in our locality. In 2026 we served over 200 families. This programme directly embodies our humanitarian philosophy.', year:'Since 2021' },
            { icon:'📚', t:'School Supplies Drive',            d:'An annual collection and distribution of stationery, books, and school bags for low-income students ahead of the academic year.', year:'Since 2022' },
            { icon:'🩺', t:'Health Awareness Camp',            d:'A free community health check-up camp in partnership with local clinics, offering blood pressure, blood sugar, and eye screening services.', year:'Since 2023' },
            { icon:'🌳', t:'Tree Plantation',                  d:'Each year on our Founding Day, every member plants 5 trees in their locality as part of our environmental responsibility pledge.', year:'Since 2024' },
          ].map((c)=>`
            <div class="feature-card feature-card--horizontal">
              <div class="feature-card__icon feature-card__icon--lg" aria-hidden="true">${c.icon}</div>
              <div>
                <div class="feature-card__meta">${c.year}</div>
                <h3 class="feature-card__title">${c.t}</h3>
                <p class="feature-card__desc">${c.d}</p>
              </div>
            </div>`).join('')}
        </div>
      `);
  };

  // ── MEMBER DASHBOARD ──────────────────────────────────────────────────────────

  const renderMemberDashboard = async () => {
    if (!Auth.require('member')) return;
    const user = Auth.getUser();

    main().innerHTML = `
      <div class="dashboard">
        <div class="dashboard__sidebar">
          <div class="db-profile">
            <img src="${user.photo||'https://i.pravatar.cc/120?img=1'}" alt="${Utils.escapeHtml(user.name)}" class="db-profile__photo" width="80" height="80">
            <h2 class="db-profile__name">${Utils.escapeHtml(user.name)}</h2>
            <p class="db-profile__id">${user.memberId}</p>
            ${Utils.badge(user.status)}
          </div>
          <nav class="db-nav">
            <button class="db-nav__item db-nav__item--active" data-tab="profile">👤 My Profile</button>
            <button class="db-nav__item" data-tab="invoices">📋 My Contributions</button>
            <button class="db-nav__item" data-tab="gallery">🖼️ Submit Photo</button>
          </nav>
        </div>
        <div class="dashboard__main">

          <!-- Profile Tab -->
          <div id="db-tab-profile" class="db-tab">
            <div class="db-section-head"><div><h2>My Profile</h2><p>Your official record. Only the Admin can make changes.</p></div></div>
            <div class="readonly-banner">
              🔒 Your information is managed by the Admin.
              To update anything, contact: <a href="mailto:${CONFIG.CONTACT_EMAIL}">${CONFIG.CONTACT_EMAIL}</a> or
              <a href="https://wa.me/${CONFIG.CONTACT_WHATSAPP.replace(/\D/g,'')}" target="_blank" rel="noopener">WhatsApp ${CONFIG.CONTACT_WHATSAPP}</a>
            </div>
            <div class="profile-doc-grid">
              <div class="profile-doc-card">
                ${user.photo?`<img src="${user.photo}" alt="Profile photo" class="profile-doc-card__img">`:`<div class="profile-doc-card__placeholder">📷</div>`}
                <span>Profile Photo</span>
              </div>
              <div class="profile-doc-card">
                ${user.nidPhoto?`<img src="${user.nidPhoto}" alt="NID copy" class="profile-doc-card__img">`:`<div class="profile-doc-card__placeholder">📄</div>`}
                <span>NID Copy</span>
              </div>
              <div class="profile-doc-card">
                ${user.signaturePhoto?`<img src="${user.signaturePhoto}" alt="Signature" class="profile-doc-card__img">`:`<div class="profile-doc-card__placeholder">✍️</div>`}
                <span>Signature</span>
              </div>
            </div>
            <h3 class="profile-section-title">Personal Information</h3>
            <dl class="profile-detail-grid">
              ${[['Full Name',user.name],['Member ID',user.memberId],["Father's Name",user.fatherName||'—'],["Mother's Name",user.motherName||'—'],['Date of Birth',user.dob?Utils.fmtDate(user.dob):'—'],['NID Number',user.nidNumber||'—'],['Occupation',user.occupation||'—'],['Phone',user.phone],['Email',user.email],['Joined On',Utils.fmtDate(user.joinDate)],['Status',Utils.badge(user.status)]].map(([k,v])=>`<div class="profile-row"><dt>${k}</dt><dd>${typeof v==='string'?Utils.escapeHtml(v):v}</dd></div>`).join('')}
            </dl>
            <h3 class="profile-section-title">Present Address</h3>
            <p class="profile-address">${Utils.escapeHtml(fmtAddr(user.presentAddress,'present'))}</p>
            <h3 class="profile-section-title">Permanent Address</h3>
            <p class="profile-address">${Utils.escapeHtml(fmtAddr(user.permanentAddress,'permanent'))}</p>
            <h3 class="profile-section-title">Nominee Information</h3>
            <div class="nominee-detail-card">
              <div class="nominee-detail-card__photo">
                ${user.nominee?.photo?`<img src="${user.nominee.photo}" alt="Nominee photo">`:`<div class="profile-doc-card__placeholder">👤</div>`}
              </div>
              <dl class="profile-detail-grid">
                <div class="profile-row"><dt>Name</dt><dd>${Utils.escapeHtml(user.nominee?.name||'—')}</dd></div>
                <div class="profile-row"><dt>Relationship</dt><dd>${Utils.escapeHtml(user.nominee?.relationship||'—')}</dd></div>
                <div class="profile-row"><dt>NID Number</dt><dd>${Utils.escapeHtml(user.nominee?.nidNumber||'—')}</dd></div>
                <div class="profile-row"><dt>Phone</dt><dd>${Utils.escapeHtml(user.nominee?.phone||'—')}</dd></div>
              </dl>
            </div>
          </div>

          <!-- Contributions Tab -->
          <div id="db-tab-invoices" class="db-tab" hidden>
            <div class="db-section-head"><div><h2>My Contributions</h2><p>Your monthly contribution invoices and downloadable receipts uploaded by the Admin.</p></div></div>
            <div id="invoices-table-wrap" aria-live="polite" aria-busy="true">${Utils.skeleton(5,'table')}</div>
            <div id="invoices-pagination" class="pagination-wrap mt-4"></div>
          </div>

          <!-- Gallery Submission Tab -->
          <div id="db-tab-gallery" class="db-tab" hidden>
            <div class="db-section-head"><div><h2>Submit a Photo</h2><p>Submit a photo from an organisation event. It will appear on the public gallery after Admin approval.</p></div></div>
            <div class="form-card" style="max-width:520px">
              <form id="gallery-submit-form" novalidate>
                <div class="form-group">
                  <label for="gs-caption">Photo Caption <span>*</span></label>
                  <input type="text" id="gs-caption" name="caption" class="input" required placeholder="e.g. Annual Meeting December 2026">
                </div>
                <div class="form-group">
                  <label for="gs-date">Event Date <span>*</span></label>
                  <input type="date" id="gs-date" name="date" class="input" required>
                </div>
                <div class="form-group">
                  ${Utils.fileZoneHtml({ id:'gs-photo-zone', name:'photo', label:'Photo', kind:'image', accept:'image/*' })}
                </div>
                <p class="footnote">All submissions are reviewed by the Admin before appearing publicly.</p>
                <button type="submit" class="btn btn--primary" id="gs-submit-btn">Submit for Review</button>
              </form>
              <div id="gs-my-submissions" class="mt-4"></div>
            </div>
          </div>

        </div>
      </div>`;

    // Tab switching
    document.querySelectorAll('.db-nav__item').forEach((btn)=>{ btn.addEventListener('click',()=>{ document.querySelectorAll('.db-nav__item').forEach((b)=>b.classList.remove('db-nav__item--active')); document.querySelectorAll('.db-tab').forEach((t)=>t.hidden=true); btn.classList.add('db-nav__item--active'); document.getElementById(`db-tab-${btn.dataset.tab}`).hidden=false; }); });

    await _loadInvoices(user.id, 1);

    Utils.initFileZone('gs-photo-zone','image');
    document.getElementById('gallery-submit-form')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const form=e.target; Utils.clearErrors(form);
      const {caption,date}=Utils.formData(form);
      const photoB64=document.getElementById('gs-photo-zone')?.dataset.base64;
      if (!caption?.trim()) { Utils.toast('Caption is required.','error'); return; }
      if (!photoB64) { Utils.toast('Please upload a photo.','error'); return; }
      const btn=document.getElementById('gs-submit-btn');
      Utils.setSubmitting(btn,true);
      try {
        await API.submitGallerySubmission({ url:photoB64, caption, date, submittedBy:user.name, memberId:user.id });
        Utils.toast('Photo submitted for Admin review!','success');
        form.reset(); delete document.getElementById('gs-photo-zone').dataset.base64;
        const prev=document.getElementById('gs-photo-zone').querySelector('.fuz-preview');
        if(prev){ prev.innerHTML=''; prev.classList.remove('fuz-preview--active'); }
        const hint=document.getElementById('gs-photo-zone').querySelector('.fuz-hint');
        if(hint) hint.style.display='';
      } catch(err) { Utils.toast(err.message,'error'); }
      finally { Utils.setSubmitting(btn,false); }
    });
  };

  const _loadInvoices = async (memberId, page) => {
    const wrap=document.getElementById('invoices-table-wrap'); if(!wrap) return;
    try {
      const {data,total,totalPages}=await API.getMemberInvoices(memberId,page);
      if (!data.length) { wrap.innerHTML='<p class="empty-state">No contribution records found. Receipts will appear here once uploaded by the Admin.</p>'; return; }
      wrap.setAttribute('aria-busy','false');
      wrap.innerHTML=`
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Month</th><th>Amount</th><th>Status</th><th>Paid On</th><th>Receipt</th></tr></thead>
            <tbody>
              ${data.map((inv)=>`
                <tr class="${inv.receiptBase64?'invoice-row--has-receipt':''}">
                  <td>${Utils.escapeHtml(inv.month)}</td>
                  <td class="font-mono">${Utils.fmtMoney(inv.amount)}</td>
                  <td>${Utils.badge(inv.status)}</td>
                  <td>${inv.paidAt?Utils.fmtDateShort(inv.paidAt):'—'}</td>
                  <td>
                    ${inv.receiptBase64
                      ? `<a href="${inv.receiptBase64}" download="${Utils.escapeHtml(inv.receiptName||'receipt')}" class="btn btn--success btn--xs">📥 Download</a>`
                      : `<span class="text-muted">Not uploaded yet</span>`}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="table-summary">${total} total records</p>`;
      Utils.renderPagination('invoices-pagination',page,totalPages,(p)=>_loadInvoices(memberId,p));
    } catch(err) { wrap.innerHTML=`<p class="error-state">${err.message}</p>`; }
  };

  // ── ADMIN DASHBOARD ───────────────────────────────────────────────────────────

  const renderAdminDashboard = async () => {
    if (!Auth.require('admin')) return;

    main().innerHTML = `
      <div class="dashboard dashboard--admin">
        <div class="dashboard__sidebar">
          <div class="db-profile db-profile--admin">
            <div class="db-admin-badge">⚙️</div>
            <h2>Admin Panel</h2>
            <p>${CONFIG.TERM_LABEL}</p>
          </div>
          <nav class="db-nav">
            <button class="db-nav__item db-nav__item--active" data-tab="applications">📥 Applications</button>
            <button class="db-nav__item" data-tab="members">👥 Members</button>
            <button class="db-nav__item" data-tab="founders">🏆 Board of Founders</button>
            <button class="db-nav__item" data-tab="executive">🏛️ Executive Council</button>
            <button class="db-nav__item" data-tab="notices">📰 Notices</button>
            <button class="db-nav__item" data-tab="gallery">🖼️ Gallery</button>
            <button class="db-nav__item" data-tab="capital">💰 Capital & Investment</button>
            <button class="db-nav__item" data-tab="branding">🎨 Branding</button>
          </nav>
        </div>
        <div class="dashboard__main">

          <div id="db-tab-applications" class="db-tab">
            <div class="db-section-head"><div><h2>Membership Applications</h2><p>Review, approve, or reject incoming applications. Approving auto-generates a Member ID.</p></div></div>
            <div id="admin-applications-list" aria-live="polite">${Utils.skeleton(3,'table')}</div>
          </div>

          <div id="db-tab-members" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Member Management</h2><p>Full control over records, IDs, documents, and invoice receipts.</p></div>
              <button class="btn btn--primary btn--sm" id="add-member-btn">＋ Add Member</button>
            </div>
            <div id="admin-members-list" aria-live="polite">${Utils.skeleton(5,'table')}</div>
          </div>

          <div id="db-tab-founders" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Board of Founders</h2><p>Manage the permanent founding-body roster and term settings.</p></div>
              <button class="btn btn--primary btn--sm" id="add-founder-btn">＋ Add Founder</button>
            </div>
            <div class="committee-term-settings-card" id="bof-term-card">${Utils.skeleton(2,'table')}</div>
            <div id="admin-founders-list" aria-live="polite" style="margin-top:1.5rem">${Utils.skeleton(4,'table')}</div>
          </div>

          <div id="db-tab-executive" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Executive Council</h2><p>Manage the current term's roster and set official term dates.</p></div>
              <button class="btn btn--primary btn--sm" id="add-ec-btn">＋ Add EC Member</button>
            </div>
            <div class="committee-term-settings-card" id="ec-term-card">${Utils.skeleton(2,'table')}</div>
            <div id="admin-ec-list" aria-live="polite" style="margin-top:1.5rem">${Utils.skeleton(6,'table')}</div>
          </div>

          <div id="db-tab-notices" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Notice Board</h2><p>Create, edit, publish, and attach PDFs to notices.</p></div>
              <button class="btn btn--primary btn--sm" id="create-notice-btn">＋ New Notice</button>
            </div>
            <div id="admin-notices-list" aria-live="polite">${Utils.skeleton(5,'table')}</div>
          </div>

          <div id="db-tab-gallery" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Photo Gallery</h2><p>Add photos directly, or review and approve member submissions.</p></div>
              <button class="btn btn--primary btn--sm" id="admin-add-photo-btn">＋ Add Photo</button>
            </div>
            <h3 style="font-size:1rem;margin-bottom:.75rem;color:var(--c-slate)">Member Submissions — Pending Approval</h3>
            <div id="admin-gallery-submissions" aria-live="polite">${Utils.skeleton(3,'table')}</div>
            <h3 style="font-size:1rem;margin:1.5rem 0 .75rem;color:var(--c-slate)">Published Gallery</h3>
            <div id="admin-gallery-list" aria-live="polite">${Utils.skeleton(4,'table')}</div>
          </div>

          <div id="db-tab-capital" class="db-tab" hidden>
            <div class="db-section-head"><div><h2>Capital & Investment</h2><p>Update capital figures displayed on the Portfolio and Financial Transparency pages.</p></div></div>
            <div id="admin-capital-form-wrap">${Utils.skeleton(4,'card')}</div>
          </div>

          <div id="db-tab-branding" class="db-tab" hidden>
            <div class="db-section-head"><div><h2>Site Branding</h2><p>Upload a custom organisation logo shown in the navigation bar.</p></div></div>
            <div class="form-card" id="branding-card">
              <p class="form-card__note">Recommended: square PNG with transparent background, at least 200×200 px.</p>
              ${Utils.fileZoneHtml({ id:'branding-logo-zone', name:'logo', label:'Organisation Logo', kind:'image', existing:Utils.getCustomLogo(), accept:'image/*' })}
              <div class="modal-actions">
                <button class="btn btn--primary" id="save-logo-btn">Save Logo</button>
                <button class="btn btn--ghost"   id="reset-logo-btn">Reset to Default</button>
              </div>
            </div>
          </div>

        </div>
      </div>`;

    // Tab switching
    document.querySelectorAll('.db-nav__item').forEach((btn)=>{ btn.addEventListener('click',()=>{ document.querySelectorAll('.db-nav__item').forEach((b)=>b.classList.remove('db-nav__item--active')); document.querySelectorAll('.db-tab').forEach((t)=>t.hidden=true); btn.classList.add('db-nav__item--active'); document.getElementById(`db-tab-${btn.dataset.tab}`).hidden=false; }); });

    Utils.initFileZone('branding-logo-zone','image');

    await Promise.all([
      _adminLoadApplications(),
      _adminLoadMembers(),
      _adminLoadBofWithTermSettings(),
      _adminLoadEcWithTermSettings(),
      _adminLoadNotices(),
      _adminLoadGallery(),
      _adminLoadCapital(),
    ]);

    document.getElementById('add-member-btn')?.addEventListener('click',()=>_adminMemberModal(null));
    document.getElementById('add-founder-btn')?.addEventListener('click',()=>_adminCommitteeModal('bof',null));
    document.getElementById('add-ec-btn')?.addEventListener('click',()=>_adminCommitteeModal('ec',null));
    document.getElementById('create-notice-btn')?.addEventListener('click',()=>_adminNoticeModal(null));
    document.getElementById('admin-add-photo-btn')?.addEventListener('click',()=>_adminAddPhotoModal());

    document.getElementById('save-logo-btn')?.addEventListener('click',()=>{ const b64=document.getElementById('branding-logo-zone')?.dataset.base64; if(!b64){Utils.toast('Please choose a logo image first.','warning');return;} Utils.setCustomLogo(b64); Components.Navbar.render(); Components.Navbar.updateAuthState(); Utils.toast('Logo updated!','success'); });
    document.getElementById('reset-logo-btn')?.addEventListener('click',()=>{ Utils.clearCustomLogo(); Components.Navbar.render(); Components.Navbar.updateAuthState(); Utils.toast('Logo reset to default.','info'); renderAdminDashboard(); });
  };

  // ── ADMIN: APPLICATIONS ───────────────────────────────────────────────────────

  const _adminLoadApplications = async () => {
    const el=document.getElementById('admin-applications-list'); if(!el) return;
    try {
      const apps=await API.getApplications();
      if (!apps.length){el.innerHTML='<p class="empty-state">No applications yet.</p>';return;}
      el.innerHTML=`<div class="table-wrap"><table class="data-table"><thead><tr><th>Applicant</th><th>Phone</th><th>Referee ID</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        ${apps.map((a)=>`<tr>
          <td><strong>${Utils.escapeHtml(a.name)}</strong><br><span class="text-muted">${Utils.escapeHtml(a.email)}</span></td>
          <td>${Utils.escapeHtml(a.phone)}</td>
          <td class="font-mono">${Utils.escapeHtml(a.reference?.memberId||'—')}</td>
          <td>${Utils.fmtDateShort(a.submittedAt)}</td>
          <td>${Utils.badge(a.status)}</td>
          <td class="td-actions">
            <button class="btn btn--outline btn--xs view-app" data-id="${a.id}">View</button>
            ${a.status==='pending'?`<button class="btn btn--success btn--xs approve-app" data-id="${a.id}">Approve</button><button class="btn btn--danger btn--xs reject-app" data-id="${a.id}">Reject</button>`:''}
          </td>
        </tr>`).join('')}
      </tbody></table></div>`;
      el.querySelectorAll('.view-app').forEach((btn)=>btn.addEventListener('click',()=>_adminViewApplication(btn.dataset.id,apps)));
      el.querySelectorAll('.approve-app').forEach((btn)=>btn.addEventListener('click',()=>{ if(confirm('Approve this application? A Member ID will be generated automatically.')) _adminApproveApp(btn.dataset.id); }));
      el.querySelectorAll('.reject-app').forEach((btn)=>btn.addEventListener('click',()=>_adminRejectAppModal(btn.dataset.id)));
    } catch(err){el.innerHTML=`<p class="error-state">${err.message}</p>`;}
  };

  const _adminApproveApp = async (appId) => {
    try {
      const {member}=await API.approveApplication(appId);
      Utils.modal.open(`<div class="approval-success"><div class="approval-success__icon">✅</div><h3>Application Approved!</h3><p>New member created with ID:</p><div class="approval-success__id">${member.memberId}</div><p class="footnote">Share this ID and the assigned password with the new member. Default password = Member ID (admin should update it).</p></div><div class="modal-actions"><button class="btn btn--primary" onclick="Utils.modal.close()">Done</button></div>`,'Member Approved');
      _adminLoadApplications(); _adminLoadMembers();
    } catch(err){Utils.toast(err.message,'error');}
  };

  const _adminRejectAppModal = (id) => {
    Utils.modal.open(`<div class="form-group"><label for="app-rej-reason">Rejection Reason</label><textarea id="app-rej-reason" class="input input--textarea" rows="3"></textarea></div><div class="modal-actions"><button class="btn btn--danger btn--sm" id="confirm-app-reject" data-id="${id}">Confirm Rejection</button><button class="btn btn--ghost btn--sm" onclick="Utils.modal.close()">Cancel</button></div>`,'Reject Application');
    document.getElementById('confirm-app-reject')?.addEventListener('click',async(e)=>{ try{ await API.rejectApplication(e.target.dataset.id,document.getElementById('app-rej-reason').value); Utils.toast('Application rejected.','warning'); Utils.modal.close(); _adminLoadApplications(); }catch(err){Utils.toast(err.message,'error');} });
  };

  const _adminViewApplication = (id, apps) => {
    const a=apps.find((x)=>x.id===id); if(!a) return;
    Utils.modal.open(`
      <div class="app-view">
        <div class="upload-grid mb-4">
          <div class="profile-doc-card">${a.photo?`<img src="${a.photo}" class="profile-doc-card__img" alt="Photo">`:`<div class="profile-doc-card__placeholder">📷</div>`}<span>Photo</span></div>
          <div class="profile-doc-card">${a.nidPhoto?`<img src="${a.nidPhoto}" class="profile-doc-card__img" alt="NID">`:`<div class="profile-doc-card__placeholder">📄</div>`}<span>NID</span></div>
          <div class="profile-doc-card">${a.signaturePhoto?`<img src="${a.signaturePhoto}" class="profile-doc-card__img" alt="Sig">`:`<div class="profile-doc-card__placeholder">✍️</div>`}<span>Signature</span></div>
        </div>
        <dl class="profile-detail-grid">
          ${[['Name',a.name],["Father's",a.fatherName],["Mother's",a.motherName],['DOB',Utils.fmtDate(a.dob)],['NID',a.nidNumber],['Education',a.education||'—'],['Occupation',a.occupation],['Phone',a.phone],['Email',a.email]].map(([k,v])=>`<div class="profile-row"><dt>${k}</dt><dd>${Utils.escapeHtml(v||'—')}</dd></div>`).join('')}
        </dl>
        <h4 class="profile-section-title">Present Address</h4><p class="profile-address">${Utils.escapeHtml(fmtAddr(a.presentAddress,'present'))}</p>
        <h4 class="profile-section-title">Permanent Address</h4><p class="profile-address">${Utils.escapeHtml(fmtAddr(a.permanentAddress,'permanent'))}</p>
        <h4 class="profile-section-title">Nominee</h4>
        <dl class="profile-detail-grid">
          <div class="profile-row"><dt>Name</dt><dd>${Utils.escapeHtml(a.nominee?.name||'—')}</dd></div>
          <div class="profile-row"><dt>Relationship</dt><dd>${Utils.escapeHtml(a.nominee?.relationship||'—')}</dd></div>
          <div class="profile-row"><dt>NID</dt><dd>${Utils.escapeHtml(a.nominee?.nidNumber||'—')}</dd></div>
          <div class="profile-row"><dt>Phone</dt><dd>${Utils.escapeHtml(a.nominee?.phone||'—')}</dd></div>
        </dl>
        <h4 class="profile-section-title">Reference</h4>
        <p class="font-mono">Member ID: ${Utils.escapeHtml(a.reference?.memberId||'—')} · Phone: ${Utils.escapeHtml(a.reference?.phone||'—')}</p>
        ${a.reviewNote?`<h4 class="profile-section-title">Review Note</h4><p>${Utils.escapeHtml(a.reviewNote)}</p>`:''}
      </div>`,`Application: ${a.name}`);
  };

  // ── ADMIN: MEMBERS ────────────────────────────────────────────────────────────

  const _adminLoadMembers = async () => {
    const el=document.getElementById('admin-members-list'); if(!el) return;
    try {
      const members=await API.getMembers();
      el.innerHTML=`<div class="table-wrap"><table class="data-table"><thead><tr><th>Photo</th><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>
        ${members.map((m)=>`<tr>
          <td><img src="${m.photo}" alt="" width="36" height="36" class="table-avatar" loading="lazy"></td>
          <td class="font-mono">${m.memberId}</td>
          <td><strong>${Utils.escapeHtml(m.name)}</strong></td>
          <td>${Utils.escapeHtml(m.phone)}</td>
          <td>${Utils.escapeHtml(m.email)}</td>
          <td>${Utils.badge(m.role)}</td>
          <td>${Utils.badge(m.status)}</td>
          <td class="td-actions">
            <button class="btn btn--outline btn--xs edit-member" data-id="${m.id}">Edit</button>
            <button class="btn btn--cobalt btn--xs member-invoices" data-id="${m.id}" data-name="${Utils.escapeHtml(m.name)}" data-mid="${m.id}">📥 Invoices</button>
            <button class="btn btn--outline btn--xs send-id-email" data-id="${m.id}">Email ID</button>
            <button class="btn btn--danger btn--xs delete-member" data-id="${m.id}">Delete</button>
          </td>
        </tr>`).join('')}
      </tbody></table></div><p class="table-summary">${members.length} total members</p>`;
      el.querySelectorAll('.edit-member').forEach((btn)=>btn.addEventListener('click',()=>_adminMemberModal(btn.dataset.id,members)));
      el.querySelectorAll('.member-invoices').forEach((btn)=>btn.addEventListener('click',()=>_adminMemberInvoicesModal(btn.dataset.id,btn.dataset.name)));
      el.querySelectorAll('.send-id-email').forEach((btn)=>btn.addEventListener('click',async()=>{ try{await API.sendIdEmail(btn.dataset.id);Utils.toast('Member ID emailed.','success');}catch(err){Utils.toast(err.message,'error');} }));
      el.querySelectorAll('.delete-member').forEach((btn)=>btn.addEventListener('click',async()=>{ if(!confirm('Delete this member permanently?')) return; try{await API.deleteMember(btn.dataset.id);Utils.toast('Member deleted.','warning');_adminLoadMembers();}catch(err){Utils.toast(err.message,'error');} }));
    } catch(err){el.innerHTML=`<p class="error-state">${err.message}</p>`;}
  };

  // ── ADMIN: MEMBER INVOICE UPLOAD ──────────────────────────────────────────────

  const _adminMemberInvoicesModal = async (memberId, memberName) => {
    Utils.modal.open(`<div id="invoice-modal-inner">${Utils.skeleton(4,'table')}</div>`,'Invoices: ' + memberName);
    try {
      const {data}=await API.getMemberInvoices(memberId,1);
      const inner=document.getElementById('invoice-modal-inner');
      if(!inner) return;
      inner.innerHTML=`
        <div class="table-wrap" style="margin-bottom:1.5rem">
          <table class="data-table">
            <thead><tr><th>Month</th><th>Amount</th><th>Status</th><th>Receipt</th><th>Actions</th></tr></thead>
            <tbody>
              ${data.length
                ? data.map((inv)=>`<tr>
                    <td>${Utils.escapeHtml(inv.month)}</td>
                    <td class="font-mono">${Utils.fmtMoney(inv.amount)}</td>
                    <td>${Utils.badge(inv.status)}</td>
                    <td>${inv.receiptBase64?'✅ Uploaded':'❌ None'}</td>
                    <td class="td-actions">
                      <button class="btn btn--outline btn--xs edit-inv" data-id="${inv.id}" data-month="${Utils.escapeHtml(inv.month)}" data-amount="${inv.amount}" data-status="${inv.status}" data-paidat="${inv.paidAt||''}">Edit</button>
                      <button class="btn btn--danger btn--xs del-inv" data-id="${inv.id}">Delete</button>
                    </td>
                  </tr>`).join('')
                : `<tr><td colspan="5" class="text-muted" style="text-align:center;padding:1rem">No invoices yet</td></tr>`}
            </tbody>
          </table>
        </div>
        <h4 style="font-size:.95rem;font-weight:700;color:var(--c-midnight);margin-bottom:1rem">Upload New Invoice / Update Existing Month</h4>
        <form id="invoice-upload-form" novalidate>
          <div class="form-grid">
            <div class="form-group"><label>Month <span>*</span></label><input type="text" id="inv-month" name="month" class="input" required placeholder="e.g. July 2026"></div>
            <div class="form-group"><label>Amount (BDT) <span>*</span></label><input type="number" id="inv-amount" name="amount" class="input" required min="0" value="${CONFIG.MONTHLY_CONTRIBUTION}"></div>
            <div class="form-group">
              <label>Status <span>*</span></label>
              <select id="inv-status" name="status" class="input">
                <option value="paid">Paid</option>
                <option value="pending" selected>Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div class="form-group"><label>Paid On</label><input type="date" id="inv-paidat" name="paidAt" class="input"></div>
          </div>
          <div class="form-group">
            ${Utils.fileZoneHtml({ id:'inv-receipt-zone', name:'receipt', label:'Receipt / Invoice File', kind:'doc', accept:'application/pdf,image/*' })}
          </div>
          <div class="modal-actions">
            <button type="submit" class="btn btn--primary" id="inv-upload-btn">Upload Invoice</button>
            <button type="button" class="btn btn--ghost" onclick="Utils.modal.close()">Close</button>
          </div>
        </form>`;

      Utils.initFileZone('inv-receipt-zone','doc');

      inner.querySelectorAll('.del-inv').forEach((btn)=>btn.addEventListener('click',async()=>{ if(!confirm('Delete this invoice?')) return; try{await API.deleteMemberInvoice(memberId,btn.dataset.id);Utils.toast('Invoice deleted.','warning');_adminMemberInvoicesModal(memberId,memberName);_adminLoadMembers();}catch(err){Utils.toast(err.message,'error');} }));
      inner.querySelectorAll('.edit-inv').forEach((btn)=>{
        btn.addEventListener('click',()=>{
          document.getElementById('inv-month').value=btn.dataset.month;
          document.getElementById('inv-amount').value=btn.dataset.amount;
          document.getElementById('inv-status').value=btn.dataset.status;
          document.getElementById('inv-paidat').value=btn.dataset.paidat||'';
        });
      });

      document.getElementById('invoice-upload-form')?.addEventListener('submit',async(e)=>{
        e.preventDefault();
        const month=document.getElementById('inv-month').value.trim();
        const amount=parseFloat(document.getElementById('inv-amount').value)||0;
        const status=document.getElementById('inv-status').value;
        const paidAt=document.getElementById('inv-paidat').value||null;
        if(!month){Utils.toast('Month is required.','error');return;}
        const receiptZone=document.getElementById('inv-receipt-zone');
        const receiptB64=receiptZone?.dataset.base64||null;
        const receiptInput=receiptZone?.querySelector('input[type="file"]')?.files[0];
        const btn=document.getElementById('inv-upload-btn');
        Utils.setSubmitting(btn,true);
        try {
          await API.uploadMemberInvoice(memberId,{ month, amount, status, paidAt, receiptBase64:receiptB64, receiptName:receiptInput?.name||null, uploadedBy:Auth.getUser()?.name||'Admin' });
          Utils.toast(`Invoice for ${month} uploaded successfully!`,'success');
          _adminMemberInvoicesModal(memberId,memberName);
        }catch(err){Utils.toast(err.message,'error');}
        finally{Utils.setSubmitting(btn,false);}
      });
    } catch(err){ const inner=document.getElementById('invoice-modal-inner'); if(inner) inner.innerHTML=`<p class="error-state">${err.message}</p>`; }
  };

  // ── ADMIN: MEMBER FORM MODAL ──────────────────────────────────────────────────

  const _adminMemberModal = (id, members=[]) => {
    const m=id?members.find((x)=>x.id===id):null;
    const pa=m?.presentAddress||{}, pm=m?.permanentAddress||{}, nom=m?.nominee||{};
    Utils.modal.open(`
      <form id="member-form" novalidate class="application-form application-form--compact">
        <fieldset class="form-fieldset">
          <legend>🆔 Member ID & Access</legend>
          <div class="form-grid">
            <div class="form-group"><label>Member ID</label><input type="text" id="mf-id" class="input" value="${m?Utils.escapeHtml(m.memberId):''}" placeholder="${m?'':'Auto-generated if blank'}"><span class="footnote" style="margin-top:0">Changing ID resets the login username.</span></div>
            <div class="form-group"><label>Password (leave blank to keep)</label><input type="text" id="mf-password" class="input" placeholder="${m?'Leave blank to keep current password':'e.g. DD-007'}" autocomplete="off"></div>
            <div class="form-group"><label>Status</label><select id="mf-status" class="input"><option value="active" ${m?.status==='active'?'selected':''}>Active</option><option value="inactive" ${m?.status==='inactive'?'selected':''}>Inactive</option></select></div>
          </div>
        </fieldset>
        <fieldset class="form-fieldset">
          <legend>👤 Personal Information</legend>
          <div class="form-grid">
            <div class="form-group"><label>Full Name *</label><input type="text" id="mf-name" class="input" required value="${m?Utils.escapeHtml(m.name):''}"></div>
            <div class="form-group"><label>Date of Birth</label><input type="date" id="mf-dob" class="input" value="${m?.dob||''}"></div>
            <div class="form-group"><label>Father's Name</label><input type="text" id="mf-father" class="input" value="${m?Utils.escapeHtml(m.fatherName||''):''}"></div>
            <div class="form-group"><label>Mother's Name</label><input type="text" id="mf-mother" class="input" value="${m?Utils.escapeHtml(m.motherName||''):''}"></div>
            <div class="form-group"><label>NID Number</label><input type="text" id="mf-nid" class="input" value="${m?Utils.escapeHtml(m.nidNumber||''):''}"></div>
            <div class="form-group"><label>Occupation</label><input type="text" id="mf-occupation" class="input" value="${m?Utils.escapeHtml(m.occupation||''):''}"></div>
            <div class="form-group"><label>Phone *</label><input type="tel" id="mf-phone" class="input" required value="${m?Utils.escapeHtml(m.phone):''}"></div>
            <div class="form-group"><label>Email *</label><input type="email" id="mf-email" class="input" required value="${m?Utils.escapeHtml(m.email):''}"></div>
          </div>
        </fieldset>
        <fieldset class="form-fieldset">
          <legend>🏠 Present Address</legend>
          <div class="form-grid">
            <div class="form-group"><label>House / Road</label><input type="text" id="mf-pa-house" class="input" value="${Utils.escapeHtml(pa.house||'')}"></div>
            <div class="form-group"><label>Area</label><input type="text" id="mf-pa-area" class="input" value="${Utils.escapeHtml(pa.area||'')}"></div>
            <div class="form-group"><label>City</label><input type="text" id="mf-pa-city" class="input" value="${Utils.escapeHtml(pa.city||'')}"></div>
            <div class="form-group"><label>Post Code</label><input type="text" id="mf-pa-post" class="input" value="${Utils.escapeHtml(pa.postCode||'')}"></div>
          </div>
        </fieldset>
        <fieldset class="form-fieldset">
          <legend>🏡 Permanent Address</legend>
          <div class="form-grid">
            <div class="form-group"><label>Village / Ward</label><input type="text" id="mf-pm-village" class="input" value="${Utils.escapeHtml(pm.village||'')}"></div>
            <div class="form-group"><label>Upazila / Thana</label><input type="text" id="mf-pm-upazila" class="input" value="${Utils.escapeHtml(pm.upazila||'')}"></div>
            <div class="form-group"><label>District</label><input type="text" id="mf-pm-district" class="input" value="${Utils.escapeHtml(pm.district||'')}"></div>
            <div class="form-group"><label>Post Code</label><input type="text" id="mf-pm-post" class="input" value="${Utils.escapeHtml(pm.postCode||'')}"></div>
          </div>
        </fieldset>
        <fieldset class="form-fieldset">
          <legend>📎 Documents</legend>
          <div class="upload-grid">
            ${Utils.fileZoneHtml({ id:'mf-photo-zone',     name:'photo',          label:'Photo',      kind:'image', existing:m?.photo||null,          accept:'image/*' })}
            ${Utils.fileZoneHtml({ id:'mf-nid-zone',       name:'nidPhoto',       label:'NID Copy',   kind:'doc',   existing:m?.nidPhoto||null,       accept:'image/*,application/pdf' })}
            ${Utils.fileZoneHtml({ id:'mf-signature-zone', name:'signaturePhoto', label:'Signature',  kind:'image', existing:m?.signaturePhoto||null, accept:'image/*' })}
          </div>
        </fieldset>
        <fieldset class="form-fieldset">
          <legend>🔁 Nominee</legend>
          <div class="form-grid">
            <div class="form-group"><label>Nominee Name</label><input type="text" id="mf-nom-name" class="input" value="${Utils.escapeHtml(nom.name||'')}"></div>
            <div class="form-group"><label>Relationship</label><select id="mf-nom-rel" class="input"><option value="">Select</option>${relationOptions.map((r)=>`<option value="${r}" ${nom.relationship===r?'selected':''}>${r}</option>`).join('')}</select></div>
            <div class="form-group"><label>Nominee NID</label><input type="text" id="mf-nom-nid" class="input" value="${Utils.escapeHtml(nom.nidNumber||'')}"></div>
            <div class="form-group"><label>Nominee Phone</label><input type="tel" id="mf-nom-phone" class="input" value="${Utils.escapeHtml(nom.phone||'')}"></div>
          </div>
          <div class="upload-grid">
            ${Utils.fileZoneHtml({ id:'mf-nom-photo-zone', name:'nomPhoto',    label:"Nominee's Photo",    kind:'image', existing:nom.photo||null,    accept:'image/*' })}
            ${Utils.fileZoneHtml({ id:'mf-nom-nid-zone',   name:'nomNidPhoto', label:"Nominee's NID Copy", kind:'doc',   existing:nom.nidPhoto||null, accept:'image/*,application/pdf' })}
          </div>
        </fieldset>
        <div class="modal-actions">
          <button type="submit" class="btn btn--primary">${m?'Save Changes':'Add Member'}</button>
          <button type="button" class="btn btn--ghost" onclick="Utils.modal.close()">Cancel</button>
        </div>
      </form>`, m?`Edit: ${m.name}`:'Add New Member');

    ['mf-photo-zone','mf-signature-zone','mf-nom-photo-zone'].forEach((z)=>Utils.initFileZone(z,'image'));
    ['mf-nid-zone','mf-nom-nid-zone'].forEach((z)=>Utils.initFileZone(z,'doc'));

    document.getElementById('member-form')?.addEventListener('submit',async(e)=>{
      e.preventDefault();
      const name=document.getElementById('mf-name').value.trim();
      const phone=document.getElementById('mf-phone').value.trim();
      const email=document.getElementById('mf-email').value.trim();
      if(!name||!phone||!email){Utils.toast('Name, phone, and email are required.','error');return;}
      const memberIdInput=document.getElementById('mf-id').value.trim().toUpperCase();
      const passwordInput=document.getElementById('mf-password').value.trim();
      const data={
        ...(memberIdInput?{memberId:memberIdInput}:{}),
        ...(passwordInput?{password:passwordInput}:{}),
        status:document.getElementById('mf-status').value,
        name,phone,email,
        dob:document.getElementById('mf-dob').value||null,
        fatherName:document.getElementById('mf-father').value.trim(),
        motherName:document.getElementById('mf-mother').value.trim(),
        nidNumber:document.getElementById('mf-nid').value.trim(),
        occupation:document.getElementById('mf-occupation').value.trim(),
        presentAddress:{ house:document.getElementById('mf-pa-house').value.trim(), area:document.getElementById('mf-pa-area').value.trim(), city:document.getElementById('mf-pa-city').value.trim(), postCode:document.getElementById('mf-pa-post').value.trim() },
        permanentAddress:{ village:document.getElementById('mf-pm-village').value.trim(), upazila:document.getElementById('mf-pm-upazila').value.trim(), district:document.getElementById('mf-pm-district').value.trim(), postCode:document.getElementById('mf-pm-post').value.trim() },
        photo:document.getElementById('mf-photo-zone')?.dataset.base64||m?.photo||null,
        nidPhoto:document.getElementById('mf-nid-zone')?.dataset.base64||m?.nidPhoto||null,
        signaturePhoto:document.getElementById('mf-signature-zone')?.dataset.base64||m?.signaturePhoto||null,
        nominee:{ name:document.getElementById('mf-nom-name').value.trim(), relationship:document.getElementById('mf-nom-rel').value, nidNumber:document.getElementById('mf-nom-nid').value.trim(), phone:document.getElementById('mf-nom-phone').value.trim(), photo:document.getElementById('mf-nom-photo-zone')?.dataset.base64||nom.photo||null, nidPhoto:document.getElementById('mf-nom-nid-zone')?.dataset.base64||nom.nidPhoto||null },
      };
      try {
        if(m){await API.updateMember(m.id,data);Utils.toast('Member updated.','success');}
        else{ const nw=await API.createMember(data); Utils.toast(`Member added! ID: ${nw.memberId}`,'success',6000); }
        Utils.modal.close(); _adminLoadMembers();
      }catch(err){Utils.toast(err.message,'error');}
    });
  };

  // ── ADMIN: BoF WITH TERM SETTINGS ────────────────────────────────────────────

  const _adminLoadBofWithTermSettings = async () => {
    const termCard=document.getElementById('bof-term-card');
    const listEl=document.getElementById('admin-founders-list');
    try {
      const [founders,settings]=await Promise.all([API.getBoardOfFounders(), API.getCommitteeSettings()]);
      const bof=settings.bof||{};
      if(termCard) termCard.innerHTML=`
        <form id="bof-term-form" class="committee-term-settings-form">
          <h4>BoF Term Settings</h4>
          <div class="form-grid">
            <div class="form-group"><label>Term Duration (years)</label><input type="number" id="bof-term-years" class="input" min="1" max="10" value="${bof.termYears||2}"></div>
            <div class="form-group"><label>Internal Note</label><input type="text" id="bof-term-note" class="input" value="${Utils.escapeHtml(bof.note||'')}"></div>
          </div>
          <button type="submit" class="btn btn--primary btn--sm">Save Term Settings</button>
        </form>`;
      document.getElementById('bof-term-form')?.addEventListener('submit',async(e)=>{ e.preventDefault(); try{ await API.updateCommitteeSettings('bof',{ termYears:parseInt(document.getElementById('bof-term-years').value), note:document.getElementById('bof-term-note').value.trim() }); Utils.toast('BoF term settings saved.','success'); }catch(err){Utils.toast(err.message,'error');} });
      if(listEl) listEl.innerHTML=_committeeTableHtml(founders,'bof');
      _bindCommitteeEvents(listEl,'bof',founders);
    }catch(err){if(termCard)termCard.innerHTML=`<p class="error-state">${err.message}</p>`;}
  };

  // ── ADMIN: EC WITH TERM SETTINGS ─────────────────────────────────────────────

  const _adminLoadEcWithTermSettings = async () => {
    const termCard=document.getElementById('ec-term-card');
    const listEl=document.getElementById('admin-ec-list');
    try {
      const [members,settings]=await Promise.all([API.getExecutiveCommittee(), API.getCommitteeSettings()]);
      const ec=settings.ec||{};
      if(termCard) termCard.innerHTML=`
        <form id="ec-term-form" class="committee-term-settings-form">
          <h4>EC Current Term Settings</h4>
          <div class="form-grid">
            <div class="form-group"><label>Term Start Date</label><input type="date" id="ec-term-start" class="input" value="${ec.termStart||CONFIG.TERM_START}"></div>
            <div class="form-group"><label>Term End Date</label><input type="date" id="ec-term-end" class="input" value="${ec.termEnd||''}"></div>
            <div class="form-group"><label>Term Duration (years)</label><input type="number" id="ec-term-years" class="input" min="1" max="10" value="${ec.termYears||2}"></div>
            <div class="form-group"><label>Note</label><input type="text" id="ec-term-note" class="input" value="${Utils.escapeHtml(ec.note||'')}"></div>
          </div>
          <button type="submit" class="btn btn--primary btn--sm">Save Term Settings</button>
        </form>`;
      document.getElementById('ec-term-form')?.addEventListener('submit',async(e)=>{ e.preventDefault(); try{ await API.updateCommitteeSettings('ec',{ termStart:document.getElementById('ec-term-start').value, termEnd:document.getElementById('ec-term-end').value||null, termYears:parseInt(document.getElementById('ec-term-years').value), note:document.getElementById('ec-term-note').value.trim() }); Utils.toast('EC term settings saved.','success'); }catch(err){Utils.toast(err.message,'error');} });
      if(listEl) listEl.innerHTML=_committeeTableHtml(members,'ec');
      _bindCommitteeEvents(listEl,'ec',members);
    }catch(err){if(termCard)termCard.innerHTML=`<p class="error-state">${err.message}</p>`;}
  };

  const _committeeTableHtml = (list, type) => `
    <div class="table-wrap"><table class="data-table">
      <thead><tr><th>Photo</th><th>Name</th><th>Position</th><th>Term Start</th>${type==='ec'?'<th>Term End</th>':''}<th>Message Preview</th><th>Actions</th></tr></thead>
      <tbody>
        ${list.map((m)=>`<tr>
          <td><img src="${m.photo}" alt="" width="36" height="36" class="table-avatar"></td>
          <td><strong>${Utils.escapeHtml(m.name)}</strong></td>
          <td>${Utils.escapeHtml(m.position)}</td>
          <td>${Utils.fmtDateShort(m.termStart)}</td>
          ${type==='ec'?`<td>${m.termEnd?Utils.fmtDateShort(m.termEnd):'—'}</td>`:''}
          <td class="td-reason">${Utils.escapeHtml((m.message||'').substring(0,50))}…</td>
          <td class="td-actions">
            <button class="btn btn--outline btn--xs edit-cm" data-id="${m.id}">Edit</button>
            <button class="btn btn--danger btn--xs del-cm" data-id="${m.id}">Remove</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table></div>`;

  const _bindCommitteeEvents = (el, type, list) => {
    if(!el) return;
    el.querySelectorAll('.edit-cm').forEach((btn)=>btn.addEventListener('click',()=>_adminCommitteeModal(type,btn.dataset.id,list)));
    el.querySelectorAll('.del-cm').forEach((btn)=>btn.addEventListener('click',async()=>{ if(!confirm('Remove from roster?')) return; const updated=list.filter((x)=>x.id!==btn.dataset.id); try{ if(type==='bof') await API.updateBoardOfFounders(updated); else await API.updateExecutiveCommittee(updated); Utils.toast('Removed.','warning'); type==='bof'?_adminLoadBofWithTermSettings():_adminLoadEcWithTermSettings(); }catch(err){Utils.toast(err.message,'error');} }));
  };

  const _adminCommitteeModal = (type, id, list=[]) => {
    const m=id?list.find((x)=>x.id===id):null;
    const isBof=type==='bof';
    Utils.modal.open(`
      <form id="cm-form" novalidate>
        <div class="form-group"><label>Full Name *</label><input type="text" id="cm-name" class="input" required value="${m?Utils.escapeHtml(m.name):''}"></div>
        <div class="form-group"><label>Position / Title *</label><input type="text" id="cm-position" class="input" required value="${m?Utils.escapeHtml(m.position):''}" placeholder="${isBof?'e.g. Chairman & Founder':'e.g. President'}"></div>
        <div class="form-grid">
          <div class="form-group"><label>Term Start *</label><input type="date" id="cm-term-start" class="input" required value="${m?.termStart||(isBof?CONFIG.ORG_FOUNDED:CONFIG.TERM_START)}"></div>
          ${!isBof?`<div class="form-group"><label>Term End</label><input type="date" id="cm-term-end" class="input" value="${m?.termEnd||''}"></div>`:''}
        </div>
        <div class="form-group"><label>Display Order</label><input type="number" id="cm-order" class="input" min="1" value="${m?.order||(list.length+1)}"></div>
        <div class="form-group"><label>Personal Message *</label><textarea id="cm-message" class="input input--textarea" rows="3" required>${m?Utils.escapeHtml(m.message):''}</textarea></div>
        <div class="form-group">${Utils.fileZoneHtml({ id:'cm-photo-zone', name:'photo', label:'Photo', kind:'image', existing:m?.photo||null, accept:'image/*' })}</div>
        <div class="modal-actions">
          <button type="submit" class="btn btn--primary">${m?'Save Changes':'Add to Roster'}</button>
          <button type="button" class="btn btn--ghost" onclick="Utils.modal.close()">Cancel</button>
        </div>
      </form>`,m?`Edit: ${m.name}`:`Add to ${isBof?'Board of Founders':'Executive Council'}`);
    Utils.initFileZone('cm-photo-zone','image');
    document.getElementById('cm-form')?.addEventListener('submit',async(e)=>{ e.preventDefault(); const name=document.getElementById('cm-name').value.trim(), position=document.getElementById('cm-position').value.trim(), message=document.getElementById('cm-message').value.trim(), termStart=document.getElementById('cm-term-start').value, termEnd=isBof?null:(document.getElementById('cm-term-end')?.value||null), order=parseInt(document.getElementById('cm-order').value)||list.length+1; if(!name||!position||!message||!termStart){Utils.toast('Please fill all required fields.','error');return;} const entry={id:m?m.id:`${isBof?'bof':'ec'}${Date.now()}`,name,position,termStart,termEnd,order,message,photo:document.getElementById('cm-photo-zone')?.dataset.base64||m?.photo||`https://i.pravatar.cc/200?img=${Math.floor(Math.random()*70)}`}; const updated=m?list.map((x)=>x.id===m.id?entry:x):[...list,entry]; try{if(isBof)await API.updateBoardOfFounders(updated);else await API.updateExecutiveCommittee(updated);Utils.toast('Roster updated.','success');Utils.modal.close();isBof?_adminLoadBofWithTermSettings():_adminLoadEcWithTermSettings();}catch(err){Utils.toast(err.message,'error');} });
  };

  // ── ADMIN: NOTICES ────────────────────────────────────────────────────────────

  const _adminLoadNotices = async () => {
    const el=document.getElementById('admin-notices-list'); if(!el) return;
    try {
      const notices=await API.getAllNotices();
      if(!notices.length){el.innerHTML='<p class="empty-state">No notices yet.</p>';return;}
      el.innerHTML=`<div class="table-wrap"><table class="data-table"><thead><tr><th>Title</th><th>Category</th><th>Attachment</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead><tbody>
        ${notices.map((n)=>`<tr>
          <td><strong>${Utils.escapeHtml(n.title)}</strong></td>
          <td>${Utils.badge(n.category)}</td>
          <td>${n.attachmentBase64?'📎 Yes':'—'}</td>
          <td>${Utils.badge(n.published?'published':'draft')}</td>
          <td>${Utils.fmtDateShort(n.createdAt)}</td>
          <td class="td-actions">
            <button class="btn btn--outline btn--xs edit-notice" data-id="${n.id}">Edit</button>
            <button class="btn btn--${n.published?'warning':'success'} btn--xs toggle-notice" data-id="${n.id}" data-published="${n.published}">${n.published?'Unpublish':'Publish'}</button>
            <button class="btn btn--danger btn--xs del-notice" data-id="${n.id}">Delete</button>
          </td>
        </tr>`).join('')}
      </tbody></table></div>`;
      el.querySelectorAll('.edit-notice').forEach((btn)=>btn.addEventListener('click',()=>_adminNoticeModal(btn.dataset.id,notices)));
      el.querySelectorAll('.toggle-notice').forEach((btn)=>btn.addEventListener('click',async()=>{ const pub=btn.dataset.published==='true'; try{await API.updateNotice(btn.dataset.id,{published:!pub});Utils.toast(`Notice ${!pub?'published':'unpublished'}.`,'success');_adminLoadNotices();}catch(err){Utils.toast(err.message,'error');} }));
      el.querySelectorAll('.del-notice').forEach((btn)=>btn.addEventListener('click',async()=>{ if(!confirm('Delete this notice?')) return; try{await API.deleteNotice(btn.dataset.id);Utils.toast('Notice deleted.','warning');_adminLoadNotices();}catch(err){Utils.toast(err.message,'error');} }));
    }catch(err){el.innerHTML=`<p class="error-state">${err.message}</p>`;}
  };

  const _adminNoticeModal = (id, notices=[]) => {
    const n=id?notices.find((x)=>x.id===id):null;
    const cats=['Finance','Meeting','Investment','Announcement','CSR','General'];
    Utils.modal.open(`
      <form id="notice-form" novalidate>
        <div class="form-group"><label>Title *</label><input type="text" id="notice-title" class="input" required value="${n?Utils.escapeHtml(n.title):''}"></div>
        <div class="form-group"><label>Category</label><select id="notice-category" class="input">${cats.map((c)=>`<option value="${c}" ${n?.category===c?'selected':''}>${c}</option>`).join('')}</select></div>
        <div class="form-group"><label>Body *</label><textarea id="notice-body" class="input input--textarea" rows="5" required>${n?Utils.escapeHtml(n.body):''}</textarea></div>
        <div class="form-group"><label>Attachment (optional PDF or image)</label>${Utils.fileZoneHtml({ id:'notice-attachment-zone', name:'attachment', label:'PDF / Image', kind:'doc', existing:n?.attachmentBase64||null, accept:'application/pdf,image/*' })}</div>
        <div class="form-group form-group--checkbox"><label><input type="checkbox" id="notice-published" ${n?.published?'checked':''}> Publish immediately</label></div>
        <div class="modal-actions">
          <button type="submit" class="btn btn--primary">${id?'Save Changes':'Create Notice'}</button>
          <button type="button" class="btn btn--ghost" onclick="Utils.modal.close()">Cancel</button>
        </div>
      </form>`,id?'Edit Notice':'New Notice');
    Utils.initFileZone('notice-attachment-zone','doc');
    document.getElementById('notice-form')?.addEventListener('submit',async(e)=>{ e.preventDefault(); const title=document.getElementById('notice-title').value.trim(), body=document.getElementById('notice-body').value.trim(); if(!title||!body){Utils.toast('Title and body are required.','error');return;} const attZone=document.getElementById('notice-attachment-zone'); const attInput=attZone?.querySelector('input[type="file"]')?.files[0]; const data={title,body,category:document.getElementById('notice-category').value,published:document.getElementById('notice-published').checked,author:Auth.getUser().name,attachmentBase64:attZone?.dataset.base64||n?.attachmentBase64||null,attachmentName:attInput?.name||n?.attachmentName||null}; try{if(id)await API.updateNotice(id,data);else await API.createNotice(data);Utils.toast(id?'Notice updated.':'Notice created.','success');Utils.modal.close();_adminLoadNotices();}catch(err){Utils.toast(err.message,'error');} });
  };

  // ── ADMIN: GALLERY ────────────────────────────────────────────────────────────

  const _adminLoadGallery = async () => {
    const subEl=document.getElementById('admin-gallery-submissions');
    const listEl=document.getElementById('admin-gallery-list');
    try {
      const [submissions, galleryData] = await Promise.all([API.getGallerySubmissions(), API.getGallery(1)]);
      // Submissions
      if(subEl) subEl.innerHTML = submissions.length
        ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Preview</th><th>Caption</th><th>Submitted By</th><th>Date</th><th>Actions</th></tr></thead><tbody>
            ${submissions.map((s)=>`<tr>
              <td><img src="${s.url}" alt="" width="60" height="40" style="object-fit:cover;border-radius:4px"></td>
              <td>${Utils.escapeHtml(s.caption)}</td>
              <td>${Utils.escapeHtml(s.submittedBy||'Member')}</td>
              <td>${Utils.fmtDateShort(s.date)}</td>
              <td class="td-actions">
                <button class="btn btn--success btn--xs approve-gallery" data-id="${s.id}">Approve</button>
                <button class="btn btn--danger  btn--xs reject-gallery"  data-id="${s.id}">Reject</button>
              </td>
            </tr>`).join('')}
          </tbody></table></div>`
        : `<p class="empty-state">No pending submissions.</p>`;

      // Published gallery
      if(listEl) listEl.innerHTML = galleryData.data.length
        ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Preview</th><th>Caption</th><th>Date</th><th>By</th></tr></thead><tbody>
            ${galleryData.data.map((g)=>`<tr>
              <td><img src="${g.url}" alt="" width="60" height="40" style="object-fit:cover;border-radius:4px"></td>
              <td>${Utils.escapeHtml(g.caption)}</td>
              <td>${Utils.fmtDateShort(g.date)}</td>
              <td>${Utils.escapeHtml(g.submittedBy||'Admin')}</td>
            </tr>`).join('')}
          </tbody></table></div>`
        : `<p class="empty-state">No published photos yet.</p>`;

      subEl?.querySelectorAll('.approve-gallery').forEach((btn)=>btn.addEventListener('click',async()=>{ try{await API.approveGallerySubmission(btn.dataset.id);Utils.toast('Photo approved and published!','success');_adminLoadGallery();}catch(err){Utils.toast(err.message,'error');} }));
      subEl?.querySelectorAll('.reject-gallery').forEach((btn)=>btn.addEventListener('click',async()=>{ try{await API.rejectGallerySubmission(btn.dataset.id);Utils.toast('Submission rejected.','warning');_adminLoadGallery();}catch(err){Utils.toast(err.message,'error');} }));
    }catch(err){ if(subEl) subEl.innerHTML=`<p class="error-state">${err.message}</p>`; }
  };

  const _adminAddPhotoModal = () => {
    Utils.modal.open(`
      <form id="admin-photo-form" novalidate>
        <div class="form-group"><label>Caption *</label><input type="text" id="aphoto-caption" class="input" required placeholder="e.g. Annual Meeting December 2026"></div>
        <div class="form-group"><label>Event Date</label><input type="date" id="aphoto-date" class="input"></div>
        <div class="form-group">${Utils.fileZoneHtml({ id:'aphoto-zone', name:'photo', label:'Photo', kind:'image', accept:'image/*' })}</div>
        <div class="modal-actions">
          <button type="submit" class="btn btn--primary" id="aphoto-submit-btn">Add to Gallery</button>
          <button type="button" class="btn btn--ghost" onclick="Utils.modal.close()">Cancel</button>
        </div>
      </form>`,'Add Photo to Gallery');
    Utils.initFileZone('aphoto-zone','image');
    document.getElementById('admin-photo-form')?.addEventListener('submit',async(e)=>{ e.preventDefault(); const caption=document.getElementById('aphoto-caption').value.trim(), date=document.getElementById('aphoto-date').value, photoB64=document.getElementById('aphoto-zone')?.dataset.base64; if(!caption){Utils.toast('Caption is required.','error');return;} if(!photoB64){Utils.toast('Please upload a photo.','error');return;} const btn=document.getElementById('aphoto-submit-btn'); Utils.setSubmitting(btn,true); try{await API.createGalleryEntry({url:photoB64,caption,date:date||new Date().toISOString().split('T')[0],submittedBy:'Admin'});Utils.toast('Photo added to gallery!','success');Utils.modal.close();_adminLoadGallery();}catch(err){Utils.toast(err.message,'error');}finally{Utils.setSubmitting(btn,false);} });
  };

  // ── ADMIN: CAPITAL SETTINGS ───────────────────────────────────────────────────

  const _adminLoadCapital = async () => {
    const wrap=document.getElementById('admin-capital-form-wrap'); if(!wrap) return;
    try {
      const cap=await API.getCapitalSettings();
      wrap.innerHTML=`
        <div class="form-card" style="max-width:680px">
          <p class="form-card__note">These figures appear on the Portfolio page and Financial Transparency page. Leave fields blank to hide them. Figures are shown exactly as entered.</p>
          <form id="capital-form" novalidate>
            <div class="form-grid">
              <div class="form-group"><label>Total Capital (BDT)</label><input type="number" id="cap-total" class="input" min="0" value="${cap.totalCapital||''}" placeholder="e.g. 8400000"></div>
              <div class="form-group"><label>Annual Return (%)</label><input type="number" id="cap-return" class="input" min="0" step="0.1" value="${cap.annualReturn||''}" placeholder="e.g. 11.4"></div>
              <div class="form-group"><label>Members On-Time (%)</label><input type="number" id="cap-ontime" class="input" min="0" max="100" step="0.1" value="${cap.membersOnTime||''}" placeholder="e.g. 96"></div>
              <div class="form-group"><label>Reserve Fund (BDT)</label><input type="number" id="cap-reserve" class="input" min="0" value="${cap.reserveFund||''}" placeholder="e.g. 1260000"></div>
            </div>
            <div class="form-group"><label>Admin Note (optional)</label><textarea id="cap-note" class="input input--textarea" rows="2" placeholder="e.g. Based on Q2 2026 audit">${Utils.escapeHtml(cap.note||'')}</textarea></div>
            ${cap.lastUpdated?`<p class="footnote">Last saved: ${Utils.fmtDateShort(cap.lastUpdated)}</p>`:''}
            <div class="modal-actions">
              <button type="submit" class="btn btn--primary" id="save-capital-btn">Save Capital Figures</button>
            </div>
          </form>
        </div>`;
      document.getElementById('capital-form')?.addEventListener('submit',async(e)=>{ e.preventDefault(); const data={ totalCapital:parseFloat(document.getElementById('cap-total').value)||null, annualReturn:parseFloat(document.getElementById('cap-return').value)||null, membersOnTime:parseFloat(document.getElementById('cap-ontime').value)||null, reserveFund:parseFloat(document.getElementById('cap-reserve').value)||null, note:document.getElementById('cap-note').value.trim() }; const btn=document.getElementById('save-capital-btn'); Utils.setSubmitting(btn,true); try{await API.updateCapitalSettings(data);Utils.toast('Capital figures saved and live on the website!','success');_adminLoadCapital();}catch(err){Utils.toast(err.message,'error');}finally{Utils.setSubmitting(btn,false);} });
    }catch(err){wrap.innerHTML=`<p class="error-state">${err.message}</p>`;}
  };

  // ── PUBLIC INTERFACE ──────────────────────────────────────────────────────────

  return {
    render404, renderHome,
    renderPortfolio, renderFinancials,
    renderApply, renderNewMember, renderBenefits, renderNomineeSucession, renderFAQ, renderLogin,
    renderFounders, renderCommittee, renderMembersPage,
    renderValues, renderConduct, renderRules, renderCSR,
    renderMemberDashboard, renderAdminDashboard,
  };

})();
