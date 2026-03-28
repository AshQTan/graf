# Data Model

*Conceptual data model. Not tied to a specific database yet — this defines the entities and their relationships.*

## Entities

### User
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `username` | string | Unique display name |
| `email` | string | For auth |
| `preferences` | JSON | Global settings (default theme, notification prefs) |
| `created_at` | timestamp | |

### Graph
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `owner_id` | UUID | FK → User |
| `title` | string | User-facing name |
| `graph_type` | enum | `quadrant`, `line`, `radial`, `timeline` |
| `axes` | JSON | Array of axis definitions (see below) |
| `grid_config` | JSON | Snap enabled, grid divisions, etc. |
| `plot_config` | JSON | Configurations for toggles (e.g., `show_lines`, `enable_categories`, `enable_timestamps`) |
| `is_archived` | boolean | Soft delete / hide from dashboard |
| `is_public` | boolean | Default `false` |
| `template_id` | UUID? | FK → Template, if created from one |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

#### Axis Definition (within `axes` JSON)
```json
{
  "axis_key": "x",
  "label_start": "Tired",
  "label_end": "Energetic",
  "is_qualitative": true,
  "range_min": 0.0,
  "range_max": 1.0
}
```
- For radial graphs, each spoke is an axis with `axis_key` like `"spoke_1"`, `"spoke_2"`, etc.
- `range_min` / `range_max` define the normalized coordinate space. Qualitative axes always map to `[0, 1]`.

### Point
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `graph_id` | UUID | FK → Graph |
| `user_id` | UUID | FK → User (who plotted this point) |
| `coordinates` | JSON | Format varies by graph type (see Design Notes) |
| `timestamp` | timestamp? | When the point represents (defaults to creation time, user-editable). Nullable if timestamps are unenabled. |
| `note` | text? | Optional text annotation |
| `tags` | string[]? | Optional user-defined tags attached visually |
| `emoji` | string? | Optional emoji marker |
| `photo_url` | string? | Optional photo attachment (metadata content) |
| `marker_image_url` | string? | Optional explicitly-selected custom marker image to render the point |
| `source` | enum | `manual`, `csv_import`, `excel_import` |
| `created_at` | timestamp | When the point was actually created in the system |

### MultiChartView
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `owner_id` | UUID | FK → User |
| `title` | string | Dashboard view name |
| `grid_layout` | JSON | Layout configuration dimensions (e.g. 2x2, list) and slot mapping |
| `graph_ids` | UUID[] | Array of FK → Graph ids displayed in this view |
| `created_at` | timestamp | |
| `updated_at` | timestamp | |

### Template
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `title` | string | e.g., "Daily Mood Quadrant" |
| `description` | text | Short explanation |
| `graph_type` | enum | Same as Graph |
| `axes` | JSON | Default axis definitions |
| `grid_config` | JSON | Default grid settings |
| `suggested_tags` | string[]? | Optional starter tags |
| `preview_image` | string | Thumbnail URL for the gallery |
| `is_system` | boolean | `true` for built-in templates, `false` for user-published (post-V1) |
| `author_id` | UUID? | FK → User, null for system templates |

### Collaboration *(Post-V1)*
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `graph_id` | UUID | FK → Graph |
| `user_id` | UUID | FK → User (the collaborator) |
| `permission` | enum | `read`, `write` |
| `marker_color` | string | Hex color assigned to this collaborator |
| `invited_at` | timestamp | |

### ImportJob
| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Primary key |
| `graph_id` | UUID | FK → Graph |
| `user_id` | UUID | FK → User |
| `file_type` | enum | `csv`, `excel` |
| `column_mapping` | JSON | Maps file columns to point fields |
| `row_count` | integer | Number of points imported |
| `status` | enum | `pending`, `previewing`, `committed`, `failed` |
| `created_at` | timestamp | |

## Relationships

```
User 1──* Graph          (a user owns many graphs)
User 1──* Point          (a user creates many points)
User 1──* MultiChartView (a user owns many multi-chart views)
Graph 1──* Point         (a graph contains many points)
Template 1──* Graph      (a template can spawn many graphs)
Graph 1──* Collaboration (a graph can have many collaborators)  [post-V1]
User 1──* Collaboration  (a user can collaborate on many graphs) [post-V1]
Graph 1──* ImportJob     (a graph can have multiple imports)
```

## Design Notes

- **Coordinates are always normalized.** Even if a user labels an axis "1 to 100", the stored coordinate is `0.0` to `1.0`. Display-layer mapping converts back to user-facing labels. This makes cross-graph analysis and insight computation consistent.
- **Coordinate format varies by graph type:**
  - Quadrant: `{"x": 0.73, "y": 0.41}`
  - Line: `{"y": 0.6}` — X position is derived from `timestamp` at render time, not stored
  - Radial: `{"spoke_1": 0.8, "spoke_2": 0.3, ...}` — one key per spoke, flexible for any count
  - Timeline: `{}` — position is derived entirely from `timestamp`
- **`source` on Point** tracks provenance. Imported data can be visually distinguished or filtered separately from manual entries.


---

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