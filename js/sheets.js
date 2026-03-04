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
//  5. Rename each sheet tab to match the keys in SHEETS below:
//     Items | Monsters | Skills | Maps | Quests
//
// EXPECTED COLUMN HEADERS (row 1 of each sheet):
//  Items    : Name, Icon, Type, Level, Stats, Rarity, Source
//  Monsters : Name, Icon, Level, Type, Element, HP, Location, Drop
//  Skills   : Name, Icon, Type, Category, Damage, MP Cost, Description
//  Maps     : Name, Icon, Zone, LevelRange, Boss, Description
//  Quests   : Name, Icon, Type, MinLevel, Reward, Description
// ============================================================

window.ToramSheets = (function () {
  'use strict';

  // ---- CONFIGURATION ------------------------------------------------
  var CONFIG = {
    // Replace with your Google Sheets document ID.
    // Leave as 'YOUR_GOOGLE_SHEET_ID' to keep the built-in static data.
    SHEET_ID: 'YOUR_GOOGLE_SHEET_ID',

    // Sheet tab names (must match the tab names in your Google Sheet).
    SHEETS: {
      items:    'Items',
      monsters: 'Monsters',
      skills:   'Skills',
      maps:     'Maps',
      quests:   'Quests'
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
    return r === 'legendary' || r === 'epic' ? 'gold' :
           r === 'rare'                       ? 'gold' : '';
  }

  function renderItems(rows, container) {
    container.innerHTML = '';
    if (!rows.length) {
      showError(container, 'No item data found. Check your Sheet ID and column headers (Name, Icon, Type, Level, Stats, Rarity, Source).');
      return;
    }
    rows.forEach(function (row) {
      var name   = esc(row['Name']   || '');
      var icon   = esc(row['Icon']   || '🗡️');
      var type   = esc(row['Type']   || '');
      var level  = esc(row['Level']  || '');
      var stats  = esc(row['Stats']  || '');
      var rarity = esc(row['Rarity'] || '');
      var source = esc(row['Source'] || '');
      var rc     = rarityClass(rarity);

      var el       = document.createElement('article');
      el.className = 'data-card';
      el.dataset.filter    = (name + ' ' + type + ' ' + rarity).toLowerCase();
      el.dataset.category  = type.toLowerCase();
      el.dataset.category2 = rarity.toLowerCase();
      el.innerHTML =
        '<div class="data-card-header">' +
          '<div class="data-card-icon">' + icon + '</div>' +
          '<div>' +
            '<div class="data-card-title">' + name + '</div>' +
            '<div class="data-card-subtitle">' + type + (level ? ' · Lv.' + level : '') + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="data-card-body">' +
          (stats  ? '<span class="tag">'         + stats  + '</span>' : '') +
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
      tr.innerHTML = '<td colspan="7" class="text-muted" style="padding:1rem">No monster data found. Check your Sheet ID and column headers (Name, Icon, Level, Type, Element, HP, Location, Drop).</td>';
      tbody.appendChild(tr);
      return;
    }
    rows.forEach(function (row) {
      var name  = esc(row['Name']     || '');
      var icon  = esc(row['Icon']     || '👾');
      var level = esc(row['Level']    || '');
      var type  = esc(row['Type']     || '');
      var elem  = esc(row['Element']  || '');
      var hp    = esc(row['HP']       || '');
      var loc   = esc(row['Location'] || '');
      var drop  = esc(row['Drop']     || '');

      var isBoss = type.toLowerCase() === 'boss';
      var tr   = document.createElement('tr');
      tr.dataset.filter    = (name + ' ' + type + ' ' + elem).toLowerCase();
      tr.dataset.category  = type.toLowerCase().replace(/\s+/g, '-');
      tr.dataset.category2 = elem.toLowerCase();
      tr.innerHTML =
        '<td>' + icon + ' ' + name + '</td>' +
        '<td><span class="tag' + (parseInt(level, 10) >= 240 ? ' gold' : '') + '">' + level + '</span></td>' +
        '<td><span class="tag' + (isBoss ? ' red' : '') + '">' + type + '</span></td>' +
        '<td>' + elem + '</td>' +
        '<td>' + hp + '</td>' +
        '<td>' + loc + '</td>' +
        '<td>' + drop + '</td>';
      tbody.appendChild(tr);
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
      var icon   = esc(row['Icon']        || '✨');
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
          '<div class="data-card-icon">' + icon + '</div>' +
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
      var name  = esc(row['Name']        || '');
      var icon  = esc(row['Icon']        || '🗺️');
      var zone  = esc(row['Zone']        || '');
      var range = esc(row['LevelRange']  || '');
      var boss  = esc(row['Boss']        || '');
      var desc  = esc(row['Description'] || '');

      var el       = document.createElement('article');
      el.className = 'data-card';
      el.dataset.filter   = (name + ' ' + zone).toLowerCase();
      el.dataset.category = zone.toLowerCase().replace(/\s+/g, '-');
      el.innerHTML =
        '<div class="data-card-header">' +
          '<div class="data-card-icon">' + icon + '</div>' +
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
      var icon   = esc(row['Icon']        || '📜');
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
          '<div class="data-card-icon">' + icon + '</div>' +
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

  // ---- RENDERER MAP -------------------------------------------------
  var RENDERERS = {
    items:    renderItems,
    monsters: renderMonsters,
    skills:   renderSkills,
    maps:     renderMaps,
    quests:   renderQuests
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
        renderer(parseCSV(csv), container);
        // Signal to main.js that new filterable elements are ready.
        document.dispatchEvent(new CustomEvent('sheetsrendered'));
      })
      .catch(function (err) {
        var msg = 'Could not load data from Google Sheets. ' +
                  'Make sure your sheet is published and SHEET_ID is correct. (' + err.message + ')';
        if (page === 'monsters') {
          var tbody = container;
          var tr = document.createElement('tr');
          tr.innerHTML = '<td colspan="7" class="text-muted" style="padding:1rem">&#9888; ' + esc(msg) + '</td>';
          tbody.innerHTML = '';
          tbody.appendChild(tr);
        } else {
          showError(container, msg);
        }
        console.error('ToramSheets:', err);
      });
  }

  return {
    CONFIG : CONFIG,
    load   : load
  };
}());
