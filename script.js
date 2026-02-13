/* =======================================
   PARADISPARTIET – SCRIPT 2025
   Feed, scroll og søk fra Paradisavisa
   ======================================= */

document.addEventListener("DOMContentLoaded", () => {
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
      "https://paradispartiet.github.io/Paradisavisa/Kulturhjul.json"
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

  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  const nyhet = sorted.find(p => normCat(p.category) === "nyheter");
  const kommentar = sorted.find(p => normCat(p.category) === "kommentar");
  const debatt = sorted.find(p => normCat(p.category) === "debatt");

  const selected = [nyhet, kommentar, debatt].filter(Boolean);

  selected.forEach(p => {
    const item = document.createElement("article");
    item.className = "avisa-card";

    const imgSrc = p.image ? resolveAvisaUrl(p.image) : "assets/placeholder.jpg";
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
