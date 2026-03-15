# Core Features

## 1. Graph Engine

### Graph Types
- **Quadrant** — 2D canvas with four labeled quadrants (e.g., mood trackers, alignment charts). The default and most distinctive layout.
- **2D Line** — traditional time-series line graph with a quantitative or qualitative Y-axis and time on the X-axis.
- **Radial** — circular layout where axes radiate outward from a center point (e.g., a "life wheel" with spokes for health, career, relationships, creativity). Good for holistic self-assessment.
- **1D Timeline** — single-axis tracking over time. Simplest format.

### Axis Configuration
- Labels can be numerical (0–10), categorical ("Low / Medium / High"), or vibe-based ("Silly → Serious").
- Users define labels for each end of each axis. The system maps the full axis range to a normalized coordinate space internally.

### Plotting
- **Freeform drop**: click or tap anywhere on the canvas to place a point. No form required.
- **Grid snapping**: optional, off by default. When enabled, points snap to a configurable grid.
- **Rich metadata**: each point can carry a text note, tags, an emoji, or a photo attachment.
- **Timestamps**: points default to the current date/time. Users can backdate or set a specific timestamp.

---

## 2. Insight Engine

This is the retention layer — the thing that makes users come back.

### Implicit Quantification
Even on vibe-based graphs, every point has a concrete position on the canvas. The system normalizes these positions to a 0–1 coordinate space, enabling quantitative analysis without the user ever typing a number.

### Trend Analysis
- **Drift detection**: "Your energy has been trending lower over the past 2 weeks."
- **Trend lines**: overlay a rolling average or regression line on any graph.
- **Volatility**: flag periods of high variability vs. stability.

### Time Patterns
- **Day-of-week analysis**: "You tend to feel most focused on Tuesdays."
- **Time-of-day patterns**: cluster points by morning / afternoon / evening (when timestamp data supports it).
- **Weekly and monthly summaries**: digest views showing how this period compares to the last.

### Cluster Detection
- Identify natural groupings in a user's data (e.g., "most of your points cluster in the 'high energy, low focus' quadrant").
- Highlight outliers — points that break the usual pattern. 

---

## 3. Template Gallery

### Pre-built Templates
- **Daily Mood Quadrant** — "Happy ↔ Sad" vs. "Calm ↔ Anxious"
- **Energy vs. Productivity** — classic 2D quadrant
- **The Alignment Chart** — 3×3 D&D-style grid
- **Life Wheel** — radial layout with customizable spokes
- **Relationship Check-In** — designed for two collaborators

### Template Mechanics
- Templates define graph type, axis labels, grid configuration, and (optionally) suggested tags.
- Users can clone a template and modify it freely.
- **Future (post-V1):** community template publishing — users share their setups for others to clone.

---

## 4. Data Import

- **CSV import**: upload a CSV file and map columns to axes, timestamps, notes, and tags.
- **Excel import**: same mapping flow, supporting `.xlsx` files.
- Import preview shows a sample of mapped points on the canvas before committing.
- Supports bulk backfill — users can bring in months or years of existing data.

---

## 5. Accounts & Dashboard

- **Dashboard**: home screen showing miniature previews of all active graphs, sorted by most recently updated.
- **History**: filter any graph's points by date range. Compare time windows side-by-side (e.g., "this week vs. last week").
- **Graph management**: archive, duplicate, or delete graphs from the dashboard.

---

## 6. Social & Collaboration *(Post-V1)*

Designed into the data model now, but not built for V1.

- **Read-only sharing**: generate a shareable link or export a graph as an image.
- **Async multiplayer**: invite others to plot on a shared graph. Each contributor gets a distinct marker color. Updates appear after submission, not in real-time.
- **Privacy first**: all graphs private by default. Sharing requires explicit opt-in per graph.
