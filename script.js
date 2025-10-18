/* =======================================
   PARADISPARTIET – SCRIPT 2025
   Struktur: feed + scroll + init
   ======================================= */

document.addEventListener("DOMContentLoaded", () => {
  initScrollTopButton();
  loadAvisaFeed();
});

/* === Feed fra Paradisavisa === */
function loadAvisaFeed() {
  const feedContainer =
    document.querySelector(".avisa-grid") ||
    document.querySelector(".project-feed .feed-grid");
  if (!feedContainer) return;

  fetch("https://paradispartiet.github.io/Paradisavisa/posts.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Klarte ikke å hente feed.");
      return response.json();
    })
    .then((posts) => {
      // Vis kun de nyeste tre
      const latest = posts.slice(0, 3);
      feedContainer.innerHTML = "";

      latest.forEach((p) => {
        const item = document.createElement("article");
        item.className = "avisa-card";
        item.innerHTML = `
          <img src="${p.image || 'assets/placeholder.jpg'}" class="avisa-img" alt="${p.title}">
          <div class="avisa-body">
            <h3 class="avisa-title"><a href="${p.url}" target="_blank">${p.title}</a></h3>
            <p class="avisa-excerpt">${p.excerpt || ""}</p>
            <p class="avisa-meta">${p.date || ""}</p>
          </div>
        `;
        feedContainer.appendChild(item);
      });
    })
    .catch((err) => {
      console.error("Feil ved lasting av Paradisavisa-feed:", err);
      feedContainer.innerHTML = `<p style="color:#999;text-align:center;">Klarte ikke laste nyheter akkurat nå.</p>`;
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
