/* Paradispartiet – felles navigasjon og innhold */
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initIllustratedSite();
  initScrollTopButton();
  initDocumentIndex();
  loadAvisaFeed();
  document.querySelectorAll("[data-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });
});

function initDocumentIndex() {
  const main = document.querySelector(".page--teori main.content");
  if (!main) return;
  const chapters = [...main.querySelectorAll("article.chapter[id]")];
  if (chapters.length < 5) return;
  const details = document.createElement("details");
  details.className = "chapter-index";
  const summary = document.createElement("summary");
  summary.textContent = "Finn et kapittel (" + chapters.length + " kapitler)";
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Kapitler i grunnlagsdokumentet");
  const list = document.createElement("ol");
  for (const chapter of chapters) {
    const heading = chapter.querySelector("h2");
    if (!heading) continue;
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + chapter.id;
    link.textContent = heading.textContent.trim();
    item.append(link);
    list.append(item);
  }
  nav.append(list);
  details.append(summary, nav);
  chapters[0].before(details);
}

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

/* Illustrert visuell identitet — #23. Originaltekster og logo berøres ikke. */
function initIllustratedSite() {
  const script = [...document.scripts].find(node => /(?:^|\/)script\.js(?:\?|$)/.test(node.getAttribute("src") || ""));
  if (!script) return;
  const assets = new URL("assets/illustrasjoner/", script.src);
  const rasterScenes = new Set([
    "visjon-by-land", "bilfri-by", "gronne-hjem", "smabruk-natur",
    "kunnskap-helse", "kultur-fellesskap", "arbeid-teknologi"
  ]);
  const illustration = name => new URL(name + (
    rasterScenes.has(name) || name.endsWith("-960") ? ".webp" : ".svg"
  ), assets).href;
  const page = location.pathname.split("/").pop() || "index.html";
  const projectPage = /\/Prosjekter\//.test(location.pathname);
  const altText = "Fargerik illustrert framtidsvisjon med natur, mennesker, sol og måne.";

  function picture(name, className, { alt = "", eager = false } = {}) {
    const img = document.createElement("img");
    img.className = className;
    img.src = illustration(name);
    if (rasterScenes.has(name)) {
      img.srcset = illustration(name + "-960") + " 960w, " + illustration(name) + " 2048w";
      img.sizes = className === "vision-home-image" || className === "vision-banner-image"
        ? "100vw"
        : className === "vision-card-art" || className === "vision-topic-art"
          ? "(max-width: 700px) 100vw, (max-width: 1200px) 45vw, 650px"
          : "(max-width: 700px) 100vw, 1100px";
    }
    img.alt = alt;
    img.width = rasterScenes.has(name) ? 2048 : 1600;
    img.height = rasterScenes.has(name) ? 1152 : 700;
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    if (eager) img.fetchPriority = "high";
    return img;
  }
  function topIllustration(name) {
    const main = document.getElementById("main-content");
    if (!main || document.querySelector(".vision-page-art")) return;
    const figure = document.createElement("figure");
    figure.className = "vision-page-art";
    figure.append(picture(name, "vision-page-image", { alt: altText, eager: true }));
    main.before(figure);
  }
  function bannerIllustration(banner, name) {
    if (!banner || banner.querySelector(".vision-banner-image")) return;
    banner.classList.add("vision-illustrated-banner");
    banner.prepend(picture(name, "vision-banner-image", { alt: "", eager: true }));
  }
  function inlineIllustration(container, name, className = "vision-card-art") {
    if (!container || container.querySelector("." + className)) return;
    container.prepend(picture(name, className));
  }

  const subjects = [
    ["bolig", "gronne-hjem"],
    ["mat", "smabruk-natur"],
    ["helse", "kunnskap-helse"],
    ["utdanning", "kunnskap-helse"],
    ["arbeid", "arbeid-teknologi"],
    ["kultur", "kultur-fellesskap"],
    ["natur", "smabruk-natur"],
    ["miljø", "smabruk-natur"],
    ["transport", "bilfri-by"],
    ["bilfri", "bilfri-by"],
    ["teknologi", "arbeid-teknologi"],
    ["BasicMarked", "arbeid-teknologi"],
    ["rettferdig", "kultur-fellesskap"],
    ["produksjon", "arbeid-teknologi"],
    ["læring", "kunnskap-helse"],
    ["lys", "visjon-by-land"],
    ["bilde", "visjon-by-land"]
  ];
  const chooseSubject = (value, fallback = "visjon-by-land") =>
    subjects.find(([word]) => String(value).toLowerCase().includes(word.toLowerCase()))?.[1] || fallback;

  if (page === "index.html" && !projectPage) {
    const hero = document.querySelector(".hero");
    if (hero) {
      hero.classList.add("vision-home-hero");
      hero.prepend(picture("visjon-by-land", "vision-home-image", { eager: true }));
    }
    document.querySelectorAll(".foundation-grid article").forEach((article, i) => {
      inlineIllustration(article, ["kultur-fellesskap", "arbeid-teknologi", "visjon-by-land"][i % 3]);
    });
    document.querySelectorAll(".principles-section .card").forEach(card => {
      inlineIllustration(card, chooseSubject(card.querySelector("h3")?.textContent));
    });
    document.querySelectorAll(".projects.home .project").forEach(article => {
      const subject = article.querySelector("h2,h3")?.textContent || "";
      const img = article.querySelector("img");
      if (img) {
        img.replaceWith(picture(chooseSubject(subject, "kultur-fellesskap"), "vision-card-art"));
      }
    });
  }

  if (page === "prosjekter.html" && !projectPage) {
    topIllustration("visjon-by-land");
    const projectArt = {
      "Paradisavisa": "kultur-fellesskap",
      "AHA EchoNet": "arbeid-teknologi",
      "Lesebiblioteket": "kunnskap-helse",
      "Oslo Old Boys": "kultur-fellesskap",
      "GlassHus": "gronne-hjem",
      "Bilfri by": "bilfri-by",
      "The Caravan": "smabruk-natur",
      "BasicMarked-piloten": "arbeid-teknologi",
      "Teorien om lyset": "visjon-by-land"
    };
    document.querySelectorAll(".projects-page .project").forEach(article => {
      const name = article.querySelector("h2,h3")?.textContent?.trim();
      if (!name) return;
      const subject = projectArt[name] || chooseSubject(name);
      const existing = article.querySelector(".project-visual, img");
      if (!existing) return;
      const image = picture(subject, "vision-card-art");
      if (existing.tagName === "IMG") existing.replaceWith(image);
      else existing.replaceWith(image);
    });
  }

  if (projectPage) {
    const scene = {
      "BilfriBy.html": "bilfri-by",
      "GlassHus.html": "gronne-hjem",
      "Caravan.html": "smabruk-natur",
      "Lesebiblioteket.html": "kunnskap-helse",
      "EchoNet.html": "arbeid-teknologi",
      "Oslooldboys.html": "kultur-fellesskap",
      "Paradisavisa.html": "kultur-fellesskap"
    }[page] || "visjon-by-land";
    bannerIllustration(document.querySelector(".project-banner"), scene);
  }

  if (page === "om.html") {
    bannerIllustration(document.querySelector(".project-banner"), "kultur-fellesskap");
    document.querySelectorAll(".about-grid article").forEach((card, i) =>
      inlineIllustration(card, ["gronne-hjem", "kultur-fellesskap", "arbeid-teknologi"][i % 3]));
  }

  const pageScenes = {
    "politikk.html": "bilfri-by",
    "manifest.html": "visjon-by-land",
    "grunnlag.html": "smabruk-natur",
    "okonomisk-modell.html": "arbeid-teknologi",
    "kontakt.html": "kultur-fellesskap",
    "404.html": "visjon-by-land"
  };
  if (pageScenes[page] && !projectPage) topIllustration(pageScenes[page]);

  if (page === "politikk.html") {
    const policyArt = {
      "okonomi": "arbeid-teknologi",
      "offentlig-grunnsortiment": "arbeid-teknologi",
      "bolig": "gronne-hjem",
      "mat": "smabruk-natur",
      "helse": "kunnskap-helse",
      "utdanning": "kunnskap-helse",
      "arbeidsliv": "arbeid-teknologi",
      "miljo": "smabruk-natur",
      "transport": "bilfri-by",
      "kultur": "kultur-fellesskap"
    };
    Object.entries(policyArt).forEach(([sectionId, scene]) => {
      const section = document.getElementById(sectionId);
      const heading = section?.querySelector("h2");
      if (!heading) return;
      heading.after(picture(scene, "vision-topic-art"));
    });
  }

  // To stille illustrasjonspauser per langt dokument, ikke mellom hvert avsnitt.
  if (["manifest.html", "grunnlag.html", "okonomisk-modell.html"].includes(page)) {
    const main = document.getElementById("main-content");
    const chapters = main?.querySelectorAll("article.chapter, section[id]") || [];
    const scenes = page === "manifest.html"
      ? ["gronne-hjem", "kultur-fellesskap"]
      : page === "grunnlag.html"
        ? ["smabruk-natur", "kunnskap-helse"]
        : ["arbeid-teknologi", "gronne-hjem"];
    [Math.floor(chapters.length / 3), Math.floor(2 * chapters.length / 3)].forEach((index, i) => {
      const node = chapters[index];
      if (node && !node.querySelector(".vision-document-art")) {
        const image = picture(scenes[i], "vision-document-art");
        node.after(image);
      }
    });
  }
}
