# eCourts Cause List Scraper

## Description

This project is a Python-based tool to fetch cause lists from the eCourts portal in real-time. Users can select a state, district, court complex, and date, and the tool will download PDFs for all judges in the court complex. It also allows searching these PDFs for specific case details such as CNR numbers.

## Features

* Interactive UI to select state, district, and court complex.
* Download cause list PDFs for a specific date.
* Option to download all judges' cause lists in a court complex.
* Search downloaded PDFs for specific case numbers or details.
* Outputs results in JSON and CSV formats for easy review.

## Installation

1. Clone the repository or download the ZIP file.
2. Open a terminal and navigate to the project folder.
3. Create a virtual environment (Python 3.11 recommended):

   ```
   py -3.11 -m venv venv
   venv\Scripts\activate.bat
   ```
4. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

## Usage

1. **Download PDFs interactively:**

   ```
   python interactive_download_all_judges.py --url "<court_complex_url>" --date YYYY-MM-DD
   ```

   Follow the instructions in the Chrome window to navigate and solve any captcha, then press ENTER to start downloading PDFs.

2. **Search PDFs for case details:**

   ```
   python pdf_search.py --pdf-folder "<path_to_downloaded_pdfs>" --query "<CNR_or_case_number>"
   ```

3. **Generate final summary CSV:**

   ```
   python process_search_results.py --json "<path_to_search_results.json>" --out "<final_summary.csv>"
   ```

## Output Files

* `search_results_<query>.json` — Detailed hits and heuristics from PDFs.
* `search_summary_<query>.csv` — Clean summary of serial numbers, courts, and sample snippets.
* `final_summary.csv` — Human-readable summary of all hits per PDF.

## Notes

* Make sure the PDF folder exists before running searches.
* OCR (Tesseract) may be required if PDFs are scanned images.

## License

This project is for academic purposes and can be freely used for educational submission.
