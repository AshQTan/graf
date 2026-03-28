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

---

## Insight Computation

### Client-Side (V1)

For V1, all insight computation runs in the browser. This is fine for ≤500 points per graph. The `insightService.ts` orchestrates calls to the pure functions in `insights/`:

```
insightService.ts
  └── computeInsights(points: Point[], timeRange): Insight[]
        ├── trends.computeTrend(points)         → trend direction, slope, confidence
        ├── trends.detectDrift(points, window)   → recent drift summary
        ├── timePatterns.byDayOfWeek(points)     → per-day averages
        ├── timePatterns.byTimeOfDay(points)     → morning/afternoon/evening clusters
        ├── clusters.findClusters(points)        → cluster centroids + sizes
        └── outliers.detectOutliers(points)      → points far from any cluster
```

### Insight Algorithms (Brief)

Each algorithm has a **minimum data threshold** — below this, it returns `null` and the UI shows an encouraging placeholder instead of bad math.

| Algorithm | Minimum Points | Rationale |
|-----------|:-:|---|
| Trend line | 7 | Regression on < 7 points is noise |
| Drift detection | 14 | Need enough history to compare recent vs. overall |
| Day-of-week | 14 | Need ≥ 2 weeks to see day patterns |
| Time-of-day | 10 | Need spread across time slots |
| Clustering | 10 | K-means/DBSCAN on < 10 points is meaningless |
| Outlier detection | 10 | Depends on clustering having run first |

**Trend line**: Linear regression on coordinate values over time. For 2D graphs, compute independently for X and Y. Report slope direction and magnitude in human terms ("trending up", "mostly stable").

**Drift detection**: Compare the mean coordinate of the most recent N points (e.g., last 7 days) against the overall mean. Flag if the difference exceeds a threshold.

**Day-of-week / time-of-day**: Group points by `timestamp` day or hour. Compute mean coordinate per group. Surface the group with the highest and lowest values.

**Clustering**: Use a simple algorithm — k-means with k=2 or 3 (auto-selected by silhouette score), or DBSCAN for density-based clustering. Report the largest cluster's centroid in human-friendly terms (mapped back to axis labels).

**Outlier detection**: Points whose distance from the nearest cluster centroid exceeds 2 standard deviations.

### Server-Side (Future)

If insight computation becomes too slow on the client (many points, complex graphs), move the heavy lifting to a Supabase Edge Function:
- Client sends `{ graphId, timeRange }`.
- Edge function queries points from the DB, runs algorithms, returns results.
- Cached in the edge function's response with a short TTL.

---