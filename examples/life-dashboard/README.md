# Life dashboard

A personal dashboard built on the `@efferd/dashboard-4` shadcn block, styled
after the spike avatar: lime `#a6ff00` on ink `#111316`, frosted-glass panels
over an animated 1-bit ordered-dither glow.

```bash
npm install
npm run dev     # http://localhost:5173
```

## Widgets and where their data lives

| Widget | Source | Today |
| --- | --- | --- |
| Email (work/admin, personal, employment) | `GET /api/email` | demo data |
| Calendar | `GET /api/calendar` | demo data |
| Banking | `GET /api/banking` | demo data |
| Claude usage | `GET /api/claude` | demo data |
| To-do, Medication, Notes, Projects, Goals, Shortcuts | browser `localStorage` | fully editable |

Each feed is fetched on load, re-synced on an interval (email 2 min, calendar
and Claude 5 min, banking 15 min) and again whenever the tab regains focus.
Until `/api/<feed>` answers with JSON, the widget shows demo data and an amber
**Demo** badge; once it does, the badge turns to a lime **Live**. The response
shapes are the `Feeds` types in [`src/lib/types.ts`](src/lib/types.ts), so a
backend only has to return those.

Saved collections use keys prefixed `life-dashboard:v1:` and stay in step
across open tabs. "Reset saved data" in the avatar menu clears them.

## Layout

- `src/lib/` — types, demo data, the `LifeDataProvider` (feeds + saved
  collections) and formatting helpers.
- `src/components/widgets/` — one file per widget, plus the shared glass
  `Widget` shell, `SyncBadge`, dithered `Meter` and chart `DitherPatternDefs`.
- `src/components/dither-backdrop.tsx` — the background canvas (Bayer 8×8,
  ~12 fps, still when the OS asks for reduced motion).
- The sidebar, header and shell are the block's, re-pointed at the widgets.
