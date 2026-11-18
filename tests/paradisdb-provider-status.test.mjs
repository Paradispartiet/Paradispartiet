import test from "node:test";
import assert from "node:assert/strict";
import { collectProviderStatus } from "../tools/check_paradisdb_providers.mjs";

const NOW = "2026-11-18T13:00:00.000Z";
const inventory = { schema_version: 1, metadata_only: true, databases: [
  { id: "DB-01", identity: "fysen, ref voglczxxtbwcxjrbffbt", provider_environment: "Supabase PostgreSQL" },
  { id: "DB-02", identity: "fysen-recovery-free, ref txaopscyxjvvmwawsphk", provider_environment: "Supabase PostgreSQL" },
  { id: "DB-03", identity: "AHA, ref wshmybqyksrwkawqleiz", provider_environment: "Supabase PostgreSQL" },
  { id: "DB-04", identity: "AHA Staging, ref sstuzwppsheivczyqrim", provider_environment: "Supabase PostgreSQL" },
  { id: "DB-05", identity: "Private Azure", provider_environment: "Azure (disabled)" },
  { id: "DB-06", identity: "paradisdb-fysen-preview, ID 8b6616b4-11df-4ddc-9817-378f51ee0b69", provider_environment: "Cloudflare D1 / test" },
  { id: "DB-07", identity: "paradisdb-fysen-public, ID 882a3393-71c3-43f9-9dec-efc2bbcab409", provider_environment: "Cloudflare D1 / prod" }
] };

function ok(data) { return { ok: true, async json() { return data; } }; }
function fake(requests, responder) {
  return async (url, options) => {
    requests.push({ url, options });
    assert.equal(options.method, "GET");
    assert.equal(options.redirect, "error");
    return responder(url, options);
  };
}
function run(env = {}, fetcher = () => { throw Error("Should not fetch"); }) {
  return collectProviderStatus(inventory, env, fetcher, () => NOW);
}

test("no configured secrets: no network and no fabricated recent status", async () => {
  const result = await run();
  assert.equal(result.generated_at, null);
  assert.deepEqual(Object.keys(result.provider_checks), inventory.databases.map((x) => x.id));
  assert.equal(result.provider_checks["DB-05"].result, "not_supported");
  assert.equal(result.provider_checks["DB-03"].result, "not_configured");
  assert.equal(result.provider_checks["DB-06"].checked_at, null);
  assert.equal(result.metadata_only, true);
});

test("one Supabase GET for scoped EchoNet, sanitizes provider data", async () => {
  const requests = [];
  const token = "example-super-secret-token";
  const results = await run(
    { PARADISDB_SUPABASE_ECHONET_READ_TOKEN: token },
    fake(requests, (url) => {
      assert.equal(url, "https://api.supabase.com/v1/projects");
      return ok([
        { ref: "wshmybqyksrwkawqleiz", organization_id: "kepuwrsiqhqwfgijzpev", status: "ACTIVE_HEALTHY", secret_response_field: "MUST_NOT_LEAK" },
        { ref: "sstuzwppsheivczyqrim", organization_id: "kepuwrsiqhqwfgijzpev", status: "INACTIVE" }
      ]);
    })
  );
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.headers.Authorization, "Bearer " + token);
  assert.equal(results.provider_checks["DB-03"].observed_status, "ACTIVE_HEALTHY");
  assert.equal(results.provider_checks["DB-04"].observed_status, "INACTIVE");
  assert.equal(results.provider_checks["DB-01"].result, "not_configured");
  assert.equal(results.provider_checks["DB-06"].result, "not_configured");
  assert.equal(results.generated_at, NOW);
  const publicOutput = JSON.stringify(results);
  assert.equal(publicOutput.includes(token), false);
  assert.equal(publicOutput.includes("MUST_NOT_LEAK"), false);
});

test("Supabase project in another organization is not claimed as verified", async () => {
  const response = await run(
    { PARADISDB_SUPABASE_FYSEN_READ_TOKEN: "read-only" },
    async () => ok([
      { ref: "voglczxxtbwcxjrbffbt", organization_id: "wrong-org", status: "ACTIVE_HEALTHY" }
    ])
  );
  assert.equal(response.provider_checks["DB-01"].result, "not_found_in_scope");
  assert.equal(response.provider_checks["DB-01"].observed_status, null);
});

test("Cloudflare D1 GET-only metadata needs exact UUID/name; never pretends to check tables", async () => {
  const requests = [];
  const result = await run({
    PARADISDB_CLOUDFLARE_FYSEN_ACCOUNT_ID: "097bca85df0240062216f5d74efc0b30",
    PARADISDB_CLOUDFLARE_FYSEN_D1_READ_TOKEN: "private-d1-token"
  }, fake(requests, (url) => {
    const match = inventory.databases.find((db) => url.endsWith(db.identity.split(", ID ")[1]));
    assert.ok(match);
    return ok({ success: true, result: {
      uuid: match.identity.split(", ID ")[1],
      name: match.identity.split(", ID ")[0], num_tables: 4, file_size: 1200,
      secret: "NEVER_PUBLISH"
    } });
  }));
  assert.equal(requests.length, 2);
  assert.ok(requests.every((x) => !/\/query\b/.test(x.url)));
  assert.equal(result.provider_checks["DB-06"].observed_status, "METADATA_READABLE");
  assert.equal(result.provider_checks["DB-07"].table_count, 4);
  assert.equal(result.provider_checks["DB-06"].file_size_bytes, 1200);
  assert.equal(JSON.stringify(result).includes("NEVER_PUBLISH"), false);
});

test("provider errors and identity mismatch never become false health claims", async () => {
  const result = await run({
    PARADISDB_SUPABASE_ECHONET_READ_TOKEN: "bad",
    PARADISDB_CLOUDFLARE_FYSEN_ACCOUNT_ID: "097bca85df0240062216f5d74efc0b30",
    PARADISDB_CLOUDFLARE_FYSEN_D1_READ_TOKEN: "bad"
  }, async (url) => {
    if (url.includes("supabase")) throw Error("Internal provider response with secret");
    return ok({ success: true, result: { uuid: "wrong", name: "wrong" } });
  });
  assert.equal(result.provider_checks["DB-03"].result, "lookup_failed");
  assert.equal(result.provider_checks["DB-04"].result, "lookup_failed");
  assert.equal(result.provider_checks["DB-06"].result, "lookup_failed");
  assert.equal(result.provider_checks["DB-07"].result, "lookup_failed");
  assert.equal(JSON.stringify(result).includes("Internal provider"), false);
});

test("unreviewed or changed provider mapping fails closed", async () => {
  const extension = { ...inventory, databases: [...inventory.databases, {
    id: "DB-08", provider_environment: "Cloudflare D1 / future", identity: "new, ID 00000000-0000-0000-0000-000000000000"
  }] };
  const checked = await collectProviderStatus(extension, {}, () => { throw Error("No fetch"); }, () => NOW);
  assert.equal(checked.provider_checks["DB-08"].result, "not_supported");
  const mismatched = { ...inventory, databases: inventory.databases.map((db) =>
    db.id === "DB-03" ? { ...db, provider_environment: "Cloudflare D1" } : db) };
  await assert.rejects(collectProviderStatus(mismatched, {}, () => {}, () => NOW), /Provider mismatch/);
});
