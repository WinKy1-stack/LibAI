from flask import Blueprint, request, jsonify
from app.utils.mongo_search import search_in_mongo
from app.utils.z3950_search import search_in_z3950
from app.exceptions import ValidationError

# ✅ Khai báo Blueprint (route bắt đầu bằng /search)
z3950_bp = Blueprint('z3950_bp', __name__, url_prefix='/search')


@z3950_bp.route('/', methods=['GET'])
def search():
    """
    API Tìm kiếm tài liệu: kết hợp MongoDB và Z39.50 (Library of Congress)
    Ví dụ:
        /search?keyword=deep%20learning&field=title
    """
    keyword = request.args.get("keyword")
    field = request.args.get("field", "any")

    if not keyword:
        raise ValidationError("Thiếu tham số 'keyword'")

    # 1️⃣ Tìm trong MongoDB trước
    mongo_data = search_in_mongo(keyword, field)
    mongo_books = mongo_data.get("result", []) if isinstance(mongo_data, dict) else []

    # 2️⃣ Nếu chưa đủ, truy vấn thêm Z39.50
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
    seen, unique_books = set(), []
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


# ✅ Route test nhanh (tuỳ chọn)
@z3950_bp.route('/test', methods=['GET'])
def test_route():
    return jsonify({"message": "Z39.50 API đang hoạt động!"})
