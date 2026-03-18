window.MonsterModal = (function () {
  'use strict';

  var SAMPLE_MONSTERS = {
    'Biskyva': [
      { Name: 'Biskyva', Difficulty: 'Normal', Level: '293', Element: 'Water', HP: '9.3M', Location: 'Aquastida Central', Drop: 'Abyssal Greatsword;Biskyva Spine;Biskyva Horn;Biskyva Web', Type: 'Boss' },
      { Name: 'Biskyva', Difficulty: 'Hard', Level: '293', Element: 'Water', HP: '18.7M', Location: 'Aquastida Central', Drop: 'Abyssal Greatsword;Biskyva Spine;Biskyva Horn;Corroded Green Crystal', Type: 'Boss' },
      { Name: 'Biskyva', Difficulty: 'Nightmare', Level: '293', Element: 'Water', HP: '25M', Location: 'Aquastida Central', Drop: 'Abyssal Greatsword;Biskyva Spine;Biskyva Horn;Abyssal Katana', Type: 'Boss' },
      { Name: 'Biskyva', Difficulty: 'Ultimate', Level: '293', Element: 'Water', HP: '32M', Location: 'Aquastida Central', Drop: 'Abyssal Greatsword;Biskyva Spine;Biskyva Horn;Biskyva Armor', Type: 'Boss' }
    ]
  };

  var sheetsCache = null;
  var currentGroup = [];
  var currentVariant = null;

  var DIFFICULTY_ORDER = { 'easy': 0, 'normal': 1, 'hard': 2, 'nightmare': 3, 'ultimate': 4 };

  function getSafeId(str) {
    return (str || '').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }

  function elemIcon(el) {
    // Icons removed as per user request
    return '';
  }

  function buildModalHTML() {
    var container = document.getElementById('monsterModal');
    if (!container) return;
    container.className = 'modal-overlay';
    container.innerHTML =
      '<div class="modal-body" style="background: white; max-width: 400px;">' +
        '<button class="modal-close" id="monModalClose">&times;</button>' +
        '<div style="padding: 1.25rem 1.25rem 0.5rem;">' +
          '<h2 id="monModalName" style="font-size:1.4rem;font-weight:800;margin:0">Loading...</h2>' +
        '</div>' +
        '<div class="modal-diff-tabs" id="monModalDiffTabs"></div>' +
        '<div class="detail-image" id="monModalImage" style="height:180px; margin: 0.75rem 1.25rem; background:#f8fafc; border-radius:12px; display:flex; align-items:center; justify-content:center;">' +
          '<span style="font-size:3rem; opacity:0.3;">👾</span>' +
        '</div>' +
        '<div id="monModalMainBadges" style="padding: 0 1.25rem; display:flex; gap:0.5rem; flex-wrap:wrap;"></div>' +
        '<div id="monModalLocation" style="padding: 0.75rem 1.25rem; font-weight:600; color:#d97706; display:flex; align-items:center; gap:6px;"></div>' +
        '<div class="modal-nav-tabs">' +
          '<div class="modal-nav-tab active" data-tab="info">Info</div>' +
          '<div class="modal-nav-tab" data-tab="compare">Compare</div>' +
        '</div>' +
        '<div id="panel-info" class="detail-panel active" style="padding: 1rem 1.25rem;">' +
           '<div id="monModalInfoRows"></div>' +
           '<div class="m-drops-section" style="margin-top:1rem;">' +
             '<div class="m-drops-title">Drop list:</div>' +
             '<div id="monModalDrops" class="m-drop-list"></div>' +
           '</div>' +
        '</div>' +
        '<div id="panel-compare" class="detail-panel" style="padding: 1rem 1.25rem;">' +
          '<div id="monModalCompareRows"></div>' +
        '</div>' +
        '<div style="height:1.5rem"></div>' +
      '</div>';

    document.getElementById('monModalClose').onclick = close;
    container.onclick = function(e) { if(e.target === container) close(); };

    container.querySelectorAll('.modal-nav-tab').forEach(function(tab) {
      tab.onclick = function() {
        container.querySelectorAll('.modal-nav-tab').forEach(function(t) { t.classList.remove('active'); });
        container.querySelectorAll('.detail-panel').forEach(function(p) { p.classList.remove('active'); });
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
      };
    });
  }

  function populate(group, selectedVariant, startTab) {
    var monContainer = document.getElementById('monModalInfoRows');
    if (!group || !group.length) {
       document.getElementById('monModalName').textContent = 'Monster Not Found';
       if(monContainer) monContainer.innerHTML = '<p class="text-muted" style="padding:1rem">Data for this monster could not be loaded.</p>';
       return;
    }
    currentGroup = group;
    currentVariant = selectedVariant || group[0];

    try {
      var mon = currentVariant;
      var name = esc(mon['Name']);
      var difficulty = (mon['Difficulty'] || 'Normal').trim();

      document.getElementById('monModalName').textContent = name;

    // Difficulty Tabs
    var diffTabs = document.getElementById('monModalDiffTabs');
    diffTabs.innerHTML = '';
    group.forEach(function(v) {
      var d = (v['Difficulty'] || 'Normal').trim();
      var btn = document.createElement('div');
      btn.className = 'modal-diff-tab' + (d === difficulty ? ' active' : '');
      btn.textContent = d;
      btn.onclick = function() { populate(group, v, startTab); };
      diffTabs.appendChild(btn);
    });

    // Main Badges (Lv, Elem, HP)
    var badges = document.getElementById('monModalMainBadges');
    var el = mon['Element'] || '';
    var elLower = el.toLowerCase();
    badges.innerHTML = 
      '<span class="m-badge lv">Lv.' + esc(mon['Level']) + '</span> ' +
      '<span class="m-badge elem-' + elLower + '">' + esc(el) + '</span> ' +
      '<span class="m-badge hp">HP ' + esc(mon['HP']) + '</span>';

    // Image / Icon
    var imageEl = document.getElementById('monModalImage');
    if (imageEl) {
      if (window.ToramSheets) {
        var imgURL = (mon['ImageURL'] || '').trim();
        var icon = mon['Icon'] || '';
        var type = mon['Type'] || '';
        imageEl.innerHTML = window.ToramSheets.iconHTML(imgURL, icon, type, name);
      } else {
        imageEl.innerHTML = '<span style="font-size:3rem; opacity:0.3;">👾</span>';
      }
    }

    // Location
    document.getElementById('monModalLocation').innerHTML = 'Location: ' + esc(mon['Location']);

    // Info Rows
    var infoRows = document.getElementById('monModalInfoRows');
    infoRows.innerHTML = 
      '<div class="stat-row"><span class="stat-name">Element</span><span class="stat-value">' + (esc(el) || '—') + '</span></div>' +
      '<div class="stat-row"><span class="stat-name">HP</span><span class="stat-value">' + (esc(mon['HP']) || '—') + '</span></div>' +
      '<div class="stat-row"><span class="stat-name">Type</span><span class="stat-value">' + (esc(mon['Type']) || '—') + '</span></div>';

    // Drops
    var drops = (mon['Drop'] || '').split(';').map(function(d) { return d.trim(); }).filter(Boolean);
    var dropEl = document.getElementById('monModalDrops');
    dropEl.innerHTML = '';
    drops.forEach(function(d) {
      var item = document.createElement('div');
      var safeId = getSafeId(d);
      item.className = 'm-drop-item';
      item.innerHTML = '<div class="m-drop-icon" id="drop-icon-' + safeId + '">📦</div> <span class="m-drop-text">' + esc(d) + '</span> <span class="m-drop-arrow">→</span>';
      
      // Fetch real icon if ItemModal is available
      if (window.ItemModal && window.ItemModal.getItem) {
        window.ItemModal.getItem(d, function(itemData) {
          if (itemData) {
            var iconDiv = document.getElementById('drop-icon-' + safeId);
            if (iconDiv && window.ToramSheets) {
              var iURL = (itemData['ImageURL'] || '').trim();
              var iIcon = itemData['Icon'] || '';
              var iType = itemData['Type'] || '';
              iconDiv.innerHTML = window.ToramSheets.iconHTML(iURL, iIcon, iType, d);
              iconDiv.style.background = 'transparent';
            }
          }
        });
      }

      item.onclick = function() {
        if(window.ItemModal) { close(); setTimeout(function(){ window.ItemModal.open(d); }, 200); }
      };
      dropEl.appendChild(item);
    });

    // Compare Tab (Sorted Order)
    var compareRows = document.getElementById('monModalCompareRows');
    compareRows.innerHTML = '';
    
    // Sort group by difficulty
    var sortedGroup = group.slice().sort(function(a, b) {
      var da = (a['Difficulty'] || 'Normal').toLowerCase().trim();
      var db = (b['Difficulty'] || 'Normal').toLowerCase().trim();
      return (DIFFICULTY_ORDER[da] || 0) - (DIFFICULTY_ORDER[db] || 0);
    });

      sortedGroup.forEach(function(v) {
        var d = (v['Difficulty'] || 'Normal').trim();
        var isCurrent = (v === currentVariant);
        var row = document.createElement('div');
        row.className = 'compare-row' + (isCurrent ? ' current' : '');
        row.innerHTML = 
          '<div class="compare-diff-info">' + d + '</div>' +
          '<div class="compare-hp">' + esc(v['HP']) + '</div>';
        compareRows.appendChild(row);
      });
    } catch(err) {
      console.error('MonsterModal populate error:', err);
      document.getElementById('monModalName').textContent = 'Error Populating Data';
    }

    try {
      // Switch Tab if requested
      if (startTab) {
        var container = document.getElementById('monsterModal');
        var tabBtn = container.querySelector('.modal-nav-tab[data-tab="' + startTab + '"]');
        if (tabBtn) tabBtn.click();
      }
    } catch(e) {
      console.error('MonsterModal tab error:', e);
    }
  }

  function open(monsterName, difficulty, startTab, initialGroup) {
    try {
      var overlay = document.getElementById('monsterModal');
      if (!overlay) return;
      buildModalHTML();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';

      var group = initialGroup || [];
      
      // If no initial group, try searching in existing state
      if (!group.length) {
        if (window.ToramSheets && window.ToramSheets.dataState && window.ToramSheets.dataState.fullData) {
          var data = window.ToramSheets.dataState.fullData;
          group = data.filter(function(r) { 
            var rname = (r['Name'] || '').trim().toLowerCase();
            return rname === (monsterName || '').trim().toLowerCase(); 
          });
        }
      }
      
      // Fallback to sample if not found
      if (!group.length && SAMPLE_MONSTERS[monsterName]) {
        group = SAMPLE_MONSTERS[monsterName];
      } else if (!group.length && sheetsCache) {
        group = sheetsCache.filter(function(r) { 
          var rname = (r['Name'] || '').trim().toLowerCase();
          return rname === (monsterName || '').trim().toLowerCase(); 
        });
      }

      if (!group.length) {
        // Last attempt: fetch sheet
        var sheetName = (window.ToramSheets && window.ToramSheets.CONFIG.SHEETS.monsters) || 'Monsters';
        if (window.ToramSheets && window.ToramSheets.fetchSheet) {
            window.ToramSheets.fetchSheet(sheetName).then(function(csv){
                sheetsCache = window.ToramSheets.parseCSV(csv);
                open(monsterName, difficulty, startTab); 
            }).catch(function(){
                populate(null);
            });
            return;
        }
      }

      var selected = null;
      if (difficulty && group.length) {
        selected = group.find(function(v) { return (v['Difficulty'] || '').toLowerCase() === difficulty.toLowerCase(); });
      }
      populate(group, selected, startTab);
    } catch(err) {
      console.error('MonsterModal open error:', err);
      var nameEl = document.getElementById('monModalName');
      if(nameEl) nameEl.textContent = 'Error Opening Modal';
    }
  }

  function close() {
    var overlay = document.getElementById('monsterModal');
    if (overlay) {
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  return { open: open, close: close };
}());
