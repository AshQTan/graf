# Graf

Graf is a customizable, mobile-first web application for plotting personal data on user-defined graphs. 

Unlike conventional trackers that force numerical inputs, Graf lets users define qualitative, "vibe-based" axes (e.g., "Tired → Energetic") and drop points freely onto a canvas. It's a blend of an analytical tracker and an expressive visual journal.

## Core Features
1. **Qualitative-first plotting** — axes use descriptive labels, not just numbers. Points are placed freely via drag-and-drop.
2. **Implicit quantification** — even vibe-based graphs have an underlying coordinate system. The system uses positional data to generate real insights (trends, averages, drift over time) behind the scenes.
3. **Insight engine** — trend analysis, time-of-day patterns, weekly/monthly summaries, and drift detection transform raw plots into self-knowledge.
4. **Template gallery** — pre-built graph templates (mood quadrants, alignment charts, energy trackers) help you get started fast.
5. **Data import** — Bring in your existing CSV/Excel datasets.
6. **Privacy by default** — all graphs are private until you explicitly share them.

## Tech Stack
- React 19
- TypeScript
- Vite
- React Router (Routing)
- Zustand (State Management)
- React Konva (Canvas rendering)

## Development

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```
