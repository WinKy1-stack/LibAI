import subprocess
import re
from pathlib import Path
from app.config import Config


def parse_yaz_output(raw_text: str):
    """Phân tích output từ yaz-client và trích xuất dữ liệu MARC21 cơ bản."""
    records = re.split(r"(?=\[\w+\]Record type: USmarc)", raw_text)
    results = []

    for block in records:
        if "Record type: USmarc" not in block:
            continue

        record = {
            "author": "",
            "title": "",
            "publisher": "",
            "isbn": "",
            "year": "",
            "subjects": []
        }

        for line in block.splitlines():
            line = line.strip()
            if not line:
                continue

            if line.startswith("100"):
                m = re.search(r"\$a\s*(.+)", line)
                if m:
                    record["author"] = m.group(1).strip(". ")
            elif line.startswith("245"):
                m = re.search(r"\$a\s*(.+?)(\/|\$|$)", line)
                if m:
                    record["title"] = m.group(1).strip(". ")
            elif line.startswith(("260", "264")):
                a = re.search(r"\$a\s*([^$]+)", line)
                b = re.search(r"\$b\s*([^$]+)", line)
                c = re.search(r"\$c\s*([^$]+)", line)
                pub = " ".join(
                    [
                        a.group(1).strip() if a else "",
                        b.group(1).strip() if b else "",
                        c.group(1).strip() if c else "",
                    ]
                ).strip(", ")
                record["publisher"] = pub
                if c:
                    record["year"] = re.sub(r"\D", "", c.group(1))[:4]
            elif line.startswith("650"):
                m = re.search(r"\$a\s*(.+)", line)
                if m:
                    record["subjects"].append(m.group(1).strip(". "))
            elif line.startswith("020"):
                m = re.search(r"\$a\s*([\d-]+)", line)
                if m:
                    record["isbn"] = m.group(1)

        if record["title"]:
            results.append(record)

    return results
