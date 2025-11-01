from flask import Flask, request, jsonify
from utils.mongo_search import search_in_mongo
from utils.z3950_search import search_in_z3950

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False  # hiển thị tiếng Việt chuẩn

@app.route("/search", methods=["GET"])
def search():
    keyword = request.args.get("keyword")
    field = request.args.get("field", "any")

    if not keyword:
        return jsonify({"error": "Thiếu tham số 'keyword'"}), 400

    # 1️⃣ Tìm trong MongoDB
    mongo_data = search_in_mongo(keyword, field)
    mongo_books = mongo_data.get("result", []) if isinstance(mongo_data, dict) else []

    # 2️⃣ Nếu chưa đủ 5, truy vấn thêm từ LOC
    z3950_books = []
    try:
        if len(mongo_books) < 5:
            z3950_data = search_in_z3950(keyword, field)
            if isinstance(z3950_data, dict) and "result" in z3950_data:
                z3950_books = z3950_data["result"]
    except Exception as e:
        print("⚠️ Lỗi khi truy vấn LOC:", e)

    # 3️⃣ Gộp và loại trùng theo tiêu đề
    combined = mongo_books + z3950_books
    seen = set()
    unique_books = []
    for b in combined:
        t = b.get("title", "").strip().lower()
        if t and t not in seen:
            seen.add(t)
            unique_books.append(b)

    return jsonify({
        "results": unique_books[:5],
        "total": len(unique_books[:5]),
        "source": "MongoDB + LOC (Z39.50)"
    })


if __name__ == "__main__":
    app.run(debug=True)
