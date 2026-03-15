# Architecture Overview

## Tech Stack Recommendation

### Frontend
- **Framework**: React (via Vite) — fast dev server, great ecosystem, you already know it from Snowball.
- **Language**: TypeScript — the data model has enough shape complexity (graph types, coordinate formats, axis configs) that types will save real debugging time.
- **Canvas Rendering**: HTML5 Canvas via [Konva.js](https://konvajs.org/) + [react-konva](https://github.com/konvajs/react-konva). Reasoning below.
- **State Management**: Zustand — lightweight, works well with React, no boilerplate. One store per concern (graph state, UI state, user state).
- **Routing**: React Router v6.
- **Styling**: Vanilla CSS with CSS custom properties for theming groundwork. Mobile-first responsive design.
- **PWA**: Vite PWA plugin for service worker, manifest, and installability.

### Backend
- **Platform**: Supabase — handles auth, Postgres database, file storage (for photo attachments and import files), and real-time subscriptions (useful later for async collaboration). Eliminates the need to build and deploy a custom server for V1.
- **Auth**: Supabase Auth (email/password, optional OAuth providers).
- **Database**: PostgreSQL (via Supabase). The data model maps cleanly to relational tables. JSON columns for flexible fields (axes, coordinates, preferences).
- **File Storage**: Supabase Storage for photo attachments and uploaded CSV/Excel files.
- **Edge Functions**: Supabase Edge Functions (Deno) for server-side insight computation that's too heavy for the client.

### Why Konva for the Canvas?

The graph engine is the most technically demanding part of the app. Here's why Konva over alternatives:

| Option | Pros | Cons |
|--------|------|------|
| **SVG (raw or D3)** | Declarative, easy hit testing, accessibility | Performance degrades with many elements; D3's API fights React's model |
| **HTML5 Canvas (raw)** | Fast rendering, pixel control | No built-in hit detection, manual event handling, lots of boilerplate |
| **Konva + react-konva** | Canvas performance + declarative React components + built-in drag/drop, hit detection, touch events, layering | Extra dependency (~150KB), learning curve |
| **Pixi.js** | WebGL-accelerated, very fast | Overkill for 2D plotting, gaming-oriented API |

Konva hits the sweet spot: it gives you Canvas performance with React-friendly declarative components, built-in drag-and-drop (critical for point plotting), touch event handling (critical for mobile), and layering (useful for separating grid, points, and overlays).

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)          │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │Dashboard │  │  Graph   │  │  Setup / Import   │  │
│  │  View    │  │  View    │  │  Wizards          │  │
│  └────┬─────┘  └────┬─────┘  └───────┬───────────┘  │
│       │              │                │              │
│  ┌────┴──────────────┴────────────────┴───────────┐  │
│  │              State Layer (Zustand)              │  │
│  │  graphStore · uiStore · userStore · insightStore│  │
│  └────────────────────┬───────────────────────────┘  │
│                       │                              │
│  ┌────────────────────┴───────────────────────────┐  │
│  │            Data Access Layer                    │  │
│  │  supabase client · queries · mutations · cache  │  │
│  └────────────────────┬───────────────────────────┘  │
│                       │                              │
│  ┌────────────────────┴───────────────────────────┐  │
│  │          Graph Engine (Konva)                   │  │
│  │  renderers · interaction handlers · overlays    │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS / WebSocket
┌──────────────────────┴───────────────────────────────┐
│                  Supabase                             │
│                                                       │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐ │
│  │  Auth   │  │ Postgres │  │ Storage │  │  Edge  │ │
│  │         │  │   (DB)   │  │ (Files) │  │  Fns   │ │
│  └─────────┘  └──────────┘  └─────────┘  └────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## Project Structure

```
graf/
├── overview/                    # Product docs (existing)
├── implementation/              # Architecture docs (this folder)
├── src/
│   ├── main.tsx                 # App entry point
│   ├── App.tsx                  # Root component, routing
│   │
│   ├── engine/                  # Graph rendering engine (Konva-based)
│   │   ├── GraphCanvas.tsx      # Main canvas wrapper
│   │   ├── renderers/           # Per-graph-type rendering logic
│   │   │   ├── QuadrantRenderer.tsx
│   │   │   ├── LineRenderer.tsx
│   │   │   ├── RadialRenderer.tsx
│   │   │   └── TimelineRenderer.tsx
│   │   ├── layers/              # Visual layers drawn on the canvas
│   │   │   ├── AxisLayer.tsx
│   │   │   ├── GridLayer.tsx
│   │   │   ├── PointLayer.tsx
│   │   │   ├── PathLayer.tsx
│   │   │   └── InsightOverlayLayer.tsx
│   │   ├── interactions/        # Input handling
│   │   │   ├── useTapToPlot.ts
│   │   │   ├── useDragPoint.ts
│   │   │   ├── usePinchZoom.ts
│   │   │   └── usePan.ts
│   │   └── utils/               # Coordinate math, normalization
│   │       ├── coordinates.ts
│   │       └── scaling.ts
│   │
│   ├── components/              # Shared UI components
│   │   ├── PointInspector.tsx
│   │   ├── InsightPanel.tsx
│   │   ├── TemplatePicker.tsx
│   │   ├── GraphSetupWizard.tsx
│   │   ├── ImportWizard.tsx
│   │   ├── MiniGraphWidget.tsx
│   │   └── common/              # Buttons, inputs, modals, bottom sheets
│   │
│   ├── pages/                   # Route-level views
│   │   ├── DashboardPage.tsx
│   │   ├── GraphPage.tsx
│   │   ├── PlaygroundPage.tsx   # No-login trial
│   │   ├── SetupPage.tsx
│   │   └── AuthPage.tsx
│   │
│   ├── stores/                  # Zustand stores
│   │   ├── graphStore.ts
│   │   ├── uiStore.ts
│   │   ├── userStore.ts
│   │   └── insightStore.ts
│   │
│   ├── services/                # Data access & business logic
│   │   ├── supabase.ts          # Client init
│   │   ├── graphService.ts      # CRUD for graphs
│   │   ├── pointService.ts      # CRUD for points
│   │   ├── templateService.ts
│   │   ├── importService.ts     # CSV/Excel parsing & mapping
│   │   └── insightService.ts    # Insight computation
│   │
│   ├── insights/                # Insight algorithms
│   │   ├── trends.ts            # Trend lines, drift detection
│   │   ├── timePatterns.ts      # Day-of-week, time-of-day analysis
│   │   ├── clusters.ts          # K-means or DBSCAN clustering
│   │   └── outliers.ts          # Outlier detection
│   │
│   ├── types/                   # TypeScript type definitions
│   │   ├── graph.ts
│   │   ├── point.ts
│   │   ├── template.ts
│   │   ├── user.ts
│   │   └── insight.ts
│   │
│   └── styles/                  # Global CSS
│       ├── index.css            # Reset, variables, base styles
│       ├── components.css
│       └── pages.css
│
├── public/
│   ├── manifest.json            # PWA manifest
│   └── icons/
│
├── supabase/                    # Supabase project config
│   ├── migrations/              # SQL migrations
│   └── functions/               # Edge functions (insight computation)
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Key Structural Decisions

1. **`engine/` is isolated from `components/`**. The graph rendering engine is the most complex subsystem. It lives in its own directory with its own renderer, layer, and interaction abstractions. UI components (modals, panels, wizards) are separate.

2. **Renderers are per-graph-type.** A `QuadrantRenderer` knows how to lay out four quadrants with labels. A `RadialRenderer` knows how to draw spokes from a center point. The `GraphCanvas` delegates to the right renderer based on `graph.graph_type`. This keeps each renderer focused and testable.

3. **Layers are composable.** The axis, grid, points, paths, and trend overlays are each their own Konva layer. Layers can be toggled independently (e.g., hide the grid, show/hide trend lines). This maps directly to Konva's `Layer` concept.

4. **Insights are pure functions.** The `insights/` directory contains stateless algorithms that take an array of points and return computed results. No side effects, easy to test and eventually move to server-side if they get expensive.

5. **Services abstract Supabase.** Components never call Supabase directly. If the backend changes later, only the service layer needs updating.
