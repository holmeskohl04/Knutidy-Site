const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");

function setHeaderState() {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  nav.classList.remove("is-open");
  header.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
}

menuButton.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});

document.addEventListener("click", (event) => {
  if (nav.classList.contains("is-open") && !header.contains(event.target)) {
    closeMenu();
  }
});

const navLinks = [...nav.querySelectorAll('a[href^="#"]:not(.nav-cta)')];
const navSections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);

if (navSections.length && "IntersectionObserver" in window) {
  const visible = new Set();
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          visible.add(entry.target);
        } else {
          visible.delete(entry.target);
        }
      });
      const current = navSections.find((section) => visible.has(section));
      navLinks.forEach((link) => {
        if (current && link.getAttribute("href") === `#${current.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  navSections.forEach((section) => sectionObserver.observe(section));
}

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function initHeroVisual(visual) {
  const names = { nav: "Nav", headline: "Headline", card: "BookingCard" };
  const order = Object.keys(names);
  const site = visual.querySelector(".hv-site");
  const selection = visual.querySelector("[data-hv-selection]");
  const label = visual.querySelector("[data-hv-label]");
  const size = visual.querySelector("[data-hv-size]");
  const codeBlocks = visual.querySelectorAll("[data-hv-code]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let active = "card";
  let timer = 0;
  let hovering = false;
  let inView = true;

  function place() {
    const target = visual.querySelector(`[data-hv-target="${active}"]`);
    const box = visual.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    selection.style.setProperty("--x", `${rect.left - box.left}px`);
    selection.style.setProperty("--y", `${rect.top - box.top}px`);
    selection.style.setProperty("--w", `${rect.width}px`);
    selection.style.setProperty("--h", `${rect.height}px`);

    // Report dimensions as they would be on a 1280px-wide page, so the label stays stable across screen sizes.
    const ratio = 1280 / site.clientWidth;
    size.textContent = `${Math.round(rect.width * ratio)} × ${Math.round(rect.height * ratio)}`;
  }

  function select(key) {
    active = key;
    label.textContent = names[key];
    codeBlocks.forEach((block) => {
      block.classList.toggle("is-active", block.dataset.hvCode === key);
    });
    place();
  }

  function advance() {
    if (hovering || !inView || document.hidden) {
      return;
    }
    select(order[(order.indexOf(active) + 1) % order.length]);
  }

  function setAutoplay() {
    window.clearInterval(timer);
    if (!reducedMotion.matches) {
      timer = window.setInterval(advance, 3400);
    }
  }

  visual.addEventListener("pointerover", (event) => {
    const item = event.target.closest("[data-hv-target], [data-hv-code]");
    if (item) {
      select(item.dataset.hvTarget || item.dataset.hvCode);
    }
  });
  visual.addEventListener("pointerenter", () => {
    hovering = true;
  });
  visual.addEventListener("pointerleave", () => {
    hovering = false;
  });
  visual.addEventListener("animationend", place);

  new ResizeObserver(place).observe(visual);
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
  }).observe(visual);
  reducedMotion.addEventListener("change", setAutoplay);
  document.fonts?.ready.then(place);

  select(active);
  setAutoplay();
}

const heroVisual = document.querySelector("[data-hero-visual]");
if (heroVisual) {
  initHeroVisual(heroVisual);
}

function initShowcase(showcase) {
  const concepts = {
    trades: { name: "Ironridge Builders", url: "ironridge.example" },
    restaurant: { name: "Laurel & Ember", url: "laurelandember.example" },
    professional: { name: "Northmark Advisory", url: "northmark.example" }
  };

  // Logical CSS-pixel viewport for each device; the concept sites reflow against these widths.
  const devices = {
    desktop: { width: 1280, height: 800 },
    tablet: { width: 820, height: 1060 },
    mobile: { width: 390, height: 760 }
  };

  const tabs = [...showcase.querySelectorAll('[data-concept-tabs] [role="tab"]')];
  const panel = showcase.querySelector("#showcase-panel");
  const sites = showcase.querySelectorAll("[data-concept-site]");
  const infos = showcase.querySelectorAll("[data-concept-info]");
  const deviceButtons = showcase.querySelectorAll("[data-device-toggle] [data-device]");
  const stage = showcase.querySelector("[data-stage]");
  const frame = showcase.querySelector("[data-device-frame]");
  const screen = showcase.querySelector("[data-device-screen]");
  const viewport = showcase.querySelector("[data-site-viewport]");
  const urlLabel = showcase.querySelector("[data-device-url]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function fitPreview() {
    const { width, height } = devices[frame.dataset.device];
    frame.style.setProperty("--lw", width);
    frame.style.setProperty("--lh", height);

    const stageStyles = getComputedStyle(stage);
    const availableWidth = stage.clientWidth - parseFloat(stageStyles.paddingLeft) - parseFloat(stageStyles.paddingRight);
    const availableHeight = stage.clientHeight - parseFloat(stageStyles.paddingTop) - parseFloat(stageStyles.paddingBottom);
    const chromeWidth = frame.offsetWidth - screen.offsetWidth;
    const chromeHeight = frame.offsetHeight - screen.offsetHeight;

    const scale = Math.min(1, (availableWidth - chromeWidth) / width, (availableHeight - chromeHeight) / height);
    frame.style.setProperty("--scale", Math.max(scale, 0.1).toFixed(4));
  }

  function selectConcept(key) {
    tabs.forEach((tab) => {
      const isSelected = tab.dataset.concept === key;
      tab.setAttribute("aria-selected", String(isSelected));
      tab.tabIndex = isSelected ? 0 : -1;
      if (isSelected) {
        panel.setAttribute("aria-labelledby", tab.id);
      }
    });

    sites.forEach((site) => {
      site.hidden = site.dataset.conceptSite !== key;
    });
    infos.forEach((info) => {
      info.hidden = info.dataset.conceptInfo !== key;
    });

    urlLabel.textContent = concepts[key].url;
    viewport.setAttribute("aria-label", `Scrollable preview of the ${concepts[key].name} concept`);
    viewport.scrollTop = 0;
  }

  function selectDevice(name) {
    if (frame.dataset.device === name) {
      return;
    }

    const apply = () => {
      frame.dataset.device = name;
      deviceButtons.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.device === name));
      });
      fitPreview();
    };

    if (document.startViewTransition && !reducedMotion.matches) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => selectConcept(tab.dataset.concept));
  });

  showcase.querySelector("[data-concept-tabs]").addEventListener("keydown", (event) => {
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) {
      return;
    }

    const lastIndex = tabs.length - 1;
    const nextIndex = {
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      ArrowDown: currentIndex === lastIndex ? 0 : currentIndex + 1,
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      ArrowUp: currentIndex === 0 ? lastIndex : currentIndex - 1,
      Home: 0,
      End: lastIndex
    }[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    selectConcept(tabs[nextIndex].dataset.concept);
  });

  deviceButtons.forEach((button) => {
    button.addEventListener("click", () => selectDevice(button.dataset.device));
  });

  let fitFrame = 0;
  new ResizeObserver(() => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(fitPreview);
  }).observe(stage);

  if (window.matchMedia("(max-width: 720px)").matches) {
    frame.dataset.device = "mobile";
    deviceButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.device === "mobile"));
    });
  }

  fitPreview();
}

const showcase = document.querySelector("[data-showcase]");
if (showcase) {
  initShowcase(showcase);
}

function initLabTabs(tablist) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];

  function select(tab) {
    tabs.forEach((item) => {
      const isSelected = item === tab;
      item.setAttribute("aria-selected", String(isSelected));
      item.tabIndex = isSelected ? 0 : -1;
      document.getElementById(item.getAttribute("aria-controls")).hidden = !isSelected;
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => select(tab));
  });

  document.querySelectorAll("[data-lab-open]").forEach((link) => {
    link.addEventListener("click", () => {
      const tab = document.getElementById(`lab-tab-${link.dataset.labOpen}`);
      if (tab) {
        select(tab);
      }
    });
  });

  tablist.addEventListener("keydown", (event) => {
    const currentIndex = tabs.indexOf(document.activeElement);
    if (currentIndex === -1) {
      return;
    }

    const lastIndex = tabs.length - 1;
    const nextIndex = {
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      ArrowDown: currentIndex === lastIndex ? 0 : currentIndex + 1,
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      ArrowUp: currentIndex === 0 ? lastIndex : currentIndex - 1,
      Home: 0,
      End: lastIndex
    }[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    tabs[nextIndex].focus();
    select(tabs[nextIndex]);
  });
}

const labTabs = document.querySelector("[data-lab-tabs]");
if (labTabs) {
  initLabTabs(labTabs);
}

// Fictional operations app for the invented Ironridge Builders. All data is local and resets on reload.
function initOps(app) {
  const today = "2026-11-02";
  const statuses = {
    scheduled: "Scheduled",
    progress: "In progress",
    completed: "Completed"
  };
  const crews = {
    A: { name: "Crew A", lead: "Marco Ortega" },
    B: { name: "Crew B", lead: "Priya Shah" },
    C: { name: "Crew C", lead: "Owen Becker" }
  };

  // `phase` is the index of the current phase while a job is in progress.
  const jobs = [
    {
      id: "IR-1049",
      title: "Clinic tenant improvement",
      client: "Fairway Physiotherapy",
      address: "Unit 4, 2200 Example Avenue",
      type: "Commercial",
      status: "progress",
      crew: "C",
      value: 126400,
      start: "2026-09-28",
      due: "2026-11-06",
      phases: ["Demolition", "Framing", "Mechanical & electrical", "Finishes", "Final inspection"],
      phase: 4,
      alert: { tone: "info", text: "Final inspection booked for Wednesday, Nov 4." },
      activity: [
        ["2026-10-30", "Millwork installed in treatment rooms"],
        ["2026-10-21", "Electrical rough-in passed inspection"],
        ["2026-09-28", "Job started"]
      ]
    },
    {
      id: "IR-1048",
      title: "Kitchen renovation",
      client: "Patel residence",
      address: "418 Cedar Lane",
      type: "Residential",
      status: "progress",
      crew: "A",
      value: 48600,
      start: "2026-10-19",
      due: "2026-11-13",
      phases: ["Demolition", "Rough-in", "Drywall", "Cabinets & counters", "Final walkthrough"],
      phase: 3,
      alert: { tone: "warning", text: "Cabinet delivery moved to Nov 4. Crew A schedule adjusted to match." },
      activity: [
        ["2026-10-30", "Countertop template approved by client"],
        ["2026-10-27", "Drywall finished and taped"],
        ["2026-10-19", "Job started"]
      ]
    },
    {
      id: "IR-1051",
      title: "Basement development",
      client: "Morrison residence",
      address: "77 Birchwood Crescent",
      type: "Residential",
      status: "progress",
      crew: "B",
      value: 71200,
      start: "2026-10-26",
      due: "2026-12-04",
      phases: ["Framing", "Electrical & plumbing", "Insulation & drywall", "Flooring & trim", "Final walkthrough"],
      phase: 1,
      alert: null,
      activity: [
        ["2026-10-29", "Framing inspection passed"],
        ["2026-10-26", "Job started"]
      ]
    },
    {
      id: "IR-1057",
      title: "Bathroom remodel",
      client: "Okafor residence",
      address: "260 Elm Street",
      type: "Residential",
      status: "scheduled",
      crew: "B",
      value: 27300,
      start: "2026-11-05",
      due: "2026-11-20",
      phases: ["Demolition", "Plumbing", "Tile & waterproofing", "Fixtures", "Final walkthrough"],
      phase: 0,
      alert: null,
      activity: [
        ["2026-10-28", "Tile selection confirmed"],
        ["2026-10-20", "Quote accepted"]
      ]
    },
    {
      id: "IR-1053",
      title: "Café fit-out",
      client: "Alder & Finch Café",
      address: "15 Example Street",
      type: "Commercial",
      status: "scheduled",
      crew: "C",
      value: 92400,
      start: "2026-11-09",
      due: "2026-12-11",
      phases: ["Site prep", "Framing", "Mechanical & electrical", "Millwork & finishes", "Handover"],
      phase: 0,
      alert: { tone: "warning", text: "Building permit still pending. The start date depends on approval." },
      activity: [
        ["2026-10-29", "Building permit application submitted"],
        ["2026-10-22", "Contract signed"]
      ]
    },
    {
      id: "IR-1055",
      title: "Deck and railing",
      client: "Nguyen residence",
      address: "9 Lakeview Road",
      type: "Residential",
      status: "scheduled",
      crew: "A",
      value: 18900,
      start: "2026-11-16",
      due: "2026-11-27",
      phases: ["Footings", "Framing", "Decking", "Railings", "Final walkthrough"],
      phase: 0,
      alert: null,
      activity: [
        ["2026-10-26", "Materials ordered"],
        ["2026-10-23", "Quote accepted"]
      ]
    },
    {
      id: "IR-1046",
      title: "Concrete driveway",
      client: "Lindqvist residence",
      address: "33 Ridge Road",
      type: "Residential",
      status: "completed",
      crew: "C",
      value: 14200,
      start: "2026-10-22",
      due: "2026-10-28",
      completed: "2026-10-28",
      phases: ["Excavation", "Forming", "Pour", "Cure & seal"],
      phase: 0,
      alert: null,
      activity: [
        ["2026-10-28", "Final walkthrough signed off"],
        ["2026-10-24", "Concrete poured"],
        ["2026-10-22", "Job started"]
      ]
    },
    {
      id: "IR-1044",
      title: "Roof replacement",
      client: "Westline Storage",
      address: "1200 Example Road",
      type: "Commercial",
      status: "completed",
      crew: "B",
      value: 36750,
      start: "2026-10-13",
      due: "2026-10-24",
      completed: "2026-10-23",
      phases: ["Tear-off", "Deck repair", "Membrane", "Flashing & cleanup"],
      phase: 0,
      alert: null,
      activity: [
        ["2026-10-23", "Final walkthrough signed off"],
        ["2026-10-16", "Membrane installed"],
        ["2026-10-13", "Job started"]
      ]
    }
  ];

  const money = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 });
  const dayFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });
  const toDate = (iso) => new Date(`${iso}T00:00:00Z`);
  const shortDate = (iso) => dayFormat.format(toDate(iso));
  const escape = escapeHtml;

  const navItems = app.querySelectorAll("[data-ops-nav]");
  const title = app.querySelector("[data-ops-title]");
  const views = app.querySelectorAll("[data-ops-view]");
  const overview = app.querySelector('[data-ops-view="overview"]');
  const jobsView = app.querySelector('[data-ops-view="jobs"]');
  const filters = app.querySelector("[data-ops-filters]");
  const search = app.querySelector("[data-ops-search]");
  const list = app.querySelector("[data-ops-list]");
  const empty = app.querySelector("[data-ops-empty]");
  const detail = app.querySelector("[data-ops-detail]");
  const openCount = app.querySelector("[data-ops-open-count]");
  const live = app.querySelector("[data-ops-live]");

  let filter = "all";
  let query = "";
  let selectedId = jobs[0].id;

  const byId = (id) => jobs.find((job) => job.id === id);
  const withStatus = (status) => jobs.filter((job) => job.status === status);
  const openJobs = () => jobs.filter((job) => job.status !== "completed");
  const total = (items) => items.reduce((sum, job) => sum + job.value, 0);
  const pill = (status) => `<span class="ops-status" data-status="${status}">${statuses[status]}</span>`;
  // Matches the container query that switches the jobs view to one pane at a time.
  const isCompact = () => app.parentElement.clientWidth < 640;

  function phasesDone(job) {
    if (job.status === "completed") {
      return job.phases.length;
    }
    return job.status === "progress" ? job.phase : 0;
  }

  function timing(job) {
    if (job.status === "completed") {
      return `Done ${shortDate(job.completed)}`;
    }
    return job.status === "scheduled" ? `Starts ${shortDate(job.start)}` : `Due ${shortDate(job.due)}`;
  }

  function visibleJobs() {
    const terms = query.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesFilter = filter === "all" || job.status === filter;
      const haystack = `${job.id} ${job.title} ${job.client} ${job.address}`.toLowerCase();
      return matchesFilter && (!terms || haystack.includes(terms));
    });
  }

  function kpi(label, value, meta) {
    return `<div class="ops-kpi"><p class="ops-kpi-label">${label}</p><p class="ops-kpi-value">${value}</p><p class="ops-kpi-meta">${meta}</p></div>`;
  }

  function renderOverview() {
    const inProgress = withStatus("progress");
    const scheduled = withStatus("scheduled").sort((a, b) => a.start.localeCompare(b.start));
    const completed = withStatus("completed");
    const open = openJobs();
    const attention = open.filter((job) => job.alert);
    const allValue = total(jobs);

    const starts = scheduled.length
      ? `<ul class="ops-rows">${scheduled
          .map(
            (job) => `<li><button class="ops-row" type="button" data-ops-open="${job.id}" data-focus-key="start-${job.id}">
              <span class="ops-day" aria-hidden="true"><span>${monthFormat.format(toDate(job.start))}</span><b>${toDate(job.start).getUTCDate()}</b></span>
              <span class="ops-row-main"><span class="ops-row-title">${escape(job.title)}</span><span class="ops-row-sub"><span class="visually-hidden">Starts ${shortDate(job.start)}, </span><span>${escape(job.client)}</span> · <span>${crews[job.crew].name}</span></span></span>
              <span class="ops-row-end">${money.format(job.value)}</span>
            </button></li>`
          )
          .join("")}</ul>`
      : `<p class="ops-card-empty">No upcoming starts.</p>`;

    const alerts = attention.length
      ? `<ul class="ops-rows">${attention
          .map(
            (job) => `<li><button class="ops-row" type="button" data-ops-open="${job.id}" data-focus-key="alert-${job.id}">
              <span class="ops-flag" data-tone="${job.alert.tone}" aria-hidden="true"></span>
              <span class="ops-row-main"><span class="ops-row-title">${escape(job.alert.text)}</span><span class="ops-row-sub">${escape(job.title)} · ${job.id}</span></span>
            </button></li>`
          )
          .join("")}</ul>`
      : `<p class="ops-card-empty">Nothing needs attention right now.</p>`;

    const valueRows = Object.keys(statuses)
      .map((status) => {
        const value = total(withStatus(status));
        return { status, value, share: allValue ? (value / allValue) * 100 : 0 };
      });

    const crewRows = Object.entries(crews)
      .map(([key, crew]) => {
        const assigned = open.filter((job) => job.crew === key);
        const onSite = assigned.filter((job) => job.status === "progress").length;
        const upcoming = assigned.length - onSite;
        return `<li class="ops-crew">
          <span class="ops-crew-name"><b>${crew.name}</b>${crew.lead}</span>
          <span class="ops-crew-meter" aria-hidden="true">${assigned.map((job) => `<i data-status="${job.status}"></i>`).join("")}</span>
          <span class="ops-crew-load">${onSite} on site · ${upcoming} scheduled</span>
        </li>`;
      })
      .join("");

    overview.innerHTML = `
      <div class="ops-kpis">
        ${kpi("In progress", inProgress.length, "active job sites")}
        ${kpi("Scheduled", scheduled.length, scheduled.length ? `next start ${shortDate(scheduled[0].start)}` : "nothing booked")}
        ${kpi("Completed", completed.length, "in the last 30 days")}
        ${kpi("Open contract value", money.format(total(open)), `across ${open.length} open jobs`)}
      </div>
      <div class="ops-grid">
        <section class="ops-card" aria-labelledby="ops-starts-title">
          <div class="ops-card-head">
            <h4 id="ops-starts-title">Upcoming starts</h4>
            <button class="ops-link" type="button" data-ops-show="scheduled" data-focus-key="show-scheduled">View scheduled</button>
          </div>
          ${starts}
        </section>
        <section class="ops-card" aria-labelledby="ops-attention-title">
          <div class="ops-card-head">
            <h4 id="ops-attention-title">Needs attention</h4>
            <span class="ops-card-count">${attention.length}</span>
          </div>
          ${alerts}
        </section>
        <section class="ops-card" aria-labelledby="ops-value-title">
          <div class="ops-card-head"><h4 id="ops-value-title">Contract value by status</h4></div>
          <div class="ops-stack" aria-hidden="true">${valueRows
            .filter((row) => row.value)
            .map((row) => `<i data-status="${row.status}" style="flex-grow: ${row.value}"></i>`)
            .join("")}</div>
          <dl class="ops-legend">${valueRows
            .map(
              (row) => `<div><dt><span class="ops-dot" data-status="${row.status}" aria-hidden="true"></span>${statuses[row.status]}</dt><dd>${money.format(row.value)}<span>${Math.round(row.share)}%</span></dd></div>`
            )
            .join("")}</dl>
        </section>
        <section class="ops-card" aria-labelledby="ops-crews-title">
          <div class="ops-card-head"><h4 id="ops-crews-title">Crew workload</h4></div>
          <ul class="ops-crews">${crewRows}</ul>
        </section>
      </div>`;
  }

  function renderFilters() {
    const options = [["all", "All", jobs.length], ...Object.entries(statuses).map(([key, label]) => [key, label, withStatus(key).length])];
    filters.innerHTML = options
      .map(
        ([key, label, count]) =>
          `<button class="ops-segment-item" type="button" aria-pressed="${filter === key}" data-ops-filter="${key}" data-focus-key="filter-${key}">${label}<span class="ops-segment-count">${count}</span></button>`
      )
      .join("");
  }

  function renderList() {
    const visible = visibleJobs();
    const focusId = visible.some((job) => job.id === selectedId) ? selectedId : visible[0]?.id;

    list.innerHTML = visible
      .map(
        (job) => `<li class="ops-job" role="option" id="ops-job-${job.id}" aria-selected="${job.id === selectedId}" tabindex="${job.id === focusId ? 0 : -1}" data-job="${job.id}" data-focus-key="job-${job.id}">
          <span class="ops-job-main"><span class="ops-job-title">${escape(job.title)}</span><span class="ops-job-sub">${escape(job.client)} · ${escape(job.address)}</span></span>
          <span class="ops-job-side">${pill(job.status)}<span class="ops-job-meta">${job.id} · ${timing(job)}</span></span>
        </li>`
      )
      .join("");

    list.hidden = !visible.length;
    empty.hidden = Boolean(visible.length);
  }

  function renderDetail() {
    const job = byId(selectedId);
    const crew = crews[job.crew];
    const done = phasesDone(job);
    const count = job.phases.length;
    const summary = {
      scheduled: `Not started · ${count} phases`,
      progress: `Phase ${done + 1} of ${count} · ${job.phases[done]}`,
      completed: `All ${count} phases complete`
    }[job.status];
    const phaseState = (index) => {
      if (index < done) {
        return "done";
      }
      return job.status === "progress" && index === done ? "current" : "todo";
    };
    const stateLabels = { done: "Done", current: "Current", todo: "Not started" };

    detail.innerHTML = `
      <button class="ops-back" type="button" data-ops-back data-focus-key="back">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>All jobs
      </button>
      <div class="ops-detail-head">
        <p class="ops-detail-id">${job.id} · ${job.type}</p>
        <h4 id="ops-detail-title" tabindex="-1">${escape(job.title)}</h4>
        <p class="ops-detail-sub">${escape(job.client)} · ${escape(job.address)}</p>
      </div>
      <fieldset class="ops-status-field">
        <legend>Status</legend>
        <div class="ops-status-options">${Object.entries(statuses)
          .map(
            ([key, label]) =>
              `<label class="ops-status-option" data-status="${key}"><input type="radio" name="ops-status" value="${key}"${job.status === key ? " checked" : ""} data-focus-key="status-${key}"><span>${label}</span></label>`
          )
          .join("")}</div>
      </fieldset>
      ${
        job.alert && job.status !== "completed"
          ? `<p class="ops-alert" data-tone="${job.alert.tone}"><b>${job.alert.tone === "warning" ? "Heads up" : "Note"}</b>${escape(job.alert.text)}</p>`
          : ""
      }
      <dl class="ops-facts">
        <div><dt>Contract value</dt><dd>${money.format(job.value)}</dd></div>
        <div><dt>Crew</dt><dd>${crew.name} · ${crew.lead}</dd></div>
        <div><dt>Start</dt><dd>${shortDate(job.start)}</dd></div>
        <div><dt>${job.status === "completed" ? "Completed" : "Target finish"}</dt><dd>${shortDate(job.status === "completed" ? job.completed : job.due)}</dd></div>
      </dl>
      <section class="ops-block" aria-labelledby="ops-phases-title">
        <div class="ops-block-head"><h5 id="ops-phases-title">Progress</h5><p>${escape(summary)}</p></div>
        <div class="ops-phasebar" aria-hidden="true">${job.phases.map((_, index) => `<i data-state="${phaseState(index)}"></i>`).join("")}</div>
        <ol class="ops-phases">${job.phases
          .map((name, index) => {
            const state = phaseState(index);
            return `<li data-state="${state}"><span class="visually-hidden">${stateLabels[state]}: </span>${escape(name)}</li>`;
          })
          .join("")}</ol>
      </section>
      <section class="ops-block" aria-labelledby="ops-activity-title">
        <h5 id="ops-activity-title">Activity</h5>
        <ol class="ops-activity">${job.activity
          .map(
            ([date, text]) => `<li><time datetime="${date}">${date === today ? "Today" : shortDate(date)}</time><span>${escape(text)}</span></li>`
          )
          .join("")}</ol>
      </section>`;
  }

  function render() {
    const focusKey = app.contains(document.activeElement) ? document.activeElement.dataset.focusKey : undefined;

    renderOverview();
    renderFilters();
    renderList();
    renderDetail();
    openCount.textContent = openJobs().length;

    if (focusKey) {
      app.querySelector(`[data-focus-key="${focusKey}"]`)?.focus();
    }
  }

  function showView(name) {
    views.forEach((view) => {
      view.hidden = view.dataset.opsView !== name;
    });
    navItems.forEach((item) => {
      if (item.dataset.opsNav === name) {
        item.setAttribute("aria-current", "page");
      } else {
        item.removeAttribute("aria-current");
      }
    });
    title.textContent = name === "overview" ? "Overview" : "Jobs";
    jobsView.dataset.mode = "list";
  }

  function resetFilters() {
    filter = "all";
    query = "";
    search.value = "";
  }

  function chooseJob(id) {
    selectedId = id;
    render();
    if (isCompact()) {
      jobsView.dataset.mode = "detail";
      detail.querySelector("#ops-detail-title").focus();
    } else {
      list.querySelector(`[data-job="${id}"]`)?.focus();
    }
  }

  function setStatus(job, status) {
    if (job.status === status) {
      return;
    }

    job.status = status;
    if (status === "completed") {
      job.completed = today;
    }

    // Repeated changes during one visit update a single log entry rather than stacking.
    const entry = [today, `Status changed to ${statuses[status]}`, true];
    if (job.activity[0][2]) {
      job.activity[0] = entry;
    } else {
      job.activity.unshift(entry);
    }

    render();
    live.textContent = `${job.title} is now ${statuses[status]}.`;
  }

  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      showView(item.dataset.opsNav);
      render();
    });
  });

  overview.addEventListener("click", (event) => {
    const row = event.target.closest("[data-ops-open]");
    const show = event.target.closest("[data-ops-show]");

    if (row) {
      resetFilters();
      selectedId = row.dataset.opsOpen;
      showView("jobs");
      render();
      if (isCompact()) {
        jobsView.dataset.mode = "detail";
      }
      detail.querySelector("#ops-detail-title").focus();
    } else if (show) {
      resetFilters();
      filter = show.dataset.opsShow;
      showView("jobs");
      render();
      title.focus();
    }
  });

  filters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-ops-filter]");
    if (button) {
      filter = button.dataset.opsFilter;
      render();
    }
  });

  search.addEventListener("input", () => {
    query = search.value;
    renderList();
  });

  list.addEventListener("click", (event) => {
    const option = event.target.closest("[data-job]");
    if (option) {
      chooseJob(option.dataset.job);
    }
  });

  list.addEventListener("keydown", (event) => {
    const options = [...list.querySelectorAll("[data-job]")];
    const currentIndex = options.indexOf(document.activeElement);
    if (currentIndex === -1) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      chooseJob(options[currentIndex].dataset.job);
      return;
    }

    const lastIndex = options.length - 1;
    const nextIndex = {
      ArrowDown: Math.min(currentIndex + 1, lastIndex),
      ArrowUp: Math.max(currentIndex - 1, 0),
      Home: 0,
      End: lastIndex
    }[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    if (isCompact()) {
      // On small screens the detail replaces the list, so arrows only move focus; Enter opens the job.
      options.forEach((option, index) => {
        option.tabIndex = index === nextIndex ? 0 : -1;
      });
      options[nextIndex].focus();
    } else {
      chooseJob(options[nextIndex].dataset.job);
    }
  });

  detail.addEventListener("change", (event) => {
    if (event.target.name === "ops-status") {
      setStatus(byId(selectedId), event.target.value);
    }
  });

  detail.addEventListener("click", (event) => {
    if (event.target.closest("[data-ops-back]")) {
      jobsView.dataset.mode = "list";
      (list.querySelector(`[data-job="${selectedId}"]`) || list.querySelector("[data-job]") || search).focus();
    }
  });

  render();
}

const opsApp = document.querySelector("[data-ops]");
if (opsApp) {
  initOps(opsApp);
}

// Simulated enquiry workflow for the invented Ironridge Builders. No AI service is called; every result is scripted.
function initFlow(flow) {
  const steps = [
    { name: "Receive", hint: "Log the message", title: "Enquiry received", working: "Receiving the enquiry", duration: 700 },
    { name: "Extract", hint: "Pull out key details", title: "Details extracted", working: "Reading the message and pulling out details", duration: 1300 },
    { name: "Organize", hint: "Build the job record", title: "Job record prepared", working: "Matching the request to services, crews, and the schedule", duration: 1100 },
    { name: "Draft", hint: "Prepare a reply", title: "Reply drafted", working: "Writing a reply from the details and the open schedule", duration: 1300 },
    { name: "Review", hint: "A person approves", title: "Ready for your review", working: "Collecting everything for review", duration: 600 }
  ];

  // Message fragments in [text, field] pairs are what the extract step highlights.
  const samples = [
    {
      id: "kitchen",
      label: "Kitchen renovation",
      channel: "Website quote form",
      received: "Mon, Nov 2 · 8:14 AM",
      from: "Hannah Brooks",
      email: "hannah.brooks@example.com",
      subject: "Kitchen and dining room renovation",
      message: [
        "Hi there, we're hoping to ",
        ["redo our kitchen", "type"],
        " and ",
        ["open up the wall into the dining room", "scope"],
        ". The house is at ",
        ["52 Example Crescent", "site"],
        ". The cabinets are original from the 90s. We'd like to ",
        ["start sometime in January", "timeline"],
        " and our ",
        ["budget is around $45–55k", "budget"],
        ". Is a ",
        ["weekday site visit", "request"],
        " possible?\n\nThanks,\nHannah"
      ],
      fields: [
        { label: "Name", value: "Hannah Brooks", status: "ok" },
        { label: "Contact", value: "hannah.brooks@example.com · (555) 014\u20112381 from the form", status: "ok" },
        { key: "type", label: "Project type", value: "Kitchen renovation", status: "ok" },
        { key: "scope", label: "Scope", value: "Remove the kitchen–dining wall; replace the original cabinets", status: "check" },
        { key: "site", label: "Site address", value: "52 Example Crescent", status: "ok" },
        { key: "timeline", label: "Timeline", value: "Start in January", status: "ok" },
        { key: "budget", label: "Budget", value: "$45,000 to $55,000", status: "ok" },
        { key: "request", label: "Asked for", value: "A weekday site visit", status: "ok" }
      ],
      record: {
        facts: [
          ["Client", "Hannah Brooks (new client)"],
          ["Service", "Residential · Kitchen renovation"],
          ["Site", "52 Example Crescent"],
          ["Budget", "$45,000 to $55,000"],
          ["Assigned to", "Marco Ortega, Crew\u00a0A"],
          ["Next step", "Book an on-site estimate"]
        ],
        priority: ["Standard", "standard"],
        slots: ["Wed, Nov 4 · 10:00 AM", "Thu, Nov 5 · 2:00 PM"],
        flags: ["The wall may be load-bearing. Confirm on site before quoting."],
        missing: []
      },
      draft: {
        subject: "Re: Kitchen and dining room renovation",
        body: "Hi Hannah,\n\nThanks for getting in touch about your kitchen and dining room at 52 Example Crescent. Opening up that wall and replacing the original cabinets is a project we'd be glad to look at.\n\nWe'd like to visit, take measurements, and check whether the wall is load-bearing, since that affects the scope and the quote. Would either of these weekday times work?\n\n• Wednesday, Nov 4 at 10:00 AM\n• Thursday, Nov 5 at 2:00 PM\n\nA January start sounds realistic, and we'll confirm once we've seen the space.\n\nBest regards,\nMarco Ortega\nIronridge Builders"
      }
    },
    {
      id: "fitout",
      label: "Retail fit-out",
      channel: "Email",
      received: "Mon, Nov 2 · 9:02 AM",
      from: "Daniel Okoye",
      email: "daniel@fernandfield.example",
      subject: "Fit-out for our new flower shop",
      message: [
        "Hello, we just signed a lease on ",
        ["Unit 3, 410 Example Avenue", "site"],
        " and need it ",
        ["fitted out as a flower shop", "type"],
        " before our ",
        ["opening on December 15", "timeline"],
        ". We need ",
        ["a sink and prep counter, new lighting, and a small walk-in cooler area", "scope"],
        ". ",
        ["Not sure about permits", "permits"],
        ". ",
        ["Can someone call me? 555-018-7720", "request"],
        "\n\nDaniel Okoye\n",
        ["Fern & Field Florist", "business"]
      ],
      fields: [
        { label: "Name", value: "Daniel Okoye", status: "ok" },
        { key: "business", label: "Business", value: "Fern & Field Florist", status: "ok" },
        { key: "request", label: "Contact", value: "(555) 018\u20117720, prefers a call", status: "ok" },
        { key: "type", label: "Project type", value: "Commercial retail fit-out", status: "ok" },
        { key: "scope", label: "Scope", value: "Sink and prep counter, new lighting, walk-in cooler area", status: "ok" },
        { key: "site", label: "Site address", value: "Unit 3, 410 Example Avenue", status: "ok" },
        { key: "timeline", label: "Deadline", value: "Open by December 15", status: "check" },
        { key: "permits", label: "Permits", value: "Unknown", status: "check" },
        { label: "Budget", value: "Not mentioned", status: "missing" }
      ],
      record: {
        facts: [
          ["Client", "Fern & Field Florist (new client)"],
          ["Service", "Commercial · Retail fit-out"],
          ["Site", "Unit 3, 410 Example Avenue"],
          ["Budget", "Not given"],
          ["Assigned to", "Owen Becker, Crew\u00a0C"],
          ["Next step", "Call Daniel today"]
        ],
        priority: ["High", "high"],
        slots: [],
        flags: [
          "The opening date leaves about six weeks, and Crew C is booked on the café fit-out until Dec 11.",
          "Plumbing and electrical work will likely need permits. Confirm before committing to dates."
        ],
        missing: ["Budget range", "Lease drawings or a floor plan"]
      },
      draft: {
        subject: "Re: Fit-out for our new flower shop",
        body: "Hi Daniel,\n\nCongratulations on the new lease, and thanks for the details on Unit 3 at 410 Example Avenue.\n\nA December 15 opening is a tight timeline for a sink, prep counter, lighting, and a cooler area, so we'd like to talk today about what's achievable and how permits fit in. I'll call you at 555-018-7720 this afternoon.\n\nTo help us prepare, could you send:\n\n• A rough budget range\n• The lease drawings or a floor plan, if you have them\n\nTalk soon,\nOwen Becker\nIronridge Builders"
      }
    },
    {
      id: "leak",
      label: "Storm leak",
      channel: "Website quote form",
      received: "Mon, Nov 2 · 6:47 AM",
      from: "Mike",
      email: "mike.r@example.com",
      subject: "Water coming in!!",
      message: [
        "Hi, ",
        ["water came through our basement ceiling", "scope"],
        " last night ",
        ["after the storm", "when"],
        ". Think it's ",
        ["from the roof or maybe the window above", "source"],
        ". Can you ",
        ["come look ASAP??", "urgency"],
        "\n\nMike"
      ],
      fields: [
        { label: "Name", value: "Mike (no last name given)", status: "check" },
        { label: "Contact", value: "mike.r@example.com from the form", status: "ok" },
        { key: "scope", label: "Problem", value: "Water through the basement ceiling", status: "ok" },
        { key: "when", label: "When", value: "Overnight, after the storm", status: "ok" },
        { key: "source", label: "Likely source", value: "Roof or the window above", status: "check" },
        { key: "urgency", label: "Urgency", value: "As soon as possible", status: "ok" },
        { label: "Site address", value: "Not given", status: "missing" },
        { label: "Phone", value: "Not given", status: "missing" }
      ],
      record: {
        facts: [
          ["Client", "Mike (new client)"],
          ["Service", "Residential · Water damage repair"],
          ["Site", "Unknown"],
          ["Budget", "Not discussed"],
          ["Assigned to", "Priya Shah, Crew\u00a0B"],
          ["Next step", "Reply within the hour"]
        ],
        priority: ["Urgent", "urgent"],
        slots: [],
        flags: ["Urgent, but there's no address or phone number yet. Reply by email first."],
        missing: ["Site address", "Phone number", "Photos of the ceiling and the window"]
      },
      draft: {
        subject: "Re: Water coming in",
        body: "Hi Mike,\n\nSorry to hear about the water coming through your basement ceiling. We can help find the source and stop it.\n\nSo we can get someone out quickly, please reply with:\n\n• Your address\n• A phone number we can reach you on\n• A few photos of the ceiling and the window above, if it's safe to take them\n\nAs soon as we have your address, we'll confirm the earliest time we can be there.\n\nPriya Shah\nIronridge Builders"
      }
    }
  ];

  const statusLabels = { ok: "Found", check: "Check", missing: "Missing" };
  const samplesEl = flow.querySelector("[data-flow-samples]");
  const runButton = flow.querySelector("[data-flow-run]");
  const nextButton = flow.querySelector("[data-flow-next]");
  const stepsEl = flow.querySelector("[data-flow-steps]");
  const output = flow.querySelector("[data-flow-output]");
  const live = flow.querySelector("[data-flow-live]");

  let sample = samples[0];
  let reached = 0;
  let processing = -1;
  let viewing = -1;
  let running = false;
  let timer = 0;
  let draftText = sample.draft.body;
  let decision = "";

  const count = (status) => sample.fields.filter((field) => field.status === status).length;
  const plainMessage = () => sample.message.map((part) => (Array.isArray(part) ? part[0] : part)).join("");
  const markedMessage = () =>
    sample.message
      .map((part) => (Array.isArray(part) ? `<mark data-field="${part[1]}">${escapeHtml(part[0])}</mark>` : escapeHtml(part)))
      .join("");

  function stepHead(index) {
    return `<div class="flow-output-head"><p class="flow-label">Step ${index + 1} of ${steps.length} · ${steps[index].name}</p><h3>${steps[index].title}</h3></div>`;
  }

  function mailMeta(rows) {
    return `<dl class="flow-mail-meta">${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
  }

  function renderIdle() {
    return `
      <div class="flow-output-head"><p class="flow-label">Inbox · 1 new enquiry</p><h3>Ready to run</h3></div>
      <div class="flow-mail">
        ${mailMeta([["From", sample.from], ["Subject", sample.subject], ["Received", sample.received]])}
        <p class="flow-mail-body">${escapeHtml(plainMessage())}</p>
      </div>
      <p class="flow-hint">Press <b>Run workflow</b> to process this enquiry, or <b>Next step</b> to go one step at a time. Nothing is sent, and you review the result at the end.</p>`;
  }

  function renderWorking(index) {
    return `
      ${stepHead(index)}
      <div class="flow-working" aria-hidden="true"><i></i><i></i><i></i></div>
      <p class="flow-hint">${steps[index].working}…</p>`;
  }

  const stages = [
    () => `
      ${stepHead(0)}
      <div class="flow-mail">
        ${mailMeta([["From", `${sample.from} <${sample.email}>`], ["Received", sample.received], ["Channel", sample.channel], ["Subject", sample.subject]])}
        <p class="flow-mail-body">${escapeHtml(plainMessage())}</p>
      </div>
      <p class="flow-hint">Logged as a new enquiry and checked against existing clients. No match found.</p>`,
    () => `
      ${stepHead(1)}
      <p class="flow-summary"><span>${sample.fields.length} details</span><span data-state="check">${count("check")} to check</span><span data-state="missing">${count("missing")} missing</span></p>
      <p class="flow-mail-body flow-marked">${markedMessage()}</p>
      <ul class="flow-fields">${sample.fields
        .map(
          (field) => `<li${field.key ? ` data-field="${field.key}"` : ""}>
            <span class="flow-field-label">${field.label}</span>
            <span class="flow-field-value">${escapeHtml(field.value)}</span>
            <span class="flow-pill" data-state="${field.status}">${statusLabels[field.status]}</span>
          </li>`
        )
        .join("")}</ul>`,
    () => `
      ${stepHead(2)}
      <dl class="ops-facts flow-facts">
        ${sample.record.facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
        <div><dt>Priority</dt><dd><span class="flow-priority" data-level="${sample.record.priority[1]}">${sample.record.priority[0]}</span></dd></div>
        <div><dt>Open estimate slots</dt><dd>${sample.record.slots.length ? sample.record.slots.join("<br>") : "Not needed yet"}</dd></div>
      </dl>
      <div class="flow-block">
        <h4>Needs a person</h4>
        <ul class="flow-flags">${sample.record.flags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join("")}</ul>
      </div>
      <div class="flow-block">
        <h4>Missing information</h4>
        ${
          sample.record.missing.length
            ? `<ul class="flow-missing">${sample.record.missing.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
            : `<p class="flow-hint">Nothing essential is missing.</p>`
        }
      </div>`,
    () => `
      ${stepHead(3)}
      <div class="flow-mail">
        ${mailMeta([["To", `${sample.from} <${sample.email}>`], ["Subject", sample.draft.subject]])}
        <p class="flow-mail-body">${escapeHtml(draftText)}</p>
      </div>
      <p class="flow-hint">Draft only. It asks for anything missing and offers times from the open schedule.</p>`,
    () => `
      ${stepHead(4)}
      <ul class="flow-checks">
        <li>Enquiry logged from ${escapeHtml(sample.channel.toLowerCase())}</li>
        <li>${sample.fields.length} details extracted, ${count("check") + count("missing")} need attention</li>
        <li>Job record prepared for ${escapeHtml(sample.record.facts[4][1])}</li>
        <li>Reply drafted and waiting for approval</li>
      </ul>
      <ul class="flow-flags">${sample.record.flags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join("")}</ul>
      <label class="flow-edit">
        <span>Reply to ${escapeHtml(sample.from)}. You can edit it before approving.</span>
        <textarea rows="7" data-flow-draft${decision ? " readonly" : ""}>${escapeHtml(draftText)}</textarea>
      </label>
      <div class="flow-decision">
        <button class="flow-run" type="button" data-flow-approve data-focus-key="approve"${decision ? " disabled" : ""}>Approve reply</button>
        <button class="flow-step-button" type="button" data-flow-discard data-focus-key="discard"${decision ? " disabled" : ""}>Discard</button>
      </div>
      <p class="flow-outcome" tabindex="-1" data-decision="${decision}">${
        {
          approved: "Approved in the simulation. Nothing was sent, because this demo isn't connected to email. Press Replay to run it again.",
          discarded: "Discarded. In a real setup, the enquiry would stay in the queue for someone to handle. Press Replay to run it again.",
          "": ""
        }[decision]
      }</p>`
  ];

  function stepState(index) {
    if (index < reached) {
      return "done";
    }
    return index === processing ? "working" : "waiting";
  }

  function render() {
    const focusKey = flow.contains(document.activeElement) ? document.activeElement.dataset.focusKey : undefined;

    samplesEl.innerHTML = samples
      .map(
        (item) =>
          `<button class="flow-sample" type="button" aria-pressed="${item === sample}" data-flow-sample="${item.id}" data-focus-key="sample-${item.id}">${item.label}</button>`
      )
      .join("");

    const stateLabels = { done: "Done", working: "Working", waiting: "Waiting" };
    stepsEl.innerHTML = steps
      .map((step, index) => {
        const state = stepState(index);
        return `<li><button class="flow-step" type="button" data-state="${state}" data-flow-view="${index}" data-focus-key="step-${index}"${
          index === viewing ? ' aria-current="step"' : ""
        }${state === "waiting" ? " disabled" : ""}>
          <span class="flow-step-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
          <span class="flow-step-text"><b>${step.name}</b><span>${step.hint}</span></span>
          <span class="flow-step-state">${stateLabels[state]}</span>
        </button></li>`;
      })
      .join("");

    if (viewing === -1) {
      output.innerHTML = renderIdle();
    } else if (viewing === processing) {
      output.innerHTML = renderWorking(viewing);
    } else {
      output.innerHTML = stages[viewing]();
    }
    output.dataset.stage = viewing;

    const done = reached === steps.length;
    runButton.textContent = running ? "Pause" : done ? "Replay" : reached || processing !== -1 ? "Resume" : "Run workflow";
    nextButton.setAttribute("aria-disabled", String(running || processing !== -1 || done));

    if (focusKey) {
      flow.querySelector(`[data-focus-key="${focusKey}"]`)?.focus();
    }
  }

  function reset(next) {
    window.clearTimeout(timer);
    sample = next;
    reached = 0;
    processing = -1;
    viewing = -1;
    running = false;
    draftText = sample.draft.body;
    decision = "";
    render();
  }

  function work() {
    if (processing !== -1 || reached >= steps.length) {
      return;
    }

    processing = reached;
    viewing = processing;
    render();

    timer = window.setTimeout(() => {
      reached += 1;
      processing = -1;
      if (reached === steps.length) {
        running = false;
      }
      live.textContent = `Step ${reached} of ${steps.length} complete: ${steps[reached - 1].title}.`;
      render();
      if (running) {
        timer = window.setTimeout(work, 400);
      }
    }, steps[processing].duration);
  }

  samplesEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-flow-sample]");
    if (button) {
      reset(samples.find((item) => item.id === button.dataset.flowSample));
    }
  });

  runButton.addEventListener("click", () => {
    if (running) {
      running = false;
      if (processing === -1) {
        window.clearTimeout(timer);
      }
      render();
      return;
    }

    if (reached === steps.length) {
      reset(sample);
    }
    running = true;
    if (processing === -1) {
      work();
    } else {
      render();
    }
  });

  nextButton.addEventListener("click", () => {
    if (nextButton.getAttribute("aria-disabled") !== "true") {
      work();
    }
  });

  stepsEl.addEventListener("click", (event) => {
    const button = event.target.closest("[data-flow-view]");
    if (button && !button.disabled) {
      viewing = Number(button.dataset.flowView);
      render();
    }
  });

  output.addEventListener("input", (event) => {
    if (event.target.matches("[data-flow-draft]")) {
      draftText = event.target.value;
    }
  });

  output.addEventListener("click", (event) => {
    if (event.target.closest("[data-flow-approve]")) {
      decision = "approved";
    } else if (event.target.closest("[data-flow-discard]")) {
      decision = "discarded";
    } else {
      return;
    }
    render();
    output.querySelector(".flow-outcome").focus();
  });

  // Hovering an extracted detail highlights where it came from in the message.
  output.addEventListener("pointerover", (event) => {
    const key = event.target.closest("[data-field]")?.dataset.field;
    output.querySelectorAll("[data-field]").forEach((item) => {
      item.classList.toggle("is-linked", Boolean(key) && item.dataset.field === key);
    });
  });

  render();
}

const flowApp = document.querySelector("[data-flow]");
if (flowApp) {
  initFlow(flowApp);
}

function initContactForm(form) {
  const fields = {
    name: form.elements.name,
    email: form.elements.email,
    interest: form.elements.interest,
    message: form.elements.message
  };
  const rules = {
    name: (value) => (value ? "" : "Enter your name."),
    email: (value) => {
      if (!value) {
        return "Enter your email address so we can reply.";
      }
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? "" : "Check the email address. It should look like name@example.com.";
    },
    interest: (value) => (value ? "" : "Choose what you'd like help with."),
    message: (value) => {
      if (!value) {
        return "Tell us a little about your project.";
      }
      return value.length < 20 ? `Add a little more detail: at least 20 characters (${value.length} so far).` : "";
    }
  };
  const submitButton = form.querySelector("[data-form-submit]");
  const submitLabel = submitButton.textContent;
  const note = form.querySelector("[data-form-note]");
  const status = form.querySelector("[data-form-status]");
  const endpoint = form.getAttribute("action") || "";
  const directLink = document.querySelector('.contact-direct a[href^="mailto:"]');
  const address = (endpoint.startsWith("mailto:") ? endpoint : directLink?.getAttribute("href") || "").replace(/^mailto:/, "").split("?")[0];
  const sendsByEmail = !/^https:\/\//.test(endpoint) || endpoint.includes("YOUR_FORM_ID");
  let attempted = false;
  let sending = false;

  note.hidden = !sendsByEmail;

  function value(key) {
    return fields[key].value.trim();
  }

  function check(key) {
    const field = fields[key];
    const error = document.getElementById(`${field.id}-error`);
    const problem = rules[key](value(key));
    field.setAttribute("aria-invalid", String(Boolean(problem)));
    error.textContent = problem;
    error.hidden = !problem;
    return !problem;
  }

  function clearChecks() {
    Object.values(fields).forEach((field) => {
      field.removeAttribute("aria-invalid");
      const error = document.getElementById(`${field.id}-error`);
      error.textContent = "";
      error.hidden = true;
    });
  }

  function setStatus(state, html) {
    status.dataset.state = state;
    status.innerHTML = html;
  }

  function composeMessage() {
    return [
      `Name: ${value("name")}`,
      `Email: ${value("email")}`,
      `Interested in: ${value("interest")}`,
      "",
      value("message")
    ].join("\n");
  }

  function subject() {
    return `Project enquiry: ${value("interest")}`;
  }

  function emailHref() {
    return `mailto:${address}?subject=${encodeURIComponent(subject())}&body=${encodeURIComponent(composeMessage())}`;
  }

  function openEmail() {
    const href = emailHref();
    setStatus(
      "info",
      `<p><strong>Your email app should open with your message ready to send.</strong> Nothing has been sent yet: press Send in your email app to reach us.</p>
      <p>Nothing opened? <a href="${escapeHtml(href)}">Try again</a>, or copy your message and email it to <a href="mailto:${escapeHtml(address)}">${escapeHtml(address)}</a>.</p>
      <button class="form-copy" type="button" data-form-copy>Copy message</button>`
    );
    const link = document.createElement("a");
    link.href = href;
    link.hidden = true;
    form.append(link);
    link.click();
    link.remove();
  }

  async function send() {
    sending = true;
    submitButton.setAttribute("aria-disabled", "true");
    submitButton.textContent = "Sending…";
    setStatus("info", "<p>Sending your message…</p>");

    const data = new FormData(form);
    data.append("_subject", subject());

    try {
      const response = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!response.ok) {
        throw new Error(`Form endpoint responded with ${response.status}`);
      }
      setStatus(
        "success",
        `<p><strong>Thanks, ${escapeHtml(value("name"))}. Your message has been sent.</strong> We'll reply to ${escapeHtml(value("email"))}.</p>`
      );
      form.reset();
      attempted = false;
      clearChecks();
    } catch {
      setStatus(
        "error",
        `<p><strong>Your message couldn't be sent.</strong> Your details are still in the form, so you can try again, or <a href="${escapeHtml(emailHref())}">send it by email instead</a>.</p>`
      );
    } finally {
      sending = false;
      submitButton.removeAttribute("aria-disabled");
      submitButton.textContent = submitLabel;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (sending) {
      return;
    }

    attempted = true;
    const invalid = Object.keys(fields).filter((key) => !check(key));
    if (invalid.length) {
      setStatus("invalid", `<p>${invalid.length === 1 ? "One field needs" : `${invalid.length} fields need`} attention before you can send.</p>`);
      fields[invalid[0]].focus();
      return;
    }

    if (form.elements._gotcha.value) {
      return;
    }

    if (sendsByEmail) {
      openEmail();
    } else {
      send();
    }
  });

  Object.keys(fields).forEach((key) => {
    const field = fields[key];
    field.addEventListener(field.tagName === "SELECT" ? "change" : "input", () => {
      if (attempted || field.getAttribute("aria-invalid") === "true") {
        check(key);
      }
      if (status.dataset.state === "invalid") {
        const remaining = Object.values(fields).filter((item) => item.getAttribute("aria-invalid") === "true").length;
        if (remaining) {
          setStatus("invalid", `<p>${remaining === 1 ? "One field needs" : `${remaining} fields need`} attention before you can send.</p>`);
        } else {
          setStatus("", "");
        }
      }
    });
    field.addEventListener("blur", () => {
      if (value(key) && !attempted) {
        check(key);
      }
    });
  });

  status.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-form-copy]");
    if (!button) {
      return;
    }
    try {
      await navigator.clipboard.writeText(`To: ${address}\nSubject: ${subject()}\n\n${composeMessage()}`);
      button.textContent = "Copied";
    } catch {
      button.textContent = "Couldn't copy. Select the text in the form instead.";
    }
  });
}

const contactForm = document.querySelector("[data-contact-form]");
if (contactForm) {
  initContactForm(contactForm);
}
