/**
 * Lett illustrasjonskontroll (#23), uten avhengigheter eller tung regresjon.
 */
import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const errors = [];
const assert = (condition, message) => { if (!condition) errors.push(message); };
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const subjects = ["visjon-by-land","bilfri-by","gronne-hjem","smabruk-natur","kunnskap-helse","kultur-fellesskap","arbeid-teknologi"];
const assetDir = path.join(root, "assets", "illustrasjoner");
const artFiles = subjects.flatMap(name => [name + ".webp", name + "-960.webp"]);
for (const name of artFiles) {
  const file = path.join(assetDir,name);
  if (!fs.existsSync(file)) { errors.push("Mangler WEBP: " + name); continue; }
  const b = fs.readFileSync(file);
  assert(b.subarray(0,4).toString() === "RIFF" && b.subarray(8,12).toString() === "WEBP", name + ": ikke gyldig WEBP");
  assert(b.length > 50000, name + ": uventet liten bildefil");
}
assert(script.includes('name + "-960"') && script.includes("img.srcset") && script.includes("rasterScenes.has(name)"),
  "Responsive bildekilder mangler");

assert(/initIllustratedSite\(\);/.test(script), "Illustrasjonsoppstart mangler");
assert(/new URL\("assets\/illustrasjoner\/", script\.src\)/.test(script), "Stier må være relative til script.js");
assert(/loading = eager \? "eager" : "lazy"/.test(script), "Lazy loading mangler");
assert(/img\.alt = alt/.test(script), "Alt-tekst mangler");
for (const name of subjects) {
  const file = path.join(assetDir, name + ".svg");
  if (!fs.existsSync(file)) { errors.push("Mangler: " + name + ".svg"); continue; }
  const svg = fs.readFileSync(file, "utf8");
  assert(svg.startsWith("<svg "), name + ": feil SVG-start");
  assert(svg.trimEnd().endsWith("</svg>"), name + ": SVG er ikke lukket");
  assert((svg.match(/<svg\b/g) || []).length === 1, name + ": flere SVG-roetter");
  assert(/viewBox="0 0 1600 700"/.test(svg), name + ": feil format");
  assert(!/<(?:script|foreignObject)\b/i.test(svg), name + ": aktivt SVG-innhold");
  assert(!/(?:href|xlink:href)\s*=\s*["']https?:/i.test(svg), name + ": ekstern avhengighet");
  assert(!/<text\b/i.test(svg), name + ": bildetekst skal ligge i HTML");
  assert(script.includes('"' + name + '"'), name + ": motivet er ikke i sidemapping");
}
const pages = ["index.html","politikk.html","manifest.html","grunnlag.html","okonomisk-modell.html","prosjekter.html","om.html","kontakt.html","404.html"];
for (const name of pages) {
  assert(script.includes('"' + name + '"'), name + ": mangler illustrasjonsmapping");
  const html = fs.readFileSync(path.join(root, name), "utf8");
  assert(/<script src="(?:\/Paradispartiet\/)?script\.js"><\/script>/.test(html), name + ": mangler felles script");
}
for (const name of fs.readdirSync(path.join(root, "Prosjekter")).filter(n => n.endsWith(".html"))) {
  const html = fs.readFileSync(path.join(root, "Prosjekter", name), "utf8");
  assert(/<script src="\.\.\/script\.js"><\/script>/.test(html), "Prosjekter/" + name + ": mangler script");
}
assert(css.includes(".vision-home-hero"), "Forside-CSS mangler");
assert(css.includes(".vision-topic-art"), "Tema-CSS mangler");
assert(css.includes("@media (max-width:700px)"), "Mobil-CSS mangler");
if (errors.length) {
  console.error("Illustrasjonskontroll feilet:\n" + errors.map(e => " - " + e).join("\n"));
  process.exitCode = 1;
} else console.log("OK: sju illustrasjonsmotiver, 14 WEBP-varianter og hovedsidene kontrollert.");
