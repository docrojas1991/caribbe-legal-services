/**
 * Caribbe Legal Services - CMS Frontend Sync Engine (v3.0 - Full Visual Editor)
 * Applies CMS edits saved by the admin panel to the live pages automatically.
 * Data is stored in localStorage under structured keys.
 */

(function () {

  // ─── Page Slug Detection ──────────────────────────────────────────────────
  function getPageSlug() {
    const path = window.location.pathname;
    if (path.includes('qui_nes_somos'))       return 'nosotros';
    if (path.includes('servicios_detallados')) return 'servicios';
    if (path.includes('galer_a_de_fotos'))    return 'galeria';
    if (path.includes('aviso_de_privacidad')) return 'privacidad';
    return 'inicio';
  }

  // ─── Main Sync Function ───────────────────────────────────────────────────
  async function applyCmsFrontendSync() {
    const pageSlug = getPageSlug();

    // Try cloud, fallback to localStorage
    let promoConfig  = null;
    let pageData     = null;
    let themeConfig  = null;
    let faqsConfig   = null;

    if (window.CaribbeFirebase && window.CaribbeFirebase.getCmsData) {
      try {
        promoConfig = await window.CaribbeFirebase.getCmsData('global_promo_banner');
        pageData    = await window.CaribbeFirebase.getCmsData('page_' + pageSlug);
        themeConfig = await window.CaribbeFirebase.getCmsData('global_theme');
        faqsConfig  = await window.CaribbeFirebase.getCmsData('global_faqs');
      } catch(e) {}
    }

    if (!promoConfig) promoConfig = JSON.parse(localStorage.getItem('caribbe_cms_promo_banner') || '{}');
    if (!pageData)    pageData    = JSON.parse(localStorage.getItem('caribbe_cms_page_' + pageSlug) || '{}');
    if (!themeConfig) themeConfig = JSON.parse(localStorage.getItem('caribbe_cms_theme') || '{}');
    if (!faqsConfig)  faqsConfig  = { items: JSON.parse(localStorage.getItem('caribbe_cms_faqs') || '[]') };

    // ── 1. Apply Promo Banner ────────────────────────────────────────────────
    if (promoConfig.active && promoConfig.text) {
      injectPromoBanner(promoConfig);
    }

    // ── 2. Apply Theme (brand colors + font) ─────────────────────────────────
    if (themeConfig.red || themeConfig.navy || themeConfig.gold) {
      const root = document.documentElement;
      if (themeConfig.red)  root.style.setProperty('--brand-red',    themeConfig.red);
      if (themeConfig.gold) root.style.setProperty('--brand-gold',   themeConfig.gold);
      if (themeConfig.navy) root.style.setProperty('--navy-primary',  themeConfig.navy);
      if (themeConfig.font) root.style.setProperty('--font-primary',  themeConfig.font);
    }

    // ── 3. Apply FAQs (homepage only) ────────────────────────────────────────
    if (pageSlug === 'inicio' && faqsConfig.items && faqsConfig.items.length > 0) {
      injectFaqs(faqsConfig.items);
    }

    // ── 4. Apply Page-Specific Content ───────────────────────────────────────
    if (!pageData || Object.keys(pageData).length === 0) return;

    // Hero Title (H1)
    if (pageData.heroTitle) {
      const heroH1 = document.getElementById('cms-hero-title');
      if (heroH1) {
        heroH1.innerHTML = pageData.heroTitle;
      } else {
        // Fallback: first h1 in header
        const h1 = document.querySelector('header h1, header .h1-text');
        if (h1) h1.innerHTML = pageData.heroTitle;
      }
      if (pageData.heroTitleSize)  applyStyle('cms-hero-title',   'fontSize',   pageData.heroTitleSize);
      if (pageData.heroTitleColor) applyStyle('cms-hero-title',   'color',      pageData.heroTitleColor);
      if (pageData.heroTitleFont)  applyStyle('cms-hero-title',   'fontFamily', pageData.heroTitleFont);
    }

    // Hero Subtitle
    if (pageData.heroSubtitle) {
      const subEl = document.getElementById('cms-hero-subtitle');
      if (subEl) subEl.innerHTML = pageData.heroSubtitle;
      if (pageData.heroSubtitleSize)  applyStyle('cms-hero-subtitle', 'fontSize',   pageData.heroSubtitleSize);
      if (pageData.heroSubtitleColor) applyStyle('cms-hero-subtitle', 'color',      pageData.heroSubtitleColor);
    }

    // Hero Description paragraph
    if (pageData.heroDesc) {
      const descEl = document.getElementById('cms-hero-desc');
      if (descEl) descEl.innerHTML = pageData.heroDesc;
    }

    // Hero Background Image
    if (pageData.heroBgImage) {
      const bgImg = document.getElementById('cms-hero-bg-img');
      if (bgImg) bgImg.src = pageData.heroBgImage;
    }

    // Hero Brand Image (main artwork)
    if (pageData.heroBrandImage) {
      const brandImg = document.getElementById('cms-hero-brand-img');
      if (brandImg) brandImg.src = pageData.heroBrandImage;
    }

    // Hero Background Color Overlay
    if (pageData.heroBgColor) {
      const heroEl = document.querySelector('header.hero-section, header[data-cms-hero]');
      if (heroEl) heroEl.style.backgroundColor = pageData.heroBgColor;
    }

    // Hero Background Gradient
    if (pageData.heroBgGradient) {
      const overlayEl = document.getElementById('cms-hero-overlay');
      if (overlayEl) overlayEl.style.background = pageData.heroBgGradient;
    }

    // SEO Meta Tags
    if (pageData.seo) {
      if (pageData.seo.title) document.title = pageData.seo.title;
      updateMeta('description', pageData.seo.description);
      updateMeta('keywords',    pageData.seo.keywords);
    }

    // Prices (Services page uses these CSS-class-based selectors)
    if (pageData.prices) {
      const p = pageData.prices;
      qs('.cms-price-passport').forEach(el => el.textContent = p.passport    || el.textContent);
      qs('.cms-price-notary').forEach(el   => el.textContent = p.notary      || el.textContent);
      qs('.cms-price-air-express').forEach(el => el.textContent = p.airExpress || el.textContent);
      qs('.cms-price-air-misc').forEach(el  => el.textContent = p.airMisc    || el.textContent);
      qs('.cms-price-sea').forEach(el       => el.textContent = p.seaShipping || el.textContent);
      qs('.cms-price-wedding').forEach(el   => el.textContent = p.wedding     || el.textContent);
    }

    // Contact Info
    if (pageData.contact) {
      qs('.cms-phone-1').forEach(el  => el.textContent = pageData.contact.phone1   || el.textContent);
      qs('.cms-phone-2').forEach(el  => el.textContent = pageData.contact.phone2   || el.textContent);
      qs('.cms-address').forEach(el  => el.textContent = pageData.contact.address  || el.textContent);
    }

    // Arbitrary labelled text sections
    if (pageData.sections) {
      Object.entries(pageData.sections).forEach(([id, val]) => {
        const el = document.getElementById(id);
        if (el && val) el.innerHTML = val;
      });
    }

    // Custom CSS overrides from admin
    if (pageData.customCss) {
      let styleTag = document.getElementById('cms-custom-style');
      if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'cms-custom-style';
        document.head.appendChild(styleTag);
      }
      styleTag.textContent = pageData.customCss;
    }
  }

  // ─── Helper Utilities ─────────────────────────────────────────────────────
  function qs(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function applyStyle(id, prop, value) {
    const el = document.getElementById(id);
    if (el && value) el.style[prop] = value;
  }

  function updateMeta(name, content) {
    if (!content) return;
    let meta = document.querySelector(`meta[name="${name}"]`);
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  // ─── Promo Banner Injection ───────────────────────────────────────────────
  function injectPromoBanner(config) {
    if (document.getElementById('caribbePromoBanner')) return;

    const bgClasses = {
      red:     'background: #D62828; color: white;',
      navy:    'background: #0B2C5C; color: white;',
      gold:    'background: #C9A227; color: #0B2C5C; font-weight: 900;',
      emerald: 'background: #059669; color: white;'
    };
    const bg = bgClasses[config.color] || bgClasses.red;

    const bannerHTML = `
      <div id="caribbePromoBanner" style="${bg}" class="py-2.5 px-4 text-center text-xs font-headline font-bold flex justify-center items-center gap-3 shadow-md relative z-[10000] border-b border-white/20">
        <span class="material-symbols-outlined text-sm" style="animation: bounce 1s infinite;">campaign</span>
        <span>${config.text}</span>
        ${config.buttonText ? `
          <a href="${config.buttonUrl || '#'}" class="ml-2 bg-white text-navy px-3 py-1 rounded-full text-[11px] font-extrabold uppercase hover:opacity-90 transition-all shadow-sm" style="color:#0B2C5C;">
            ${config.buttonText}
          </a>
        ` : ''}
        <button onclick="document.getElementById('caribbePromoBanner').remove()" class="ml-4 opacity-70 hover:opacity-100" style="background:none;border:none;cursor:pointer;color:inherit;">
          <span class="material-symbols-outlined text-sm">close</span>
        </button>
      </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', bannerHTML);
  }

  // ─── FAQs Injection ───────────────────────────────────────────────────────
  function injectFaqs(faqs) {
    const container = document.getElementById('publicFaqsContainer');
    if (!container || !faqs.length) return;
    container.innerHTML = '';
    faqs.forEach((faq) => {
      container.innerHTML += `
        <div class="border-b border-slate-200 pb-4">
          <button class="w-full flex justify-between items-center text-left text-navy font-bold hover:text-brandRed transition-colors"
            onclick="this.nextElementSibling.classList.toggle('hidden'); this.querySelector('.faq-icon').textContent = this.nextElementSibling.classList.contains('hidden') ? 'add' : 'remove';">
            <span class="text-sm md:text-base">${faq.q}</span>
            <span class="material-symbols-outlined faq-icon text-brandGold">add</span>
          </button>
          <p class="hidden text-slate-600 text-sm mt-3 leading-relaxed">${faq.a}</p>
        </div>
      `;
    });
  }

  // ─── Live Cross-Tab Sync (BroadcastChannel) ───────────────────────────────
  try {
    const syncCh = new BroadcastChannel('caribbe_sync_channel');
    syncCh.onmessage = function(ev) {
      if (ev.data && ev.data.type === 'CMS_UPDATE') {
        applyCmsFrontendSync();
      }
    };
  } catch(e) {}

  // ─── Init ─────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(applyCmsFrontendSync, 150));
  } else {
    setTimeout(applyCmsFrontendSync, 150);
  }

  window.CaribbeCmsSync = {
    apply:         applyCmsFrontendSync,
    injectBanner:  injectPromoBanner,
    injectFaqs:    injectFaqs,
    getSlug:       getPageSlug
  };
})();
