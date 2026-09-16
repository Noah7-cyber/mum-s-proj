// ===================================================================
// TIKENOD VENTURES — CORE CLIENT APPLICATION
// Seamless Direct-to-Storefront Navigation & Fast Inquiries
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Global State
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

  // 1. Render Category Quick-Nav Cards
  function renderCategoryCards() {
    if (!categoriesGrid) return;

    const groups = [
      { name: 'Zippers & Sliders', icon: 'zap', desc: 'Invisible, rainbow, iron & big-head zippers' },
      { name: 'Fabrics & Linings', icon: 'layers', desc: 'Taffeta, bridal dull face, organza, chiffon' },
      { name: 'Laces & Trims', icon: 'feather', desc: 'Chantilly laces, beans lace, fancy trims' },
      { name: 'Threads & Cones', icon: 'disc', desc: '1000m black & white cones, sewing threads' },
      { name: 'Gums & Interfacings', icon: 'shield', desc: 'Paper gum, hemming gum, hair stay' },
      { name: 'Buttons & Fasteners', icon: 'circle', desc: 'Chinese buttons, fancy fasteners & studs' },
      { name: 'Packaging & Tools', icon: 'package', desc: 'Packaging leather, brown paper, essentials' },
      { name: 'Haberdashery & Accessories', icon: 'grid', desc: 'Bias rolls, measuring tapes, chalk & trims' }
    ];

    const counts = {};
    products.forEach(p => {
      counts[p.group] = (counts[p.group] || 0) + 1;
    });

    categoriesGrid.innerHTML = groups.map(g => {
      const count = counts[g.name] || 0;
      return `
        <div class="category-card">
          <div>
            <div class="cat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
            <h3 class="cat-name">${g.name}</h3>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:8px;">${g.desc}</p>
            <span class="cat-count">${count} items catalogued</span>
          </div>
          <div class="cat-card-actions">
            <button class="cat-filter-btn" onclick="window.selectCategory('${g.name}')">
              <span>View Items</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="cat-store-link" title="Open ${g.name} on GInvoice Storefront">
              <span>Order on Store ↗</span>
            </a>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Render Filter Pills
  function renderFilterPills() {
    if (!filterPillsRow) return;
    const categoryList = ['All', 'Zippers & Sliders', 'Fabrics & Linings', 'Laces & Trims', 'Threads & Cones', 'Gums & Interfacings', 'Buttons & Fasteners', 'Packaging & Tools', 'Haberdashery & Accessories'];

    filterPillsRow.innerHTML = categoryList.map(cat => {
      const activeClass = (cat === currentCategory) ? 'active' : '';
      return `<button class="filter-pill ${activeClass}" onclick="window.selectCategory('${cat}')">${cat}</button>`;
    }).join('');
  }

  // Select Category handler
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

  // 3. Filter and Sort Products
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

  // 4. Render Products Grid & Pagination
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
        ? `<span class="stock-badge in-stock"><span style="font-size:1.1rem; line-height:1;">•</span> In Stock (${p.stock})</span>`
        : `<span class="stock-badge out-of-stock"><span style="font-size:1.1rem; line-height:1;">•</span> Low / Pre-order</span>`;

      const unitVariantText = (p.units && p.units.length > 0)
        ? `<span class="unit-variants-hint">Variant: ${p.units[0].name} (${formatNaira(p.units[0].sellingPrice)})</span>`
        : '';

      const waMsg = encodeURIComponent(`Hello Tikenod Ventures! 👋 I saw this item on your website and want to place an order:\n\n• Product: ${p.name}\n• Category: ${p.category}\n• Price: ${formatNaira(p.price)} / ${p.unit || 'Piece'}\n\nPlease confirm availability and delivery options.`);

      return `
        <div class="product-card" id="card-${p.id}">
          <div class="product-card-top">
            <div class="product-meta-row">
              <span class="product-group-badge">${p.group}</span>
              ${stockBadge}
            </div>
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
              <a href="${storeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" title="Order ${escapeHtml(p.name)} on official GInvoice store">
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

  // 5. Render Pagination
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

  // Search input with debounce
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

  // Sort change
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortOption = e.target.value;
      currentPage = 1;
      renderProducts();
    });
  }

  // In stock toggle
  if (inStockCheckbox) {
    inStockCheckbox.addEventListener('change', (e) => {
      onlyInStock = e.target.checked;
      currentPage = 1;
      renderProducts();
    });
  }

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  if (mobileMenuBtn && mobileMenuDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenuDrawer.classList.toggle('active');
    });
  }

  // Helper: Escape HTML
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Background Live Sync with GInvoice Public API
  async function syncWithGInvoiceAPI() {
    try {
      const response = await fetch('https://ginvoice.com.ng/api/public/store/tikenod-ventures');
      if (response.ok) {
        const liveData = await response.json();
        if (liveData && liveData.store && liveData.store.storeSettings) {
          const banner = liveData.store.storeSettings.bannerText;
          if (banner) {
            const noticeEl = document.getElementById('live-store-banner');
            if (noticeEl) noticeEl.textContent = banner;
          }
        }
      }
    } catch (err) {
      console.log('[GInvoice Live Sync] Running in high-speed local mode:', err.message);
    }
  }

  // Initialize
  renderCategoryCards();
  renderFilterPills();
  renderProducts();
  syncWithGInvoiceAPI();
});
