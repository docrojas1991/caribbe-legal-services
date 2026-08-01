/**
 * Caribbe Legal Services - CMS Frontend Sync Engine (v2.0 - Cloud Connected)
 * Automatically applies CMS edits, promo banners, prices and custom texts to the live pages.
 */

(function () {
  async function applyCmsFrontendSync() {
    // Determine Page Slug
    const path = window.location.pathname;
    let pageSlug = 'inicio';
    if (path.includes('qui_nes_somos')) pageSlug = 'nosotros';
    if (path.includes('servicios_detallados')) pageSlug = 'servicios';
    if (path.includes('galer_a_de_fotos')) pageSlug = 'galeria';
    if (path.includes('aviso_de_privacidad')) pageSlug = 'privacidad';

    // 1. Fetch Cloud Data if Firebase is ready
    let promoConfig = null;
    let pageData = null;
    let themeConfig = null;
    let faqsConfig = null;

    if (window.CaribbeFirebase && window.CaribbeFirebase.getCmsData) {
      promoConfig = await window.CaribbeFirebase.getCmsData('global_promo_banner');
      pageData = await window.CaribbeFirebase.getCmsData('page_' + pageSlug);
      themeConfig = await window.CaribbeFirebase.getCmsData('global_theme');
      faqsConfig = await window.CaribbeFirebase.getCmsData('global_faqs');
    }

    // 2. Fallback to Local Storage if Cloud is empty/unavailable
    if (!promoConfig) promoConfig = JSON.parse(localStorage.getItem('caribbe_cms_promo_banner') || '{}');
    if (!pageData) pageData = JSON.parse(localStorage.getItem('caribbe_cms_page_' + pageSlug) || '{}');
    if (!themeConfig) themeConfig = JSON.parse(localStorage.getItem('caribbe_cms_theme') || '{}');
    if (!faqsConfig) {
      const localFaqs = JSON.parse(localStorage.getItem('caribbe_cms_faqs') || '[]');
      faqsConfig = { items: localFaqs };
    }

    // 3. Apply Promo Banner
    if (promoConfig.active && promoConfig.text) {
      injectPromoBanner(promoConfig);
    }

    // 3.5 Apply Theme Config
    if (themeConfig.red || themeConfig.navy) {
      const root = document.documentElement;
      if (themeConfig.red) root.style.setProperty('--brand-red', themeConfig.red);
      if (themeConfig.gold) root.style.setProperty('--brand-gold', themeConfig.gold);
      if (themeConfig.navy) root.style.setProperty('--navy-primary', themeConfig.navy);
      if (themeConfig.font) root.style.setProperty('--font-primary', themeConfig.font);
    }

    // 3.6 Apply FAQs if on homepage
    if (pageSlug === 'inicio' && faqsConfig.items && faqsConfig.items.length > 0) {
      injectFaqs(faqsConfig.items);
    }

    // 4. Apply Page Specific CMS Edits
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

  function injectFaqs(faqs) {
    const faqContainer = document.getElementById('publicFaqsContainer');
    if (!faqContainer) return;
    faqContainer.innerHTML = '';
    
    faqs.forEach((faq, idx) => {
      faqContainer.innerHTML += `
        <div class="border-b border-slate-200 pb-4">
          <button class="w-full flex justify-between items-center text-left text-navy font-bold hover:text-brandRed transition-colors" onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.icon').textContent = this.nextElementSibling.classList.contains('hidden') ? 'add' : 'remove';">
            <span class="text-sm md:text-base">${faq.q}</span>
            <span class="material-symbols-outlined icon text-brandGold">add</span>
          </button>
          <p class="hidden text-slate-600 text-sm mt-3 leading-relaxed animate-fade-in">${faq.a}</p>
        </div>
      `;
    });
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

  // Use a slight delay to allow Firebase to initialize if loaded concurrently
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(applyCmsFrontendSync, 100);
  });

  window.CaribbeCmsSync = {
    apply: applyCmsFrontendSync,
    injectBanner: injectPromoBanner
  };
})();
