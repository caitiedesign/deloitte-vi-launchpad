// ══════════════════════════════════════════════════════
// ALERT DATA — replace this fetch() with your real API
// Expected shape: array of alert objects (see below)
// ══════════════════════════════════════════════════════

const MOCK_ALERTS = [
  {
    id: "timesheets-overdue",
    urgency: "overdue",           // "overdue" | "soon" | "upcoming"
    badge: "Overdue",
    icon: "⏱️",
    title: "Timesheet not submitted",
    desc: "Your timesheet for the week ending 30 May hasn't been submitted. This is now overdue.",
    meta: "Was due: Friday 30 May",
    cta: "Submit timesheet",
    href: "#"                     // replace with real URL
  },
  {
    id: "myqr-due",
    urgency: "soon",
    badge: "Due in 5 days",
    icon: "📋",
    title: "3 compliance modules due",
    desc: "You have 3 outstanding MyQ&R learning modules. Deadline is 7 June — completion is mandatory.",
    meta: "Estimated time: ~45 mins total",
    cta: "Start training",
    href: "#"
  },
  {
    id: "leave-application",
    urgency: "soon",
    badge: "Action needed",
    icon: "🌴",
    title: "Leave not formally applied for",
    desc: "You logged annual leave on your timesheet (10–14 Jun) but haven't submitted a leave application in Cirrus.",
    meta: "Timesheet entry: 10 Jun – 14 Jun",
    cta: "Apply for leave",
    href: "#"
  }
];

// ── Alerts renderer ─────────────────────────────────────
function renderAlerts(alerts) {
  const section = document.getElementById('alerts-section');
  if (!section) return;

  // filter out dismissed ones (stored in sessionStorage)
  const dismissed = JSON.parse(sessionStorage.getItem('dismissed-alerts') || '[]');
  const visible = alerts.filter(a => !dismissed.includes(a.id));

  if (!visible.length) { section.innerHTML = ''; return; }

  const header = `
    <div class="alerts-header">
      <div class="alerts-header-left">
        <span class="alerts-heading">Needs your attention</span>
        <span class="alerts-count">${visible.length}</span>
      </div>
      <button class="alerts-dismiss-all" id="dismiss-all">Dismiss all</button>
    </div>`;

  const tiles = visible.map(a => `
    <div class="alert-tile alert-tile--${a.urgency}" data-alert-id="${a.id}">
      <div class="alert-tile-top">
        <span class="alert-badge">${a.badge}</span>
        <button class="alert-dismiss" aria-label="Dismiss" data-dismiss="${a.id}">&times;</button>
      </div>
      <div class="alert-tile-body">
        <span class="alert-icon">${a.icon}</span>
        <div class="alert-title">${a.title}</div>
        <div class="alert-desc">${a.desc}</div>
        ${a.meta ? `<div class="alert-meta">${a.meta}</div>` : ''}
      </div>
      <a class="alert-cta" href="${a.href}" target="_blank" rel="noopener">
        ${a.cta} →
      </a>
    </div>`).join('');

  section.innerHTML = header + `<div class="alerts-grid">${tiles}</div>`;

  // dismiss single
  section.querySelectorAll('[data-dismiss]').forEach(btn => {
    btn.addEventListener('click', () => dismissAlert(btn.dataset.dismiss, alerts));
  });

  // dismiss all
  section.querySelector('#dismiss-all')?.addEventListener('click', () => {
    const ids = visible.map(a => a.id);
    const stored = JSON.parse(sessionStorage.getItem('dismissed-alerts') || '[]');
    sessionStorage.setItem('dismissed-alerts', JSON.stringify([...stored, ...ids]));
    section.innerHTML = '';
  });
}

function dismissAlert(id, alerts) {
  const stored = JSON.parse(sessionStorage.getItem('dismissed-alerts') || '[]');
  sessionStorage.setItem('dismissed-alerts', JSON.stringify([...stored, id]));
  // animate out
  const tile = document.querySelector(`[data-alert-id="${id}"]`);
  if (tile) {
    tile.style.transition = 'opacity .2s ease, transform .2s ease';
    tile.style.opacity = '0';
    tile.style.transform = 'scale(.97)';
    setTimeout(() => renderAlerts(alerts), 220);
  }
}

// ── Boot: load alerts ────────────────────────────────────
// Swap the line below for: fetch('/api/alerts').then(r => r.json()).then(renderAlerts)
renderAlerts(MOCK_ALERTS);

// ── Date pill ──────────────────────────────────────────
const datePill = document.getElementById('js-date');
if (datePill) {
  const now = new Date();
  datePill.textContent = now.toLocaleDateString('en-AU', {
    weekday: 'short', day: 'numeric', month: 'short'
  });
}

// ── Greeting ───────────────────────────────────────────
const heading = document.querySelector('.page-heading h1');
if (heading) {
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  heading.textContent = `${greet} — what do you need?`;
}

// ── Sidebar category filter ────────────────────────────
const navItems    = document.querySelectorAll('.nav-item[data-filter]');
const categories  = document.querySelectorAll('.category[data-category]');
const quickSection = document.getElementById('quick-actions');

navItems.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // update active state
    navItems.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // clear search
    const searchInput = document.getElementById('search');
    searchInput.value = '';
    document.getElementById('no-results').style.display = 'none';

    if (filter === 'all') {
      // show everything
      categories.forEach(c => c.removeAttribute('hidden'));
      document.querySelectorAll('.tool-card').forEach(c => c.removeAttribute('hidden'));
      quickSection.style.display = '';
    } else {
      // hide quick actions when drilling into a category
      quickSection.style.display = 'none';
      categories.forEach(cat => {
        if (cat.dataset.category === filter) {
          cat.removeAttribute('hidden');
          cat.querySelectorAll('.tool-card').forEach(c => c.removeAttribute('hidden'));
        } else {
          cat.setAttribute('hidden', '');
        }
      });
    }
  });
});

// ── Search ─────────────────────────────────────────────
const searchInput = document.getElementById('search');
const noResults   = document.getElementById('no-results');
const noResultsTerm = document.getElementById('no-results-term');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();

  if (!q) {
    // restore to current sidebar filter state
    const activeFilter = document.querySelector('.nav-item.active')?.dataset.filter || 'all';
    document.querySelectorAll('.nav-item[data-filter]')
      .forEach(b => b.dataset.filter === activeFilter && (b.click()));
    noResults.style.display = 'none';
    return;
  }

  // reset sidebar active to "all" visually but don't re-trigger click
  navItems.forEach(b => b.classList.remove('active'));

  // show all categories and filter within them
  quickSection.style.display = 'none';
  let anyVisible = false;

  categories.forEach(cat => {
    cat.removeAttribute('hidden');
    const cards = cat.querySelectorAll('.tool-card');
    let catVisible = false;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const match = text.includes(q);
      match ? card.removeAttribute('hidden') : card.setAttribute('hidden', '');
      if (match) catVisible = true;
    });

    catVisible ? cat.removeAttribute('hidden') : cat.setAttribute('hidden', '');
    if (catVisible) anyVisible = true;
  });

  if (noResultsTerm) noResultsTerm.textContent = q;
  noResults.style.display = anyVisible ? 'none' : 'block';
});

searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    searchInput.dispatchEvent(new Event('input'));
  }
});

// ── Onboarding modal ───────────────────────────────────
const trigger  = document.getElementById('onboarding-trigger');
const backdrop = document.getElementById('modal-backdrop');
const closeBtn = document.getElementById('modal-close');

function openModal()  { backdrop.classList.add('open'); }
function closeModal() { backdrop.classList.remove('open'); }

trigger?.addEventListener('click', openModal);
closeBtn?.addEventListener('click', closeModal);

backdrop?.addEventListener('click', e => {
  if (e.target === backdrop) closeModal();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
