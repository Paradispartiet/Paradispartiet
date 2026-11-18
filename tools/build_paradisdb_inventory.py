#!/usr/bin/env python3
"""Build ParadisDB's metadata mirror from the single canonical Markdown register."""
import argparse
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "docs" / "DATABASE_REGISTER.md"
OUTPUT = ROOT / "docs" / "paradisdb-inventory.json"

def fields(line):
    return [part.strip() for part in line.split("|")[1:-1]]

def build(source):
    databases, projects = [], []
    for line in source.splitlines():
        if re.match(r"^\| \*\*DB-\d{2}\*\* \|", line):
            c = fields(line)
            if len(c) != 7:
                raise ValueError("Invalid database column count")
            keys = ("id", "system", "provider_environment", "identity",
                    "location", "verification", "next_check")
            cleaned = [s.replace("*", "").replace(chr(96), "") for s in c]
            databases.append(dict(zip(keys, cleaned)))
        elif re.match(r"^\| PRJ-\d{2} \|", line):
            c = fields(line)
            if len(c) != 6:
                raise ValueError("Invalid project column count")
            projects.append({
                "id": c[0],
                "name": c[1],
                "repository": c[2],
                "database_ids": re.findall(r"DB-\d{2}", c[3]),
                "other_storage": c[4],
                "verification": c[5],
            })
    ids = {row["id"] for row in databases}
    if not ids or not projects:
        raise ValueError("Empty inventory")
    if len(ids) != len(databases) or len({p["id"] for p in projects}) != len(projects):
        raise ValueError("Duplicate inventory ID")
    for p in projects:
        for database_id in p["database_ids"]:
            if database_id not in ids:
                raise ValueError("Unknown database %s in %s" % (database_id, p["id"]))
    return {
        "schema_version": 1,
        "source": "docs/DATABASE_REGISTER.md",
        "metadata_only": True,
        "live_paradisdb_sync_verified": False,
        "databases": databases,
        "projects": projects,
    }

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()
    generated = json.dumps(build(SOURCE.read_text(encoding="utf-8")), ensure_ascii=False, indent=2) + "\n"
    if args.check:
        if not OUTPUT.exists() or OUTPUT.read_text(encoding="utf-8") != generated:
            raise SystemExit("ParadisDB inventory differs from its source: regenerate it.")
        print("ParadisDB metadata feed matches main register")
    else:
        OUTPUT.write_text(generated, encoding="utf-8")
        print("Generated", OUTPUT)

if __name__ == "__main__":
    main()
