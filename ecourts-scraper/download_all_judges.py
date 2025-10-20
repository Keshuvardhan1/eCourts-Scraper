"""
download_all_judges.py
Download all judge cause-list PDFs from a court complex page for a given date.
Saves PDFs and structured JSON with judge names and PDF paths.

Usage:
python download_all_judges.py --url "COURT_COMPLEX_URL" --date YYYY-MM-DD --use-selenium
"""

import os
import json
from datetime import datetime
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
import time

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) eCourtsScraper/1.0"

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def http_get(url):
    headers = {"User-Agent": USER_AGENT}
    r = requests.get(url, headers=headers, timeout=30)
    r.raise_for_status()
    return r

def fetch_soup(url, use_selenium=False, wait=4):
    if use_selenium:
        opts = Options()
        opts.add_argument("--headless=new")
        opts.add_argument("--disable-gpu")
        opts.add_argument("--no-sandbox")
        driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=opts)
        driver.get(url)
        time.sleep(wait) 
        html = driver.page_source
        final_url = driver.current_url
        driver.quit()
        return BeautifulSoup(html, "html.parser"), final_url
    else:
        r = http_get(url)
        return BeautifulSoup(r.text, "html.parser"), url

def extract_judge_pdf_links(soup, base_url):
    """
    Returns a list of dicts: [{'judge': 'Judge Name', 'pdf_url': 'https://...'}, ...]
    """
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"]
        text = a.get_text(strip=True)
        if href.lower().endswith(".pdf"):
            links.append({"judge": text or "unknown", "pdf_url": urljoin(base_url, href)})
    return links

def download_file(url, dest_folder):
    ensure_dir(dest_folder)
    fname = os.path.basename(url.split("?")[0])
    path = os.path.join(dest_folder, fname)
    r = http_get(url)
    with open(path, "wb") as f:
        f.write(r.content)
    return path

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True, help="Court complex page URL")
    parser.add_argument("--date", help="Date YYYY-MM-DD (default today)")
    parser.add_argument("--out", default="outputs", help="Output folder")
    parser.add_argument("--use-selenium", action="store_true", help="Use Selenium to fetch page dynamically")
    args = parser.parse_args()

    date_str = args.date or datetime.now().strftime("%Y-%m-%d")
    print(f"[+] Using date: {date_str}")
    print(f"[+] Fetching court complex page: {args.url}")

    try:
        soup, final_url = fetch_soup(args.url, use_selenium=args.use_selenium)
    except Exception as e:
        print("ERROR fetching page:", e)
        return

    print("[+] Page fetched:", final_url)
    judge_pdfs = extract_judge_pdf_links(soup, final_url)
    print(f"[+] Found {len(judge_pdfs)} judge PDF links.")

    out_folder = os.path.join(args.out, (urlparse(final_url).netloc + urlparse(final_url).path).replace("/", "_").strip("_"), date_str)
    ensure_dir(out_folder)

    results = []
    for j in judge_pdfs:
        try:
            pdf_path = download_file(j["pdf_url"], out_folder)
            results.append({"judge": j["judge"], "pdf_url": j["pdf_url"], "pdf_path": pdf_path})
            print(f"  -> Downloaded: {j['judge']}")
        except Exception as e:
            print(f"  ! Failed to download {j['judge']}: {e}")

    out_json = os.path.join(out_folder, f"all_judges_{date_str}.json")
    with open(out_json, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)

    print("[+] Done. JSON saved at:", out_json)
    print("[+] PDFs downloaded in folder:", out_folder)


if __name__ == "__main__":
    main()
