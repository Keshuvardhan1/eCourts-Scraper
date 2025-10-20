"""
interactive_download_all_judges.py

Interactive Selenium flow:
- Opens a Chrome window for you to navigate/select/dropdowns and solve captcha.
- After you press ENTER, script scrapes all PDF links rendered on the page,
  exports browser cookies to a requests session, downloads every PDF, and saves a JSON.

Save as:
C:/Users/Hp/Desktop/ecourts-scraper/interactive_download_all_judges.py
"""

import argparse
import os
import json
import time
from urllib.parse import urljoin, urlparse

import requests
from bs4 import BeautifulSoup

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) eCourtsInteractive/1.0"

def ensure_dir(p): os.makedirs(p, exist_ok=True)

def save_json(data, base_url, date):
    out_dir = os.path.join("outputs", base_url.replace("https://", "").replace("http://", "").replace("/", "_"), date)
    ensure_dir(out_dir)
    out_path = os.path.join(out_dir, f"all_judges_{date}.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    print(f"[+] JSON saved at: {out_path}")
    return out_dir, out_path

def fetch_rendered_page(url, headless=False):
    """Launch chrome, let user interact, then return page_source and driver (for cookies)."""
    opts = webdriver.ChromeOptions()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    opts.add_argument("--disable-gpu")
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=opts)
    driver.get(url)
    return driver

def extract_pdf_links_from_html(html, base_url):
    soup = BeautifulSoup(html, "html.parser")
    links = []
    for a in soup.find_all("a", href=True):
        href = a["href"].strip()
        if href and ".pdf" in href.lower():
            links.append({"text": a.get_text(strip=True), "url": urljoin(base_url, href)})
    for iframe in soup.find_all("iframe", src=True):
        src = iframe["src"].strip()
        if src and ".pdf" in src.lower():
            links.append({"text": "iframe", "url": urljoin(base_url, src)})
    seen = set(); out=[]
    for l in links:
        if l["url"] not in seen:
            out.append(l); seen.add(l["url"])
    return out

def transfer_cookies_to_session(driver):
    sess = requests.Session()
    sess.headers.update({"User-Agent": USER_AGENT})
    for c in driver.get_cookies():
        sess.cookies.set(c['name'], c['value'], domain=c.get('domain'))
    return sess

def download_file_with_session(session, url, dest_folder, timeout=60):
    ensure_dir(dest_folder)
    fname = os.path.basename(url.split("?")[0]) or "file.pdf"
    fname = fname.replace("/", "_").replace("\\", "_")
    local_path = os.path.join(dest_folder, fname)
    with session.get(url, stream=True, timeout=timeout) as r:
        r.raise_for_status()
        with open(local_path, "wb") as fh:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    fh.write(chunk)
    return local_path

def interactive_scrape_and_download(url, date, headless=False, wait_after_press=1):
    print("[*] Starting browser. Please interact with the page (select dropdowns/date and solve CAPTCHA).")
    driver = fetch_rendered_page(url, headless=headless)

    print("""
INSTRUCTIONS (manual):
1) In the opened browser window:
   - Select State -> District -> Court Complex (and Court if needed)
   - Select Date: {}
   - Enter the CAPTCHA and click the button that displays the cause list
2) When you see the cause-list (with links) on the page, come back to this terminal and press ENTER.
""".format(date))

    input("Press ENTER after the cause-list is visible in the browser...")

    time.sleep(wait_after_press)

    page_html = driver.page_source
    final_url = driver.current_url
    pdf_links = extract_pdf_links_from_html(page_html, final_url)
    print(f"[*] Found {len(pdf_links)} PDF link(s) on the rendered page.")

    if not pdf_links:
        print("[!] No PDF links found — ensure the cause-list is expanded and links are visible before pressing ENTER.")
        driver.quit()
        return [], None

    session = transfer_cookies_to_session(driver)
    driver.quit()

    out_dir, json_path = save_json(pdf_links, final_url, date)
    downloaded = []
    for idx, item in enumerate(pdf_links, start=1):
        url_pdf = item["url"]
        print(f"Downloading {idx}/{len(pdf_links)}: {url_pdf}")
        try:
            local_path = download_file_with_session(session, url_pdf, out_dir)
            print("  -> saved to:", local_path)
            downloaded.append({"text": item.get("text"), "url": url_pdf, "path": local_path})
        except Exception as e:
            print("  ! failed to download:", url_pdf, "error:", e)
            downloaded.append({"text": item.get("text"), "url": url_pdf, "path": None, "error": str(e)})

    with open(json_path, "w", encoding="utf-8") as fh:
        json.dump(downloaded, fh, ensure_ascii=False, indent=2)

    print(f"[+] Completed downloads. Files & JSON saved in: {out_dir}")
    return downloaded, out_dir

def main():
    parser = argparse.ArgumentParser(description="Interactive eCourts downloader (with automatic PDF download).")
    parser.add_argument("--url", required=True, help="Cause-list page URL")
    parser.add_argument("--date", required=True, help="Date YYYY-MM-DD")
    parser.add_argument("--headless", action="store_true", help="Run Chrome headless (not recommended if CAPTCHA needs solving)")
    args = parser.parse_args()

    downloaded, out_dir = interactive_scrape_and_download(args.url, args.date, headless=args.headless)
    if downloaded is None:
        print("[!] No downloads performed.")
    elif len(downloaded) == 0:
        print("[!] No PDF links were found on the page.")
    else:
        print(f"[+] {len(downloaded)} entries saved. See folder: {out_dir}")

if __name__ == "__main__":
    main()
