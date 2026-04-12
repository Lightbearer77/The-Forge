# ⚒ The Forge — Personal Project Management

A purpose-built project management system for the Ubermensch Hierarchy. Built with React + Vite.

## Features

- **Four Views**: List, Kanban (HTML5 drag-and-drop), Calendar, Dashboard
- **G1–G4 Goal Tagging**: Autonomous Man, Longhouse Tribe, Physical Foundation, Legacy Work
- **6-Level Hierarchy**: Core Practices → Ultimate Man maturity levels
- **13-Month Greek Calendar**: Alpha through Nu (28-day months)
- **Auto-Cascading Milestones**: Parent milestones auto-complete when all subtasks finish
- **Section Management**: Dropdown with inline create-new
- **Persistent Storage**: localStorage for standalone, `window.storage` for Claude artifacts
- **Task CRUD**: Full create, read, update, delete with detail panel

## Quick Start

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Project Structure

```
the-forge/
├── index.html          # Entry HTML
├── package.json        # Dependencies & scripts
├── vite.config.js      # Vite configuration
└── src/
    ├── main.jsx        # React entry point
    └── App.jsx         # Full Forge application
```

## Roadmap

- [ ] Recurring tasks
- [ ] Task dependencies (blocking/blocked-by)
- [ ] Obsidian markdown export
- [ ] AI panel (Claude API integration)
- [ ] Multi-project support

## Stack

- React 18
- Vite 5
- No external UI libraries — custom components throughout

## Version

**v3.0** — April 2026
