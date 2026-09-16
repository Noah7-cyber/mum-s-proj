// ===================================================================
// TIKENOD VENTURES — CORE CLIENT APPLICATION
// Dynamic Theme Engine from GInvoice API + Rich Category & Product Images
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Global Store Configuration
  const products = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA : [];
  const storeUrl = (typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.ginvoiceUrl) 
    ? STORE_CONFIG.ginvoiceUrl 
    : 'https://ginvoice.com.ng/c/tikenod-ventures';
  const storePhone = (typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.phone) 
    ? STORE_CONFIG.phone 
    : '2348053472434';

  let currentCategory = 'All';
  let searchQuery = '';
  let sortOption = 'featured';
  let onlyInStock = false;
  let currentPage = 1;
  const itemsPerPage = 24;

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const categoriesGrid = document.getElementById('categories-grid');
  const filterPillsRow = document.getElementById('filter-pills-row');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const inStockCheckbox = document.getElementById('instock-checkbox');
  const resultsCount = document.getElementById('results-count');
  const paginationRow = document.getElementById('pagination-row');

  // ===================================================================
  // 1. DYNAMIC THEME ENGINE (Synced with GInvoice Storefront Settings)
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
      console.log('[Theme Engine] Successfully applied GInvoice brand color:', hexColor);
    } catch (e) {
      console.warn('[Theme Engine] Theme calculation error:', e);
    }
  }

  // Load cached color immediately to prevent flash
  const cachedColor = localStorage.getItem('tikenod_theme_color') || '#e11d48';
  applyStoreTheme(cachedColor);

  // Format Currency (Naira)
  function formatNaira(amount) {
    return '₦' + Number(amount || 0).toLocaleString('en-NG');
  }

  // Toast Notification
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
  // 2. PRODUCT & CATEGORY IMAGE RESOLUTION
  // ===================================================================
  const categoryMetadata = [
    {
      name: 'Zippers & Sliders',
      image: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&auto=format&fit=crop&q=80',
      desc: 'Invisible, rainbow, iron, polo & big-head zippers'
    },
    {
      name: 'Fabrics & Linings',
      image: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?w=600&auto=format&fit=crop&q=80',
      desc: 'Taffeta, bridal dull face, organza, chiffon, net & linings'
    },
    {
      name: 'Laces & Trims',
      image: 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=600&auto=format&fit=crop&q=80',
      desc: 'Chantilly laces, beans lace, fancy trims & borders'
    },
    {
      name: 'Threads & Cones',
      image: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=600&auto=format&fit=crop&q=80',
      desc: '1000m black & white industrial cones, sewing threads'
    },
    {
      name: 'Gums & Interfacings',
      image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=600&auto=format&fit=crop&q=80',
      desc: 'Paper gum, hemming gum, hair stay & garment stabilizers'
    },
    {
      name: 'Buttons & Fasteners',
      image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
      desc: 'Chinese buttons, fancy fasteners, blazer buttons & studs'
    },
    {
      name: 'Packaging & Tools',
      image: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      desc: 'Packaging leather, brown paper, garment bags'
    },
    {
      name: 'Haberdashery & Accessories',
      image: 'https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?w=600&auto=format&fit=crop&q=80',
      desc: 'Bias rolls, measuring tapes, chalk & tailor essentials'
    }
  ];

  function getProductImage(product) {
    const name = (product.name || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();
    const group = product.group || '';

    if (name.includes('zip') || cat.includes('zip') || group === 'Zippers & Sliders') {
      return 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&auto=format&fit=crop&q=80';
    }
    if (name.includes('lace') || cat.includes('lace') || name.includes('trim') || group === 'Laces & Trims') {
      return 'https://images.unsplash.com/photo-1605289982774-9a6fef564df8?w=500&auto=format&fit=crop&q=80';
    }
    if (name.includes('thread') || name.includes('cone') || cat.includes('cone') || group === 'Threads & Cones') {
      return 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500&auto=format&fit=crop&q=80';
    }
    if (name.includes('button') || cat.includes('button') || group === 'Buttons & Fasteners') {
      return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=80';
    }
    if (name.includes('gum') || name.includes('stay') || name.includes('interfacing') || group === 'Gums & Interfacings') {
      return 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=500&auto=format&fit=crop&q=80';
    }
    if (name.includes('leather') || name.includes('paper') || group === 'Packaging & Tools') {
      return 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500&auto=format&fit=crop&q=80';
    }
    if (name.includes('tapeta') || name.includes('taffeta') || name.includes('bridal') || name.includes('dull face') || name.includes('organz') || name.includes('chiffon') || name.includes('net') || name.includes('lining') || group === 'Fabrics & Linings') {
      return 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?w=500&auto=format&fit=crop&q=80';
    }
    return 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80';
  }

  // ===================================================================
  // 3. RENDER CATEGORY QUICK-NAV CARDS WITH IMAGES
  // ===================================================================
  function renderCategoryCards() {
    if (!categoriesGrid) return;

    const counts = {};
    products.forEach(p => {
      counts[p.group] = (counts[p.group] || 0) + 1;
    });

    categoriesGrid.innerHTML = categoryMetadata.map(g => {
      const count = counts[g.name] || 0;
      return `
        <div class="category-card">
          <div class="cat-img-wrap">
            <img src="${g.image}" alt="${g.name}" class="cat-img" loading="lazy" />
            <div class="cat-img-overlay">
              <span class="cat-badge-overlay">${count} items online</span>
            </div>
          </div>
          <div class="cat-body">
            <div>
              <h3 class="cat-name">${g.name}</h3>
              <p style="font-size:0.825rem; color:var(--text-muted); margin-bottom:12px;">${g.desc}</p>
            </div>
            <div class="cat-card-actions">
              <button class="cat-filter-btn" onclick="window.selectCategory('${g.name}')">
                <span>View Products</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
              <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="cat-store-link" title="Open ${g.name} on GInvoice Storefront">
                <span>Order on Store ↗</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ===================================================================
  // 4. RENDER FILTER PILLS
  // ===================================================================
  function renderFilterPills() {
    if (!filterPillsRow) return;
    const categoryList = ['All', 'Zippers & Sliders', 'Fabrics & Linings', 'Laces & Trims', 'Threads & Cones', 'Gums & Interfacings', 'Buttons & Fasteners', 'Packaging & Tools', 'Haberdashery & Accessories'];

    filterPillsRow.innerHTML = categoryList.map(cat => {
      const activeClass = (cat === currentCategory) ? 'active' : '';
      return `<button class="filter-pill ${activeClass}" onclick="window.selectCategory('${cat}')">${cat}</button>`;
    }).join('');
  }

  window.selectCategory = function(cat) {
    currentCategory = cat;
    currentPage = 1;
    renderFilterPills();
    renderProducts();
    const catalogSection = document.getElementById('catalog-section');
    if (catalogSection) {
      catalogSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ===================================================================
  // 5. FILTER AND SORT PRODUCTS
  // ===================================================================
  function getFilteredProducts() {
    return products.filter(p => {
      if (currentCategory !== 'All' && p.group !== currentCategory) {
        return false;
      }
      if (onlyInStock && !p.inStock) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchCat = p.category.toLowerCase().includes(q);
        const matchGroup = p.group.toLowerCase().includes(q);
        if (!matchName && !matchCat && !matchGroup) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortOption === 'price-low') {
        return (a.price || 0) - (b.price || 0);
      } else if (sortOption === 'price-high') {
        return (b.price || 0) - (a.price || 0);
      } else if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      } else if (sortOption === 'stock') {
        return (b.stock || 0) - (a.stock || 0);
      } else {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0);
      }
    });
  }

  // ===================================================================
  // 6. RENDER PRODUCTS GRID WITH IMAGES & DIRECT GINVOICE REDIRECTION
  // ===================================================================
  function renderProducts() {
    if (!productsGrid) return;
    const filtered = getFilteredProducts();
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

    if (currentPage > totalPages) currentPage = 1;

    if (resultsCount) {
      resultsCount.innerHTML = `Showing <strong>${Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} - ${Math.min(currentPage * itemsPerPage, totalCount)}</strong> of <strong>${totalCount}</strong> items`;
    }

    if (totalCount === 0) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: var(--radius-lg); border: 1px solid var(--border);">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted); margin-bottom:12px;">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:6px;">No products found</h3>
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">Try adjusting your search query or reset filters.</p>
          <button class="btn btn-secondary btn-sm" onclick="window.resetFilters()">Reset All Filters</button>
        </div>
      `;
      if (paginationRow) paginationRow.innerHTML = '';
      return;
    }

    const startIdx = (currentPage - 1) * itemsPerPage;
    const pageProducts = filtered.slice(startIdx, startIdx + itemsPerPage);

    productsGrid.innerHTML = pageProducts.map(p => {
      const stockBadge = p.inStock
        ? `<span class="product-badge-stock" style="color:#059669;">• In Stock (${p.stock})</span>`
        : `<span class="product-badge-stock" style="color:#dc2626;">• Pre-order</span>`;

      const unitVariantText = (p.units && p.units.length > 0)
        ? `<span class="unit-variants-hint">Variant: ${p.units[0].name} (${formatNaira(p.units[0].sellingPrice)})</span>`
        : '';

      const waMsg = encodeURIComponent(`Hello Tikenod Ventures! 👋 I saw this item on your website and want to place an order:\n\n• Product: ${p.name}\n• Category: ${p.category}\n• Price: ${formatNaira(p.price)} / ${p.unit || 'Piece'}\n\nPlease confirm availability and delivery options.`);

      const imgUrl = getProductImage(p);

      return `
        <div class="product-card" id="card-${p.id}">
          <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="product-img-wrap" title="Click to order ${escapeHtml(p.name)} on GInvoice">
            <img src="${imgUrl}" alt="${escapeHtml(p.name)}" class="product-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80'" />
            <div class="product-img-overlay">
              <span class="product-badge-group">${p.group}</span>
              ${stockBadge}
            </div>
          </a>

          <div class="product-card-top">
            <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="product-name" title="Order on official GInvoice storefront">
              ${escapeHtml(p.name)}
            </a>
            <div class="product-cat-name">${escapeHtml(p.category)}</div>
          </div>

          <div class="product-pricing-box">
            <div class="price-display">
              <span class="price-amount">${formatNaira(p.price)}</span>
              <span class="price-unit">/ ${p.unit || 'Piece'}</span>
            </div>
            ${unitVariantText}

            <div class="product-card-actions">
              <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" title="Order ${escapeHtml(p.name)} directly on official GInvoice store">
                <span>Order on Store ↗</span>
              </a>
              <a href="https://wa.me/${storePhone}?text=${waMsg}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm" title="Inquire on WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

    renderPagination(totalPages);
  }

  // ===================================================================
  // 7. PAGINATION & FILTERS
  // ===================================================================
  function renderPagination(totalPages) {
    if (!paginationRow) return;
    if (totalPages <= 1) {
      paginationRow.innerHTML = '';
      return;
    }

    let buttonsHtml = `
      <button class="page-btn" onclick="window.changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>
    `;

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttonsHtml += `
        <button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="window.changePage(${i})">${i}</button>
      `;
    }

    buttonsHtml += `
      <button class="page-btn" onclick="window.changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>
    `;

    paginationRow.innerHTML = buttonsHtml;
  }

  window.changePage = function(page) {
    currentPage = page;
    renderProducts();
    const catalogFilter = document.querySelector('.catalog-filter-card');
    if (catalogFilter) {
      catalogFilter.scrollIntoView({ behavior: 'smooth' });
    }
  };

  window.resetFilters = function() {
    currentCategory = 'All';
    searchQuery = '';
    onlyInStock = false;
    sortOption = 'featured';
    if (searchInput) searchInput.value = '';
    if (sortSelect) sortSelect.value = 'featured';
    if (inStockCheckbox) inStockCheckbox.checked = false;
    currentPage = 1;
    renderFilterPills();
    renderProducts();
  };

  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderProducts();
      }, 250);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortOption = e.target.value;
      currentPage = 1;
      renderProducts();
    });
  }

  if (inStockCheckbox) {
    inStockCheckbox.addEventListener('change', (e) => {
      onlyInStock = e.target.checked;
      currentPage = 1;
      renderProducts();
    });
  }

  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuDrawer.classList.toggle('active');
    });
  }

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ===================================================================
  // 8. LIVE SYNC WITH GINVOICE API (THEME COLOR + LIVE STATUS)
  // ===================================================================
  async function syncWithGInvoiceAPI() {
    try {
      const response = await fetch('https://ginvoice.com.ng/api/public/store/tikenod-ventures');
      if (response.ok) {
        const liveData = await response.json();
        
        // 1. Dynamic Brand Color Sync from GInvoice settings!
        if (liveData && liveData.store && liveData.store.theme && liveData.store.theme.primaryColor) {
          const liveColor = liveData.store.theme.primaryColor;
          applyStoreTheme(liveColor);
        }

        // 2. Dynamic Banner Text Sync
        if (liveData && liveData.store && liveData.store.storeSettings) {
          const banner = liveData.store.storeSettings.bannerText;
          if (banner) {
            const noticeEl = document.getElementById('live-store-banner');
            if (noticeEl) noticeEl.textContent = banner;
          }
        }
      }
    } catch (err) {
      console.log('[GInvoice Live Sync] Running in high-speed cached mode:', err.message);
    }
  }

  // Initialize
  renderCategoryCards();
  renderFilterPills();
  renderProducts();
  syncWithGInvoiceAPI();
});
