/* =======================================
   PARADISPARTIET – SCRIPT 2025
   Feed, scroll og søk fra Paradisavisa
   ======================================= */

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initDocumentOutline();
  initReadingProgress();
  initScrollTopButton();
  loadAvisaFeed();
});

/* === Feed fra Paradisavisa === */
let allPosts = [];

async function loadAvisaFeed() {
  const feedContainer =
    document.querySelector(".avisa-grid") ||
    document.querySelector(".project-feed .feed-grid");

  if (!feedContainer) return;

  try {
   const sources = [
     "https://paradispartiet.github.io/Paradisavisa/posts.json",
     "https://paradispartiet.github.io/Paradisavisa/Nyhetshjul.json",
     "https://paradispartiet.github.io/Paradisavisa/Nyhetshjul2.json",
     "https://paradispartiet.github.io/Paradisavisa/Kulturhjul.json",
     "https://paradispartiet.github.io/Paradisavisa/debatt.json",
     "https://paradispartiet.github.io/Paradisavisa/kommentarer.json"
   ];

    const responses = await Promise.all(
      sources.map(url => fetch(url, { cache: "no-store" }).then(r => r.json()))
    );

    const all = responses.flat();

    const sorted = all.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    renderFeed(sorted.slice(0, 10), feedContainer);

  } catch (err) {
    console.error("Feed-feil:", err);
    feedContainer.innerHTML =
      `<p style="color:#999;text-align:center;">Klarte ikke laste nyheter akkurat nå.</p>`;
  }
}

const AVISA_BASE = "https://paradispartiet.github.io/Paradisavisa/";

function resolveAvisaUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  if (p.startsWith("http://") || p.startsWith("https://")) return p;
  return AVISA_BASE + p.replace(/^\//, "");
}

function normCat(c) {
  const s = String(c || "").trim().toLowerCase();
  if (s === "kommentarer") return "kommentar";
  return s;
}

function renderFeed(posts, container) {
  container.innerHTML = "";
  if (!posts || posts.length === 0) return;

  posts.forEach(p => {
    const item = document.createElement("article");
    item.className = "avisa-card";

    const imgSrc = p.image
      ? resolveAvisaUrl(p.image)
      : "assets/placeholder.jpg";

    const href = resolveAvisaUrl(p.url);

    item.innerHTML = `
      <img src="${imgSrc}" class="avisa-img" alt="${p.title}">
      <div class="avisa-body">
        <h3 class="avisa-title">
          <a href="${href}" target="_blank" rel="noopener">${p.title}</a>
        </h3>
        <p class="avisa-excerpt">${p.excerpt || ""}</p>
        <p class="avisa-meta">${p.date || ""} · ${p.category || ""}</p>
      </div>
    `;

    container.appendChild(item);
  });
}


/* === Til toppen-knapp === */
function initScrollTopButton() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) btn.classList.add("show");
    else btn.classList.remove("show");
  });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}


/* === Tilgjengelig mobilmeny med vanlig synlig navigasjon uten JavaScript === */
function initNavigation() {
  const header = document.querySelector(".site-header");
  const nav = header && header.querySelector(".site-nav");
  if (!nav) return;

  const parent = nav.parentElement;
  let toggle = header.querySelector(".nav-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    parent.insertBefore(toggle, nav);
  } else if (toggle.parentElement !== parent) {
    parent.insertBefore(toggle, nav);
  }
  toggle.type = "button";
  toggle.className = "nav-toggle";
  toggle.setAttribute("aria-controls", "hovedmeny");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Åpne meny");
  toggle.innerHTML = '<span aria-hidden="true" class="menu-glyph">☰</span><span>Meny</span>';
  nav.id = "hovedmeny";
  nav.classList.remove("is-open");

  function setMenuOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Lukk meny" : "Åpne meny");
  }

  toggle.addEventListener("click", () => {
    setMenuOpen(!nav.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenuOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenuOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 700) setMenuOpen(false);
  });

  // Først etter at menyen er fullt klar skjules den bak bryteren på mobil.
  document.documentElement.classList.add("js-navigation");
}

/* === Navigasjon gjennom eksisterende kapitler, uten tekstredigering === */
function initDocumentOutline() {
  const main = document.getElementById("main-content");
  if (!main) return;

  let entries = [];
  let label = "Innhold og kapitler";

  if (document.body.classList.contains("page--teori")) {
    entries = Array.from(main.querySelectorAll("article.chapter[id]")).map((section) => {
      const heading = section.querySelector(":scope > h2, :scope > h3");
      return heading && { id: section.id, title: heading.textContent.trim() };
    }).filter(Boolean);
  } else if (main.querySelector("#politikk-fulltekst")) {
    entries = Array.from(main.querySelectorAll(".pp-politikk section[id]")).map((section) => {
      const heading = section.querySelector(":scope > h2, :scope > h3");
      return heading && { id: section.id, title: heading.textContent.trim() };
    }).filter(Boolean);
    label = "Politiske temaer";
  }

  if (entries.length < 3) return;

  const details = document.createElement("details");
  details.className = "reading-index";
  const summary = document.createElement("summary");
  summary.textContent = label + " (" + entries.length + ")";
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", label);
  const list = document.createElement("ol");

  entries.forEach(({ id, title }) => {
    const item = document.createElement("li");
    const anchor = document.createElement("a");
    anchor.href = "#" + encodeURIComponent(id);
    anchor.textContent = title;
    item.appendChild(anchor);
    list.appendChild(item);
  });

  nav.appendChild(list);
  details.appendChild(summary);
  details.appendChild(nav);

  const introduction = main.querySelector(":scope > .lead, :scope > p");
  const heading = main.querySelector(":scope > h1");
  (introduction || heading)?.insertAdjacentElement("afterend", details);
}

/* === Diskret lesefremdrift på de lange dokumentene === */
function initReadingProgress() {
  if (!document.body.matches(".page--manifest, .page--teori, .page--okonomiskmodell")
      && !document.querySelector(".pp-politikk")) return;

  const main = document.getElementById("main-content");
  if (!main) return;
  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  let scheduled = false;
  function update() {
    const end = Math.max(1, main.offsetTop + main.offsetHeight - window.innerHeight);
    const current = Math.max(0, window.scrollY - main.offsetTop);
    progress.style.width = Math.min(100, (current / end) * 100) + "%";
    scheduled = false;
  }
  window.addEventListener("scroll", () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener("resize", update);
  update();
}
