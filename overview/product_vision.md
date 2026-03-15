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
