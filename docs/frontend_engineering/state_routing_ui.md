# Frontend Design

## Component Hierarchy

```
App
├─ AuthPage
│
├─ PlaygroundPage                    ← no-login trial
│   ├─ GraphCanvas
│   └─ PointInspector
│
├─ DashboardPage
│   ├─ InsightNudgeBanner            ← "Your focus is trending up this week"
│   ├─ MultiChartGrid                ← composed workspaces of multiple graphs
│   ├─ MiniGraphWidget[]             ← tappable graph thumbnails
│   └─ NewGraphButton
│
├─ MultiChartViewPage                ← full screen workspace for multi-chart view
│   ├─ GraphCanvas[]
│   └─ MultiChartGridToolbar
│
├─ GraphPage                         ← full graph view
│   ├─ GraphCanvas
│   ├─ PointInspector                ← bottom sheet (mobile) / popover (desktop)
│   ├─ InsightPanel                  ← collapsible panel / tab
│   ├─ GraphToolbar                  ← import, settings, share
│   │   ├─ AddPointButton            ← opens manual entry
│   │   ├─ ShareButton               ← share/export dialog
│   │   └─ GraphSettingsModal        ← font and color customization
│
├─ SetupPage                         ← new graph wizard
│   ├─ GraphTypeSelector
│   ├─ AxisConfigurator
│   ├─ GridConfigToggle
│   └─ CanvasPreview
│
└─ TemplatePicker                    ← full-page gallery or modal
    └─ TemplateCard[]
```

---

## Routing

| Route | Page | Auth Required |
|-------|------|:---:|
| `/` | Landing / marketing | No |
| `/play` | PlaygroundPage (trial) | No |
| `/login`, `/signup` | AuthPage | No |
| `/dashboard` | DashboardPage | Yes |
| `/dashboard/view/:id` | MultiChartViewPage | Yes |
| `/graph/:id` | GraphPage | Yes |
| `/graph/new` | SetupPage (or TemplatePicker) | Yes |
| `/graph/:id/import` | ImportWizard | Yes |

Protected routes redirect to `/login` if unauthenticated. After login, redirect to `/dashboard`.

---

## State Management (Zustand)

### `userStore`
- `user: User | null` — current authenticated user.
- `isLoading: boolean` — auth state resolving.
- `login()`, `signup()`, `logout()` — auth actions.

### `graphStore`
- `graphs: Graph[]` — all graphs for the current user (for dashboard).
- `activeGraph: Graph | null` — the currently open graph.
- `points: Point[]` — points for the active graph.
- `fetchGraphs()`, `fetchPoints(graphId)` — data loading.
- `addPoint(point)`, `updatePoint(point)`, `deletePoint(id)` — mutations.
- `createGraph(config)`, `updateGraph(config)`, `deleteGraph(id)`.
- `undoStack: Action[]`, `redoStack: Action[]` — for undo/redo. Each action stores the inverse operation (e.g., `addPoint` pushes a `deletePoint` inverse).
- `undo()`, `redo()` — pops the last action and executes its inverse. Also persists the reversal to Supabase.
- Undo covers: manual point creation, tap-to-plot creation, point deletion, drag repositioning (including out-of-bounds shifts), and metadata edits.

### `uiStore`
- `inspectorOpen: boolean` — whether the PointInspector is showing.
- `inspectorPoint: Point | null` — the point being inspected (null = new point).
- `insightPanelOpen: boolean`.
- `activeModal: string | null` — for managing overlapping modal states.

### `insightStore`
- `insights: Insight[]` — computed insights for the active graph.
- `timeRange: 'week' | 'month' | 'all' | custom` — active filter.
- `computeInsights(points, timeRange)` — triggers recomputation.
- `dashboardNudge: Insight | null` — the most interesting insight to show on the dashboard banner.

### Data Flow

```
User interaction → Zustand action → Service call (Supabase) → Store update → React re-render
```

- Optimistic updates for point creation (show the point immediately, persist in background).
- Insight recomputation is triggered when points change, debounced to avoid thrashing.
- Undo actions also use optimistic updates — the UI reverts immediately while the Supabase call happens in the background.

---

## Mobile-First Patterns

### Bottom Sheets
The `PointInspector` and `InsightPanel` use a bottom sheet pattern on mobile:
- Slides up from the bottom of the screen.
- Draggable handle to expand/collapse.
- Covers ~40% of the screen when collapsed, ~80% when expanded.
- On desktop, these become popovers or sidebars instead.

Recommend using a library like [react-spring-bottom-sheet](https://github.com/stipsan/react-spring-bottom-sheet) or building a custom one with CSS transitions + touch events.

### Touch Targets
- All tappable elements must be ≥ 44×44px (Apple HIG minimum).
- Plot points on the canvas should have an inflated hit area (larger than their visual size) to make them easy to tap on mobile.

### Viewport Management
- The canvas must handle virtual keyboard appearance (on note editing) without layout jank.
- Use `visualViewport` API to detect keyboard and resize the canvas area accordingly.

### PWA
- Register a service worker (via Vite PWA plugin) for offline caching of the app shell.
- Cache the user's graph data locally (IndexedDB or Zustand persist middleware) so the dashboard loads instantly.
- `manifest.json` with app name, icons, theme color, `display: standalone`.

### Offline Point Queue
- When offline, point creation/edits are queued in IndexedDB (not just in-memory state — survives app close).
- Points created offline render on the canvas immediately with a subtle "unsynced" indicator (e.g., a small dot or dimmed opacity).
- On reconnect, the queue is flushed in order. Successfully synced points lose their indicator.
- Conflict strategy: last-write-wins. If the same point was edited on another device while offline, the most recent timestamp wins. For V1 this is acceptable since collaboration is post-V1 (single-user = no real conflicts).

---

## Component Design Notes

### `MiniGraphWidget`
- A read-only, non-interactive thumbnail of a graph.
- **Renders a static PNG snapshot** rather than a live Konva canvas. Rendering 8+ live Konva stages on a phone dashboard is too expensive.
- Snapshot generation: when a graph is updated (point added/moved/deleted), an off-screen Konva stage renders the graph at thumbnail resolution and exports it via `stage.toDataURL()`. The resulting image is stored locally (IndexedDB) and used on the dashboard.
- Shows the graph title, last updated time, and a point count badge.
- Tapping navigates to `/graph/:id`.

### `PointInspector`
- Must beusable in two modes: **new point** (pre-filled with coordinates and current timestamp) and **existing point** (pre-filled with all saved data).
- The timestamp field should show a human-friendly relative time ("just now", "2 hours ago") with a tap-to-edit that opens a date/time picker. (Hidden if timestamps are disabled).
- Tags use a chip input — type to add, tap X to remove. Suggest recently used tags.
- **Marker Image Uploader**: Allows uploading or selecting an image to act as the visual marker for the specific point directly on the graph.
- **Radial mode**: when the active graph is radial, the inspector shows a **slider for each spoke** instead of displaying x/y coordinates. Each slider is labeled with the spoke name and maps to `[0, 1]`. A live polygon preview updates on the canvas as sliders are adjusted.

### `InsightPanel`
- Each insight is a card with:
  - A one-sentence summary (e.g., "Your energy has trended downward over the past 2 weeks").
  - A mini visualization (sparkline, small cluster dot map, or bar chart).
  - A "Show on graph" action that highlights the relevant points/overlay on the canvas.
- Cards are vertically scrollable.
- **Minimum data state**: when a graph has too few points for meaningful insights (< ~7 for trends, < ~10 for clusters), the panel shows an encouraging placeholder: "Keep logging — insights unlock after a few more entries" with a progress indicator. Individual insight cards appear only when their specific algorithm has enough data.

### Empty & Error States

Every view needs a designed state for zero-data and failure scenarios:

- **Empty graph (0 points)**: show the axes/grid but with a centered prompt — "Tap anywhere to drop your first point." Subtle pulsing animation on the canvas to invite interaction.
- **Empty dashboard (0 graphs)**: full-screen prompt with illustration — "Create your first graph" button + "Browse templates" link.
- **Insight panel (insufficient data)**: progress-based placeholder as described above.
- **Import failure**: clear error message with the failure reason (e.g., "Column 'date' couldn't be parsed as timestamps. Check your file format."). Option to retry or re-map columns.
- **Network failure (online)**: toast notification — "Couldn't save. Retrying..." with automatic retry. If retries exhaust, persist to offline queue.
- **Loading states**: skeleton UI for the dashboard (grey placeholder cards), spinner overlay for the canvas on initial load, and shimmer effect for the insight panel while computing.

### `ImportWizard`
- Step 1: File upload (drag-and-drop on desktop, file picker on mobile). Accept `.csv` and `.xlsx`.
- Step 2: Column mapping. Show a table of the first 5 rows. User assigns each column to a field (X axis, Y axis, timestamp, note, tags, or "skip"). Auto-detect obvious mappings (e.g., a column named "date" → timestamp).
- Step 3: Preview. Render the mapped points on the canvas in a preview state (outlined, not filled). Show a count ("47 points will be imported").
- Step 4: Confirm. Commit the import.


---

# UI Components

*High-level breakdown of the frontend components. V1 targets a clean, minimalist aesthetic. The design should be mobile-first — every interaction must work well on a phone.*

## 1. `GraphCanvas`

The core interactive surface where users view and plot data.

- **Responsibilities**: rendering axes, grid lines, plot points, insight overlays, and path connections.
- **Sub-components**:
  - `AxisLine` / `AxisLabel` — renders axis with endpoint labels
  - `GridOverlay` — optional snap grid
  - `PlotPoint` — individual data point marker (tappable to inspect)
  - `PathConnector` — lines connecting sequential points (chronological playback)
  - `InsightOverlay` — consolidated insight layer (trend lines, cluster highlights, outlier markers)
- **Interactions**: tap-to-plot (quadrant/line/timeline), slider-based entry (radial), drag to reposition points, **drag axis endpoints/origin to resize/shift**, pinch-to-zoom, pan. Must be touch-optimized.
- **Layout variants**: quadrant, line, radial, timeline — the canvas adapts its rendering based on graph type.

## 2. `PointInspector`

A bottom sheet (mobile) or popover (desktop) that appears when a user taps a point or drops a new one.

- **Fields**: timestamp (defaults to now, editable or hidden if track-over-time disabled), text note, tag chips (user-defined directly on the graph), visual marker selector (emoji or custom uploaded image), photo attachment.
- **Radial mode**: shows a slider per spoke instead of x/y coordinates, with live polygon preview on canvas.
- **Actions**: save, delete, backdate.
- **Design**: minimal friction. A new point should be saveable with zero field edits (just tap and confirm).

## 3. `InsightPanel`

A collapsible panel (or dedicated tab on mobile) showing computed insights for the active graph.

- **Sections**: trend summary, time-of-day/day-of-week patterns, cluster summary, outlier callouts.
- **Period selector**: toggle between "this week", "this month", "all time", or custom date range.
- **Design**: card-based, scannable. Each insight is a concise sentence with a supporting mini-visualization.

## 4. `TemplatePicker`

A scrollable gallery of template cards, each showing a thumbnail preview of the graph layout.

- Tapping a card opens a preview with axis labels and description.
- "Use this template" clones it into a new graph the user can customize.

## 5. `GraphSetupWizard`

A step-by-step flow for creating a custom graph from scratch.

- **Steps**: choose graph type → name axes & set labels → toggle grid snap & type-specific options (show lines, enable categories, enable timestamps for XY graphs) → preview → save.
- Should also be accessible as an "edit" flow for existing graphs.

## 6. `ImportWizard`

A flow for importing external data.

- **Steps**: upload file (CSV / Excel) → column mapping (assign columns to axes, timestamp, notes, tags) → preview mapped points on canvas → confirm import.

## 7. `Dashboard`

The user's home screen.

- **`MiniGraphWidget`**: a read-only, tappable thumbnail of each active graph showing recent points.
- **`MultiChartGrid`**: a composed workspace displaying multiple custom-selected graph canvases in a grid format.
- **Sorting**: most recently updated first.
- **Actions**: new graph, new view layout, tap to open, long-press for archive/delete.
- **Insight nudge**: a small banner or card surfacing the most interesting recent insight across all graphs (e.g., "Your focus has been trending up this week 📈").
