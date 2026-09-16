// ===================================================================
// TIKENOD VENTURES - CORE INTERACTIVE APPLICATION
// Powered by GInvoice Market OS (ginvoice.com.ng)
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Global State
  let products = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA : [];
  let currentCategory = 'All';
  let searchQuery = '';
  let sortOption = 'featured';
  let onlyInStock = false;
  let currentPage = 1;
  const itemsPerPage = 24;

  // Cart State (stored in localStorage)
  let cart = JSON.parse(localStorage.getItem('tikenod_cart') || '[]');

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const categoriesGrid = document.getElementById('categories-grid');
  const filterPillsRow = document.getElementById('filter-pills-row');
  const searchInput = document.getElementById('search-input');
  const sortSelect = document.getElementById('sort-select');
  const inStockCheckbox = document.getElementById('instock-checkbox');
  const resultsCount = document.getElementById('results-count');
  const paginationRow = document.getElementById('pagination-row');
  
  // Cart DOM Elements
  const cartNavBtn = document.getElementById('cart-nav-btn');
  const floatingCartBtn = document.getElementById('floating-cart-btn');
  const cartBadge = document.getElementById('cart-badge');
  const floatingCartBadge = document.getElementById('floating-cart-badge');
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartCloseBtn = document.getElementById('cart-close-btn');
  const cartItemsList = document.getElementById('cart-items-list');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartWhatsappBtn = document.getElementById('cart-whatsapp-btn');
  const customerNameInput = document.getElementById('customer-name-input');
  const customerNoteInput = document.getElementById('customer-note-input');
  const clearCartBtn = document.getElementById('clear-cart-btn');

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
    
    // Group definitions with friendly icons and counts
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
        <div class="category-card" onclick="window.selectCategory('${g.name}')">
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
            <span class="cat-count">${count} items available</span>
          </div>
          <div class="cat-link-label">
            <span>Explore Category</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
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
      // Category filter
      if (currentCategory !== 'All' && p.group !== currentCategory) {
        return false;
      }
      // In stock filter
      if (onlyInStock && !p.inStock) {
        return false;
      }
      // Search query
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
        // Featured
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

    // Results count
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
          <p style="color:var(--text-muted); font-size:0.9rem; margin-bottom:16px;">Try adjusting your search terms or filter settings.</p>
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

      return `
        <div class="product-card" id="card-${p.id}">
          <div class="product-card-top">
            <div class="product-meta-row">
              <span class="product-group-badge">${p.group}</span>
              ${stockBadge}
            </div>
            <h4 class="product-name">${escapeHtml(p.name)}</h4>
            <div class="product-cat-name">${escapeHtml(p.category)}</div>
          </div>

          <div class="product-pricing-box">
            <div class="price-display">
              <span class="price-amount">${formatNaira(p.price)}</span>
              <span class="price-unit">/ ${p.unit || 'Piece'}</span>
            </div>
            ${unitVariantText}

            <div class="product-card-actions">
              <a href="https://ginvoice.com.ng/c/tikenod-ventures" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" title="Direct order on official GInvoice storefront">
                <span>Order on GInvoice</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="7" y1="17" x2="17" y2="7"></line>
                  <polyline points="7 7 17 7 17 17"></polyline>
                </svg>
              </a>
              <button class="btn btn-secondary btn-sm" onclick="window.addToCart('${p.id}')" title="Add to your custom order bag">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>+ Bag</span>
              </button>
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

    // Max 5 page pills
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

  // 6. Cart / Order Bag Functions
  window.addToCart = function(productId) {
    const item = products.find(p => p.id === productId);
    if (!item) return;

    const existing = cart.find(ci => ci.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        unit: item.unit,
        category: item.category,
        quantity: 1
      });
    }
    saveCart();
    showToast(`Added "${item.name}" to Order Bag`);
  };

  window.updateCartQty = function(productId, delta) {
    const item = cart.find(ci => ci.id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(ci => ci.id !== productId);
    }
    saveCart();
  };

  window.removeFromCart = function(productId) {
    cart = cart.filter(ci => ci.id !== productId);
    saveCart();
  };

  function saveCart() {
    localStorage.setItem('tikenod_cart', JSON.stringify(cart));
    updateCartUI();
  }

  function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartBadge) cartBadge.textContent = totalItems;
    if (floatingCartBadge) floatingCartBadge.textContent = totalItems;
    if (cartSubtotal) cartSubtotal.textContent = formatNaira(subtotal);

    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="empty-cart-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <h4 style="font-weight:700; margin-bottom:4px; color:var(--dark);">Your order bag is empty</h4>
          <p style="font-size:0.85rem;">Browse products and add tailoring supplies to send via WhatsApp or order on GInvoice.</p>
        </div>
      `;
      if (cartWhatsappBtn) {
        cartWhatsappBtn.disabled = true;
        cartWhatsappBtn.style.opacity = '0.5';
      }
      return;
    }

    if (cartWhatsappBtn) {
      cartWhatsappBtn.disabled = false;
      cartWhatsappBtn.style.opacity = '1';
    }

    cartItemsList.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h5>${escapeHtml(item.name)}</h5>
          <span>${formatNaira(item.price)} / ${item.unit || 'Piece'}</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn" onclick="window.updateCartQty('${item.id}', -1)" aria-label="Decrease quantity">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button class="qty-btn" onclick="window.updateCartQty('${item.id}', 1)" aria-label="Increase quantity">+</button>
          <button class="qty-btn" style="color:#ef4444;" onclick="window.removeFromCart('${item.id}')" aria-label="Remove item">✕</button>
        </div>
      </div>
    `).join('');
  }

  // WhatsApp Order Submission
  if (cartWhatsappBtn) {
    cartWhatsappBtn.addEventListener('click', () => {
      if (cart.length === 0) return;

      const customerName = (customerNameInput && customerNameInput.value.trim()) || 'Valued Customer';
      const customerNote = (customerNoteInput && customerNoteInput.value.trim()) || 'Barnawa Store Pickup / Kaduna Delivery';
      const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      let msg = `*NEW ORDER FOR TIKENOD VENTURES* ✂️🧵\n`;
      msg += `===============================\n`;
      msg += `👤 *Customer Name:* ${customerName}\n`;
      msg += `📍 *Delivery/Pickup:* ${customerNote}\n\n`;
      msg += `*ORDER ITEMS:*\n`;

      cart.forEach((item, idx) => {
        const itemTotal = item.price * item.quantity;
        msg += `${idx + 1}. ${item.name} x${item.quantity} ${item.unit || 'pc'} - ${formatNaira(itemTotal)}\n`;
      });

      msg += `\n*ESTIMATED TOTAL:* ${formatNaira(subtotal)}\n`;
      msg += `===============================\n`;
      msg += `Ordered via Tikenod Ventures Landing Page (Powered by GInvoice Market OS)`;

      const phone = (typeof STORE_CONFIG !== 'undefined' && STORE_CONFIG.phone) ? STORE_CONFIG.phone : '2348053472434';
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Clear all items from your order bag?')) {
        cart = [];
        saveCart();
      }
    });
  }

  // Cart Drawer Toggles
  function openCart() {
    if (cartDrawer) cartDrawer.classList.add('active');
    if (cartBackdrop) cartBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (cartBackdrop) cartBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (cartNavBtn) cartNavBtn.addEventListener('click', openCart);
  if (floatingCartBtn) floatingCartBtn.addEventListener('click', openCart);
  if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
  if (cartBackdrop) cartBackdrop.addEventListener('click', closeCart);

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

  // Attempt Live Sync with GInvoice Public API in Background
  async function syncWithGInvoiceAPI() {
    try {
      const response = await fetch('https://ginvoice.com.ng/api/public/store/tikenod-ventures');
      if (response.ok) {
        const liveData = await response.json();
        if (liveData && liveData.products && liveData.products.length > 0) {
          console.log('[GInvoice Live Sync] Loaded ' + liveData.products.length + ' products from live API');
          // Update live store status or banner if available
          if (liveData.store && liveData.store.storeSettings) {
            const banner = liveData.store.storeSettings.bannerText;
            if (banner) {
              const noticeEl = document.getElementById('live-store-banner');
              if (noticeEl) noticeEl.textContent = banner;
            }
          }
        }
      }
    } catch (err) {
      // Graceful offline fallback
      console.log('[GInvoice Live Sync] Running in fast bundled mode:', err.message);
    }
  }

  // Initialize
  renderCategoryCards();
  renderFilterPills();
  renderProducts();
  updateCartUI();
  syncWithGInvoiceAPI();
});
