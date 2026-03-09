# Task Tracker

A clean, local-first task management app built with React and packaged as a Windows desktop app with Electron.

Add tasks with priority, category, due date, description, and sub-tasks (each with their own due dates). Tasks with a future start date go into a **Waiting** column and automatically surface when ready. All data is saved locally — nothing is sent anywhere.

**Version:** 1.2.0
**Tech:** React 19, Electron 40, Create React App
**Distribution:** Windows portable EXE — available on the [Microsoft Store](https://apps.microsoft.com) *(coming soon)*

---

## Features

- Add tasks with title, priority (High / Medium / Low), category, due date, and description
- Sub-tasks with individual due dates and completion tracking
- **Waiting column** — tasks with a future "waiting until" date are separated and surface automatically
- Custom categories with color labels
- Tasks sorted by soonest due date (sub-tasks included)
- Floating **+** button to add tasks quickly
- New tasks start collapsed for a clean view
- Mobile-friendly with tab switching between Active and Waiting
- All data stored locally — survives restarts, no account needed
- Data persists across EXE version upgrades

---

## Download

Grab the latest portable EXE from [Releases](https://github.com/Adamtad/task-tracker/releases). No install required — just run it.

---

## Development setup

**Requirements:** Node.js v18+ and npm — [nodejs.org](https://nodejs.org)

```bash
git clone https://github.com/Adamtad/task-tracker.git
cd task-tracker
npm install
```

---

## Available scripts

| Command | Description |
|---------|-------------|
| `npm start` | Run in browser at [http://localhost:3000](http://localhost:3000) |
| `npm run electron-dev` | Run as desktop app with hot reload |
| `npm run electron-build` | Build portable Windows EXE to `dist/` |
| `npm run build` | Production web build into `build/` |
| `npm test` | Run tests |

---

## Data storage

| Platform | Location |
|----------|----------|
| Windows EXE | `%AppData%\Task Tracker\Local Storage\` |
| Browser | Browser localStorage |

Data is pinned to a fixed path so it survives EXE upgrades.
