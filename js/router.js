// =============================================================================
// js/router.js  —  Dream Development DD · v2 Client-Side Hash Router
// =============================================================================

const Router = (() => {

  const ROUTES = {
    '#/'                   : Pages.renderHome,
    '#/portfolio'          : Pages.renderPortfolio,
    '#/financials'         : Pages.renderFinancials,
    '#/apply'              : Pages.renderApply,
    '#/new-member'         : Pages.renderNewMember,
    '#/benefits'           : Pages.renderBenefits,
    '#/nominee-succession' : Pages.renderNomineeSucession,
    '#/faq'                : Pages.renderFAQ,
    '#/login'              : Pages.renderLogin,
    '#/founders'           : Pages.renderFounders,
    '#/committee'          : Pages.renderCommittee,
    '#/members'            : Pages.renderMembersPage,
    '#/values'             : Pages.renderValues,
    '#/conduct'            : Pages.renderConduct,
    '#/rules'              : Pages.renderRules,
    '#/csr'                : Pages.renderCSR,
    '#/dashboard'          : { fn: Pages.renderMemberDashboard, role: 'member' },
    '#/admin'              : { fn: Pages.renderAdminDashboard,  role: 'admin'  },
  };

  const navigate = (hash) => { window.location.hash = hash; };

  const resolve = async () => {
    const hash  = window.location.hash || '#/';
    const route = ROUTES[hash];

    Utils.showLoader();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (!route) { Pages.render404(); _afterResolve(hash); return; }

    if (typeof route === 'object' && route.role) {
      if (!Auth.guardRoute(route.role)) { Utils.hideLoader(); navigate('#/login'); return; }
      await route.fn();
      _afterResolve(hash);
      return;
    }

    if (hash === '#/login' && Auth.isLoggedIn()) {
      Utils.hideLoader();
      navigate(Auth.portalRoute());
      return;
    }

    await route();
    _afterResolve(hash);
  };

  const _afterResolve = (hash) => {
    Utils.hideLoader();
    Components.Navbar.updateAuthState();
    _highlightNav(hash);
  };

  const _highlightNav = (hash) => {
    document.querySelectorAll('.nav-link[href], .nav-dropdown__item[href]').forEach((el) => {
      el.classList.toggle('nav-link--active', el.getAttribute('href') === hash);
    });
  };

  const init = () => {
    window.addEventListener('hashchange', resolve);
    resolve();
  };

  return { init, navigate };

})();
