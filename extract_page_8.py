import fitz  # PyMuPDF
import sys

pdf_path = "/Users/gaejib/Workspace/Business/CSMAC/documents/MVP 고도화.pdf"

try:
    doc = fitz.open(pdf_path)
    # Page 8 is index 7
    if len(doc) > 7:
        page = doc[7]
        text = page.get_text()
        print(f"--- Page 8 Content ---\n{text}\n----------------------")
    else:
        print("Document has fewer than 8 pages.")
except Exception as e:
    print(f"Error: {e}")
