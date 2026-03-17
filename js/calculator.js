/**
 * ToramDB MQ EXP Calculator
 * Ported from adv.js
 */

(function() {
  'use strict';

  const MAX_LEVEL = 315;

  // Formula Reference: https://toramtools.github.io/xp.html
  const needXP = (lvl) => {
    if (lvl >= MAX_LEVEL) return Infinity;
    return Math.floor(Math.pow(lvl, 4) / 40 + lvl * 2);
  };

  function initCalculator() {
    const calcBtn = document.getElementById('calculateBtn');
    if (!calcBtn) return;

    calcBtn.addEventListener('click', function() {
      calculate();
    });

    // Handle case where data is ready before or after script loads
    document.addEventListener('sheetsdataready', function(e) {
      if (e.detail && e.detail.page === 'quests') {
        console.log('Calculator: Quest data ready');
        populateChapters(e.detail.data);
        calcBtn.disabled = false;
        calcBtn.textContent = 'CALCULATE ESTIMATION';
      }
    });

    // Check if already ready
    if (window.ToramSheets && window.ToramSheets.dataState.fullData.length > 0 && window.ToramSheets.dataState.pageType === 'quests') {
        populateChapters(window.ToramSheets.dataState.fullData);
        calcBtn.disabled = false;
        calcBtn.textContent = 'CALCULATE ESTIMATION';
    } else {
        calcBtn.disabled = true;
        calcBtn.textContent = 'LOADING DATA...';
    }
  }

  function populateChapters(data) {
    const select = document.getElementById('startChapter');
    if (!select) return;

    // Extract unique chapters
    const chapters = new Set();
    data.forEach(q => {
      const chStr = (q['Chapter'] || q['chapter'] || q['Zone'] || q['Type'] || '').toString();
      const match = chStr.match(/\d+/);
      if (match) chapters.add(parseInt(match[0]));
    });

    // Sort chapters
    const sortedChapters = Array.from(chapters).sort((a, b) => a - b);
    
    if (sortedChapters.length === 0) return;

    // Populate dropdown
    select.innerHTML = '';
    sortedChapters.forEach(ch => {
      const opt = document.createElement('option');
      opt.value = ch;
      opt.textContent = 'Chapter ' + ch;
      select.appendChild(opt);
    });
  }

  function calculate() {
    // Inputs
    let level = parseInt(document.getElementById('currentLvl').value) || 1;
    let percent = parseInt(document.getElementById('currentPct').value) || 0;
    let targetLevel = parseInt(document.getElementById('targetLvl').value) || 200;
    const chapterFrom = parseInt(document.getElementById('startChapter').value) || 1;

    // Validation
    if (level < 1) level = 1;
    if (level >= MAX_LEVEL) return alert(`Current level already at max (${MAX_LEVEL})`);
    if (targetLevel > MAX_LEVEL) targetLevel = MAX_LEVEL;
    if (targetLevel <= level) return alert("Target level must be higher than current level!");

    // Get Data from Sheets
    const fullQuestData = (window.ToramSheets && window.ToramSheets.dataState.fullData) || [];
    
    // Automatically find max chapter in data
    let maxChapterInData = 15; // Default fallback
    fullQuestData.forEach(q => {
        const chStr = (q['Chapter'] || q['chapter'] || q['Zone'] || q['Type'] || '0').toString();
        const chMatch = chStr.match(/\d+/);
        if (chMatch) {
            const val = parseInt(chMatch[0]);
            if (val > maxChapterInData) maxChapterInData = val;
        }
    });

    const chapterTo = maxChapterInData;

    // Total Quest EXP for selected chapters
    const selectedQuests = fullQuestData.filter(q => {
      // Priority: Chapter -> chapter -> Zone (legacy) -> Type
      const chStr = (q['Chapter'] || q['chapter'] || q['Zone'] || q['Type'] || '0').toString();
      const chMatch = chStr.match(/\d+/);
      const ch = chMatch ? parseInt(chMatch[0]) : 0;
      return ch >= chapterFrom && ch <= chapterTo;
    });

    const questTotalXP = selectedQuests.reduce((acc, q) => {
      // Priority: EXP -> exp -> Reward (regex)
      let expVal = q['EXP'] || q['exp'];
      if (!expVal && q['Reward']) {
        const rewardMatch = q['Reward'].match(/([\d,]+)\s*EXP/i);
        if (rewardMatch) expVal = rewardMatch[1];
      }
      const exp = parseInt((expVal || '0').toString().replace(/,/g, ''));
      return acc + exp;
    }, 0);

    if (questTotalXP === 0) {
      return alert("Quest data not loaded or no quests in selected chapter range. Please check your Google Sheet 'Quests' tab (Expected columns: Chapter, EXP).");
    }

    // Calculation Logic
    let currentXP = Math.floor((percent / 100) * needXP(level));
    
    // Total EXP needed to reach targetLevel
    let totalExpNeeded = 0;
    for (let l = level; l < targetLevel; l++) {
        totalExpNeeded += needXP(l);
    }
    // Subtract what we already have in the current level
    totalExpNeeded -= currentXP;

    // Simulation (Spam MQ runs)
    let runs = 0;
    let simLevel = level;
    let simXP = currentXP;

    while (runs < 1000) {
      runs++;
      simXP += questTotalXP;
      while (simLevel < targetLevel && simXP >= needXP(simLevel)) {
        simXP -= needXP(simLevel);
        simLevel++;
      }
      if (simLevel >= targetLevel) break;
    }

    // Update UI
    const resExpReq = document.getElementById('resExpReq');
    const resQuestExp = document.getElementById('resQuestExp');
    const resRuns = document.getElementById('resRuns');
    const calcResult = document.getElementById('calcResult');

    if (resExpReq) resExpReq.textContent = totalExpNeeded.toLocaleString();
    if (resQuestExp) resQuestExp.textContent = questTotalXP.toLocaleString();
    if (resRuns) {
        resRuns.textContent = runs + (simLevel >= targetLevel ? 'x' : 'x+ (Limit)');
    }
    if (calcResult) calcResult.style.display = 'block';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }

})();
