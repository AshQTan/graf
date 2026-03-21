# Core Features

## 1. Graph Engine

### Graph Types
- **Quadrant** — 2D canvas with four labeled quadrants (e.g., mood trackers, alignment charts). The default and most distinctive layout.
- **2D Line / XY** — traditional scatter or time-series line graph with quantitative or qualitative axes. Includes configuration toggles for:
  - **Show Lines**: optionally connect points chronologically with a continuous path.
  - **Enable Categories**: support multiple categories/tags of points on a single chart.
  - **Enable Timestamps**: track points over time (enabled allows date/time stamps, disabled functions purely as a scatter plot).
- **Radial** — circular layout where axes radiate outward from a center point (e.g., a "life wheel" with spokes for health, career, relationships, creativity). Good for holistic self-assessment.
- **1D Timeline** — single-axis tracking over time. Simplest format.

### Axis Configuration
- Labels can be numerical (0–10), categorical ("Low / Medium / High"), or vibe-based ("Silly → Serious").
- Users define labels for each end of each axis. The system maps the full axis range to a normalized coordinate space internally.
- **Maximum Values & Out-of-bounds**: Users can set a maximum value for numerical axes (e.g., 1-10), forming the default grid. However, for comedic or practical effect, points can be freely plotted *beyond* these maximum values. The canvas will automatically resize and scale to accommodate these out-of-bounds points.

### Plotting
- **Freeform drop**: click or tap anywhere on the canvas to place a point. No form required.
- **Manual entry**: alternatively, use the "Add Point" button to manually input coordinate values.
- **Drag & Resize**: dragging an existing point past the current canvas boundaries will seamlessly resize and shift the graph limits to accommodate the move.
- **Undo/Redo**: full undo and redo support for adding, deleting, and moving points.
- **Grid snapping**: optional, off by default. When enabled, points snap to a configurable grid.
- **Rich metadata**: each point can carry a text note, tags (user-defined directly on the graph), an emoji, or a photo attachment.
- **Custom Markers**: users can select a specific aesthetic marker for an individual point, including uploading their own image to serve as the marker.
- **Timestamps**: enabled by default (for tracking over time). Users can backdate or set a specific timestamp. If timestamps are disabled for the graph, points are fundamentally untimestamped scatter data.

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

## 4. Customization

- **Font type**: users can change the font used for graph titles, axis labels, and point notes.
- **Color schemes**: users can select custom colors for the graph axes, grid lines, and data points.

---

## 5. Data Import

- **CSV import**: upload a CSV file and map columns to axes, timestamps, notes, and tags.
- **Excel import**: same mapping flow, supporting `.xlsx` files.
- Import preview shows a sample of mapped points on the canvas before committing.
- Supports bulk backfill — users can bring in months or years of existing data.

---

## 6. Accounts & Dashboard

- **Dashboard**: home screen showing miniature previews of all active graphs, sorted by most recently updated.
- **History**: filter any graph's points by date range. Compare time windows side-by-side (e.g., "this week vs. last week").
- **Graph management**: archive, duplicate, or delete graphs from the dashboard.

---

## 7. Multi-Chart Views

- **Custom Dashboards**: users can select a number of graphs to assemble into a customized workspace.
- **Grid Layout**: specify the grid layout dimension (e.g., 2×2, 3×1) to display the selected charts.
- **Individual Configuration**: charts within a grid can be configured and interacted with individually without affecting the underlying shared template.

---

## 8. Social & Collaboration

Designed into the data model now.

- **Read-only sharing**: generate a shareable link or easily export a graph as an image (or to social media) via the "Share" button. Current focus for V1.
- **Async multiplayer *(Post-V1)***: invite others to plot on a shared graph. Each contributor gets a distinct marker color. Updates appear after submission, not in real-time.
- **Privacy first**: all graphs private by default. Sharing requires explicit opt-in per graph.
