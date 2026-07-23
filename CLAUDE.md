# V&I Launchpad — AI Handoff

## What this is
Static HTML/CSS/JS prototype dashboard for Deloitte's V&I (Ventures & Innovation) design team.
Single entry point for all internal Deloitte tools — eliminates link-hunting and tribal knowledge.
**No framework. No build step. No backend.** Opens directly in a browser.

Primary audience: V&I designers. Future: all Deloitte Digital teams.

---

## Repo & local path
- **GitHub:** https://github.com/caitiedesign/deloitte-vi-launchpad
- **Local:** `/Users/cphilpott/Library/CloudStorage/OneDrive-Deloitte(O365D)/Documents/AI/Fun Projects/Deloitte Dashboard/`
- **Dev server:** `python3 -m http.server 3000` (configured in `.claude/launch.json`)

---

## File map

| File | Purpose |
|---|---|
| `index.html` | Full page structure — sidebar, topbar, alerts section, quick actions, tool directory, onboarding modal, footer |
| `styles.css` | All styles. CSS variables in `:root` control the entire colour scheme |
| `script.js` | All JS — API layer, alert builder, renderer, search, sidebar filter, modal |
| `prd.md` | Product requirements (sections, scope, success criteria) |
| `project-brief.md` | Context, audience, tone, constraints |
| `.claude/launch.json` | Dev server config for Claude Code preview |

---

## Architecture

### Layout
```
[Sidebar 240px fixed] [Main: Topbar 64px sticky + Content]
```
- Sidebar has category nav buttons (`data-filter` attr) that filter the tool directory
- Collapses to 64px icon-only at <900px
- Search in topbar filters all tool cards live across categories

### Key HTML IDs
- `#alerts-section` — injected entirely by JS, appears above quick actions
- `#quick-actions` — hidden when a category filter or search is active
- `#tool-directory` — contains `.category[data-category]` divs
- `#modal-backdrop` — onboarding modal, toggled by `#onboarding-trigger`
- `#no-results` — shown when search finds nothing
- `#js-date` — populated by JS with today's date
- `.page-heading h1` — greeting text set by JS based on time of day

### Tool cards
Each tool card is `<a class="tool-card" href="#" target="_blank">`.
**All `href="#"` are placeholders — replacing these with real URLs is the primary outstanding task.**

### Category filter
Sidebar buttons have `data-filter="time|people|finance|learning|projects|it|comms|all"`.
Tool directory `<div class="category">` elements have matching `data-category` attrs.
Clicking a category hides all others and hides quick actions.

---

## API layer (`script.js` — top of file)

### Toggle
```js
const USE_MOCK   = true;   // ← flip to false when proxy is ready
const PROXY_BASE = '/api'; // ← point to backend proxy base URL
```
Flipping `USE_MOCK` to `false` activates all four real fetch calls. No other changes needed.

### Four proxy endpoints required

| Endpoint | Source system | Auth |
|---|---|---|
| `GET /api/timesheet/status` | SAP OData `ZTIME_TGE_SRV/TimesheetSet` | SSO cookie |
| `GET /api/myqr/outstanding` | ServiceNow `sn_lms_course_enrollment` table | SSO cookie |
| `GET /api/staffit/allocations` | Staffit internal REST API | SSO cookie |
| `GET /api/cirrus/leave-pending` | Cirrus / SuccessFactors | SSO cookie |

All fetches use `credentials: 'include'` — the proxy must accept the user's SSO session cookie and forward it to the internal systems.

### Expected response shapes (contract for backend team)

```js
// GET /api/timesheet/status
{
  submitted: false,
  weekEnding: '2026-05-30',       // ISO date string (Friday)
  weekEndingLabel: '30 May',      // human-readable
  hoursLogged: 0,
  url: 'https://uswasfdp.deloitte.com/sap/bc/ui5_ui5/sap/ztime_tge/index.html'
}

// GET /api/myqr/outstanding
{
  modules: [
    { id: 'myqr-001', title: 'Annual Ethics Training', dueDate: '2026-06-07', estimatedMins: 20 },
    // ...
  ],
  nearestDueDate: '2026-06-07',   // ISO date string
  url: 'https://deloitteservices.service-now.com/myqr'
}

// GET /api/staffit/allocations
{
  currentProjects: [
    { id: 'proj-01', name: 'Client A — Discovery', role: 'UX Designer',
      startDate: '2026-05-01', endDate: '2026-07-31', allocationPct: 80 },
  ],
  url: 'https://staffit.deloitteresources.com/WebUI/UserValidation?gw-client=200#/dashboard'
}

// GET /api/cirrus/leave-pending
{
  pendingApplications: [
    { startDate: '2026-06-10', endDate: '2026-06-14',
      startLabel: '10 Jun', endLabel: '14 Jun', days: 5, type: 'Annual Leave' }
  ],
  url: '#'  // Cirrus leave application URL — needs confirming with IT
}
```

### Alert urgency logic (in `buildAlerts()`)
- **Timesheet:** overdue if `daysUntil(weekEnding) < 0`
- **Training:** overdue if ≤3 days to `nearestDueDate`, otherwise `soon`
- **Leave:** always `soon` — fires whenever `pendingApplications.length > 0`
- `badgeForDays(n)` returns: `"Overdue"` / `"Due today"` / `"Due tomorrow"` / `"Due in N days"`

### Failure handling
Each fetch is independently caught. If one API fails, the others still render. The section shows an error + retry button only if everything fails simultaneously.

---

## Design decisions — do not change without reason

| Decision | Rationale |
|---|---|
| Black & white only | Intentional wireframe mode — team is still iterating UX, not visual design |
| No framework | Zero build complexity, anyone can open `index.html` directly |
| sessionStorage for dismissals | Alerts reappear on next browser session — intentional, they're real tasks |
| `credentials: 'include'` on all fetches | Required for Deloitte SSO cookie to flow through to proxy |
| All tool links open in new tab | Tools are external systems; user shouldn't lose the dashboard |

### Colour system
All colour lives in `:root` variables in `styles.css`. The design is intentionally greyscale for now.
When ready for a colour pass, update these variables — nothing else needs touching:
```css
--green:       #86BC25;  /* Deloitte green — currently mapped to black (#111111) */
--green-mid:   #6a9a1f;  /* currently #333333 */
--green-dim:   ...;      /* currently #F0F0F0 */
--green-border:...;      /* currently #CCCCCC */
```

---

## Figma file
https://www.figma.com/design/GHX741ayDzilPVW1HgUZcw/Deloitte-Dashboard-AI

**WIP page contains 3 editable wireframe frames:**
- `01 — Default Dashboard` — full layout, all categories visible
- `02 — Alerts Active` — 3 alert tiles above quick actions
- `03 — Category Filter (Time & Scheduling)` — sidebar filter active

---

## Outstanding work (priority order)

### 1. Fill in real URLs — no code changes needed, just HTML edits
Every `href="#"` in `index.html` needs a real Deloitte URL. Key ones:
- Timesheets: `https://uswasfdp.deloitte.com/sap/bc/ui5_ui5/sap/ztime_tge/index.html`
- MyQ&R: `https://deloitteservices.service-now.com/myqr`
- Staffit: `https://staffit.deloitteresources.com/WebUI/UserValidation?gw-client=200#/dashboard`
- Cirrus, Concur, Float, SharePoint, DNet etc. — get from team

### 2. Build the backend proxy
Node or Python server, inside Deloitte network (or VPN-accessible).
Exposes the 4 endpoints above, handles SSO pass-through.
This is an IT/infrastructure conversation, not a frontend task.

### 3. Add more tools
IT & Support and Communications categories are sparse.
Ask the team which tools they actually use daily and add cards.

### 4. Staffit data → alerts
Staffit data is fetched but not yet used to generate alerts.
Could warn: "You have no allocation after 31 July" or "You're over-allocated this week."
Hook into `buildAlerts()` — the `staffit` param is already passed in.

### 5. Colour/brand pass
Once UX is locked, swap the greyscale variables back to Deloitte green.
Reference: Deloitte green = `#86BC25`, dark = `#000000`, mid-grey = `#53565A`.

### 6. User personalisation
Greet by name once SSO is connected.
Proxy can return `{ name: 'Caitie' }` from a `/api/user` endpoint.
Update the greeting: `Good afternoon, Caitie — what do you need?`

---

## What NOT to do
- Do not add a framework (React, Vue etc.) — overkill for a prototype
- Do not store credentials or tokens in the frontend — proxy handles all auth
- Do not add comments explaining what code does — only add comments for non-obvious WHY
- Do not create new files unless genuinely necessary — keep it to 3 core files
- Do not add error handling for scenarios that can't happen in a static prototype
- Design system guidance is provided separately — do not invent Deloitte brand rules
