import subprocess
import re
from pathlib import Path
from app.config import Config


def parse_yaz_output(raw_text: str):
    """Phân tích output từ yaz-client."""
    records = re.split(r"(?=\[\w+\]Record type: USmarc)", raw_text)
    results = []

    for block in records:
        if "Record type: USmarc" not in block:
            continue

        record = {"author": "", "title": "", "publisher": "", "isbn": "", "year": "", "subjects": []}

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
                    [a.group(1).strip() if a else "", b.group(1).strip() if b else "", c.group(1).strip() if c else ""]
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


def query_z3950(keyword: str, field: str):
    """Truy vấn tối đa 5 record từ LOC (Library of Congress)."""
    server = Config.Z3950_SERVERS["LOC"]

    attr_map = {
        "any": "1016", "title": "4", "author": "1003",
        "subject": "21", "isbn": "7", "publisher": "1018", "date": "31"
    }
    attr = attr_map.get(field, "1016")

    # 🔧 Gửi lệnh show từng record, vì LOC không hỗ trợ show 1+5
    show_cmds = "\n".join([f"show {i}" for i in range(1, 6)])

    yaz_cmd = f"""
        open {server['host']}:{server['port']}/{server['database']}
        find @attr 1={attr} "{keyword}"
        {show_cmds}
        quit
    """

    try:
        # ✅ Encode chính xác UTF-8 khi gửi vào yaz-client
        process = subprocess.Popen(
            ["yaz-client"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        stdout, stderr = process.communicate(yaz_cmd.encode("utf-8"), timeout=45)

        stdout = stdout.decode("utf-8", errors="ignore")
        stderr = stderr.decode("utf-8", errors="ignore")

        # Ghi log phản hồi
        log_path = Path(getattr(Config, "Z3950_LOG_PATH", "z3950_debug.log")).resolve()
        log_path.write_text(stdout, encoding="utf-8")

        if "Number of hits: 0" in stdout or "Records: 0" in stdout:
            return {"error": "Không tìm thấy dữ liệu tại LOC."}

        parsed = parse_yaz_output(stdout)
        if not parsed:
            return {"error": "LOC có dữ liệu nhưng không parse được (xem z3950_debug.log)"}

        return {"source": "LOC (Library of Congress)", "result": parsed[:5], "total": len(parsed)}

    except subprocess.TimeoutExpired:
        return {"error": "⏱ Quá thời gian truy vấn LOC."}
    except Exception as e:
        return {"error": f"Lỗi khi truy vấn LOC: {e}"}


def search_in_z3950(keyword: str, field: str = "any"):
    return query_z3950(keyword, field)
