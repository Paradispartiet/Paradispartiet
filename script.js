/* Paradispartiet – felles navigasjon og innhold */
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initIllustratedSite();
  initScrollTopButton();
  initDocumentIndex();
  initManifestReader();
  initEconomicReader();
  initPolicyTopics();
  initProjectDirectory();
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

  // Antallet skal alltid gjenspeile faktiske kapitler på siden.
  const intro = main.querySelector(".lead");
  if (intro) {
    const meta = document.createElement("p");
    meta.className = "reader-meta";
    meta.textContent = chapters.length + " kapitler i nettutgaven";
    intro.after(meta);
  }

  const details = document.createElement("details");
  details.className = "chapter-index";
  const summary = document.createElement("summary");
  summary.textContent = "Finn et kapittel (" + chapters.length + ")";
  const tools = document.createElement("div");
  tools.className = "chapter-index-tools";
  const label = document.createElement("label");
  label.htmlFor = "chapter-search";
  label.textContent = "Søk i kapitteltitlene";
  const search = document.createElement("input");
  search.id = "chapter-search";
  search.type = "search";
  search.autocomplete = "off";
  search.placeholder = "Søk etter tema eller kapittel";
  const results = document.createElement("p");
  results.className = "chapter-index-results";
  results.setAttribute("role", "status");
  results.setAttribute("aria-live", "polite");
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Kapitler i grunnlagsdokumentet");
  const list = document.createElement("ol");
  const entries = [];

  for (const chapter of chapters) {
    const heading = chapter.querySelector("h2");
    if (!heading) continue;
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#" + chapter.id;
    link.textContent = heading.textContent.trim();
    link.addEventListener("click", () => { details.open = false; });
    item.append(link);
    list.append(item);
    entries.push({item, title: link.textContent.toLocaleLowerCase("nb-NO")});
  }
  const filterChapters = () => {
    const term = search.value.trim().toLocaleLowerCase("nb-NO");
    let found = 0;
    for (const entry of entries) {
      const matches = entry.title.includes(term);
      entry.item.hidden = !matches;
      if (matches) found++;
    }
    results.textContent = term
      ? found + " av " + entries.length + " kapitler"
      : entries.length + " kapitler";
  };
  search.addEventListener("input", filterChapters);
  filterChapters();
  tools.append(label, search, results);
  nav.append(list);
  details.append(summary, tools, nav);
  chapters[0].before(details);

  initReadingProgress();
}


function initReadingProgress() {
  // Samme visning for Manifestet og Grunnlagsdokumentet, uten doble indikatorer.
  if (document.querySelector(".reading-progress")) return;
  // Diskret lesefremdrift for lange dokumenter.
  const progress = document.createElement("div");
  progress.className = "reading-progress";
  progress.setAttribute("aria-hidden", "true");
  const bar = document.createElement("div");
  bar.className = "reading-progress-fill";
  progress.append(bar);
  document.body.append(progress);
  let scheduled = false;
  const update = () => {
    scheduled = false;
    const available = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const fraction = Math.max(0, Math.min(1, window.scrollY / available));
    bar.style.transform = "scaleX(" + fraction + ")";
  };
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(update);
  };
  window.addEventListener("scroll", schedule, {passive: true});
  window.addEventListener("resize", schedule);
  update();
}

function initManifestReader() {
  const main = document.querySelector(".page--manifest main.content");
  const toc = main?.querySelector("#manifest-innhold");
  if (!toc) return;
  initReadingProgress();
  const details = toc.querySelector("details");
  const search = toc.querySelector("#manifest-toc-search");
  const status = toc.querySelector("#manifest-toc-status");
  const entries = [...toc.querySelectorAll("li")].map(item => ({
    item,
    link: item.querySelector("a"),
    text: item.textContent.trim().toLocaleLowerCase("nb-NO")
  }));
  const filter = () => {
    const query = search.value.trim().toLocaleLowerCase("nb-NO");
    let count = 0;
    for (const entry of entries) {
      const visible = entry.text.includes(query);
      entry.item.hidden = !visible;
      if (visible) count++;
    }
    status.textContent = query ? count + " av " + entries.length + " emner" : entries.length + " emner";
  };
  search.addEventListener("input", filter);
  filter();
  for (const entry of entries) {
    entry.link?.addEventListener("click", () => { details.open = false; });
  }
  // Fremhev hvilken hoveddel leseren er i, uten å flytte fokus eller rulle siden.
  if ("IntersectionObserver" in window) {
    const anchors = entries.map(entry => document.getElementById(entry.link?.hash.slice(1))).filter(Boolean);
    const active = new IntersectionObserver(changes => {
      const first = changes.filter(change => change.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!first) return;
      for (const entry of entries) {
        if (entry.link?.hash === "#" + first.target.id) entry.link.setAttribute("aria-current", "location");
        else entry.link?.removeAttribute("aria-current");
      }
    }, {rootMargin: "-10% 0px -75% 0px"});
    anchors.forEach(target => active.observe(target));
  }
}


function initPolicyTopics() {
  const panel = document.querySelector(".page--politikk .policy-topic-panel");
  if (!panel) return;
  const input = panel.querySelector("#policy-topic-search");
  const results = panel.querySelector("#policy-topic-results");
  const items = [...panel.querySelectorAll(".policy-topic-list > li")];
  const entries = items.map(item => ({
    item,
    text: item.textContent.trim().toLocaleLowerCase("nb-NO")
  }));
  const filter = () => {
    const term = input.value.trim().toLocaleLowerCase("nb-NO");
    let visible = 0;
    for (const entry of entries) {
      const match = entry.text.includes(term);
      entry.item.hidden = !match;
      if (match) visible++;
    }
    results.textContent = term
      ? visible + " av " + entries.length + " temaer"
      : entries.length + " temaer";
  };
  input.addEventListener("input", filter);
  filter();
  panel.querySelectorAll(".policy-topic-list a").forEach(link => {
    link.addEventListener("click", () => { panel.open = false; });
  });
}

function initEconomicReader() {
  const toc = document.querySelector(".page--okonomiskmodell .document-toc");
  if (!toc) return;
  const details = toc.querySelector(".economic-toc-panel");
  const search = toc.querySelector("#economic-toc-search");
  const status = toc.querySelector("#economic-toc-results");
  if (!details || !search || !status) return;

  // Eksisterende innholdslenker er fasit; ikke opprett eller gjenta kapittelposter.
  const entries = [...toc.querySelectorAll("ol > li")].map(item => ({
    item,
    link: item.querySelector("a"),
    text: item.textContent.trim().toLocaleLowerCase("nb-NO")
  }));
  details.querySelector("summary").textContent = "Finn en seksjon (" + entries.length + ")";
  details.open = window.matchMedia("(min-width: 701px)").matches;

  const filter = () => {
    const term = search.value.trim().toLocaleLowerCase("nb-NO");
    let matches = 0;
    for (const entry of entries) {
      const visible = entry.text.includes(term);
      entry.item.hidden = !visible;
      if (visible) matches++;
    }
    status.textContent = term
      ? matches + " av " + entries.length + " seksjoner"
      : entries.length + " seksjoner";
  };
  search.addEventListener("input", filter);
  filter();
  for (const entry of entries) {
    entry.link?.addEventListener("click", () => { details.open = false; });
  }
  initReadingProgress();
}


function initProjectDirectory() {
  const root = document.querySelector(".projects-directory");
  if (!root) return;
  const search = root.querySelector("#projects-search");
  const count = root.querySelector("#projects-count");
  const empty = root.querySelector("#projects-empty");
  const cards = [...root.querySelectorAll(".project-directory-card")];
  if (!search || !count || !empty || !cards.length) return;
  const searchable = cards.map(card => ({
    card,
    value: [...card.querySelectorAll("h2, .project-body p, .project-tag")]
      .map(el => el.textContent.trim()).join(" ").toLocaleLowerCase("nb-NO")
  }));
  function filter() {
    const query = search.value.trim().toLocaleLowerCase("nb-NO");
    let shown = 0;
    for (const {card,value} of searchable) {
      const matches = value.includes(query);
      card.hidden = !matches;
      if (matches) shown++;
    }
    count.textContent = query ? shown + " av " + cards.length + " prosjekter" : cards.length + " prosjekter";
    empty.hidden = shown > 0;
  }
  search.addEventListener("input", filter);
  filter();
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
/**
 * Illustrasjoner er knyttet til én konkret tekst og ett sted.
 * Kilde/register: docs/ILLUSTRASJONSPLAN.json
 * Ulike sider skal aldri dele bildefiler.
 */
function initIllustratedSite() {
  const sourceScript = [...document.scripts].find(node =>
    /(?:^|\/)script\.js(?:\?|$)/.test(node.getAttribute("src") || ""));
  if (!sourceScript) return;
  const imageFolder = new URL("assets/illustrasjoner/", sourceScript.src);
  const page = location.pathname.split("/").pop() || "index.html";
  const isProject = /\/Prosjekter\//.test(location.pathname);
  const SCENE_ASSIGNMENTS = {
  "homeHero": {
    "id": "side-forside-trygghet",
    "alt": "Et boligområde med åpne møteplasser og mennesker som skaper sammen.",
    "size": "2K"
  },
  "pageHeroes": {
    "politikk.html": {
      "id": "side-politikk-grunnbehov",
      "alt": "Bolig, matforsyning, helsehjelp og læring samlet omkring et offentlig torg.",
      "size": "2K"
    },
    "prosjekter.html": {
      "id": "side-prosjekter-fra-ide-til-praksis",
      "alt": "Mennesker bygger og planlegger felles møteplasser i nabolaget.",
      "size": "2K"
    },
    "manifest.html": {
      "id": "side-manifest-ufravikelige-rettigheter",
      "alt": "Et nabolag der bolig, mat, helse og utdanning er tilgjengelig for alle.",
      "size": "2K"
    },
    "grunnlag.html": {
      "id": "side-grunnlag-historie-filosofi-okologi",
      "alt": "Et forskningsrom med historiske kilder, samtale og naturen utenfor.",
      "size": "2K"
    },
    "okonomisk-modell.html": {
      "id": "side-okonomisk-modell-dobbelstruktur",
      "alt": "Et fellesmarked for grunnbehov ved siden av frie lokale verksteder.",
      "size": "2K"
    },
    "kontakt.html": {
      "id": "side-kontakt-bli-med",
      "alt": "Frivillige hjelper interesserte med medlemskap og underskrifter på papir.",
      "size": "2K"
    },
    "404.html": {
      "id": "side-404-vei-videre",
      "alt": "To stier fører videre til et torg og et åpent verksted.",
      "size": "2K"
    }
  },
  "pageBanners": {
    "om.html": {
      "id": "side-om-apen-deltakelse",
      "alt": "Ulike mennesker deltar i et åpent arbeidsmøte om felles prosjekter.",
      "size": "2K"
    }
  },
  "projectBanners": {
    "EchoNet.html": {
      "id": "prosjekt-aha-samtaler-innsikt",
      "alt": "Personlige samtaler blir til anonymisert, felles kunnskap uten overvåkning.",
      "size": "2K"
    },
    "Caravan.html": {
      "id": "prosjekt-caravan-gronne-korridorer",
      "alt": "Grønne gang- og sykkelforbindelser knytter bygder og togstopp sammen.",
      "size": "2K"
    },
    "GlassHus.html": {
      "id": "prosjekt-glasshus-vinterpaviljong",
      "alt": "Oppvarmet glasspaviljong i snødekket park, åpen for lesing og samtale.",
      "size": "2K"
    },
    "BilfriBy.html": {
      "id": "prosjekt-bilfri-by-tilgjengelighet",
      "alt": "Bilfri sentrumsgate med trikk, universell utforming og nødvendig varelevering.",
      "size": "2K"
    },
    "Oslooldboys.html": {
      "id": "prosjekt-oldboys-trening-uten-press",
      "alt": "Voksne spiller fotball sammen i en uformell og inkluderende klubb.",
      "size": "2K"
    },
    "Paradisavisa.html": {
      "id": "prosjekt-paradisavisa-uavhengig-redaksjon",
      "alt": "Journalister og skribenter arbeider i en uavhengig redaksjon.",
      "size": "2K"
    },
    "Lesebiblioteket.html": {
      "id": "prosjekt-lesebiblioteket-apent-leserom",
      "alt": "Et gratis leserom der voksne leser, skriver og snakker uten kjøpeplikt.",
      "size": "2K"
    }
  },
  "projectCards": {
    "Paradisavisa": {
      "id": "kort-paradisavisa-kritisk-samtale",
      "alt": "En redaksjon arbeider med artikler, bilder og samfunnsdebatt.",
      "size": "1K"
    },
    "AHA EchoNet": {
      "id": "kort-aha-kunnskapsnettverk",
      "alt": "Mennesker bruker digitale samtaler til å dele kunnskap på en trygg måte.",
      "size": "1K"
    },
    "Lesebiblioteket": {
      "id": "kort-lesebiblioteket-samtalesirkel",
      "alt": "En liten gruppe voksne samtaler om bøker i et åpent lesebibliotek.",
      "size": "1K"
    },
    "Oslo Old Boys": {
      "id": "kort-oldboys-lavterskel-aktivitet",
      "alt": "To voksne gjør seg klare til en uformell fotballtrening.",
      "size": "1K"
    },
    "GlassHus": {
      "id": "kort-glasshus-vinterlys",
      "alt": "En liten oppvarmet glasspaviljong lyser i en vinterpark.",
      "size": "1K"
    },
    "Bilfri by": {
      "id": "kort-bilfri-by-gronn-gate",
      "alt": "En trygg bilfri gate med barn, benker og grønne møteplasser.",
      "size": "1K"
    },
    "The Caravan": {
      "id": "kort-caravan-trygg-sykkelvei",
      "alt": "Sykkelvei og gangsti kobler natur og små lokalsamfunn sammen.",
      "size": "1K"
    },
    "BasicMarked-piloten": {
      "id": "kort-basicmarked-grunnforsyning",
      "alt": "Utdeling av mat og nødvendighetsvarer gjennom en felles ordning.",
      "size": "1K"
    },
    "Teorien om lyset": {
      "id": "kort-teorien-om-lyset-bevissthet",
      "alt": "Et menneske reflekterer ved et vindu der sollys faller på planter.",
      "size": "1K"
    }
  },
  "policyTopics": {
    "okonomi": {
      "id": "politikk-okonomi-dobbel-markedsstruktur",
      "alt": "Felles grunnforsyning og frie verksteder fungerer side om side.",
      "size": "2K",
      "caption": "BasicMarkedet sikrer grunnbehovene, mens det frie markedet gir plass til selvstendig produksjon og handel."
    },
    "offentlig-grunnsortiment": {
      "id": "politikk-offentlig-grunnsortiment-varighet",
      "alt": "Studenter og fagarbeidere tester og reparerer varige digitale produkter og verktøy.",
      "size": "2K"
    },
    "bolig": {
      "id": "politikk-bolig-hjem-ikke-spekulasjon",
      "alt": "En innbygger får nøklene til en nøktern bolig i et grønt fellesskap.",
      "size": "2K",
      "caption": "Bolig skal være en rettighet og et hjem, ikke en investering for spekulasjon."
    },
    "mat": {
      "id": "politikk-mat-lokal-matsikkerhet",
      "alt": "Lokal dyrking og distribusjon sikrer tilgang til næringsrik mat.",
      "size": "2K",
      "caption": "Forslaget til BasicMarked bygger på næringsrik mat, lokal produksjon og felles forsyning."
    },
    "helse": {
      "id": "politikk-helse-fysisk-psykisk-sosial",
      "alt": "Omsorgssamtale og sosial aktivitet ved et tilgjengelig helsesenter.",
      "size": "2K"
    },
    "utdanning": {
      "id": "politikk-utdanning-praksis-og-teori",
      "alt": "Elever og voksne lærer gjennom bøker og praktisk verkstedarbeid.",
      "size": "2K",
      "caption": "Livslang læring: åpne verksteder og undervisning skal knytte praktisk og teoretisk kunnskap sammen."
    },
    "arbeidsliv": {
      "id": "politikk-arbeidsliv-tid-etter-evne",
      "alt": "Fleksibelt samfunnsarbeid gir plass til omsorg og egen skapelse.",
      "size": "2K"
    },
    "miljo": {
      "id": "politikk-miljo-natur-forst",
      "alt": "En liten bosetting er lagt utenfor vernet natur og viktige jordbruksarealer.",
      "size": "2K"
    },
    "transport": {
      "id": "politikk-transport-kollektiv-og-korridorer",
      "alt": "Tog, gangvei og sykkelsti gjør bilfri reise mulig mellom by og land.",
      "size": "2K",
      "caption": "Kollektivtransport, bilfrie bykjerner og grønne ferdselsårer gjør det lettere å reise uten privatbil."
    },
    "kultur": {
      "id": "politikk-kultur-alle-kan-skape",
      "alt": "Felles kulturhus gir alle rom til håndverk, kunst og scenearbeid.",
      "size": "2K",
      "caption": "Åpne kulturhus, atelierer og scener skal gi flere mulighet til å skape og delta."
    }
  },
  "documentFigures": {
    "manifest.html": [
      {
        "id": "forklaring-manifest-mekling-reparasjon",
        "alt": "Et nabolag reparerer en skadet felles paviljong mens naboer og en mekler avtaler erstatning og gjenoppretting.",
        "size": "2K",
        "section_id": "kap24",
        "caption": "Ved mindre skader er utgangspunktet mekling, reparasjon, erstatning og offentlig forsikring – ikke unødvendig straff."
      },
      {
        "id": "forklaring-manifest-algoritmerevisjon",
        "alt": "En uavhengig gruppe undersøker hvordan en offentlig digital tjeneste fungerer, mens en innbyggers private informasjon er skjermet.",
        "size": "2K",
        "section_id": "kap40",
        "caption": "Offentlige algoritmer skal kunne revideres, mens innbyggernes private opplysninger holdes skjermet."
      },
      {
        "id": "forklaring-manifest-frivillig-bosetting",
        "alt": "Innbyggere undersøker frivillige bosettingsmuligheter på et lokalt kart mens et våtmarksområde og dyrket mark blir bevart.",
        "size": "2K",
        "section_id": "kap31",
        "caption": "Bosettingsregnskapet skal vise valgmuligheter og naturgrenser – ikke bestemme hvor mennesker må bo."
      },
      {
        "id": "forklaring-manifest-pilot-lokal-laring",
        "alt": "Beboere og fagfolk prøver ut en lokal forsyningsordning, observerer vareflyten og gir tilbakemeldinger i et åpent møte.",
        "size": "2K",
        "section_id": "kap47",
        "caption": "Piloter skal prøve ut hvordan rettighetene leveres i praksis, hente erfaringer og forbedre ordningene før de utvides."
      },
      {
        "id": "forklaring-manifest-apen-skole-kveld",
        "alt": "Voksne deltar i kveldsundervisning på en åpen skole, med veiledning og praktiske øvelser i opplyste klasserom.",
        "size": "2K",
        "section_id": "kap26",
        "caption": "Skoler og opplæringssteder skal også kunne brukes om kvelden, slik at voksne kan lære når hverdagen gir rom for det."
      }
    ],
    "grunnlag.html": [
      {
        "id": "forklaring-grunnlag-innhegning-allmenning",
        "alt": "En historisk engelsk allmenning blir delt av nye gjerder mens jordbruksfamilier mister tilgangen til et felles beite.",
        "size": "2K",
        "section_id": "k6",
        "caption": "Innhegning av engelske allmenninger gjorde tidligere felles jord til privat eiendom og endret menneskers livsgrunnlag."
      },
      {
        "id": "forklaring-grunnlag-ostrom-vann",
        "alt": "Bønder i en fjellandsby fordeler vann gjennom et felles vanningssystem og vedlikeholder kanalene sammen.",
        "size": "2K",
        "section_id": "k16",
        "caption": "Brukerne av en allmenning kan selv lage regler, vedlikeholde ressursen og løse konflikter sammen."
      },
      {
        "id": "forklaring-grunnlag-digitalt-datauttak",
        "alt": "En person bruker mobilen mens spor av aktivitet samles i et stort plattformsystem som vedkommende ikke kan se inn i.",
        "size": "2K",
        "section_id": "k28",
        "caption": "Teksten beskriver hvordan digitale plattformer kan samle inn atferdsdata og gjøre oppmerksomhet til en ressurs som andre kontrollerer."
      },
      {
        "id": "forklaring-grunnlag-okologisk-ramme",
        "alt": "En liten by og verksteder ligger innenfor et elve- og skoglandskap, med synlige løp for vann, materialbruk og reparasjon.",
        "size": "2K",
        "section_id": "k15",
        "caption": "Økologisk økonomi ser verksteder, boliger og handel som deler av naturens endelige vann-, energi- og materialstrømmer."
      },
      {
        "id": "forklaring-grunnlag-samfunnskontrakt-maktbegrensning",
        "alt": "Innbyggere i et offentlig møte stiller spørsmål til et lokalt tilsyn og ser hvordan beslutninger kan prøves og endres.",
        "size": "2K",
        "section_id": "kap20-paradismodellen",
        "caption": "I den omvendte samfunnskontrakten gir innbyggerne avgrensede oppgaver til institusjoner de selv kan kontrollere og stille til ansvar."
      }
    ],
    "okonomisk-modell.html": [
      {
        "id": "forklaring-okonomi-arbeidstid-bidrag",
        "alt": "Frivillige og ansatte i et lokalsamfunn utfører ulike grunnoppgaver fra matutdeling til omsorg og vedlikehold.",
        "size": "2K",
        "section_id": "arbeidstid-kjerne",
        "caption": "Samfunnsinnsatsen fordeles mellom bolig, mat, helse, utdanning og nødvendig drift – og tilpasses livssituasjonen."
      },
      {
        "id": "forklaring-okonomi-apent-ressursregnskap",
        "alt": "Ansatte ved et felles lager registrerer matleveranser, kontrollerer gjenbrukbare beholdere og følger opp ressursflyten.",
        "size": "2K",
        "section_id": "apent-regnskap",
        "caption": "Lager, leveranser, ressursbruk og ombruk registreres slik at fellesskapet kan kontrollere forsyningen."
      },
      {
        "id": "forklaring-okonomi-rehabilitering-bolig",
        "alt": "Håndverkere oppgraderer en eldre boligblokk, omgjør eksisterende rom og gjenbruker byggematerialer i stedet for å rive.",
        "size": "2K",
        "section_id": "boligordning",
        "caption": "Boligplanen prioriterer rehabilitering og ombygging av eksisterende hus før målrettet nybygg."
      },
      {
        "id": "forklaring-okonomi-avvik-tiltak-revisjon",
        "alt": "En lokal boliggruppe undersøker forsinket rehabilitering, omfordeler ressurser og følger opp pågående byggearbeid.",
        "size": "2K",
        "section_id": "styringslogikk",
        "caption": "Når boligleveransen ligger etter planen, skal avvik oppdages, tiltak endres og resultatet kontrolleres i neste periode."
      },
      {
        "id": "forklaring-okonomi-produktkort-kvalitet",
        "alt": "Fagfolk tester et hverdagsprodukt på et lokalt kvalitetslaboratorium og undersøker materialene og holdbarheten.",
        "size": "2K",
        "section_id": "kvalitet-registrering",
        "caption": "Åpne produktkort og kvalitetsprøver skal gjøre det mulig å kontrollere materialer, holdbarhet og sikkerhet før varer tas i bruk."
      }
    ],
    "paradismodellen-i-praksis.html": [
      {
        "id": "paradis-nabolaget",
        "alt": "Grønne lave bolighus, trikk, marked, lek, felles hager og bibliotek i et bilfritt nabolag ved naturen.",
        "size": "2K",
        "width": 1672,
        "height": 941,
        "section_id": "paradis-nabolaget",
        "caption": "Et mulig Paradis-nabolag: egne hjem, grønne møteplasser, lokale tjenester og kollektivtransport i samme nærmiljø."
      }
    ]
  }
};
  const usedOnPage = new Set();
  const HOME_PROJECT_BANNERS = {
    "Oslo Old Boys": "Oslooldboys.html",
    "Lesebiblioteket": "Lesebiblioteket.html"
  };
  const HOME_PROJECT_PAGES = new Set(Object.values(HOME_PROJECT_BANNERS));
  // Bare illustrasjoner med en tydelig forklaringsoppgave vises. De andre er arkivert.
  const VISIBLE_SCENE_IDS = new Set([
      "politikk-bolig-hjem-ikke-spekulasjon",
      "politikk-transport-kollektiv-og-korridorer",
      "forklaring-manifest-mekling-reparasjon",
      "forklaring-grunnlag-innhegning-allmenning",
      "forklaring-grunnlag-ostrom-vann",
      "forklaring-okonomi-apent-ressursregnskap",
      "prosjekt-oldboys-trening-uten-press",
      "prosjekt-lesebiblioteket-apent-leserom",
      "kort-paradisavisa-kritisk-samtale",
      "kort-aha-kunnskapsnettverk",
      "kort-lesebiblioteket-samtalesirkel",
      "kort-oldboys-lavterskel-aktivitet",
      "kort-glasshus-vinterlys",
      "kort-bilfri-by-gronn-gate",
      "kort-caravan-trygg-sykkelvei",
      "kort-basicmarked-grunnforsyning",
      "kort-teorien-om-lyset-bevissthet",
      "paradis-nabolaget",
      "politikk-mat-lokal-matsikkerhet",
      "politikk-utdanning-praksis-og-teori",
      "politikk-kultur-alle-kan-skape",
      "prosjekt-glasshus-vinterpaviljong"
]);


  function makePicture(scene, className, {eager = false} = {}) {
    if (!scene || !VISIBLE_SCENE_IDS.has(scene.id)) return null;
    if (usedOnPage.has(scene.id)) {
      console.error("Illustrasjonen kan kun brukes én gang:", scene.id);
      return null;
    }
    usedOnPage.add(scene.id);
    const img = document.createElement("img");
    const source = id => new URL(id + ".webp", imageFolder).href;
    img.className = className;
    img.src = source(scene.id);
    img.srcset = source(scene.id + "-960") + " 960w, " + source(scene.id)
      + (" " + (scene.width || (scene.size === "1K" ? 1024 : 1920)) + "w");
    img.sizes = /vision-(?:home|banner|page)-image/.test(className)
      ? "100vw"
      : /vision-card-art/.test(className)
        ? "(max-width: 700px) 100vw, (max-width: 1200px) 50vw, 600px"
        : "(max-width: 700px) 100vw, (max-width: 1100px) 85vw, 950px";
    img.width = scene.width || (scene.size === "1K" ? 1024 : 1920);
    img.height = scene.height || (scene.size === "1K" ? 576 : 1080);
    img.alt = scene.alt;
    img.loading = eager ? "eager" : "lazy";
    img.decoding = "async";
    if (eager) img.fetchPriority = "high";
    return img;
  }

  function addTopImage(scene) {
    const main = document.getElementById("main-content");
    if (!main || !scene) return;
    const img = makePicture(scene, "vision-page-image", {eager:true});
    if (!img) return;
    const figure = document.createElement("figure");
    figure.className = "vision-page-art";
    figure.append(img);
    main.before(figure);
  }
  function addBanner(scene) {
    const banner = document.querySelector(".project-banner");
    if (!banner || !scene) return;
    const img = makePicture(scene, "vision-banner-image", {eager:true});
    if (!img) return;
    banner.classList.add("vision-illustrated-banner");
    banner.prepend(img);
  }

  if (page === "index.html" && !isProject) {
    const hero = document.querySelector(".hero");
    if (hero) {
      const img = makePicture(SCENE_ASSIGNMENTS.homeHero, "vision-home-image", {eager:true});
      if (img) {
        hero.classList.add("vision-home-hero");
        hero.prepend(img);
      }
    }
    // Forsiden viser egne, unike prosjektbilder som ikke brukes på detaljsidene.
    document.querySelectorAll(".projects.home .project").forEach(card => {
      const name = card.querySelector("h3")?.textContent?.trim();
      const detailPage = HOME_PROJECT_BANNERS[name];
      if (!detailPage) return;
      const scene = SCENE_ASSIGNMENTS.projectBanners[detailPage];
      const image = makePicture(scene, "vision-card-art");
      const monogram = card.querySelector(".home-project-icon");
      if (image && monogram) {
        monogram.replaceWith(image);
        card.classList.add("has-project-image");
      }
    });
    // Prinsipp- og idégrunnlagskortene fortsetter som rene tekstkort.
  }

  if (page === "prosjekter.html" && !isProject) {
    addTopImage(SCENE_ASSIGNMENTS.pageHeroes[page]);
    document.querySelectorAll(".projects-page .project").forEach(card => {
      const name = card.querySelector("h2,h3")?.textContent?.trim();
      const scene = SCENE_ASSIGNMENTS.projectCards[name];
      if (!scene) return;
      const img = makePicture(scene, "vision-card-art");
      const existing = card.querySelector(".project-visual, .project-monogram, img");
      if (img && existing) {
        existing.replaceWith(img);
        card.classList.add("has-project-image");
      } else if (img) {
        card.querySelector("a")?.prepend(img);
        card.classList.add("has-project-image");
      }
    });
  }

  if (isProject) {
    // De to motivene på forsiden kan ikke brukes på prosjektets detaljside.
    if (!HOME_PROJECT_PAGES.has(page)) addBanner(SCENE_ASSIGNMENTS.projectBanners[page]);
  } else if (SCENE_ASSIGNMENTS.pageBanners[page]) {
    addBanner(SCENE_ASSIGNMENTS.pageBanners[page]);
  } else if (page !== "index.html" && page !== "prosjekter.html") {
    addTopImage(SCENE_ASSIGNMENTS.pageHeroes[page]);
  }

  if (page === "politikk.html") {
    Object.entries(SCENE_ASSIGNMENTS.policyTopics).forEach(([sectionId,scene]) => {
      const section = document.getElementById(sectionId);
      const heading = section?.querySelector("h2");
      if (!heading) return;
      const img = makePicture(scene, "vision-topic-art");
      if (!img) return;
      const figure = document.createElement("figure");
      figure.className = "vision-topic-figure";
      figure.append(img);
      if (scene.caption) {
        const caption = document.createElement("figcaption");
        caption.textContent = scene.caption;
        figure.append(caption);
      }
      heading.after(figure);
    });
  }


  // Forklaringsbilder plasseres bare ved sitt dokumenterte avsnitt.
  // Verken kapitlenes posisjon eller generelle ord kan velge bildemotiv.
  for (const item of SCENE_ASSIGNMENTS.documentFigures[page] || []) {
    const section = document.getElementById(item.section_id);
    const heading = section?.querySelector("h2, h3");
    if (!heading || section.querySelector(".vision-document-figure")) continue;
    const img = makePicture(item, "vision-document-image");
    if (!img) continue;
    const figure = document.createElement("figure");
    figure.className = "vision-document-figure";
    figure.append(img);
    const caption = document.createElement("figcaption");
    caption.textContent = item.caption;
    figure.append(caption);
    heading.after(figure);
  }

  // Dokumentene skal ikke ha tilfeldige motivpauser basert på kapitlenes posisjon.
  // Først forstå teksten, deretter bestille motiv, og så knytte bildet til det ene avsnittet.
}
