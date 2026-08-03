/**
 * Caribbe Legal Services - CMS Frontend Sync Engine (v3.1 - Full Live Sync)
 * Applies CMS edits (prices, theme, text, images, contact) saved by the admin panel to all live pages.
 */

(function () {

  function getPageSlug() {
    const path = window.location.pathname;
    if (path.includes('qui_nes_somos'))       return 'nosotros';
    if (path.includes('servicios_detallados')) return 'servicios';
    if (path.includes('galer_a_de_fotos'))    return 'galeria';
    if (path.includes('aviso_de_privacidad')) return 'privacidad';
    return 'inicio';
  }

  function formatPrice(val) {
    if (!val) return '';
    val = String(val).trim();
    if (/^\d+(\.\d+)?$/.test(val)) return '$' + val;
    return val;
  }

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

  async function applyCmsFrontendSync() {
    const pageSlug = getPageSlug();

    // ── 1. Global Promo Banner ───────────────────────────────────────────────
    let promoConfig = JSON.parse(localStorage.getItem('caribbe_cms_promo_banner') || '{}');
    if (promoConfig.active && promoConfig.text) {
      injectPromoBanner(promoConfig);
    }

    // ── 2. Global Theme ──────────────────────────────────────────────────────
    let themeConfig = JSON.parse(localStorage.getItem('caribbe_cms_theme') || '{}');
    if (themeConfig.red || themeConfig.navy || themeConfig.gold) {
      const root = document.documentElement;
      if (themeConfig.red)  root.style.setProperty('--brand-red',    themeConfig.red);
      if (themeConfig.gold) root.style.setProperty('--brand-gold',   themeConfig.gold);
      if (themeConfig.navy) root.style.setProperty('--navy-primary',  themeConfig.navy);
      if (themeConfig.font) root.style.setProperty('--font-primary',  themeConfig.font);
    }

    // ── 3. Global FAQs (Homepage) ────────────────────────────────────────────
    let faqsConfig = { items: JSON.parse(localStorage.getItem('caribbe_cms_faqs') || '[]') };
    if (pageSlug === 'inicio' && faqsConfig.items && faqsConfig.items.length > 0) {
      injectFaqs(faqsConfig.items);
    }

    // ── 4. Global Prices Sync (Applies to ALL pages) ─────────────────────────
    let prices = JSON.parse(localStorage.getItem('caribbe_cms_prices') || '{}');
    // Fallback: check saved page keys if global prices key is missing
    if (!prices.passport) {
      ['servicios', 'inicio', 'nosotros', 'galeria', 'privacidad'].forEach(slug => {
        try {
          const pData = JSON.parse(localStorage.getItem('caribbe_cms_page_' + slug) || '{}');
          if (pData.prices && pData.prices.passport) {
            prices = { ...prices, ...pData.prices };
          }
        } catch(e) {}
      });
    }

    if (prices.passport) {
      const formatted = formatPrice(prices.passport);
      qs('.cms-price-passport').forEach(el => el.textContent = formatted);
    }
    if (prices.notary) {
      const formatted = formatPrice(prices.notary);
      qs('.cms-price-notary').forEach(el => el.textContent = formatted);
    }
    if (prices.airExpress) {
      const formatted = formatPrice(prices.airExpress);
      qs('.cms-price-air-express').forEach(el => el.textContent = formatted);
    }
    if (prices.airMisc) {
      const formatted = formatPrice(prices.airMisc);
      qs('.cms-price-air-misc').forEach(el => el.textContent = formatted);
    }
    if (prices.seaShipping || prices.sea) {
      const formatted = formatPrice(prices.seaShipping || prices.sea);
      qs('.cms-price-sea').forEach(el => el.textContent = formatted);
    }
    if (prices.wedding) {
      const formatted = formatPrice(prices.wedding);
      qs('.cms-price-wedding').forEach(el => el.textContent = formatted);
    }

    // ── 5. Global Contact Info Sync (Applies to ALL pages) ───────────────────
    let contact = JSON.parse(localStorage.getItem('caribbe_cms_contact') || '{}');
    if (!contact.phone1) {
      ['servicios', 'inicio', 'nosotros', 'galeria', 'privacidad'].forEach(slug => {
        try {
          const pData = JSON.parse(localStorage.getItem('caribbe_cms_page_' + slug) || '{}');
          if (pData.contact && pData.contact.phone1) {
            contact = { ...contact, ...pData.contact };
          }
        } catch(e) {}
      });
    }
    if (contact.phone1)  qs('.cms-phone-1').forEach(el => el.textContent = contact.phone1);
    if (contact.phone2)  qs('.cms-phone-2').forEach(el => el.textContent = contact.phone2);
    if (contact.address) qs('.cms-address').forEach(el => el.textContent = contact.address);

    // ── 6. Page-Specific Edits ───────────────────────────────────────────────
    let pageData = JSON.parse(localStorage.getItem('caribbe_cms_page_' + pageSlug) || '{}');
    if (!pageData || Object.keys(pageData).length === 0) return;

    // Hero Title (H1)
    if (pageData.heroTitle) {
      const heroH1 = document.getElementById('cms-hero-title');
      if (heroH1) {
        heroH1.innerHTML = pageData.heroTitle;
      } else {
        const h1 = document.querySelector('header h1, header .h1-text');
        if (h1) h1.innerHTML = pageData.heroTitle;
      }
      if (pageData.heroTitleSize)  applyStyle('cms-hero-title', 'fontSize',   pageData.heroTitleSize);
      if (pageData.heroTitleColor) applyStyle('cms-hero-title', 'color',      pageData.heroTitleColor);
      if (pageData.heroTitleFont)  applyStyle('cms-hero-title', 'fontFamily', pageData.heroTitleFont);
    }

    // Hero Subtitle
    if (pageData.heroSubtitle) {
      const subEl = document.getElementById('cms-hero-subtitle');
      if (subEl) subEl.innerHTML = pageData.heroSubtitle;
      if (pageData.heroSubtitleSize)  applyStyle('cms-hero-subtitle', 'fontSize',   pageData.heroSubtitleSize);
      if (pageData.heroSubtitleColor) applyStyle('cms-hero-subtitle', 'color',      pageData.heroSubtitleColor);
    }

    // Hero Description
    if (pageData.heroDesc) {
      const descEl = document.getElementById('cms-hero-desc');
      if (descEl) descEl.innerHTML = pageData.heroDesc;
    }

    // Hero Background Image
    if (pageData.heroBgImage) {
      const bgImg = document.getElementById('cms-hero-bg-img');
      if (bgImg) bgImg.src = pageData.heroBgImage;
    }

    // Hero Brand Image
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

    // Custom CSS
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

  // Cross-Tab Sync via BroadcastChannel
  try {
    const syncCh = new BroadcastChannel('caribbe_sync_channel');
    syncCh.onmessage = function(ev) {
      if (ev.data && ev.data.type === 'CMS_UPDATE') {
        applyCmsFrontendSync();
      }
    };
  } catch(e) {}

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(applyCmsFrontendSync, 100));
  } else {
    setTimeout(applyCmsFrontendSync, 100);
  }

  window.CaribbeCmsSync = {
    apply:         applyCmsFrontendSync,
    injectBanner:  injectPromoBanner,
    injectFaqs:    injectFaqs,
    getSlug:       getPageSlug
  };
})();
