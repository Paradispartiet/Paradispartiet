#!/usr/bin/env node
/* ParadisDB: read-only provider METADATA snapshot. Never query tables or publish tokens. */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INVENTORY = resolve(ROOT, "docs/paradisdb-inventory.json");
const OUTPUT = resolve(ROOT, "docs/paradisdb-provider-status.json");

// Explicitly reviewed project scopes. These identifiers are already public in the canonical register.
// A new database gets "unsupported" until the scope has been reviewed and added here.
const SCOPES = Object.freeze({
  "DB-01": { provider: "supabase", group: "fysen", organization: "conidfhuuaueyoxwklae" },
  "DB-02": { provider: "supabase", group: "fysen", organization: "conidfhuuaueyoxwklae" },
  "DB-03": { provider: "supabase", group: "echonet", organization: "kepuwrsiqhqwfgijzpev" },
  "DB-04": { provider: "supabase", group: "echonet", organization: "kepuwrsiqhqwfgijzpev" },
  "DB-06": { provider: "cloudflare_d1", group: "fysen" },
  "DB-07": { provider: "cloudflare_d1", group: "fysen" }
});

const TOKEN_ENV = Object.freeze({
  echonet: "PARADISDB_SUPABASE_ECHONET_READ_TOKEN",
  fysen: "PARADISDB_SUPABASE_FYSEN_READ_TOKEN"
});

function empty(provider, result, checkedAt = null) {
  return { provider, result, checked_at: checkedAt, observed_status: null };
}

function scopedSupabaseRef(db) {
  const match = db.identity?.match(/\bref ([a-z0-9]{20})\b/);
  if (!match) throw Error("Unparseable canonical Supabase identity");
  return match[1];
}

function scopedD1Identity(db) {
  const match = db.identity?.match(/^([^,]+), ID ([a-f0-9-]{36})$/);
  if (!match) throw Error("Unparseable canonical Cloudflare identity");
  return { name: match[1], uuid: match[2] };
}

async function providerJson(url, token, fetcher) {
  const response = await fetcher(url, {
    method: "GET",
    headers: { Authorization: "Bearer " + token, Accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw Error("Provider responded without approved metadata");
  return response.json();
}

export async function collectProviderStatus(inventory, env, fetcher, clock) {
  if (inventory?.schema_version !== 1 || inventory.metadata_only !== true ||
      !Array.isArray(inventory.databases) || inventory.databases.length > 100) {
    throw Error("Invalid ParadisDB inventory");
  }
  const checkedTime = clock();
  if (!/^\d{4}-\d{2}-\d{2}T/.test(checkedTime)) throw Error("Invalid check timestamp");
  const byId = new Set();
  const provider_checks = {};
  let attempted = false;

  for (const db of inventory.databases) {
    if (!/^DB-\d{2}$/.test(db.id) || byId.has(db.id)) throw Error("Duplicate or invalid DB ID");
    byId.add(db.id);
    const scope = SCOPES[db.id];
    if (!scope) {
      provider_checks[db.id] = empty("not_configured", "not_supported");
      continue;
    }
    if (!String(db.provider_environment).toLowerCase().includes(
      scope.provider === "supabase" ? "supabase" : "cloudflare d1"
    )) throw Error("Provider mismatch for " + db.id);

    if (scope.provider === "supabase") {
      const token = env[TOKEN_ENV[scope.group]];
      if (!token) {
        provider_checks[db.id] = empty("supabase", "not_configured");
        continue;
      }
      attempted = true;
      try {
        // A project-scoped PAT with Project Settings: Read permits GET /v1/projects/{ref}.
        // Do not use the broad /v1/projects listing endpoint with limited PATs.
        const ref = scopedSupabaseRef(db);
        const project = await providerJson("https://api.supabase.com/v1/projects/" + ref, token, fetcher);
        if (!project || project.ref !== ref || project.organization_id !== scope.organization) {
          provider_checks[db.id] = empty("supabase", "not_found_in_scope", checkedTime);
        } else if (!/^[A-Z][A-Z_]{1,49}$/.test(project.status)) {
          provider_checks[db.id] = empty("supabase", "lookup_failed", checkedTime);
        } else {
          provider_checks[db.id] = {
            provider: "supabase", result: "verified",
            checked_at: checkedTime, observed_status: project.status
          };
        }
      } catch {
        provider_checks[db.id] = empty("supabase", "lookup_failed", checkedTime);
      }
    } else {
      const token = env.PARADISDB_CLOUDFLARE_FYSEN_D1_READ_TOKEN;
      const account = env.PARADISDB_CLOUDFLARE_FYSEN_ACCOUNT_ID;
      if (!token || !/^[a-f0-9]{32}$/.test(account || "")) {
        provider_checks[db.id] = empty("cloudflare_d1", "not_configured");
        continue;
      }
      attempted = true;
      try {
        const expected = scopedD1Identity(db);
        const url = "https://api.cloudflare.com/client/v4/accounts/" + account +
                    "/d1/database/" + expected.uuid;
        const response = await providerJson(url, token, fetcher);
        const record = response?.result;
        if (response?.success !== true || record?.uuid !== expected.uuid ||
            record?.name !== expected.name) throw Error("D1 identity mismatch");
        const verified = { provider: "cloudflare_d1", result: "verified",
          checked_at: checkedTime, observed_status: "METADATA_READABLE" };
        if (Number.isSafeInteger(record.num_tables) && record.num_tables >= 0)
          verified.table_count = record.num_tables;
        if (Number.isSafeInteger(record.file_size) && record.file_size >= 0)
          verified.file_size_bytes = record.file_size;
        provider_checks[db.id] = verified;
      } catch {
        provider_checks[db.id] = empty("cloudflare_d1", "lookup_failed", checkedTime);
      }
    }
  }
  return {
    schema_version: 1,
    source: "docs/paradisdb-inventory.json",
    metadata_only: true,
    generated_at: attempted ? checkedTime : null,
    provider_checks
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const inventory = JSON.parse(await readFile(INVENTORY, "utf8"));
    const snapshot = await collectProviderStatus(inventory, process.env, fetch, () => new Date().toISOString());
    // Public JSON: only fixed allowlisted fields, never URLs, credentials or raw provider responses.
    await writeFile(OUTPUT, JSON.stringify(snapshot, null, 2) + "\n", "utf8");
    const values = Object.values(snapshot.provider_checks);
    console.log("ParadisDB metadata check:", values.filter((x) => x.result === "verified").length,
      "verified;", values.filter((x) => x.result === "not_configured").length, "not configured;",
      values.filter((x) => x.result === "lookup_failed").length, "failed");
  } catch {
    console.error("ParadisDB provider metadata check could not complete");
    process.exitCode = 1;
  }
}
