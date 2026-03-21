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
- **Interactions**: tap-to-plot (quadrant/line/timeline), slider-based entry (radial), drag to reposition, pinch-to-zoom, pan. Must be touch-optimized.
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
