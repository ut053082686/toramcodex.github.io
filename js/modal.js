// ============================================================
// ToramDB — modal.js (Force redeploy)
// Popup detail card for items (no page reload).
// Include this script + add <div id="itemModal"></div> to pages.
// ============================================================

window.ItemModal = (function () {
  'use strict';

  // Helper to format SellOther as "Process : [Amount] [Icon]"
  function formatSellOther(val, iconBase) {
    if (!val) return '';
    var clean = val.trim();
    // Match "3 Mana", "Mana: 3", "Mana 3", "Mana x3"
    var match = clean.match(/^(\d+)\s+([a-zA-Z]+)$/) || clean.match(/^([a-zA-Z]+)\s*[:x]?\s*(\d+)$/);
    if (match) {
      var amount = isNaN(parseInt(match[1])) ? match[2] : match[1];
      var material = isNaN(parseInt(match[1])) ? match[1] : match[2];
      var mLow = material.toLowerCase();
      var mats = ['metal', 'wood', 'cloth', 'mana', 'beast', 'medicine'];
      if (mats.indexOf(mLow) !== -1) {
        var icon = iconBase + mLow + '_ico.png';
        var errHandler = 'onerror="this.onerror=null;this.src=\'img/icons/no_image.png\';this.style.opacity=\'0.6\';"';
        return '<span class="price-tag material">Process : ' + esc(amount) + ' <img src="' + esc(icon) + '" ' + errHandler + ' style="width:16px;height:16px;vertical-align:middle;margin-left:2px" /></span>';
      }
    }
    return '<span class="price-tag">Sell: ' + esc(val) + '</span>';
  }

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

  // Virtual entries for basic materials to prevent "Not Found"
  var BASIC_MATERIALS = {
    'metal': {
      Name: 'Metal (Material Point)', Type: 'Basic Material',
      Icon: 'metal_ico.png',
      Stats: 'Material points used as a fundamental ingredient for crafting equipment at the Blacksmith.',
      Obtain: 'Process [Metal] type equipment using "Process Materials" skill (Alchemy Skills) or discard Metal type items.'
    },
    'wood': {
      Name: 'Wood (Material Point)', Type: 'Basic Material',
      Icon: 'wood_ico.png',
      Stats: 'Material points used as a fundamental ingredient for crafting equipment at the Blacksmith.',
      Obtain: 'Process [Wood] type equipment using "Process Materials" skill or discard Wood type items.'
    },
    'cloth': {
      Name: 'Cloth (Material Point)', Type: 'Basic Material',
      Icon: 'cloth_ico.png',
      Stats: 'Material points used as a fundamental ingredient for crafting equipment at the Blacksmith.',
      Obtain: 'Process [Cloth] type equipment using "Process Materials" skill or discard Cloth type items.'
    },
    'mana': {
      Name: 'Mana (Material Point)', Type: 'Basic Material',
      Icon: 'mana_ico.png',
      Stats: 'Material points heavily used for crafting heavy equipment or magic-related items.',
      Obtain: 'Process [Mana] type items using "Process Materials" skill or discard Mana type items.'
    },
    'beast': {
      Name: 'Beast (Material Point)', Type: 'Basic Material',
      Icon: 'beast_ico.png',
      Stats: 'Material points produced from processing monster skins or body parts.',
      Obtain: 'Process [Beast] type items using "Process Materials" skill or discard Beast type items.'
    },
    'medicine': {
      Name: 'Medicine (Material Point)', Type: 'Basic Material',
      Icon: 'medicine_ico.png',
      Stats: 'Material points used for crafting medicines and various synthetic items.',
      Obtain: 'Process [Medicine] type items using "Process Materials" skill or discard Medicine type items.'
    },
    'fee': {
      Name: 'Spina (Crafting Fee)', Type: 'Currency',
      Icon: '💰',
      Stats: 'Amount of Spina required as a service fee for crafting items at the NPC Blacksmith.',
      Obtain: 'Earn Spina by selling items to NPCs, participating in trade with other players, or completing quests.'
    }
  };

  // ---------- Cache for Sheets data ---------------------------------
  var sheetsCache = null;
  var pendingItemDetailsFetch = null;
  var lastOpenRequestTime = 0;

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

  }

  // ---------- Populate modal with item data -------------------------
  function populate(item) {
    // Reset panels and title to avoid "ghost data"
    document.getElementById('modalName').innerHTML = 'Loading…';
    document.getElementById('modalType').textContent = '';
    document.getElementById('modalStats').innerHTML = '<div class="skeleton" style="height:140px"></div>';
    document.getElementById('modalObtain').innerHTML = '<p class="text-muted">Loading…</p>';
    document.getElementById('modalRecipe').innerHTML = '<p class="text-muted">Loading…</p>';

    if (!item) {
      // If we failed to find the item, use the name passed in the placeholder if possible
      document.getElementById('modalName').textContent = 'Item Not Found';
      document.getElementById('modalStats').innerHTML = '<p class="text-muted">Item not found in database.</p>';
      return;
    }

    var name  = item['Name']      || '';
    var type  = item['Type']      || '';

    // Variant Detector: Find other items with same name but different index
    var variants = [];
    var searchName = name.trim().toLowerCase();
    if (sheetsCache) {
      sheetsCache.forEach(function(row) {
        if ((row['Name'] || '').trim().toLowerCase() === searchName && row._index !== item._index) {
          variants.push(row);
        }
      });
    }

    var nameHTML = esc(name);
    if (variants.length > 0) {
      // Show what version is available (Craft/Drop/etc)
      var vType = variants[0]['Obtain'] || 'Another side';
      var vLabel = vType.toLowerCase().indexOf('craft') !== -1 ? 'Craft' : (vType.toLowerCase().indexOf('drop') !== -1 ? 'Drop' : 'Alt');
      nameHTML += ' <span style="font-size:0.7rem;font-weight:600;color:var(--primary);background:var(--primary-light);padding:2px 8px;border-radius:20px;vertical-align:middle;margin-left:10px;cursor:pointer;border:1px solid var(--primary)" id="variantTrigger">View ' + vLabel + ' Version</span>';
    }
    document.getElementById('modalName').innerHTML = nameHTML;

    // Bind variant trigger
    var vt = document.getElementById('variantTrigger');
    if (vt) {
      vt.addEventListener('click', function() {
        open(name, variants[0]._index);
      });
    }
    var icon  = item['Icon']      || (window.ToramSheets ? window.ToramSheets.resolveIcon(type) : '🗡️');
    var level = item['Level']     || '';
    var lvl   = level && level !== '0' ? ' Lv.' + level : '';
    var img   = item['ImageURL']  || '';
    var sell  = item['SellSpina'] || '';
    var sell2 = item['SellOther'] || '';
    var stats = item['Stats']     || '';
    var obt   = item['Obtain']    || '';
    var rec   = item['Recipe']    || '';

    var msg = (item ? '[' + type + ']' + lvl : itemNotFoundMsg);
    document.getElementById('modalType').textContent = (item ? '[' + type + ']' + lvl : '');

    var modalIconBase = (function () {
      var path = window.location.pathname;
      if (path.indexOf('/pages/') !== -1) return '../img/icons/';
      return 'img/icons/';
    }());

    // Fix: if icon is a local filename (e.g. from BASIC_MATERIALS), prepend base path
    if (typeof icon === 'string' && icon.indexOf('_ico.png') !== -1 && icon.indexOf('/') === -1) {
      icon = modalIconBase + icon;
    }

    // Image
    var imageEl = document.getElementById('modalImage');
    var errHandler = 'onerror="this.onerror=null;this.src=\'img/icons/no_image.png\';this.style.opacity=\'0.6\';"';
    if (img) {
      imageEl.innerHTML = '<img src="' + esc(img) + '" alt="' + esc(name) + '" ' + errHandler + ' />';
    } else {
      // If icon is a path (contains / or .png), render as img, otherwise as text/emoji
      if (typeof icon === 'string' && (icon.indexOf('/') !== -1 || icon.indexOf('.png') !== -1)) {
        imageEl.innerHTML = '<img src="' + esc(icon) + '" alt="' + esc(name) + '" ' + errHandler + ' style="width:100%;height:100%;object-fit:contain;opacity:0.8" />';
      } else {
        imageEl.innerHTML = '<span class="placeholder-icon">' + esc(icon) + '</span>';
      }
    }

    // Prices
    var pricesEl = document.getElementById('modalPrices');
    var pricesHTML = '';
    if (sell) pricesHTML += '<span class="price-tag spina">Sell: ' + esc(sell) + ' Spina</span>';
    if (sell2) pricesHTML += formatSellOther(sell2, modalIconBase);
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
        
        var opLow = op.toLowerCase();
        var obtIcon = '📦';
        var useImage = false;

        if (opLow.indexOf('drop') === 0) {
          obtIcon = modalIconBase + 'monsters_ico.png';
          useImage = true;
        } else if (opLow.indexOf('map') === 0) {
          obtIcon = modalIconBase + 'maps_ico.png';
          useImage = true;
        } else if (opLow.indexOf('quest') === 0) obtIcon = '📜';
        else if (opLow.indexOf('shop') === 0) obtIcon = '🏪';
        else if (opLow.indexOf('craft') === 0) obtIcon = '⚒️';
        else if (opLow.indexOf('smith') === 0) obtIcon = '⚒️';
        else if (opLow.indexOf('npc') === 0) obtIcon = '⚒️';
        else if (opLow.indexOf('mining') === 0) obtIcon = '⛏️';
        else if (opLow.indexOf('event') === 0) obtIcon = '🎉';
        else {
          // Fallback to maps_ico if it looks like a location (no specific keyword prefix)
          obtIcon = modalIconBase + 'maps_ico.png';
          useImage = true;
        }

        var iconContent = useImage 
          ? '<img src="' + esc(obtIcon) + '" alt="" style="width:20px;height:20px;object-fit:contain" ' + errHandler + ' />'
          : esc(obtIcon);

        // Drop: entries are clickable → MonsterModal
        if (opLow.indexOf('drop') === 0) {
          // Extract monster name: "Drop: Monster Name (Location)" → "Monster Name"
          var monName = op.substring(op.indexOf(':') + 1).trim();
          var parenIdx = monName.indexOf('(');
          if (parenIdx > 0) monName = monName.substring(0, parenIdx).trim();
          
          obtHtml += '<div class="obtain-item drop-link" data-obtain-monster="' + esc(monName) + '" style="cursor:pointer">' +
            '<div class="obtain-icon">' + iconContent + '</div>' +
            '<span>' + esc(op) + '</span>' +
            '<span class="drop-arrow">→</span>' +
            '</div>';
        } else {
          obtHtml += '<div class="obtain-item"><div class="obtain-icon">' + iconContent + '</div><span>' + esc(op) + '</span></div>';
        }
      });
      obtEl.innerHTML = obtHtml;

      // Bind click on Drop obtain items → MonsterModal
      obtEl.querySelectorAll('[data-obtain-monster]').forEach(function (el) {
        el.addEventListener('click', function () {
          var monsterName = this.getAttribute('data-obtain-monster');
          if (monsterName && window.MonsterModal) {
            close();
            setTimeout(function () {
              window.MonsterModal.open(monsterName);
            }, 250);
          }
        });
      });
    } else {
      obtEl.innerHTML = '<p class="text-muted">No obtain info available.</p>';
    }

    // Recipe / Used For Tab Logic
    var recEl = document.getElementById('modalRecipe');
    var statsTab = document.querySelector('[data-tab="m-stats"]');
    var obtainTab = document.querySelector('[data-tab="m-obtain"]');
    var recTab   = document.querySelector('[data-tab="m-recipe"]');
    var isCrysta = type.toLowerCase().indexOf('crysta') !== -1;
    
    // Material types that need custom labels
    var materialTypes = ['beast', 'cloth', 'mana', 'wood', 'metal', 'medicine', 'teleport', 'material'];
    var isMaterial = materialTypes.indexOf(type.toLowerCase()) !== -1;

    // Update tab labels based on type
    if (statsTab) statsTab.textContent = isMaterial ? 'Details' : 'Stats/Effects';
    if (obtainTab) obtainTab.textContent = 'Obtain'; // Always Obtain
    if (recTab) {
      recTab.textContent = isMaterial ? 'Used For' : (isCrysta ? 'Enhancement Path' : 'Recipe');
    }

    if (isCrysta && rec) {
      // Enhancement Path: vertical flow with clickable crysta names
      var steps = rec.split(';').map(function (s) { return s.trim(); }).filter(Boolean);
      var pathHTML = '<div class="enhancement-path">';

      steps.forEach(function (stepName, idx) {
        var isCurrent = stepName.toLowerCase() === name.toLowerCase();
        var currentClass = isCurrent ? ' enhancement-current' : '';

        // Resolve icon for this crysta step
        var stepIcon = '';
        if (window.ToramSheets) {
          stepIcon = window.ToramSheets.resolveIcon(type);
        }
        var iconHTML;
        if (!stepIcon) {
          iconHTML = '💎';
        } else if (stepIcon.indexOf('<img') !== -1) {
          iconHTML = stepIcon;
        } else if (stepIcon.match(/\.(png|jpg|gif|svg|webp)/i)) {
          var errHandler = 'onerror="this.onerror=null;this.src=\'img/icons/no_image.png\';this.style.opacity=\'0.6\';"';
          iconHTML = '<img src="' + esc(stepIcon) + '" alt="' + esc(stepName) + '" ' + errHandler + ' />';
        } else {
          iconHTML = esc(stepIcon);
        }

        pathHTML += '<div class="enhancement-step' + currentClass + '"' +
          (isCurrent ? '' : ' data-enhance-name="' + esc(stepName) + '"') +
          ' style="cursor:' + (isCurrent ? 'default' : 'pointer') + '">' +
          '<div class="enhancement-icon">' + iconHTML + '</div>' +
          '<div class="enhancement-name">' + esc(stepName) + '</div>' +
          (isCurrent ? '<div class="enhancement-badge">Current</div>' : '') +
          '</div>';

        if (idx < steps.length - 1) {
          pathHTML += '<div class="enhancement-arrow">↓</div>';
        }
      });

      pathHTML += '</div>';
      recEl.innerHTML = pathHTML;

      recEl.querySelectorAll('[data-enhance-name]').forEach(function (el) {
        el.addEventListener('click', function () {
          var targetName = this.getAttribute('data-enhance-name');
          if (targetName) open(targetName);
        });
      });
    } else if (isMaterial) {
      // Used For: Reverse search in cache
      var usedIn = findUsedIn(name);
      if (usedIn.length > 0) {
        var usedHtml = '';
        usedIn.forEach(function (match) {
          // Smart Icon Lookup for Used For
          var mLow = match.itemName.toLowerCase();
          var mIcon = '⚒️';
          var mUseImg = false;

          if (mLow === 'metal')      { mIcon = modalIconBase + 'metal_ico.png'; mUseImg = true; }
          else if (mLow === 'wood')  { mIcon = modalIconBase + 'wood_ico.png'; mUseImg = true; }
          else if (mLow === 'cloth') { mIcon = modalIconBase + 'cloth_ico.png'; mUseImg = true; }
          else if (mLow === 'mana')  { mIcon = modalIconBase + 'mana_ico.png'; mUseImg = true; }
          else if (mLow === 'beast') { mIcon = modalIconBase + 'beast_ico.png'; mUseImg = true; }
          else if (mLow === 'medicine') { mIcon = modalIconBase + 'medicine_ico.png'; mUseImg = true; }
          else if (mLow === 'fee')   { mIcon = modalIconBase + 'fee_ico.png'; mUseImg = true; }
          else {
             var matchItem = findInCache(match.itemName);
             mIcon = matchItem ? (window.ToramSheets ? window.ToramSheets.resolveIcon(matchItem['Type']) : '⚒️') : '⚒️';
             if (matchItem && matchItem['Icon']) mIcon = matchItem['Icon'];
             if (typeof mIcon === 'string' && (mIcon.indexOf('/') !== -1 || mIcon.indexOf('.png') !== -1)) mUseImg = true;
          }

          var iconDisplay = mUseImg 
            ? '<img src="' + esc(mIcon) + '" ' + errHandler + ' style="width:18px;height:18px;object-fit:contain;vertical-align:middle" />'
            : esc(mIcon);

          usedHtml += '<div class="recipe-item drop-link" data-recipe-item="' + esc(match.itemName) + '" style="cursor:pointer">' +
            '<div class="recipe-icon">' + iconDisplay + '</div>' +
            '<span>' + esc(match.itemName) + ' <small class="text-muted">Requires: x' + esc(match.amount) + '</small></span>' +
            '<span class="drop-arrow">→</span>' +
            '</div>';
        });
        recEl.innerHTML = usedHtml;
        recEl.querySelectorAll('[data-recipe-item]').forEach(function (el) {
          el.addEventListener('click', function () {
            var targetItem = this.getAttribute('data-recipe-item');
            if (targetItem) open(targetItem);
          });
        });
      } else {
        recEl.innerHTML = '<p class="text-muted">No usage info (not found in any recipe).</p>';
      }
    } else if (rec) {
      // Normal Recipe
      var recHtml = '';
      rec.split(';').forEach(function (rp) {
        rp = rp.trim();
        if (!rp) return;
        var itemName = rp.replace(/(\s+x\d+.*|:.*)$/i, '').trim();
        
        // Smart Icon Lookup for Ingredients
        var iLow = itemName.toLowerCase();
        var iIcon = '🧪';
        var iUseImg = false;
        
        if (iLow === 'metal')      { iIcon = modalIconBase + 'metal_ico.png'; iUseImg = true; }
        else if (iLow === 'wood')  { iIcon = modalIconBase + 'wood_ico.png'; iUseImg = true; }
        else if (iLow === 'cloth') { iIcon = modalIconBase + 'cloth_ico.png'; iUseImg = true; }
        else if (iLow === 'mana')  { iIcon = modalIconBase + 'mana_ico.png'; iUseImg = true; }
        else if (iLow === 'beast') { iIcon = modalIconBase + 'beast_ico.png'; iUseImg = true; }
        else if (iLow === 'medicine') { iIcon = modalIconBase + 'medicine_ico.png'; iUseImg = true; }
        else if (iLow === 'fee')   { iIcon = modalIconBase + 'fee_ico.png'; iUseImg = true; }
        else {
          var ingItem = findInCache(itemName);
          iIcon = ingItem ? (window.ToramSheets ? window.ToramSheets.resolveIcon(ingItem['Type']) : '🧪') : '🧪';
          if (ingItem && ingItem['Icon']) iIcon = ingItem['Icon'];
          if (typeof iIcon === 'string' && (iIcon.indexOf('/') !== -1 || iIcon.indexOf('.png') !== -1)) iUseImg = true;
        }

        var iDisplay = iUseImg
          ? '<img src="' + esc(iIcon) + '" ' + errHandler + ' style="width:18px;height:18px;object-fit:contain;vertical-align:middle" />'
          : esc(iIcon);

        recHtml += '<div class="recipe-item drop-link" data-recipe-item="' + esc(itemName) + '" style="cursor:pointer">' +
          '<div class="recipe-icon">' + iDisplay + '</div>' +
          '<span>' + esc(rp) + '</span>' +
          '<span class="drop-arrow">→</span>' +
          '</div>';
      });
      recEl.innerHTML = recHtml;
      recEl.querySelectorAll('[data-recipe-item]').forEach(function (el) {
        el.addEventListener('click', function () {
          var targetItem = this.getAttribute('data-recipe-item');
          if (targetItem) open(targetItem);
        });
      });
    } else {
      recEl.innerHTML = '<p class="text-muted">' + (isCrysta ? 'No enhancement path info available.' : 'No recipe info available.') + '</p>';
    }

    // Reset tabs to first
    var container = document.getElementById('itemModal');
    container.querySelectorAll('.detail-tab').forEach(function (t, i) {
      t.classList.toggle('active', i === 0);
    });
    container.querySelectorAll('.detail-panel').forEach(function (p, i) {
      p.classList.toggle('active', i === 0);
    });

    // Favorites logic removed as per user request (v0.25.0)
  }

  // ---------- Open / Close ------------------------------------------
  function open(itemName, rowIndex) {
    var overlay = document.getElementById('itemModal');
    if (!overlay) return;
    if (!overlay.querySelector('.modal-body')) buildModalHTML();

    var requestTime = Date.now();
    lastOpenRequestTime = requestTime;

    // Show overlay immediately with loading state
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { overlay.classList.add('fade-in'); });

    // Show loading text right away
    document.getElementById('modalName').innerHTML = 'Loading…';
    document.getElementById('modalType').textContent = '';
    document.getElementById('modalStats').innerHTML = '<div class="skeleton" style="height:140px"></div>';

    // Close on Escape
    document.addEventListener('keydown', escHandler);

    // Decision function to find and populate
    var findAndPopulate = function() {
      if (lastOpenRequestTime !== requestTime) return; // Stale request
      
      var found;
      var idx = parseInt(rowIndex, 10);
      var search = (itemName || '').trim().toLowerCase();
      
      if (sheetsCache) {
        if (!isNaN(idx) && sheetsCache[idx] && (sheetsCache[idx]['Name'] || '').trim().toLowerCase() === search) {
          found = sheetsCache[idx];
        } else {
          found = findInCache(itemName);
        }
      }
      
      // If not in cache, check Virtual Basic Materials
      if (!found && BASIC_MATERIALS[search]) {
        found = BASIC_MATERIALS[search];
      }
      
      if (found) {
        populate(found);
      } else {
        populate(SAMPLE_ITEMS[itemName] || null);
      }
    };

    // Try Sheets first
    if (window.ToramSheets && window.ToramSheets.CONFIG.SHEET_ID !== 'YOUR_GOOGLE_SHEET_ID') {
      if (sheetsCache) {
        findAndPopulate();
      } else {
        ensureItemDetailsLoaded(function() {
          findAndPopulate();
        }, 2); // 2 retries
      }
    } else {
      populate(SAMPLE_ITEMS[itemName] || null);
    }
  }

  // Shared fetcher with deduplication and retry
  function ensureItemDetailsLoaded(cb, retries) {
    if (sheetsCache) return cb();
    
    // If a fetch is already in progress, just wait for it
    if (pendingItemDetailsFetch) {
      pendingItemDetailsFetch.then(cb).catch(function() {
        // If it failed, we might still try our own retry logic if needed, 
        // but easier to just let the main one handle it.
        cb(); 
      });
      return;
    }

    var s = window.ToramSheets.CONFIG.SHEETS.itemdetails;
    var sName = (s && s.name) ? s.name : 'ItemDetails';
    var sGid = (s && s.gid) ? s.gid : '';
    pendingItemDetailsFetch = window.ToramSheets.fetchSheet({ name: sName, gid: sGid })
      .then(function (csv) {
        sheetsCache = window.ToramSheets.parseCSV(csv);
        sheetsCache.forEach(function(r, i) { r._index = i; });
        pendingItemDetailsFetch = null;
        cb();
      })
      .catch(function (err) {
        pendingItemDetailsFetch = null;
        if (retries > 0) {
          setTimeout(function() { ensureItemDetailsLoaded(cb, retries - 1); }, 800);
        } else {
          cb();
        }
      })
      .catch(function (err) {
        console.error('ItemModal Details Fetch Error:', err);
        pendingItemDetailsFetch = null;
        cb();
      });
  }

  function findInCache(name) {
    if (!sheetsCache || !name) return null;
    var search = name.trim().toLowerCase();
    for (var i = 0; i < sheetsCache.length; i++) {
      if ((sheetsCache[i]['Name'] || '').trim().toLowerCase() === search) {
        return sheetsCache[i];
      }
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

      // Split ingredients: Item A x5; Item B x2
      var ingredients = recipe.split(';');
      for (var j = 0; j < ingredients.length; j++) {
        var part = ingredients[j].trim();
        if (!part) continue;
        
        // Extract name: "Iron Ore x15" -> "Iron Ore"
        var ingredientName = part.replace(/(\s+x\d+.*|:.*)$/i, '').trim();
        var amountMatched = part.match(/(?:x|:\s*)(\d+)/i);
        var amount = amountMatched ? amountMatched[1] : '???';

        if (ingredientName.toLowerCase() === search) {
          results.push({
            itemName: item['Name'],
            amount: amount
          });
        }
      }
    }
    return results;
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

  function getItem(name, cb) {
    if (!window.ToramSheets || window.ToramSheets.CONFIG.SHEET_ID === 'YOUR_GOOGLE_SHEET_ID') {
      cb(SAMPLE_ITEMS[name] || null);
      return;
    }
    ensureItemDetailsLoaded(function() {
      // Force async to prevent race conditions in UI updates
      setTimeout(function() {
        cb(findInCache(name) || SAMPLE_ITEMS[name] || null);
      }, 0);
    }, 1);
  }

  // ---------- Init: build on DOMContentLoaded -----------------------
  if (document.getElementById('itemModal')) {
    buildModalHTML();
  }

  return { open: open, close: close, getItem: getItem };
}());
