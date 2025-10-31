from flask import Flask, request, jsonify
import subprocess
import re

app = Flask(__name__)

def z3950_search_yaz(host, port, database, query, max_records=10, syntax="usmarc"):
    script = f"""open {host}:{port}/{database}
format {syntax}
find @attrset bib-1 @attr 1=4 "{query}"
show 1+{max_records}
quit
"""
    
    try:
        result = subprocess.run(
            ["yaz-client"],
            input=script,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        output = result.stdout
        
        # Parse số hits
        total = 0
        match = re.search(r'Number of hits: (\d+)', output)
        if match:
            total = int(match.group(1))
        
        # Parse records - hỗ trợ cả Rank: và [Voyager]Record type:
        records = []
        
        # Tách theo pattern [Voyager]Record type: hoặc Record type:
        raw_records = re.split(r'\n(?=\[.*?\]Record type:|Record type:)', output)
        
        for raw in raw_records:
            # Kiểm tra có phải record không
            if ('Record type:' in raw or 'Voyager' in raw) and len(raw) > 100:
                # Lấy phần MARC data (sau dòng Record type:)
                record_match = re.search(r'Record type:.*?\n(.*?)(?=\n\[|$)', raw, re.DOTALL)
                if record_match:
                    marc_data = record_match.group(1).strip()
                    if marc_data:
                        records.append({
                            "raw": marc_data
                        })
        
        return {
            "total": total,
            "count": len(records),
            "records": records,
            "debug": output
        }
        
    except Exception as e:
        raise Exception(f"Lỗi yaz-client: {e}")


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.post("/search_z3950")
def search_z3950():
    """
    {
      "host": "lx2.loc.gov",
      "port": 210,
      "database": "LCDB",
      "query": "python",
      "max_records": 10
    }
    """
    try:
        data = request.get_json(force=True)
        
        host = data.get("host")
        port = int(data.get("port", 210))
        database = data.get("database")
        query = data.get("query")
        max_records = int(data.get("max_records", 10))
        
        if not host or not database or not query:
            return jsonify({"error": "Thiếu host/database/query"}), 400
        
        result = z3950_search_yaz(host, port, database, query, max_records)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)