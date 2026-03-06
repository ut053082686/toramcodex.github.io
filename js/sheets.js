// ============================================================
// ToramCodex — Google Sheets integration (js/sheets.js)
//
// HOW TO SET UP:
//  1. Open your Google Sheet.
//  2. File > Share > Publish to web > choose "Entire Document"
//     and format "Comma-separated values (.csv)", then click Publish.
//  3. Copy the Spreadsheet ID from the URL:
//     https://docs.google.com/spreadsheets/d/  <SHEET_ID>  /edit
//  4. Paste it as the value of SHEET_ID below.
//  5. Create sheet tabs with these names:
//     Items | ItemDetails | Monsters | Skills | Maps | Quests | Pets | Homepage
//
// EXPECTED COLUMN HEADERS (row 1 of each sheet):
//
//  Items       : Name, Icon, ImageURL, Type, Level, Stats, Rarity, Source
//  ItemDetails : Name, Icon, Type, Level, ImageURL, SellSpina, SellOther,
//                Stats, Obtain, Recipe
//                (Stats format: "ATK:+350;CRIT Rate:+15%;>With Light Armor:Aspd:+15%")
//                (Obtain format: "Drop: Monster Name;Quest: Quest Name")
//                (Recipe format: "Iron Ore x3;Dragon Heart x1")
//  Monsters    : Name, Icon, ImageURL, Level, Difficulty, Type, Element, HP, Location, Drop
//  Skills      : Name, Icon, ImageURL, Type, Category, Damage, MP Cost, Description
//  Maps        : Name, Icon, ImageURL, Zone, LevelRange, Boss, Description
//  Quests      : Name, Icon, ImageURL, Type, MinLevel, Reward, Description
//  Pets        : Name, Icon, ImageURL, Element, Level, SpawnAt
//  Homepage    : Section, Name, Icon, ImageURL, Link, Count, Description,
//                Type, Level, Rarity, Stats, Source
//
// HOMEPAGE — Section values:
//  'category'  → Category card (Name, Icon, ImageURL, Link, Count)
//  'featured'  → Spotlight item (Name, Icon, ImageURL, Type, Level, Rarity,
//                Stats, Description, Link)
//  'stat'      → Hero counter  (Name = label, Count = number, Icon = suffix e.g. "+")
//
// ICON vs ImageURL (they serve DIFFERENT purposes):
//  • Icon column     → small icon on the card/list view (emoji or text).
//  • ImageURL column → large item image shown in the detail modal popup.
//
// CARD ICON PRIORITY:
//  1. Icon column       → shows the emoji/text from Sheet
//  2. Auto-detect       → picks icon based on Type column
//                          (e.g. "Bow" → bow_ico.png, "Staff" → stf_ico.png)
//  3. Fallback          → 1h_ico.png (default)
//
// MODAL IMAGE:
//  1. ImageURL column   → shows as the large item image
//  2. If empty          → shows Icon emoji or auto-detect as placeholder
//
// All Icon / ImageURL columns are OPTIONAL. If left empty, the system
// automatically selects the best icon. You only need to fill in Name + Type
// at minimum.
// ============================================================

window.ToramSheets = (function () {
  'use strict';

  // ---- CONFIGURATION ------------------------------------------------
  var CONFIG = {
    // Replace with your Google Sheets document ID.
    // Leave as 'YOUR_GOOGLE_SHEET_ID' to keep the built-in static data.
    SHEET_ID: '1Zmk6AHYjoBTo_Ius90Ves6sTb_weTVcBPmc7r4269Zo',

    // Sheet tab names (must match the tab names in your Google Sheet).
    SHEETS: {
      items:       'Items',
      itemdetails: 'ItemDetails',
      monsters:    'Monsters',
      skills:      'Skills',
      maps:        'Maps',
      quests:      'Quests',
      pets:        'Pets',
      homepage:    'Homepage'
    }
  };

  // ---- CSV FETCH ----------------------------------------------------
  function fetchSheet(sheetName) {
    var url =
      'https://docs.google.com/spreadsheets/d/' + CONFIG.SHEET_ID +
      '/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent(sheetName);
    return fetch(url).then(function (res) {
      if (!res.ok) { throw new Error('HTTP ' + res.status); }
      return res.text();
    });
  }

  // ---- CSV PARSER ---------------------------------------------------
  // Handles quoted fields (including embedded commas and escaped quotes).
  function parseCSV(text) {
    var lines   = text.trim().split('\n');
    var headers = splitRow(lines[0]);
    return lines.slice(1).filter(Boolean).map(function (line) {
      var vals = splitRow(line);
      var obj  = {};
      headers.forEach(function (h, i) {
        obj[h.trim()] = (vals[i] || '').trim();
      });
      return obj;
    });
  }

  function splitRow(row) {
    var result = [], cur = '', inQ = false;
    for (var i = 0; i < row.length; i++) {
      var ch = row[i];
      if (ch === '"') {
        if (inQ && row[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        result.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    result.push(cur);
    return result;
  }

  // ---- HTML ESCAPE --------------------------------------------------
  function esc(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---- ICON BASE PATH -----------------------------------------------
  // Detect base path: pages are under /pages/, root is /
  var ICON_BASE = (function () {
    var path = window.location.pathname;
    // If we're in /pages/*.html, go up one level
    if (path.indexOf('/pages/') !== -1) return '../img/icons/';
    return 'img/icons/';
  }());

  // ---- TYPE → DEFAULT ICON MAP ------------------------------------
  // Toram Online equipment / category types → icon image or emoji.
  // Values starting with 'img/' are auto-resolved via ICON_BASE.
  var TYPE_ICONS = {
    // Weapons
    '1-handed sword': 'img/icons/1h_ico.png',
    'one-hand sword':  'img/icons/1h_ico.png',
    '1 handed sword': 'img/icons/1h_ico.png',
    '2-handed sword': 'img/icons/2h_ico.png',
    'two-hand sword':  'img/icons/2h_ico.png',
    '2 handed sword': 'img/icons/2h_ico.png',
    'bow':            'img/icons/bow_ico.png',
    'bowgun':         'img/icons/bwg_ico.png',
    'knuckles':       'img/icons/knu_ico.png',
    'magic device':   'img/icons/md_ico.png',
    'staff':          'img/icons/stf_ico.png',
    'halberd':        'img/icons/hb_ico.png',
    'katana':         'img/icons/ktn_ico.png',
    'dagger':         'img/icons/dagger_ico.png',
    'arrow':          'img/icons/arrow_ico.png',
    // Defense
    'shield':         'img/icons/shield_ico.png',
    'armor':          'img/icons/armor_ico.png',
    'heavy armor':    'img/icons/armor_ico.png',
    'light armor':    'img/icons/armor_ico.png',
    // Accessories & other
    'ninjutsu scroll':'img/icons/scroll_ico.png',
    'additional':     'img/icons/add_ico.png',
    'special':        'img/icons/special_ico.png',
    'ring':           'img/icons/special_ico.png',
    // Crysta
    'additional crysta': 'img/icons/add_crysta.png',
    'ring crysta':       'img/icons/add_crysta.png',
    'armor crysta':      'img/icons/armor_crysta.png',
    'weapon crysta':     'img/icons/weapon_crysta.png',
    'special crysta':    'img/icons/special_crysta.png',
    'normal crysta':     'img/icons/normal_crysta.png',
    // Non-equipment (emoji)
    'material':       '⛏️',
    'consumable':     '🧪',
    'quest item':     '📦'
  };

  // Resolve the best icon: ImageURL > Sheet Icon > type-based > fallback
  function resolveIcon(type) {
    var icon = TYPE_ICONS[(type || '').toLowerCase()] || 'img/icons/1h_ico.png';
    // Convert relative img/ paths using the correct base
    if (typeof icon === 'string' && icon.indexOf('img/icons/') === 0) {
      return ICON_BASE + icon.slice('img/icons/'.length);
    }
    return icon;
  }

  // ---- ICON / IMAGE HELPER ------------------------------------------
  // Returns HTML for the icon area:
  //   - If imageURL is provided → <img> tag
  //   - If icon is provided → emoji/text from Sheet
  //   - Otherwise → auto-detect from TYPE_ICONS (supports emoji OR image URL)
  function iconHTML(imageURL, icon, type, altText) {
    if (imageURL) {
      return '<img src="' + esc(imageURL) + '" alt="' + esc(altText) + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />';
    }
    if (icon) { return icon; }
    var resolved = resolveIcon(type);
    // If the default icon is an image path or URL, render as <img>
    if (resolved.indexOf('http') === 0 || resolved.indexOf('../img/') === 0 || resolved.indexOf('img/') === 0) {
      return '<img src="' + esc(resolved) + '" alt="' + esc(altText || type) + '" style="width:100%;height:100%;object-fit:cover;border-radius:inherit" />';
    }
    return resolved;
  }

  // ---- LOADING STATE ------------------------------------------------
  function showLoading(container) {
    var html = '';
    for (var i = 0; i < 6; i++) {
      html += '<div class="skeleton" style="height:100px;border-radius:var(--radius-md)"></div>';
    }
    container.innerHTML = html;
  }

  function showError(container, msg) {
    container.innerHTML =
      '<p class="text-muted" style="grid-column:1/-1;padding:1rem 0">&#9888; ' +
      esc(msg) + '</p>';
  }

  // ---- RENDERERS ----------------------------------------------------

  function rarityClass(rarity) {
    var r = (rarity || '').toLowerCase();
    return r === 'event' ? 'event' : '';
  }

  function renderItems(rows, container) {
    container.innerHTML = '';
    if (!rows.length) {
      showError(container, 'No item data found. Check your Sheet ID and column headers (Name, Icon, ImageURL, Type, Level, Stats, Rarity, Source).');
      return;
    }
    rows.forEach(function (row) {
      var name   = esc(row['Name']     || '');
      var icon   = esc(row['Icon']     || '');
      var imgURL = (row['ImageURL']    || '').trim();
      var type   = esc(row['Type']     || '');
      var level  = esc(row['Level']    || '');
      var lvl    = level && level !== '0' ? ' · Lv.' + level : '';
      var stats  = esc(row['Stats']    || '');
      var rarity = esc(row['Rarity']   || '');
      var source = esc(row['Source']   || '');
      var rc     = rarityClass(rarity);

      var el       = document.createElement('article');
      el.className = 'data-card';
      el.style.cursor = 'pointer';
      el.dataset.filter    = (name + ' ' + type + ' ' + rarity).toLowerCase();
      el.dataset.category  = type.toLowerCase();
      el.dataset.category2 = rarity.toLowerCase();
      el.dataset.name      = row['Name'] || '';
      // Card icon: use Icon column or auto-detect from Type (NOT ImageURL).
      // ImageURL is reserved for the large image in the detail modal.
      el.innerHTML =
        '<div class="data-card-header">' +
          '<div class="data-card-icon">' + iconHTML('', icon, type, name) + '</div>' +
          '<div>' +
            '<div class="data-card-title">' + name + '</div>' +
            '<div class="data-card-subtitle">' + type + lvl + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="data-card-body">' +
          (stats  ? '<span class="tag">Base: '   + stats  + '</span>' : '') +
          (rarity ? '<span class="tag ' + rc + '">' + rarity + '</span>' : '') +
          (source ? '<p class="mt-1">Source: ' + source + '</p>' : '') +
        '</div>';
      container.appendChild(el);
    });
  }

  function renderMonsters(rows, tbody) {
    tbody.innerHTML = '';
    if (!rows.length) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="8" class="text-muted" style="padding:1rem">No monster data found. Check your Sheet ID and column headers (Name, Icon, Level, Difficulty, Type, Element, HP, Location, Drop).</td>';
      tbody.appendChild(tr);
      return;
    }

    // Group rows by Name (case-insensitive), preserve first-seen order
    var groups = [];
    var groupMap = {};
    rows.forEach(function (row) {
      var key = (row['Name'] || '').trim().toLowerCase();
      if (!groupMap[key]) {
        groupMap[key] = [];
        groups.push(groupMap[key]);
      }
      groupMap[key].push(row);
    });

    // Sort each group by difficulty order: Easy → Normal → Hard → Nightmare → Ultimate
    var diffOrder = { easy: 0, normal: 1, hard: 2, nightmare: 3, ultimate: 4 };
    groups.forEach(function (group) {
      group.sort(function (a, b) {
        var da = (a['Difficulty'] || '').trim().toLowerCase();
        var db = (b['Difficulty'] || '').trim().toLowerCase();
        return (diffOrder[da] !== undefined ? diffOrder[da] : 99) -
               (diffOrder[db] !== undefined ? diffOrder[db] : 99);
      });
    });

    var groupId = 0;
    groups.forEach(function (group) {
      var gid = 'mon-grp-' + (groupId++);
      var hasVariants = group.length > 1;

      group.forEach(function (row, idx) {
        var name   = esc(row['Name']       || '');
        var icon   = esc(row['Icon']       || '');
        var imgURL = (row['ImageURL']      || '').trim();
        var level  = esc(row['Level']      || '');
        var diff   = esc(row['Difficulty'] || '');
        var type   = esc(row['Type']       || '');
        var elem   = esc(row['Element']    || '');
        var hp     = esc(row['HP']         || '');
        var loc    = esc(row['Location']   || '');
        var rawDrop = (row['Drop']         || '').trim();

        var typeLower = type.toLowerCase();
        var isBoss = typeLower === 'boss';
        var isMiniBoss = typeLower === 'mini boss' || typeLower === 'mini-boss';
        var monIcon = imgURL
          ? '<img src="' + esc(imgURL) + '" alt="' + name + '" style="width:24px;height:24px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:4px" />'
          : (icon || (isBoss ? '🐉' : '👾')) + ' ';

        // Drop tags with collapsible overflow
        var dropHTML = '';
        if (rawDrop) {
          var drops = rawDrop.split(';').map(function (d) { return d.trim(); }).filter(Boolean);
          var MAX_VISIBLE = 3;
          drops.forEach(function (d, i) {
            var hidden = i >= MAX_VISIBLE ? ' style="display:none" data-drop-extra' : '';
            dropHTML += '<span class="tag"' + hidden + '>' + esc(d) + '</span> ';
          });
          if (drops.length > MAX_VISIBLE) {
            var extra = drops.length - MAX_VISIBLE;
            dropHTML += '<span class="tag drop-toggle" style="cursor:pointer;opacity:.7" data-drop-toggle>+' + extra + ' more</span>';
          }
        }

        var tr = document.createElement('tr');
        tr.dataset.filter    = (name + ' ' + type + ' ' + elem).toLowerCase();
        tr.dataset.category  = type.toLowerCase().replace(/\s+/g, '-');
        tr.dataset.category2 = elem.toLowerCase();

        var diffClass = diff ? ' diff-' + diff.toLowerCase() : '';
        var nameCell;

        if (hasVariants && idx === 0) {
          // First row of group: show name + expand toggle with hidden diff labels
          var hiddenDiffs = group.slice(1).map(function (r) {
            return (r['Difficulty'] || '').trim();
          }).filter(Boolean);
          var toggleLabel = hiddenDiffs.length ? hiddenDiffs.join(', ') : (group.length - 1) + ' variants';
          nameCell = monIcon + name +
            ' <span class="tag mon-group-toggle" style="cursor:pointer;opacity:.7;font-size:.75rem" data-group="' + gid + '">▸ ' + toggleLabel + '</span>';
        } else if (hasVariants) {
          // Variant row: indent with marker, hidden by default
          nameCell = '<span style="padding-left:1.2rem;opacity:.85">↳ </span>' + monIcon + name;
          tr.dataset.monGroup = gid;
          tr.style.display = 'none';
          tr.style.background = 'var(--bg-card-hover, rgba(0,0,0,.02))';
        } else {
          // Single row (no duplicates)
          nameCell = monIcon + name;
        }

        tr.innerHTML =
          '<td>' + nameCell + '</td>' +
          '<td><span class="tag' + (parseInt(level, 10) >= 240 ? ' gold' : '') + '">' + level + '</span></td>' +
          (diff ? '<td><span class="tag' + diffClass + '">' + diff + '</span></td>' : '<td></td>') +
          '<td><span class="tag' + (isBoss ? ' red' : (isMiniBoss ? ' mini-boss' : '')) + '">' + type + '</span></td>' +
          '<td>' + elem + '</td>' +
          '<td>' + hp + '</td>' +
          '<td>' + loc + '</td>' +
          '<td>' + dropHTML + '</td>';
        tbody.appendChild(tr);
      });
    });

    // Click handler for group toggles and drop toggles
    tbody.addEventListener('click', function (e) {
      // Drop expand/collapse
      var dropToggle = e.target.closest('[data-drop-toggle]');
      if (dropToggle) {
        var td = dropToggle.closest('td');
        if (!td) return;
        var extras = td.querySelectorAll('[data-drop-extra]');
        var showing = dropToggle.dataset.expanded === '1';
        extras.forEach(function (el) { el.style.display = showing ? 'none' : ''; });
        if (!dropToggle.dataset.label) dropToggle.dataset.label = dropToggle.textContent;
        dropToggle.dataset.expanded = showing ? '0' : '1';
        dropToggle.textContent = showing ? dropToggle.dataset.label : 'show less';
        return;
      }

      // Monster group expand/collapse
      var grpToggle = e.target.closest('[data-group]');
      if (grpToggle) {
        var gid = grpToggle.dataset.group;
        var variantRows = tbody.querySelectorAll('[data-mon-group="' + gid + '"]');
        var isOpen = grpToggle.dataset.open === '1';
        variantRows.forEach(function (r) { r.style.display = isOpen ? 'none' : ''; });
        if (!grpToggle.dataset.label) grpToggle.dataset.label = grpToggle.textContent.replace('▸ ', '');
        grpToggle.dataset.open = isOpen ? '0' : '1';
        grpToggle.textContent = isOpen
          ? '▸ ' + grpToggle.dataset.label
          : '▾ hide';
      }
    });
  }

  function renderSkills(rows, container) {
    container.innerHTML = '';
    if (!rows.length) {
      showError(container, 'No skill data found. Check your Sheet ID and column headers (Name, Icon, Type, Category, Damage, MP Cost, Description).');
      return;
    }
    rows.forEach(function (row) {
      var name   = esc(row['Name']        || '');
      var icon   = esc(row['Icon']        || '');
      var imgURL = (row['ImageURL']       || '').trim();
      var type   = esc(row['Type']        || '');
      var cat    = esc(row['Category']    || '');
      var dmg    = esc(row['Damage']      || '');
      var mp     = esc(row['MP Cost']     || '');
      var desc   = esc(row['Description'] || '');

      var el       = document.createElement('article');
      el.className = 'data-card';
      el.dataset.filter    = (name + ' ' + type + ' ' + cat).toLowerCase();
      el.dataset.category  = type.toLowerCase();
      el.dataset.category2 = cat.toLowerCase();
      el.innerHTML =
        '<div class="data-card-header">' +
          '<div class="data-card-icon">' + iconHTML(imgURL, icon, type, name) + '</div>' +
          '<div>' +
            '<div class="data-card-title">' + name + '</div>' +
            '<div class="data-card-subtitle">' + type + (cat ? ' · ' + cat + ' Skill' : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="data-card-body">' +
          (dmg  ? '<span class="tag">'        + dmg + '</span>' : '') +
          (mp   ? '<span class="tag">MP ' + mp + '</span>' : '') +
          (desc ? '<p class="mt-1 text-muted">' + desc + '</p>' : '') +
        '</div>';
      container.appendChild(el);
    });
  }

  function renderMaps(rows, container) {
    container.innerHTML = '';
    if (!rows.length) {
      showError(container, 'No map data found. Check your Sheet ID and column headers (Name, Icon, Zone, LevelRange, Boss, Description).');
      return;
    }
    rows.forEach(function (row) {
      var name   = esc(row['Name']        || '');
      var icon   = esc(row['Icon']        || '');
      var imgURL = (row['ImageURL']       || '').trim();
      var zone   = esc(row['Zone']        || '');
      var range  = esc(row['LevelRange']  || '');
      var boss   = esc(row['Boss']        || '');
      var desc   = esc(row['Description'] || '');

      var el       = document.createElement('article');
      el.className = 'data-card';
      el.dataset.filter   = (name + ' ' + zone).toLowerCase();
      el.dataset.category = zone.toLowerCase().replace(/\s+/g, '-');
      el.innerHTML =
        '<div class="data-card-header">' +
          '<div class="data-card-icon">' + iconHTML(imgURL, icon, 'map', name) + '</div>' +
          '<div>' +
            '<div class="data-card-title">' + name + '</div>' +
            '<div class="data-card-subtitle">' + zone + (range ? ' · Lv.' + range : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="data-card-body">' +
          (desc ? '<p class="mt-1 text-muted">' + desc + '</p>' : '') +
          (boss ? '<p class="mt-1"><strong>Boss:</strong> ' + boss + '</p>' : '') +
        '</div>';
      container.appendChild(el);
    });
  }

  function renderQuests(rows, container) {
    container.innerHTML = '';
    if (!rows.length) {
      showError(container, 'No quest data found. Check your Sheet ID and column headers (Name, Icon, Type, MinLevel, Reward, Description).');
      return;
    }
    rows.forEach(function (row) {
      var name   = esc(row['Name']        || '');
      var icon   = esc(row['Icon']        || '');
      var imgURL = (row['ImageURL']       || '').trim();
      var type   = esc(row['Type']        || '');
      var minlv  = esc(row['MinLevel']    || '');
      var reward = esc(row['Reward']      || '');
      var desc   = esc(row['Description'] || '');

      var el       = document.createElement('article');
      el.className = 'data-card';
      el.dataset.filter   = (name + ' ' + type).toLowerCase();
      el.dataset.category = type.toLowerCase();
      el.innerHTML =
        '<div class="data-card-header">' +
          '<div class="data-card-icon">' + iconHTML(imgURL, icon, 'quest item', name) + '</div>' +
          '<div>' +
            '<div class="data-card-title">' + name + '</div>' +
            '<div class="data-card-subtitle">' + type + (minlv ? ' · Lv.' + minlv + '+' : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="data-card-body">' +
          (desc   ? '<p class="mt-1 text-muted">'     + desc   + '</p>' : '') +
          (reward ? '<p class="mt-1"><strong>Reward:</strong> ' + reward + '</p>' : '') +
        '</div>';
      container.appendChild(el);
    });
  }

  function renderPets(rows, tbody) {
    tbody.innerHTML = '';
    if (!rows.length) {
      var tr = document.createElement('tr');
      tr.innerHTML = '<td colspan="4" class="text-muted" style="padding:1rem">No pet data found. Check your Sheet ID and column headers (Name, Icon, ImageURL, Element, Level, SpawnAt).</td>';
      tbody.appendChild(tr);
      return;
    }

    // Auto-detect: show Element column only if ANY row has Element filled
    var hasElement = rows.some(function (r) { return (r['Element'] || '').trim() !== ''; });

    // Update thead dynamically
    var table = tbody.closest('table');
    if (table) {
      var thead = table.querySelector('thead tr');
      if (thead) {
        thead.innerHTML = hasElement
          ? '<th>Pet</th><th>Element</th><th>Level</th><th>Spawn At</th>'
          : '<th>Pet</th><th>Level</th><th>Spawn At</th>';
      }
    }

    // Show/hide element filter dropdown
    var filterEl = document.getElementById('filterSelect');
    if (filterEl) {
      filterEl.style.display = hasElement ? '' : 'none';
    }

    rows.forEach(function (row) {
      var name    = esc(row['Name']     || '');
      var icon    = esc(row['Icon']     || '');
      var imgURL  = (row['ImageURL']    || '').trim();
      var elem    = esc(row['Element']  || '');
      var level   = esc(row['Level']    || '');
      var spawnAt = esc(row['SpawnAt']  || '');

      var petIcon = imgURL
        ? '<img src="' + esc(imgURL) + '" alt="' + name + '" style="width:24px;height:24px;object-fit:cover;border-radius:4px;vertical-align:middle;margin-right:4px" />'
        : (icon || '🐾') + ' ';
      var elemClass = elem ? ' ' + elem.toLowerCase() : '';
      var highLv = parseInt(level, 10) >= 240;

      var tr = document.createElement('tr');
      tr.dataset.filter   = (name + ' ' + elem).toLowerCase();
      tr.dataset.category = elem.toLowerCase();

      if (hasElement) {
        tr.innerHTML =
          '<td>' + petIcon + name + '</td>' +
          '<td>' + (elem ? '<span class="tag' + elemClass + '">' + elem + '</span>' : '') + '</td>' +
          '<td><span class="tag' + (highLv ? ' legendary' : '') + '">' + level + '</span></td>' +
          '<td>' + spawnAt + '</td>';
      } else {
        tr.innerHTML =
          '<td>' + petIcon + name + '</td>' +
          '<td><span class="tag' + (highLv ? ' legendary' : '') + '">' + level + '</span></td>' +
          '<td>' + spawnAt + '</td>';
      }
      tbody.appendChild(tr);
    });
  }

  // ---- RENDERER MAP -------------------------------------------------
  var RENDERERS = {
    items:    renderItems,
    monsters: renderMonsters,
    skills:   renderSkills,
    maps:     renderMaps,
    quests:   renderQuests,
    pets:     renderPets
  };

  // ---- PUBLIC: load(page, containerId) ------------------------------
  // page        : 'items' | 'monsters' | 'skills' | 'maps' | 'quests'
  // containerId : ID of the element to populate
  //   For monsters, use the <tbody id="monstersTable"> ID.
  //   For others, use the card-grid div ID.
  function load(page, containerId) {
    if (CONFIG.SHEET_ID === 'YOUR_GOOGLE_SHEET_ID') {
      // No ID configured — leave the static HTML intact.
      return;
    }
    var sheetName = CONFIG.SHEETS[page];
    var renderer  = RENDERERS[page];
    var container = document.getElementById(containerId);
    if (!sheetName || !renderer || !container) { return; }

    if (page !== 'monsters') { showLoading(container); }

    fetchSheet(sheetName)
      .then(function (csv) {
        var rows = parseCSV(csv);
        rows.reverse();
        renderer(rows, container);
        // Signal to main.js that new filterable elements are ready.
        document.dispatchEvent(new CustomEvent('sheetsrendered'));
      })
      .catch(function (err) {
        var msg = 'Could not load data from Google Sheets. ' +
                  'Make sure your sheet is published and SHEET_ID is correct. (' + err.message + ')';
        if (page === 'monsters') {
          var tbody = container;
          var tr = document.createElement('tr');
          tr.innerHTML = '<td colspan="8" class="text-muted" style="padding:1rem">&#9888; ' + esc(msg) + '</td>';
          tbody.innerHTML = '';
          tbody.appendChild(tr);
        } else {
          showError(container, msg);
        }
        console.error('ToramSheets:', err);
      });
  }

  // ---- PUBLIC: loadLatest(page, containerId, max) ------------------
  // Like load(), but only renders the first `max` rows.
  // Used on the homepage for "Latest Items", "Popular Monsters", etc.
  // If Sheets is not configured, leaves the static HTML untouched.
  function loadLatest(page, containerId, max) {
    if (CONFIG.SHEET_ID === 'YOUR_GOOGLE_SHEET_ID') { return; }
    var sheetName = CONFIG.SHEETS[page];
    var renderer  = RENDERERS[page];
    var container = document.getElementById(containerId);
    if (!sheetName || !renderer || !container) { return; }

    fetchSheet(sheetName)
      .then(function (csv) {
        var rows = parseCSV(csv);
        rows.reverse();
        rows = rows.slice(0, max || 3);
        if (rows.length) {
          renderer(rows, container);
          document.dispatchEvent(new CustomEvent('sheetsrendered'));
        }
      })
      .catch(function () {
        // Silently keep the static HTML on homepage
      });
  }

  // ---- PUBLIC: loadHomepage() ---------------------------------------
  // Loads the 'Homepage' sheet and updates categories, featured item,
  // and hero stats. If Sheet is empty or not configured, keeps static HTML.
  //
  // Expected columns in Homepage sheet:
  //   Section, Name, Icon, ImageURL, Link, Count, Description,
  //   Type, Level, Rarity, Stats, Source
  //
  // Section values:
  //   'category'  → updates the categories grid
  //   'featured'  → updates the spotlight/featured card
  //   'stat'      → updates hero counter stats (Name=label, Count=number)
  function loadHomepage() {
    if (CONFIG.SHEET_ID === 'YOUR_GOOGLE_SHEET_ID') { return; }
    var sheetName = CONFIG.SHEETS.homepage;
    if (!sheetName) { return; }

    fetchSheet(sheetName)
      .then(function (csv) {
        var rows = parseCSV(csv);
        if (!rows.length) return;

        var categories = [];
        var featured   = null;
        var stats      = [];

        rows.forEach(function (row) {
          var section = (row['Section'] || '').toLowerCase().trim();
          if (section === 'category')  categories.push(row);
          else if (section === 'featured') featured = row;
          else if (section === 'stat')     stats.push(row);
        });

        // --- Render categories ---
        if (categories.length) {
          var grid = document.getElementById('categoriesGrid');
          if (grid) {
            grid.innerHTML = '';
            categories.forEach(function (cat) {
              var name   = esc(cat['Name']     || '');
              var icon   = cat['Icon']         || '';
              var imgURL = (cat['ImageURL']    || '').trim();
              var link   = cat['Link']         || '#';
              var count  = esc(cat['Count']    || '');

              var iconContent;
              if (imgURL) {
                iconContent = '<img src="' + esc(imgURL) + '" alt="' + esc(name) + '" />';
              } else {
                iconContent = icon || '📂';
              }

              var a = document.createElement('a');
              a.href = link;
              a.className = 'cat-card';
              a.setAttribute('aria-label', name + ' database');
              a.innerHTML =
                '<span class="cat-icon">' + iconContent + '</span>' +
                '<span class="cat-name">' + esc(name) + '</span>' +
                '<span class="cat-count">' + count + '</span>';
              grid.appendChild(a);
            });
          }
        }

        // --- Render featured/spotlight ---
        if (featured) {
          var spot = document.getElementById('spotlightCard');
          if (spot) {
            var fname   = esc(featured['Name']        || '');
            var ficon   = featured['Icon']             || '🗡️';
            var fimgURL = (featured['ImageURL']        || '').trim();
            var ftype   = esc(featured['Type']         || '');
            var flevel  = esc(featured['Level']        || '');
            var frarity = esc(featured['Rarity']       || '');
            var fstats  = esc(featured['Stats']        || '');
            var fdesc   = esc(featured['Description']  || '');
            var flink   = featured['Link']             || 'pages/items.html';

            var spotIcon;
            if (fimgURL) {
              spotIcon = '<img src="' + esc(fimgURL) + '" alt="' + fname + '" />';
            } else {
              spotIcon = ficon;
            }

            var rc = frarity ? (' ' + frarity.toLowerCase()) : '';

            spot.innerHTML =
              '<div class="spotlight-icon">' + spotIcon + '</div>' +
              '<div class="spotlight-info">' +
                '<p class="title">' + (flevel ? 'Lv.' + flevel + ' ' : '') + fname + '</p>' +
                '<p class="meta">' +
                  (frarity ? '<span class="tag' + rc + '">' + frarity + '</span>' : '') +
                  (ftype   ? '<span class="tag">' + ftype + '</span>' : '') +
                  (fstats  ? '<span class="tag green">' + fstats + '</span>' : '') +
                '</p>' +
                (fdesc ? '<p class="text-muted" style="font-size:.875rem">' + fdesc + '</p>' : '') +
                '<div class="mt-2">' +
                  '<a href="' + esc(flink) + '" class="btn btn-outline" style="font-size:.85rem;padding:.45rem 1rem">View Details →</a>' +
                '</div>' +
              '</div>';
          }
        }

        // --- Render hero stats ---
        if (stats.length) {
          var statsContainer = document.getElementById('heroStats');
          if (statsContainer) {
            statsContainer.innerHTML = '';
            stats.forEach(function (s) {
              var label = esc(s['Name']  || '');
              var count = parseInt(s['Count'] || '0', 10);
              var suffix = esc(s['Icon'] || '+');  // reuse Icon col as suffix
              var div = document.createElement('div');
              div.className = 'stat';
              div.innerHTML =
                '<span class="stat-num" data-count="' + count + '" data-suffix="' + suffix + '">0</span>' +
                '<span class="stat-label">' + label + '</span>';
              statsContainer.appendChild(div);
            });
            // Re-trigger counter animation
            if (window.animateCounters) window.animateCounters();
          }
        }
      })
      .catch(function (err) {
        console.error('ToramSheets homepage:', err);
      });
  }

  return {
    CONFIG       : CONFIG,
    load         : load,
    loadLatest   : loadLatest,
    loadHomepage : loadHomepage,
    fetchSheet   : fetchSheet,
    parseCSV     : parseCSV,
    esc          : esc,
    resolveIcon  : resolveIcon
  };
}());
