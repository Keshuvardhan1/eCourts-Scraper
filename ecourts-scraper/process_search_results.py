import argparse, json, csv, os

def summarize(json_path, out_csv):
    with open(json_path, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    rows = []
    for entry in data:
        pdf = entry.get("pdf","")
        num_hits = entry.get("num_hits", 0)
        if num_hits == 0:
            rows.append([pdf, 0, "", ""])
            continue
        first = entry.get("hits", [])[0]
        heur = first.get("heuristics", {}) if first else {}
        serial = heur.get("serial","")
        court = heur.get("court","")
        snippet = first.get("snippet","") if first else ""
        rows.append([pdf, num_hits, serial, court, snippet])
    os.makedirs(os.path.dirname(out_csv) or ".", exist_ok=True)
    with open(out_csv, "w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["pdf","num_hits","sample_serial","sample_court","sample_snippet"])
        writer.writerows(rows)
    print(f"[+] Wrote summary CSV: {out_csv}")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--json", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()
    summarize(args.json, args.out)
