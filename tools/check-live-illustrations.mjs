/**
 * Kontroller at bildereformen er deployet på den offentlige GitHub Pages-adressen.
 * Leser bildeplanen fra repo og bruker bare HTTP HEAD på bildefiler.
 * Kjør: node tools/check-live-illustrations.mjs
 */
import fs from "node:fs";

const origin = "https://paradispartiet.github.io/Paradispartiet/";
const plan = JSON.parse(fs.readFileSync("docs/ILLUSTRASJONSPLAN.json", "utf8"));
const scenes = plan.images;
const errors = [];
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

const [indexResponse, scriptResponse] = await Promise.all([
  request(origin + "index.html", "GET"),
  request(origin + "script.js", "GET")
]);
if (!indexResponse.ok) errors.push("Offentlig forside: HTTP " + indexResponse.status);
if (!scriptResponse.ok) errors.push("Offentlig script.js: HTTP " + scriptResponse.status);
const index = indexResponse.ok ? await indexResponse.text() : "";
const script = scriptResponse.ok ? await scriptResponse.text() : "";
if (!index.includes('script src="script.js"'))
  errors.push("Forsiden har ikke forventet JavaScript-inkludering");
if (!script.includes("const SCENE_ASSIGNMENTS ="))
  errors.push("Offentlig side bruker fortsatt gammel bildevisning");
if (script.includes("chooseSubject("))
  errors.push("Offentlig side har fortsatt automatisk temagjenbruk");

const uniqueIds = new Set();
for (const scene of scenes) {
  if (uniqueIds.has(scene.id)) errors.push("Duplisert motiv-ID i bildeplan: " + scene.id);
  uniqueIds.add(scene.id);
  if (!script.includes('"id": "' + scene.id + '"'))
    errors.push("Illustrasjonen er ikke koblet i publisert JavaScript: " + scene.id);
}
const paths = scenes.flatMap(({id}) => [
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
    " WEBP-filer fra " + scenes.length + " unike illustrasjoner verifisert.");
}
