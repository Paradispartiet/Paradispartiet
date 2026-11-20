import test from "node:test";
import assert from "node:assert/strict";
import { inspectSnapshot } from "../tools/check_paradisdb_watchdog.mjs";

const inventory = { schema_version: 1, metadata_only: true, databases: [
  { id: "DB-01" }, { id: "DB-02" }, { id: "DB-03" }, { id: "DB-04" },
  { id: "DB-05" }, { id: "DB-06" }, { id: "DB-07" }
] };
const day = new Date("2026-11-20T20:45:00Z");
function healthy() {
  return { schema_version: 1, metadata_only: true,
    source: "docs/paradisdb-inventory.json",
    generated_at: "2026-11-20T15:30:37.244Z",
    provider_checks: {
      "DB-01": { provider: "supabase", result: "not_configured" },
      "DB-02": { provider: "supabase", result: "not_configured" },
      "DB-03": { provider: "supabase", result: "verified", observed_status: "ACTIVE_HEALTHY" },
      "DB-04": { provider: "supabase", result: "verified", observed_status: "INACTIVE" },
      "DB-05": { provider: "not_configured", result: "not_supported" },
      "DB-06": { provider: "cloudflare_d1", result: "not_configured" },
      "DB-07": { provider: "cloudflare_d1", result: "not_configured" }
    } };
}

test("fresh daily snapshot is healthy; paused staging and missing tokens do not cause alarms", () => {
  const result = inspectSnapshot(healthy(), inventory, day);
  assert.equal(result.alert, false);
  assert.deepEqual(result.reasons, []);
});

test("missing today's publication after evening cutoff creates attention", () => {
  const snapshot = healthy();
  snapshot.generated_at = "2026-11-19T15:30:37.244Z";
  const result = inspectSnapshot(snapshot, inventory, day);
  assert.equal(result.alert, true);
  assert.ok(result.reasons.some((reason) => reason.includes("2026-11-20")));
});

test("morning manual check accepts yesterday's snapshot before daily cutoff", () => {
  const snapshot = healthy();
  snapshot.generated_at = "2026-11-19T16:30:37.244Z";
  assert.equal(inspectSnapshot(snapshot, inventory, new Date("2026-11-20T09:00:00Z")).alert, false);
});

test("failed provider requests are alerts, not inaccurate database-outage claims", () => {
  const snapshot = healthy();
  snapshot.provider_checks["DB-03"] = { provider: "supabase", result: "lookup_failed", observed_status: null };
  const result = inspectSnapshot(snapshot, inventory, day);
  assert.equal(result.alert, true);
  assert.ok(result.reasons.some((reason) => reason.includes("DB-03: kontroll mislyktes")));
  assert.equal(result.reasons.some((reason) => reason.includes("DB-01")), false);
});

test("unexpected active AHA status is an alert; intended inactive staging is not", () => {
  const snapshot = healthy();
  snapshot.provider_checks["DB-03"].observed_status = "INACTIVE";
  assert.equal(inspectSnapshot(snapshot, inventory, day).alert, true);
});

test("missing records or invalid/undated snapshot fails closed", () => {
  const snapshot = healthy();
  delete snapshot.provider_checks["DB-07"];
  assert.ok(inspectSnapshot(snapshot, inventory, day).reasons.some((reason) => reason.includes("DB-07")));
  snapshot.provider_checks = {};
  snapshot.generated_at = null;
  assert.equal(inspectSnapshot(snapshot, inventory, day).alert, true);
  snapshot.metadata_only = false;
  assert.match(inspectSnapshot(snapshot, inventory, day).reasons[0], /Ugyldig/);
});

test("future-dated snapshot is not accepted as a fresh result", () => {
  const snapshot = healthy();
  snapshot.generated_at = "2026-11-21T15:30:37.244Z";
  assert.ok(inspectSnapshot(snapshot, inventory, day).reasons.some((reason) => /fremtiden/.test(reason)));
});
