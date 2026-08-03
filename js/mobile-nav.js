/**
 * Caribbe Legal Services - Mobile Navigation Menu
 * Hamburger menu toggle and mobile overlay logic
 */
(function () {
  'use strict';

  function initMobileNav() {
    const hamburger = document.getElementById('navHamburger');
    const overlay   = document.getElementById('mobileNavOverlay');
    const backdrop  = document.getElementById('mobileNavBackdrop');
    if (!hamburger || !overlay) return;

    function openMenu() {
      hamburger.classList.add('is-open');
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
      hamburger.classList.remove('is-open');
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function () {
      overlay.classList.contains('is-open') ? closeMenu() : openMenu();
    });

    if (backdrop) {
      backdrop.addEventListener('click', closeMenu);
    }

    // Close on nav link click
    overlay.querySelectorAll('.mobile-nav-link').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Close menu when resizing to desktop
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) closeMenu();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileNav);
  } else {
    initMobileNav();
  }
})();
