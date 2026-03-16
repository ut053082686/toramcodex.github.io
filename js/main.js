// ============================================================
// ToramDB — main.js
// ============================================================

(function () {
  'use strict';

  /* ---------- Hamburger / Mobile Menu ---------- */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      this.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      this.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
    });

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Sync search inputs ---------- */
  var searchInputs = document.querySelectorAll('.search-sync');
  searchInputs.forEach(function (input) {
    input.addEventListener('input', function () {
      var val = this.value;
      searchInputs.forEach(function (other) {
        if (other !== input) other.value = val;
      });
    });
  });

  /* ---------- Hero search redirect ---------- */
  var heroSearchForm = document.getElementById('heroSearchForm');
  if (heroSearchForm) {
    heroSearchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = document.getElementById('heroSearchInput').value.trim();
      var cat = document.getElementById('heroSearchCategory');
      var page = cat ? cat.value : 'items';
      if (q) {
        window.location.href = 'pages/' + page + '.html?q=' + encodeURIComponent(q);
      }
    });
  }

  /* ---------- Nav search: Enter to search ---------- */
  var navSearchInput = document.getElementById('navSearchInput');
  if (navSearchInput) {
    navSearchInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var q = navSearchInput.value.trim();
      if (!q) return;
      // On list pages with a filter input, just apply the filter (search-sync already syncs)
      if (filterInput) {
        filterInput.value = q;
        onFilterChange();
        return;
      }
      // On homepage or other pages, redirect to items search
      var isHome = !window.location.pathname.match(/pages\//);
      var base = isHome ? 'pages/' : '';
      window.location.href = base + 'items.html?q=' + encodeURIComponent(q);
    });
  }

  /* ---------- Filter bar (for list pages) ---------- */
  var filterInput   = document.getElementById('filterInput');
  var filterSelect  = document.getElementById('filterSelect');
  var filterSelect2 = document.getElementById('filterSelect2');
  var filterSelect3 = document.getElementById('filterSelect3');

  function applyFilter() {
    var query = filterInput   ? filterInput.value.toLowerCase()   : '';
    var cat1  = filterSelect  ? filterSelect.value.toLowerCase()  : '';
    var cat2  = filterSelect2 ? filterSelect2.value.toLowerCase() : '';
    var cat3  = filterSelect3 ? filterSelect3.value.toLowerCase() : '';

    // Query fresh each time so dynamically rendered Sheets content is included.
    var visible = 0;
    var items = document.querySelectorAll('[data-filter]');
    items.forEach(function (card) {
      // Respect collapsed monster variant rows
      if (card.dataset.monGroup) {
        var gid = card.dataset.monGroup;
        var toggle = document.querySelector('[data-group="' + gid + '"]');
        var groupOpen = toggle && toggle.dataset.open === '1';
        if (!groupOpen) { card.style.display = 'none'; return; }
      }

      var text  = (card.dataset.filter    || '').toLowerCase();
      var c1    = (card.dataset.category  || '').toLowerCase();
      var c2    = (card.dataset.category2 || '').toLowerCase();
      var c3    = (card.dataset.category3 || '').toLowerCase();

      var matchText = !query || text.includes(query);
      var matchCat1 = !cat1  || c1 === cat1;
      
      var matchCat2 = !cat2;
      if (cat2 && c2) {
        var c2Parts = c2.split(';').map(function(s) { return s.trim().toLowerCase(); });
        matchCat2 = c2Parts.indexOf(cat2.toLowerCase()) !== -1;
      }

      var matchCat3 = !cat3;
      if (cat3 && c3) {
        var c3Parts = c3.split(';').map(function(s) { return s.trim().toLowerCase(); });
        matchCat3 = c3Parts.indexOf(cat3.toLowerCase()) !== -1;
      }

      var show = matchText && matchCat1 && matchCat2 && matchCat3;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    // Show/hide empty-state message
    var grid = items.length ? items[0].parentNode : null;
    if (grid) {
      var isTable = grid.tagName === 'TBODY';
      var emptyEl = grid.querySelector('.empty-state');
      if (visible === 0 && items.length && (query || cat1 || cat2 || cat3)) {
        if (!emptyEl) {
          if (isTable) {
            emptyEl = document.createElement('tr');
            emptyEl.className = 'empty-state';
            var cols = grid.closest('table').querySelectorAll('thead th').length || 4;
            emptyEl.innerHTML = '<td colspan="' + cols + '" style="text-align:center;padding:2rem;color:var(--text-secondary)">\uD83D\uDD0D No results found. Try different keywords.</td>';
          } else {
            emptyEl = document.createElement('div');
            emptyEl.className = 'empty-state';
            emptyEl.innerHTML = '<span>\uD83D\uDD0D</span>No results found. Try different keywords.';
          }
          grid.appendChild(emptyEl);
        }
        emptyEl.style.display = '';
      } else if (emptyEl) {
        emptyEl.style.display = 'none';
      }
    }
  }

  if (filterInput)   filterInput.addEventListener('input', onFilterChange);
  if (filterSelect)  filterSelect.addEventListener('change', onFilterChange);
  if (filterSelect2) filterSelect2.addEventListener('change', onFilterChange);
  if (filterSelect3) filterSelect3.addEventListener('change', onFilterChange);

  // Re-apply filters after Google Sheets data has been rendered.
  document.addEventListener('sheetsrendered', function () {
    currentPage = 1;
    applyFilter();
    paginate();
  });

  /* ---------- Pagination ---------- */
  var PAGE_SIZE = 20;
  var currentPage = 1;
  var paginationEl = document.querySelector('.pagination');

  function paginate() {
    if (!paginationEl) return;

    // First remove all pagination hiding so we can count filter-visible items
    document.querySelectorAll('.paginated-hide').forEach(function (el) {
      el.classList.remove('paginated-hide');
    });

    // Gather items not hidden by filter (style.display set by applyFilter)
    var allItems = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
    var visibleItems = allItems.filter(function (el) {
      return el.style.display !== 'none';
    });

    var totalPages = Math.ceil(visibleItems.length / PAGE_SIZE);

    // Hide pagination if not enough items
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      paginationEl.style.display = 'none';
      // Show all visible items (no slicing needed)
      visibleItems.forEach(function (el) { el.classList.remove('paginated-hide'); });
      return;
    }

    // Clamp current page
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    paginationEl.style.display = '';

    // Apply page visibility
    var start = (currentPage - 1) * PAGE_SIZE;
    var end = start + PAGE_SIZE;
    visibleItems.forEach(function (el, i) {
      if (i >= start && i < end) {
        el.classList.remove('paginated-hide');
      } else {
        el.classList.add('paginated-hide');
      }
    });

    // Build page buttons
    renderPageButtons(totalPages);
  }

  function renderPageButtons(totalPages) {
    paginationEl.innerHTML = '';

    // Prev button
    var prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.textContent = '‹';
    prev.disabled = currentPage === 1;
    if (currentPage === 1) prev.style.opacity = '.4';
    prev.addEventListener('click', function () {
      if (currentPage > 1) { currentPage--; paginate(); scrollToContent(); }
    });
    paginationEl.appendChild(prev);

    // Page number buttons (show max 7 with ellipsis)
    var pages = buildPageRange(currentPage, totalPages);
    pages.forEach(function (p) {
      if (p === '…') {
        var dots = document.createElement('span');
        dots.className = 'page-btn';
        dots.textContent = '…';
        dots.style.pointerEvents = 'none';
        dots.style.opacity = '.5';
        paginationEl.appendChild(dots);
      } else {
        var btn = document.createElement('button');
        btn.className = 'page-btn' + (p === currentPage ? ' active' : '');
        btn.textContent = p;
        if (p === currentPage) btn.setAttribute('aria-current', 'page');
        btn.addEventListener('click', (function (pageNum) {
          return function () { currentPage = pageNum; paginate(); scrollToContent(); };
        })(p));
        paginationEl.appendChild(btn);
      }
    });

    // Next button
    var next = document.createElement('button');
    next.className = 'page-btn';
    next.textContent = '›';
    next.disabled = currentPage === totalPages;
    if (currentPage === totalPages) next.style.opacity = '.4';
    next.addEventListener('click', function () {
      if (currentPage < totalPages) { currentPage++; paginate(); scrollToContent(); }
    });
    paginationEl.appendChild(next);
  }

  function buildPageRange(current, total) {
    if (total <= 7) {
      var arr = [];
      for (var i = 1; i <= total; i++) arr.push(i);
      return arr;
    }
    // Always show first, last, current, and neighbors
    var pages = [1];
    if (current > 3) pages.push('…');
    for (var j = Math.max(2, current - 1); j <= Math.min(total - 1, current + 1); j++) {
      pages.push(j);
    }
    if (current < total - 2) pages.push('…');
    pages.push(total);
    return pages;
  }

  function scrollToContent() {
    var target = document.querySelector('.filter-bar') || document.querySelector('.data-grid') || document.querySelector('.table-wrap');
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Reset to page 1 when filters change, then re-paginate
  function onFilterChange() {
    currentPage = 1;
    applyFilter();
    paginate();
  }

  // Initial pagination on page load
  paginate();

  /* ---------- Pre-fill filter from URL params ---------- */
  var params = new URLSearchParams(window.location.search);
  var qParam = params.get('q');
  if (qParam && filterInput) {
    filterInput.value = qParam;
    onFilterChange();
  }

  /* ---------- Active nav link ---------- */
  var activePage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href.endsWith(activePage)) {
      link.classList.add('active');
    }
  });

  /* ---------- Back-to-top ---------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Animate numbers in hero stats ---------- */
  function setupCounters() {
    var statNums = document.querySelectorAll('[data-count]');
    if (statNums.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      statNums.forEach(function (el) { observer.observe(el); });
    }
  }

  setupCounters();

  // Expose globally so sheets.js can re-trigger after loading stats from Sheet
  window.animateCounters = setupCounters;

  function animateCount(el) {
    var target   = parseInt(el.dataset.count, 10);
    var suffix   = el.dataset.suffix || '';
    var duration = 1200;
    var start    = performance.now();

    function step(now) {
      var progress = Math.min((now - start) / duration, 1);
      var eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }
}());
