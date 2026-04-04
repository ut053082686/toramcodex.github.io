// ============================================================
// ToramDB — detail.js
// Handles item/equip detail page with Google Sheets auto-update.
//
// URL params:  ?name=Shadow+Blade  (matches Name column)
//
// GOOGLE SHEETS "ItemDetails" TAB COLUMNS:
//   Name, Icon, Type, Level, ImageURL, SellSpina, SellOther,
//   Stats, Obtain, Recipe
//
// Stats format (semicolon-separated):
//   "Base DEF:150; Guard Recharge:+18%; Guard Power:+46%"
//   Conditional bonuses use ">" prefix:
//   ">With Light Armor: Weapon ATK:+10%; >With Heavy Armor: Aggro:+30%"
//
// Obtain format:
//   "Drop: Ifrit Rex; Quest: Shadow Conspiracy; Shop: Magic Guild"
//
// Recipe format:
//   "Iron Ore x3; Dragon Heart x1; Crystal Thread x2"
// ============================================================

(function () {
  'use strict';

  var params = new URLSearchParams(window.location.search);
  var itemName = params.get('name');
  var sheetsCache = null;

  // ---------- Static sample data (used when Sheets not configured) ---
  var SAMPLE_ITEMS = {
    'Shadow Blade': {
      Name: 'Shadow Blade', Icon: '🗡️', Type: 'One-Hand Sword', Level: '200',
      ImageURL: '', SellSpina: '45,000', SellOther: '',
      Stats: 'ATK:+350;CRIT Rate:+15%;Aspd:+200;STR:+12',
      Obtain: 'Drop: Dark Forest Boss; Quest: Shadow Hunter',
      Recipe: ''
    },
    'Windrunner Bow': {
      Name: 'Windrunner Bow', Icon: '🏹', Type: 'Bow', Level: '220',
      ImageURL: '', SellSpina: '62,000', SellOther: '',
      Stats: 'ATK:+410;AGI:+20;Aspd:+300;CRIT Rate:+8%',
      Obtain: 'Drop: Tempest Eagle (Sky Plateau)',
      Recipe: 'Eagle Feather x5; Wind Stone x3; Iron Ore x10'
    },
    'Arcane Staff': {
      Name: 'Arcane Staff', Icon: '🔮', Type: 'Staff', Level: '230',
      ImageURL: '', SellSpina: '78,000', SellOther: '',
      Stats: 'MATK:+480;INT:+30;MaxMP:+500;CSPD:+200',
      Obtain: 'Craft: Magic Workshop Lv.8',
      Recipe: 'Crystal Core x3; Magic Thread x5; Dragon Heart x1'
    },
    'Sword of Eternal Flame': {
      Name: 'Sword of Eternal Flame', Icon: '🔥', Type: 'Two-Hand Sword', Level: '245',
      ImageURL: '', SellSpina: '???', SellOther: '',
      Stats: 'ATK:+500;Fire Element:+40%;STR:+25;CRIT Rate:+12%;>With Light Armor:Aspd:+15%;>With Heavy Armor:DEF:+100',
      Obtain: 'Drop: Ifrit Rex (Volcano Summit)',
      Recipe: ''
    },
    'Dragon Scale Armor': {
      Name: 'Dragon Scale Armor', Icon: '🛡️', Type: 'Heavy Armor', Level: '215',
      ImageURL: '', SellSpina: '55,000', SellOther: '',
      Stats: 'DEF:+320;HP:+2000;Physical Resistance:+12%;Magic Resistance:+8%;>With Shield:Guard Power:+20%',
      Obtain: 'Drop: Dragon Nest Boss',
      Recipe: 'Dark Scale x5; Dragon Heart x2; Iron Ore x15'
    },
    'Moonstone Ring': {
      Name: 'Moonstone Ring', Icon: '💍', Type: 'Ring', Level: '180',
      ImageURL: '', SellSpina: '50,000', SellOther: '',
      Stats: 'INT:+25;MaxMP:+500;CSPD:+150;Magic Resistance:+5%',
      Obtain: 'Shop: Magic Guild (50,000 Spina)',
      Recipe: ''
    },
    'Ganglef': {
      Name: 'Ganglef', Icon: '🔴', Type: 'Weapon Crysta', Level: '',
      ImageURL: '', SellSpina: '1', SellOther: '',
      Stats: 'ATK:+3%;Aspd:+250',
      Obtain: 'Drop: Ganglef',
      Recipe: '[Ganglef > Giant Moon Crab] [Ganglef > Tyrant Machina > Vulture > Bakuzan]'
    },
    'Iron Ore': {
      Name: 'Iron Ore', Icon: '⛏️', Type: 'Material', Level: '',
      ImageURL: '', SellSpina: '200', SellOther: '',
      Stats: '',
      Obtain: 'Mining: All zones',
      Recipe: ''
    }
  };

  // ---------- Escape HTML -------------------------------------------
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---------- Populate detail card ----------------------------------
  function renderDetail(item) {
    if (!item) {
      document.getElementById('detailName').textContent = 'Item Not Found';
      document.getElementById('statsContent').innerHTML =
        '<p class="text-muted">The item "' + esc(itemName) + '" was not found in the database.</p>';
      return;
    }

    var name  = item['Name']      || '';
    var icon  = item['Icon']      || '🗡️';
    var type  = item['Type']      || '';
    var level = item['Level']     || '';
    var img   = item['ImageURL']  || '';
    var sell  = item['SellSpina'] || '';
    var sell2 = item['SellOther'] || '';
    var stats = item['Stats']     || '';
    var obt   = item['Obtain']    || '';
    var rec   = item['Recipe']    || '';

    var isCrysta = type.toLowerCase().indexOf('crysta') !== -1;
    var materialTypes = ['beast', 'cloth', 'mana', 'wood', 'metal', 'medicine', 'teleport', 'material'];
    var isMaterial = materialTypes.indexOf(type.toLowerCase()) !== -1;

    // Update tab labels
    var tabs = document.querySelectorAll('.detail-tab');
    tabs.forEach(function(t) {
      if (t.dataset.tab === 'stats' && isMaterial) t.textContent = 'Details';
      if (t.dataset.tab === 'recipe') {
        t.textContent = isMaterial ? 'Used For' : (isCrysta ? 'Enhancement Path' : 'Recipe');
      }
    });

    // Page title & breadcrumb
    document.title = esc(name) + ' — ToramDB';
    document.getElementById('breadcrumbName').textContent = name;

    // Header
    document.getElementById('detailName').textContent = name;
    document.getElementById('detailType').textContent = '[' + type + ']' + (level ? ' Lv.' + level : '');

    // Image
    var imageEl = document.getElementById('detailImage');
    if (img) {
      imageEl.innerHTML = '<img src="' + esc(img) + '" alt="' + esc(name) + '" />';
    } else {
      document.getElementById('detailIcon').textContent = icon;
    }

    // Prices
    var pricesEl = document.getElementById('detailPrices');
    pricesEl.innerHTML = '';
    if (sell) {
      pricesEl.innerHTML += '<span class="price-tag spina">Sell: ' + esc(sell) + ' Spina</span>';
    }
    if (sell2) {
      pricesEl.innerHTML += '<span class="price-tag">Sell: ' + esc(sell2) + '</span>';
    }

    // Stats/Effects
    var statsEl = document.getElementById('statsContent');
    if (stats) {
      var html = '';
      var parts = stats.split(';');
      for (var i = 0; i < parts.length; i++) {
        var part = parts[i].trim();
        if (!part) continue;

        // Conditional section header (starts with >)
        if (part.charAt(0) === '>') {
          var colonIdx = part.indexOf(':');
          if (colonIdx > 0) {
            var sectionLabel = part.substring(1, colonIdx).trim();
            var rest = part.substring(colonIdx + 1).trim();
            html += '<div class="stat-section-label">' + esc(sectionLabel) + ':</div>';
            // Parse the stat after the section label
            var subColon = rest.indexOf(':');
            if (subColon > 0) {
              var sn = rest.substring(0, subColon).trim();
              var sv = rest.substring(subColon + 1).trim();
              var cls = sv.charAt(0) === '+' ? ' positive' : sv.charAt(0) === '-' ? ' negative' : '';
              html += '<div class="stat-row" style="padding-left:1rem">' +
                '<span class="stat-name">' + esc(sn) + '</span>' +
                '<span class="stat-value' + cls + '">' + esc(sv) + '</span></div>';
            }
          }
          continue;
        }

        // Regular stat
        var ci = part.indexOf(':');
        if (ci > 0) {
          var sName = part.substring(0, ci).trim();
          var sVal  = part.substring(ci + 1).trim();
          var valCls = sVal.charAt(0) === '+' ? ' positive' : sVal.charAt(0) === '-' ? ' negative' : '';
          html += '<div class="stat-row">' +
            '<span class="stat-name">' + esc(sName) + '</span>' +
            '<span class="stat-value' + valCls + '">' + esc(sVal) + '</span></div>';
        }
      }
      statsEl.innerHTML = html || '<p class="text-muted">No stats available.</p>';
    } else {
      statsEl.innerHTML = '<p class="text-muted">No stats available for this item.</p>';
    }

    // Obtain
    var obtEl = document.getElementById('obtainContent');
    if (obt) {
      var obtHtml = '';
      var obtParts = obt.split(';');
      for (var j = 0; j < obtParts.length; j++) {
        var op = obtParts[j].trim();
        if (!op) continue;
        var obtIcon = '📦';
        var opLow = op.toLowerCase();
        if (opLow.indexOf('drop') === 0) obtIcon = '👾';
        else if (opLow.indexOf('quest') === 0) obtIcon = '📜';
        else if (opLow.indexOf('shop') === 0) obtIcon = '🏪';
        else if (opLow.indexOf('craft') === 0) obtIcon = '⚒️';
        else if (opLow.indexOf('mining') === 0) obtIcon = '⛏️';
        else if (opLow.indexOf('event') === 0) obtIcon = '🎉';

        obtHtml += '<div class="obtain-item">' +
          '<div class="obtain-icon">' + obtIcon + '</div>' +
          '<span>' + esc(op) + '</span></div>';
      }
      obtEl.innerHTML = obtHtml;
    }

    // Recipe / Used For
    var recEl = document.getElementById('recipeContent');
    if (isCrysta && rec) {
      var iconBase = (function() {
        var path = window.location.pathname;
        if (path.indexOf('/pages/') !== -1) return '../img/icons/';
        return 'img/icons/';
      }());

      var renderNode = function(stepName, rank, curName) {
        var isCurrent = stepName.toLowerCase() === curName.toLowerCase();
        var currentClass = isCurrent ? ' active' : '';
        
        var tLow = type.toLowerCase();
        var category = "normal";
        if (tLow.indexOf('weapon') !== -1) category = 'weapon';
        else if (tLow.indexOf('armor') !== -1) category = 'armor';
        else if (tLow.indexOf('special') !== -1) category = 'special';
        else if (tLow.indexOf('additional') !== -1 || tLow.indexOf('ring') !== -1) category = 'add';
        
        var stepIcon = iconBase + 'crysta_' + category + '_' + rank + '.png';
        var errHandler = 'onerror="this.onerror=null;this.src=\'' + iconBase + 'no_image.png\';"';

        return '<div class="enhancement-node' + currentClass + '" onclick="window.location.href=\'detail.html?name=' + encodeURIComponent(stepName) + '\'">' +
          '<div class="enhancement-icon"><img src="' + stepIcon + '" ' + errHandler + ' /></div>' +
          '<div class="enhancement-name">' + esc(stepName) + '</div>' +
          (isCurrent ? '<div class="enhancement-badge">Current</div>' : '') +
          '</div>';
      };

      // DETECTION: Check for square brackets [Path 1] [Path 2] first, then fall back to pipes
      var rawPaths = [];
      var bracketMatches = rec.match(/\[([^\]]+)\]/g);
      
      if (bracketMatches && bracketMatches.length > 1) {
        rawPaths = bracketMatches.map(function(m) {
          return m.replace(/[\[\]]/g, '').trim();
        }).filter(Boolean);
      } else {
        rawPaths = rec.split(/[|｜]/).map(function (s) { return s.trim(); }).filter(Boolean);
      }

      var pathHTML = '<div class="enhancement-tree">';

      if (rawPaths.length > 1) {
        // BRANCHING LOGIC
        // 1. Parse all paths into arrays of steps
        var processedPaths = rawPaths.map(function(p) {
          return p.split(/[>;;]/).map(function(s) { return s.trim(); }).filter(Boolean);
        });

        // 2. Identify common root (assume first item of first path as root candidate)
        var rootName = processedPaths[0][0];
        var allShareRoot = processedPaths.every(function(p) { 
          return p.length > 0 && p[0].toLowerCase() === rootName.toLowerCase(); 
        });

        if (allShareRoot) {
          // Render Shared Root Node
          pathHTML += renderNode(rootName, 'base', name);
          pathHTML += '<div class="enhancement-arrow">↓</div>';
          
          // Remove root from each path for branching display
          processedPaths.forEach(function(p) { p.shift(); });
        }

        // 3. Render Branching Container
        pathHTML += '<div class="enhancement-branches">';
        processedPaths.forEach(function(steps) {
          if (steps.length > 0) {
            pathHTML += '<div class="enhancement-branch">';
            steps.forEach(function(sName, idx) {
              var rank = (idx === steps.length - 1) ? 'max' : 'up';
              // If we didn't have a shared root, the first item of each branch might be 'base'
              if (!allShareRoot && idx === 0) rank = 'base';

              pathHTML += renderNode(sName, rank, name);
              if (idx < steps.length - 1) pathHTML += '<div class="enhancement-arrow">↓</div>';
            });
            pathHTML += '</div>';
          }
        });
        pathHTML += '</div>';
      } else {
        // LINEAR LOGIC
        var steps = rec.split(/[>;|｜]/).map(function (s) { return s.trim(); }).filter(Boolean);
        steps.forEach(function (stepName, idx) {
          var rank = "up";
          if (idx === 0) rank = "base";
          else if (idx === steps.length - 1 && steps.length > 1) rank = "max";
          
          pathHTML += renderNode(stepName, rank, name);
          if (idx < steps.length - 1) pathHTML += '<div class="enhancement-arrow">↓</div>';
        });
      }
      recEl.innerHTML = pathHTML + '</div>';
    } else if (isMaterial) {
      var usedIn = findUsedIn(name);
      if (usedIn.length > 0) {
        var usedHtml = '';
        usedIn.forEach(function (match) {
          usedHtml += '<div class="recipe-item" style="cursor:pointer" onclick="window.location.href=\'detail.html?name=' + encodeURIComponent(match.itemName) + '\'">' +
            '<div class="recipe-icon">⚒️</div>' +
            '<span>' + esc(match.itemName) + ' <small class="text-muted">x' + esc(match.amount) + '</small></span></div>';
        });
        recEl.innerHTML = usedHtml;
      } else {
        recEl.innerHTML = '<p class="text-muted">No usage info.</p>';
      }
    } else if (rec) {
      var recHtml = '';
      var recParts = rec.split(';');
      for (var k = 0; k < recParts.length; k++) {
        var rp = recParts[k].trim();
        if (!rp) continue;
        var rName = rp.replace(/(\s+x\d+.*|:.*)$/i, '').trim();
        recHtml += '<div class="recipe-item" style="cursor:pointer" onclick="window.location.href=\'detail.html?name=' + encodeURIComponent(rName) + '\'">' +
          '<div class="recipe-icon">🧪</div>' +
          '<span>' + esc(rp) + '</span></div>';
      }
      recEl.innerHTML = recHtml;
    }
  }

  function findInCache(name) {
    if (!sheetsCache || !name) return null;
    var search = name.trim().toLowerCase();
    for (var i = 0; i < sheetsCache.length; i++) {
      if ((sheetsCache[i]['Name'] || '').trim().toLowerCase() === search) return sheetsCache[i];
    }
    return null;
  }

  function findUsedIn(materialName) {
    if (!sheetsCache) return [];
    var results = [];
    var search = materialName.toLowerCase();
    for (var i = 0; i < sheetsCache.length; i++) {
      var item = sheetsCache[i];
      var recipe = item['Recipe'] || '';
      if (!recipe) continue;
      recipe.split(';').forEach(function (part) {
        var p = part.trim();
        if (!p) return;
        var ingName = p.replace(/(\s+x\d+.*|:.*)$/i, '').trim();
        var amtMatch = p.match(/(?:x|:\s*)(\d+)/i);
        if (ingName.toLowerCase() === search) {
          results.push({ itemName: item['Name'], amount: amtMatch ? amtMatch[1] : '???' });
        }
      });
    }
    return results;
  }

  // ---------- Tab switching ----------------------------------------
  var tabs = document.querySelectorAll('.detail-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      document.querySelectorAll('.detail-panel').forEach(function (p) {
        p.classList.remove('active');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  // ---------- Favorite toggle --------------------------------------
  var favBtn = document.getElementById('detailFav');
  if (favBtn) {
    favBtn.addEventListener('click', function () {
      this.classList.toggle('active');
      this.textContent = this.classList.contains('active') ? '★' : '☆';
    });
  }

  // ---------- Load data --------------------------------------------
  if (!itemName) {
    renderDetail(null);
  } else if (window.ToramSheets && window.ToramSheets.CONFIG.SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID') {
    // Load from Google Sheets
    var sheetName = window.ToramSheets.CONFIG.SHEETS.itemdetails || 'ItemDetails';
    window.ToramSheets.fetchSheet(sheetName)
      .then(function (csv) {
        var rows = window.ToramSheets.parseCSV(csv);
        sheetsCache = rows;
        var found = null;
        for (var i = 0; i < rows.length; i++) {
          if ((rows[i]['Name'] || '').toLowerCase() === itemName.toLowerCase()) {
            found = rows[i];
            break;
          }
        }
        renderDetail(found);
      })
      .catch(function () {
        // Fallback to sample data
        renderDetail(SAMPLE_ITEMS[itemName] || null);
      });
  } else {
    // Use sample data
    renderDetail(SAMPLE_ITEMS[itemName] || null);
  }
}());
