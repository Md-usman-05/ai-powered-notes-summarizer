from io import BytesIO
from pathlib import Path

from bs4 import BeautifulSoup
from docx import Document
from pypdf import PdfReader


class UnsupportedFileError(ValueError):
    pass


def extract_text_from_upload(uploaded_file):
    file_name = uploaded_file.name or "uploaded-file"
    suffix = Path(file_name).suffix.lower()
    content = uploaded_file.read()

    if suffix == ".pdf":
        return extract_pdf_text(content)

    if suffix == ".docx":
        return extract_docx_text(content)

    if suffix in {".html", ".htm"}:
        return extract_html_text(content)

    return extract_plain_text(content)


def extract_pdf_text(content):
    reader = PdfReader(BytesIO(content))
    pages = []

    for page in reader.pages:
        page_text = page.extract_text() or ""
        if page_text.strip():
            pages.append(page_text.strip())

    text = "\n\n".join(pages).strip()

    if not text:
        raise UnsupportedFileError(
            "This PDF does not contain selectable text. Please paste the text manually."
        )

    return text


def extract_docx_text(content):
    document = Document(BytesIO(content))
    paragraphs = [
        paragraph.text.strip()
        for paragraph in document.paragraphs
        if paragraph.text.strip()
    ]

    text = "\n".join(paragraphs).strip()

    if not text:
        raise UnsupportedFileError(
            "This DOCX file does not contain readable text. Please paste the text manually."
        )

    return text


def extract_html_text(content):
    html = extract_plain_text(content)
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text("\n", strip=True)


def extract_plain_text(content):
    for encoding in ("utf-8", "utf-16", "latin-1"):
        try:
            text = content.decode(encoding).strip()
        except UnicodeDecodeError:
            continue

        if text and has_enough_text(text):
            return text

    raise UnsupportedFileError(
        "Could not read text from this file type. Please upload PDF, DOCX, TXT, CSV, HTML, or paste the notes manually."
    )


def has_enough_text(text):
    printable = sum(1 for char in text if char.isprintable() or char.isspace())
    return printable / max(len(text), 1) > 0.85
