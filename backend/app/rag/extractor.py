import os
from pypdf import PdfReader

def extract_text_from_file(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    
    if ext == ".pdf":
        try:
            reader = PdfReader(file_path)
            pages_text = []
            for i, page in enumerate(reader.pages):
                extracted = page.extract_text()
                if extracted:
                    pages_text.append(extracted)
            text = "\n".join(pages_text)
        except Exception as e:
            text = f"[PDF Extraction Error: {e}]"
    else:
        # Text/Markdown/CSV files
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                text = f.read()
        except Exception as e:
            text = f"[Text Extraction Error: {e}]"

    return text.strip() or "No readable text content found in document."
