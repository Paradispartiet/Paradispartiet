/**
 * Statisk kvalitetskontroll for Paradispartiets GitHub Pages-nettsted.
 * Kjør med "node tools/check-site.mjs" uten ekstra avhengigheter.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const htmlFiles = [
  ...fs.readdirSync(root).filter(name => name.endsWith(".html")),
  ...(fs.existsSync(path.join(root, "Prosjekter"))
    ? fs.readdirSync(path.join(root, "Prosjekter"))
        .filter(name => name.endsWith(".html"))
        .map(name => path.join("Prosjekter", name))
    : [])
];
const errors = [];
const content = new Map(htmlFiles.map(name => [name, fs.readFileSync(path.join(root, name), "utf8")]));
const idsByFile = new Map();
for (const [name, html] of content) {
  const ids = [...html.matchAll(/\bid=(["'])(.*?)\1/g)].map(match => match[2]);
  const duplicate = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicate.length) errors.push(name + ": dupliserte ID-er: " + [...new Set(duplicate)].join(", "));
  idsByFile.set(name, new Set(ids));
}

const external = /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i;
for (const [name, html] of content) {
  for (const match of html.matchAll(/\b(?:href|src)=(["'])(.*?)\1/g)) {
    const reference = match[2].trim();
    if (!reference || external.test(reference)) continue;
    const [beforeHash, anchor] = reference.split("#");
    const urlPart = beforeHash.split("?")[0];
    let relative;
    try {
      relative = decodeURIComponent(urlPart);
    } catch {
      errors.push(name + ": ugyldig URL-koding: " + reference);
      continue;
    }
    // Site-root links resolve within this project repository on GitHub Pages.
    if (relative === "/Paradispartiet/" || relative === "/Paradispartiet") relative = "index.html";
    else if (relative.startsWith("/Paradispartiet/")) relative = relative.slice("/Paradispartiet/".length);
    else if (relative.startsWith("/")) {
      errors.push(name + ": uventet absolutt lenke: " + reference);
      continue;
    }
    const target = relative
      ? path.normalize(urlPart.startsWith("/") ? relative : path.join(path.dirname(name), relative))
      : name;
    const targetAbs = path.resolve(root, target);
    const withinRoot = targetAbs === root || targetAbs.startsWith(root + path.sep);
    if (!withinRoot || !fs.existsSync(targetAbs)) {
      errors.push(name + ": mangler " + reference);
      continue;
    }
    if (anchor) {
      const htmlTarget = fs.statSync(targetAbs).isDirectory()
        ? path.join(target, "index.html")
        : target;
      if (idsByFile.has(htmlTarget) && !idsByFile.get(htmlTarget).has(decodeURIComponent(anchor))) {
        errors.push(name + ": ankeret finnes ikke: " + reference);
      }
    }
  }
}

if (errors.length) {
  console.error("Nettstedsjekk feilet:\n" + errors.map(err => " - " + err).join("\n"));
  process.exitCode = 1;
} else {
  console.log("OK: " + htmlFiles.length + " HTML-sider kontrollert, ingen brutte lokale lenker eller ID-er.");
}