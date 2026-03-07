// ============================================================
// ToramCodex — modal.js
// Popup detail card for items (no page reload).
// Include this script + add <div id="itemModal"></div> to pages.
// ============================================================

window.ItemModal = (function () {
  'use strict';

  // ---------- Sample data (when Sheets not configured) ---------------
  var SAMPLE_ITEMS = {
    'Shadow Blade': {
      Name: 'Shadow Blade', Icon: '🗡️', Type: 'One-Hand Sword', Level: '200',
      ImageURL: '', SellSpina: '45,000', SellOther: '',
      Stats: 'ATK:+350;CRIT Rate:+15%;Aspd:+200;STR:+12',
      Obtain: 'Drop: Dark Forest Boss;Quest: Shadow Hunter', Recipe: ''
    },
    'Windrunner Bow': {
      Name: 'Windrunner Bow', Icon: '🏹', Type: 'Bow', Level: '220',
      ImageURL: '', SellSpina: '62,000', SellOther: '',
      Stats: 'ATK:+410;AGI:+20;Aspd:+300;CRIT Rate:+8%',
      Obtain: 'Drop: Tempest Eagle (Sky Plateau)',
      Recipe: 'Eagle Feather x5;Wind Stone x3;Iron Ore x10'
    },
    'Arcane Staff': {
      Name: 'Arcane Staff', Icon: '🔮', Type: 'Staff', Level: '230',
      ImageURL: '', SellSpina: '78,000', SellOther: '',
      Stats: 'MATK:+480;INT:+30;MaxMP:+500;CSPD:+200',
      Obtain: 'Craft: Magic Workshop Lv.8',
      Recipe: 'Crystal Core x3;Magic Thread x5;Dragon Heart x1'
    },
    'Sword of Eternal Flame': {
      Name: 'Sword of Eternal Flame', Icon: '🔥', Type: 'Two-Hand Sword', Level: '245',
      ImageURL: '', SellSpina: '???', SellOther: '',
      Stats: 'ATK:+500;Fire Element:+40%;STR:+25;CRIT Rate:+12%;>With Light Armor:Aspd:+15%;>With Heavy Armor:DEF:+100',
      Obtain: 'Drop: Ifrit Rex (Volcano Summit)', Recipe: ''
    },
    'Dragon Scale Armor': {
      Name: 'Dragon Scale Armor', Icon: '🛡️', Type: 'Heavy Armor', Level: '215',
      ImageURL: '', SellSpina: '55,000', SellOther: '',
      Stats: 'DEF:+320;HP:+2000;Physical Resistance:+12%;Magic Resistance:+8%;>With Shield:Guard Power:+20%',
      Obtain: 'Drop: Dragon Nest Boss',
      Recipe: 'Dark Scale x5;Dragon Heart x2;Iron Ore x15'
    },
    'Moonstone Ring': {
      Name: 'Moonstone Ring', Icon: '💍', Type: 'Ring', Level: '180',
      ImageURL: '', SellSpina: '50,000', SellOther: '',
      Stats: 'INT:+25;MaxMP:+500;CSPD:+150;Magic Resistance:+5%',
      Obtain: 'Shop: Magic Guild (50,000 Spina)', Recipe: ''
    },
    'Dragon Heart': {
      Name: 'Dragon Heart', Icon: '❤️‍🔥', Type: 'Material', Level: '',
      ImageURL: '', SellSpina: '12,000', SellOther: '',
      Stats: '', Obtain: 'Drop: Any Dragon-type Monster', Recipe: ''
    },
    'Iron Ore': {
      Name: 'Iron Ore', Icon: '⛏️', Type: 'Material', Level: '',
      ImageURL: '', SellSpina: '200', SellOther: '',
      Stats: '', Obtain: 'Mining: All zones', Recipe: ''
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

  // ---------- Build modal HTML --------------------------------------
  function buildModalHTML() {
    var container = document.getElementById('itemModal');
    if (!container) return;
    container.className = 'modal-overlay';
    container.setAttribute('role', 'dialog');
    container.setAttribute('aria-modal', 'true');
    container.innerHTML =
      '<div class="modal-body">' +
        '<button class="modal-close" aria-label="Close" id="modalClose">&times;</button>' +
        '<div class="detail-card">' +
          '<div class="detail-header">' +
            '<div>' +
              '<h2 id="modalName" style="font-size:1.3rem;font-weight:700;margin:0">Loading…</h2>' +
              '<span class="detail-type" id="modalType"></span>' +
            '</div>' +
            '<button class="detail-fav" id="modalFav" aria-label="Favorite">☆</button>' +
          '</div>' +
          '<div class="detail-image" id="modalImage">' +
            '<span class="placeholder-icon" id="modalIcon">🗡️</span>' +
          '</div>' +
          '<div class="detail-prices" id="modalPrices"></div>' +
          '<div class="detail-tabs" role="tablist">' +
            '<button class="detail-tab active" data-tab="m-stats" role="tab">Stats/Effects</button>' +
            '<button class="detail-tab" data-tab="m-obtain" role="tab">Obtain</button>' +
            '<button class="detail-tab" data-tab="m-recipe" role="tab">Recipe</button>' +
          '</div>' +
          '<div class="detail-panel active" id="panel-m-stats" role="tabpanel">' +
            '<div id="modalStats"><div class="skeleton" style="height:140px"></div></div>' +
          '</div>' +
          '<div class="detail-panel" id="panel-m-obtain" role="tabpanel">' +
            '<div id="modalObtain"><p class="text-muted">No obtain info.</p></div>' +
          '</div>' +
          '<div class="detail-panel" id="panel-m-recipe" role="tabpanel">' +
            '<div id="modalRecipe"><p class="text-muted">No recipe info.</p></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Bind close
    document.getElementById('modalClose').addEventListener('click', close);
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

    // Bind fav
    var favBtn = document.getElementById('modalFav');
    favBtn.addEventListener('click', function () {
      this.classList.toggle('active');
      this.textContent = this.classList.contains('active') ? '★' : '☆';
    });
  }

  // ---------- Populate modal with item data -------------------------
  function populate(item) {
    if (!item) {
      document.getElementById('modalName').textContent = 'Item Not Found';
      document.getElementById('modalStats').innerHTML = '<p class="text-muted">Item not found in database.</p>';
      return;
    }

    var name  = item['Name']      || '';
    var type  = item['Type']      || '';
    var icon  = item['Icon']      || (window.ToramSheets ? window.ToramSheets.resolveIcon(type) : '🗡️');
    var level = item['Level']     || '';
    var lvl   = level && level !== '0' ? ' Lv.' + level : '';
    var img   = item['ImageURL']  || '';
    var sell  = item['SellSpina'] || '';
    var sell2 = item['SellOther'] || '';
    var stats = item['Stats']     || '';
    var obt   = item['Obtain']    || '';
    var rec   = item['Recipe']    || '';

    document.getElementById('modalName').textContent = name;
    document.getElementById('modalType').textContent = '[' + type + ']' + lvl;

    // Image
    var imageEl = document.getElementById('modalImage');
    if (img) {
      imageEl.innerHTML = '<img src="' + esc(img) + '" alt="' + esc(name) + '" />';
    } else {
      imageEl.innerHTML = '<span class="placeholder-icon">' + icon + '</span>';
    }

    // Prices
    var pricesEl = document.getElementById('modalPrices');
    var pricesHTML = '';
    if (sell) pricesHTML += '<span class="price-tag spina">Sell: ' + esc(sell) + ' Spina</span>';
    if (sell2) pricesHTML += '<span class="price-tag">Sell: ' + esc(sell2) + '</span>';
    pricesEl.innerHTML = pricesHTML;

    // Stats
    var statsEl = document.getElementById('modalStats');
    if (stats) {
      var html = '';
      stats.split(';').forEach(function (part) {
        part = part.trim();
        if (!part) return;
        if (part.charAt(0) === '>') {
          var ci = part.indexOf(':');
          if (ci > 0) {
            var label = part.substring(1, ci).trim();
            var rest = part.substring(ci + 1).trim();
            html += '<div class="stat-section-label">' + esc(label) + ':</div>';
            var sci = rest.indexOf(':');
            if (sci > 0) {
              var sn = rest.substring(0, sci).trim();
              var sv = rest.substring(sci + 1).trim();
              var cls = sv.charAt(0) === '+' ? ' positive' : sv.charAt(0) === '-' ? ' negative' : '';
              html += '<div class="stat-row" style="padding-left:1rem"><span class="stat-name">' + esc(sn) + '</span><span class="stat-value' + cls + '">' + esc(sv) + '</span></div>';
            }
          }
          return;
        }
        var ci2 = part.indexOf(':');
        if (ci2 > 0) {
          var sName = part.substring(0, ci2).trim();
          var sVal = part.substring(ci2 + 1).trim();
          var valCls = sVal.charAt(0) === '+' ? ' positive' : sVal.charAt(0) === '-' ? ' negative' : '';
          html += '<div class="stat-row"><span class="stat-name">' + esc(sName) + '</span><span class="stat-value' + valCls + '">' + esc(sVal) + '</span></div>';
        }
      });
      statsEl.innerHTML = html || '<p class="text-muted">No stats available.</p>';
    } else {
      statsEl.innerHTML = '<p class="text-muted">No stats available for this item.</p>';
    }

    // Obtain
    var obtEl = document.getElementById('modalObtain');
    if (obt) {
      var obtHtml = '';
      obt.split(';').forEach(function (op) {
        op = op.trim();
        if (!op) return;
        var obtIcon = '📦';
        var opLow = op.toLowerCase();
        if (opLow.indexOf('drop') === 0) obtIcon = '👾';
        else if (opLow.indexOf('quest') === 0) obtIcon = '📜';
        else if (opLow.indexOf('shop') === 0) obtIcon = '🏪';
        else if (opLow.indexOf('craft') === 0) obtIcon = '⚒️';
        else if (opLow.indexOf('mining') === 0) obtIcon = '⛏️';
        else if (opLow.indexOf('event') === 0) obtIcon = '🎉';
        obtHtml += '<div class="obtain-item"><div class="obtain-icon">' + obtIcon + '</div><span>' + esc(op) + '</span></div>';
      });
      obtEl.innerHTML = obtHtml;
    } else {
      obtEl.innerHTML = '<p class="text-muted">No obtain info available.</p>';
    }

    // Recipe
    var recEl = document.getElementById('modalRecipe');
    if (rec) {
      var recHtml = '';
      rec.split(';').forEach(function (rp) {
        rp = rp.trim();
        if (!rp) return;
        recHtml += '<div class="recipe-item"><div class="recipe-icon">🧪</div><span>' + esc(rp) + '</span></div>';
      });
      recEl.innerHTML = recHtml;
    } else {
      recEl.innerHTML = '<p class="text-muted">No recipe info available.</p>';
    }

    // Reset tabs to first
    var container = document.getElementById('itemModal');
    container.querySelectorAll('.detail-tab').forEach(function (t, i) {
      t.classList.toggle('active', i === 0);
    });
    container.querySelectorAll('.detail-panel').forEach(function (p, i) {
      p.classList.toggle('active', i === 0);
    });

    // Reset fav
    var fav = document.getElementById('modalFav');
    fav.classList.remove('active');
    fav.textContent = '☆';
  }

  // ---------- Open / Close ------------------------------------------
  function open(itemName) {
    var overlay = document.getElementById('itemModal');
    if (!overlay) return;
    if (!overlay.querySelector('.modal-body')) buildModalHTML();

    // Show overlay immediately with loading
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { overlay.classList.add('fade-in'); });

    // Close on Escape
    document.addEventListener('keydown', escHandler);

    // Try Sheets first, then sample
    if (window.ToramSheets && window.ToramSheets.CONFIG.SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID') {
      if (sheetsCache) {
        var found = findInCache(itemName);
        populate(found);
      } else {
        var sheetName = window.ToramSheets.CONFIG.SHEETS.itemdetails || 'ItemDetails';
        window.ToramSheets.fetchSheet(sheetName)
          .then(function (csv) {
            sheetsCache = window.ToramSheets.parseCSV(csv);
            populate(findInCache(itemName));
          })
          .catch(function () {
            populate(SAMPLE_ITEMS[itemName] || null);
          });
      }
    } else {
      populate(SAMPLE_ITEMS[itemName] || null);
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
    var overlay = document.getElementById('itemModal');
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

  // ---------- Init: build on DOMContentLoaded -----------------------
  if (document.getElementById('itemModal')) {
    buildModalHTML();
  }

  return { open: open, close: close };
}());
