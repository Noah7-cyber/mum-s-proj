// ===================================================================
// TIKENOD VENTURES — MODERN LANDING PAGE SCRIPT
// Clean, Fast, Responsive • Direct GInvoice Store & Live Portal Mode
// No Cross-Origin Fetch / CORS Errors
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Store Configuration
  const STORE_URL = 'https://ginvoice.com.ng/c/tikenod-ventures';
  const STORE_PHONE = '2348053472434';
  const DEFAULT_THEME_COLOR = '#e11d48'; // Verified Tikenod Ventures Rose Crimson

  // ===================================================================
  // 1. BRAND THEME ENGINE (Matches GInvoice Store Settings)
  // ===================================================================
  function hexToRgb(hex) {
    hex = hex.replace('#', '').trim();
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    if (isNaN(num)) return { r: 225, g: 29, b: 72 };
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function adjustBrightness(r, g, b, factor) {
    const nr = Math.max(0, Math.min(255, Math.round(r * factor)));
    const ng = Math.max(0, Math.min(255, Math.round(g * factor)));
    const nb = Math.max(0, Math.min(255, Math.round(b * factor)));
    return '#' + [nr, ng, nb].map(c => c.toString(16).padStart(2, '0')).join('');
  }

  function applyStoreTheme(hexColor) {
    if (!hexColor || !hexColor.startsWith('#')) return;
    try {
      const { r, g, b } = hexToRgb(hexColor);
      const primaryDark = adjustBrightness(r, g, b, 0.82);
      const primaryLight = `rgba(${r}, ${g}, ${b}, 0.16)`;
      const primarySubtle = `rgba(${r}, ${g}, ${b}, 0.08)`;
      const primaryGradient = `linear-gradient(135deg, ${hexColor} 0%, ${primaryDark} 100%)`;
      const shadowGlow = `0 10px 25px rgba(${r}, ${g}, ${b}, 0.28)`;

      const root = document.documentElement;
      root.style.setProperty('--primary', hexColor);
      root.style.setProperty('--primary-dark', primaryDark);
      root.style.setProperty('--primary-light', primaryLight);
      root.style.setProperty('--primary-subtle', primarySubtle);
      root.style.setProperty('--primary-gradient', primaryGradient);
      root.style.setProperty('--shadow-glow', shadowGlow);

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', hexColor);

      localStorage.setItem('tikenod_theme_color', hexColor);
    } catch (e) {
      console.warn('[Theme Engine] Error applying theme:', e);
    }
  }

  // Initialize theme from storage or default
  const savedColor = localStorage.getItem('tikenod_theme_color') || DEFAULT_THEME_COLOR;
  applyStoreTheme(savedColor);

  // ===================================================================
  // 2. MOBILE DRAWER NAVIGATION
  // ===================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileDrawer) mobileDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileDrawer);
  }

  if (mobileDrawerClose) {
    mobileDrawerClose.addEventListener('click', closeMobileDrawer);
  }

  if (mobileDrawer) {
    mobileDrawer.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) closeMobileDrawer();
    });
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // ===================================================================
  // 3. LIVE STOREFRONT PORTAL (IFRAME CONTROLS)
  // ===================================================================
  const iframe = document.getElementById('ginvoice-store-frame');
  const reloadBtn = document.getElementById('reload-iframe-btn');

  if (reloadBtn && iframe) {
    reloadBtn.addEventListener('click', () => {
      const originalSrc = iframe.src;
      iframe.src = '';
      setTimeout(() => {
        iframe.src = originalSrc;
        showToast('Storefront reloaded');
      }, 150);
    });
  }

  // ===================================================================
  // 4. TOAST NOTIFICATION HELPER
  // ===================================================================
  function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  // ===================================================================
  // 5. SMOOTH SCROLLING FOR INTERNAL ANCHORS
  // ===================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  console.log('TIKENOD VENTURES landing page initialized successfully.');
});
