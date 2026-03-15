# User Flows

## 1. First-Time Experience

1. **Landing page**: animated examples of graphs in motion — points dropping, trend lines drawing, clusters forming. Communicates the concept instantly.
2. **No-login playground**: user is dropped directly into a pre-loaded template (e.g., "How are you feeling right now?" mood quadrant). No signup required.
3. **First plot**: user taps the canvas to drop a point. Satisfying micro-animation plays. The `PointInspector` slides up with timestamp and optional note — but saving with zero edits is fine.
4. **Signup nudge**: after the first point, a gentle prompt: *"Want to track this over time? Create a free account."* Non-blocking — user can keep plotting without signing up.

## 2. Daily Logging

1. **Open app**: dashboard loads showing `MiniGraphWidget` tiles of active graphs, sorted by recency.
2. **Tap a graph**: full `GraphCanvas` opens with existing points visible.
3. **Drop a point**: tap the canvas. `PointInspector` slides up. Optionally type a quick note or tag.
4. **Save**: point is committed. Canvas updates. Total interaction: **< 10 seconds**.
5. **Insight nudge** *(optional)*: after saving, a subtle toast or banner surfaces a relevant insight: *"You've been in the high-energy quadrant 4 days in a row."*

## 3. Creating a Custom Graph

1. **Tap "New Graph"** from the dashboard.
2. **Choose graph type**: quadrant, 2D line, radial, or timeline. Visual previews for each.
3. **Define axes**: type labels for each axis endpoint (e.g., X: "Introverted" ↔ "Extroverted"). For radial, name each spoke.
4. **Configure grid** *(optional)*: enable grid snapping, set divisions.
5. **Preview**: see the empty canvas with axes and labels rendered.
6. **Save**: graph is created and appears on the dashboard. User is prompted to make their first entry.

## 4. Reviewing Insights

1. **Open a graph** with existing data.
2. **Tap the insight tab/panel**: `InsightPanel` opens showing computed analysis.
3. **Browse sections**: trend summary (direction + magnitude), time patterns (best/worst days), cluster summary (where points concentrate), outlier callouts.
4. **Adjust time range**: toggle between "this week", "this month", "all time", or custom range. Insights recompute.
5. **Tap a specific insight**: navigates back to the canvas with the relevant points highlighted or a trend line overlaid.

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
