const header = document.querySelector("[data-header]");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const systemButtons = document.querySelectorAll("[data-system]");
const systemPreview = document.querySelector("[data-system-preview]");

const systems = {
  field: {
    title: "Field operations app",
    text: "Give your crew one place to see assigned work, complete checklists, submit updates, and send office-ready records without paper or scattered texts.",
    bullets: [
      "Mobile-first daily workflow",
      "Manager dashboard for submitted work",
      "Automatic timestamps and cleaner records"
    ]
  },
  equipment: {
    title: "Equipment tracking system",
    text: "Track trucks, side-by-sides, tools, notes, status changes, and service-related updates in one organized system.",
    bullets: [
      "Equipment status by unit",
      "Service notes and usage history",
      "Cleaner records for managers and office staff"
    ]
  },
  fuel: {
    title: "Fuel and material log",
    text: "Keep cleaner records of fuel, herbicide, materials, or other usage across crews, units, jobs, and dates.",
    bullets: [
      "Mobile fuel and material entries",
      "Usage history by truck, unit, or job",
      "Reports without chasing paperwork"
    ]
  },
  inspection: {
    title: "Pre-trip and inspection system",
    text: "Replace paper pre-trips, safety checks, and daily forms with mobile submissions that stay organized and easy to review.",
    bullets: [
      "Daily mobile inspection forms",
      "Automatic timestamps and submitted records",
      "Dashboard views for missing or completed checks"
    ]
  }
};

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

systemButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = systems[button.dataset.system];

    systemButtons.forEach((item) => item.classList.remove("is-active"));
    button.classList.add("is-active");

    systemPreview.innerHTML = `
      <p class="preview-label">Selected system</p>
      <h3>${selected.title}</h3>
      <p>${selected.text}</p>
      <ul>${selected.bullets.map((item) => `<li>${item}</li>`).join("")}</ul>
    `;
  });
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();
