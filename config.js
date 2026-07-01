// =============================================================================
// js/config.js  —  Dream Development DD · v2 Global Configuration
// =============================================================================

const CONFIG = Object.freeze({

  // ── API ──────────────────────────────────────────────────────────────────────
  API_BASE_URL  : 'https://api.dreamdevelopment.org/v1',
  USE_MOCK      : false,
  MOCK_DELAY_MS : 600,

  // ── Organisation ─────────────────────────────────────────────────────────────
  ORG_NAME     : 'Dream Development DD',
  ORG_SHORT    : 'DD',
  ORG_TAGLINE  : 'Make Your Dream Come True',
  ORG_SUB      : 'A Democratic Investment & Community Organisation',
  ORG_FOUNDED  : '2024-05-01',
  ORG_FOUNDED_LABEL : 'May 1, 2024',
  ORG_FOUNDER_COUNT : 7,
  ORG_MEMBERS  : 25,

  // ── Contact ──────────────────────────────────────────────────────────────────
  CONTACT_EMAIL    : 'dd.organization.bd@gmail.com',
  CONTACT_PHONE    : '+8801516564806',
  CONTACT_WHATSAPP : '+8801775085540',
  CONTACT_ADDRESS  : 'Dhaka, Bangladesh',

  // ── Executive Terms ───────────────────────────────────────────────────────────
  TERM_START   : '2026-01-01',
  TERM_YEARS   : 2,
  TERM_LABEL   : 'Term 2026–2028',

  // ── Member ID ────────────────────────────────────────────────────────────────
  ID_PREFIX    : 'DD',         // generates DD-2405001, DD-2405002 …
  ID_DIGITS    : 7,            // zero-padded to 7 digits

  // ── File Upload Limits ────────────────────────────────────────────────────────
  MAX_PHOTO_MB     : 3,
  MAX_DOC_MB       : 10,
  ALLOWED_IMG_EXT  : ['image/jpeg','image/png','image/webp'],
  ALLOWED_DOC_EXT  : ['image/jpeg','image/png','image/webp','application/pdf'],

  // ── Pagination ────────────────────────────────────────────────────────────────
  NOTICES_PER_PAGE  : 6,
  GALLERY_PER_PAGE  : 12,
  INVOICES_PER_PAGE : 10,
  MEMBERS_PER_PAGE  : 12,

  // ── Financials ────────────────────────────────────────────────────────────────
  MONTHLY_CONTRIBUTION : 500,

  // ── Logo storage key (localStorage) ──────────────────────────────────────────
  LOGO_STORAGE_KEY : 'dd_custom_logo',
});
