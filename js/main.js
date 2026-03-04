// ============================================================
// ToramCodex — main.js
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
      if (q) {
        window.location.href = 'pages/items.html?q=' + encodeURIComponent(q);
      }
    });
  }

  /* ---------- Filter bar (for list pages) ---------- */
  var filterInput   = document.getElementById('filterInput');
  var filterSelect  = document.getElementById('filterSelect');
  var filterSelect2 = document.getElementById('filterSelect2');

  function applyFilter() {
    var query = filterInput   ? filterInput.value.toLowerCase()   : '';
    var cat1  = filterSelect  ? filterSelect.value.toLowerCase()  : '';
    var cat2  = filterSelect2 ? filterSelect2.value.toLowerCase() : '';

    // Query fresh each time so dynamically rendered Sheets content is included.
    document.querySelectorAll('[data-filter]').forEach(function (card) {
      var text  = (card.dataset.filter    || '').toLowerCase();
      var c1    = (card.dataset.category  || '').toLowerCase();
      var c2    = (card.dataset.category2 || '').toLowerCase();

      var matchText = !query || text.includes(query);
      var matchCat1 = !cat1  || c1 === cat1;
      var matchCat2 = !cat2  || c2 === cat2;

      card.style.display = (matchText && matchCat1 && matchCat2) ? '' : 'none';
    });
  }

  if (filterInput)   filterInput.addEventListener('input', applyFilter);
  if (filterSelect)  filterSelect.addEventListener('change', applyFilter);
  if (filterSelect2) filterSelect2.addEventListener('change', applyFilter);

  // Re-apply filters after Google Sheets data has been rendered.
  document.addEventListener('sheetsrendered', applyFilter);

  /* ---------- Pre-fill filter from URL params ---------- */
  var params = new URLSearchParams(window.location.search);
  var qParam = params.get('q');
  if (qParam && filterInput) {
    filterInput.value = qParam;
    applyFilter();
  }

  /* ---------- Active nav link ---------- */
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href.endsWith(currentPage)) {
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
