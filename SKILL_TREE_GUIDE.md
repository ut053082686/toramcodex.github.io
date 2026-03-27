# ToramDB Skill Tree Spreadsheet Guide

This guide explains how to format your spreadsheet data to be compatible with the Skill Simulator.

## 1. Skill Tree Definition
Each Skill Tree is defined as an object in `beta/skill_simulator_data.js`.

### Main properties:
- `id`: Unique identifier (e.g., `blade_skills`).
- `label`: Name displayed in the list (e.g., `Blade Skills`).
- `icon`: Filename for the tree icon (stored in `img/icons/skills/`).
- `skills`: An array of individual skill objects.

## 2. Skill Object Structure
Each skill needs the following data points:

| Column | Description | Example |
| :--- | :--- | :--- |
| **id** | Unique skill ID (numbers or lowercase strings) | `hard_hit` |
| **name** | Full name of the skill | `Hard Hit` |
| **max** | Maximum level (usually 10) | `10` |
| **x** | Horizontal position in pixels | `150` |
| **y** | Vertical position in pixels | `250` |
| **prerequisites** | Array of IDs that must be Level 5 | `["sword_mastery"]` |
| **icon** | Filename (stored in `img/icons/skills/`) | `sk_hard_hit.png` |

## 3. Positioning Guide (The Grid System)
The simulator uses a coordinate system (X, Y) relative to the top-left of the tree container.

- **Horizontal (X)**:
  - Standard node width is ~64px.
  - Recommended spacing is **120px** between columns.
  - Example: Col 1 (`x: 100`), Col 2 (`x: 220`), Col 3 (`x: 340`).
- **Vertical (Y)**:
  - Recommended spacing is **120px** between rows.
  - Example: Row 1 (`y: 100`), Row 2 (`y: 220`), Row 3 (`y: 340`).

> [!TIP]
> The simulator now automatically calculates the height based on your highest **Y** value. You don't need to specify a `height` unless you want to force a larger scroll area.

## 4. Prerequisite Connections
Connections are drawn automatically using the `prerequisites` array.
- If Skill B has `prerequisites: ["skill_a"]`, a **Right-Angle (Elbow)** gold line will be drawn from Skill A to Skill B.
- The path follows an L-shape: `Horizontal -> Vertical`.

## 5. Deployment
After updating your spreadsheet, export/convert it to the format in `beta/skill_simulator_data.js` and push to the `main` branch.
