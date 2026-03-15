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
| `timestamp` | timestamp | When the point represents (defaults to creation time, user-editable) |
| `note` | text? | Optional text annotation |
| `tags` | string[]? | Optional tags |
| `emoji` | string? | Optional emoji marker |
| `photo_url` | string? | Optional photo attachment |
| `source` | enum | `manual`, `csv_import`, `excel_import` |
| `created_at` | timestamp | When the point was actually created in the system |

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
