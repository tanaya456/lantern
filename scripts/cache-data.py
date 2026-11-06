#!/usr/bin/env python3
"""Snapshot public data into ./data so the demo works offline.

Usage (from the project root, with `npm run dev` running for the API snapshots):
    python3 -I scripts/cache-data.py

Writes:
  data/emdat/{ISO}.json      EM-DAT country profile (CRED / UCLouvain, via HDX), aggregated by year
  data/countries.geojson.json Natural Earth outlines for the clickable countries
  data/events-cache.json     snapshot of /api/events        (needs dev server)
  data/country-cache/*.json  snapshot of /api/country/{ISO} (needs dev server)
Standard library only.
"""
import io
import json
import os
import sys
import urllib.request
import xml.etree.ElementTree as ET
import zipfile
from collections import defaultdict

ISOS = ["PHL", "NZL", "USA"]
SINCE = 2000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
UA = {"User-Agent": "lantern-hackathon (demo)"}


def get(url, timeout=40):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
        return r.read()


def write(rel, obj):
    p = os.path.join(ROOT, rel)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w") as f:
        json.dump(obj, f, separators=(",", ":"))
    print("wrote", rel)


def xlsx_rows(blob):
    ns = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
    z = zipfile.ZipFile(io.BytesIO(blob))
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        for si in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(ns + "si"):
            shared.append("".join(t.text or "" for t in si.iter(ns + "t")))
    rows = []
    for r in ET.fromstring(z.read("xl/worksheets/sheet1.xml")).iter(ns + "row"):
        vals = []
        for c in r:
            v, t = c.find(ns + "v"), c.find(ns + "is/" + ns + "t")
            if t is not None:
                vals.append(t.text)
            elif v is not None:
                vals.append(shared[int(v.text)] if c.get("t") == "s" else v.text)
            else:
                vals.append(None)
        rows.append(vals)
    return rows


def num(x):
    try:
        return int(float(x))
    except (TypeError, ValueError):
        return 0


def emdat(iso):
    meta = json.loads(get(f"https://data.humdata.org/api/3/action/package_show?id=emdat-country-profiles-{iso.lower()}"))
    res = meta["result"]["resources"][0]
    rows = xlsx_rows(get(res["url"]))
    head = rows[0]
    idx = {h: i for i, h in enumerate(head)}
    years = defaultdict(lambda: {"affected": 0, "deaths": 0, "events": 0, "byType": defaultdict(int)})
    type_totals = defaultdict(int)
    for r in rows[2:]:  # row 1 is HXL tags
        y = num(r[idx["Year"]])
        if y < SINCE or r[idx["Disaster Group"]] != "Natural":
            continue
        t = r[idx["Disaster Type"]]
        aff = num(r[idx["Total Affected"]])
        Y = years[y]
        Y["affected"] += aff
        Y["deaths"] += num(r[idx["Total Deaths"]])
        Y["events"] += num(r[idx["Total Events"]])
        Y["byType"][t] += aff
        type_totals[t] += aff
    out_years = [
        {"year": y, **{k: v for k, v in d.items() if k != "byType"}, "byType": dict(d["byType"])}
        for y, d in sorted(years.items())
    ]
    write(f"emdat/{iso}.json", {
        "iso": iso,
        "asOf": (res.get("last_modified") or "")[:10],
        "since": SINCE,
        "totals": {k: sum(y[k] for y in out_years) for k in ("affected", "deaths", "events")},
        "years": out_years,
        "topTypes": [t for t, _ in sorted(type_totals.items(), key=lambda kv: -kv[1])[:4]],
    })


def outlines():
    fc = json.loads(get("https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson"))
    feats = [
        {"type": "Feature", "properties": {"iso3": f["properties"]["ADM0_A3"], "name": f["properties"]["NAME"]}, "geometry": f["geometry"]}
        for f in fc["features"] if f["properties"]["ADM0_A3"] in ISOS
    ]
    write("countries.geojson.json", {"type": "FeatureCollection", "features": feats})


def api_snapshots():
    base = "http://localhost:3000"
    try:
        ev = json.loads(get(base + "/api/events", 30))
        write("events-cache.json", ev)
        for iso in ISOS:
            write(f"country-cache/{iso}.json", json.loads(get(f"{base}/api/country/{iso}", 30)))
    except Exception as e:  # dev server not running
        print("skipped API snapshots (start `npm run dev` first):", e, file=sys.stderr)


if __name__ == "__main__":
    for iso in ISOS:
        emdat(iso)
    outlines()
    api_snapshots()
