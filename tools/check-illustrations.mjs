/**
 * Kvalitetsport for Paradispartiets innholdsillustrasjoner.
 * Hvert bilde skal ha kun én plassering i hele nettstedet.
 * Kjør: node tools/check-illustrations.mjs
 */
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const errors = [];
const assert = (value, message) => { if (!value) errors.push(message); };
const read = file => fs.readFileSync(path.join(root,file), "utf8");
const script = read("script.js");
const css = read("styles.css");
const plan = JSON.parse(read("docs/ILLUSTRASJONSPLAN.json"));
const m = script.match(/const SCENE_ASSIGNMENTS = (\{[\s\S]*?\});\s*const usedOnPage/);
assert(!!m, "Mangler eksplisitt bildeplasseringsregister i script.js");
let assignments = null;
try { if(m) assignments = JSON.parse(m[1]); } catch(e) { errors.push("Ugyldig bildeplassering i script.js: " + e.message); }
const parts = assignments ? [
  assignments.homeHero,
  ...Object.values(assignments.pageHeroes),
  ...Object.values(assignments.pageBanners),
  ...Object.values(assignments.projectBanners),
  ...Object.values(assignments.projectCards),
  ...Object.values(assignments.policyTopics),
  ...Object.values(assignments.documentFigures || {}).flat()
] : [];
const marker = "const VISIBLE_SCENE_IDS = new Set(";
const visibleStart = script.indexOf(marker);
const visibleEnd = visibleStart < 0 ? -1 : script.indexOf("]);", visibleStart);
assert(visibleStart >= 0 && visibleEnd >= 0, "Mangler godkjent liste for synlige motiver");
let visibleIds = [];
try {
  if(visibleStart >= 0 && visibleEnd >= 0)
    visibleIds = JSON.parse(script.slice(visibleStart + marker.length, visibleEnd + 1));
} catch (e) { errors.push("Ugyldig synlig motivliste: " + e.message); }
const visible = new Set(visibleIds);
assert(visible.size === visibleIds.length, "Dubletter i synlige motiv-ID-er");
const counts = new Map();
for (const scene of parts) {
  if (!scene?.id) { errors.push("En plassering mangler bilde-ID"); continue; }
  counts.set(scene.id, (counts.get(scene.id)||0)+1);
  assert(scene.alt?.trim().length > 18, scene.id + " mangler forklarende alt-tekst");
}
for (const [id,n] of counts) assert(n===1, id + " er brukt " + n + " ganger: én bildefil får kun én plass!");
for(const id of visible) assert(counts.has(id), id + " er aktiv, men finnes ikke i bilderegisteret");
assert(parts.length===plan.images.length,
  "Register/sidekode avviker: "+parts.length+" plasseringer mot "+plan.images.length+" bestilte bilder");
const ids=new Set(), slots=new Set();
for (const scene of plan.images) {
  assert(!ids.has(scene.id), scene.id + " duplisert i bilderegister");
  ids.add(scene.id);
  const slot=scene.page+"#"+scene.slot;
  assert(!slots.has(slot), slot+" duplisert i register");
  slots.add(slot);
  assert(counts.has(scene.id), scene.id+" er ikke knyttet til noen side");
  assert((scene.display === "active") === visible.has(scene.id),
    scene.id + " visningsstatus avviker mellom register og nettside");
  assert(["active","archived"].includes(scene.display),
    scene.id + " må være aktiv eller arkivert");
  if (scene.section_id) {
    assert(scene.slot === "inline:" + scene.section_id, scene.id + " feil avsnitts-ID");
    assert(read(scene.page).includes('id="' + scene.section_id + '"'), scene.id + " seksjonen finnes ikke");
    assert(scene.caption?.trim().length > 35, scene.id + " mangler forklarende bildetekst");
  }

  assert(!!scene.basis && scene.basis.length>15, scene.id+" mangler tekstbegrunnelse");
  assert(!!scene.motiv && scene.motiv.length>80, scene.id+" mangler konkret motiv");
  const size=scene.size;
  assert(["1K","2K"].includes(size), scene.id+" feil bildestørrelse");
  for(const suffix of ["","-960"]) {
    const filename="assets/illustrasjoner/"+scene.id+suffix+".webp";
    if(!fs.existsSync(path.join(root,filename))) {errors.push("Mangler: "+filename);continue}
    const buf=fs.readFileSync(path.join(root,filename));
    assert(buf.subarray(0,4).toString()==="RIFF" && buf.subarray(8,12).toString()==="WEBP",filename+" er ikke WEBP");
    assert(buf.length>15_000,filename+" mistenkelig liten bildefil");
  }
}
assert(!script.includes("chooseSubject("), "Gammel automatisk temagjenbruk skal være fjernet");
assert(!script.includes("rasterScenes"), "Gamle gjenbrukte WebP-motiver er fortsatt koblet");
assert(script.includes("usedOnPage.has(scene.id)"), "Manglende kjøretidsvern mot bildeduplikat");
assert(script.includes("new URL(\"assets/illustrasjoner/\", sourceScript.src)"), "Feil relative bildestier");
assert(css.includes(".vision-home-hero") && css.includes(".vision-topic-art"), "Illustrasjons-CSS mangler");
const existingProjects=fs.readdirSync(path.join(root,"Prosjekter")).filter(x=>x.endsWith(".html"));
for(const file of existingProjects) {
  assert(!!assignments?.projectBanners?.[file], "Prosjektsiden mangler unikt toppbilde: "+file);
}
const cardHtml=read("prosjekter.html");
const cardHeadings=[...cardHtml.matchAll(/<h2>([^<]+)<\/h2>/g)].map(x=>x[1]);
for(const card of cardHeadings) assert(!!assignments?.projectCards?.[card], "Prosjektkortet mangler unikt motiv: "+card);
const policyHtml=read("politikk.html");
for(const id of Object.keys(assignments?.policyTopics||{})) {
  assert(policyHtml.includes('id="'+id+'"'),"Bilde er knyttet til ukjent politikkseksjon: "+id);
}
// Statisk HTML skal heller ikke be nettleseren laste samme innholdsbilde
// fra flere sider – også når script.js senere bytter ut bildet.
const staticArtwork = new Map();
for (const page of new Set(plan.images.map(image => image.page))) {
  const html = read(page);
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const src = match[1];
    let pathname;
    try { pathname = new URL(src, "https://example.invalid/" + page).pathname; }
    catch { errors.push(page + ": ugyldig bildesti " + src); continue; }
    // Partiets identitetslogo kan brukes gjentatte ganger som navigasjonssymbol.
    if (/\/(?:logo(?:-full)?\.svg|favicon\.svg|paradispartiet-p-(?:2026|favicon)\.webp)$/i.test(pathname)) continue;
    const occurrences = staticArtwork.get(pathname) || [];
    occurrences.push(page);
    staticArtwork.set(pathname, occurrences);
  }
}
for (const [src, pages] of staticArtwork) {
  assert(pages.length === 1,
    "Innholdsbilde resirkulert i HTML: " + src + " i " + pages.join(", "));
}

if(errors.length) {
  console.error("ILLUSTRASJONSKONTROLL FEILET:\n"+errors.map(x=>" - "+x).join("\n"));
  process.exitCode=1;
} else {
  console.log("OK: "+visible.size+" synlige illustrasjoner av "+parts.length+" registrerte motiver. Ingen gjenbruk.");
}
