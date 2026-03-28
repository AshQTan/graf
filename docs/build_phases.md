# Build Phases

*How to get from zero to V1. Each phase is a shippable increment — the app is usable (if incomplete) at the end of every phase.*

---

## Phase 0: Project Scaffolding
**Goal**: a running app skeleton with routing and basic structure.

- [x] Initialize Vite + React + TypeScript project.
- [x] Set up project structure (`engine/`, `components/`, `pages/`, `stores/`, `services/`, `insights/`, `types/`).
- [x] Install core dependencies (react-konva, zustand, react-router).
- [x] Create route structure with placeholder pages.
- [x] Set up global CSS (reset, custom properties, mobile-first base styles).
- [x] Verify: app runs locally, routes navigate, minimal layout renders on mobile and desktop.

**Result**: empty app shell that runs and routes correctly. ✅

---

## Phase 1: The Canvas (Core Engine)
**Goal**: render a graph and let a user drop points on it.

- [ ] Build `GraphCanvas` with Konva `Stage`.
- [ ] Implement `QuadrantRenderer` (the simplest and most distinctive layout — build this first).
- [ ] Build `AxisLayer` — render axes + endpoint labels.
- [ ] Build `GridLayer` — optional snap grid.
- [ ] Build `PointLayer` — render points as circles, handle tap events.
- [ ] Implement `useTapToPlot` hook — tap canvas → create point at normalized coords.
- [ ] Implement `useDragPoint` hook — drag existing points to reposition.
- [ ] Implement `usePinchZoom` and `usePan` hooks for mobile navigation.
- [ ] Build coordinate utilities (`toPixel`, `toNormalized`, grid snapping).
- [ ] Verify: can render a quadrant graph, tap to place points, drag to move them, pinch to zoom on mobile.

**Result**: a working interactive canvas. No persistence, no UI around it — just raw graphing.

---

## Phase 2: Point Entry & Basic UI
**Goal**: a usable single-graph experience with data entry.

- [ ] Build `PointInspector` (bottom sheet on mobile, popover on desktop).
- [ ] Wire tap-to-plot → open inspector → save point flow.
- [ ] Add timestamp editing (default to now, allow backdating).
- [ ] Add note, tags, and emoji fields.
- [ ] Build `GraphPage` layout — canvas + toolbar + inspector.
- [ ] Set up Zustand `graphStore` and `uiStore` with local-only state (no persistence yet).
- [ ] Implement undo stack in `graphStore` — track last 20 actions with inverse operations. Wire to an undo button in the toolbar.
- [ ] Design empty graph state — axes render with a centered "Tap anywhere to drop your first point" prompt.
- [ ] Verify: full plot-and-annotate flow works. Points persist across inspector open/close (in memory). Undo reverses the last action.

**Result**: a single graph page where you can drop, annotate, and inspect points.

---

## Phase 3: Persistence & Auth
**Goal**: data survives a page reload. Users can sign up and log in.

- [ ] Set up Supabase project (database, auth, storage).
- [ ] Write SQL migrations for `profiles`, `graphs`, `points`, `templates`, `import_jobs`.
- [ ] Configure RLS policies.
- [ ] Implement `supabase.ts` client init.
- [ ] Build `graphService` and `pointService` — CRUD operations.
- [ ] Wire Zustand stores to Supabase (fetch on load, persist on mutation).
- [ ] Build `AuthPage` — signup and login forms.
- [ ] Set up `userStore` with session management.
- [ ] Implement protected routes (redirect to login if unauthenticated).
- [ ] Verify: sign up, create a graph, plot points, refresh the page — data persists. Log out and back in — data is there.

**Result**: a real, authenticated app with persistent data.

---

## Phase 4: Dashboard & Multi-Graph
**Goal**: users can create, manage, and switch between multiple graphs.

- [ ] Build `DashboardPage` with `MiniGraphWidget` grid.
- [ ] Implement `MiniGraphWidget` using **static PNG snapshots** — render an off-screen Konva stage at thumbnail resolution, export via `stage.toDataURL()`, cache in IndexedDB. Regenerate snapshot when graph data changes.
- [ ] Design empty dashboard state — prompt with "Create your first graph" + "Browse templates" link.
- [ ] Build "New Graph" flow — `GraphSetupWizard` with type selection, axis config, grid toggle.
- [ ] Support graph archiving and deletion from the dashboard.
- [ ] Verify: create multiple graphs, see them on dashboard, tap to open, archive one, verify it disappears. Verify snapshots update after adding points.

**Result**: a multi-graph app with a home screen.

---

## Phase 5: Templates
**Goal**: users can start from pre-built templates instead of blank canvas.

- [ ] Seed the `templates` table with 4–5 system templates (mood quadrant, energy/productivity, alignment chart, etc.).
- [ ] Build `TemplatePicker` — gallery of template cards with preview thumbnails.
- [ ] Implement template → graph cloning (copy axes, grid config, type).
- [ ] Integrate into the "New Graph" flow — user chooses "Start from template" or "Custom".
- [ ] Verify: browse templates, select one, create a graph from it, verify axes/type match the template.

**Result**: templates eliminate the blank-slate problem.

---

## Phase 6: Additional Renderers
**Goal**: support all four graph types, not just quadrants.

- [ ] Implement `LineRenderer` — time axis, value axis, chronological point connections. X position derived from timestamp (not stored as coordinate).
- [ ] Build `PathLayer` — draw lines between sequential points.
- [ ] Implement `RadialRenderer` — spoke layout, radar polygon rendering.
- [ ] Implement radial input mode in `PointInspector` — slider per spoke with live polygon preview on canvas.
- [ ] Implement `TimelineRenderer` — 1D scatter along a time axis.
- [ ] Update `GraphSetupWizard` to support configuring each type (spoke naming for radial, etc.).
- [ ] Update `MiniGraphWidget` snapshot generation to handle all types.
- [ ] Verify: create graphs of each type, plot points, verify rendering is correct on mobile and desktop. For radial, verify slider → polygon flow works.

**Result**: all four graph types are fully functional.

---

## Phase 7: Insight Engine
**Goal**: the app surfaces patterns in user data.

- [ ] Implement `trends.ts` — linear regression, drift detection. Minimum 7 points.
- [ ] Implement `timePatterns.ts` — day-of-week and time-of-day analysis. Minimum 14 points.
- [ ] Implement `clusters.ts` — basic clustering (k-means or DBSCAN). Minimum 10 points.
- [ ] Implement `outliers.ts` — distance-based outlier detection. Minimum 10 points.
- [ ] Build `insightService.ts` — orchestrate algorithms, enforce minimum thresholds, format results.
- [ ] Build `InsightPanel` UI — card-based, scrollable, with period selector.
- [ ] Build insight placeholder/progress state — "Keep logging — insights unlock after a few more entries" with a progress indicator toward the nearest threshold.
- [ ] Build `InsightOverlayLayer` — render trend lines, cluster highlights, and outlier markers on the canvas.
- [ ] Build `InsightNudgeBanner` for the dashboard.
- [ ] Wire insight computation to trigger on point changes (debounced).
- [ ] Verify: plot enough test data, verify insights appear only above thresholds. Verify placeholder shows with insufficient data. Verify trend lines / patterns / clusters render correctly.

**Result**: the retention hook is live. Users see patterns.

---

## Phase 8: Data Import
**Goal**: users can bulk-import data from CSV/Excel files.

- [ ] Add Papa Parse and SheetJS dependencies.
- [ ] Build `ImportWizard` — file upload, column mapping, preview, confirm.
- [ ] Implement `importService.ts` — parse file, validate data, batch insert.
- [ ] Add import job tracking (`import_jobs` table).
- [ ] Visually distinguish imported points (source badge or subtle style difference).
- [ ] Verify: import a CSV with ~50 rows, map columns, preview on canvas, confirm, verify all points appear with correct coordinates and timestamps.

**Result**: users can bring in existing data.

---

## Phase 9: Playground & Onboarding
**Goal**: the first-time experience is frictionless and compelling.

- [ ] Build `PlaygroundPage` — loads a pre-configured template, no auth required.
- [ ] Store playground data in local state / localStorage.
- [ ] Build signup nudge after first point is plotted.
- [ ] Implement playground → account migration (batch insert local points after signup).
- [ ] Build a simple landing page with animated graph examples.
- [ ] Verify: open the app for the first time, land on playground, drop points, sign up, verify points migrate to the new account.

**Result**: the hook is set. New users can try before they commit.

---

## Phase 10: Polish & PWA
**Goal**: production-quality mobile experience.

- [ ] PWA setup — service worker, manifest, icons, offline app shell caching.
- [ ] Implement offline point queue — IndexedDB-backed write queue, sync on reconnect, unsynced point indicators.
- [ ] Add offline banner UI — "You're offline — changes will sync when you reconnect."
- [ ] Performance audit — check canvas render times, fix jank, verify snapshot generation isn't blocking.
- [ ] Micro-animations — point drop animation, panel transitions, insight reveals.
- [ ] Accessibility pass — keyboard navigation, screen reader labels, contrast.
- [ ] Responsive QA — test on small phones (iPhone SE), large phones, tablets, desktop.
- [ ] Error handling — network failure toasts with auto-retry, loading skeletons, import failure messaging.
- [ ] Verify: install as PWA on a phone, create points while offline, reconnect and verify sync. Verify animations are smooth. Test on multiple screen sizes.

**Result**: V1 is shippable.

---

## Dependency Graph

```
Phase 0 (Scaffold)
  └─ Phase 1 (Canvas)
       └─ Phase 2 (Point Entry)
            └─ Phase 3 (Persistence)
                 ├─ Phase 4 (Dashboard)
                 │    └─ Phase 5 (Templates)
                 ├─ Phase 6 (Renderers)
                 ├─ Phase 7 (Insights)
                 └─ Phase 8 (Import)
                      └─ Phase 9 (Onboarding)
                           └─ Phase 10 (Polish)
```

Phases 4–8 can be built in parallel after Phase 3. Phase 9 depends on having templates and a working graph. Phase 10 is the final pass.
