# PRD — Deloitte V&I Team Dashboard

## What We're Building
A static website prototype that acts as a team launchpad — grouping all internal Deloitte tools into clearly labelled categories so anyone can find and access what they need without asking a colleague.

---

## Sections

### 1. Header / Navigation
- Dashboard name and optional team identifier (e.g. "V&I Launchpad")
- No login, no user state — static only
- Optional: search/filter across all links

---

### 2. Quick Actions (above the fold)
- 4–6 highest-frequency tasks surfaced as large, prominent cards
- Examples: Log Time, Submit Expenses, Check Leave Balance, Complete Training
- Each maps to a specific tool URL
- Intent: zero scrolling for daily tasks

---

### 3. Tool Directory (categorised cards)
Each category is a labelled group of link cards. Suggested categories:

| Category | Tools (examples) |
|---|---|
| Time & Scheduling | Timesheets (SuccessFactors/internal), Float (V&I resourcing), Staffit |
| People & HR | Cirrus (leave, payroll, employee account) |
| Finance | Concur (expenses) |
| Learning & Compliance | MyQ&R (compliance training), LinkedIn Learning |
| Projects & Work | Staffit, internal project trackers |
| IT & Support | Service Desk, software requests |
| Communications | Outlook, Teams, internal directories |

- Each card: tool name, one-line description, link
- Cards are not dynamic — links are hardcoded in the prototype
- Category list is extensible for future teams

---

### 4. "New Here?" Onboarding Strip
- A collapsible or static section for new joiners
- Ordered checklist of first-week tasks with links
- Examples: Set up Cirrus, complete mandatory MyQ&R modules, submit first timesheet
- Aimed at reducing onboarding dependency on teammates

---

### 5. Announcements / Notice Board (optional / v2)
- Static area for team notices, deadline reminders (e.g. "Timesheets due Friday")
- Manually updated — no CMS in v1
- Can be a simple pinned card or banner

---

### 6. Footer
- Last updated date (manual)
- Link to submit a suggestion / flag a broken link (mailto or form link)
- "This is not an official Deloitte product" disclaimer

---

## Out of Scope (v1)
- User authentication or personalisation
- Live data (e.g. actual leave balance, timesheet status)
- CMS or admin interface
- Mobile-first layout (desktop priority for prototype)

---

## Success Criteria
| # | Criterion |
|---|---|
| 1 | A new V&I joiner can find and open any core tool within 10 seconds |
| 2 | All links open correctly in a new tab |
| 3 | Every tool has a plain-English label and one-line description |
| 4 | The directory covers all tools currently shared via Slack/word-of-mouth |
| 5 | A non-V&I designer could use it with zero context |
| 6 | The prototype can be demoed in a browser without a server or login |
