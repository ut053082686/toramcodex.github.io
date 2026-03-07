// ============================================================
// ToramDB — monster-modal.js
// Popup detail card for Popular Monsters on homepage.
// Include this script + add <div id="monsterModal"></div> to page.
// ============================================================

window.MonsterModal = (function () {
  'use strict';

  // ---------- Sample data (when Sheets not configured) ---------------
  var SAMPLE_MONSTERS = {
    'Ifrit Rex': {
      Name: 'Ifrit Rex', Type: 'Boss', Level: '250',
      Element: 'Fire', HP: '2.4M', Location: 'Volcano Summit',
      ImageURL: '',
      Drop: 'Ifrit Fang x1;Fire Crystal x3;Flame Essence x2;Volcanic Rock x5',
      Description: 'A fearsome dragon boss residing deep within the Volcano Summit. Known for devastating fire attacks and high HP.'
    },
    'Crystal Spider Queen': {
      Name: 'Crystal Spider Queen', Type: 'Boss', Level: '235',
      Element: 'Ice', HP: '1.8M', Location: 'Crystal Cave',
      ImageURL: '',
      Drop: 'Spider Silk x5;Ice Crystal x3;Crystal Thread x2;Frozen Fang x1',
      Description: 'An enormous spider boss lurking in the Crystal Cave. Her ice-based attacks can freeze adventurers solid.'
    },
    'Fenrir Shadow': {
      Name: 'Fenrir Shadow', Type: 'Mini-Boss', Level: '210',
      Element: 'Dark', HP: '900K', Location: 'Frozen Tundra',
      ImageURL: '',
      Drop: 'Shadow Claw x2;Dark Fur x3;Frozen Bone x4',
      Description: 'A swift and deadly wolf that haunts the Frozen Tundra. Its dark element attacks bypass most physical defenses.'
    }
  };

  // ---------- Cache for Sheets data ---------------------------------
  var sheetsCache = null;

  // ---------- HTML escape -------------------------------------------
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---------- Element color class -----------------------------------
  function elemClass(el) {
    var e = (el || '').toLowerCase();
    if (e === 'fire') return 'red';
    if (e === 'ice' || e === 'water') return 'ice';
    if (e === 'wind') return 'wind';
    if (e === 'dark') return 'dark';
    if (e === 'light') return 'light';
    if (e === 'earth') return 'earth';
    return '';
  }

  // ---------- Build modal HTML --------------------------------------
  function buildModalHTML() {
    var container = document.getElementById('monsterModal');
    if (!container) return;
    container.className = 'modal-overlay';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.innerHTML =
      '<div class="modal-body">' +
        '<button class="modal-close" aria-label="Close" id="monModalClose">&times;</button>' +
        '<div class="detail-card">' +
          '<div class="detail-header">' +
            '<div>' +
              '<h2 id="monModalName" style="font-size:1.3rem;font-weight:700;margin:0">Loading…</h2>' +
              '<span class="detail-type" id="monModalType"></span>' +
            '</div>' +
          '</div>' +
          '<div class="detail-image" id="monModalImage">' +
            '<span class="placeholder-icon">👾</span>' +
          '</div>' +
          '<div class="mon-info-bar" id="monModalInfoBar"></div>' +
          '<div class="detail-tabs" role="tablist">' +
            '<button class="detail-tab active" data-tab="mon-info" role="tab">Info</button>' +
            '<button class="detail-tab" data-tab="mon-drops" role="tab">Drops</button>' +
          '</div>' +
          '<div class="detail-panel active" id="panel-mon-info" role="tabpanel">' +
            '<div id="monModalInfo"><div class="skeleton" style="height:100px"></div></div>' +
          '</div>' +
          '<div class="detail-panel" id="panel-mon-drops" role="tabpanel">' +
            '<div id="monModalDrops"><p class="text-muted">No drop info.</p></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Bind close
    document.getElementById('monModalClose').addEventListener('click', close);
    container.addEventListener('click', function (e) {
      if (e.target === container) close();
    });

    // Bind tabs
    container.querySelectorAll('.detail-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        container.querySelectorAll('.detail-tab').forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        container.querySelectorAll('.detail-panel').forEach(function (p) { p.classList.remove('active'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var panel = document.getElementById('panel-' + tab.dataset.tab);
        if (panel) panel.classList.add('active');
      });
    });
  }

  // ---------- Populate modal with monster data ----------------------
  function populate(mon) {
    if (!mon) {
      document.getElementById('monModalName').textContent = 'Monster Not Found';
      document.getElementById('monModalInfo').innerHTML = '<p class="text-muted">Monster not found in database.</p>';
      return;
    }

    var name    = mon['Name']        || '';
    var type    = mon['Type']        || '';
    var level   = mon['Level']       || '';
    var img     = mon['ImageURL']    || '';
    var drop    = mon['Drop']        || '';

    // Column mapping: Monsters sheet vs Homepage sheet
    // Monsters sheet: Element, HP, Location, Drop (direct columns)
    // Homepage sheet: Stats=Element, Source=HP, Description=Location (reused columns)
    var element = mon['Element']  || mon['Stats']       || '';
    var hp      = mon['HP']       || mon['Source']      || '';
    var loc     = mon['Location'] || '';
    var desc    = '';

    // Homepage sheet: Description = Location (no separate Location column)
    if (!loc && mon['Description']) {
      loc = mon['Description'];
    } else if (loc && mon['Description']) {
      desc = mon['Description'];
    }

    // Header
    document.getElementById('monModalName').textContent = name;
    var typeLower = type.toLowerCase();
    var typeClass = typeLower === 'boss' ? 'tag red' : typeLower.indexOf('mini') !== -1 ? 'tag gold' : 'tag';
    document.getElementById('monModalType').innerHTML =
      '<span class="' + typeClass + '" style="font-size:.75rem">' + esc(type) + '</span>' +
      (level ? ' <span class="tag legendary" style="font-size:.75rem">Lv.' + esc(level) + '</span>' : '');

    // Image
    var imageEl = document.getElementById('monModalImage');
    if (img) {
      imageEl.innerHTML = '<img src="' + esc(img) + '" alt="' + esc(name) + '" style="max-width:100%;border-radius:8px" />';
    } else {
      imageEl.innerHTML = '<span class="placeholder-icon" style="font-size:3rem">👾</span>';
    }

    // Info bar (Element + HP)
    var infoBar = document.getElementById('monModalInfoBar');
    var ec = elemClass(element);
    infoBar.innerHTML =
      (element ? '<span class="tag ' + ec + '">' + esc(element) + '</span>' : '') +
      (hp      ? '<span class="tag">HP ' + esc(hp) + '</span>' : '') +
      (level   ? '<span class="tag legendary">Lv.' + esc(level) + '</span>' : '');

    // Info tab
    var infoEl = document.getElementById('monModalInfo');
    var infoHTML = '';

    // Stats table
    infoHTML += '<div class="stat-row"><span class="stat-name">Element</span><span class="stat-value">' + (esc(element) || '—') + '</span></div>';
    infoHTML += '<div class="stat-row"><span class="stat-name">HP</span><span class="stat-value">' + (esc(hp) || '—') + '</span></div>';
    infoHTML += '<div class="stat-row"><span class="stat-name">Level</span><span class="stat-value">' + (esc(level) || '—') + '</span></div>';
    infoHTML += '<div class="stat-row"><span class="stat-name">Type</span><span class="stat-value">' + (esc(type) || '—') + '</span></div>';
    infoHTML += '<div class="stat-row"><span class="stat-name">Location</span><span class="stat-value">' + (esc(loc) || '—') + '</span></div>';

    if (desc) {
      infoHTML += '<div style="margin-top:.75rem;padding:.75rem;background:var(--bg-card);border-radius:8px;font-size:.9rem;color:var(--text-secondary)">' + esc(desc) + '</div>';
    }

    infoEl.innerHTML = infoHTML;

    // Drops tab
    var dropEl = document.getElementById('monModalDrops');
    if (drop) {
      var dropHTML = '';
      drop.split(';').forEach(function (d) {
        d = d.trim();
        if (!d) return;
        dropHTML += '<div class="obtain-item"><div class="obtain-icon">🎁</div><span>' + esc(d) + '</span></div>';
      });
      dropEl.innerHTML = dropHTML;
    } else {
      dropEl.innerHTML = '<p class="text-muted">No drop info available for this monster.</p>';
    }

    // Reset tabs
    var container = document.getElementById('monsterModal');
    container.querySelectorAll('.detail-tab').forEach(function (t, i) {
      t.classList.toggle('active', i === 0);
    });
    container.querySelectorAll('.detail-panel').forEach(function (p, i) {
      p.classList.toggle('active', i === 0);
    });
  }

  // ---------- Open / Close ------------------------------------------
  function open(monsterName) {
    var overlay = document.getElementById('monsterModal');
    if (!overlay) return;
    if (!overlay.querySelector('.modal-body')) buildModalHTML();

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { overlay.classList.add('fade-in'); });

    document.addEventListener('keydown', escHandler);

    // Try Sheets Monsters tab first, then sample
    if (window.ToramSheets && window.ToramSheets.CONFIG.SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID') {
      if (sheetsCache) {
        var found = findInCache(monsterName);
        populate(found || SAMPLE_MONSTERS[monsterName] || null);
      } else {
        var sheetName = window.ToramSheets.CONFIG.SHEETS.monsters || 'Monsters';
        window.ToramSheets.fetchSheet(sheetName)
          .then(function (csv) {
            sheetsCache = window.ToramSheets.parseCSV(csv);
            var found = findInCache(monsterName);
            populate(found || SAMPLE_MONSTERS[monsterName] || null);
          })
          .catch(function () {
            populate(SAMPLE_MONSTERS[monsterName] || null);
          });
      }
    } else {
      populate(SAMPLE_MONSTERS[monsterName] || null);
    }
  }

  function findInCache(name) {
    if (!sheetsCache) return null;
    for (var i = 0; i < sheetsCache.length; i++) {
      if ((sheetsCache[i]['Name'] || '').toLowerCase() === name.toLowerCase()) {
        return sheetsCache[i];
      }
    }
    return null;
  }

  function close() {
    var overlay = document.getElementById('monsterModal');
    if (!overlay) return;
    overlay.classList.remove('fade-in');
    setTimeout(function () {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }, 200);
    document.removeEventListener('keydown', escHandler);
  }

  function escHandler(e) {
    if (e.key === 'Escape') close();
  }

  // ---------- Init ---------------------------------------------------
  if (document.getElementById('monsterModal')) {
    buildModalHTML();
  }

  return { open: open, close: close };
}());
