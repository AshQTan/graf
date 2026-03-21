# Backend & Data Layer

## Supabase Schema

### Tables

The SQL migrations live in `supabase/migrations/`. Here's the conceptual schema:

```sql
-- Users are managed by Supabase Auth. This table extends auth.users.
create table profiles (
  id          uuid primary key references auth.users(id),
  username    text unique not null,
  preferences jsonb default '{}',
  created_at  timestamptz default now()
);

create table templates (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  description   text,
  graph_type    text not null check (graph_type in ('quadrant', 'line', 'radial', 'timeline')),
  axes          jsonb not null,
  grid_config   jsonb default '{}',
  suggested_tags text[] default '{}',
  preview_image text,
  is_system     boolean default true,
  author_id     uuid references profiles(id),
  created_at    timestamptz default now()
);

create table graphs (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references profiles(id) not null,
  title        text not null,
  graph_type   text not null check (graph_type in ('quadrant', 'line', 'radial', 'timeline')),
  axes         jsonb not null,
  grid_config  jsonb default '{"snap_enabled": false, "divisions": 3}',
  is_archived  boolean default false,
  is_public    boolean default false,
  template_id  uuid references templates(id),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Auto-update graphs.updated_at when points are added/modified/deleted
create or replace function update_graph_timestamp()
returns trigger as $$
begin
  update graphs set updated_at = now() where id = coalesce(NEW.graph_id, OLD.graph_id);
  return coalesce(NEW, OLD);
end;
$$ language plpgsql;

create trigger points_update_graph_timestamp
  after insert or update or delete on points
  for each row execute function update_graph_timestamp();

create table points (
  id           uuid primary key default gen_random_uuid(),
  graph_id     uuid references graphs(id) on delete cascade not null,
  user_id      uuid references profiles(id) not null,
  coordinates  jsonb not null,
  -- Format varies by graph type:
  --   quadrant: {"x": 0.73, "y": 0.41}
  --   line:     {"y": 0.6}              (x position derived from timestamp at render time)
  --   radial:   {"spoke_1": 0.8, "spoke_2": 0.3, ...}
  --   timeline: {}                       (position derived from timestamp)
  timestamp    timestamptz not null default now(),
  note         text,
  tags         text[] default '{}',
  emoji        text,
  photo_url    text,
  source       text default 'manual' check (source in ('manual', 'csv_import', 'excel_import')),
  created_at   timestamptz default now()
);

create table import_jobs (
  id             uuid primary key default gen_random_uuid(),
  graph_id       uuid references graphs(id) on delete cascade not null,
  user_id        uuid references profiles(id) not null,
  file_type      text not null check (file_type in ('csv', 'excel')),
  column_mapping jsonb not null,
  row_count      integer default 0,
  status         text default 'pending' check (status in ('pending', 'previewing', 'committed', 'failed')),
  created_at     timestamptz default now()
);

-- Post-V1
create table collaborations (
  id           uuid primary key default gen_random_uuid(),
  graph_id     uuid references graphs(id) on delete cascade not null,
  user_id      uuid references profiles(id) not null,
  permission   text default 'read' check (permission in ('read', 'write')),
  marker_color text,
  invited_at   timestamptz default now(),
  unique(graph_id, user_id)
);
```

### Row Level Security (RLS)

Supabase uses PostgreSQL RLS to enforce access control at the database level. Key policies:

- **profiles**: users can read/update only their own profile.
- **graphs**: users can CRUD only graphs where `owner_id = auth.uid()`. (Post-V1: also allow read/write for collaborators.)
- **points**: users can read all points on graphs they own. Users can insert/update/delete only their own points.
- **templates**: system templates are readable by everyone. User-created templates are readable by everyone, writable only by author. (post-V1)

---

## API Patterns

The frontend interacts with Supabase through its JavaScript client library. No custom REST API needed for V1.

### Service Layer

Each service module wraps Supabase calls:

```
graphService.ts
  ├── getGraphs(userId)        → select * from graphs where owner_id = userId
  ├── getGraph(graphId)        → select * from graphs where id = graphId
  ├── createGraph(config)      → insert into graphs
  ├── updateGraph(id, config)  → update graphs where id = id
  └── deleteGraph(id)          → delete from graphs where id = id (cascades points)

pointService.ts
  ├── getPoints(graphId)       → select * from points where graph_id = graphId order by timestamp
  ├── addPoint(point)          → insert into points
  ├── updatePoint(id, data)    → update points where id = id
  └── deletePoint(id)          → delete from points where id = id

templateService.ts
  └── getTemplates()           → select * from templates where is_system = true

importService.ts
  ├── createImportJob(...)     → insert into import_jobs
  ├── commitImport(jobId, points[]) → batch insert into points, update job status
  └── parseFile(file)          → client-side CSV/Excel parsing (Papa Parse + SheetJS)
```

### File Parsing (Client-Side)

CSV and Excel files are parsed entirely on the client:
- **CSV**: [Papa Parse](https://www.papaparse.com/) — lightweight, handles edge cases well.
- **Excel**: [SheetJS (xlsx)](https://sheetjs.com/) — reads `.xlsx` files in the browser.

The parsed rows are shown in the ImportWizard for column mapping. Only after the user confirms are the points sent to Supabase in a batch insert.

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

## Auth Flow

1. **Signup**: email + password via Supabase Auth. On success, a trigger creates a row in `profiles`.
2. **Login**: email + password. Supabase returns a JWT. The client stores it (Supabase client handles this automatically).
3. **Session persistence**: Supabase client auto-refreshes tokens. On app load, check for existing session.
4. **Playground → Signup transition**: when a playground user signs up, associate their playground data with their new account.
    - Playground points and graph config are stored in localStorage/IndexedDB (not Supabase — no auth yet).
    - On signup, the Supabase auth trigger creates the `profiles` row.
    - **The client must wait for the profile row to exist before inserting points** (the FK on `points.user_id → profiles.id` will reject otherwise). Approach: after signup resolves, poll `profiles` with a short retry loop (up to 3 retries, 500ms apart) before batch-inserting the playground data. Alternatively, use a Supabase database webhook or `on('INSERT')` subscription on `profiles` to know when the row is ready.
    - If migration fails (edge case), the playground data remains in local storage and the user is prompted to retry.

---

## Storage

Supabase Storage is used for:
- **Photo attachments**: uploaded when a user attaches a photo to a point. Stored in a `point-photos/{userId}/{pointId}` path. The `photo_url` field on the point stores the public URL.
- **Import files**: optionally stored for audit/re-import. Stored in `imports/{userId}/{jobId}`. Can be auto-deleted after 30 days.
- **Template preview images**: stored in a `templates/` bucket. System templates are pre-uploaded.

---

## Offline Sync

The app must handle offline usage gracefully since it targets mobile:

- **Local cache**: Zustand state is persisted to IndexedDB via middleware. On app open, the cache loads immediately while a background fetch syncs with Supabase.
- **Offline write queue**: point creation/edits/deletes while offline are queued in IndexedDB as ordered operations. Each entry stores the action type, payload, and a local timestamp.
- **Sync on reconnect**: when the network returns (detected via `navigator.onLine` + `online` event), the queue is flushed sequentially. Successfully synced operations are removed from the queue.
- **Conflict resolution**: last-write-wins by timestamp. Since V1 is single-user (no collaboration), true conflicts are impossible — the only scenario is the same user editing on two devices while one is offline. Timestamp comparison handles this adequately.
- **UI indicators**: unsynced points show a subtle visual marker (e.g., a small clock icon). A global banner appears when offline: "You're offline — changes will sync when you reconnect."
