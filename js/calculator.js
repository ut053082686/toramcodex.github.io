/**
 * ToramDB MQ EXP Calculator
 * Premium Redesign + Advanced Logic from xp.js
 */

(function() {
  'use strict';

  const LV_CAP = 315;
  let cachedQuestData = [];

  // Formula Reference: https://toramtools.github.io/xp.html
  const getXP = (lv) => Math.floor(0.025 * Math.pow(lv, 4) + 2 * lv);

  // Total XP required to reach target from current
  const getTotalXP = function (begin, beginPercentage, end) {
    if (begin >= end) return 0;
    let xp = Math.floor((1 - beginPercentage / 100) * getXP(begin));
    for (let i = begin + 1; i < end; i++) {
      xp += getXP(i);
    }
    return xp;
  }

  // Final level reached after adding extra XP
  const addXP = function (begin, beginPercentage, extraXP) {
    let remainingXP = extraXP;
    let lv, lvPercentage;
    let XPRequiredNextLv = Math.floor((1 - beginPercentage / 100) * getXP(begin));

    if (extraXP < XPRequiredNextLv) {
      let currentXP = (beginPercentage / 100) * getXP(begin) + extraXP;
      return [begin, Math.floor(100 * currentXP / getXP(begin))];
    } else {
      remainingXP -= XPRequiredNextLv;
      lv = begin + 1;
      while (lv < LV_CAP && getXP(lv) <= remainingXP) {
        remainingXP -= getXP(lv);
        lv += 1;
      }
      lvPercentage = Math.floor(100 * remainingXP / getXP(lv));
      return [lv, lvPercentage];
    }
  }

  function initCalculator() {
    // Event listeners
    const inputs = ['currentLvl', 'currentPct', 'targetLvl', 'mqFrom', 'mqUntil', 'skipVenena', 'multipleMq'];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', updateCalculator);
    });

    // Handle case where data is ready
    document.addEventListener('sheetsdataready', function(e) {
      if (e.detail && e.detail.page === 'quests') {
        cachedQuestData = e.detail.data;
        populateQuestDropdowns(cachedQuestData);
      }
    });

    // Check if already ready
    if (window.ToramSheets && window.ToramSheets.dataState.fullData.length > 0 && window.ToramSheets.dataState.pageType === 'quests') {
      cachedQuestData = window.ToramSheets.dataState.fullData;
      populateQuestDropdowns(cachedQuestData);
    }
  }

  function populateQuestDropdowns(data) {
    const fromSelect = document.getElementById('mqFrom');
    const untilSelect = document.getElementById('mqUntil');
    if (!fromSelect || !untilSelect) return;

    fromSelect.innerHTML = '';
    untilSelect.innerHTML = '';

    data.forEach((q, index) => {
      const name = q['Name'] || q['name'] || '-';
      const ch = q['Chapter'] || q['chapter'] || '?';
      const label = `CH${ch} - ${name}`;
      
      const optFrom = document.createElement('option');
      optFrom.value = index;
      optFrom.textContent = label;
      fromSelect.appendChild(optFrom);

      const optUntil = document.createElement('option');
      optUntil.value = index;
      optUntil.textContent = label;
      untilSelect.appendChild(optUntil);
    });

    // Set defaults (From: start, Until: end)
    fromSelect.selectedIndex = 0;
    untilSelect.selectedIndex = data.length - 1;

    updateCalculator();
  }

  function updateCalculator() {
    if (!cachedQuestData || cachedQuestData.length === 0) return;

    // 1. Evaluate Total XP Required
    const lv = parseInt(document.getElementById('currentLvl').value) || 1;
    const pct = parseInt(document.getElementById('currentPct').value) || 0;
    const target = parseInt(document.getElementById('targetLvl').value) || LV_CAP;
    
    const xpRequired = getTotalXP(lv, pct, target);
    document.getElementById('resExpReq').textContent = xpRequired.toLocaleString();

    // 2. Evaluate MQ Logic
    const mqBegin = parseInt(document.getElementById('mqFrom').value) || 0;
    const mqEnd = parseInt(document.getElementById('mqUntil').value) || 0;
    const skipVenena = document.getElementById('skipVenena').checked;
    const spamAdv = document.getElementById('multipleMq').checked;

    if (mqBegin <= mqEnd) {
      let mqXP = 0;
      let mqXPReverse = 0;
      let mqStopIndex = mqBegin;
      let mqStartIndex = mqEnd;
      let mqStopAtFound = false;
      let mqStartFromFound = false;

      // Extract EXP and calculate totals/recommendations
      for (let i = mqBegin; i <= mqEnd; i++) {
        const qForward = cachedQuestData[i];
        const qBackward = cachedQuestData[mqEnd - (i - mqBegin)];

        const getExpForQuest = (q) => {
          let val = q['EXP'] || q['exp'];
          if (!val && q['Reward']) {
            const m = q['Reward'].match(/([\d,]+)\s*EXP/i);
            if (m) val = m[1];
          }
          let total = parseInt((val || '0').toString().replace(/,/g, ''));
          const name = (q['Name'] || q['name'] || '').toLowerCase();
          if (name.includes('venena meta coenubia') && !skipVenena) total += 12500000;
          return total;
        };

        const expF = getExpForQuest(qForward);
        mqXP += expF;

        const expB = getExpForQuest(qBackward);
        mqXPReverse += expB;

        // Recommendations (Stop At / Start From)
        if (!mqStopAtFound && mqXP >= xpRequired) {
          mqStopAtFound = true;
          mqStopIndex = i;
        }
        if (!mqStartFromFound && mqXPReverse >= xpRequired) {
          mqStartFromFound = true;
          mqStartIndex = mqEnd - (i - mqBegin);
        }
      }

      document.getElementById('resQuestExpText').innerHTML = `<strong>XP:</strong> ${mqXP.toLocaleString()} exp`;
      
      const [nLv, nLvP] = addXP(lv, pct, mqXP);
      document.getElementById('resEvaluationText').innerHTML = 
        `After doing Main Quest's above range you'll reach <strong>Lv.${nLv} (${nLvP}%)</strong>`;

      // Show recommendations if not in spam mode
      const resStartFrom = document.getElementById('resStartFrom');
      const resStopAt = document.getElementById('resStopAt');

      if (mqStartFromFound && !spamAdv && mqStartIndex > mqBegin) {
        const qName = cachedQuestData[mqStartIndex]['Name'] || cachedQuestData[mqStartIndex]['name'];
        resStartFrom.innerHTML = `You may <strong>start</strong> from quest <strong>${qName}</strong> to reach target level`;
      } else {
        resStartFrom.innerHTML = '';
      }

      if (mqStopAtFound && !spamAdv && mqStopIndex < mqEnd) {
        const qName = cachedQuestData[mqStopIndex]['Name'] || cachedQuestData[mqStopIndex]['name'];
        resStopAt.innerHTML = `You may <strong>stop</strong> after quest <strong>${qName}</strong> to reach target level`;
      } else {
        resStopAt.innerHTML = '';
      }

      // 3. Evaluate Diaries Simulation
      const resultTableGroup = document.getElementById('resultTableGroup');
      if (spamAdv) {
        resultTableGroup.style.display = 'block';
        evaluateDiaries(lv, pct, xpRequired, mqXP, mqBegin, mqEnd, skipVenena);
      } else {
        resultTableGroup.style.display = 'none';
      }
    } else {
      document.getElementById('resEvaluationText').innerHTML = "<em>Error: Target quest is before start quest.</em>";
      document.getElementById('resultTableGroup').style.display = 'none';
    }
  }

  function evaluateDiaries(startLv, startPct, targetXP, questXP, mqBeginIndex, mqEndIndex, skipVenena) {
    const tableBody = document.getElementById('resultTableBody');
    tableBody.innerHTML = '';
    const targetLvl = parseInt(document.getElementById('targetLvl').value) || LV_CAP;
    
    let curLv = startLv;
    let curPct = startPct;
    let runs = 0;

    // Safety limit 200 runs
    while (runs < 200) {
      runs++;
      const xpNeededNow = getTotalXP(curLv, curPct, targetLvl);
      if (xpNeededNow <= 0) break;

      if (questXP >= xpNeededNow) {
        // Partial run: simulate quest by quest
        let tLv = curLv;
        let tPct = curPct;
        let lastQName = '';
        
        for (let i = mqBeginIndex; i <= mqEndIndex; i++) {
          const q = cachedQuestData[i];
          let val = q['EXP'] || q['exp'];
          if (!val && q['Reward']) {
            const m = q['Reward'].match(/([\d,]+)\s*EXP/i);
            if (m) val = m[1];
          }
          let exp = parseInt((val || '0').toString().replace(/,/g, ''));
          const name = (q['Name'] || q['name'] || '').toLowerCase();
          if (name.includes('venena meta coenubia') && !skipVenena) exp += 12500000;
          
          [tLv, tPct] = addXP(tLv, tPct, exp);
          const qName = q['Name'] || q['name'];
          const qCh = q['Chapter'] || q['chapter'] || '';
          lastQName = (qCh ? 'CH' + qCh + ' - ' : '') + qName;
          if (tLv >= targetLvl) break;
        }
        curLv = tLv;
        curPct = tPct;
        
        const row = document.createElement('tr');
        row.innerHTML = `<td>${runs}</td><td>${lastQName}</td><td>${curLv} (${curLv >= LV_CAP ? 0 : curPct}%)</td>`;
        tableBody.appendChild(row);
        break;
      } else {
        [curLv, curPct] = addXP(curLv, curPct, questXP);
        const untilText = document.getElementById('mqUntil').options[document.getElementById('mqUntil').selectedIndex].text;
        const row = document.createElement('tr');
        row.innerHTML = `<td>${runs}</td><td>${untilText}</td><td>${curLv} (${curLv >= LV_CAP ? 0 : curPct}%)</td>`;
        tableBody.appendChild(row);
      }
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }

})();
