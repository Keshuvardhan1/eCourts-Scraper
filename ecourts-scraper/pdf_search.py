"""
pdf_search.py
Search all PDFs inside a folder for a CNR or case text, extract context and heuristics
for serial number and court name.

Usage:
  (venv) python pdf_search.py --pdf-folder "outputs/site_path/2025-10-19" --query "CNR1234567890"
  (venv) python pdf_search.py --pdf-folder "outputs/site_path/2025-10-19" --query "CIVIL 1234 2025"
"""

import os
import json
import csv
import argparse
from pathlib import Path

try:
    import fitz
except Exception as e:
    raise RuntimeError("PyMuPDF not installed. Run: pip install pymupdf") from e

def extract_text_from_pdf(pdf_path):
    text = []
    doc = fitz.open(pdf_path)
    for page in doc:
        try:
            page_text = page.get_text("text")
        except Exception:
            page_text = ""
        text.append(page_text)
    doc.close()
    return "\n".join(text)

def find_occurrences(text, query):
    q = query.lower()
    hits = []
    lowered = text.lower()
    idx = 0
    while True:
        i = lowered.find(q, idx)
        if i == -1:
            break
        start = max(0, i - 120)
        end = min(len(text), i + len(q) + 120)
        snippet = text[start:end].replace("\n", " ").strip()
        hits.append({"index": i, "snippet": snippet})
        idx = i + len(q)
    return hits

def heuristics_parse(snippet):
    """
    Try to extract probable serial number and court name from a snippet of text.
    Very heuristic: look for patterns like 'Sl. No', 'Sr. No', 'Serial', numbers at line start,
    and words 'Court' or 'Judge' to infer court name.
    """
    lines = [ln.strip() for ln in snippet.split(".") if ln.strip()]
    serial = None
    court = None
    for ln in lines:
        low = ln.lower()
        if any(x in low for x in ("sl no", "sr no", "sl.", "sr.", "serial", "s.no", "s no")):
            import re
            m = re.search(r"\b(\d{1,4})\b", ln)
            if m:
                serial = m.group(1)
                break
    if not serial:
        import re
        m = re.search(r"^\s*(\d{1,4})\b", snippet)
        if m:
            serial = m.group(1)
    for ln in lines:
        if any(k in ln.lower() for k in ("court", "judge", "bench", "magistrate")):
            court = ln.strip()
            break
    if not court:
        for ln in lines:
            if len(ln) > 30:
                court = ln.strip()
                break
    return {"serial": serial, "court": court}

def search_folder(folder, query, out_json=None, out_csv=None):
    folder = Path(folder)
    assert folder.exists() and folder.is_dir(), f"{folder} not found"
    pdf_files = sorted([p for p in folder.glob("*.pdf")])
    results = []
    for pdf in pdf_files:
        print("Searching in:", pdf.name)
        try:
            text = extract_text_from_pdf(str(pdf))
        except Exception as e:
            print("  ! failed to extract text:", e)
            continue
        hits = find_occurrences(text, query)
        parsed_hits = []
        for h in hits:
            heur = heuristics_parse(h["snippet"])
            parsed_hits.append({"snippet": h["snippet"], "heuristics": heur})
        results.append({
            "pdf": str(pdf),
            "num_hits": len(hits),
            "hits": parsed_hits
        })
    if out_json:
        with open(out_json, "w", encoding="utf-8") as fh:
            json.dump(results, fh, ensure_ascii=False, indent=2)
        print("[+] JSON saved to", out_json)
    if out_csv:
        with open(out_csv, "w", newline='', encoding='utf-8') as fh:
            writer = csv.writer(fh)
            writer.writerow(["pdf", "num_hits", "sample_serial", "sample_court"])
            for r in results:
                sample_serial = r["hits"][0]["heuristics"]["serial"] if r["hits"] else ""
                sample_court = r["hits"][0]["heuristics"]["court"] if r["hits"] else ""
                writer.writerow([r["pdf"], r["num_hits"], sample_serial, sample_court])
        print("[+] CSV saved to", out_csv)
    return results

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf-folder", required=True, help="Folder containing downloaded PDFs")
    parser.add_argument("--query", required=True, help="CNR or text to search (case-insensitive)")
    parser.add_argument("--out-json", help="Save detailed JSON output")
    parser.add_argument("--out-csv", help="Save summary CSV")
    args = parser.parse_args()

    out_json = args.out_json or os.path.join(args.pdf_folder, f"search_results_{args.query.replace(' ','_')}.json")
    out_csv = args.out_csv or os.path.join(args.pdf_folder, f"search_summary_{args.query.replace(' ','_')}.csv")
    results = search_folder(args.pdf_folder, args.query, out_json=out_json, out_csv=out_csv)
    total_hits = sum(r["num_hits"] for r in results)
    print(f"Done. PDFs searched: {len(results)}. Total hits: {total_hits}")

if __name__ == "__main__":
    main()
