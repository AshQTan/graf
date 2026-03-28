# Graph Engine Design

*The graph engine is the hardest part of Graf. This document covers how the canvas renders, how users interact with it, and how different graph types are handled.*

## Rendering Architecture

### Canvas vs. DOM

The engine uses HTML5 Canvas (via Konva) rather than SVG/DOM for rendering. The canvas is wrapped in a React component (`GraphCanvas`) that manages the Konva `Stage` and delegates rendering to type-specific renderers.

```
GraphCanvas (React)
  └─ Stage (Konva)
       ├─ AxisLayer            ← axis lines, endpoint labels
       ├─ GridLayer             ← optional snap grid
       ├─ InsightOverlayLayer   ← trend lines, cluster highlights, outlier markers (behind points)
       ├─ PathLayer             ← lines connecting sequential points (if show_lines is enabled)
       └─ PointLayer            ← plot points (topmost, interactive, supports custom Konva Image nodes)
```

`InsightOverlayLayer` consolidates all insight visualizations into a single layer: trend lines, cluster region highlights, and outlier markers. This keeps the layer count manageable and ensures all insight visuals share a consistent z-order (always behind interactive points).

Layers are drawn bottom-to-top. Points are always on top so they remain tappable.

### Renderers

Each graph type has a dedicated renderer that knows how to:
1. **Lay out axes** — where lines go, where labels sit, how the coordinate space maps to pixel space.
2. **Convert coordinates** — translate normalized `[0, 1]` coordinates to canvas pixel positions and back.
3. **Draw type-specific chrome** — quadrant dividers, spoke lines for radial, time axis ticks for line graphs.

```
interface GraphRenderer {
  // Given graph config + canvas dimensions, return layout geometry
  computeLayout(graph: Graph, width: number, height: number): Layout

  // Convert normalized coords → pixel position
  toPixel(coord: Coordinates, layout: Layout): { x: number, y: number }

  // Convert pixel position → normalized coords (for tap-to-plot)
  toNormalized(px: number, py: number, layout: Layout): Coordinates

  // Render type-specific axis/chrome elements (returns Konva nodes)
  renderAxes(graph: Graph, layout: Layout): ReactNode

  // Optional: render type-specific grid
  renderGrid?(graph: Graph, layout: Layout): ReactNode
}
```

#### Quadrant Renderer
- Draws two perpendicular axes crossing at center.
- Four quadrant labels in corners.
- Coordinate space: `x: [0, 1]`, `y: [0, 1]`, with `(0.5, 0.5)` at the center.
- Grid: optional NxN subdivision lines.
- Paths: can optionally connect points based on config toggle (`show_lines`).

#### Line / XY Renderer
- Horizontal time or quantitative axis (X), vertical value axis (Y).
- **Time Tracking**: if timestamps are enabled, X position is derived from the point's `timestamp` at render time. If disabled, X is a standard normalized `[0, 1]` value just like Y, making it a standard scatter plot.
- Y-axis uses the graph's defined labels/range. `y: [0, 1]` normalized.
- The renderer auto-scales the time axis to fit the date range of existing points (when enabled), with padding.
- Points can be grouped by categories/tags and connected chronologically (or sequentially) by the `PathLayer` if `show_lines` is enabled.
- **Implication for `toNormalized()`**: when a user taps to plot on a line graph with time-tracking, the tap's X pixel position is converted to a timestamp. If disabled, both X and Y pixels are normalized to `[0, 1]`. The resulting point stores coords accordingly.

#### Radial Renderer
- N spokes radiating from a center point, evenly distributed around 360°.
- Each spoke corresponds to one axis.
- Coordinate space: each spoke key maps to `[0, 1]` (center = 0, outer edge = 1).
- A single "point" (entry) is rendered as a filled polygon connecting the values on each spoke (like a radar/spider chart).
- For multiple entries over time, polygons are layered with decreasing opacity (most recent on top, oldest faintest).
- **This is a fundamentally different interaction from 2D graphs** — see the Radial Input section below.

#### Timeline Renderer
- Single horizontal axis with time.
- Points are plotted along the line, vertically offset only to avoid overlap.
- Simplest renderer — essentially a 1D scatter plot over time.

---

## Coordinate System

### The Normalization Contract

### The Normalization Contract

**All point coordinates are stored as normalized values in `[0, 1]` for the default viewport**, regardless of what the user sees on their axis labels.

This means:
- A point at the far left of a "Tired → Energetic" axis is `x: 0.0`.
- A point at the midpoint is `x: 0.5`.
- Display-layer conversion maps `0.0` → "Tired" and `1.0` → "Energetic" using the axis config.
- **Out-of-bounds mapping**: if a user defines an axis max of 10, the `[0, 1]` space maps to `[0, 10]`. If they plot a point at `12`, the engine stores `1.2`. The renderer detects coordinates outside `[0, 1]` and automatically scales/pans the camera view so the point remains visible.

**Why this matters:**
- Insight algorithms work on raw numbers without caring about labels.
- Cross-graph comparison becomes possible (e.g., "your average position on Graph A vs. Graph B").
- Renderer math is consistent — every renderer works in the same `[0, 1]` space.

### Grid Snapping

When grid snap is enabled:
- The normalized space is divided into N equal intervals (e.g., 3 divisions = values snap to `0.0, 0.33, 0.67, 1.0`).
- On tap-to-plot, the raw normalized coordinate is rounded to the nearest snap value before storing.
- Grid lines are drawn at each snap boundary.

---

## Interaction Model

### Tap-to-Plot & Manual Entry (Quadrant, Line, Timeline)
1. **Tap method**: User taps the canvas. Konva fires a `tap`/`click` event on the `Stage`. The handler converts pixel position to normalized coordinates via the active renderer's `toNormalized()`.
2. **Manual method**: User clicks the "Add Point" button. The inspector opens empty, waiting for manual coordinate input.
3. If grid snap is on, tapped coordinates are snapped.
4. A new `Point` object is created (with `timestamp: now`, coordinates, and source: `manual`).
5. The `PointInspector` bottom sheet opens, pre-filled. The user can edit the note/tags/timestamp or just confirm.
6. On save, the point is persisted to the undo stack and Supabase. Canvas re-renders.

### Radial Input

Radial graphs require a different interaction because a single "point" has N values (one per spoke). Tap-to-plot on a 2D position doesn't map to this.

**Option A — Slider-based entry (recommended for V1):**
1. User taps a "New Entry" button (not the canvas itself).
2. The `PointInspector` opens with a **slider for each spoke** (e.g., "Health: ●───── ", "Career: ──●─── ").
3. Each slider maps to `[0, 1]`. Default position is `0.5` (center).
4. As the user adjusts sliders, a live polygon preview updates on the canvas.
5. User confirms → point is saved with coordinates `{"spoke_1": 0.7, "spoke_2": 0.4, ...}`.

**Option B — Tap-each-spoke (future enhancement):**
1. User enters a "plot mode" where spokes highlight sequentially.
2. User taps along each spoke to set its value.
3. After all spokes are set, the polygon is drawn and the user confirms.

Option A is simpler to build and more precise. Option B is more interactive but requires more engine work.

**Editing a radial entry:** tapping an existing polygon opens the inspector with sliders pre-filled to the current values. The user adjusts and saves.

### Drag to Reposition (Quadrant, Line, Timeline)
- Existing points are draggable (Konva handles this natively).
- As a point is dragged past the viewport edge, the engine automatically pans the camera and resizes the coordinate space bounds to accommodate the movement.
- On drag end, the new pixel position is converted back to stored normalized coordinates and the point is updated via the undo stack.
- Grid snap applies during drag if enabled.
- **Not applicable to radial graphs** — repositioning is done via sliders in the inspector.

### Pinch-to-Zoom and Pan
- Konva `Stage` supports built-in zoom and drag.
- Zoom is bounded (e.g., 0.5x to 3x) to prevent losing the graph.
- Pan is bounded to keep at least part of the graph visible.
- On mobile, pinch gesture maps to zoom; two-finger drag maps to pan.

### Interactive Axis Adjustment
- **Endpoints & Origin**: The graph engine renders invisible (or subtly indicated) hit areas on the endpoints of each axis and the origin point.
- **Dragging**: When a user drags an endpoint, the renderer's `computeLayout()` is updated to recalculate the scale and rotation of the axes relative to the new pixel position.
- **Origin shift**: Dragging the origin point translates the entire coordinate system within the viewport.
- **Normalization update**: While internal point storage remains normalized `[0, 1]`, the display-layer mapping (mapping normalized coordinates to pixel values) is adjusted based on the new axis geometry.

### Point Inspection
- Tapping an existing point (or polygon on radial) opens the `PointInspector` with that point's data.
- The point briefly scales up (micro-animation) to confirm selection.

---

## Responsive Sizing

The `GraphCanvas` component fills its container and recomputes layout on resize. Key considerations:

- **Mobile portrait**: canvas takes most of the viewport height, leaving room for a bottom toolbar and the `PointInspector` bottom sheet.
- **Mobile landscape**: canvas stretches wider. Axis labels may need to abbreviate.
- **Desktop**: canvas is centered with comfortable padding. `InsightPanel` can sit in a sidebar rather than a bottom sheet.

The renderer's `computeLayout()` takes `width` and `height` and returns all positional geometry. Nothing is hardcoded to a specific screen size.

---

## Performance Considerations

- **Point budget**: for V1, assume up to ~500 points per graph. Konva handles this easily. At 1000+ points, consider culling off-screen points or switching to a simplified dot representation when zoomed out.
- **Layer isolation**: because Konva layers are independent canvases, redrawing the `PointLayer` (on every new point) doesn't trigger a redraw of the `AxisLayer` or `GridLayer`.
- **Debounced resize**: `computeLayout()` should be debounced on window resize to avoid layout thrashing.
- **Insight overlays**: the `InsightOverlayLayer` should only render when the user has enough data. Trend lines below ~7 points and clustering below ~10 points produce meaningless results. The layer should check minimum thresholds and simply not render if the data is insufficient.
