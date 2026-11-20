#!/usr/bin/env node
/* ParadisDB reserve cron: only probe providers if the latest sanitized snapshot needs it. */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const MAX_AGE_MS = 18 * 60 * 60 * 1000;

/** A successful current-day check makes the evening reserve run unnecessary. */
export function isFreshProviderSnapshot(snapshot, now = Date.now()) {
  if (!snapshot || snapshot.schema_version !== 1 || snapshot.metadata_only !== true ||
      !snapshot.provider_checks || typeof snapshot.provider_checks !== "object" ||
      Array.isArray(snapshot.provider_checks)) return false;
  const generated = Date.parse(snapshot.generated_at);
  if (!Number.isFinite(generated) || generated > now || now - generated > MAX_AGE_MS) return false;
  const checks = Object.values(snapshot.provider_checks);
  if (checks.length === 0 ||
      checks.some((c) => !c || ["lookup_failed", "not_found_in_scope"].includes(c.result))) return false;
  // Never skip a reserve probe based only on a recently published, unsuccessful snapshot.
  return checks.some((c) => c.result === "verified" &&
    Number.isFinite(Date.parse(c.checked_at)) &&
    Date.parse(c.checked_at) <= now &&
    Date.parse(c.checked_at) >= generated - 60 * 1000);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const snapshot = JSON.parse(await readFile(resolve(process.argv[2]), "utf8"));
    if (isFreshProviderSnapshot(snapshot)) {
      console.log("Recent successful provider check: reserve probe skipped.");
    } else {
      console.log("Missing, failed or stale provider check: reserve probe required.");
      process.exitCode = 1;
    }
  } catch {
    // An absent/invalid snapshot must not suppress the reserve check.
    console.log("Provider snapshot unavailable: reserve probe required.");
    process.exitCode = 1;
  }
}
