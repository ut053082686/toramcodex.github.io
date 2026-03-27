const bgInactive = "./icons/sk_inactive_icon.png";
const bgActive = "./icons/sk_active_icon.png";
const treeCanvasCache = new Map();
const cacheTimers = new Map();
const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;

let viewOnly = false;
const drawer = document.getElementById("drawer");
const drawerContent = document.getElementById("drawerContent");
const selectedSkillsContainer = document.getElementById("selectedSkills");

function toggleStarGemModal() {
  const modal = document.getElementById("starGemModal");
  modal.classList.toggle("hidden");
  updateStarGemModal();
}

function updateStarGemModal() {
  const container = document.getElementById("starGemAccordion");
  container.innerHTML = "";

  window.skillTrees.forEach((tree, index) => {
    if (!tree.star_gem_visible) return;

    const availableSkills = tree.skills.filter((s) => s.star_gem_available);
    if (availableSkills.length === 0) return;

    const wrapper = document.createElement("div");
    wrapper.className = "rounded";

    const headerId = `header-${tree.id}`;
    const contentId = `content-${tree.id}`;

    wrapper.innerHTML = `
      <button class="w-full text-left text-white px-4 py-3 bg-gray-700 hover:bg-gray-600 font-semibold text-lg rounded-t" onclick="toggleAccordion('${contentId}')">
        <div class="flex items-center space-x-2">
          <img src="${tree.icon}" class="w-6 h-6 mr-2">  
          ${tree.label}
        </div>
      </button>

      <div id="${contentId}" class="hidden p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-700">
        ${availableSkills
          .map((skill) => {
            return `
              <div class="flex flex-row items-center gap-4 bg-gray-800 border border-gray-600 rounded p-3 text-white shadow-sm text-sm">
                
                <img src="${"./icons/skills/sk_" + skill.id + ".png"}" alt="${
              skill.name
            }" class="w-10 h-10 rounded object-contain">

                <div class="flex-1 font-semibold">${skill.name}</div>

                ${
                  viewOnly
                    ? `
                    <span class="text-gray-300 text-sm whitespace-nowrap">Lv ${skill.star_gem_level}</span>
                    <span class="text-blue-400 font-semibold whitespace-nowrap">Cost ${skill.star_gem_cost}</span>
                  `
                    : `
                    <label class="flex items-center gap-2">
                      <span class="text-gray-300">Lv</span>
                      <select 
                        onchange="setStarGemLevel('${tree.id}', '${
                        skill.id
                      }', this.value)" 
                        class="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm">
                        ${[...Array(10)]
                          .map(
                            (_, i) =>
                              `<option value="${i + 1}" ${
                                skill.star_gem_level == i + 1 ? "selected" : ""
                              }>${i + 1}</option>`
                          )
                          .join("")}
                      </select>
                    </label>

                    <span class="text-blue-400 font-semibold whitespace-nowrap">Cost ${
                      skill.star_gem_cost
                    }</span>

                    <input type="checkbox" 
                      ${skill.star_gem_selected ? "checked" : ""}
                      onchange="toggleSelectStarGem('${tree.id}', '${
                        skill.id
                      }')"
                      class="form-checkbox accent-blue-500">
                  `
                }
              </div>
            `;
          })
          .join("")}
      </div>
    `;

    container.appendChild(wrapper);
  });
}

function toggleAccordion(id) {
  const el = document.getElementById(id);
  el.classList.toggle("hidden");
}

function setStarGemLevel(treeId, skillId, level) {
  if (viewOnly) return;
  const tree = window.skillTrees.find((t) => t.id === treeId);
  const skill = tree.skills.find((s) => s.id === skillId);
  skill.star_gem_level = Math.max(parseInt(level), 1);
  updateSelectedStarGemPanel();
  renderSkills(tree);
}
function toggleSelectStarGem(treeId, skillId) {
  if (viewOnly) return;
  const tree = window.skillTrees.find((t) => t.id === treeId);
  const skill = tree.skills.find((s) => s.id === skillId);
  skill.star_gem_selected = !skill.star_gem_selected;
  updateSelectedStarGemPanel();
  renderSkills(tree);
}

function updateSelectedStarGemPanel() {
  const container = document.getElementById("selectedSkills");
  const summary = document.getElementById("starGemSummary");
  container.innerHTML = "";

  let selectedCount = 0;
  let totalCost = 0;

  window.skillTrees.forEach((tree) => {
    tree.skills.forEach((skill) => {
      if (skill.star_gem_selected && skill.star_gem_available) {
        selectedCount++;
        totalCost += skill.star_gem_cost;

        const card = document.createElement("div");
        card.className =
          "flex items-center gap-4 bg-gray-800 text-white p-3 rounded shadow border border-gray-400";

        card.innerHTML = `
          <img src="${"./icons/skills/sk_" + skill.id + ".png"}" alt="${
          skill.name
        }" class="w-10 h-10 object-contain rounded">
          <div class="flex-1">
            <div class="font-semibold">${skill.name}</div>
            <div class="text-sm text-gray-300">Level ${
              skill.star_gem_level
            }</div>
            <div class="text-sm text-gray-400">Cost ${skill.star_gem_cost}</div>
          </div>
        `;

        container.appendChild(card);
      }
    });
  });

  summary.textContent = `(${totalCost} Cost${totalCost !== 1 ? "s" : ""})`;

  if (!viewOnly) {
    const addButton = document.createElement("button");
    addButton.onclick = toggleStarGemModal;
    addButton.className =
      "flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow p-4 text-sm transition-all h-24";

    addButton.innerHTML = `
    <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" stroke-width="2"
      viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 4v16m8-8H4"></path>
    </svg>
    Add/Remove Star Gems
  `;
    container.appendChild(addButton);
  }
}

updateSelectedStarGemPanel();
function getTreeById(id) {
  return window.skillTrees.find((t) => t.id === id);
}
function updateTreeHeaderSP(tree) {
  const headerLabel = document.querySelector(
    `#tree-header-${tree.id} .tree-label`
  );
  if (headerLabel) {
    const totalSP = tree.skills.reduce((sum, s) => sum + s.level, 0);
    headerLabel.textContent = `${tree.label} (${totalSP} SP)`;
  }
  updateTotalSPDisplay();
}
function resetAllSkills() {
  window.skillTrees.forEach((tree) => {
    tree.skills.forEach((skill) => {
      skill.level = 0;
    });
  });
  renderSkills(tree);
  updateTreeHeaderSP(tree);
}
let openDrawers = {};
function toggleDrawer(tree) {
  const box = document.getElementById(`treeBox-${tree.id}`);
  const toggleIcon = document.getElementById(`toggle-icon-${tree.id}`);

  const isOpen = openDrawers[tree.id] === true;

  if (isOpen) {
    box.style.display = "none";
    openDrawers[tree.id] = false;
  } else {
    box.style.display = "block";
    openDrawers[tree.id] = true;
  }

  toggleIcon.classList.add("opacity-0");

  setTimeout(() => {
    toggleIcon.src = isOpen
      ? "./icons/drawer_inactive.png"
      : "./icons/drawer_active.png";

    toggleIcon.classList.remove("opacity-0");
  }, 150);
}

function renderTreeDrawer() {
  const container = document.getElementById("treeDrawer");
  container.innerHTML = "";

  window.skillTrees.forEach((tree) => {
    if (!tree.visible) {
      return;
    }
    const availableWidth = container.offsetWidth || window.innerWidth;
    const scale = Math.min(1, availableWidth / tree.width);
    const totalSP = tree.skills.reduce((sum, s) => sum + s.level, 0);

    const wrapper = document.createElement("div");
    wrapper.className = "mb-6";

    const header = document.createElement("div");
    header.id = `tree-header-${tree.id}`;
    header.className =
      "cursor-pointer bg-gray-700 text-white px-4 py-3 text-sm sm:text-base rounded-t flex items-center justify-between hover:bg-gray-600";
    header.onclick = () => toggleDrawer(tree);

    const leftSection = document.createElement("div");
    leftSection.className = "flex items-center space-x-2";

    const headerIcon = document.createElement("img");
    headerIcon.src = tree.icon;
    headerIcon.className = "w-6 h-6";
    leftSection.appendChild(headerIcon);

    const label = document.createElement("span");
    label.className = "tree-label text-lg font-semibold";
    label.innerText = `${tree.label} (${totalSP} SP)`;
    leftSection.appendChild(label);

    header.appendChild(leftSection);

    const rightSection = document.createElement("div");
    rightSection.className = "flex items-center space-x-2";

    if (totalSP > 0 && !viewOnly) {
      const resetBtn = document.createElement("button");
      resetBtn.innerText = "Reset";
      resetBtn.className =
        "text-sm font-semibold px-6 py-1 bg-red-500 text-white rounded";
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        tree.skills.forEach((s) => (s.level = 0));
        renderSkills(tree);
        updateTreeHeaderSP(tree);
        renderTreeDrawer();
      };
      rightSection.appendChild(resetBtn);
    }

    const toggleIcon = document.createElement("img");
    toggleIcon.id = `toggle-icon-${tree.id}`;
    toggleIcon.src = openDrawers[tree.id]
      ? "./icons/drawer_active.png"
      : "./icons/drawer_inactive.png";
    toggleIcon.className =
      "w-4 h-4 transition-opacity duration-300 ease-in-out filter invert";
    rightSection.appendChild(toggleIcon);

    header.appendChild(rightSection);

    const contentBox = document.createElement("div");
    contentBox.id = `treeBox-${tree.id}`;
    if (viewOnly) {
      contentBox.style.display = totalSP > 0 ? "block" : "none";
    } else {
      contentBox.style.display = openDrawers[tree.id] ? "block" : "none";
    }
    contentBox.style.width = "100%";
    contentBox.style.height = `${tree.height * scale}px`;
    contentBox.style.backgroundColor = "black";
    contentBox.className = "rounded overflow-hidden relative";

    if (viewOnly) {
      toggleIcon.src = "./icons/drawer_active.png";
    }

    const scaledContainer = document.createElement("div");
    scaledContainer.style.position = "relative";
    scaledContainer.style.width = `${tree.width}px`;
    scaledContainer.style.height = `${tree.height}px`;
    scaledContainer.style.transform = `scale(${scale})`;
    scaledContainer.style.transformOrigin = "top left";

    scaledContainer.style.minWidth = `${tree.width}px`;
    scaledContainer.style.minHeight = `${tree.height}px`;

    const canvas = document.createElement("canvas");
    canvas.id = `canvas-${tree.id}`;
    canvas.width = tree.width;
    canvas.height = tree.height;
    canvas.className =
      "skill-canvas absolute top-0 left-0 w-full h-full pointer-events-none z-0";
    scaledContainer.appendChild(canvas);

    const skillContainer = document.createElement("div");
    skillContainer.id = `skills-${tree.id}`;
    skillContainer.className = "relative z-10 w-full h-full";
    scaledContainer.appendChild(skillContainer);

    const centerWrapper = document.createElement("div");
    centerWrapper.className = "w-full overflow-x-auto overflow-y-hidden";
    centerWrapper.style.display = "flex";
    centerWrapper.style.justifyContent = "flex-start";
    centerWrapper.style.alignItems = "center";

    centerWrapper.appendChild(scaledContainer);
    contentBox.style.overflowX = "auto";
    contentBox.style.maxWidth = "100%";

    contentBox.appendChild(centerWrapper);

    wrapper.appendChild(header);
    wrapper.appendChild(contentBox);
    container.appendChild(wrapper);

    drawSkillLines(tree, canvas);
    renderSkills(tree);
  });
}

function renderSkills(tree) {
  const container = document.getElementById(`skills-${tree.id}`);
  if (!container) return;
  container.innerHTML = "";

  tree.skills.forEach((skill) => {
    const skillDiv = document.createElement("div");
    skillDiv.className = "absolute";
    skillDiv.style.left = `${(skill.x / tree.width) * 100}%`;
    skillDiv.style.top = `${(skill.y / tree.height) * 100}%`;
    skillDiv.style.width = "min(64px, 14vw)";
    skillDiv.style.height = "min(64px, 14vw)";

    skillDiv.style.pointerEvents = "auto";

    const levelLabel = document.createElement("div");

    let levelText = `${skill.level}`;

    if (skill.star_gem_selected && skill.star_gem_level > 0) {
      levelLabel.textContent = `${skill.level} / `;

      const starSpan = document.createElement("span");
      starSpan.className = "inline-flex items-center ml-1";

      const starLevelSpan = document.createElement("span");
      starLevelSpan.textContent = skill.star_gem_level;
      starLevelSpan.className = "text-yellow-400 font-semibold";

      const starIcon = document.createElement("img");
      starIcon.src = "./icons/sg_icon.png";
      starIcon.alt = "Star Gem";
      starIcon.className = "w-4 h-4 ml-1 object-contain";

      starSpan.appendChild(starLevelSpan);
      starSpan.appendChild(starIcon);

      levelLabel.appendChild(starSpan);
    } else {
      levelLabel.textContent = levelText;
    }

    levelLabel.className =
      "absolute font-semibold text-white text-base font-bold text-center";
    levelLabel.style.left = "0";
    levelLabel.style.width = "64px";
    levelLabel.style.bottom = "-25px";
    levelLabel.style.padding = "3px 0 3px 0";
    levelLabel.style.backgroundColor = "black";
    levelLabel.style.zIndex = "1";
    skillDiv.appendChild(levelLabel);

    const bg = document.createElement("img");
    bg.src = skill.level > 0 ? bgActive : bgInactive;
    bg.className = "absolute w-16 h-16 object-contain";
    bg.style.zIndex = "2";
    skillDiv.appendChild(bg);

    const iconWrapper = document.createElement("div");
    iconWrapper.className =
      "absolute w-12 h-12 flex items-center justify-center";
    iconWrapper.style.left = "50%";
    iconWrapper.style.top = "50%";
    iconWrapper.style.transform = "translate(-50%, -50%)";
    iconWrapper.style.zIndex = "3";

    const icon = document.createElement("img");
    icon.src = `./icons/skills/sk_${skill.id}.png`;
    icon.className =
      "w-full h-full object-contain cursor-pointer max-w-[14vw] max-h-[14vw]";
    icon.onmousedown = (e) => {
      e.preventDefault();

      const isCtrl = e.ctrlKey;
      const increment = isCtrl ? 10 : selectedIncrement;

      if (e.button === 0) {
        if (isAddMode) {
          levelUp(skill.id, tree, increment);
        } else {
          if (isMobile) {
            levelUp(skill.id, tree, increment);
          } else {
            isAddMode = true;
            updateLevelPanelUI();
            levelUp(skill.id, tree, increment);
          }
        }
      } else if (e.button === 2) {
        if (isAddMode) {
          isAddMode = false;
          updateLevelPanelUI();
          levelUp(skill.id, tree, increment);
        } else {
          levelUp(skill.id, tree, increment);
        }
      }
    };

    icon.onmouseenter = () => {
      const canvas = document.getElementById(`canvas-${tree.id}`);
      drawSkillLines(tree, canvas, skill.id);
    };

    icon.onmouseleave = () => {
      const canvas = document.getElementById(`canvas-${tree.id}`);
      drawSkillLines(tree, canvas);
    };

    icon.oncontextmenu = (e) => e.preventDefault();

    iconWrapper.appendChild(icon);
    skillDiv.appendChild(iconWrapper);

    const nameLabel = document.createElement("div");
    nameLabel.innerText = skill.name;
    nameLabel.className =
      "absolute text-xs sm:text-sm font-semibold px-2 py-0.5 rounded text-center bg-black bg-opacity-80 text-white";
    nameLabel.style.left = "50%";
    nameLabel.style.transform = "translateX(-50%)";
    nameLabel.style.top = "-20px";
    nameLabel.style.padding = "0px 0 10px 0";
    nameLabel.style.backgroundColor = "black";
    nameLabel.style.whiteSpace = "nowrap";
    nameLabel.style.zIndex = "1";
    skillDiv.appendChild(nameLabel);

    container.appendChild(skillDiv);
  });
}
function importSkillBuildFromText(text) {
  showLoading();

  setTimeout(() => {
    const lines = text.split(/\r?\n/);
    let currentTree = null;
    let inStarGemSection = false;

    let importedCount = 0;
    let skippedCount = 0;
    let importedStarGemCount = 0;

    lines.forEach((line) => {
      line = line.trim();
      if (!line) return;

      if (line.startsWith("[Star Gems]")) {
        inStarGemSection = true;
        currentTree = null;
        return;
      }

      const treeMatch = line.match(/^\[(.+?)\] \(\d+ SP\)$/);
      if (treeMatch) {
        const treeLabel = treeMatch[1];
        currentTree = window.skillTrees.find((t) => t.label === treeLabel);

        if (!currentTree) {
          showToast(`Tree "${treeLabel}" not found`, "error", 400);
          currentTree = null;
        }

        inStarGemSection = false;
        return;
      }

      if (inStarGemSection) {
        const starGemMatch = line.match(/^- (.+?) Lv\.(\d+) \(Cost (\d+)\)/);
        if (starGemMatch) {
          const skillName = starGemMatch[1];
          const starGemLevel = parseInt(starGemMatch[2]);

          let skill = null;
          for (const tree of window.skillTrees) {
            skill = tree.skills.find((s) => s.name === skillName);
            if (skill) break;
          }

          if (skill && skill.star_gem_available) {
            skill.star_gem_selected = true;
            skill.star_gem_level = starGemLevel;
            importedStarGemCount++;
          } else {
            showToast(
              `Star Gem "${skillName}" not found or not available`,
              "error",
              400
            );
            skippedCount++;
          }
        }

        return;
      }

      const skillMatch = line.match(/^- (.+?) Lv\.(\d+)/);
      if (skillMatch && currentTree) {
        const skillName = skillMatch[1];
        let level = parseInt(skillMatch[2]);

        if (isNaN(level)) {
          showToast(`Invalid level for "${skillName}"`, "error", 400);
          skippedCount++;
          return;
        }

        level = Math.max(0, Math.min(10, level));
        const skill = currentTree.skills.find((s) => s.name === skillName);
        if (skill) {
          skill.level = level;
          importedCount++;
        } else {
          showToast(`Skill "${skillName}" not found`, "error", 400);
          skippedCount++;
        }
      }
    });

    window.skillTrees.forEach((tree) => {
      renderSkills(tree);
      updateTreeHeaderSP(tree);
    });

    hideLoading();

    showToast(
      `Import complete.\n\nImported: ${importedCount} skill(s)\nImported: ${importedStarGemCount} Star Gem(s)\nSkipped: ${skippedCount}`,
      "success",
      4000
    );
  }, 100);
}

let selectedIncrement = 1;
let isAddMode = true;

function createLevelControlPanel() {
  if (viewOnly) return;

  const controlPanel = document.createElement("div");
  controlPanel.id = "levelControlPanel";
  controlPanel.className =
    "fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50";

  const panelRow = document.createElement("div");
  panelRow.className = "flex flex-row items-center justify-center gap-4";

  const incrementButtons = {};

  const incPanel = document.createElement("div");
  incPanel.className =
    "bg-gray-800 text-white font-semibold p-3 rounded shadow-lg border border-blue-400 flex flex-row gap-2";

  [1, 5, 10].forEach((val) => {
    const btn = document.createElement("button");
    btn.innerText = val;
    btn.className =
      "w-10 h-10 text-lg flex items-center justify-center rounded bg-gray-600 hover:bg-gray-500 transition";
    btn.onclick = () => {
      selectedIncrement = val;
      updateLevelPanelUI();
    };
    incrementButtons[val] = btn;
    incPanel.appendChild(btn);
  });

  const modePanel = document.createElement("div");
  modePanel.className =
    "bg-gray-800 text-white font-semibold p-3 rounded shadow-lg border border-blue-400 flex flex-row gap-2";

  const plusBtn = document.createElement("button");
  plusBtn.innerText = "+";
  plusBtn.className =
    "w-10 h-10 text-lg flex items-center justify-center rounded bg-gray-600 hover:bg-gray-500 transition";
  plusBtn.onclick = () => {
    isAddMode = true;
    updateLevelPanelUI();
  };

  const minusBtn = document.createElement("button");
  minusBtn.innerText = "-";
  minusBtn.className =
    "w-10 h-10 text-lg flex items-center justify-center rounded bg-gray-600 hover:bg-gray-500 transition";
  minusBtn.onclick = () => {
    isAddMode = false;
    updateLevelPanelUI();
  };

  modePanel.appendChild(plusBtn);
  modePanel.appendChild(minusBtn);

  const exportImportPanel = document.createElement("div");
  exportImportPanel.className =
    "relative bg-gray-800 text-white font-semibold p-3 rounded shadow-lg border border-blue-400 flex flex-row gap-2";

  const exportBtn = document.createElement("button");
  exportBtn.innerHTML = "📤";
  exportBtn.title = "Export Options";
  exportBtn.className =
    "w-10 h-10 text-lg flex items-center justify-center rounded bg-gray-600 hover:bg-gray-500 transition relative";

  const exportMenu = document.createElement("div");
  exportMenu.className =
    "absolute bottom-full mb-2 left-0 bg-gray-600 text-blue-400 rounded shadow-lg z-50 hidden";
  exportMenu.style.minWidth = "120px";

  const imageOption = document.createElement("div");
  imageOption.innerText = "🖼️ To Image";
  imageOption.className =
    "px-3 py-2 hover:bg-blue-100 cursor-pointer border-b border-gray-200";
  imageOption.onclick = () => {
    exportTreeToImage();
    exportMenu.classList.add("hidden");
  };

  const textOption = document.createElement("div");
  textOption.innerText = "📄 To Text";
  textOption.className = "px-3 py-2 hover:bg-blue-100 cursor-pointer";
  textOption.onclick = () => {
    exportAllActiveTreesToText();
    exportMenu.classList.add("hidden");
  };

  exportMenu.appendChild(imageOption);
  exportMenu.appendChild(textOption);
  exportBtn.onclick = () => {
    exportMenu.classList.toggle("hidden");
  };

  exportImportPanel.appendChild(exportBtn);
  exportImportPanel.appendChild(exportMenu);

  const importLabel = document.createElement("label");
  importLabel.title = "Import Skill Build";
  importLabel.className =
    "w-10 h-10 text-lg flex items-center justify-center rounded bg-gray-600 hover:bg-gray-500 transition cursor-pointer";
  importLabel.innerText = "📥";

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".txt";
  importInput.className = "hidden";
  importInput.onchange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      importSkillBuildFromText(text);
    };
    reader.readAsText(file);
  };

  importLabel.appendChild(importInput);
  exportImportPanel.appendChild(importLabel);

  panelRow.appendChild(incPanel);
  panelRow.appendChild(modePanel);
  panelRow.appendChild(exportImportPanel);
  controlPanel.appendChild(panelRow);
  document.body.appendChild(controlPanel);

  controlPanel._incrementButtons = incrementButtons;
  controlPanel._modeButtons = {
    add: plusBtn,
    subtract: minusBtn,
  };

  updateLevelPanelUI();
}

function showLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.remove("opacity-0", "pointer-events-none");
    loadingScreen.classList.add("opacity-100");
  }
}

function hideLoading() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("opacity-0", "pointer-events-none");
    loadingScreen.classList.remove("opacity-100");
  }
}

// ######################### EXPORT ########################## //
function exportAllActiveTreesToText() {
  const totalSP = calculateTotalSP();
  let output = `Total SP Used: ${totalSP}\n\n`;

  let starGemSkills = [];
  let totalStarGemCost = 0;

  window.skillTrees.forEach((tree) => {
    tree.skills.forEach((skill) => {
      if (skill.star_gem_selected) {
        starGemSkills.push({
          name: skill.name,
          starGemLevel: skill.star_gem_level,
          starGemCost: skill.star_gem_cost,
        });
        totalStarGemCost += skill.star_gem_cost;
      }
    });
  });

  if (starGemSkills.length > 0) {
    output += `[Star Gems] (${totalStarGemCost} Costs)\n`;
    starGemSkills.forEach((skill) => {
      output += `- ${skill.name} Lv.${skill.starGemLevel} (Cost ${skill.starGemCost})\n`;
    });
    output += `\n`;
  }

  window.skillTrees.forEach((tree) => {
    const activeSkills = tree.skills.filter((skill) => skill.level > 0);
    if (activeSkills.length === 0) return;

    const treeSP = activeSkills.reduce((sum, s) => sum + s.level, 0);
    output += `[${tree.label}] (${treeSP} SP)\n`;

    activeSkills.forEach((skill) => {
      output += `- ${skill.name} Lv.${skill.level}\n`;
    });

    output += `\n`;
  });

  if (!output.trim()) {
    alert("No active skills or Star Gems to export.");
    return;
  }

  const blob = new Blob([output], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  const today = new Date().toISOString().split("T")[0];
  link.download = `VeneNako-Skill-Build-${today}.txt`;
  link.click();
}

function exportTreeToImage() {
  showLoading();

  const exportWrapper = document.createElement("div");
  exportWrapper.style.position = "absolute";
  exportWrapper.style.top = "-9999px";
  exportWrapper.style.left = "0";
  exportWrapper.style.width = "1000px";
  exportWrapper.style.backgroundColor = "black";
  exportWrapper.style.padding = "20px";
  exportWrapper.style.display = "flex";
  exportWrapper.style.flexDirection = "column";
  exportWrapper.style.gap = "20px";

  document.body.appendChild(exportWrapper);

  const includedTrees = window.skillTrees.filter((tree) => {
    const totalSP = tree.skills.reduce((sum, s) => sum + s.level, 0);
    return tree.visible && totalSP > 0;
  });

  if (includedTrees.length === 0) {
    alert("No skill trees with SP used to export.");
    exportWrapper.remove();
    hideLoading();
    return;
  }

  includedTrees.forEach((tree) => {
    const original = document.getElementById(`treeBox-${tree.id}`);
    if (original) {
      const clone = original.cloneNode(true);

      const originalCanvas = document.getElementById(`canvas-${tree.id}`);
      if (originalCanvas) {
        const img = new Image();
        img.src = originalCanvas.toDataURL("image/png");
        img.className = originalCanvas.className;
        img.style.position = originalCanvas.style.position;
        img.style.top = originalCanvas.style.top;
        img.style.left = originalCanvas.style.left;
        img.style.width = originalCanvas.style.width;
        img.style.height = originalCanvas.style.height;

        const cloneCanvas = clone.querySelector(`#canvas-${tree.id}`);
        if (cloneCanvas && cloneCanvas.parentNode) {
          cloneCanvas.parentNode.replaceChild(img, cloneCanvas);
        }
      }

      clone.style.display = "block";
      clone.style.width = "auto";
      exportWrapper.appendChild(clone);
    }
  });

  setTimeout(() => {
    html2canvas(exportWrapper, {
      backgroundColor: "#000",
      scale: 2,
      useCORS: true,
    })
      .then((canvas) => {
        const link = document.createElement("a");
        const today = new Date().toISOString().split("T")[0];
        link.download = `VeneNako-Skill-Build-${today}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        exportWrapper.remove();
        hideLoading();
      })
      .catch((err) => {
        console.error("Export failed:", err);
        exportWrapper.remove();
        hideLoading();
      });
  }, 100);
}

function updateLevelPanelUI() {
  const panel = document.getElementById("levelControlPanel");
  if (!panel) return;

  Object.entries(panel._incrementButtons).forEach(([value, btn]) => {
    if (parseInt(value) === selectedIncrement) {
      btn.classList.remove("bg-gray-600");
      btn.classList.add("bg-blue-400");
    } else {
      btn.classList.remove("bg-blue-400");
      btn.classList.add("bg-gray-600");
    }
  });

  const { add, subtract } = panel._modeButtons;
  if (isAddMode) {
    add.classList.add("bg-blue-400");
    add.classList.remove("bg-gray-600");
    subtract.classList.add("bg-gray-600");
    subtract.classList.remove("bg-blue-400");
  } else {
    subtract.classList.add("bg-blue-400");
    subtract.classList.remove("bg-gray-600");
    add.classList.add("bg-gray-600");
    add.classList.remove("bg-blue-400");
  }
}
function enforcePrerequisiteLimits(tree) {
  const skillMap = Object.fromEntries(tree.skills.map((s) => [s.id, s]));

  let changed;
  do {
    changed = false;

    tree.skills.forEach((skill) => {
      if (skill.level > 0) {
        const hasInvalidPrereq = skill.prerequisites.some((prId) => {
          const prereq = skillMap[prId];
          return !prereq || prereq.level < 5;
        });

        if (hasInvalidPrereq) {
          skill.level = 0;
          changed = true;
        }
      }
    });
  } while (changed);
}
function levelUp(skillId, tree, increment) {
  if (viewOnly) return;
  const skill = tree.skills.find((s) => s.id === skillId);
  if (!skill) return;

  increment = Math.abs(increment);

  if (isAddMode) {
    skill.prerequisites.forEach((prId) => {
      const prereq = tree.skills.find((s) => s.id === prId);
      if (prereq && prereq.level < 5) {
        levelUpToFive(prId, tree);
      }
    });

    skill.level = Math.min(10, skill.level + increment);
  } else {
    skill.level = Math.max(0, skill.level - increment);
    enforcePrerequisiteLimits(tree);
  }

  renderSkills(tree);
  updateTreeHeaderSP(tree);
}

function levelUpToFive(skillId, tree) {
  const skill = tree.skills.find((s) => s.id === skillId);
  if (!skill || skill.level >= 5) return;

  skill.prerequisites.forEach((pr) => {
    const pre = tree.skills.find((s) => s.id === pr);
    if (pre && pre.level < 5) levelUpToFive(pre.id, tree);
  });
  skill.level = 5;
}

function getAllPrerequisiteSkillIds(skill, skillMap, collected = new Set()) {
  if (!skill || !skill.prerequisites) return collected;

  skill.prerequisites.forEach((id) => {
    if (!collected.has(id)) {
      collected.add(id);
      const prereqSkill = skillMap[id];
      getAllPrerequisiteSkillIds(prereqSkill, skillMap, collected);
    }
  });

  return collected;
}

function drawSkillLines(tree, canvas, hoveredSkillId = null) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const skillMap = Object.fromEntries(tree.skills.map((s) => [s.id, s]));

  const highlightChain = new Set();
  if (hoveredSkillId) {
    const hoveredSkill = skillMap[hoveredSkillId];
    getAllPrerequisiteSkillIds(hoveredSkill, skillMap, highlightChain);
    highlightChain.add(hoveredSkillId);
  }

  tree.skills.forEach((skill) => {
    skill.prerequisites.forEach((prereqId) => {
      const fromSkill = skillMap[prereqId];
      const toSkill = skillMap[skill.id];
      if (!fromSkill || !toSkill) return;

      const isHighlighted =
        highlightChain.has(prereqId) && highlightChain.has(skill.id);

      const from = { x: fromSkill.x + 32, y: fromSkill.y + 32 };
      const to = { x: toSkill.x + 32, y: toSkill.y + 32 };

      drawSkillLine(ctx, from, to, isHighlighted);
    });
  });
}

function drawSkillLine(ctx, from, to, highlight = false) {
  ctx.strokeStyle = highlight ? "#FFD700" : "#00FFFF";
  ctx.lineWidth = highlight ? 5 : 3;
  ctx.shadowBlur = highlight ? 10 : 0;
  ctx.shadowColor = highlight ? "#FFD700" : "transparent";

  ctx.beginPath();
  if (from.y === to.y || from.x === to.x) {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
  } else {
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(from.x, to.y);
    ctx.lineTo(to.x, to.y);
  }
  ctx.stroke();

  ctx.shadowBlur = 0;
}

function calculateTotalSP() {
  let total = 0;
  window.skillTrees.forEach((tree) => {
    if (tree.visible) {
      total += tree.skills.reduce((sum, s) => sum + s.level, 0);
    }
  });
  return total;
}

function calculateTotalSP() {
  let total = 0;
  window.skillTrees.forEach((tree) => {
    if (tree.visible) {
      total += tree.skills.reduce((sum, s) => sum + s.level, 0);
    }
  });
  return total;
}

function updateTotalSPDisplay() {
  const display = document.getElementById("totalSPValue");
  const resetBtn = document.getElementById("resetAllBtn");
  const total = calculateTotalSP();

  if (display) {
    display.innerText = total;
  }

  if (resetBtn) {
    if (!viewOnly && total > 0) {
      resetBtn.classList.remove("hidden");
    } else {
      resetBtn.classList.add("hidden");
    }
  }
}

addEventListener("DOMContentLoaded", () => {
  document.getElementById("resetAllBtn")?.addEventListener("click", () => {
    window.skillTrees.forEach((tree) => {
      tree.skills.forEach((skill) => {
        skill.level = 0;
      });
      renderSkills(tree);
      updateTreeHeaderSP(tree);
    });
    updateTotalSPDisplay();
  });

  renderTreeDrawer();
});
let backgroundCode = generateCode(50);

function generateCode(length = 50) {
  const byteLength = Math.ceil(length / 2);
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, length);
}

document.addEventListener("DOMContentLoaded", () => {
  const saveLoadPanel = document.getElementById("saveLoadPanel");
  const message = document.getElementById("message");

  const sharedCode = new URLSearchParams(window.location.search).get("code");
  if (sharedCode) {
    loadSelection(sharedCode, true);
  } else {
    createLevelControlPanel();
  }
  fetch("session_status.php")
    .then((res) => res.json())
    .then((data) => {
      if (data.loggedIn && !sharedCode) {
        saveLoadPanel.classList.remove("hidden");
        message.classList.add("hidden");
        loadSavedSelections();
      } else {
        saveLoadPanel.classList.add("hidden");
        if (!sharedCode) {
          message.classList.remove("hidden");
        }
      }
    });

  document.getElementById("saveNewBtn")?.addEventListener("click", () => {
    const name = document.getElementById("selectionName").value;
    const description = document.getElementById("selectionDescription").value;
    const privacy = document.getElementById("selectionPrivacy").value;

    if (!name) return showToast("Please provide a name.", "error");

    const newCode = generateCode();
    backgroundCode = newCode;

    const skillsData = window.skillTrees.flatMap((tree) =>
      tree.skills
        .filter((skill) => skill.level > 0 || skill.star_gem_selected)
        .map((skill) => ({
          id: skill.id,
          level: skill.level,
          star_gem_level: skill.star_gem_level || 0,
          star_gem_selected: !!skill.star_gem_selected,
        }))
    );

    const data = {
      code: newCode,
      name,
      description,
      privacy,
      skills: skillsData,
    };

    fetch("get_function/save_selection.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          loadSelection(newCode);
          loadSavedSelections();
        } else {
          showToast(data.message || "Error saving selection.", "error");
        }
      })
      .catch((err) => {
        showToast("An error occurred while saving.", "error");
      });
  });

  document.getElementById("loadBuildBtn")?.addEventListener("click", () => {
    const code = document.getElementById("savedSelectionsList").value.trim();
    if (code) {
      loadSelection(code);
    } else {
      showToast("Please select a build to load.", "error");
    }
  });
  document.getElementById("copyLinkBtn").addEventListener("click", () => {
    const input = document.getElementById("editShareURL");
    input.select();
    input.setSelectionRange(0, 99999);
    document.execCommand("copy");
    showToast("Link copied to clipboard!");
  });
  document.getElementById("deleteBuildBtn")?.addEventListener("click", () => {
    const code = document.getElementById("savedSelectionsList").value.trim();
    if (code) {
      deleteSelection(code);
    } else {
      showToast("Please select a build to delete.", "error");
    }
  });
  document.getElementById("saveChangesBtn")?.addEventListener("click", () => {
    const code = backgroundCode;
    const name = document.getElementById("editName").value.trim();
    const description = document.getElementById("editDescription").value.trim();
    const privacy = document.getElementById("editPrivacy").value;

    if (!code) return showToast("No build selected to update.", "error");
    if (!name) return showToast("Name cannot be empty.", "error");

    const skillsData = window.skillTrees.flatMap((tree) =>
      tree.skills
        .filter((skill) => skill.level > 0 || skill.star_gem_selected)
        .map((skill) => ({
          id: skill.id,
          level: skill.level,
          star_gem_level: skill.star_gem_level || 0,
          star_gem_selected: !!skill.star_gem_selected,
        }))
    );

    const updatedData = {
      code,
      name,
      description,
      privacy,
      skills: skillsData,
    };

    fetch("get_function/update_selection.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast("Build updated successfully!");
          loadSavedSelections();
          const nameInput = document.getElementById("selectionName");
          if (nameInput) {
            nameInput.value = name;
          }

          const descriptionInput = document.getElementById(
            "selectionDescription"
          );
          if (descriptionInput) {
            descriptionInput.value = description;
          }

          const privacySelect = document.getElementById("selectionPrivacy");
          if (privacySelect) {
            privacySelect.value = privacy;
          }
        } else {
          showToast(data.message || "Failed to update build.", "error");
        }
      })
      .catch((err) => {
        showToast("An error occurred while updating.", "error");
      });
  });
});

function deleteSelection(code) {
  if (!confirm("Are you sure you want to delete this selection?")) return;

  fetch("get_function/delete_selection.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        showToast("Build " + data.name + " deleted!");
        loadSavedSelections();
      } else {
        showToast(data.message || "Error deleting selection.", "error");
      }
    })
    .catch((err) => {
      showToast("An error occurred while deleting.", "error");
    });
}
function updateBuildInfo(data) {
  if (!viewOnly) return;

  const panel = document.getElementById("buildInfo");
  if (!panel) return;

  panel.classList.remove("hidden");
  const formatDateOnly = (dt) => {
    if (!dt) return "Unknown";
    const date = new Date(dt);
    if (isNaN(date)) return "Invalid Date";
    return date.toISOString().slice(0, 10);
  };

  panel.classList.remove("hidden");
  document.getElementById("buildName").textContent =
    data.name || "Unnamed Build";
  document.getElementById("buildOwner").textContent = `By ${
    data.owner || "Unknown"
  }`;
  document.getElementById("buildCreated").textContent = formatDateOnly(
    data.created_at
  );
  document.getElementById("buildUpdated").textContent = formatDateOnly(
    data.updated_at
  );
  document.getElementById("buildDescription").textContent =
    data.description || "No description provided.";
}

function loadSelection(code, readOnly = false) {
  fetch(`get_function/load_selection.php?code=${code}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        backgroundCode = code;

        viewOnly = readOnly;
        window.skillTrees.forEach((tree) => {
          tree.skills.forEach((skill) => {
            skill.level = 0;
          });
        });

        const savedSkills = data.selection.skills;
        const savedMap = new Map(savedSkills.map((s) => [s.id, s]));

        window.skillTrees.forEach((tree) => {
          tree.skills.forEach((skill) => {
            if (savedMap.has(skill.id)) {
              const saved = savedMap.get(skill.id);
              skill.level = saved.level || 0;
              skill.star_gem_level = saved.star_gem_level || 0;
              skill.star_gem_selected = !!saved.star_gem_selected;
            } else {
              skill.star_gem_level = 0;
              skill.star_gem_selected = false;
            }
          });
        });

        currentBuildData = {
          code: code,
          name: data.selection.name,
          description: data.selection.description,
          privacy: data.selection.privacy,
        };
        if (viewOnly) {
          document.getElementById("saveLoadPanel")?.classList.add("hidden");
          document.getElementById("editPanel")?.classList.add("hidden");
          updateBuildInfo({
            name: data.selection.name || "Unnamed Build",
            description:
              data.selection.description || "No description provided.",
            created_at: data.selection.created_at || "Unknown",
            updated_at: data.selection.updated_at || "Unknown",
            owner: data.selection.owner || "Unknown",
          });

          window.skillTrees.forEach((tree) => {
            openDrawers[tree.id] = true;
          });

          const exportPanel = document.createElement("div");
          exportPanel.className = "absolute bottom-4 right-4";

          const exportContainer = document.createElement("div");
          exportContainer.className =
            "relative bg-gray-800 text-white font-semibold p-3 rounded shadow-lg border border-blue-400 flex flex-row gap-2";
          exportPanel.appendChild(exportContainer);

          const exportBtn = document.createElement("button");
          exportBtn.innerHTML = "📤";
          exportBtn.title = "Export Options";
          exportBtn.className =
            "w-10 h-10 text-lg flex items-center justify-center rounded bg-gray-600 hover:bg-gray-500 transition relative";
          exportContainer.appendChild(exportBtn);

          const exportMenu = document.createElement("div");
          exportMenu.className =
            "absolute bottom-full mb-2 left-0 bg-gray-600 text-blue-400 rounded shadow-lg z-50 hidden";
          exportMenu.style.minWidth = "120px";

          const imageOption = document.createElement("div");
          imageOption.innerText = "🖼️ To Image";
          imageOption.className =
            "px-3 py-2 hover:bg-blue-100 cursor-pointer border-b border-gray-200";
          imageOption.onclick = () => {
            exportTreeToImage();
            exportMenu.classList.add("hidden");
          };

          const textOption = document.createElement("div");
          textOption.innerText = "📄 To Text";
          textOption.className = "px-3 py-2 hover:bg-blue-100 cursor-pointer";
          textOption.onclick = () => {
            exportAllActiveTreesToText();
            exportMenu.classList.add("hidden");
          };

          exportMenu.appendChild(imageOption);
          exportMenu.appendChild(textOption);
          exportContainer.appendChild(exportMenu);

          exportBtn.onclick = () => {
            exportMenu.classList.toggle("hidden");
          };

          const buildInfo = document.getElementById("buildInfo");
          buildInfo.classList.add("relative");
          buildInfo.appendChild(exportPanel);
        }
        if (!viewOnly) {
          document.getElementById("selectionName").value = data.selection.name;
          document.getElementById("selectionDescription").value =
            data.selection.description;
          document.getElementById("selectionPrivacy").value =
            data.selection.privacy;

          showToast("Loaded " + data.selection.name + "!", "success");
          document.getElementById("editPanel").classList.remove("hidden");
          const selection = data.selection;
          document.getElementById("editName").value = selection.name || "";
          document.getElementById("editDescription").value =
            selection.description || "";
          document.getElementById("editPrivacy").value =
            selection.privacy || "private";

          const shareURL = `${window.location.origin}${window.location.pathname}?code=${code}`;
          const shareInput = document.getElementById("editShareURL");
          if (shareInput) {
            shareInput.value = shareURL;
          }
        }

        updateSelectedStarGemPanel();
        renderTreeDrawer();
        updateTotalSPDisplay();
      } else {
        showToast("Failed to load build.", "error");
      }
    })

    .catch((err) => {
      showToast("Error loading build.", "error");
    });
}

function loadSavedSelections() {
  fetch("get_function/load_selection.php")
    .then((res) => res.json())
    .then((data) => {
      const list = document.getElementById("savedSelectionsList");
      list.innerHTML = '<option value="">--- Choose Build ---</option>';

      if (data.success) {
        data.selections.forEach((selection) => {
          const option = document.createElement("option");
          option.value = selection.code;
          option.textContent = selection.name;
          list.appendChild(option);
        });
      } else {
        showToast("No saved build found.", "error");
      }
    })
    .catch((err) => {
      showToast("Error loading build.", "error");
    });
}

function showToast(message, type = "success", duration = 3000) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  toast.classList.remove("bg-green-600", "bg-red-600");
  toast.classList.add(type === "error" ? "bg-red-600" : "bg-green-600");

  toastMessage.textContent = message;
  toast.classList.remove("opacity-0", "-translate-y-full");
  toast.classList.add("opacity-100", "translate-y-0");

  setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "-translate-y-full");
  }, duration);
}

function disableEditing() {
  document.querySelectorAll("input, textarea, select, button").forEach((el) => {
    el.disabled = true;
  });
}
window.addEventListener("beforeunload", () => {
  resetAllSkills();
});
const helpBtn = document.getElementById("helpBtn");
const helpPanel = document.getElementById("helpPanel");
const closeHelp = document.getElementById("closeHelp");

helpBtn.addEventListener("click", () => {
  const isHidden = helpPanel.classList.contains("hidden");

  if (isHidden) {
    helpPanel.classList.remove("hidden");
    setTimeout(() => {
      helpPanel.classList.remove("translate-y-3", "opacity-0");
      helpPanel.classList.add("translate-y-0", "opacity-100");
    }, 10);
  } else {
    helpPanel.classList.add("translate-y-3", "opacity-0");
    setTimeout(() => helpPanel.classList.add("hidden"), 250);
  }
});

closeHelp.addEventListener("click", () => {
  helpPanel.classList.add("translate-y-3", "opacity-0");
  setTimeout(() => helpPanel.classList.add("hidden"), 250);
});
