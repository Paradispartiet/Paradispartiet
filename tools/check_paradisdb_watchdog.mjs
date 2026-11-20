#!/usr/bin/env node
/* ParadisDB watchdog: read only the public, allowlisted snapshot. No database access. */
import { readFile, appendFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CUTOFF_HOUR_UTC = 20;
const CUTOFF_MINUTE_UTC = 17;

function validTimestamp(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : null;
}

export function inspectSnapshot(snapshot, inventory, now = new Date()) {
  const reasons = [];
  if (!Number.isFinite(now.getTime())) throw Error("Invalid clock");
  const expected = new Date(now.getTime());
  if (now.getUTCHours() < CUTOFF_HOUR_UTC ||
      (now.getUTCHours() === CUTOFF_HOUR_UTC && now.getUTCMinutes() < CUTOFF_MINUTE_UTC)) {
    expected.setUTCDate(expected.getUTCDate() - 1);
  }
  const expectedDay = expected.toISOString().slice(0, 10);

  if (snapshot?.schema_version !== 1 || snapshot.metadata_only !== true ||
      snapshot.source !== "docs/paradisdb-inventory.json" ||
      !snapshot.provider_checks || typeof snapshot.provider_checks !== "object" ||
      inventory?.schema_version !== 1 || inventory.metadata_only !== true ||
      !Array.isArray(inventory.databases) || inventory.databases.length === 0) {
    return { alert: true, expected_day: expectedDay, reasons: ["Ugyldig statusfil eller databaseregister"] };
  }

  const checkedMs = validTimestamp(snapshot.generated_at);
  if (checkedMs === null) {
    reasons.push("Ingen datert leverandørkontroll er publisert");
  } else if (checkedMs > now.getTime() + 5 * 60 * 1000) {
    reasons.push("Statusfilen har tidsstempel i fremtiden");
  } else if (new Date(checkedMs).toISOString().slice(0, 10) < expectedDay) {
    reasons.push("Ny status mangler for " + expectedDay);
  }

  for (const db of inventory.databases) {
    if (typeof db.id !== "string") {
      reasons.push("Ugyldig database-ID i registeret");
      continue;
    }
    const check = snapshot.provider_checks[db.id];
    if (!check || typeof check.result !== "string") {
      reasons.push(db.id + ": mangler kontrollresultat");
      continue;
    }
    // No credentials, or an explicitly unsupported provider, is not a provider outage.
    if (check.result === "not_configured" || check.result === "not_supported") continue;
    if (check.result !== "verified") {
      reasons.push(db.id + ": kontroll mislyktes (" + check.result.replace(/[^a-z_]/g, "") + ")");
    } else if (check.provider === "supabase" && db.id !== "DB-04" &&
               check.observed_status !== "ACTIVE_HEALTHY") {
      reasons.push(db.id + ": uventet leverandørstatus");
    }
  }

  return { alert: reasons.length > 0, expected_day: expectedDay, reasons };
}

async function main() {
  let result;
  try {
    const [snapshot, inventory] = await Promise.all([
      readFile(resolve(ROOT, "docs/paradisdb-provider-status.json"), "utf8").then(JSON.parse),
      readFile(resolve(ROOT, "docs/paradisdb-inventory.json"), "utf8").then(JSON.parse)
    ]);
    result = inspectSnapshot(snapshot, inventory);
  } catch {
    result = { alert: true, reasons: ["Kunne ikke lese offentlig ParadisDB-status"], expected_day: "" };
  }
  const details = result.reasons.join("; ") || "Statuskontrollen er oppdatert uten registrerte leverandørfeil";
  console.log("ParadisDB watchdog:", result.alert ? "ATTENTION" : "OK", details);
  if (process.env.GITHUB_OUTPUT) {
    await appendFile(process.env.GITHUB_OUTPUT,
      "alert=" + String(result.alert) + "\ndetails=" + details + "\n", "utf8");
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
