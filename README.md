# ⚒ The Forge v5.0

Personal Project Management for the Ubermensch Hierarchy.

## Features

- **List View** — Tasks sorted by priority/due date, blocked tasks sink to bottom
- **Kanban Board** — Drag-and-drop between Backlog → To Do → In Progress → Done
- **Calendar View** — Monthly calendar with task date ranges
- **Dashboard** — Goal progress, hierarchy level coverage, completion history, blocked tasks
- **Task Dependencies** — Blocking/blocked-by with visual 🔒 indicators
- **AI Panel** — Claude API integration for intelligent task analysis (⚡ AI button)
- **Recurring Tasks** — Daily/weekly/biweekly/monthly auto-regeneration
- **Obsidian Export** — Formatted markdown matching the vault's MPL structure
- **Completion History** — 14-day chart tracking daily completions
- **Auto-Cascading Milestones** — Parent auto-completes when all subtasks done
- **JSON Backup/Restore** — Full data export and import
- **G1–G4 Goal Tagging** — Color-coded life goal alignment
- **6-Level Hierarchy** — L1 Core Practices through L6 Ultimate Man
- **localStorage Persistence** — Data persists across sessions

## Architecture

- `src/constants.js` — Goals, levels, statuses, Greek calendar, style constants
- `src/storage.js` — localStorage persistence with v3→v5 migration, JSON export/import
- `src/seed.js` — ~82 MPL tasks with stable IDs and dependency chains
- `src/App.jsx` — Main application with all views and components

## Built For

Connor's Sovereignty System — Obsidian vault, 13-month Greek calendar, four permanent life goals:

- **G1**: Ultimate Autonomous Man
- **G2**: Longhouse Tribe Legacy Fortress
- **G3**: Unbreakable Physical & Mental Foundation
- **G4**: High-Impact Legacy Work
