"""
ecourts_scraper.py
Download cause-list PDFs from a cause-list page and search them for a CNR/case text.

Usage examples (from project folder with venv activated):
  python ecourts_scraper.py --url "https://newdelhi.dcourts.gov.in/cause-list-%e2%81%84-daily-board/" --today --download --cnr "CNR1234567890"
  python ecourts_scraper.py --url "https://services.ecourts.gov.in/ecourtindia_v6/?p=cause_list/" --date 2025-10-19 --use-selenium --download
"""

import argparse
import json
import os
import time
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup
from dateutil import parser as dateparser
from tqdm import tqdm

try:
    import fitz  
    _HAS_PYMUPDF = True
except Exception:
    _HAS_PYMUPDF = False

try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from webdriver_manager.chrome import ChromeDriverManager
    _HAS_SELENIUM = True
except Exception:
    _HAS_SELENIUM = False

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) eCourtsScraper/1.0"

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def http_get(url, session=None, **kwargs):
    s = session or requests
    headers = kwargs.pop("headers", {})
    headers.setdefault("User-Agent", USER_AGENT)
    return s.get(url, headers=headers, timeout=30, **kwargs)

def fetch_soup_requests(url):
    r = http_get(url)
    r.raise_for_status()
    return BeautifulSoup(r.text, "html.parser"), r.url

def fetch_soup_selenium(url, wait=4):
    if not _HAS_SELENIUM:
        raise RuntimeError("Selenium not available in environment (install selenium & webdriver-manager).")
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    prefs = {"profile.managed_default_content_settings.images": 2}
    opts.add_experimental_option("prefs", prefs)
    driver = webdriver.Chrome(ChromeDriverManager().install(), options=opts)
    try:
        driver.get(url)
        time.sleep(wait)
        html = driver.page_source
        final = driver.current_url
    finally:
        driver.quit()
    return BeautifulSoup(html, "html.parser"), final

def extract_pdf_links(soup, base_url):
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        if href.lower().endswith(".pdf"):
            links.append({"url": urljoin(base_url, href), "text": a.get_text(strip=True)})
    for iframe in soup.find_all("iframe", src=True):
        src = iframe["src"]
        if src.lower().endswith(".pdf"):
            links.append({"url": urljoin(base_url, src), "text": "iframe_pdf"})
    seen = set()
    dedup = []
    for p in links:
        if p["url"] not in seen:
            dedup.append(p)
            seen.add(p["url"])
    return dedup

def download_file(url, dest_folder, session=None):
    ensure_dir(dest_folder)
    parsed = urlparse(url)
    fname = os.path.basename(parsed.path) or "file.pdf"
    fname = fname.split("?")[0]
    local_path = os.path.join(dest_folder, fname)
    s = session or requests
    headers = {"User-Agent": USER_AGENT}
    with s.get(url, headers=headers, stream=True, timeout=60) as r:
        r.raise_for_status()
        total = int(r.headers.get("content-length", 0))
        with open(local_path, "wb") as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
    return local_path

def search_pdf_text(pdf_path, query):
    """Search plain text in a PDF using PyMuPDF. Returns list of matches."""
    results = []
    if not _HAS_PYMUPDF:
        raise RuntimeError("PyMuPDF not installed. Install pymupdf to search PDFs.")
    q = query.lower()
    doc = fitz.open(pdf_path)
    for i, page in enumerate(doc):
        try:
            text = page.get_text("text") or ""
        except Exception:
            text = ""
        if q in text.lower():
            idx = text.lower().find(q)
            start = max(0, idx - 80)
            end = idx + len(q) + 80
            snippet = text[start:end].replace("\n", " ").strip()
            results.append({"page": i + 1, "snippet": snippet})
    doc.close()
    return results

def find_case_in_html(soup, query):
    """Naive search across table rows in HTML page for given query text."""
    q = query.lower()
    hits = []
    for tr in soup.find_all("tr"):
        text = tr.get_text(" ", strip=True).lower()
        if q in text:
            cells = [c.get_text(" ", strip=True) for c in tr.find_all(["td", "th"])]
            serial = next((c for c in cells if c.isdigit()), None)
            court = None
            for c in reversed(cells):
                if "court" in c.lower() or "judge" in c.lower() or "bench" in c.lower():
                    court = c
                    break
            hits.append({"row_text": text, "serial": serial, "court": court, "cells": cells})
    return hits

def parse_args():
    p = argparse.ArgumentParser(description="eCourts cause-list scraper & PDF downloader")
    p.add_argument("--url", required=True, help="Cause-list page URL (direct page)")
    p.add_argument("--date", help="Date YYYY-MM-DD (default: today)")
    p.add_argument("--today", action="store_true")
    p.add_argument("--tomorrow", action="store_true")
    p.add_argument("--cnr", help="CNR or text to search inside cause-lists")
    p.add_argument("--download", action="store_true", help="Download all discovered PDFs")
    p.add_argument("--use-selenium", action="store_true", help="Render page with Selenium (for JS-heavy pages)")
    p.add_argument("--out", default="outputs", help="Output folder")
    p.add_argument("--wait", type=int, default=4, help="Selenium page wait seconds")
    return p.parse_args()

def main():
    args = parse_args()

    if args.tomorrow:
        dt = datetime.now() + timedelta(days=1)
    elif args.today:
        dt = datetime.now()
    elif args.date:
        dt = dateparser.parse(args.date)
    else:
        dt = datetime.now()
    date_str = dt.strftime("%Y-%m-%d")

    print(f"[+] Using date: {date_str}")
    print(f"[+] Fetching URL: {args.url}")

    try:
        if args.use_selenium:
            soup, final_url = fetch_soup_selenium(args.url, wait=args.wait)
        else:
            soup, final_url = fetch_soup_requests(args.url)
    except Exception as e:
        print("ERROR: failed to fetch page:", e)
        return

    print("[+] Page fetched:", final_url)
    pdf_links = extract_pdf_links(soup, final_url)
    print(f"[+] Found {len(pdf_links)} PDF links on page.")

    out_base = os.path.join(args.out, (urlparse(final_url).netloc + urlparse(final_url).path).replace("/", "_").strip("_"))
    out_folder = os.path.join(out_base, date_str)
    ensure_dir(out_folder)

    downloaded = []
    if args.download and pdf_links:
        print("[*] Downloading PDFs...")
        for p in tqdm(pdf_links, desc="Downloading"):
            try:
                path = download_file(p["url"], out_folder)
                downloaded.append({"url": p["url"], "path": path, "text": p.get("text")})
            except Exception as e:
                print("  ! download failed:", p["url"], e)
    else:
        downloaded = [{"url": p["url"], "path": None, "text": p.get("text")} for p in pdf_links]

    results = {
        "source_url": final_url,
        "date": date_str,
        "found_pdfs": pdf_links,
        "downloaded": downloaded,
        "search_results": [],
        "html_search_hits": []
    }

    if args.cnr:
        print(f"[*] Searching in HTML for '{args.cnr}' ...")
        html_hits = find_case_in_html(soup, args.cnr)
        results["html_search_hits"] = html_hits
        if html_hits:
            print(f"[+] Found {len(html_hits)} hit(s) in HTML.")
            for h in html_hits:
                print("  serial:", h["serial"], "court:", h["court"])
        else:
            print("[*] Not found in HTML. Will search inside downloaded PDFs (if any).")

    if args.cnr and any(d.get("path") for d in downloaded):
        if not _HAS_PYMUPDF:
            print("WARNING: PyMuPDF (pymupdf) not installed — cannot search inside PDFs.")
        else:
            print("[*] Searching inside downloaded PDFs for:", args.cnr)
            for d in downloaded:
                path = d.get("path")
                if not path:
                    continue
                try:
                    matches = search_pdf_text(path, args.cnr)
                    if matches:
                        results["search_results"].append({"pdf": path, "matches": matches})
                        print(f"  -> Found in {path}: {len(matches)} match(es)")
                except Exception as e:
                    print("  ! search failed for", path, e)

    out_json = os.path.join(out_folder, f"result_{date_str}.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("[+] Results saved to:", out_json)
    print("[+] Done.")

if __name__ == "__main__":
    main()
