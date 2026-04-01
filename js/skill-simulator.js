/**
 * ToramDB Skill Simulator Logic
 * v0.64.0 Restructured + Beta Compatibility
 */

(function() {
    'use strict';

    // Settings
    let currentStep = 1;
    let currentMode = 'plus';
    let SKILL_TREES = {};
    let levels = {};

    // DOM Elements
    const totalSPEl = document.getElementById('total-sp');
    const accordionContainer = document.getElementById('tree-accordion');

    function init() {
        if (!accordionContainer) return;

        if (window.skillTrees) {
            window.skillTrees.forEach(tree => {
                // Skip hidden trees (e.g. Event Skills)
                if (tree.visible === false) return;

                // Calculate dynamic height
                const skills = tree.skills || [];
                const maxY = skills.length > 0 ? Math.max(...skills.map(s => s.y)) : 0;
                const dynamicHeight = maxY + 60; // Compact like beta

                SKILL_TREES[tree.id] = {
                    id: tree.id,
                    label: tree.label,
                    width: tree.width || 980,
                    height: Math.min(tree.height || 1000, dynamicHeight),
                    icon: tree.icon ? tree.icon.split('/').pop() : 'skills_ico.png',
                    skills: skills.map(s => ({
                        id: s.id,
                        name: s.name,
                        max: s.max || 10,
                        x: s.x,
                        y: s.y,
                        reqIds: s.prerequisites || [],
                        icon: s.icon ? s.icon.split('/').pop() : `sk_${s.id}.png`
                    }))
                };
            });
        }

        console.log("SKILL_TREES snapshot:", SKILL_TREES);
        renderAccordion();
        
        window.setStep = setStep;
        window.setMode = setMode;
        window.resetAll = resetAll;
        window.collapseAll = collapseAll;
        window.toggleTree = toggleTree;
    }

    function renderAccordion() {
        accordionContainer.innerHTML = '';
        
        Object.values(SKILL_TREES).forEach(tree => {
            const item = document.createElement('div');
            item.className = 'accordion-item';
            item.id = `item-${tree.id}`;

            const iconPath = `../img/icons/skills/${tree.icon}`;

            item.innerHTML = `
                <div class="accordion-header" onclick="toggleTree('${tree.id}')">
                    <div class="header-left">
                        <img src="${iconPath}" class="tree-icon" onerror="this.src='../img/icons/skills_ico.png'">
                        <span class="tree-label">${tree.label}</span>
                        <span class="sp-badge group-sp">(<span id="sp-${tree.id}">0</span> SP)</span>
                    </div>
                    <div class="arrow-icon">▶</div>
                </div>
                <div class="tree-content">
                    <div class="tree-grid" id="grid-${tree.id}" style="width:${tree.width}px; height:${tree.height}px;">
                        <svg class="svg-connections" id="svg-${tree.id}"></svg>
                    </div>
                </div>
            `;
            
            accordionContainer.appendChild(item);
            
            const grid = document.getElementById(`grid-${tree.id}`);
            tree.skills.forEach(skill => {
                if (levels[skill.id] === undefined) levels[skill.id] = 0;
                createNode(skill, grid, tree.id);
            });
        });

        updateTotalSP();
    }

    function toggleTree(treeId) {
        const item = document.getElementById(`item-${treeId}`);
        if (!item) return;

        const wasActive = item.classList.contains('active');
        if (!wasActive) {
            item.classList.add('active');
            setTimeout(() => drawConnections(treeId), 50);
        } else {
            item.classList.remove('active');
        }
    }

    function createNode(skill, container, treeId) {
        const node = document.createElement('div');
        node.className = 'skill-node';
        node.style.left = skill.x + 'px';
        node.style.top = skill.y + 'px';
        node.dataset.id = skill.id;

        const iconPath = `../img/icons/skills/${skill.icon}`;
        
        node.innerHTML = `
            <div class="node-label">${skill.name}</div>
            <div class="node-icon-wrapper">
                <img src="${iconPath}" alt="${skill.name}" class="node-icon" onerror="this.src='../img/icons/skills_ico.png'">
            </div>
            <div class="node-level" id="lv-${skill.id}">0</div>
        `;

        node.addEventListener('mousedown', (e) => {
            if (e.button === 0) handleSkillClick(skill.id, treeId, currentMode === 'plus' ? 1 : -1);
            if (e.button === 2) {
                e.preventDefault();
                handleSkillClick(skill.id, treeId, -1);
            }
        });

        node.addEventListener('contextmenu', e => e.preventDefault());
        container.appendChild(node);
    }

    function handleSkillClick(id, treeId, dir) {
        const tree = SKILL_TREES[treeId];
        const skill = tree.skills.find(s => s.id === id);
        const amount = dir * currentStep;

        let nextLv = (levels[id] || 0) + amount;
        if (nextLv < 0) nextLv = 0;
        if (nextLv > skill.max) nextLv = skill.max;

        if (dir > 0) {
            const unmet = skill.reqIds.find(rid => (levels[rid] || 0) < 5);
            if (unmet) {
                const preSkill = tree.skills.find(s => s.id === unmet);
                alert(`Level 5 required for: ${preSkill ? preSkill.name : unmet}`);
                return;
            }
        }

        levels[id] = nextLv;
        if (dir < 0 && nextLv < 5) resetDependants(id, treeId);
        updateUI(treeId);
    }

    function resetDependants(parentId, treeId) {
        const tree = SKILL_TREES[treeId];
        tree.skills.forEach(s => {
            if (s.reqIds.includes(parentId) && levels[s.id] > 0) {
                levels[s.id] = 0;
                resetDependants(s.id, treeId);
            }
        });
    }

    function updateUI(treeId) {
        const tree = SKILL_TREES[treeId];
        tree.skills.forEach(s => {
            const lv = levels[s.id] || 0;
            const lvEl = document.getElementById(`lv-${s.id}`);
            if (lvEl) lvEl.textContent = lv;

            const node = document.querySelector(`.skill-node[data-id="${s.id}"]`);
            if (node) node.classList.toggle('active', lv > 0);
        });

        let treeSP = 0;
        tree.skills.forEach(s => treeSP += (levels[s.id] || 0));
        const spBadge = document.getElementById(`sp-${treeId}`);
        if (spBadge) spBadge.textContent = treeSP;

        updateTotalSP();
        drawConnections(treeId);
    }

    function updateTotalSP() {
        let total = 0;
        Object.values(levels).forEach(lv => total += lv);
        if (totalSPEl) totalSPEl.textContent = total;
    }

    function drawConnections(treeId) {
        const tree = SKILL_TREES[treeId];
        const svg = document.getElementById(`svg-${treeId}`);
        if (!svg) return;

        // Porting logic dari beta/skill_simulator.js drawSkillLine()
        // Node menggunakan CSS translate(-50%, -50%) jadi (x, y) = center
        svg.innerHTML = '';
        tree.skills.forEach(skill => {
            skill.reqIds.forEach(reqId => {
                const parent = tree.skills.find(s => s.id === reqId);
                if (!parent) return;

                const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                let d;

                if (parent.y === skill.y || parent.x === skill.x) {
                    // Garis lurus (horizontal atau vertikal)
                    d = `M ${parent.x} ${parent.y} L ${skill.x} ${skill.y}`;
                } else {
                    // Elbow: Vertikal dulu, lalu Horizontal (sama seperti beta)
                    d = `M ${parent.x} ${parent.y} L ${parent.x} ${skill.y} L ${skill.x} ${skill.y}`;
                }

                path.setAttribute("d", d);
                path.setAttribute("class", (levels[skill.id] || 0) > 0 ? 'path-active' : 'path-inactive');
                svg.appendChild(path);
            });
        });
    }

    function setStep(step) {
        currentStep = step;
        document.querySelectorAll('.btn-ctrl').forEach(b => {
            const val = parseInt(b.textContent);
            if (!isNaN(val)) b.classList.toggle('active', val === step);
        });
    }

    function setMode(mode) {
        currentMode = mode;
        document.querySelectorAll('.btn-ctrl').forEach(b => {
            if (b.textContent === '+') b.classList.toggle('active', mode === 'plus');
            if (b.textContent === '-') b.classList.toggle('active', mode === 'minus');
        });
    }

    function resetAll() {
        if (confirm("Reset ALL skill points across ALL trees?")) {
            Object.keys(levels).forEach(id => levels[id] = 0);
            Object.keys(SKILL_TREES).forEach(tid => updateUI(tid));
        }
    }

    function collapseAll() {
        document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
    }

    function loadFromSheets() {
        const accordion = document.getElementById('tree-accordion');
        
        if (!window.ToramSheets || !window.ToramSheets.fetchSheet) {
            console.error("ToramSheets core missing.");
            if (accordion) accordion.innerHTML = '<div style="padding:2rem;text-align:center;color:red;">Error: ToramSheets core (sheets.js) not loaded. Please clear your browser cache.</div>';
            return;
        }

        if (accordion) accordion.innerHTML = '<div style="padding:2rem;text-align:center;color:var(--text-color);">Loading Skill Data from Cloud...</div>';

        const sheetConfig = (window.ToramSheets.CONFIG && window.ToramSheets.CONFIG.SHEETS && window.ToramSheets.CONFIG.SHEETS.skilltrees) ? window.ToramSheets.CONFIG.SHEETS.skilltrees : { name: 'SkillTrees', gid: '1214207966' };

        window.ToramSheets.fetchSheet(sheetConfig).then(csv => {
            const rows = window.ToramSheets.parseCSV(csv);
            if (!rows.length) {
                if (accordion) accordion.innerHTML = '<div style="padding:2rem;text-align:center;">Error: No skill data found. Ensure "SkillTrees" tab is published.</div>';
                return;
            }

            // Grouping logic
            const treeMap = {};
            const parsedTrees = [];

            // Helper to find column values safely (ignoring header typos like trailing spaces)
            const getVal = (row, keys) => {
                for (let k of keys) {
                    if (row[k] !== undefined) return row[k];
                }
                for (let actualKey in row) {
                    let cleanKey = actualKey.trim().toLowerCase();
                    if (keys.includes(cleanKey)) return row[actualKey];
                }
                return '';
            };

            rows.forEach(row => {
                const treeId = String(getVal(row, ['tree_id']) || '').trim().toLowerCase();
                if (!treeId) return;

                let tIcon = String(getVal(row, ['tree_icon']) || '').trim();
                let finalIcon = tIcon ? (tIcon.toLowerCase().endsWith('.png') ? tIcon : tIcon + '.png') : 'skills_ico.png';
                
                if (!treeMap[treeId]) {
                    treeMap[treeId] = {
                        id: treeId,
                        label: getVal(row, ['tree_label']) || 'Unknown Tree',
                        width: parseInt(getVal(row, ['tree_width'])) || 980,
                        height: parseInt(getVal(row, ['tree_height'])) || 1000,
                        backgroundColor: getVal(row, ['tree_bg_color']) || '#ffffff',
                        icon: finalIcon,
                        visible: String(getVal(row, ['tree_visible'])).toUpperCase() !== 'FALSE',
                        star_gem_visible: String(getVal(row, ['tree_star_gem_usable', 'tree_star_gem_u'])).toUpperCase() === 'TRUE',
                        skills: []
                    };
                    parsedTrees.push(treeMap[treeId]);
                } else {
                    // Patch missing data if it appears in later rows
                    if (finalIcon !== 'skills_ico.png' && treeMap[treeId].icon === 'skills_ico.png') {
                        treeMap[treeId].icon = finalIcon;
                    }
                    let tLabel = getVal(row, ['tree_label']);
                    if (tLabel && treeMap[treeId].label === 'Unknown Tree') {
                        treeMap[treeId].label = tLabel;
                    }
                }

                // Append skill to the tree
                const rSkillId = String(getVal(row, ['skill_id']) || '').trim().toLowerCase();
                if (rSkillId) {
                    let preReqSplit = String(getVal(row, ['skill_prerequisite', 'skill_prerequisites']) || '').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
                    
                    treeMap[treeId].skills.push({
                        id: rSkillId,
                        name: getVal(row, ['skill_name']) || 'Unknown Skill',
                        level: 0,
                        star_gem_available: String(getVal(row, ['skill_star_gem_usable', 'skill_star_gem_available'])).toUpperCase() === 'TRUE',
                        star_gem_cost: parseInt(getVal(row, ['skill_star_gem_cost'])) || 0,
                        star_gem_level: parseInt(getVal(row, ['skill_star_gem_level'])) || 1,
                        star_gem_selected: false,
                        x: parseInt(getVal(row, ['skill_x'])) || 0,
                        y: parseInt(getVal(row, ['skill_y'])) || 0,
                        prerequisites: preReqSplit
                    });
                }
            });

            // Make it global so format stays exactly the same as old hardcoded behavior
            window.skillTrees = parsedTrees;
            init();

        }).catch(err => {
            console.error("Failed to load skill sheet:", err);
            if (accordion) accordion.innerHTML = '<div style="padding:2rem;text-align:center;color:red;">Error downloading skill data. Make sure your Google Sheet ID is correct and the tab is available.</div>';
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadFromSheets);
    } else {
        loadFromSheets();
    }
})();
