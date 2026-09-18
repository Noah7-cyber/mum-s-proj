// ===================================================================
// TIKENOD VENTURES — S-TIER APPLICATION CONTROLLER
// High-Speed Client-Side Catalog (1,730 Products), Spotlight Search,
// Responsive Mobile Drawer, & Frictionless WhatsApp Concierge
// ===================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Safe extraction of dataset from products-data.js
  const allProducts = (typeof PRODUCTS_DATA !== 'undefined') ? PRODUCTS_DATA : [];
  const store = (typeof STORE_CONFIG !== 'undefined') ? STORE_CONFIG : {
    name: "TIKENOD VENTURES",
    phone: "2348053472434",
    ginvoiceUrl: "https://ginvoice.com.ng/c/tikenod-ventures",
    currency: "₦"
  };

  // ===================================================================
  // 1. STICKY HEADER SCROLL STATE
  // ===================================================================
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // ===================================================================
  // 2. LIVE MATERIAL ATELIER (CATALOG ENGINE)
  // ===================================================================
  const catalogState = {
    query: '',
    group: 'all',
    inStockOnly: true,
    sort: 'featured',
    page: 1,
    pageSize: 16
  };

  const searchInput = document.getElementById('catalog-search-field');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const inStockCheck = document.getElementById('instock-only-check');
  const sortSelect = document.getElementById('catalog-sort-select');
  const deptTabsContainer = document.getElementById('department-tabs-container');
  const productsGrid = document.getElementById('products-grid-container');
  const countCurrent = document.getElementById('catalog-count-current');
  const countTotal = document.getElementById('catalog-count-total');
  const activeFilterBadge = document.getElementById('catalog-active-filter-badge');
  const emptyState = document.getElementById('catalog-empty-state');
  const loadMoreRow = document.getElementById('load-more-row');
  const loadMoreBtn = document.getElementById('load-more-btn');

  // Filter & Sort Pipeline
  function filterAndSortProducts() {
    let list = allProducts;

    // Filter by Group
    if (catalogState.group !== 'all') {
      list = list.filter(p => p.group && p.group.toLowerCase() === catalogState.group.toLowerCase());
    }

    // Filter by In-Stock
    if (catalogState.inStockOnly) {
      list = list.filter(p => p.inStock === true || (p.stock && p.stock > 0));
    }

    // Filter by Search Query
    if (catalogState.query.trim().length > 0) {
      const q = catalogState.query.toLowerCase().trim();
      list = list.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const catMatch = p.category && p.category.toLowerCase().includes(q);
        const groupMatch = p.group && p.group.toLowerCase().includes(q);
        return nameMatch || catMatch || groupMatch;
      });
    }

    // Sort
    if (catalogState.sort === 'price-asc') {
      list = list.slice().sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (catalogState.sort === 'price-desc') {
      list = list.slice().sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (catalogState.sort === 'name-asc') {
      list = list.slice().sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return list;
  }

  // Render Product Card HTML
  function createProductCardHTML(item) {
    const isStocked = item.inStock === true || (item.stock && item.stock > 0);
    const formattedPrice = item.price ? `₦${item.price.toLocaleString()}` : 'Contact for Price';
    const unitText = item.unit ? `/ ${item.unit}` : '';
    const stockBadgeHTML = isStocked
      ? `<span class="item-stock-badge in-stock"><span style="width:6px;height:6px;border-radius:50%;background:#059669;display:inline-block;"></span> In Stock</span>`
      : `<span class="item-stock-badge out-stock">&bull; Inquire Stock</span>`;

    // Pre-filled WhatsApp order URL
    const waText = encodeURIComponent(
      `Hello Tikenod Ventures! I would like to order: ${item.name} (${formattedPrice}${unitText ? ' ' + unitText : ''}). Is this available for pickup or dispatch?`
    );
    const waUrl = `https://wa.me/${store.phone}?text=${waText}`;

    return `
      <div class="item-card">
        <div>
          <div class="item-card-header">
            <span class="item-dept-tag">${escapeHTML(item.group || 'Tailoring')}</span>
            ${stockBadgeHTML}
          </div>
          <h4 class="item-name">${escapeHTML(item.name || 'Tailoring Supply')}</h4>
          <div class="item-category-sub">${escapeHTML(item.category || item.group || 'Garment Notion')}</div>
        </div>

        <div>
          <div class="item-pricing-row">
            <span class="item-price-naira">${formattedPrice}</span>
            <span class="item-unit-label">${unitText}</span>
          </div>

          <div class="item-actions-row">
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-wa" title="Order directly on WhatsApp with pre-filled message">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              <span>Order WhatsApp</span>
            </a>
            <a href="${store.ginvoiceUrl}" target="_blank" rel="noopener noreferrer" class="btn-card-store" title="View on GInvoice Storefront">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Render Catalog
  function renderCatalog(append = false) {
    if (!productsGrid) return;

    const filtered = filterAndSortProducts();
    const totalCount = filtered.length;
    const maxVisible = catalogState.page * catalogState.pageSize;
    const visibleList = filtered.slice(0, maxVisible);

    if (countCurrent) countCurrent.textContent = Math.min(visibleList.length, totalCount);
    if (countTotal) countTotal.textContent = totalCount.toLocaleString();

    // Active filter badge
    if (activeFilterBadge) {
      if (catalogState.group !== 'all' || catalogState.query.trim()) {
        const parts = [];
        if (catalogState.group !== 'all') parts.push(`in "${catalogState.group}"`);
        if (catalogState.query.trim()) parts.push(`matching "${catalogState.query.trim()}"`);
        activeFilterBadge.textContent = `(${parts.join(', ')})`;
      } else {
        activeFilterBadge.textContent = '';
      }
    }

    if (totalCount === 0) {
      productsGrid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (loadMoreRow) loadMoreRow.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    if (append) {
      // Append only new chunk
      const startIdx = (catalogState.page - 1) * catalogState.pageSize;
      const newItems = visibleList.slice(startIdx);
      const newHTML = newItems.map(createProductCardHTML).join('');
      productsGrid.insertAdjacentHTML('beforeend', newHTML);
    } else {
      productsGrid.innerHTML = visibleList.map(createProductCardHTML).join('');
    }

    // Toggle Load More Button
    if (loadMoreRow) {
      if (visibleList.length < totalCount) {
        loadMoreRow.style.display = 'block';
        if (loadMoreBtn) {
          const remaining = totalCount - visibleList.length;
          loadMoreBtn.querySelector('span').textContent = `Load More Materials (${remaining} remaining) ↓`;
        }
      } else {
        loadMoreRow.style.display = 'none';
      }
    }
  }

  // Event Listeners for Search Input (Debounced)
  let searchDebounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimer);
      const val = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.classList.toggle('active', val.length > 0);
      }
      searchDebounceTimer = setTimeout(() => {
        catalogState.query = val;
        catalogState.page = 1;
        renderCatalog();
      }, 120);
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchClearBtn.classList.remove('active');
      catalogState.query = '';
      catalogState.page = 1;
      renderCatalog();
      searchInput?.focus();
    });
  }

  // In-Stock Toggle
  if (inStockCheck) {
    inStockCheck.addEventListener('change', (e) => {
      catalogState.inStockOnly = e.target.checked;
      catalogState.page = 1;
      renderCatalog();
    });
  }

  // Sort Select
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      catalogState.sort = e.target.value;
      catalogState.page = 1;
      renderCatalog();
    });
  }

  // Department Tabs Bar
  if (deptTabsContainer) {
    const tabPills = deptTabsContainer.querySelectorAll('.dept-tab-pill');
    tabPills.forEach(pill => {
      pill.addEventListener('click', () => {
        tabPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        catalogState.group = pill.getAttribute('data-group') || 'all';
        catalogState.page = 1;
        renderCatalog();
      });
    });
  }

  // Bento Card Clicking -> Automatically filters catalog and scrolls
  const bentoCards = document.querySelectorAll('.bento-card[data-dept-filter]');
  bentoCards.forEach(card => {
    card.addEventListener('click', () => {
      const targetDept = card.getAttribute('data-dept-filter');
      if (!targetDept) return;

      catalogState.group = targetDept;
      catalogState.page = 1;

      // Update active tab in catalog
      if (deptTabsContainer) {
        const tabPills = deptTabsContainer.querySelectorAll('.dept-tab-pill');
        tabPills.forEach(p => {
          if (p.getAttribute('data-group') === targetDept) {
            p.classList.add('active');
            p.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          } else {
            p.classList.remove('active');
          }
        });
      }

      renderCatalog();

      // Scroll smoothly to catalog section
      const catalogSection = document.getElementById('catalog');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Load More Button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      catalogState.page += 1;
      renderCatalog(true);
    });
  }

  // Initial Catalog Render
  renderCatalog();

  // ===================================================================
  // 3. SPOTLIGHT SEARCH MODAL (CMD+K / SEARCH BUTTON)
  // ===================================================================
  const spotlightModal = document.getElementById('spotlight-modal');
  const spotlightOpenBtn = document.getElementById('spotlight-open-btn');
  const stickySearchBtn = document.getElementById('sticky-search-btn');
  const spotlightCloseBtn = document.getElementById('spotlight-close-btn');
  const spotlightInput = document.getElementById('spotlight-search-input');
  const spotlightResults = document.getElementById('spotlight-results-container');
  const spotlightChips = document.querySelectorAll('.spotlight-chip');

  function openSpotlight() {
    if (!spotlightModal) return;
    spotlightModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      spotlightInput?.focus();
      renderSpotlightResults(spotlightInput?.value || '');
    }, 50);
  }

  function closeSpotlight() {
    if (!spotlightModal) return;
    spotlightModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderSpotlightResults(query) {
    if (!spotlightResults) return;
    const q = query.toLowerCase().trim();

    let matches = allProducts;
    if (q.length > 0) {
      matches = matches.filter(p => {
        const nameMatch = p.name && p.name.toLowerCase().includes(q);
        const groupMatch = p.group && p.group.toLowerCase().includes(q);
        return nameMatch || groupMatch;
      });
    }

    const topMatches = matches.slice(0, 8);

    if (topMatches.length === 0) {
      spotlightResults.innerHTML = `
        <div style="text-align:center; padding: 24px 0; color:var(--ink-muted); font-size:0.9rem;">
          No tailoring supplies found for "<strong>${escapeHTML(query)}</strong>"
        </div>
      `;
      return;
    }

    spotlightResults.innerHTML = topMatches.map(item => {
      const priceText = item.price ? `₦${item.price.toLocaleString()}` : '';
      const unitText = item.unit ? ` / ${item.unit}` : '';
      const waText = encodeURIComponent(`Hello Tikenod! I am inquiring about: ${item.name} (${priceText}${unitText}).`);
      const waUrl = `https://wa.me/${store.phone}?text=${waText}`;

      return `
        <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="spotlight-result-item">
          <div>
            <div class="spotlight-item-name">${escapeHTML(item.name)}</div>
            <div class="spotlight-item-group">${escapeHTML(item.group || 'Tailoring')} &bull; ${item.inStock ? 'In Stock' : 'Inquire Stock'}</div>
          </div>
          <div class="spotlight-item-price">${priceText}</div>
        </a>
      `;
    }).join('');
  }

  if (spotlightOpenBtn) spotlightOpenBtn.addEventListener('click', openSpotlight);
  if (stickySearchBtn) stickySearchBtn.addEventListener('click', openSpotlight);
  if (spotlightCloseBtn) spotlightCloseBtn.addEventListener('click', closeSpotlight);

  if (spotlightModal) {
    spotlightModal.addEventListener('click', (e) => {
      if (e.target === spotlightModal) closeSpotlight();
    });
  }

  // Keyboard shortcut listener: Cmd+K / Ctrl+K / '/'
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (spotlightModal && spotlightModal.classList.contains('active')) {
        closeSpotlight();
      } else {
        openSpotlight();
      }
    } else if (e.key === 'Escape') {
      closeSpotlight();
      closeMobileDrawer();
    }
  });

  if (spotlightInput) {
    spotlightInput.addEventListener('input', (e) => {
      renderSpotlightResults(e.target.value);
    });
  }

  // Quick chips inside spotlight
  spotlightChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query') || '';
      if (spotlightInput) {
        spotlightInput.value = q;
        renderSpotlightResults(q);
        spotlightInput.focus();
      }
    });
  });

  // ===================================================================
  // 4. MOBILE DRAWER NAVIGATION
  // ===================================================================
  const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const mobileDrawerClose = document.getElementById('mobile-drawer-close');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  function openMobileDrawer() {
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (mobileDrawerOverlay) mobileDrawerOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', openMobileDrawer);
  if (mobileDrawerClose) mobileDrawerClose.addEventListener('click', closeMobileDrawer);

  if (mobileDrawerOverlay) {
    mobileDrawerOverlay.addEventListener('click', (e) => {
      if (e.target === mobileDrawerOverlay) closeMobileDrawer();
    });
  }

  mobileNavItems.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // ===================================================================
  // 5. SMOOTH SCROLLING FOR INTERNAL ANCHORS (HEADER OFFSET AWARE)
  // ===================================================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = targetElem.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Helper: HTML Escaper
  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  console.log('TIKENOD VENTURES S-Tier Atelier initialized with', allProducts.length, 'supplies.');
});
