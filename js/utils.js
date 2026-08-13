// =============================================================================
// js/utils.js  —  Dream Development DD · v2 Utilities
// =============================================================================

const Utils = (() => {

  // ── Toast ──────────────────────────────────────────────────────────────────
  const ICONS = { success:'✓', error:'✕', warning:'⚠', info:'ℹ' };

  const toast = (message, type='info', duration=4500) => {
    const c = document.getElementById('toast-container'); if(!c) return;
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role','alert');
    el.innerHTML = `
      <span class="toast__icon" aria-hidden="true">${ICONS[type]??ICONS.info}</span>
      <span class="toast__body">${escapeHtml(message)}</span>
      <button class="toast__close" aria-label="Dismiss">×</button>`;
    el.querySelector('.toast__close').addEventListener('click', ()=>_dismiss(el));
    c.appendChild(el);
    requestAnimationFrame(()=>el.classList.add('toast--visible'));
    setTimeout(()=>_dismiss(el), duration);
  };
  const _dismiss = (el) => {
    el.classList.remove('toast--visible');
    el.addEventListener('transitionend', ()=>el.remove(), { once:true });
  };

  // ── Modal ───────────────────────────────────────────────────────────────────
  const modal = {
    open(html, title='') {
      const ov=document.getElementById('modal-overlay');
      const ct=document.getElementById('modal-content');
      const tt=document.getElementById('modal-title');
      ct.innerHTML=html; tt.textContent=title; tt.style.display=title?'block':'none';
      ov.removeAttribute('aria-hidden'); ov.classList.add('modal--active');
      document.body.classList.add('no-scroll');
      const first = ov.querySelector('button:not(.modal__close),input,select,textarea');
      (first||ov.querySelector('.modal__close'))?.focus();
    },
    close() {
      const ov=document.getElementById('modal-overlay');
      ov.setAttribute('aria-hidden','true'); ov.classList.remove('modal--active');
      document.body.classList.remove('no-scroll');
    },
  };

  // ── DOM ─────────────────────────────────────────────────────────────────────
  const $  = (s,c=document) => c.querySelector(s);
  const $$ = (s,c=document) => [...c.querySelectorAll(s)];

  const escapeHtml = (s) =>
    String(s??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
                 .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

  // ── Formatters ──────────────────────────────────────────────────────────────
  const fmtDate = (iso, opts={}) => {
    if(!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric', ...opts });
  };
  const fmtDateShort = (iso) => fmtDate(iso,{ day:'numeric', month:'short', year:'numeric' });
  const fmtMoney = (a, c='BDT') => new Intl.NumberFormat('en-BD').format(a)+' '+c;
  const timeAgo = (iso) => {
    const d=Date.now()-new Date(iso).getTime(), m=Math.floor(d/60000);
    if(m<1) return 'just now'; if(m<60) return `${m}m ago`;
    const h=Math.floor(m/60); if(h<24) return `${h}h ago`;
    const dy=Math.floor(h/24); if(dy<30) return `${dy}d ago`;
    return fmtDateShort(iso);
  };

  // ── Badges ──────────────────────────────────────────────────────────────────
  const BADGE = {
    paid:'success', overdue:'danger', pending:'warning', approved:'success', rejected:'danger',
    published:'success', draft:'neutral', active:'success', inactive:'danger',
    Finance:'cobalt', Meeting:'gold', Investment:'emerald', Announcement:'purple',
    CSR:'teal', General:'neutral', admin:'purple', member:'cobalt',
  };
  const badge = (l) => `<span class="badge badge--${BADGE[l]||'neutral'}">${escapeHtml(l)}</span>`;

  // ── Skeleton Loader ──────────────────────────────────────────────────────────
  const skeleton = (rows=3, type='card') => type==='table'
    ? `<div class="skeleton-table">${'<div class="skeleton-row"></div>'.repeat(rows)}</div>`
    : `<div class="skeleton-grid">${'<div class="skeleton-card"></div>'.repeat(rows)}</div>`;

  // ── Pagination ───────────────────────────────────────────────────────────────
  const renderPagination = (id, cur, total, cb) => {
    const el=document.getElementById(id); if(!el) return;
    if(total<=1){ el.innerHTML=''; return; }
    let h=`<nav class="pagination" aria-label="Pages"><ul>`;
    h+=`<li><button class="pg-btn" ${cur<=1?'disabled':''} data-p="${cur-1}">‹</button></li>`;
    for(let i=1;i<=total;i++) h+=`<li><button class="pg-btn ${i===cur?'pg-btn--active':''}" data-p="${i}">${i}</button></li>`;
    h+=`<li><button class="pg-btn" ${cur>=total?'disabled':''} data-p="${cur+1}">›</button></li></ul></nav>`;
    el.innerHTML=h;
    el.querySelectorAll('.pg-btn:not([disabled])').forEach((b)=>b.addEventListener('click',()=>cb(+b.dataset.p)));
  };

  // ── Form Utilities ───────────────────────────────────────────────────────────
  const formData = (f) => { const o={}; new FormData(f).forEach((v,k)=>{ o[k]=v; }); return o; };
  const setSubmitting = (btn, on) => {
    if(!btn) return;
    if(on){ btn.dataset.orig=btn.innerHTML; btn.innerHTML='<span class="btn-spinner"></span> Processing…'; btn.disabled=true; }
    else  { btn.innerHTML=btn.dataset.orig||btn.innerHTML; btn.disabled=false; }
  };
  const clearErrors = (f) => {
    f?.querySelectorAll('.field-err').forEach((e)=>(e.textContent=''));
    f?.querySelectorAll('.input--err').forEach((e)=>e.classList.remove('input--err'));
  };
  const fieldErr = (id, msg) => {
    document.getElementById(id)?.classList.add('input--err');
    const e=document.getElementById(`${id}-err`); if(e) e.textContent=msg;
  };

  // ── File Upload Utilities ────────────────────────────────────────────────────

  /**
   * Read a file input's selected file as base64 DataURL.
   * Returns null if no file selected.
   */
  const readFileAsBase64 = (file) => {
    if (!file) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload  = (e) => resolve(e.target.result);
      r.onerror = () => reject(new Error('File read error'));
      r.readAsDataURL(file);
    });
  };

  /**
   * Validate file size and type.
   * @param {File} file
   * @param {'image'|'doc'} kind
   * @returns {string|null} error message or null if valid
   */
  const validateFile = (file, kind='image') => {
    const maxMB   = kind==='image' ? CONFIG.MAX_PHOTO_MB : CONFIG.MAX_DOC_MB;
    const allowed = kind==='image' ? CONFIG.ALLOWED_IMG_EXT : CONFIG.ALLOWED_DOC_EXT;
    if (file.size > maxMB * 1024 * 1024) return `File must be under ${maxMB}MB.`;
    if (!allowed.includes(file.type))    return `Allowed types: ${allowed.map((t)=>t.split('/')[1]).join(', ')}.`;
    return null;
  };

  /**
   * Initialise a .file-upload-zone so that:
   *  - selecting a file validates and previews it
   *  - stores the base64 result in zone.dataset.base64
   * @param {string} zoneId  id of the .file-upload-zone element
   * @param {'image'|'doc'} kind
   */
  const initFileZone = (zoneId, kind='image') => {
    const zone = document.getElementById(zoneId); if(!zone) return;
    const input = zone.querySelector('input[type="file"]');
    const preview = zone.querySelector('.fuz-preview');
    const hint    = zone.querySelector('.fuz-hint');
    if(!input) return;

    input.addEventListener('change', async () => {
      const file = input.files[0]; if(!file) return;
      const err = validateFile(file, kind);
      if(err) { toast(err,'error'); input.value=''; return; }
      const b64 = await readFileAsBase64(file);
      zone.dataset.base64 = b64;
      if(preview) {
        if(file.type.startsWith('image/')) {
          preview.innerHTML = `<img src="${b64}" alt="Preview" class="fuz-img">
            <button type="button" class="fuz-remove" aria-label="Remove">✕</button>`;
        } else {
          preview.innerHTML = `<div class="fuz-doc-icon">📄</div>
            <span class="fuz-filename">${escapeHtml(file.name)}</span>
            <button type="button" class="fuz-remove" aria-label="Remove">✕</button>`;
        }
        preview.classList.add('fuz-preview--active');
        if(hint) hint.style.display='none';
        preview.querySelector('.fuz-remove')?.addEventListener('click', (e) => {
          e.stopPropagation(); input.value=''; delete zone.dataset.base64;
          preview.innerHTML=''; preview.classList.remove('fuz-preview--active');
          if(hint) hint.style.display='';
        });
      }
    });

    // Drag-drop
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('fuz--drag'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('fuz--drag'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault(); zone.classList.remove('fuz--drag');
      const file = e.dataTransfer.files[0];
      if(file) { const dt=new DataTransfer(); dt.items.add(file); input.files=dt.files; input.dispatchEvent(new Event('change')); }
    });
  };

  /**
   * Render a file-upload-zone HTML block.
   * @param {object} opts
   */
  const fileZoneHtml = ({ id, name, label, kind='image', existing=null, accept='image/*' }) => `
    <div class="file-upload-zone" id="${id}">
      <input type="file" name="${name}" accept="${accept}" class="fuz-input" tabindex="-1">
      <div class="fuz-preview ${existing?'fuz-preview--active':''}">
        ${existing && existing.startsWith('data:image')
          ? `<img src="${existing}" alt="Current ${label}" class="fuz-img">
             <button type="button" class="fuz-remove" aria-label="Remove">✕</button>`
          : existing
            ? `<div class="fuz-doc-icon">📄</div><span class="fuz-filename">Document on file</span>`
            : ''}
      </div>
      <div class="fuz-hint" ${existing?'style="display:none"':''}>
        <div class="fuz-hint__icon" aria-hidden="true">${kind==='image'?'📷':'📄'}</div>
        <div class="fuz-hint__text">
          <strong>Upload ${label}</strong>
          <span>Click or drag &amp; drop · ${kind==='image'?'JPG/PNG, max 2MB':'JPG/PNG/PDF, max 5MB'}</span>
        </div>
      </div>
    </div>`;

  // ── Page Loader ──────────────────────────────────────────────────────────────
  const showLoader = () => document.getElementById('page-loader')?.removeAttribute('aria-hidden');
  const hideLoader = () => document.getElementById('page-loader')?.setAttribute('aria-hidden','true');
  const scrollTo   = (id) => document.getElementById(id)?.scrollIntoView({ behavior:'smooth', block:'start' });

  // ── Custom Logo ──────────────────────────────────────────────────────────────
  const getCustomLogo = () => localStorage.getItem(CONFIG.LOGO_STORAGE_KEY);
  const setCustomLogo = (b64) => localStorage.setItem(CONFIG.LOGO_STORAGE_KEY, b64);
  const clearCustomLogo = () => localStorage.removeItem(CONFIG.LOGO_STORAGE_KEY);

  return {
    toast, modal, $, $$, escapeHtml,
    fmtDate, fmtDateShort, fmtMoney, timeAgo,
    badge, skeleton, renderPagination,
    formData, setSubmitting, clearErrors, fieldErr,
    readFileAsBase64, validateFile, initFileZone, fileZoneHtml,
    showLoader, hideLoader, scrollTo,
    getCustomLogo, setCustomLogo, clearCustomLogo,
  };

})();
