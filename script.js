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

function loadAvisaFeed() {
  const feedContainer =
    document.querySelector(".avisa-grid") ||
    document.querySelector(".project-feed .feed-grid");
  if (!feedContainer) return;

  // Legg til søkefelt
  const searchBox = document.createElement("div");
  searchBox.className = "feed-search";
  searchBox.innerHTML = `
    <input type="text" id="feedSearch" placeholder="Søk i Paradisavisa..." autocomplete="off" />
  `;
  feedContainer.parentElement.insertBefore(searchBox, feedContainer);

  fetch("https://paradispartiet.github.io/Paradisavisa/posts.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Klarte ikke å hente feed.");
      return response.json();
    })
    .then((posts) => {
      allPosts = posts;
      renderFeed(posts.slice(0, 3), feedContainer);

      // Koble søket
      const searchInput = document.getElementById("feedSearch");
      searchInput.addEventListener("input", () => {
        const query = searchInput.value.toLowerCase();
        if (query.trim() === "") {
          renderFeed(posts.slice(0, 3), feedContainer);
          return;
        }
        const results = posts.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            (p.excerpt && p.excerpt.toLowerCase().includes(query))
        );
        renderFeed(results, feedContainer, true);
      });
    })
    .catch((err) => {
      console.error("Feil ved lasting av Paradisavisa-feed:", err);
      feedContainer.innerHTML = `<p style="color:#999;text-align:center;">Klarte ikke laste nyheter akkurat nå.</p>`;
    });
}

const AVISA_BASE = "https://paradispartiet.github.io/Paradisavisa/";

function renderFeed(posts, container) {
  container.innerHTML = "";
  if (!posts || posts.length === 0) return;

  // Sorter nyeste først
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  const nyhet = posts.find(p => p.category === "nyheter");
  const kommentar = posts.find(p => p.category === "kommentar");
  const debatt = posts.find(p => p.category === "debatt");

  const selected = [nyhet, kommentar, debatt].filter(Boolean);

  selected.forEach(p => {
    const item = document.createElement("article");
    item.className = "avisa-card";
    item.innerHTML = `
      <img src="${AVISA_BASE + (p.image || 'assets/placeholder.jpg')}" 
           class="avisa-img" 
           alt="${p.title}">
      <div class="avisa-body">
        <h3 class="avisa-title">
          <a href="${AVISA_BASE + p.url}" target="_blank" rel="noopener">
            ${p.title}
          </a>
        </h3>
        <p class="avisa-excerpt">${p.excerpt || ""}</p>
        <p class="avisa-meta">${p.date || ""} · ${p.category}</p>
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
