// =============================================================================
// js/auth.js  —  Dream Development DD · v2 Authentication & RBAC
// =============================================================================
// Two roles only: admin | member   (moderator removed in v2)
// Members log in with their assigned Member ID (DD-001), not email.
// Admin logs in with email + password.
// =============================================================================

const Auth = (() => {

  const TOKEN_KEY = 'dd_token';
  const USER_KEY  = 'dd_user';

  // ── Capabilities ────────────────────────────────────────────────────────────
  const CAPS = {
    admin: [
      'manage:members',           // full CRUD on member records + file uploads
      'manage:applications',      // view, approve, reject membership applications
      'manage:committee',         // edit both BoF and Executive Committee
      'manage:nomineeRequests',   // approve / reject nominee changes
      'manage:notices',           // full notice CRUD + publish/unpublish
      'manage:branding',          // change site logo
      'view:allDashboards',
    ],
    member: [
      'view:ownProfile',
      'view:ownInvoices',
      'submit:nomineeRequest',
    ],
  };

  // ── Session ──────────────────────────────────────────────────────────────────

  const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const getToken   = ()  => localStorage.getItem(TOKEN_KEY);
  const getUser    = ()  => { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; } };
  const isLoggedIn = ()  => !!(getToken() && getUser());
  const getRole    = ()  => getUser()?.role ?? null;
  const can        = (c) => { const r=getRole(); return r ? (CAPS[r]?.includes(c) ?? false) : false; };

  // ── Login Actions ─────────────────────────────────────────────────────────────

  const loginAdmin = async (email, password) => {
    const { token, user } = await API.adminLogin(email, password);
    setSession(token, user);
    return user;
  };

  const loginMember = async (memberId, password) => {
    const { token, member } = await API.memberLogin(memberId, password);
    setSession(token, member);
    return member;
  };

  const logout = async () => {
    try { await API.logout(); } catch { /* non-fatal */ }
    clearSession();
  };

  // ── Route Guards ──────────────────────────────────────────────────────────────

  const guardRoute = (required) => {
    if (!isLoggedIn()) return false;
    const role = getRole();
    if (required === 'member') return true;        // any logged-in user
    if (required === 'admin')  return role === 'admin';
    return false;
  };

  const require = (level) => {
    if (guardRoute(level)) return true;
    Router.navigate('#/login');
    return false;
  };

  const portalRoute = () => (getRole() === 'admin' ? '#/admin' : '#/dashboard');

  return {
    setSession, clearSession,
    getToken, getUser, isLoggedIn, getRole, can,
    loginAdmin, loginMember, logout,
    guardRoute, require, portalRoute,
    CAPS,
  };

})();
