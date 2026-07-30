/**
 * Caribbe Legal Services - CMS Frontend Sync Engine (v1.0)
 * Automatically applies CMS edits, promo banners, prices and custom texts to the live pages.
 */

(function () {
  function applyCmsFrontendSync() {
    // 1. Promo Banner Check
    const promoConfig = JSON.parse(localStorage.getItem('caribbe_cms_promo_banner') || '{}');
    if (promoConfig.active && promoConfig.text) {
      injectPromoBanner(promoConfig);
    }

    // 2. Page Specific CMS Edits
    const path = window.location.pathname;
    let pageSlug = 'inicio';
    if (path.includes('qui_nes_somos')) pageSlug = 'nosotros';
    if (path.includes('servicios_detallados')) pageSlug = 'servicios';
    if (path.includes('galer_a_de_fotos')) pageSlug = 'galeria';
    if (path.includes('aviso_de_privacidad')) pageSlug = 'privacidad';

    const pageData = JSON.parse(localStorage.getItem('caribbe_cms_config_' + pageSlug) || '{}');

    // Apply Hero Titles if present
    if (pageData.heroTitle) {
      const heroTitleEl = document.querySelector('h1.font-headline');
      if (heroTitleEl) heroTitleEl.textContent = pageData.heroTitle;
    }
    if (pageData.heroSubtitle) {
      const heroSubEl = document.querySelector('p.font-cursive, p.text-slate-200, p.text-slate-600');
      if (heroSubEl && heroSubEl.classList.contains('font-cursive')) {
        heroSubEl.textContent = pageData.heroSubtitle;
      }
    }

    // Apply SEO Meta Tags
    if (pageData.seo) {
      if (pageData.seo.title) document.title = pageData.seo.title;
      if (pageData.seo.description) {
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
          metaDesc = document.createElement('meta');
          metaDesc.name = 'description';
          document.head.appendChild(metaDesc);
        }
        metaDesc.content = pageData.seo.description;
      }
    }

    // Apply Global Prices if on Services page
    if (pageData.prices) {
      const p = pageData.prices;
      document.querySelectorAll('.cms-price-passport').forEach(el => el.textContent = p.passport || '$280');
      document.querySelectorAll('.cms-price-notary').forEach(el => el.textContent = p.notary || '$50');
      document.querySelectorAll('.cms-price-air-express').forEach(el => el.textContent = p.airExpress || '$6.50 / lb');
    }
  }

  function injectPromoBanner(config) {
    if (document.getElementById('caribbePromoBanner')) return;

    const bgClasses = {
      red: 'bg-brandRed text-white',
      navy: 'bg-navy text-white',
      gold: 'bg-brandGold text-navy font-bold',
      emerald: 'bg-emerald-600 text-white'
    };

    const bgClass = bgClasses[config.color] || bgClasses.red;

    const bannerHTML = `
      <div id="caribbePromoBanner" class="${bgClass} py-2.5 px-4 text-center text-xs font-headline font-bold flex justify-center items-center gap-3 shadow-md relative z-[10000] border-b border-white/20 animate-fade-in">
        <span class="material-symbols-outlined text-sm animate-bounce">campaign</span>
        <span>${config.text}</span>
        ${config.buttonText ? `
          <a href="${config.buttonUrl || '#'}" class="ml-2 bg-white text-navy px-3 py-1 rounded-full text-[11px] font-extrabold uppercase hover:bg-slate-100 transition-all shadow-sm">
            ${config.buttonText}
          </a>
        ` : ''}
        <button onclick="document.getElementById('caribbePromoBanner').remove()" class="ml-4 opacity-70 hover:opacity-100">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', bannerHTML);
  }

  document.addEventListener('DOMContentLoaded', applyCmsFrontendSync);

  window.CaribbeCmsSync = {
    apply: applyCmsFrontendSync,
    injectBanner: injectPromoBanner
  };
})();
