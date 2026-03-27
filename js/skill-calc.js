/**
 * ToramDB Skill Simulator Logic
 * v0.57.0 Prototype
 */

(function() {
    'use strict';

    // --- Configuration & Data ---
    let SKILL_TREES = {
        tamer: {
            name: "Tamer Skills",
            width: 700,
            height: 450,
            skills: [
                { id: 'taming', name: 'Taming', max: 10, x: 150, y: 100, icon: 'skills_ico.png' },
                { id: 'cap_tech', name: 'Capture Technique', max: 10, x: 350, y: 100, req: { id: 'taming', lv: 5 }, icon: 'skills_ico.png' },
                { id: 'cap_tech2', name: 'Capture Technique II', max: 10, x: 550, y: 100, req: { id: 'cap_tech', lv: 5 }, icon: 'skills_ico.png' },
                { id: 'skillful', name: 'Skillful Capture', max: 10, x: 350, y: 220, req: { id: 'taming', lv: 5 }, icon: 'skills_ico.png' },
                { id: 'careful', name: 'Careful Capture', max: 10, x: 550, y: 220, req: { id: 'skillful', lv: 5 }, icon: 'skills_ico.png' },
                { id: 'pet_heal', name: 'Pet Heal', max: 10, x: 350, y: 340, req: { id: 'taming', lv: 5 }, icon: 'skills_ico.png' },
                { id: 'pet_mp', name: 'Pet MP Charge', max: 10, x: 550, y: 340, req: { id: 'pet_heal', lv: 5 }, icon: 'skills_ico.png' }
            ]
        }
    };

    // Merge with external beta data if available
    if (window.skillTrees) {
        window.skillTrees.forEach(tree => {
            SKILL_TREES[tree.id] = {
                name: tree.label || tree.name,
                width: tree.width || 800,
                height: tree.height || 600,
                skills: tree.skills.map(s => ({
                    id: s.id,
                    name: s.name,
                    max: s.max || 10,
                    x: s.x,
                    y: s.y,
                    // Convert prerequisites array to our req object format
                    req: s.prerequisites && s.prerequisites.length > 0 ? { id: s.prerequisites[0], lv: 5 } : (s.req || null),
                    icon: s.icon ? s.icon.split('/').pop() : 'skills_ico.png'
                }))
            };
        });
    }

    // State
    let currentTreeId = 'tamer';
    let levels = {}; // skillId: currentLv

    // Dom Elements
    const treeContainer = document.getElementById('treeContainer');
    const nodesLayer = document.getElementById('nodesLayer');
    const treeSVG = document.getElementById('treeSVG');
    const totalSPEl = document.getElementById('totalSP');
    const treeTitleEl = document.getElementById('treeTitle');
    const treeSelector = document.getElementById('treeSelector');
    const resetBtn = document.getElementById('resetBtn');

    // --- Initialization ---
    function init() {
        if (!treeContainer) return;

        // Populate Tree Selector
        treeSelector.innerHTML = '';
        Object.keys(SKILL_TREES).forEach(id => {
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = SKILL_TREES[id].name;
            treeSelector.appendChild(opt);
        });

        // Load Default (Try to find first added beta tree if tamer is empty)
        const defaultTree = window.skillTrees && window.skillTrees.length > 0 ? window.skillTrees[0].id : 'tamer';
        loadTree(defaultTree);
        treeSelector.value = defaultTree;

        // Events
        treeSelector.addEventListener('change', (e) => loadTree(e.target.value));
        resetBtn.addEventListener('click', resetTree);
        
        // Prevent context menu on nodes for level down
        nodesLayer.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.skill-node')) e.preventDefault();
        });
    }

    // --- Core Logic ---

    function loadTree(id) {
        const tree = SKILL_TREES[id];
        if (!tree) return;

        currentTreeId = id;
        treeTitleEl.textContent = tree.name;
        
        // Resize container
        treeContainer.style.width = tree.width + 'px';
        treeContainer.style.height = tree.height + 'px';
        
        // Reset state for this tree if not exists
        tree.skills.forEach(s => {
            if (levels[s.id] === undefined) levels[s.id] = 0;
        });

        render();
    }

    function render() {
        const tree = SKILL_TREES[currentTreeId];
        
        // Clean
        nodesLayer.innerHTML = '';
        treeSVG.innerHTML = '';

        // Draw Connections
        tree.skills.forEach(skill => {
            if (skill.req) {
                const parent = tree.skills.find(s => s.id === skill.req.id);
                if (parent) {
                    drawConnection(parent, skill);
                }
            }
        });

        // Draw Nodes
        tree.skills.forEach(skill => {
            createNode(skill);
        });

        updateSP();
    }

    function createNode(skill) {
        const lv = levels[skill.id] || 0;
        const locked = isLocked(skill);
        
        const node = document.createElement('div');
        node.className = `skill-node ${lv > 0 ? 'active' : ''} ${lv >= skill.max ? 'max' : ''} ${locked ? 'locked' : ''}`;
        node.style.left = skill.x + 'px';
        node.style.top = skill.y + 'px';
        node.dataset.id = skill.id;

        const iconPath = `../img/icons/skills/${skill.icon}`;
        
        node.innerHTML = `
            <div class="node-label">${skill.name}</div>
            <div class="node-icon-wrapper">
                <img src="${iconPath}" alt="${skill.name}" class="node-icon" onerror="this.src='../img/icons/skills_ico.png'">
            </div>
            <div class="node-level">${lv}</div>
        `;

        node.addEventListener('mousedown', (e) => {
            if (locked) return;
            if (e.button === 0) changeLevel(skill.id, 1); // Left Click
            if (e.button === 2) changeLevel(skill.id, -1); // Right Click
        });

        nodesLayer.appendChild(node);
    }

    function drawConnection(p, c) {
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const lvP = levels[p.id] || 0;
        const reqLv = SKILL_TREES[currentTreeId].skills.find(s => s.id === c.id).req.lv;
        
        const isActive = lvP >= reqLv;
        
        // Elbow path logic
        let d = '';
        if (p.y === c.y) {
            // Straight horizontal
            d = `M ${p.x} ${p.y} L ${c.x} ${c.y}`;
        } else if (p.x === c.x) {
            // Straight vertical
            d = `M ${p.x} ${p.y} L ${c.x} ${c.y}`;
        } else {
            // Elbow (Spine logic)
            // If child is to the right and different Y
            // Draw horizontal from spine
            d = `M ${p.x} ${c.y} L ${c.x} ${c.y}`;
            
            // Draw vertical spine segment if not already drawn
            // (Simple implementation: just draw per connection for now)
            d += ` M ${p.x} ${p.y} L ${p.x} ${c.y}`;
        }

        path.setAttribute("d", d);
        path.setAttribute("class", `tree-line ${isActive ? 'active' : ''}`);
        treeSVG.appendChild(path);
    }

    function isLocked(skill) {
        if (!skill.req) return false;
        const parentLv = levels[skill.req.id] || 0;
        return parentLv < skill.req.lv;
    }

    function changeLevel(id, delta) {
        const skill = SKILL_TREES[currentTreeId].skills.find(s => s.id === id);
        if (!skill) return;

        let newLv = (levels[id] || 0) + delta;
        if (newLv < 0) newLv = 0;
        if (newLv > skill.max) newLv = skill.max;

        if (delta > 0 && isLocked(skill)) return;

        levels[id] = newLv;

        // Cascade Down: if level decreased and children depend on it
        if (delta < 0) {
            checkDependants(id);
        }

        render();
    }

    function checkDependants(parentId) {
        const parentLv = levels[parentId] || 0;
        SKILL_TREES[currentTreeId].skills.forEach(s => {
            if (s.req && s.req.id === parentId) {
                if (parentLv < s.req.lv) {
                    levels[s.id] = 0; // Reset child
                    checkDependants(s.id); // Recursive
                }
            }
        });
    }

    function updateSP() {
        let total = 0;
        Object.values(levels).forEach(lv => total += lv);
        totalSPEl.textContent = total;
    }

    function resetTree() {
        const tree = SKILL_TREES[currentTreeId];
        tree.skills.forEach(s => levels[s.id] = 0);
        render();
    }

    // Run
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
