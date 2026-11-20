/**
 * Kontroller at bildereformen er deployet på den offentlige GitHub Pages-adressen.
 * Leser bildeplanen fra repo og bruker bare HTTP HEAD på bildefiler.
 * Kjør: node tools/check-live-illustrations.mjs
 */
import fs from "node:fs";

const origin = "https://paradispartiet.github.io/Paradispartiet/";
const plan = JSON.parse(fs.readFileSync("docs/ILLUSTRASJONSPLAN.json", "utf8"));
const scenes = plan.images;
const activeScenes = scenes.filter(scene => scene.display === "active");
const archivedScenes = scenes.filter(scene => scene.display === "archived");
const errors = [];
if (activeScenes.length + archivedScenes.length !== scenes.length)
  errors.push("Bilderegisteret har motiver uten gyldig visningsstatus");
const timeout = ms => AbortSignal.timeout(ms);

async function request(url, method = "HEAD") {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        cache: "no-store",
        redirect: "follow",
        signal: timeout(20000)
      });
      if (response.ok || (response.status < 500 && response.status !== 429)) return response;
      lastError = new Error("HTTP " + response.status);
    } catch (error) { lastError = error; }
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 600 * (attempt + 1)));
  }
  throw lastError;
}

const [indexResponse, scriptResponse, policyResponse, cssResponse, avisaProjectResponse] = await Promise.all([
  request(origin + "index.html", "GET"),
  request(origin + "script.js", "GET"),
  request(origin + "politikk.html", "GET"),
  request(origin + "styles.css", "GET"),
  request(origin + "Prosjekter/Paradisavisa.html", "GET")
]);
if (!indexResponse.ok) errors.push("Offentlig forside: HTTP " + indexResponse.status);
if (!scriptResponse.ok) errors.push("Offentlig script.js: HTTP " + scriptResponse.status);
const index = indexResponse.ok ? await indexResponse.text() : "";
const script = scriptResponse.ok ? await scriptResponse.text() : "";
const policyHtml = policyResponse.ok ? await policyResponse.text() : "";
const css = cssResponse.ok ? await cssResponse.text() : "";
if (!policyResponse.ok) errors.push("Offentlig politikkside: HTTP " + policyResponse.status);
if (!cssResponse.ok) errors.push("Offentlig CSS: HTTP " + cssResponse.status);
const avisaProjectHtml = avisaProjectResponse.ok ? await avisaProjectResponse.text() : "";
if (!avisaProjectResponse.ok)
  errors.push("Offentlig Paradisavisa-prosjektside: HTTP " + avisaProjectResponse.status);

// Uavhengig av GitHub-koden: kontroller lenker i den faktiske publiserte HTML-en.
for (const [pageName, html] of [
  ["index.html", index],
  ["Prosjekter/Paradisavisa.html", avisaProjectHtml]
]) {
  let avisaLinkFound = false;
  for (const link of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = link[0];
    const href = tag.match(/\bhref=(["'])(.*?)\1/i)?.[2] || "";
    const target = tag.match(/\btarget=(["'])(.*?)\1/i)?.[2] || "";
    if (target !== "_blank") continue;
    if (!/^(?:https?:)?\/\//i.test(href)) continue;
    const rel = (tag.match(/\brel=(["'])(.*?)\1/i)?.[2] || "")
      .toLowerCase().split(/\s+/);
    if (!rel.includes("noopener"))
      errors.push(pageName + ": offentlig ny-fane-lenke mangler noopener: " + href);
    if (href === "https://paradispartiet.github.io/Paradisavisa/")
      avisaLinkFound = true;
  }
  if (html && !avisaLinkFound)
    errors.push(pageName + ": forventet ny-fane-lenke til Paradisavisa mangler");
}
if (!index.includes('script src="script.js"'))
  errors.push("Forsiden har ikke forventet JavaScript-inkludering");
if (!script.includes("const SCENE_ASSIGNMENTS ="))
  errors.push("Offentlig side bruker fortsatt gammel bildevisning");
if (script.includes("chooseSubject("))
  errors.push("Offentlig side har fortsatt automatisk temagjenbruk");
if (!script.includes("if (!scene || !VISIBLE_SCENE_IDS.has(scene.id)) return null;"))
  errors.push("Offentlig side mangler eksplisitt visningssperre for arkiverte bilder");

// De 50 bildene kan fortsatt ligge i repoet. Bare eksplisitt aktive
// motiv skal vises eller lastes på offentlig side.
const marker = "const VISIBLE_SCENE_IDS = new Set(";
const start = script.indexOf(marker);
const end = start < 0 ? -1 : script.indexOf("]);", start);
let publishedActive = [];
if (start < 0 || end < 0) {
  errors.push("Offentlig side mangler liste over aktive illustrasjoner");
} else {
  try {
    publishedActive = JSON.parse(script.slice(start + marker.length, end + 1));
  } catch (error) {
    errors.push("Kunne ikke lese aktive illustrasjoner fra offentlig side: " + error.message);
  }
}
const expectedActive = activeScenes.map(scene => scene.id).sort();
if (publishedActive.length !== new Set(publishedActive).size)
  errors.push("Offentlig side har dupliserte ID-er i listen over aktive bilder");
if (JSON.stringify([...publishedActive].sort()) !== JSON.stringify(expectedActive))
  errors.push("Offentlig visning avviker fra de " + expectedActive.length + " aktive motivene i registeret");

const uniqueIds = new Set();
for (const scene of scenes) {
  if (uniqueIds.has(scene.id)) errors.push("Duplisert motiv-ID i bildeplan: " + scene.id);
  uniqueIds.add(scene.id);
  if (!script.includes('"id": "' + scene.id + '"'))
    errors.push("Illustrasjonen er ikke koblet i publisert JavaScript: " + scene.id);
}
// Verifiser spesielt synlige bildetekster som kom etter oppryddingen.
// En tilgjengelig bildefil alene betyr ikke at ny tekst er publisert.
const policyScenes = activeScenes.filter(scene => scene.slot.startsWith("topic:"));
const assignmentMatch = script.match(/const SCENE_ASSIGNMENTS = (\{[\s\S]*?\});\s*const usedOnPage/);
let policyAssignments = {};
if (!assignmentMatch) {
  errors.push("Offentlig script.js mangler lesbar politikkillustrasjon-mapping");
} else {
  try {
    policyAssignments = JSON.parse(assignmentMatch[1]).policyTopics || {};
  } catch (error) {
    errors.push("Offentlig politikkillustrasjon-mapping er ugyldig: " + error.message);
  }
}
if (policyScenes.length && (
  !script.includes('figure.className = "vision-topic-figure"') ||
  !script.includes("caption.textContent = scene.caption") ||
  !css.includes(".vision-topic-figure figcaption")
)) errors.push("Offentlig politikk mangler synlige bildetekster eller tilhørende stil");
for (const scene of policyScenes) {
  const sectionId = scene.slot.slice("topic:".length);
  const published = policyAssignments[sectionId];
  if (!policyHtml.includes('id="' + sectionId + '"'))
    errors.push("Offentlig politikk mangler bildekoblet seksjon " + sectionId);
  if (!scene.caption || published?.caption !== scene.caption)
    errors.push("Offentlig bildeforklaring mangler eller avviker for " + scene.id);
  if (published?.id !== scene.id || published?.alt !== scene.alt)
    errors.push("Offentlig illustrasjon/alt-tekst avviker for " + scene.id);
}
if (!policyScenes.length)
  errors.push("Ingen aktive politikkbilder i bildeplanen — kontrollen har ingen mål");

// Kontroller også at alle eksakte dokumentavsnitt finnes i de publiserte
// dokumentene, ikke bare i GitHub-koden.
const sectionsByPage = Object.groupBy(
  activeScenes.filter(scene => scene.section_id), scene => scene.page
);
await Promise.all(Object.entries(sectionsByPage).map(async ([page, expected]) => {
  try {
    const response = await request(origin + page, "GET");
    if (!response.ok) {
      errors.push(page + ": HTTP " + response.status);
      return;
    }
    const html = await response.text();
    for (const item of expected) {
      if (!html.includes('id="' + item.section_id + '"'))
        errors.push(page + ": publisert dokument mangler avsnitt " + item.section_id);
    }
  } catch (error) {
    errors.push(page + ": " + String(error.message || error));
  }
}));

const paths = activeScenes.flatMap(({id}) => [
  "assets/illustrasjoner/" + id + ".webp",
  "assets/illustrasjoner/" + id + "-960.webp"
]);
let checked = 0;
const concurrency = 7;
let cursor = 0;
async function worker() {
  while (cursor < paths.length) {
    const p = paths[cursor++];
    try {
      const response = await request(origin + p);
      if (!response.ok) {
        errors.push(p + ": HTTP " + response.status);
      } else {
        const type = response.headers.get("content-type") || "";
        if (!type.includes("webp")) errors.push(p + ": uventet innholdstype " + type);
        const length = Number(response.headers.get("content-length") || 0);
        if (length && length < 15000) errors.push(p + ": uventet liten publisert fil");
        checked++;
      }
    } catch (e) { errors.push(p + ": " + String(e.message || e)); }
  }
}
await Promise.all(Array.from({length:concurrency}, () => worker()));
if (errors.length) {
  console.error("Publiseringskontrollen feilet:\n" + errors.map(s => " - " + s).join("\n"));
  process.exitCode = 1;
} else {
  console.log("OK: Live forside/script.js og " + checked + " av " + paths.length +
    " WEBP-filer fra " + activeScenes.length + " aktive illustrasjoner verifisert; " +
    archivedScenes.length + " arkiverte motiver er ikke i bruk; " +
    policyScenes.length + " offentlig publiserte politikkbildetekster stemmer; " +
    "Paradisavisa-lenker kontrollert på forside og prosjektside.");
}
