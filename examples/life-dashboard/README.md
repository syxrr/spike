# Life dashboard

A personal dashboard built on the `@efferd/dashboard-4` shadcn block, styled
after the spike avatar: lime `#a6ff00` on ink `#111316`, frosted-glass panels
over an animated 1-bit ordered-dither glow.

```bash
npm install
npm run dev     # dashboard on http://localhost:5173, API server on :8787
npm test        # server unit tests
```

`npm run dev` starts both the Vite dev server and the API server
(`server/index.ts`); Vite forwards `/api` and `/auth` to it. For a single
process, `npm run build && npm start` serves the built dashboard and the API
together on http://localhost:8787 (set `PUBLIC_URL=http://localhost:8787`).

## Widgets and where their data lives

| Widget | Source | Today |
| --- | --- | --- |
| Email (work/admin, personal, employment) | `GET /api/email` → Gmail | live once an account is linked |
| Calendar | `GET /api/calendar` → Google Calendar | live once an account is linked |
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

## Install it as an app

The dashboard is a Progressive Web App: it installs to a home screen or dock,
opens full screen with the spike icon, and starts offline.

- **Desktop Chrome / Edge:** avatar menu → **Install app** (or the install
  icon in the address bar).
- **iPhone / iPad:** open it in Safari → Share → **Add to Home Screen**. The
  avatar menu's **Install app** shows the same steps.
- **Mac Safari:** File → **Add to Dock**.

Offline, the app opens from its cache and shows the last email and calendar
it synced, marked **Offline**, until the server answers again. Disconnecting
an account clears its cached copy.

**Current limit:** the server runs on one computer and listens only to that
computer, so a phone can't reach it yet, and to-dos, notes and the other
saved data live in each browser separately. Hosting the server (on a cloud
service, or at home behind Tailscale) is what makes it reachable from every
device; moving saved data onto the server is what syncs it. Nothing in the
app needs to change for either.

## Connect Gmail and Google Calendar

The server reads Gmail and Calendar through your own Google Cloud OAuth
client. Setting one up takes about ten minutes, once:

1. In the [Google Cloud console](https://console.cloud.google.com/), create a
   project.
2. Under **APIs & Services → Library**, enable the **Gmail API** and the
   **Google Calendar API**.
3. Open **Google Auth Platform** (the OAuth consent screen). Give the app a
   name, choose **External**, and under **Audience** add each Gmail address
   you'll link as a **test user**. Under **Data access**, add the scopes
   `gmail.readonly` and `calendar.readonly`.
4. Under **Clients**, create an OAuth client of type **Web application** with
   these authorised redirect URIs:
   - `http://localhost:5173/auth/google/callback` (for `npm run dev`)
   - `http://localhost:8787/auth/google/callback` (for `npm start`)
5. Copy `.env.example` to `.env` and paste in the client ID and secret.
6. Run `npm run dev`, open the **Accounts** button in the sidebar (or the link
   icon on the Email widget) and connect an account to each inbox slot.

Calendar shows the next 7 days from the primary calendar of every linked
account, with meetings shared between them listed once.

**Things to know**

- Access is read-only (`gmail.readonly`, `calendar.readonly`): the dashboard
  can't send, delete or change anything.
- While the Google app's publishing status is **Testing**, Google expires its
  logins after 7 days. The inbox then shows "Access expired" with a
  **Reconnect** button. Switching the app to **In production** stops the
  weekly expiry; as an unverified app it shows a warning screen at sign-in,
  which is expected for a personal tool.
- A work account on a company Google Workspace may be blocked from
  third-party apps by its administrator.
- Linked-account tokens are stored in `server/.data/accounts.json`
  (owner-only permissions, git-ignored). Disconnecting revokes the token with
  Google and deletes it.
- The server listens on `127.0.0.1` only and rejects requests addressed to
  any other host. It has no login of its own, so don't expose it to a
  network without adding one.

## Layout

- `src/lib/` — types, demo data, the `LifeDataProvider` (feeds + saved
  collections) and formatting helpers.
- `src/components/widgets/` — one file per widget, plus the shared glass
  `Widget` shell, `SyncBadge`, dithered `Meter` and chart `DitherPatternDefs`.
- `src/components/dither-backdrop.tsx` — the background canvas (Bayer 8×8,
  ~12 fps, still when the OS asks for reduced motion).
- `server/` — the API: `index.ts` (routes and OAuth flow), `google.ts`
  (token refresh, Gmail and Calendar calls), `map.ts` (payload → feed
  mappers, tested in `map.test.ts`), `store.ts` (token file).
- The sidebar, header and shell are the block's, re-pointed at the widgets.
