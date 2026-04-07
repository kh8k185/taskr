# Taskr

A clean, dark-mode to-do app built with React + Vite.

## Features
- Add tasks with priority, category, and due date
- Filter by: all, active, done, high priority, overdue
- Sort by: newest, priority, due date
- Search tasks
- Double-click any task to edit it
- Progress bar + stats
- Persists to localStorage (survives refresh)
- Clear all done tasks at once

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel (2 minutes)

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Framework preset: **Vite** (auto-detected)
4. Click Deploy — done

## Deploy to Netlify

```bash
npm run build
# Drag the dist/ folder to netlify.com/drop
```

## Project structure

```
src/
  components/
    AddTask.jsx       # Task input form with priority/category/due
    AddTask.module.css
    TaskItem.jsx      # Individual task row (double-click to edit)
    TaskItem.module.css
  useTasks.js         # All task logic + localStorage
  App.jsx             # Main layout, filters, search, sort
  App.module.css
  index.css           # Global styles + CSS variables
```
