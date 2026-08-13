// =============================================================================
// js/pages.js  —  Dream Development DD · v2 Page Render Functions
// =============================================================================
// PROTECTED pages start with: if (!Auth.require('<role>')) return;
// Admin-only actions check: if (!Auth.can('manage:xxx')) return;
// =============================================================================

const Pages = (() => {

  const main = () => document.getElementById('main-content');

  // ── SHARED HELPERS ─────────────────────────────────────────────────────────────

  const pageHero = (eyebrow, title, subtitle, extra='') => `
    <section class="page-hero">
      <div class="container page-hero__inner">
        <span class="eyebrow">${eyebrow}</span>
        <h1 class="page-hero__title">${title}</h1>
        ${subtitle ? `<p class="page-hero__sub">${subtitle}</p>` : ''}
        ${extra}
      </div>
    </section>`;

  const section = (id, content, cls='') =>
    `<section id="${id}" class="section ${cls}"><div class="container">${content}</div></section>`;

  const sectionHead = (label, title, subtitle='') => `
    <div class="section-head">
      <span class="section-rule" aria-hidden="true"></span>
      <p class="section-eyebrow">${label}</p>
      <h2 class="section-title">${title}</h2>
      ${subtitle ? `<p class="section-sub">${subtitle}</p>` : ''}
    </div>`;

  const fmtAddr = (a, type) => {
    if (!a) return '—';
    if (type === 'present')
      return [a.house, a.area, a.city, a.postCode].filter(Boolean).join(', ');
    return [a.village ? `Village: ${a.village}` : null, a.upazila ? `Upazila: ${a.upazila}` : null,
            a.district, a.postCode].filter(Boolean).join(', ');
  };

  const relationOptions = ['Father','Mother','Spouse','Son','Daughter','Brother','Sister','Other'];

  // ── 404 ────────────────────────────────────────────────────────────────────────

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

  // ── HOME ─────────────────────────────────────────────────────────────────────────

  const renderHome = async () => {
    main().innerHTML = `
      <section class="hero" aria-label="Welcome to Dream Development DD">
        <div class="hero__bg" aria-hidden="true">
          <div class="hero__geo hero__geo--1"></div>
          <div class="hero__geo hero__geo--2"></div>
          <div class="hero__geo hero__geo--3"></div>
        </div>
        <div class="container hero__inner">
          <div class="hero__content">
            <span class="eyebrow eyebrow--light">Democratic Investment Organisation · Since ${CONFIG.ORG_FOUNDED}</span>
            <h1 class="hero__title">${CONFIG.ORG_TAGLINE}.</h1>
            <p class="hero__sub">
              ${CONFIG.ORG_NAME} is a ${CONFIG.ORG_MEMBERS}-member democratic investment collective
              where every voice is equal, every record is transparent, and every member's
              future is secured by collective trust and disciplined growth.
            </p>
            <div class="hero__actions">
              <a href="#/apply"    class="btn btn--gold btn--lg">Apply for Membership</a>
              <a href="#/benefits" class="btn btn--outline-light btn--lg">Explore Benefits</a>
            </div>
          </div>
          <div class="hero__stats" aria-label="Key statistics">
            <div class="stat-card"><span class="stat-card__num">${CONFIG.ORG_MEMBERS}</span><span class="stat-card__label">Active Members</span></div>
            <div class="stat-card"><span class="stat-card__num">৳5,000</span><span class="stat-card__label">Monthly Contribution</span></div>
            <div class="stat-card"><span class="stat-card__num">${new Date().getFullYear()-parseInt(CONFIG.ORG_FOUNDED)}+</span><span class="stat-card__label">Years Active</span></div>
            <div class="stat-card"><span class="stat-card__num">100%</span><span class="stat-card__label">Democratic</span></div>
          </div>
        </div>
        <a href="#notice-board" class="hero__scroll-cue" aria-label="Scroll down">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 10l5 5 5-5"/></svg>
        </a>
      </section>

      <section id="notice-board" class="section section--light" aria-labelledby="notices-heading">
        <div class="container">
          ${sectionHead('Latest Updates', 'Notice Board', 'Official announcements, meeting schedules, and financial updates.')}
          <div id="notices-grid" class="notices-grid" aria-live="polite" aria-busy="true">${Utils.skeleton(6,'card')}</div>
          <div id="notices-pagination" class="pagination-wrap"></div>
        </div>
      </section>

      <section id="gallery" class="section" aria-labelledby="gallery-heading">
        <div class="container">
          ${sectionHead('Our Journey', 'Photo Gallery', 'Moments from our events, milestones, and community activities.')}
          <div id="gallery-grid" class="gallery-grid" aria-live="polite" aria-busy="true">${Utils.skeleton(8,'card')}</div>
          <div id="gallery-pagination" class="pagination-wrap"></div>
        </div>
      </section>

      <section class="cta-banner" aria-label="Join Dream Development DD">
        <div class="container cta-banner__inner">
          <div>
            <h2 class="cta-banner__title">Ready to build your dream with us?</h2>
            <p class="cta-banner__sub">Membership is open to qualified candidates with references from existing members.</p>
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
    } catch(err) { grid.innerHTML = `<p class="error-state">Failed to load notices. ${err.message}</p>`; }
  };

  const _noticeCard = (n) => `
    <article class="notice-card" aria-label="Notice: ${Utils.escapeHtml(n.title)}">
      <div class="notice-card__header">
        ${Utils.badge(n.category)}
        <time class="notice-card__time" datetime="${n.createdAt}">${Utils.timeAgo(n.createdAt)}</time>
      </div>
      <h3 class="notice-card__title">${Utils.escapeHtml(n.title)}</h3>
      <p class="notice-card__body">${Utils.escapeHtml(n.body)}</p>
      ${n.attachmentBase64 ? `
        <a href="${n.attachmentBase64}" download="${Utils.escapeHtml(n.attachmentName||'attachment')}" class="notice-card__attachment">
          📎 ${n.attachmentName && n.attachmentName.toLowerCase().endsWith('.pdf') ? 'Download PDF' : 'View Attachment'}
        </a>` : ''}
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
        item.addEventListener('click', () => {
          Utils.modal.open(`
            <figure class="lightbox-fig">
              <img src="${item.dataset.src}" alt="${Utils.escapeHtml(item.dataset.caption)}" class="lightbox-img" loading="lazy">
              <figcaption class="lightbox-cap">${Utils.escapeHtml(item.dataset.caption)}</figcaption>
            </figure>`);
        });
      });
    } catch(err) { grid.innerHTML = `<p class="error-state">Failed to load gallery. ${err.message}</p>`; }
  };

  const _galleryItem = (g) => `
    <button class="gallery-item" data-src="${g.url}" data-caption="${Utils.escapeHtml(g.caption)}"
            aria-label="View photo: ${Utils.escapeHtml(g.caption)}">
      <img src="${g.url}" alt="${Utils.escapeHtml(g.caption)}" loading="lazy" class="gallery-item__img">
      <div class="gallery-item__overlay" aria-hidden="true">
        <span class="gallery-item__caption">${Utils.escapeHtml(g.caption)}</span>
        <span class="gallery-item__date">${Utils.fmtDateShort(g.date)}</span>
      </div>
    </button>`;

  // ── PORTFOLIO ──────────────────────────────────────────────────────────────────

  const renderPortfolio = async () => {
    main().innerHTML =
      pageHero('Investment & Growth', 'Our Portfolio',
        'A diversified investment strategy focused on sustainable, low-risk capital growth for all members.') + `
      ${section('portfolio-overview', `
        ${sectionHead('Where We Invest', 'Portfolio Overview', 'Our portfolio is diversified across three primary asset classes to balance growth and security.')}
        <div class="cards-grid cards-grid--3">
          ${[
            { icon:'🏦', title:'Fixed Deposits',      desc:'Government-backed and A-rated commercial bank FDs forming the stable core of our portfolio. Minimum 8% annual return.', pct:'45%' },
            { icon:'📈', title:'Capital Market',       desc:'Selective positions in fundamentally strong DSE-listed equities and mutual funds, managed with a long-term horizon.',  pct:'30%' },
            { icon:'📋', title:'Islamic Instruments',  desc:'Sukuk bonds and Sharia-compliant savings tools aligned with member preferences for ethical investing.',                pct:'25%' },
          ].map((p) => `
            <div class="feature-card">
              <div class="feature-card__icon" aria-hidden="true">${p.icon}</div>
              <h3 class="feature-card__title">${p.title}</h3>
              <p class="feature-card__desc">${p.desc}</p>
              <div class="progress-bar" aria-label="${p.pct} of portfolio">
                <div class="progress-bar__fill" style="width:${p.pct}"></div>
              </div>
            </div>`).join('')}
        </div>
      `)}
      ${section('portfolio-principles', `
        ${sectionHead('Our Approach', 'Investment Principles')}
        <div class="two-col">
          <div>
            <h3>Democratic Decision Making</h3>
            <p>Every investment decision above BDT 1,00,000 requires a two-thirds majority vote in a General Body Meeting. No individual — including any committee member — may commit funds unilaterally.</p>
            <h3>Monthly Review</h3>
            <p>The Treasurer presents a portfolio performance report at every monthly meeting. All members receive copies, and the annual report is published publicly in the Financial Transparency section.</p>
          </div>
          <div>
            <h3>Capital Preservation First</h3>
            <p>Our primary mandate is preservation of member capital. Growth instruments are limited to 35% of the portfolio. Any instrument carrying capital loss risk above 15% requires unanimous approval.</p>
            <h3>Exit Policy</h3>
            <p>Members wishing to exit receive their proportional share calculated at the end of the preceding quarter, paid within 90 days of formal notice, subject to the membership agreement.</p>
          </div>
        </div>
      `, 'section--light')}`;
  };

  // ── FINANCIALS ─────────────────────────────────────────────────────────────────

  const renderFinancials = async () => {
    main().innerHTML =
      pageHero('Investment & Growth', 'Financial Transparency',
        'Audited accounts, contribution records, and performance reports — open to all members.') + `
      ${section('fin-stats', `
        <div class="stats-row">
          ${[
            { label:'Total Capital (2025)', value:'৳ 84,00,000+', note:'Audited FY2025' },
            { label:'Annual Return (2025)', value:'11.4%',         note:'Net of expenses' },
            { label:'Members on Time',      value:'96%',           note:'Last 12 months' },
            { label:'Expense Ratio',        value:'2.1%',          note:'Of total corpus' },
          ].map((s) => `
            <div class="stat-block">
              <span class="stat-block__val">${s.value}</span>
              <span class="stat-block__label">${s.label}</span>
              <span class="stat-block__note">${s.note}</span>
            </div>`).join('')}
        </div>
      `)}
      ${section('fin-reports', `
        ${sectionHead('Documents', 'Annual Reports & Statements')}
        <p class="footnote">Official PDFs published by the Admin appear on the Notice Board with a 📎 download link when available.</p>
        <div id="fin-notices-list" aria-live="polite" aria-busy="true">${Utils.skeleton(3,'table')}</div>
      `, 'section--light')}`;

    try {
      const { data } = await API.getNotices(1);
      const finance = data.filter((n) => n.category === 'Finance');
      const el = document.getElementById('fin-notices-list');
      el.innerHTML = finance.length
        ? `<div class="doc-list">${finance.map((n) => `
            <div class="doc-row">
              <div class="doc-row__icon" aria-hidden="true">📄</div>
              <div class="doc-row__info">
                <strong>${Utils.escapeHtml(n.title)}</strong>
                <span>${Utils.fmtDateShort(n.createdAt)}</span>
              </div>
              ${n.attachmentBase64
                ? `<a href="${n.attachmentBase64}" download="${Utils.escapeHtml(n.attachmentName||'document')}" class="btn btn--outline btn--sm">Download</a>`
                : `<span class="text-muted">No attachment</span>`}
            </div>`).join('')}</div>`
        : `<p class="empty-state">No finance documents published yet.</p>`;
    } catch(err) {
      document.getElementById('fin-notices-list').innerHTML = `<p class="error-state">${err.message}</p>`;
    }
  };

  // ── FAQ ────────────────────────────────────────────────────────────────────────

  const renderFAQ = async () => {
    const faqs = [
      { q:'What is Dream Development DD?', a:`${CONFIG.ORG_NAME} is a democratic investment organisation founded in 2020 by professionals in Dhaka. Every member holds an equal vote, equal rights, and an equal stake in the organisation's capital and growth.` },
      { q:'How do I become a member?', a:'Submit the Apply for Membership form with your personal documents, NID, photo, signature, and nominee details, plus two existing-member references. The Admin reviews and presents qualifying applications at a General Body Meeting for a two-thirds majority vote.' },
      { q:'How do I get my Member ID?', a:'Once your application is approved, the Admin generates your unique Member ID (e.g. DD-007) and assigns it to your profile. Your default login password is the same as your Member ID; we recommend updating it after first login.' },
      { q:'How do I log in to the Member Portal?', a:'Use the "Member Login" tab on the login page. Enter your Member ID (not your email) and password to access your dashboard.' },
      { q:'What is the monthly contribution?', a:'The standard monthly contribution is BDT 5,000, due by the 25th of each month. A one-time admission fee also applies to new members.' },
      { q:'Can I edit my profile information myself?', a:'No. To protect data integrity, only the Admin can edit member records (name, address, NID, nominee details, etc.). If any of your information needs to change, please contact the Admin directly via email or WhatsApp.' },
      { q:'How do I update my nominee?', a:'Log in to the Member Portal and submit a Nominee Change Request from your dashboard. The Admin reviews and approves the change — it does not take effect until approved.' },
      { q:'What are the two leadership bodies?', a:'The Board of Founders (BoF) consists of the original founding members who guide the organisation\'s long-term vision. The Executive Committee is the operational leadership body, elected for two-year terms to manage day-to-day governance.' },
      { q:'How is the Executive Committee elected?', a:'The committee is elected by a simple majority vote of all active members every two years. The current term (2026–2028) began April 23, 2026.' },
      { q:'Is my financial and personal data secure?', a:'Yes. Member data — including NID, photos, and nominee information — is protected and accessible only to you and the Admin through role-based access controls.' },
    ];

    main().innerHTML =
      pageHero('Membership Hub', 'Frequently Asked Questions',
        'Answers to the most common questions about membership, contributions, and governance.') + `
      ${section('faq-list', `
        <div class="accordion" id="faq-accordion">
          ${faqs.map((f,i) => `
            <div class="accordion__item">
              <button class="accordion__trigger" aria-expanded="false" aria-controls="faq-ans-${i}" id="faq-q-${i}">
                <span>${Utils.escapeHtml(f.q)}</span>
                <svg class="accordion__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
              </button>
              <div class="accordion__panel" id="faq-ans-${i}" role="region" aria-labelledby="faq-q-${i}" hidden>
                <p>${Utils.escapeHtml(f.a)}</p>
              </div>
            </div>`).join('')}
        </div>
      `, 'section--light')}`;

    document.querySelectorAll('.accordion__trigger').forEach((btn) => {
      btn.addEventListener('click', () => {
        const expanded = btn.getAttribute('aria-expanded')==='true';
        document.querySelectorAll('.accordion__trigger').forEach((b) => {
          b.setAttribute('aria-expanded','false');
          document.getElementById(b.getAttribute('aria-controls')).hidden = true;
          b.closest('.accordion__item').classList.remove('accordion__item--open');
        });
        if (!expanded) {
          btn.setAttribute('aria-expanded','true');
          document.getElementById(btn.getAttribute('aria-controls')).hidden = false;
          btn.closest('.accordion__item').classList.add('accordion__item--open');
        }
      });
    });
  };

  // ── APPLY FOR MEMBERSHIP (public application form) ────────────────────────────

  const renderApply = () => {
    main().innerHTML =
      pageHero('Membership Hub', 'Apply for Membership',
        'Complete the form below to apply. Your application is reviewed by the Admin and presented to the General Body for a vote.') + `
      ${section('apply-form-section', `
        <form id="apply-form" class="application-form" novalidate>

          <!-- Personal Information -->
          <fieldset class="form-fieldset">
            <legend>👤 Personal Information</legend>
            <div class="form-grid">
              <div class="form-group">
                <label for="ap-name">Full Name <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-name" name="name" class="input" required placeholder="As per NID">
                <span class="field-err" id="ap-name-err" role="alert"></span>
              </div>
              <div class="form-group">
                <label for="ap-dob">Date of Birth <span aria-hidden="true">*</span></label>
                <input type="date" id="ap-dob" name="dob" class="input" required>
                <span class="field-err" id="ap-dob-err" role="alert"></span>
              </div>
              <div class="form-group">
                <label for="ap-father">Father's Name <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-father" name="fatherName" class="input" required>
                <span class="field-err" id="ap-father-err" role="alert"></span>
              </div>
              <div class="form-group">
                <label for="ap-mother">Mother's Name <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-mother" name="motherName" class="input" required>
                <span class="field-err" id="ap-mother-err" role="alert"></span>
              </div>
              <div class="form-group">
                <label for="ap-nid">NID Number <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-nid" name="nidNumber" class="input" required placeholder="10/13/17-digit number">
                <span class="field-err" id="ap-nid-err" role="alert"></span>
              </div>
              <div class="form-group">
                <label for="ap-occupation">Occupation <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-occupation" name="occupation" class="input" required>
                <span class="field-err" id="ap-occupation-err" role="alert"></span>
              </div>
              <div class="form-group">
                <label for="ap-phone">Phone Number <span aria-hidden="true">*</span></label>
                <input type="tel" id="ap-phone" name="phone" class="input" required placeholder="+8801XXXXXXXXX">
                <span class="field-err" id="ap-phone-err" role="alert"></span>
              </div>
              <div class="form-group">
                <label for="ap-email">Email Address <span aria-hidden="true">*</span></label>
                <input type="email" id="ap-email" name="email" class="input" required>
                <span class="field-err" id="ap-email-err" role="alert"></span>
              </div>
            </div>
          </fieldset>

          <!-- Present Address -->
          <fieldset class="form-fieldset">
            <legend>🏠 Present Address</legend>
            <div class="form-grid">
              <div class="form-group">
                <label for="ap-pa-house">House / Road <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-pa-house" name="pa_house" class="input" required>
              </div>
              <div class="form-group">
                <label for="ap-pa-area">Area <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-pa-area" name="pa_area" class="input" required>
              </div>
              <div class="form-group">
                <label for="ap-pa-city">City <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-pa-city" name="pa_city" class="input" required value="Dhaka">
              </div>
              <div class="form-group">
                <label for="ap-pa-post">Post Code <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-pa-post" name="pa_postCode" class="input" required>
              </div>
            </div>
          </fieldset>

          <!-- Permanent Address -->
          <fieldset class="form-fieldset">
            <legend>🏡 Permanent Address</legend>
            <div class="form-grid">
              <div class="form-group">
                <label for="ap-pm-village">Village / Ward <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-pm-village" name="pm_village" class="input" required>
              </div>
              <div class="form-group">
                <label for="ap-pm-upazila">Upazila / Thana <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-pm-upazila" name="pm_upazila" class="input" required>
              </div>
              <div class="form-group">
                <label for="ap-pm-district">District <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-pm-district" name="pm_district" class="input" required>
              </div>
              <div class="form-group">
                <label for="ap-pm-post">Post Code <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-pm-post" name="pm_postCode" class="input" required>
              </div>
            </div>
          </fieldset>

          <!-- Document Uploads -->
          <fieldset class="form-fieldset">
            <legend>📎 Document Uploads</legend>
            <div class="upload-grid">
              ${Utils.fileZoneHtml({ id:'ap-photo-zone',     name:'photo',          label:'Your Photo',      kind:'image', accept:'image/*' })}
              ${Utils.fileZoneHtml({ id:'ap-nid-zone',       name:'nidPhoto',       label:'NID Copy',        kind:'doc',   accept:'image/*,application/pdf' })}
              ${Utils.fileZoneHtml({ id:'ap-signature-zone', name:'signaturePhoto', label:'Your Signature',  kind:'image', accept:'image/*' })}
            </div>
          </fieldset>

          <!-- Nominee Information -->
          <fieldset class="form-fieldset">
            <legend>🔁 Nominee Information</legend>
            <p class="fieldset-note">Your nominee receives your proportional investment share in case of incapacitation or death. See <a href="#/nominee-succession">Nominee &amp; Succession Policy</a>.</p>
            <div class="form-grid">
              <div class="form-group">
                <label for="ap-nom-name">Nominee Full Name <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-nom-name" name="nom_name" class="input" required>
              </div>
              <div class="form-group">
                <label for="ap-nom-rel">Relationship <span aria-hidden="true">*</span></label>
                <select id="ap-nom-rel" name="nom_relationship" class="input" required>
                  <option value="">Select relationship</option>
                  ${relationOptions.map((r)=>`<option value="${r}">${r}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label for="ap-nom-nid">Nominee NID Number <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-nom-nid" name="nom_nidNumber" class="input" required>
              </div>
              <div class="form-group">
                <label for="ap-nom-phone">Nominee Phone <span aria-hidden="true">*</span></label>
                <input type="tel" id="ap-nom-phone" name="nom_phone" class="input" required>
              </div>
            </div>
            <div class="upload-grid">
              ${Utils.fileZoneHtml({ id:'ap-nom-photo-zone', name:'nomPhoto',    label:"Nominee's Photo",     kind:'image', accept:'image/*' })}
              ${Utils.fileZoneHtml({ id:'ap-nom-nid-zone',   name:'nomNidPhoto', label:"Nominee's NID Copy",  kind:'doc',   accept:'image/*,application/pdf' })}
            </div>
          </fieldset>

          <!-- References -->
          <fieldset class="form-fieldset">
            <legend>🤝 Member References</legend>
            <p class="fieldset-note">Provide the Member IDs of two existing active members who can endorse your application.</p>
            <div class="form-grid">
              <div class="form-group">
                <label for="ap-ref1">Reference 1 — Member ID <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-ref1" name="ref1" class="input" required placeholder="e.g. DD-002">
              </div>
              <div class="form-group">
                <label for="ap-ref2">Reference 2 — Member ID <span aria-hidden="true">*</span></label>
                <input type="text" id="ap-ref2" name="ref2" class="input" required placeholder="e.g. DD-005">
              </div>
            </div>
          </fieldset>

          <!-- Declaration -->
          <fieldset class="form-fieldset">
            <legend>✅ Declaration</legend>
            <div class="form-group form-group--checkbox">
              <label>
                <input type="checkbox" id="ap-declare" name="declaration" required>
                I declare that the information provided above is true and accurate to the best of my knowledge,
                and I agree to abide by the Rules &amp; Regulations and Code of Conduct of ${CONFIG.ORG_NAME} if admitted.
              </label>
            </div>
            <span class="field-err" id="ap-declare-err" role="alert"></span>
          </fieldset>

          <div class="form-err-global" id="apply-global-err" role="alert" style="display:none"></div>
          <button type="submit" class="btn btn--primary btn--lg btn--full" id="apply-submit-btn">
            Submit Application
          </button>
        </form>
      `, 'section--light')}`;

    // Init file upload zones
    ['ap-photo-zone','ap-signature-zone','ap-nom-photo-zone'].forEach((id)=>Utils.initFileZone(id,'image'));
    ['ap-nid-zone','ap-nom-nid-zone'].forEach((id)=>Utils.initFileZone(id,'doc'));

    document.getElementById('apply-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      Utils.clearErrors(form);
      const g = document.getElementById('apply-global-err'); g.style.display='none';

      const raw = Utils.formData(form);
      let valid = true;
      const req = ['name','dob','fatherName','motherName','nidNumber','occupation','phone','email',
                   'pa_house','pa_area','pa_city','pa_postCode','pm_village','pm_upazila','pm_district','pm_postCode',
                   'nom_name','nom_relationship','nom_nidNumber','nom_phone','ref1','ref2'];
      for (const key of req) {
        if (!raw[key] || !String(raw[key]).trim()) {
          const inputId = 'ap-' + key.replace('pa_','pa-').replace('pm_','pm-').replace('nom_','nom-').replace('_','-');
          // best-effort error flagging; not all keys map 1:1 to an *-err element
          valid = false;
        }
      }
      if (!raw.name?.trim())        { Utils.fieldErr('ap-name','Required.');        valid=false; }
      if (!raw.dob)                 { Utils.fieldErr('ap-dob','Required.');         valid=false; }
      if (!raw.fatherName?.trim())  { Utils.fieldErr('ap-father','Required.');       valid=false; }
      if (!raw.motherName?.trim())  { Utils.fieldErr('ap-mother','Required.');       valid=false; }
      if (!raw.nidNumber?.trim())   { Utils.fieldErr('ap-nid','Required.');          valid=false; }
      if (!raw.occupation?.trim())  { Utils.fieldErr('ap-occupation','Required.');   valid=false; }
      if (!raw.phone?.trim())       { Utils.fieldErr('ap-phone','Required.');        valid=false; }
      if (!raw.email?.trim())       { Utils.fieldErr('ap-email','Required.');        valid=false; }
      if (!raw.declaration)         { Utils.fieldErr('ap-declare','You must accept the declaration.'); valid=false; }

      const photoB64    = document.getElementById('ap-photo-zone')?.dataset.base64;
      const nidB64       = document.getElementById('ap-nid-zone')?.dataset.base64;
      const sigB64        = document.getElementById('ap-signature-zone')?.dataset.base64;
      const nomPhotoB64   = document.getElementById('ap-nom-photo-zone')?.dataset.base64;
      const nomNidB64     = document.getElementById('ap-nom-nid-zone')?.dataset.base64;

      if (!photoB64) { Utils.toast('Please upload your photo.','error'); valid=false; }
      if (!nidB64)   { Utils.toast('Please upload your NID copy.','error'); valid=false; }

      if (!valid) { g.textContent='Please fix the highlighted fields above.'; g.style.display='block'; return; }

      const btn = document.getElementById('apply-submit-btn');
      Utils.setSubmitting(btn, true);
      try {
        await API.submitApplication({
          name: raw.name, fatherName: raw.fatherName, motherName: raw.motherName,
          dob: raw.dob, nidNumber: raw.nidNumber, occupation: raw.occupation,
          phone: raw.phone, email: raw.email,
          presentAddress  : { house:raw.pa_house, area:raw.pa_area, city:raw.pa_city, postCode:raw.pa_postCode },
          permanentAddress: { village:raw.pm_village, upazila:raw.pm_upazila, district:raw.pm_district, postCode:raw.pm_postCode },
          photo: photoB64, nidPhoto: nidB64, signaturePhoto: sigB64 || null,
          nominee: {
            name: raw.nom_name, relationship: raw.nom_relationship, nidNumber: raw.nom_nidNumber,
            phone: raw.nom_phone, photo: nomPhotoB64 || null, nidPhoto: nomNidB64 || null,
          },
          references : [raw.ref1, raw.ref2],
          declaration: true,
        });
        Utils.toast('Application submitted successfully! The Admin will review it shortly.','success', 6000);
        form.reset();
        Router.navigate('#/');
      } catch(err) {
        g.textContent = err.message; g.style.display='block';
      } finally {
        Utils.setSubmitting(btn, false);
      }
    });
  };

  // ── NEW MEMBER REQUIREMENTS ────────────────────────────────────────────────────

  const renderNewMember = () => {
    main().innerHTML =
      pageHero('Membership Hub', 'New Member Requirements',
        'Everything you need to know before applying to join Dream Development DD.') + `
      ${section('new-member-req', `
        ${sectionHead('Before You Apply', 'Eligibility & Requirements')}
        <div class="two-col">
          <div>
            <h3>Basic Eligibility</h3>
            <ul class="check-list">
              <li>Bangladeshi national, aged 18 or above</li>
              <li>Valid National Identity Card (NID)</li>
              <li>Stable, verifiable source of income</li>
              <li>Endorsed by at least 2 existing active members</li>
              <li>No active criminal or financial fraud record</li>
            </ul>
          </div>
          <div>
            <h3>Documents You Will Need</h3>
            <ul class="check-list">
              <li>Your photo (passport-style, JPG/PNG)</li>
              <li>Your NID copy (scan or photo)</li>
              <li>Your signature (signed on plain paper, photographed)</li>
              <li>Nominee's full name, NID, and photo</li>
              <li>Two existing member IDs as references</li>
            </ul>
          </div>
        </div>
      `)}
      ${section('new-member-process', `
        ${sectionHead('How It Works', 'Application Process')}
        <div class="steps-list">
          ${[
            { n:'01', t:'Submit Online Application', d:'Complete the Apply for Membership form with your personal information and required document uploads.' },
            { n:'02', t:'Admin Review',                d:'The Admin reviews your application and verifies your documents and references within 14 days.' },
            { n:'03', t:'Committee & GBM Vote',         d:'Qualifying applications are presented at the next General Body Meeting for a two-thirds majority vote.' },
            { n:'04', t:'Approval & Member ID Issued',  d:'Once approved, the Admin assigns you a unique Member ID and your profile is created in the system.' },
            { n:'05', t:'Admission Fee & Onboarding',   d:'Pay the admission fee, sign the Membership Agreement, and log in to the Member Portal with your new ID.' },
          ].map((s) => `
            <div class="step-item">
              <div class="step-item__num" aria-hidden="true">${s.n}</div>
              <div class="step-item__body"><h4>${s.t}</h4><p>${s.d}</p></div>
            </div>`).join('')}
        </div>
        <div class="cta-inline">
          <a href="#/apply" class="btn btn--primary btn--lg">Start Application</a>
          <a href="mailto:${CONFIG.CONTACT_EMAIL}" class="btn btn--outline btn--lg">Contact the Admin</a>
        </div>
      `, 'section--light')}`;
  };

  // ── BENEFITS ───────────────────────────────────────────────────────────────────

  const renderBenefits = () => {
    main().innerHTML =
      pageHero('Membership Hub', 'Membership Benefits',
        'More than investment returns — membership offers a network, a voice, and a community.') + `
      ${section('benefits-grid', `
        ${sectionHead('What You Gain', 'Member Benefits')}
        <div class="cards-grid cards-grid--3">
          ${[
            { icon:'💰', t:'Proportional Returns',     d:'Earn your equal share of the annual surplus from the collective investment portfolio, distributed transparently.' },
            { icon:'🗳️', t:'Equal Voting Rights',     d:'Every member holds exactly one vote — regardless of tenure — on all major financial and governance decisions.' },
            { icon:'🛡️', t:'Emergency Fund Access',   d:'Members in genuine financial distress may apply for an interest-free emergency loan from the collective fund.' },
            { icon:'📚', t:'Financial Literacy',      d:'Regular workshops and seminars on personal finance, investment strategy, and wealth management.' },
            { icon:'🤝', t:'Professional Network',    d:'Access to a trusted network of motivated professionals across various industries in Dhaka.' },
            { icon:'🌍', t:'CSR Participation',       d:'Contribute to and participate in our community service initiatives, from Iftar programmes to school supply drives.' },
            { icon:'📋', t:'Transparent Governance',  d:'Attend and vote at General Body Meetings. Review full audited accounts. Every decision is documented.' },
            { icon:'🔁', t:'Nominee Protection',       d:'Designate a nominee who receives your investment share in the event of incapacitation, with a formal succession framework.' },
            { icon:'📈', t:'Collective Bargaining',   d:'Access investment instruments only available to institutional investors when acting as a group.' },
          ].map((b) => `
            <div class="feature-card">
              <div class="feature-card__icon" aria-hidden="true">${b.icon}</div>
              <h3 class="feature-card__title">${b.t}</h3>
              <p class="feature-card__desc">${b.d}</p>
            </div>`).join('')}
        </div>
      `)}`;
  };

  // ── NOMINEE & SUCCESSION ────────────────────────────────────────────────────────

  const renderNomineeSucession = () => {
    const loggedIn = Auth.isLoggedIn() && Auth.can('submit:nomineeRequest');
    main().innerHTML =
      pageHero('Membership Hub', 'Nominee & Succession Policy',
        'A clear framework ensures your investment legacy is protected and passed on according to your wishes.') + `
      ${section('nominee-policy', `
        ${sectionHead('The Policy', 'Understanding Nominee Rights')}
        <div class="two-col">
          <div>
            <h3>Role of a Nominee</h3>
            <p>Each member designates one nominee — a trusted individual — who receives the member's proportional share of the collective investment in the event of death, permanent incapacitation, or voluntary exit without successorship.</p>
            <p>A nominee does not automatically become a member. They receive only the financial entitlement and must apply separately if they wish to join.</p>
          </div>
          <div>
            <h3>Changing Your Nominee</h3>
            <p>Submit a Nominee Change Request through the Member Portal. Only the Admin can approve and apply the change to your official record — pending requests do not affect the current nominee.</p>
            <h3>Required Documentation</h3>
            <ul class="check-list">
              <li>NID copy of the new nominee</li>
              <li>Relationship declaration</li>
              <li>Stated reason for the change</li>
            </ul>
          </div>
        </div>
      `)}
      ${section('nominee-request', `
        ${sectionHead('Member Action', 'Submit a Nominee Change Request')}
        ${loggedIn
          ? `<div class="form-card" id="nominee-form-wrap">
               <p class="form-card__note">Your current nominee is on record in your dashboard. Submit this form to request a change — the Admin will review and confirm.</p>
               <form id="nominee-form" novalidate>
                 <div class="form-group">
                   <label for="nn-new">Requested New Nominee Name <span aria-hidden="true">*</span></label>
                   <input type="text" id="nn-new" name="requestedNominee" class="input" required>
                   <span class="field-err" id="nn-new-err" role="alert"></span>
                 </div>
                 <div class="form-group">
                   <label for="nn-reason">Reason for Change <span aria-hidden="true">*</span></label>
                   <textarea id="nn-reason" name="reason" class="input input--textarea" rows="3" required></textarea>
                   <span class="field-err" id="nn-reason-err" role="alert"></span>
                 </div>
                 <button type="submit" class="btn btn--primary" id="nominee-submit-btn">Submit Request</button>
               </form>
             </div>`
          : `<div class="auth-prompt">
               <p>You must be logged in as a member to submit a nominee change request.</p>
               <a href="#/login" class="btn btn--primary">Log In to Member Portal</a>
             </div>`}
      `, 'section--light')}`;

    if (loggedIn) {
      document.getElementById('nominee-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target; Utils.clearErrors(form);
        const data = Utils.formData(form);
        let valid = true;
        if (!data.requestedNominee?.trim()) { Utils.fieldErr('nn-new','Required.');   valid=false; }
        if (!data.reason?.trim())           { Utils.fieldErr('nn-reason','Required.'); valid=false; }
        if (!valid) return;
        const btn = document.getElementById('nominee-submit-btn');
        Utils.setSubmitting(btn, true);
        try {
          const user = Auth.getUser();
          await API.submitNomineeRequest({
            memberId: user.id, memberName: user.name,
            currentNominee: user.nominee?.name || '—',
            requestedNominee: data.requestedNominee, reason: data.reason,
          });
          Utils.toast('Nominee change request submitted.','success');
          form.reset();
        } catch(err) { Utils.toast(err.message,'error'); }
        finally { Utils.setSubmitting(btn, false); }
      });
    }
  };

  // ── LOGIN (Admin tab + Member tab) ──────────────────────────────────────────────

  const renderLogin = () => {
    main().innerHTML = `
      <div class="auth-page">
        <div class="auth-card auth-card--wide">
          <div class="auth-card__brand" aria-hidden="true">
            <div class="nav-brand__logo nav-brand__logo--lg"><span>D</span><span>D</span></div>
          </div>
          <h1 class="auth-card__title">${CONFIG.ORG_NAME} Portal</h1>
          <p class="auth-card__sub">Sign in to access your dashboard.</p>

          <div class="auth-tabs" role="tablist">
            <button class="auth-tab auth-tab--active" id="tab-member" role="tab" aria-selected="true">Member Login</button>
            <button class="auth-tab" id="tab-admin" role="tab" aria-selected="false">Admin Login</button>
          </div>

          <!-- Member Login Form -->
          <form id="member-login-form" class="auth-form" novalidate>
            <div class="form-group">
              <label for="ml-id">Member ID</label>
              <input type="text" id="ml-id" name="memberId" class="input" required
                     autocomplete="username" placeholder="e.g. DD-002" style="text-transform:uppercase">
              <span class="field-err" id="ml-id-err" role="alert"></span>
            </div>
            <div class="form-group">
              <label for="ml-pass">Password</label>
              <div class="input-wrap">
                <input type="password" id="ml-pass" name="password" class="input" required
                       autocomplete="current-password" placeholder="Default: your Member ID">
                <button type="button" class="input-eye" id="toggle-ml-pass" aria-label="Show password">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
              <span class="field-err" id="ml-pass-err" role="alert"></span>
            </div>
            <div class="form-err-global" id="ml-global-err" role="alert" style="display:none"></div>
            <button type="submit" class="btn btn--primary btn--full btn--lg" id="ml-btn">Sign In</button>
          </form>

          <!-- Admin Login Form -->
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
                <button type="button" class="input-eye" id="toggle-al-pass" aria-label="Show password">
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
                <tr><td>Admin</td><td>admin@dd.org</td><td>Admin@DD2026</td></tr>
                <tr><td>Member</td><td>DD-002</td><td>DD-002</td></tr>
                <tr><td>Member</td><td>DD-003</td><td>DD-003</td></tr>
              </tbody>
            </table>
          </details>

          <p class="auth-card__footer">Not a member yet? <a href="#/apply">Apply for membership →</a></p>
        </div>
      </div>`;

    // Tabs
    const tabMember = document.getElementById('tab-member');
    const tabAdmin  = document.getElementById('tab-admin');
    const fMember   = document.getElementById('member-login-form');
    const fAdmin    = document.getElementById('admin-login-form');
    tabMember.addEventListener('click', () => {
      tabMember.classList.add('auth-tab--active'); tabMember.setAttribute('aria-selected','true');
      tabAdmin.classList.remove('auth-tab--active'); tabAdmin.setAttribute('aria-selected','false');
      fMember.hidden=false; fAdmin.hidden=true;
    });
    tabAdmin.addEventListener('click', () => {
      tabAdmin.classList.add('auth-tab--active'); tabAdmin.setAttribute('aria-selected','true');
      tabMember.classList.remove('auth-tab--active'); tabMember.setAttribute('aria-selected','false');
      fAdmin.hidden=false; fMember.hidden=true;
    });

    // Password toggles
    document.getElementById('toggle-ml-pass')?.addEventListener('click', () => {
      const i=document.getElementById('ml-pass'); i.type = i.type==='password'?'text':'password';
    });
    document.getElementById('toggle-al-pass')?.addEventListener('click', () => {
      const i=document.getElementById('al-pass'); i.type = i.type==='password'?'text':'password';
    });

    // Member login submit
    fMember.addEventListener('submit', async (e) => {
      e.preventDefault();
      Utils.clearErrors(fMember);
      const g = document.getElementById('ml-global-err'); g.style.display='none';
      const { memberId, password } = Utils.formData(fMember);
      let valid = true;
      if (!memberId?.trim())  { Utils.fieldErr('ml-id','Member ID is required.'); valid=false; }
      if (!password?.trim())  { Utils.fieldErr('ml-pass','Password is required.'); valid=false; }
      if (!valid) return;
      const btn = document.getElementById('ml-btn');
      Utils.setSubmitting(btn, true);
      try {
        const member = await Auth.loginMember(memberId.trim().toUpperCase(), password);
        Utils.toast(`Welcome back, ${member.name.split(' ')[0]}!`,'success');
        Components.Navbar.updateAuthState();
        Router.navigate(Auth.portalRoute());
      } catch(err) { g.textContent=err.message; g.style.display='block'; }
      finally { Utils.setSubmitting(btn, false); }
    });

    // Admin login submit
    fAdmin.addEventListener('submit', async (e) => {
      e.preventDefault();
      Utils.clearErrors(fAdmin);
      const g = document.getElementById('al-global-err'); g.style.display='none';
      const { email, password } = Utils.formData(fAdmin);
      let valid = true;
      if (!email?.trim())    { Utils.fieldErr('al-email','Email is required.'); valid=false; }
      if (!password?.trim()) { Utils.fieldErr('al-pass','Password is required.'); valid=false; }
      if (!valid) return;
      const btn = document.getElementById('al-btn');
      Utils.setSubmitting(btn, true);
      try {
        const user = await Auth.loginAdmin(email.trim(), password);
        Utils.toast(`Welcome back, ${user.name.split(' ')[0]}!`,'success');
        Components.Navbar.updateAuthState();
        Router.navigate(Auth.portalRoute());
      } catch(err) { g.textContent=err.message; g.style.display='block'; }
      finally { Utils.setSubmitting(btn, false); }
    });
  };

  // ── BOARD OF FOUNDERS (public display) ──────────────────────────────────────────

  const renderFounders = async () => {
    main().innerHTML =
      pageHero('Our Leadership', 'Board of Founders',
        'The visionaries who established Dream Development DD and continue to guide its long-term direction.') + `
      ${section('founders-grid', `
        ${sectionHead('Founding Body', 'Board of Founders (BoF)', `Founded ${CONFIG.ORG_FOUNDED} — a permanent advisory body of the organisation's original architects.`)}
        <div id="founders-list" aria-live="polite" aria-busy="true">${Utils.skeleton(4)}</div>
      `)}`;

    try {
      const founders = await API.getBoardOfFounders();
      document.getElementById('founders-list').innerHTML = `
        <div class="committee-grid">
          ${founders.map((m) => `
            <article class="committee-card committee-card--founder">
              <div class="committee-card__photo-wrap">
                <img src="${m.photo}" alt="${Utils.escapeHtml(m.name)}" class="committee-card__photo" width="120" height="120" loading="lazy">
                <span class="founder-ribbon" aria-hidden="true">🏆 Founder</span>
              </div>
              <div class="committee-card__body">
                <h3 class="committee-card__name">${Utils.escapeHtml(m.name)}</h3>
                <p class="committee-card__role">${Utils.escapeHtml(m.position)}</p>
                <p class="committee-card__term">Since ${Utils.fmtDate(m.termStart, {year:'numeric',month:'short'})}</p>
                <blockquote class="committee-card__quote">"${Utils.escapeHtml(m.message)}"</blockquote>
              </div>
            </article>`).join('')}
        </div>`;
    } catch(err) { document.getElementById('founders-list').innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  // ── EXECUTIVE COMMITTEE (public display) ────────────────────────────────────────

  const renderCommittee = async () => {
    main().innerHTML =
      pageHero('Our Leadership', 'Executive Committee',
        `The operational leadership body elected for the current term: ${CONFIG.TERM_LABEL}.`) + `
      ${section('committee-grid-section', `
        ${sectionHead(CONFIG.TERM_LABEL, 'Executive Committee', `Inaugurated ${Utils.fmtDate(CONFIG.TERM_START)} — serving a two-year democratic mandate.`)}
        <div id="ec-list" aria-live="polite" aria-busy="true">${Utils.skeleton(6)}</div>
      `)}`;

    try {
      const members = await API.getExecutiveCommittee();
      document.getElementById('ec-list').innerHTML = `
        <div class="committee-grid">
          ${members.map((m) => `
            <article class="committee-card">
              <div class="committee-card__photo-wrap">
                <img src="${m.photo}" alt="${Utils.escapeHtml(m.name)}" class="committee-card__photo" width="120" height="120" loading="lazy">
              </div>
              <div class="committee-card__body">
                <h3 class="committee-card__name">${Utils.escapeHtml(m.name)}</h3>
                <p class="committee-card__role">${Utils.escapeHtml(m.position)}</p>
                <p class="committee-card__term">${Utils.fmtDateShort(m.termStart)} – ${m.termEnd ? Utils.fmtDateShort(m.termEnd) : 'Present'}</p>
                <blockquote class="committee-card__quote">"${Utils.escapeHtml(m.message)}"</blockquote>
              </div>
            </article>`).join('')}
        </div>`;
    } catch(err) { document.getElementById('ec-list').innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  // ── MEMBERS DIRECTORY (public — limited fields for privacy) ───────────────────

  const renderMembersPage = async () => {
    main().innerHTML =
      pageHero('Our Leadership', 'Our Members',
        `${CONFIG.ORG_NAME} is built by ${CONFIG.ORG_MEMBERS} equal members — each a stakeholder, each a decision-maker.`) + `
      ${section('members-section', `
        ${sectionHead('The Collective', 'Active Membership')}
        <div id="members-list" aria-live="polite" aria-busy="true">${Utils.skeleton(8)}</div>
      `)}`;

    try {
      const members = await API.getMembers();
      document.getElementById('members-list').innerHTML = `
        <div class="members-grid">
          ${members.filter((m)=>m.status==='active').map((m) => `
            <div class="member-card">
              <img src="${m.photo}" alt="${Utils.escapeHtml(m.name)}" class="member-card__photo" width="56" height="56" loading="lazy">
              <div class="member-card__info">
                <h3 class="member-card__name">${Utils.escapeHtml(m.name)}</h3>
                <p class="member-card__id">${m.memberId}</p>
                <p class="member-card__joined">Member since ${Utils.fmtDate(m.joinDate,{year:'numeric',month:'short'})}</p>
              </div>
            </div>`).join('')}
        </div>`;
    } catch(err) { document.getElementById('members-list').innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  // ── COMMUNITY STANDARDS ─────────────────────────────────────────────────────────

  const renderValues = () => {
    main().innerHTML =
      pageHero('Community Standards', 'Core Values & Ethics',
        'The principles that guide every decision, every vote, and every interaction within Dream Development DD.') + `
      ${section('values-grid', `
        <div class="cards-grid cards-grid--3">
          ${[
            { icon:'🔍', t:'Transparency', d:'All financial records are open to every member. No decision is made behind closed doors.' },
            { icon:'⚖️', t:'Equality',     d:'One member, one vote — always. Tenure and contribution amount have no bearing on voting weight.' },
            { icon:'🤝', t:'Trust',        d:'Membership is built on personal relationships and accountability. We vouch for each other.' },
            { icon:'🌱', t:'Growth',       d:'We prioritise collective, sustainable growth over short-term individual gains.' },
            { icon:'❤️', t:'Community',    d:'Our CSR commitments are not optional extras — they are part of who we are.' },
            { icon:'🛡️', t:'Integrity',    d:'Zero tolerance for financial misconduct or breach of confidentiality.' },
          ].map((v) => `
            <div class="value-card">
              <div class="value-card__icon" aria-hidden="true">${v.icon}</div>
              <h3 class="value-card__title">${v.t}</h3>
              <p class="value-card__desc">${v.d}</p>
            </div>`).join('')}
        </div>
      `)}`;
  };

  const renderConduct = () => {
    main().innerHTML =
      pageHero('Community Standards', 'Code of Conduct',
        'Expected behaviour standards for all members and committee representatives.') + `
      ${section('conduct-doc', `
        <div class="doc-page">
          <p class="doc-meta">Effective: April 23, 2026 · Approved at General Body Meeting · Next review: April 2028</p>
          ${[
            { h:'1. Respectful Communication', p:'All members are expected to engage with one another with courtesy and professionalism, in meetings and in all digital channels.' },
            { h:'2. Timely Contributions',     p:'Members commit to paying their monthly contribution by the 25th of each month. Persistent late payments may result in a formal notice.' },
            { h:'3. Confidentiality',          p:'Financial data, member documents (NID, photos, signatures), and internal deliberations are confidential and managed only by the Admin.' },
            { h:'4. Data Accuracy',            p:'Members must promptly inform the Admin of any change to their personal information. Members themselves cannot directly edit their own records — all changes are routed through the Admin to preserve a single source of truth.' },
            { h:'5. Active Participation',     p:'Members are expected to attend General Body Meetings regularly. Absence without notice for three consecutive meetings will be addressed by the Committee.' },
            { h:'6. Conflict of Interest',     p:'Any member with a personal financial interest in a proposed investment must declare it before the vote and may not vote on that matter.' },
            { h:'7. Disciplinary Process',     p:'Breaches of this Code are investigated by a sub-committee of three uninvolved members. Penalties range from a formal warning to expulsion, depending on severity.' },
          ].map((s)=>`<h3>${s.h}</h3><p>${s.p}</p>`).join('')}
        </div>
      `, 'section--light')}`;
  };

  const renderRules = () => {
    main().innerHTML =
      pageHero('Community Standards', 'Rules & Regulations',
        'The formal governance framework that structures Dream Development DD\'s operations.') + `
      ${section('rules-doc', `
        <div class="doc-page">
          <p class="doc-meta">Effective: June 1, 2020 · Last amended: April 2026</p>
          ${[
            { h:'Article 1 — Name & Nature',          p:`The organisation is formally known as "${CONFIG.ORG_NAME}". It is a voluntary, democratic, non-political investment and savings group.` },
            { h:'Article 2 — Membership',             p:'Membership requires endorsement by two existing members, a complete application with verified documents, and approval by a two-thirds majority vote. Each member is assigned a unique Member ID by the Admin upon approval.' },
            { h:'Article 3 — Contributions',          p:'Each member contributes BDT 5,000 per month, due by the 25th. A late fee applies after the 30th.' },
            { h:'Article 4 — Investment Decisions',   p:'Investments exceeding BDT 1,00,000 require a two-thirds majority vote at a General Body Meeting.' },
            { h:'Article 5 — Board of Founders (BoF)',p:'A permanent advisory body comprising the organisation\'s founding members. The Board provides strategic guidance but does not hold day-to-day operational authority.' },
            { h:'Article 6 — Executive Committee',    p:'The operational governing body consisting of President, Vice President, General Secretary, Treasurer, Joint Secretary, and Organising Secretary. Elected for a two-year term by simple majority vote.' },
            { h:'Article 7 — Record Management',      p:'Only the Admin (a designated system role) may create, edit, or delete member records, the Board of Founders roster, the Executive Committee roster, and Notice Board content. Members may view but not alter any official record.' },
            { h:'Article 8 — Meetings',                p:'General Body Meetings are held monthly. An Annual General Meeting is held each December.' },
            { h:'Article 9 — Exit & Dissolution',      p:'A member may exit with 90-day written notice. Full dissolution requires unanimous agreement of all active members.' },
          ].map((s)=>`<h3>${s.h}</h3><p>${s.p}</p>`).join('')}
        </div>
      `, 'section--light')}`;
  };

  const renderCSR = () => {
    main().innerHTML =
      pageHero('Community Standards', 'CSR & Social Impact',
        'Our commitment to the communities around us — because building wealth alone is not enough.') + `
      ${section('csr-initiatives', `
        ${sectionHead('Giving Back', 'Our Community Initiatives')}
        <div class="cards-grid cards-grid--2">
          ${[
            { icon:'🍽️', t:'Annual Iftar Programme', d:'Every Ramadan, we organise a community Iftar for underprivileged families. In 2026 we served over 200 families.', year:'Since 2021' },
            { icon:'📚', t:'School Supplies Drive',  d:'An annual collection and distribution of stationery and school bags for low-income students.',                   year:'Since 2022' },
            { icon:'🩺', t:'Health Awareness Camp',  d:'A free community health check-up camp partnering with local clinics.',                                            year:'Since 2023' },
            { icon:'🌳', t:'Tree Plantation',        d:'Each year on Founding Day, every member plants 5 trees as part of our environmental pledge.',                     year:'Since 2020' },
          ].map((c) => `
            <div class="feature-card feature-card--horizontal">
              <div class="feature-card__icon feature-card__icon--lg" aria-hidden="true">${c.icon}</div>
              <div>
                <div class="feature-card__meta">${c.year}</div>
                <h3 class="feature-card__title">${c.t}</h3>
                <p class="feature-card__desc">${c.d}</p>
              </div>
            </div>`).join('')}
        </div>
      `)}
      ${section('csr-commitment', `
        ${sectionHead('Our Pledge', 'The 2% Commitment')}
        <div class="highlight-block">
          <p class="highlight-block__stat">2%</p>
          <div>
            <h3>Of Annual Surplus Dedicated to Community</h3>
            <p>By formal resolution of the General Body, Dream Development DD sets aside a minimum of 2% of each year's net surplus for CSR activities — reviewed and reported at the Annual General Meeting.</p>
          </div>
        </div>
      `, 'section--light')}`;
  };

  // ── MEMBER DASHBOARD ───────────────────────────────────────────────────────────

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
          <nav class="db-nav" aria-label="Dashboard navigation">
            <button class="db-nav__item db-nav__item--active" data-tab="profile">👤 My Profile</button>
            <button class="db-nav__item" data-tab="invoices">📋 Contributions</button>
            <button class="db-nav__item" data-tab="nominee">🔁 Nominee Request</button>
          </nav>
        </div>
        <div class="dashboard__main">

          <div id="db-tab-profile" class="db-tab">
            <div class="db-section-head">
              <div>
                <h2>My Profile</h2>
                <p>This is your official record on file. Only the Admin can make changes.</p>
              </div>
            </div>
            <div class="readonly-banner">
              🔒 You cannot edit this information. To update any detail, please contact the Admin via
              <a href="mailto:${CONFIG.CONTACT_EMAIL}">${CONFIG.CONTACT_EMAIL}</a> or
              <a href="https://wa.me/${CONFIG.CONTACT_WHATSAPP.replace(/\D/g,'')}" target="_blank" rel="noopener">WhatsApp</a>.
            </div>

            <div class="profile-doc-grid">
              <div class="profile-doc-card">
                <img src="${user.photo||''}" alt="Profile photo" class="profile-doc-card__img">
                <span>Profile Photo</span>
              </div>
              <div class="profile-doc-card">
                ${user.nidPhoto ? `<img src="${user.nidPhoto}" alt="NID copy" class="profile-doc-card__img">` : `<div class="profile-doc-card__placeholder">📄</div>`}
                <span>NID Copy</span>
              </div>
              <div class="profile-doc-card">
                ${user.signaturePhoto ? `<img src="${user.signaturePhoto}" alt="Signature" class="profile-doc-card__img">` : `<div class="profile-doc-card__placeholder">✍️</div>`}
                <span>Signature</span>
              </div>
            </div>

            <h3 class="profile-section-title">Personal Information</h3>
            <dl class="profile-detail-grid">
              ${[
                ['Full Name', user.name], ['Member ID', user.memberId],
                ["Father's Name", user.fatherName||'—'], ["Mother's Name", user.motherName||'—'],
                ['Date of Birth', user.dob ? Utils.fmtDate(user.dob) : '—'], ['NID Number', user.nidNumber||'—'],
                ['Occupation', user.occupation||'—'], ['Phone', user.phone],
                ['Email', user.email], ['Joined On', Utils.fmtDate(user.joinDate)],
                ['Status', Utils.badge(user.status)],
              ].map(([k,v])=>`<div class="profile-row"><dt>${k}</dt><dd>${typeof v==='string'?Utils.escapeHtml(v):v}</dd></div>`).join('')}
            </dl>

            <h3 class="profile-section-title">Present Address</h3>
            <p class="profile-address">${Utils.escapeHtml(fmtAddr(user.presentAddress,'present'))}</p>

            <h3 class="profile-section-title">Permanent Address</h3>
            <p class="profile-address">${Utils.escapeHtml(fmtAddr(user.permanentAddress,'permanent'))}</p>

            <h3 class="profile-section-title">Nominee Information</h3>
            <div class="nominee-detail-card">
              <div class="nominee-detail-card__photo">
                ${user.nominee?.photo ? `<img src="${user.nominee.photo}" alt="Nominee photo">` : `<div class="profile-doc-card__placeholder">👤</div>`}
              </div>
              <dl class="profile-detail-grid">
                <div class="profile-row"><dt>Name</dt><dd>${Utils.escapeHtml(user.nominee?.name||'—')}</dd></div>
                <div class="profile-row"><dt>Relationship</dt><dd>${Utils.escapeHtml(user.nominee?.relationship||'—')}</dd></div>
                <div class="profile-row"><dt>NID Number</dt><dd>${Utils.escapeHtml(user.nominee?.nidNumber||'—')}</dd></div>
                <div class="profile-row"><dt>Phone</dt><dd>${Utils.escapeHtml(user.nominee?.phone||'—')}</dd></div>
              </dl>
            </div>
          </div>

          <div id="db-tab-invoices" class="db-tab" hidden>
            <div class="db-section-head"><div><h2>Contribution History</h2><p>Your monthly contribution records and payment status.</p></div></div>
            <div id="invoices-table-wrap" aria-live="polite" aria-busy="true">${Utils.skeleton(5,'table')}</div>
            <div id="invoices-pagination" class="pagination-wrap mt-4"></div>
          </div>

          <div id="db-tab-nominee" class="db-tab" hidden>
            <div class="db-section-head"><div><h2>Nominee Change Request</h2><p>Submit a request to update your registered nominee. Admin approval required.</p></div></div>
            <div class="current-nominee-banner">
              <span>Current Nominee on Record:</span>
              <strong>${Utils.escapeHtml(user.nominee?.name || 'Not set')}</strong>
            </div>
            <form id="db-nominee-form" class="form-card" novalidate>
              <div class="form-group">
                <label for="dbn-new">New Nominee Full Name <span aria-hidden="true">*</span></label>
                <input type="text" id="dbn-new" name="requestedNominee" class="input" required>
                <span class="field-err" id="dbn-new-err" role="alert"></span>
              </div>
              <div class="form-group">
                <label for="dbn-reason">Reason for Change <span aria-hidden="true">*</span></label>
                <textarea id="dbn-reason" name="reason" class="input input--textarea" rows="3" required></textarea>
                <span class="field-err" id="dbn-reason-err" role="alert"></span>
              </div>
              <button type="submit" class="btn btn--primary" id="dbn-submit">Submit Request</button>
            </form>
          </div>

        </div>
      </div>`;

    document.querySelectorAll('.db-nav__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.db-nav__item').forEach((b)=>b.classList.remove('db-nav__item--active'));
        document.querySelectorAll('.db-tab').forEach((t)=>t.hidden=true);
        btn.classList.add('db-nav__item--active');
        document.getElementById(`db-tab-${btn.dataset.tab}`).hidden=false;
      });
    });

    await _loadInvoices(user.id, 1);

    document.getElementById('db-nominee-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form=e.target; Utils.clearErrors(form);
      const data = Utils.formData(form);
      let valid=true;
      if (!data.requestedNominee?.trim()) { Utils.fieldErr('dbn-new','Required.'); valid=false; }
      if (!data.reason?.trim())           { Utils.fieldErr('dbn-reason','Required.'); valid=false; }
      if (!valid) return;
      const btn=document.getElementById('dbn-submit');
      Utils.setSubmitting(btn,true);
      try {
        await API.submitNomineeRequest({
          memberId: user.id, memberName: user.name,
          currentNominee: user.nominee?.name || '—',
          requestedNominee: data.requestedNominee, reason: data.reason,
        });
        Utils.toast('Nominee change request submitted successfully!','success');
        form.reset();
      } catch(err) { Utils.toast(err.message,'error'); }
      finally { Utils.setSubmitting(btn,false); }
    });
  };

  const _loadInvoices = async (memberId, page) => {
    const wrap = document.getElementById('invoices-table-wrap'); if(!wrap) return;
    try {
      const { data, total, totalPages } = await API.getMemberInvoices(memberId, page);
      if (!data.length) { wrap.innerHTML='<p class="empty-state">No contribution records found.</p>'; return; }
      wrap.setAttribute('aria-busy','false');
      wrap.innerHTML = `
        <div class="table-wrap">
          <table class="data-table" aria-label="Contribution history">
            <thead><tr><th>Month</th><th>Amount</th><th>Status</th><th>Paid On</th></tr></thead>
            <tbody>
              ${data.map((inv)=>`
                <tr>
                  <td>${Utils.escapeHtml(inv.month)}</td>
                  <td class="font-mono">${Utils.fmtMoney(inv.amount)}</td>
                  <td>${Utils.badge(inv.status)}</td>
                  <td>${inv.paidAt ? Utils.fmtDateShort(inv.paidAt) : '—'}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="table-summary">${total} total records</p>`;
      Utils.renderPagination('invoices-pagination', page, totalPages, (p)=>_loadInvoices(memberId,p));
    } catch(err) { wrap.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  // ── ADMIN DASHBOARD ────────────────────────────────────────────────────────────

  const renderAdminDashboard = async () => {
    if (!Auth.require('admin')) return;

    main().innerHTML = `
      <div class="dashboard dashboard--admin">
        <div class="dashboard__sidebar">
          <div class="db-profile db-profile--admin">
            <div class="db-admin-badge" aria-hidden="true">⚙️</div>
            <h2>Admin Panel</h2>
            <p>${CONFIG.TERM_LABEL}</p>
          </div>
          <nav class="db-nav" aria-label="Admin panel navigation">
            <button class="db-nav__item db-nav__item--active" data-tab="applications">📥 Applications</button>
            <button class="db-nav__item" data-tab="members">👥 Members</button>
            <button class="db-nav__item" data-tab="founders">🏆 Board of Founders</button>
            <button class="db-nav__item" data-tab="executive">🏛️ Executive Committee</button>
            <button class="db-nav__item" data-tab="notices">📰 Notice Board</button>
            <button class="db-nav__item" data-tab="nominee-reqs">🔁 Nominee Requests</button>
            <button class="db-nav__item" data-tab="branding">🎨 Branding</button>
          </nav>
        </div>
        <div class="dashboard__main">

          <!-- Applications Tab -->
          <div id="db-tab-applications" class="db-tab">
            <div class="db-section-head"><div><h2>Membership Applications</h2><p>Review, approve, or reject incoming applications. Approving auto-generates a Member ID.</p></div></div>
            <div id="admin-applications-list" aria-live="polite" aria-busy="true">${Utils.skeleton(3,'table')}</div>
          </div>

          <!-- Members Tab -->
          <div id="db-tab-members" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Member Management</h2><p>Full control over member records, IDs, and documents.</p></div>
              <button class="btn btn--primary btn--sm" id="add-member-btn">＋ Add Member</button>
            </div>
            <div id="admin-members-list" aria-live="polite" aria-busy="true">${Utils.skeleton(5,'table')}</div>
          </div>

          <!-- Board of Founders Tab -->
          <div id="db-tab-founders" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Board of Founders</h2><p>Manage the permanent founding-body roster.</p></div>
              <button class="btn btn--primary btn--sm" id="add-founder-btn">＋ Add Founder</button>
            </div>
            <div id="admin-founders-list" aria-live="polite" aria-busy="true">${Utils.skeleton(4,'table')}</div>
          </div>

          <!-- Executive Committee Tab -->
          <div id="db-tab-executive" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Executive Committee</h2><p>Manage the ${CONFIG.TERM_LABEL} committee roster — updates every two years.</p></div>
              <button class="btn btn--primary btn--sm" id="add-ec-btn">＋ Add Committee Member</button>
            </div>
            <div id="admin-ec-list" aria-live="polite" aria-busy="true">${Utils.skeleton(6,'table')}</div>
          </div>

          <!-- Notices Tab -->
          <div id="db-tab-notices" class="db-tab" hidden>
            <div class="db-section-head">
              <div><h2>Notice Board Management</h2><p>Create, edit, publish, or delete notices. PDF/image attachments supported.</p></div>
              <button class="btn btn--primary btn--sm" id="create-notice-btn">＋ New Notice</button>
            </div>
            <div id="admin-notices-list" aria-live="polite" aria-busy="true">${Utils.skeleton(5,'table')}</div>
          </div>

          <!-- Nominee Requests Tab -->
          <div id="db-tab-nominee-reqs" class="db-tab" hidden>
            <div class="db-section-head"><div><h2>Nominee Change Requests</h2><p>Review and action pending nominee change requests from members.</p></div></div>
            <div id="admin-nominee-list" aria-live="polite" aria-busy="true">${Utils.skeleton(3,'table')}</div>
          </div>

          <!-- Branding Tab -->
          <div id="db-tab-branding" class="db-tab" hidden>
            <div class="db-section-head"><div><h2>Site Branding</h2><p>Upload a custom organisation logo. It appears in the navigation bar across the site.</p></div></div>
            <div class="form-card" id="branding-card">
              <p class="form-card__note">Recommended: square PNG or SVG-exported PNG, transparent background, at least 200×200px.</p>
              ${Utils.fileZoneHtml({ id:'branding-logo-zone', name:'logo', label:'Organisation Logo', kind:'image', existing: Utils.getCustomLogo(), accept:'image/*' })}
              <div class="modal-actions">
                <button class="btn btn--primary" id="save-logo-btn">Save Logo</button>
                <button class="btn btn--ghost" id="reset-logo-btn">Reset to Default</button>
              </div>
            </div>
          </div>

        </div>
      </div>`;

    document.querySelectorAll('.db-nav__item').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.db-nav__item').forEach((b)=>b.classList.remove('db-nav__item--active'));
        document.querySelectorAll('.db-tab').forEach((t)=>t.hidden=true);
        btn.classList.add('db-nav__item--active');
        document.getElementById(`db-tab-${btn.dataset.tab}`).hidden=false;
      });
    });

    Utils.initFileZone('branding-logo-zone','image');

    await Promise.all([
      _loadAdminApplications(),
      _loadAdminMembers(),
      _loadAdminFounders(),
      _loadAdminEC(),
      _loadAdminNotices(),
      _loadAdminNomineeRequests(),
    ]);

    document.getElementById('add-member-btn')?.addEventListener('click', () => _openMemberModal(null));
    document.getElementById('add-founder-btn')?.addEventListener('click', () => _openCommitteeModal('founder', null));
    document.getElementById('add-ec-btn')?.addEventListener('click', () => _openCommitteeModal('executive', null));
    document.getElementById('create-notice-btn')?.addEventListener('click', () => _openNoticeModal(null));

    document.getElementById('save-logo-btn')?.addEventListener('click', () => {
      const b64 = document.getElementById('branding-logo-zone')?.dataset.base64;
      if (!b64) { Utils.toast('Please choose a logo image first.','warning'); return; }
      Utils.setCustomLogo(b64);
      Components.Navbar.render();
      Components.Navbar.updateAuthState();
      Utils.toast('Logo updated successfully!','success');
    });
    document.getElementById('reset-logo-btn')?.addEventListener('click', () => {
      Utils.clearCustomLogo();
      Components.Navbar.render();
      Components.Navbar.updateAuthState();
      Utils.toast('Logo reset to default.','info');
      renderAdminDashboard();
    });
  };

  // ── ADMIN: APPLICATIONS ─────────────────────────────────────────────────────────

  const _loadAdminApplications = async () => {
    const el = document.getElementById('admin-applications-list'); if(!el) return;
    try {
      const apps = await API.getApplications();
      if (!apps.length) { el.innerHTML='<p class="empty-state">No applications received yet.</p>'; return; }
      el.innerHTML = `
        <div class="table-wrap">
          <table class="data-table" aria-label="Membership applications">
            <thead><tr><th>Applicant</th><th>Phone</th><th>Email</th><th>References</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${apps.map((a) => `
                <tr data-id="${a.id}">
                  <td><strong>${Utils.escapeHtml(a.name)}</strong></td>
                  <td>${Utils.escapeHtml(a.phone)}</td>
                  <td>${Utils.escapeHtml(a.email)}</td>
                  <td class="font-mono">${(a.references||[]).join(', ')}</td>
                  <td>${Utils.fmtDateShort(a.submittedAt)}</td>
                  <td>${Utils.badge(a.status)}</td>
                  <td class="td-actions">
                    <button class="btn btn--outline btn--xs view-app" data-id="${a.id}">View</button>
                    ${a.status==='pending' ? `
                      <button class="btn btn--success btn--xs approve-app" data-id="${a.id}">Approve</button>
                      <button class="btn btn--danger btn--xs reject-app" data-id="${a.id}">Reject</button>` : ''}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

      el.querySelectorAll('.view-app').forEach((btn) =>
        btn.addEventListener('click', () => _openApplicationViewModal(btn.dataset.id, apps)));

      el.querySelectorAll('.approve-app').forEach((btn) => {
        btn.addEventListener('click', () => {
          if (!confirm('Approve this application? A new Member ID will be generated and the member record created.')) return;
          _approveApplication(btn.dataset.id);
        });
      });

      el.querySelectorAll('.reject-app').forEach((btn) => {
        btn.addEventListener('click', () => {
          Utils.modal.open(`
            <div class="form-group">
              <label for="app-reject-reason">Rejection Reason</label>
              <textarea id="app-reject-reason" class="input input--textarea" rows="3" placeholder="Explain why this application is being rejected"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn btn--danger btn--sm" id="confirm-app-reject" data-id="${btn.dataset.id}">Confirm Rejection</button>
              <button class="btn btn--ghost btn--sm" onclick="Utils.modal.close()">Cancel</button>
            </div>`, 'Reject Application');
          document.getElementById('confirm-app-reject')?.addEventListener('click', async (e) => {
            const reason = document.getElementById('app-reject-reason').value;
            try {
              await API.rejectApplication(e.target.dataset.id, reason);
              Utils.toast('Application rejected.','warning');
              Utils.modal.close();
              _loadAdminApplications();
            } catch(err) { Utils.toast(err.message,'error'); }
          });
        });
      });
    } catch(err) { el.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  const _approveApplication = async (appId) => {
    try {
      const { member } = await API.approveApplication(appId);
      Utils.modal.open(`
        <div class="approval-success">
          <div class="approval-success__icon">✅</div>
          <h3>Member Approved!</h3>
          <p>A new member record has been created with the Member ID:</p>
          <div class="approval-success__id">${member.memberId}</div>
          <p class="footnote">Default login password is the same as the Member ID. Please share these credentials with the new member via email or WhatsApp.</p>
        </div>
        <div class="modal-actions">
          <button class="btn btn--primary" onclick="Utils.modal.close()">Done</button>
        </div>`, 'Application Approved');
      _loadAdminApplications();
      _loadAdminMembers();
    } catch(err) { Utils.toast(err.message,'error'); }
  };

  const _openApplicationViewModal = (id, apps) => {
    const a = apps.find((x)=>x.id===id); if(!a) return;
    Utils.modal.open(`
      <div class="app-view">
        <div class="upload-grid mb-4">
          <div class="profile-doc-card">${a.photo?`<img src="${a.photo}" class="profile-doc-card__img" alt="Photo">`:`<div class="profile-doc-card__placeholder">📷</div>`}<span>Photo</span></div>
          <div class="profile-doc-card">${a.nidPhoto?`<img src="${a.nidPhoto}" class="profile-doc-card__img" alt="NID">`:`<div class="profile-doc-card__placeholder">📄</div>`}<span>NID Copy</span></div>
          <div class="profile-doc-card">${a.signaturePhoto?`<img src="${a.signaturePhoto}" class="profile-doc-card__img" alt="Signature">`:`<div class="profile-doc-card__placeholder">✍️</div>`}<span>Signature</span></div>
        </div>
        <dl class="profile-detail-grid">
          ${[['Full Name',a.name],["Father's Name",a.fatherName],["Mother's Name",a.motherName],
             ['Date of Birth',Utils.fmtDate(a.dob)],['NID Number',a.nidNumber],['Occupation',a.occupation],
             ['Phone',a.phone],['Email',a.email]].map(([k,v])=>`<div class="profile-row"><dt>${k}</dt><dd>${Utils.escapeHtml(v||'—')}</dd></div>`).join('')}
        </dl>
        <h4 class="profile-section-title">Present Address</h4>
        <p class="profile-address">${Utils.escapeHtml(fmtAddr(a.presentAddress,'present'))}</p>
        <h4 class="profile-section-title">Permanent Address</h4>
        <p class="profile-address">${Utils.escapeHtml(fmtAddr(a.permanentAddress,'permanent'))}</p>
        <h4 class="profile-section-title">Nominee</h4>
        <div class="nominee-detail-card">
          <div class="nominee-detail-card__photo">${a.nominee?.photo?`<img src="${a.nominee.photo}" alt="Nominee">`:`<div class="profile-doc-card__placeholder">👤</div>`}</div>
          <dl class="profile-detail-grid">
            <div class="profile-row"><dt>Name</dt><dd>${Utils.escapeHtml(a.nominee?.name||'—')}</dd></div>
            <div class="profile-row"><dt>Relationship</dt><dd>${Utils.escapeHtml(a.nominee?.relationship||'—')}</dd></div>
            <div class="profile-row"><dt>NID Number</dt><dd>${Utils.escapeHtml(a.nominee?.nidNumber||'—')}</dd></div>
            <div class="profile-row"><dt>Phone</dt><dd>${Utils.escapeHtml(a.nominee?.phone||'—')}</dd></div>
          </dl>
        </div>
        <h4 class="profile-section-title">References</h4>
        <p class="font-mono">${(a.references||[]).join(', ') || '—'}</p>
        ${a.reviewNote ? `<h4 class="profile-section-title">Review Note</h4><p>${Utils.escapeHtml(a.reviewNote)}</p>` : ''}
      </div>`, `Application: ${a.name}`);
  };

  // ── ADMIN: MEMBERS ───────────────────────────────────────────────────────────────

  const _loadAdminMembers = async () => {
    const el = document.getElementById('admin-members-list'); if(!el) return;
    try {
      const members = await API.getMembers();
      el.innerHTML = `
        <div class="table-wrap">
          <table class="data-table" aria-label="Member list">
            <thead><tr><th>Photo</th><th>ID</th><th>Name</th><th>Phone</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              ${members.map((m) => `
                <tr>
                  <td><img src="${m.photo}" alt="" width="36" height="36" class="table-avatar" loading="lazy"></td>
                  <td class="font-mono">${m.memberId}</td>
                  <td><strong>${Utils.escapeHtml(m.name)}</strong></td>
                  <td>${Utils.escapeHtml(m.phone)}</td>
                  <td>${Utils.escapeHtml(m.email)}</td>
                  <td>${Utils.badge(m.role)}</td>
                  <td>${Utils.badge(m.status)}</td>
                  <td class="td-actions">
                    <button class="btn btn--outline btn--xs edit-member" data-id="${m.id}">Edit</button>
                    <button class="btn btn--outline btn--xs send-id-email" data-id="${m.id}">Email ID</button>
                    <button class="btn btn--danger btn--xs delete-member" data-id="${m.id}">Delete</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <p class="table-summary">${members.length} total members</p>`;

      el.querySelectorAll('.edit-member').forEach((btn) => btn.addEventListener('click', () => _openMemberModal(btn.dataset.id, members)));
      el.querySelectorAll('.send-id-email').forEach((btn) => {
        btn.addEventListener('click', async () => {
          try { await API.sendIdEmail(btn.dataset.id); Utils.toast('Member ID emailed successfully.','success'); }
          catch(err) { Utils.toast(err.message,'error'); }
        });
      });
      el.querySelectorAll('.delete-member').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this member permanently? This cannot be undone.')) return;
          try { await API.deleteMember(btn.dataset.id); Utils.toast('Member deleted.','warning'); _loadAdminMembers(); }
          catch(err) { Utils.toast(err.message,'error'); }
        });
      });
    } catch(err) { el.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  const _openMemberModal = (id, members=[]) => {
    const m = id ? members.find((x)=>x.id===id) : null;
    const pa = m?.presentAddress || {}, pm = m?.permanentAddress || {}, nom = m?.nominee || {};

    Utils.modal.open(`
      <form id="member-form" novalidate class="application-form application-form--compact">

        <fieldset class="form-fieldset">
          <legend>🆔 Member ID & Status</legend>
          <div class="form-grid">
            <div class="form-group">
              <label for="mf-memberId">Member ID ${m ? '' : '(leave blank to auto-generate)'}</label>
              <input type="text" id="mf-memberId" class="input" value="${m?Utils.escapeHtml(m.memberId):''}" placeholder="${m?'':'Auto: DD-0XX'}">
              <span class="footnote" style="margin-top:0">Default login password equals the Member ID. Changing the ID also resets the password.</span>
            </div>
            <div class="form-group">
              <label for="mf-status">Status</label>
              <select id="mf-status" class="input">
                <option value="active"   ${m?.status==='active'  ?'selected':''}>Active</option>
                <option value="inactive" ${m?.status==='inactive'?'selected':''}>Inactive</option>
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset class="form-fieldset">
          <legend>👤 Personal Information</legend>
          <div class="form-grid">
            <div class="form-group"><label for="mf-name">Full Name *</label><input type="text" id="mf-name" class="input" required value="${m?Utils.escapeHtml(m.name):''}"></div>
            <div class="form-group"><label for="mf-dob">Date of Birth</label><input type="date" id="mf-dob" class="input" value="${m?.dob||''}"></div>
            <div class="form-group"><label for="mf-father">Father's Name</label><input type="text" id="mf-father" class="input" value="${m?Utils.escapeHtml(m.fatherName||''):''}"></div>
            <div class="form-group"><label for="mf-mother">Mother's Name</label><input type="text" id="mf-mother" class="input" value="${m?Utils.escapeHtml(m.motherName||''):''}"></div>
            <div class="form-group"><label for="mf-nid">NID Number</label><input type="text" id="mf-nid" class="input" value="${m?Utils.escapeHtml(m.nidNumber||''):''}"></div>
            <div class="form-group"><label for="mf-occupation">Occupation</label><input type="text" id="mf-occupation" class="input" value="${m?Utils.escapeHtml(m.occupation||''):''}"></div>
            <div class="form-group"><label for="mf-phone">Phone *</label><input type="tel" id="mf-phone" class="input" required value="${m?Utils.escapeHtml(m.phone):''}"></div>
            <div class="form-group"><label for="mf-email">Email *</label><input type="email" id="mf-email" class="input" required value="${m?Utils.escapeHtml(m.email):''}"></div>
          </div>
        </fieldset>

        <fieldset class="form-fieldset">
          <legend>🏠 Present Address</legend>
          <div class="form-grid">
            <div class="form-group"><label for="mf-pa-house">House / Road</label><input type="text" id="mf-pa-house" class="input" value="${Utils.escapeHtml(pa.house||'')}"></div>
            <div class="form-group"><label for="mf-pa-area">Area</label><input type="text" id="mf-pa-area" class="input" value="${Utils.escapeHtml(pa.area||'')}"></div>
            <div class="form-group"><label for="mf-pa-city">City</label><input type="text" id="mf-pa-city" class="input" value="${Utils.escapeHtml(pa.city||'')}"></div>
            <div class="form-group"><label for="mf-pa-post">Post Code</label><input type="text" id="mf-pa-post" class="input" value="${Utils.escapeHtml(pa.postCode||'')}"></div>
          </div>
        </fieldset>

        <fieldset class="form-fieldset">
          <legend>🏡 Permanent Address</legend>
          <div class="form-grid">
            <div class="form-group"><label for="mf-pm-village">Village / Ward</label><input type="text" id="mf-pm-village" class="input" value="${Utils.escapeHtml(pm.village||'')}"></div>
            <div class="form-group"><label for="mf-pm-upazila">Upazila / Thana</label><input type="text" id="mf-pm-upazila" class="input" value="${Utils.escapeHtml(pm.upazila||'')}"></div>
            <div class="form-group"><label for="mf-pm-district">District</label><input type="text" id="mf-pm-district" class="input" value="${Utils.escapeHtml(pm.district||'')}"></div>
            <div class="form-group"><label for="mf-pm-post">Post Code</label><input type="text" id="mf-pm-post" class="input" value="${Utils.escapeHtml(pm.postCode||'')}"></div>
          </div>
        </fieldset>

        <fieldset class="form-fieldset">
          <legend>📎 Documents</legend>
          <div class="upload-grid">
            ${Utils.fileZoneHtml({ id:'mf-photo-zone',     name:'photo',          label:'Photo',      kind:'image', existing:m?.photo||null,          accept:'image/*' })}
            ${Utils.fileZoneHtml({ id:'mf-nid-zone',       name:'nidPhoto',       label:'NID Copy',   kind:'doc',   existing:m?.nidPhoto||null,       accept:'image/*,application/pdf' })}
            ${Utils.fileZoneHtml({ id:'mf-signature-zone', name:'signaturePhoto',label:'Signature',  kind:'image', existing:m?.signaturePhoto||null, accept:'image/*' })}
          </div>
        </fieldset>

        <fieldset class="form-fieldset">
          <legend>🔁 Nominee Information</legend>
          <div class="form-grid">
            <div class="form-group"><label for="mf-nom-name">Nominee Name</label><input type="text" id="mf-nom-name" class="input" value="${Utils.escapeHtml(nom.name||'')}"></div>
            <div class="form-group">
              <label for="mf-nom-rel">Relationship</label>
              <select id="mf-nom-rel" class="input">
                <option value="">Select</option>
                ${relationOptions.map((r)=>`<option value="${r}" ${nom.relationship===r?'selected':''}>${r}</option>`).join('')}
              </select>
            </div>
            <div class="form-group"><label for="mf-nom-nid">Nominee NID Number</label><input type="text" id="mf-nom-nid" class="input" value="${Utils.escapeHtml(nom.nidNumber||'')}"></div>
            <div class="form-group"><label for="mf-nom-phone">Nominee Phone</label><input type="tel" id="mf-nom-phone" class="input" value="${Utils.escapeHtml(nom.phone||'')}"></div>
          </div>
          <div class="upload-grid">
            ${Utils.fileZoneHtml({ id:'mf-nom-photo-zone', name:'nomPhoto',    label:"Nominee's Photo",    kind:'image', existing:nom.photo||null,    accept:'image/*' })}
            ${Utils.fileZoneHtml({ id:'mf-nom-nid-zone',   name:'nomNidPhoto', label:"Nominee's NID Copy", kind:'doc',   existing:nom.nidPhoto||null, accept:'image/*,application/pdf' })}
          </div>
        </fieldset>

        <div class="modal-actions">
          <button type="submit" class="btn btn--primary">${m ? 'Save Changes' : 'Add Member'}</button>
          <button type="button" class="btn btn--ghost" onclick="Utils.modal.close()">Cancel</button>
        </div>
      </form>`, m ? `Edit Member: ${m.name}` : 'Add New Member');

    // Init file zones
    ['mf-photo-zone','mf-signature-zone','mf-nom-photo-zone'].forEach((zid)=>Utils.initFileZone(zid,'image'));
    ['mf-nid-zone','mf-nom-nid-zone'].forEach((zid)=>Utils.initFileZone(zid,'doc'));

    document.getElementById('member-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name  = document.getElementById('mf-name').value.trim();
      const phone = document.getElementById('mf-phone').value.trim();
      const email = document.getElementById('mf-email').value.trim();
      if (!name || !phone || !email) { Utils.toast('Name, phone, and email are required.','error'); return; }

      const photoZone = document.getElementById('mf-photo-zone');
      const nidZone    = document.getElementById('mf-nid-zone');
      const sigZone    = document.getElementById('mf-signature-zone');
      const nomPhotoZ  = document.getElementById('mf-nom-photo-zone');
      const nomNidZ    = document.getElementById('mf-nom-nid-zone');

      const memberIdInput = document.getElementById('mf-memberId').value.trim().toUpperCase();

      const data = {
        ...(memberIdInput ? { memberId: memberIdInput } : {}),
        status     : document.getElementById('mf-status').value,
        name, phone, email,
        dob        : document.getElementById('mf-dob').value || null,
        fatherName : document.getElementById('mf-father').value.trim(),
        motherName : document.getElementById('mf-mother').value.trim(),
        nidNumber  : document.getElementById('mf-nid').value.trim(),
        occupation : document.getElementById('mf-occupation').value.trim(),
        presentAddress: {
          house: document.getElementById('mf-pa-house').value.trim(),
          area:  document.getElementById('mf-pa-area').value.trim(),
          city:  document.getElementById('mf-pa-city').value.trim(),
          postCode: document.getElementById('mf-pa-post').value.trim(),
        },
        permanentAddress: {
          village: document.getElementById('mf-pm-village').value.trim(),
          upazila: document.getElementById('mf-pm-upazila').value.trim(),
          district: document.getElementById('mf-pm-district').value.trim(),
          postCode: document.getElementById('mf-pm-post').value.trim(),
        },
        photo         : photoZone?.dataset.base64 || m?.photo || null,
        nidPhoto      : nidZone?.dataset.base64    || m?.nidPhoto || null,
        signaturePhoto: sigZone?.dataset.base64    || m?.signaturePhoto || null,
        nominee: {
          name: document.getElementById('mf-nom-name').value.trim(),
          relationship: document.getElementById('mf-nom-rel').value,
          nidNumber: document.getElementById('mf-nom-nid').value.trim(),
          phone: document.getElementById('mf-nom-phone').value.trim(),
          photo: nomPhotoZ?.dataset.base64 || nom.photo || null,
          nidPhoto: nomNidZ?.dataset.base64 || nom.nidPhoto || null,
        },
      };

      try {
        if (m) { await API.updateMember(m.id, data); Utils.toast('Member updated successfully.','success'); }
        else   { const nw = await API.createMember(data); Utils.toast(`Member added! Assigned ID: ${nw.memberId}`,'success',6000); }
        Utils.modal.close();
        _loadAdminMembers();
      } catch(err) { Utils.toast(err.message,'error'); }
    });
  };

  // ── ADMIN: BOARD OF FOUNDERS & EXECUTIVE COMMITTEE (shared logic) ───────────────

  const _loadAdminFounders = async () => {
    const el = document.getElementById('admin-founders-list'); if(!el) return;
    try {
      const list = await API.getBoardOfFounders();
      el.innerHTML = _committeeTableHtml(list, 'founder');
      _bindCommitteeTableEvents(el, 'founder', list);
    } catch(err) { el.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  const _loadAdminEC = async () => {
    const el = document.getElementById('admin-ec-list'); if(!el) return;
    try {
      const list = await API.getExecutiveCommittee();
      el.innerHTML = _committeeTableHtml(list, 'executive');
      _bindCommitteeTableEvents(el, 'executive', list);
    } catch(err) { el.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  const _committeeTableHtml = (list, type) => `
    <div class="table-wrap">
      <table class="data-table" aria-label="${type==='founder'?'Board of Founders':'Executive Committee'} roster">
        <thead><tr><th>Photo</th><th>Name</th><th>Position</th><th>Term Start</th>${type==='executive'?'<th>Term End</th>':''}<th>Message Preview</th><th>Actions</th></tr></thead>
        <tbody>
          ${list.map((m) => `
            <tr data-id="${m.id}">
              <td><img src="${m.photo}" alt="" width="36" height="36" class="table-avatar" loading="lazy"></td>
              <td><strong>${Utils.escapeHtml(m.name)}</strong></td>
              <td>${Utils.escapeHtml(m.position)}</td>
              <td>${Utils.fmtDateShort(m.termStart)}</td>
              ${type==='executive' ? `<td>${m.termEnd?Utils.fmtDateShort(m.termEnd):'Present'}</td>` : ''}
              <td class="td-reason">${Utils.escapeHtml((m.message||'').substring(0,50))}…</td>
              <td class="td-actions">
                <button class="btn btn--outline btn--xs edit-cm" data-id="${m.id}">Edit</button>
                <button class="btn btn--danger btn--xs delete-cm" data-id="${m.id}">Remove</button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <p class="footnote">${type==='founder' ? 'Founders are permanent and have no end date.' : `Current term: ${CONFIG.TERM_LABEL} · Inaugurated ${Utils.fmtDate(CONFIG.TERM_START)}`}</p>`;

  const _bindCommitteeTableEvents = (el, type, list) => {
    el.querySelectorAll('.edit-cm').forEach((btn) => btn.addEventListener('click', () => _openCommitteeModal(type, btn.dataset.id, list)));
    el.querySelectorAll('.delete-cm').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Remove this person from the roster?')) return;
        const updated = list.filter((x)=>x.id!==btn.dataset.id);
        try {
          if (type==='founder') await API.updateBoardOfFounders(updated);
          else                  await API.updateExecutiveCommittee(updated);
          Utils.toast('Removed from roster.','warning');
          type==='founder' ? _loadAdminFounders() : _loadAdminEC();
        } catch(err) { Utils.toast(err.message,'error'); }
      });
    });
  };

  const _openCommitteeModal = (type, id, list=[]) => {
    const m = id ? list.find((x)=>x.id===id) : null;
    const isFounder = type === 'founder';

    Utils.modal.open(`
      <form id="cm-form" novalidate>
        <div class="form-group">
          <label for="cm-name">Full Name *</label>
          <input type="text" id="cm-name" class="input" required value="${m?Utils.escapeHtml(m.name):''}">
        </div>
        <div class="form-group">
          <label for="cm-position">Position / Title *</label>
          <input type="text" id="cm-position" class="input" required value="${m?Utils.escapeHtml(m.position):''}"
                 placeholder="${isFounder ? 'e.g. Chairman & Founder' : 'e.g. President'}">
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label for="cm-term-start">Term Start Date *</label>
            <input type="date" id="cm-term-start" class="input" required value="${m?.termStart||(isFounder?CONFIG.ORG_FOUNDED+'-06-01':CONFIG.TERM_START)}">
          </div>
          ${!isFounder ? `
          <div class="form-group">
            <label for="cm-term-end">Term End Date</label>
            <input type="date" id="cm-term-end" class="input" value="${m?.termEnd||''}">
          </div>` : ''}
        </div>
        <div class="form-group">
          <label for="cm-order">Display Order</label>
          <input type="number" id="cm-order" class="input" min="1" value="${m?.order||(list.length+1)}">
        </div>
        <div class="form-group">
          <label for="cm-message">Personal Message *</label>
          <textarea id="cm-message" class="input input--textarea" rows="3" required>${m?Utils.escapeHtml(m.message):''}</textarea>
        </div>
        <div class="form-group">
          ${Utils.fileZoneHtml({ id:'cm-photo-zone', name:'photo', label:'Photo', kind:'image', existing:m?.photo||null, accept:'image/*' })}
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn--primary">${m ? 'Save Changes' : 'Add to Roster'}</button>
          <button type="button" class="btn btn--ghost" onclick="Utils.modal.close()">Cancel</button>
        </div>
      </form>`, m ? `Edit: ${m.name}` : `Add to ${isFounder?'Board of Founders':'Executive Committee'}`);

    Utils.initFileZone('cm-photo-zone','image');

    document.getElementById('cm-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name     = document.getElementById('cm-name').value.trim();
      const position = document.getElementById('cm-position').value.trim();
      const message  = document.getElementById('cm-message').value.trim();
      const termStart= document.getElementById('cm-term-start').value;
      const termEnd  = isFounder ? null : (document.getElementById('cm-term-end').value || null);
      const order    = parseInt(document.getElementById('cm-order').value,10) || (list.length+1);
      const photoB64 = document.getElementById('cm-photo-zone')?.dataset.base64;

      if (!name || !position || !message || !termStart) { Utils.toast('Please fill all required fields.','error'); return; }

      const entry = {
        id: m ? m.id : `${isFounder?'bof':'ec'}${Date.now()}`,
        name, position, termStart, termEnd, order, message,
        photo: photoB64 || m?.photo || `https://i.pravatar.cc/200?img=${Math.floor(Math.random()*70)}`,
      };

      const updated = m ? list.map((x)=>x.id===m.id?entry:x) : [...list, entry];

      try {
        if (isFounder) await API.updateBoardOfFounders(updated);
        else           await API.updateExecutiveCommittee(updated);
        Utils.toast(`${isFounder?'Board of Founders':'Executive Committee'} updated.`,'success');
        Utils.modal.close();
        isFounder ? _loadAdminFounders() : _loadAdminEC();
      } catch(err) { Utils.toast(err.message,'error'); }
    });
  };

  // ── ADMIN: NOTICES (with optional PDF/image attachment) ────────────────────────

  const _loadAdminNotices = async () => {
    const el = document.getElementById('admin-notices-list'); if(!el) return;
    try {
      const notices = await API.getAllNotices();
      if (!notices.length) { el.innerHTML='<p class="empty-state">No notices yet. Create the first one!</p>'; return; }
      el.innerHTML = `
        <div class="table-wrap">
          <table class="data-table" aria-label="All notices">
            <thead><tr><th>Title</th><th>Category</th><th>Attachment</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              ${notices.map((n) => `
                <tr>
                  <td><strong>${Utils.escapeHtml(n.title)}</strong></td>
                  <td>${Utils.badge(n.category)}</td>
                  <td>${n.attachmentBase64 ? '📎 Yes' : '—'}</td>
                  <td>${Utils.badge(n.published?'published':'draft')}</td>
                  <td>${Utils.fmtDateShort(n.createdAt)}</td>
                  <td class="td-actions">
                    <button class="btn btn--outline btn--xs edit-notice" data-id="${n.id}">Edit</button>
                    <button class="btn btn--${n.published?'warning':'success'} btn--xs toggle-notice" data-id="${n.id}" data-published="${n.published}">
                      ${n.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button class="btn btn--danger btn--xs delete-notice" data-id="${n.id}">Delete</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

      el.querySelectorAll('.edit-notice').forEach((btn) => btn.addEventListener('click', () => _openNoticeModal(btn.dataset.id, notices)));
      el.querySelectorAll('.toggle-notice').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const pub = btn.dataset.published === 'true';
          try { await API.updateNotice(btn.dataset.id, { published: !pub }); Utils.toast(`Notice ${!pub?'published':'unpublished'}.`,'success'); _loadAdminNotices(); }
          catch(err) { Utils.toast(err.message,'error'); }
        });
      });
      el.querySelectorAll('.delete-notice').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Delete this notice? This cannot be undone.')) return;
          try { await API.deleteNotice(btn.dataset.id); Utils.toast('Notice deleted.','warning'); _loadAdminNotices(); }
          catch(err) { Utils.toast(err.message,'error'); }
        });
      });
    } catch(err) { el.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  const _openNoticeModal = (id, notices=[]) => {
    const n = id ? notices.find((x)=>x.id===id) : null;
    const cats = ['Finance','Meeting','Investment','Announcement','CSR','General'];

    Utils.modal.open(`
      <form id="notice-form" novalidate>
        <div class="form-group">
          <label for="notice-title">Title *</label>
          <input type="text" id="notice-title" class="input" required value="${n?Utils.escapeHtml(n.title):''}" placeholder="Notice title">
        </div>
        <div class="form-group">
          <label for="notice-category">Category</label>
          <select id="notice-category" class="input">
            ${cats.map((c)=>`<option value="${c}" ${n?.category===c?'selected':''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="notice-body">Body *</label>
          <textarea id="notice-body" class="input input--textarea" rows="5" required placeholder="Full notice content…">${n?Utils.escapeHtml(n.body):''}</textarea>
        </div>
        <div class="form-group">
          <label>Attachment (optional — PDF or image)</label>
          ${Utils.fileZoneHtml({ id:'notice-attachment-zone', name:'attachment', label:'PDF / Image Attachment', kind:'doc', existing:n?.attachmentBase64||null, accept:'application/pdf,image/*' })}
        </div>
        <div class="form-group form-group--checkbox">
          <label><input type="checkbox" id="notice-published" ${n?.published?'checked':''}> Publish immediately</label>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn--primary">${id ? 'Save Changes' : 'Create Notice'}</button>
          <button type="button" class="btn btn--ghost" onclick="Utils.modal.close()">Cancel</button>
        </div>
      </form>`, id ? 'Edit Notice' : 'New Notice');

    Utils.initFileZone('notice-attachment-zone','doc');

    document.getElementById('notice-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('notice-title').value.trim();
      const body  = document.getElementById('notice-body').value.trim();
      if (!title || !body) { Utils.toast('Title and body are required.','error'); return; }

      const attZone = document.getElementById('notice-attachment-zone');
      const attInputFile = attZone?.querySelector('input[type="file"]')?.files[0];

      const data = {
        title, body,
        category : document.getElementById('notice-category').value,
        published: document.getElementById('notice-published').checked,
        author   : Auth.getUser().name,
        attachmentBase64: attZone?.dataset.base64 || n?.attachmentBase64 || null,
        attachmentName  : attInputFile?.name || n?.attachmentName || null,
      };

      try {
        if (id) { await API.updateNotice(id, data); Utils.toast('Notice updated.','success'); }
        else    { await API.createNotice(data);      Utils.toast('Notice created.','success'); }
        Utils.modal.close();
        _loadAdminNotices();
      } catch(err) { Utils.toast(err.message,'error'); }
    });
  };

  // ── ADMIN: NOMINEE REQUESTS ───────────────────────────────────────────────────────

  const _loadAdminNomineeRequests = async () => {
    const el = document.getElementById('admin-nominee-list'); if(!el) return;
    try {
      const requests = await API.getNomineeRequests();
      if (!requests.length) { el.innerHTML='<p class="empty-state">No requests found.</p>'; return; }
      el.innerHTML = `
        <div class="table-wrap">
          <table class="data-table" aria-label="Nominee change requests">
            <thead><tr><th>Member</th><th>Current Nominee</th><th>Requested Nominee</th><th>Reason</th><th>Status</th><th>Submitted</th><th>Actions</th></tr></thead>
            <tbody>
              ${requests.map((r) => `
                <tr data-id="${r.id}">
                  <td><strong>${Utils.escapeHtml(r.memberName)}</strong></td>
                  <td>${Utils.escapeHtml(r.currentNominee)}</td>
                  <td>${Utils.escapeHtml(r.requestedNominee)}</td>
                  <td class="td-reason">${Utils.escapeHtml(r.reason)}</td>
                  <td>${Utils.badge(r.status)}</td>
                  <td>${Utils.fmtDateShort(r.submittedAt)}</td>
                  <td class="td-actions">
                    ${r.status==='pending' ? `
                      <button class="btn btn--success btn--xs approve-req" data-id="${r.id}">Approve</button>
                      <button class="btn btn--danger  btn--xs reject-req"  data-id="${r.id}">Reject</button>
                    ` : `<span class="text-muted">—</span>`}
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;

      el.querySelectorAll('.approve-req').forEach((btn) => {
        btn.addEventListener('click', async () => {
          if (!confirm('Approve this nominee change request?')) return;
          try { await API.updateNomineeRequest(btn.dataset.id,'approved'); Utils.toast('Request approved and nominee updated.','success'); _loadAdminNomineeRequests(); }
          catch(err) { Utils.toast(err.message,'error'); }
        });
      });
      el.querySelectorAll('.reject-req').forEach((btn) => {
        btn.addEventListener('click', () => {
          Utils.modal.open(`
            <div class="form-group">
              <label for="reject-reason">Rejection Reason</label>
              <textarea id="reject-reason" class="input input--textarea" rows="3" placeholder="Explain why this request is being rejected"></textarea>
            </div>
            <div class="modal-actions">
              <button class="btn btn--danger btn--sm" id="confirm-reject" data-id="${btn.dataset.id}">Confirm Rejection</button>
              <button class="btn btn--ghost btn--sm" onclick="Utils.modal.close()">Cancel</button>
            </div>`, 'Reject Nominee Request');
          document.getElementById('confirm-reject')?.addEventListener('click', async (e) => {
            const reason = document.getElementById('reject-reason').value;
            try { await API.updateNomineeRequest(e.target.dataset.id,'rejected',reason); Utils.toast('Request rejected.','warning'); Utils.modal.close(); _loadAdminNomineeRequests(); }
            catch(err) { Utils.toast(err.message,'error'); }
          });
        });
      });
    } catch(err) { el.innerHTML = `<p class="error-state">${err.message}</p>`; }
  };

  // ── PUBLIC INTERFACE ───────────────────────────────────────────────────────────

  return {
    render404, renderHome,
    renderPortfolio, renderFinancials,
    renderApply, renderNewMember, renderBenefits, renderNomineeSucession, renderFAQ, renderLogin,
    renderFounders, renderCommittee, renderMembersPage,
    renderValues, renderConduct, renderRules, renderCSR,
    renderMemberDashboard, renderAdminDashboard,
  };

})();
