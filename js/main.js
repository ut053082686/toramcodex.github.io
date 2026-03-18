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

  var filteredData = []; // Store filtered array for pagination

  function applyFilter() {
    var query = filterInput   ? filterInput.value.toLowerCase().trim()   : '';
    var cat1  = filterSelect  ? filterSelect.value.toLowerCase()  : '';
    var cat2  = filterSelect2 ? filterSelect2.value.toLowerCase() : '';
    var cat3  = filterSelect3 ? filterSelect3.value.toLowerCase() : '';

    var fullData = (window.ToramSheets && window.ToramSheets.dataState.fullData) || [];
    
    filteredData = fullData.filter(function (row) {
      // 1. Text Search (Name, Type, Rarity, Source, Reward, Description)
      var name    = (row['Name']   || '').toLowerCase();
      var type    = (row['Type']   || '').toLowerCase();
      var rarity  = (row['Rarity'] || '').toLowerCase();
      var source  = (row['Source'] || '').toLowerCase();
      var stats   = (row['Stats']  || '').toLowerCase(); 
      var reward  = (row['Reward'] || '').toLowerCase();
      var desc    = (row['Description'] || '').toLowerCase();
      var chapter = (row['Chapter'] || '').toLowerCase();
      
      var combined = name + ' ' + type + ' ' + rarity + ' ' + source + ' ' + stats + ' ' + reward + ' ' + desc + ' ' + chapter;
      var matchText = !query || combined.indexOf(query) !== -1;

      // 2. Category 1 (Type)
      var c1 = typeToCategory(type);
      var matchCat1 = !cat1 || c1 === cat1;

      // 3. Category 2 (Rarity / Event) - Match semicolon parts
      var matchCat2 = !cat2;
      if (cat2) {
        var rarityLower = rarity.toLowerCase();
        // Check for "Non-Event" or explicit match
        if (cat2 === 'non-event') {
          matchCat2 = rarityLower.indexOf('non event') !== -1 || rarityLower.indexOf('non-event') !== -1;
        } else {
          var rParts = rarityLower.split(';').map(function(s) { return s.trim(); });
          matchCat2 = rParts.indexOf(cat2) !== -1;
        }
      }

      // 4. Category 3 (Source / Drop/Craft) - Using Rarity column per user request
      var matchCat3 = !cat3;
      if (cat3) {
        if (cat3 === 'drop') {
          matchCat3 = rarity.indexOf('drop') !== -1;
        } else if (cat3 === 'craft-npc') {
          matchCat3 = rarity.indexOf('smith') !== -1 || rarity.indexOf('npc') !== -1 || (rarity.indexOf('craft') !== -1 && rarity.indexOf('player') === -1);
        } else if (cat3 === 'craft-player') {
          matchCat3 = rarity.indexOf('player') !== -1;
        }
      }

      return matchText && matchCat1 && matchCat2 && matchCat3;
    });

    console.log('[ToramDB] Filtering complete. Items shown:', filteredData.length);
    renderCurrentView();
  }

  function renderCurrentView() {
    var itemsCount = filteredData.length;
    var containerId = window.ToramSheets.dataState.containerId;
    var container = document.getElementById(containerId);
    if (!container) return;

    // Show/hide empty-state message
    var emptyEl = container.querySelector('.empty-state');
    if (itemsCount === 0 && (window.ToramSheets.dataState.fullData.length > 0)) {
        if (!emptyEl) {
          var isTable = container.tagName === 'TBODY';
          if (isTable) {
            emptyEl = document.createElement('tr');
            emptyEl.className = 'empty-state';
            var cols = container.closest('table').querySelectorAll('thead th').length || 4;
            emptyEl.innerHTML = '<td colspan="' + cols + '" style="text-align:center;padding:2rem;color:var(--text-secondary)">\uD83D\uDD0D No results found. Try different keywords.</td>';
          } else {
            emptyEl = document.createElement('div');
            emptyEl.className = 'empty-state';
            emptyEl.innerHTML = '<span>\uD83D\uDD0D</span>No results found. Try different keywords.';
          }
          container.appendChild(emptyEl);
        }
        emptyEl.style.display = '';
    } else if (emptyEl) {
        emptyEl.style.display = 'none';
    }

    paginate();
  }

  // Helper to normalize types across different pages (Items, Quests, etc.)
  function typeToCategory(type) {
    if (!type) return 'other';
    var t = type.toLowerCase().trim();
    
    // --- Quest Categories ---
    if (t.indexOf('main') !== -1) return 'main';
    if (t.indexOf('side') !== -1) return 'side';
    if (t.indexOf('daily') !== -1) return 'daily';
    if (t.indexOf('event') !== -1) return 'event';

    // --- Item Categories (from sheets.js) ---
    // Weapons
    if (t.indexOf('1h sword') !== -1 || t === '1h') return '1h-sword';
    if (t.indexOf('2h sword') !== -1 || t === '2h') return '2h-sword';
    if (t === 'katana') return 'katana';
    if (t === 'bow') return 'bow';
    if (t === 'bowgun') return 'bowgun';
    if (t === 'staff' || t === 'stf') return 'staff';
    if (t === 'magic device' || t === 'md') return 'md';
    if (t === 'knuckles') return 'knuckles';
    if (t === 'halberd') return 'halberd';
    if (t === 'dagger') return 'dagger';
    if (t === 'arrow') return 'arrow';
    // Defense
    if (t === 'armor' || t.indexOf('armor') !== -1 || t.indexOf('garb') !== -1) return 'armor';
    if (t === 'shield') return 'shield';
    // Accessories
    if (t === 'additional' || t.indexOf('hat') !== -1 || t.indexOf('wing') !== -1) return 'additional';
    if (t === 'special' || t === 'ring' || t.indexOf('charm') !== -1 || t.indexOf('spec') !== -1) return 'special';
    if (t === 'ninjutsu scroll' || t === 'scroll') return 'scroll';
    // Crystas
    if (t.indexOf('crysta') !== -1) {
      if (t.indexOf('weapon') !== -1) return 'crysta-weapon';
      if (t.indexOf('armor') !== -1) return 'crysta-armor';
      if (t.indexOf('additional') !== -1 || t.indexOf('add ') !== -1) return 'crysta-add';
      if (t.indexOf('ring') !== -1 || t.indexOf('special') !== -1) return 'crysta-special';
      return 'crysta-normal';
    }
    // Materials
    if (t === 'material') return 'material';
    if (t === 'consumable') return 'consumable';
    if (t === 'quest item' || t === 'quest') return 'quest';
    
    return t.replace(/\s+/g, '-');
  }

  if (filterInput)   filterInput.addEventListener('input', onFilterChange);
  if (filterSelect)  filterSelect.addEventListener('change', onFilterChange);
  if (filterSelect2) filterSelect2.addEventListener('change', onFilterChange);
  if (filterSelect3) filterSelect3.addEventListener('change', onFilterChange);

  // Re-apply filters after Google Sheets data has been ready.
  document.addEventListener('sheetsdataready', function () {
    currentPage = 1;
    applyFilter();
  });

  /* ---------- Global Boss Link Listener (for Quest cards) ---------- */
  document.addEventListener('click', function (e) {
    var bossLink = e.target.closest('.boss-link');
    if (bossLink && bossLink.dataset.bossName && window.MonsterModal) {
      e.preventDefault();
      window.MonsterModal.open(bossLink.dataset.bossName);
    }
  });

  /* ---------- Initialization ---------- */
  var PAGE_SIZE = 20;
  var currentPage = 1;
  var paginationEl = document.querySelector('.pagination');

  function paginate() {
    var paginationEl = document.querySelector('.pagination');
    if (!paginationEl) return;

    var totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
    console.log(`[ToramDB] Paginating: ${filteredData.length} items, Page ${currentPage}/${totalPages}`);

    // Hide pagination if not enough items
    if (totalPages <= 1) {
      paginationEl.innerHTML = '';
      paginationEl.style.display = 'none';
      // Only render the filtered items (all of them)
      window.ToramSheets.renderData(window.ToramSheets.dataState.pageType, filteredData, window.ToramSheets.dataState.containerId);
      return;
    }

    // Clamp current page
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    paginationEl.style.display = '';

    // Slice and Render ONLY the 20 items for this page
    var start = (currentPage - 1) * PAGE_SIZE;
    var end = start + PAGE_SIZE;
    var pagedSlice = filteredData.slice(start, end);
    
    window.ToramSheets.renderData(window.ToramSheets.dataState.pageType, pagedSlice, window.ToramSheets.dataState.containerId);

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
