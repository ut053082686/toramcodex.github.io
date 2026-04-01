# ToramDB Skill Simulator Changelog

### v0.65.0 (Latest)
- **Data Source Migration**: The Skill Simulator data is no longer hardcoded into a 6,000+ line JS file. It now fetches the `SkillTrees` sheet from Google Sheets asynchronously, matching the rest of the ToramDB website architecture.
- **Dynamic Tree Building**: The simulator script now groups the flat table sheet rows by `tree_id` and automatically reconstructs the nested JSON object required by the legacy UI renderer on the fly.
- **Tree Background Colors**: Added support for reading `tree_bg_color` directly from the sheet `#ffffff` (white/light mode) or `#000000` (black/dark mode) per skill tree canvas.
### v0.64.1
- **Monster Modal Infinite Loop**: Added a guard clause in `monster-modal.js` to prevent an infinite fetching loop when clicking a boss name on a Quest card that doesn't yet exist in the Monsters sheet. The browser will no longer freeze or crash out of memory.
- **Monster Modal UI State**: Fixed an issue where opening a "Not Found" monster modal would incorrectly display the leftover image, stats, location, and drops from the previously opened monster. The modal correctly zeroes out old information when a monster is missing.
### v0.64.0 (Latest)
- **File Restructuring**: Renamed all `skill-calc` files to `skill-simulator` (`skill-simulator.html`, `skill-simulator.js`, `skill-simulator.css`).
- **Beta Data Integration**: Data source moved to `js/skill-simulator-data.js` (copied from `beta/skill_simulator_data.js`).
- **Connection Lines Fixed**: Ported exact elbow logic from beta simulator — Vertical first, then Horizontal. Color changed to cyan `#00FFFF` (inactive) and gold `#FFD700` (active).
- **Event Skills Hidden**: Trees with `visible: false` (Event Skills) are now automatically skipped.
- **Navigation Updated**: All 10 pages updated with Skill Simulator link in "Other Tools" dropdown + mobile menu.
- **Calculator Footer**: Added missing footer section to `calculator.html`.
- **Terms Nav Updated**: Added "Other Tools" dropdown to `terms.html`.

### v0.63.1
- **Dynamic Height Logic**: Skill tree containers now automatically adjust their height based on the vertical position of skills, eliminating excessive whitespace at the bottom.
- **Added Spreadsheet Guide**: Created `SKILL_TREE_GUIDE.md` with detailed instructions on formatting data for the simulator.
- **Improved Alignment**: Refined pixel offsets for node labels and levels.

### v0.62.0
- **Game Style Nodes**: Skill icons are now encased in dark silver/black circles, matching the classic Toram game aesthetic.
- **Improved Labeling**: Long skill names now wrap into multiple lines to prevent overlapping and text cutting.
- **Mobile Header Fix**: Restored "Total Skill Points Used" label on mobile screens.

### v0.61.1
- **Soft Light (Parchment) Theme**: Transitioned from blinding white to eye-friendly sand and parchment tones.
- **Sticky Header Fix**: Resolved the "flying" bug where the Total SP tracker overlapped the navbar on mobile/web.

### v0.60.0
- **Right-Angle (Elbow) Connections**: Skill tree paths now use right-angle lines (L-shape) for a cleaner, game-accurate look.
- **English Localization**: All alerts (e.g., "Level 5 required for:") and labels are now in English.

### v0.59.1
- **Accordion Dashboard**: Replaced the legacy dropdown with a collapsible multi-tree dashboard.
- **Global SP Tracker**: Aggregates total SP spent across all active skill trees.
