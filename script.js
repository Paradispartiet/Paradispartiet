/* Paradispartiet – felles navigasjon og innhold */
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initScrollTopButton();
  loadAvisaFeed();
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});

function initNavigation() {
  const header = document.querySelector(".site-header");
  const button = header?.querySelector(".nav-toggle");
  const nav = header?.querySelector(".site-nav");
  if (!header || !button || !nav) return;

  function closeMenu(returnFocus = false) {
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Åpne meny");
    nav.classList.remove("is-open");
    header.classList.remove("menu-open");
    if (returnFocus) button.focus();
  }
  function toggleMenu() {
    const opening = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(opening));
    button.setAttribute("aria-label", opening ? "Lukk meny" : "Åpne meny");
    nav.classList.toggle("is-open", opening);
    header.classList.toggle("menu-open", opening);
  }

  button.addEventListener("click", toggleMenu);
  nav.addEventListener("click", event => {
    if (event.target.closest("a")) closeMenu();
  });
  document.addEventListener("click", event => {
    if (!header.contains(event.target)) closeMenu();
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) closeMenu(true);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1040) closeMenu();
  });
}

function initScrollTopButton() {
  const btn = document.getElementById("scrollTopBtn");
  if (!btn) return;
  const update = () => btn.classList.toggle("show", window.scrollY > 350);
  window.addEventListener("scroll", update, { passive: true });
  update();
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const AVISA_BASE = "https://paradispartiet.github.io/Paradisavisa/";
const AVISA_SOURCES = [
  "posts.json", "Nyhetshjul.json", "Nyhetshjul2.json",
  "Kulturhjul.json", "debatt.json", "kommentarer.json"
];

function resolveAvisaUrl(value) {
  if (!value || typeof value !== "string") return "";
  try {
    const url = new URL(value, AVISA_BASE);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

async function loadAvisaFeed() {
  const container = document.querySelector(".avisa-grid");
  if (!container) return;
  const results = await Promise.allSettled(
    AVISA_SOURCES.map(async file => {
      const response = await fetch(AVISA_BASE + file);
      if (!response.ok) throw new Error(response.status);
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    })
  );
  const posts = results.flatMap(result => result.status === "fulfilled" ? result.value : []);
  posts.sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
  if (!posts.length) {
    const p = document.createElement("p");
    p.className = "feed-empty";
    p.textContent = "Nyhetene er ikke tilgjengelige akkurat nå. Besøk Paradisavisa direkte.";
    container.append(p);
    return;
  }
  posts.slice(0, 8).forEach(post => {
    const href = resolveAvisaUrl(post.url);
    if (!href) return;
    const article = document.createElement("article");
    article.className = "avisa-card";
    const image = resolveAvisaUrl(post.image);
    if (image) {
      const img = document.createElement("img");
      img.className = "avisa-img";
      img.src = image;
      img.alt = "";
      img.loading = "lazy";
      article.append(img);
    }
    const body = document.createElement("div");
    body.className = "avisa-body";
    const title = document.createElement("h3");
    title.className = "avisa-title";
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = post.title || "Les artikkelen";
    title.append(a);
    const excerpt = document.createElement("p");
    excerpt.className = "avisa-excerpt";
    excerpt.textContent = post.excerpt || "";
    const meta = document.createElement("p");
    meta.className = "avisa-meta";
    meta.textContent = [post.date, post.category].filter(Boolean).join(" · ");
    body.append(title, excerpt, meta);
    article.append(body);
    container.append(article);
  });
}