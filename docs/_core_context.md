# Agent Guidelines & Rules
All agents working on Graf must strictly adhere to the following directives:
1. **No Unprompted Commits or Pushes:** Do NOT commit code or push to remote repositories (e.g., GitHub) under ANY circumstances unless the user explicitly asks you to do so.
2. **Zero Emojis:** Do NOT use emojis anywhere. This applies to UI design, structural code, comments, documentation, and your agentic chat responses. The project adheres to a strict minimalist, text-and-SVG-only aesthetic.
3. **Git Identity:** All git commits and pushes must be performed using the **AshQTan** account.


---

# Product Vision: Graf

## What It Is

Graf is a customizable, mobile-first web application for plotting personal data on user-defined graphs. Unlike conventional trackers that force numerical inputs, Graf lets users define qualitative, "vibe-based" axes (e.g., "Tired → Energetic") and drop points freely onto a canvas. It's a blend of analytical tracker and expressive visual journal.

The app should feel immediate — open it, tap a graph, drop a point, done. The whole daily interaction should take under 10 seconds.

## Why It Matters

Most personal tracking tools fail because they reduce lived experience to a number. "Rate your day 1–10" flattens nuance. Graf preserves it — a point dropped in the upper-left quadrant of an "Energy vs. Focus" graph says more than a single score ever could.

And critically, **Graf doesn't just store data — it surfaces patterns.** Even when users plot qualitatively, the system silently quantifies position and uses it to reveal trends, clusters, and shifts over time. The insight layer is what turns a novelty into a habit.

## Core Differentiators

1. **Qualitative-first plotting** — axes use descriptive labels, not just numbers. Points are placed freely via drag-and-drop, not typed into forms.
2. **Implicit quantification** — even vibe-based graphs have an underlying coordinate system. The system uses positional data to generate real insights (trends, averages, drift over time) without users needing to assign numbers.
3. **Insight engine** — trend analysis, time-of-day patterns, weekly/monthly summaries, and drift detection transform raw plots into self-knowledge.
4. **Template gallery** — pre-built graph templates (mood quadrants, alignment charts, energy trackers) eliminate blank-slate paralysis and immediately communicate the concept.
5. **Data import** — CSV and Excel import lets users bring in existing data sets, bridging the gap between traditional spreadsheets and Graf's visual canvas.
6. **Privacy by default** — all graphs are private. Sharing and collaboration require explicit opt-in.

## V1 Scope

The first version focuses on the **solo experience**: creating graphs, plotting data, and surfacing insights. The UI will be clean and minimalist.

**In scope for V1:**
- Graph creation (quadrant, 2D line, radial, custom)
- Freeform and grid-snap plotting
- Template gallery
- Insight engine (trend lines, time analysis, cluster detection)
- CSV/Excel data import
- Accounts, dashboard, history
- Mobile-optimized responsive webapp

**Designed for, but deferred past V1:**
- Async collaborative graphs (lightweight multiplayer)
- Shareable links / read-only graph snapshots
- Community template publishing
- Theme customization beyond the default minimalist style


---

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
- **Interactive Adjustment**: axes are not static. Users can click and drag the endpoints or the origin (center for quadrants, center for radials) to manually scale, rotate, or shift the grid directly on the canvas.
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

---

# User Flows

## 1. First-Time Experience

1. **Landing page**: animated examples of graphs in motion — points dropping, trend lines drawing, clusters forming. Communicates the concept instantly.
2. **No-login playground**: user is dropped directly into a pre-loaded template (e.g., "How are you feeling right now?" mood quadrant). No signup required.
3. **First plot**: user taps the canvas to drop a point. Satisfying micro-animation plays. The `PointInspector` slides up with timestamp and optional note — but saving with zero edits is fine.
4. **Signup nudge**: after the first point, a gentle prompt: *"Want to track this over time? Create a free account."* Non-blocking — user can keep plotting without signing up.

## 2. Daily Logging

1. **Open app**: dashboard loads showing `MiniGraphWidget` tiles of active graphs, sorted by recency.
2. **Tap a graph**: full `GraphCanvas` opens with existing points visible.
3. **Drop a point**: tap the canvas. `PointInspector` slides up. Optionally type a quick note, tag, or select a custom image marker.
4. **Save**: point is committed. Canvas updates. Total interaction: **< 10 seconds**.
5. **Insight nudge** *(optional)*: after saving, a subtle toast or banner surfaces a relevant insight: *"You've been in the high-energy quadrant 4 days in a row."*

## 3. Creating a Custom Graph

1. **Tap "New Graph"** from the dashboard.
2. **Choose graph type**: quadrant, 2D line, radial, or timeline. Visual previews for each.
3. **Define axes**: type labels for each axis endpoint (e.g., X: "Introverted" ↔ "Extroverted"). For radial, name each spoke.
4. **Configure rules & grid** *(optional)*: enable grid snapping, set divisions. For XY variants, optionally toggle line connections, categories, or tracking over time (timestamps).
5. **Preview**: see the empty canvas with axes and labels rendered.
6. **Save**: graph is created and appears on the dashboard. User is prompted to make their first entry.

## 4. Reviewing Insights

1. **Open a graph** with existing data.
2. **Tap the insight tab/panel**: `InsightPanel` opens showing computed analysis.
3. **Browse sections**: trend summary (direction + magnitude), time patterns (best/worst days), cluster summary (where points concentrate), outlier callouts.
4. **Adjust time range**: toggle between "this week", "this month", "all time", or custom range. Insights recompute.
5. **Tap a specific insight**: navigates back to the canvas with the relevant points highlighted or a trend line overlaid.

## 5. Creating a Multi-Chart View

1. **Tap "New View"** from the dashboard.
2. **Select graphs**: choose from user's existing repository of graphs.
3. **Select layout**: pick a grid arrangement (e.g., 2x2, vertical list).
4. **Configure & Save**: layout is created on the dashboard alongside the mini widgets.

## 5. Importing Data

1. **Open an existing graph** (or create a new one).
2. **Tap "Import"** from the graph menu.
3. **Upload file**: select a CSV or Excel file from device.
4. **Map columns**: assign file columns to graph axes, timestamp, notes, and tags. The wizard shows a live preview of how the first few rows will map to points on the canvas.
5. **Review**: see all mapped points rendered on the canvas in a "preview" state (visually distinct, e.g., dimmed or outlined).
6. **Confirm**: points are committed. Import job is logged for reference.

## 6. Inviting a Collaborator *(Post-V1)*

1. **Open a graph** and tap the "Collaborate" / share icon.
2. **Generate invite link**: app creates a unique link with embedded permissions.
3. **Friend receives link**: they sign up or log in, and are added to the graph with a unique marker color.
4. **Async plotting**: collaborator's points appear on the shared canvas after submission. No real-time sync needed.
