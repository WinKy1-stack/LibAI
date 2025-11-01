# =======================================
# ⚙️ CẤU HÌNH KẾT NỐI
# =======================================

# ---- MongoDB ----
# ---- MongoDB ----
MONGO_URI = "mongodb+srv://ngocson:phamngocson04@cluster0.e5wsuwa.mongodb.net/"
MONGO_DB_NAME = "library_chatbox"
MONGO_COLLECTION_NAME = "marc_records"

# ---- Z39.50: Các máy chủ thư viện ----
Z3950_SERVERS = {
   # "NLV": {
   #     "name": "Thư viện Quốc gia Việt Nam",
   #     "host": "z3950.nlv.gov.vn",
   #     "port": 9999,
   #     "database": "biblio",
   #     "syntax": "USMARC"
   # },
    "LOC": {
        "name": "Thư viện Quốc hội Mỹ",
        "host": "z3950.loc.gov",
        "port": 7090,
        "database": "voyager",
        "syntax": "USMARC"
    }
}

# ---- Trường tìm kiếm ----
SEARCH_FIELDS = {
    "mọi trường": "any",
    "nhan đề": "title",
    "tác giả": "author",
    "isbn": "isbn",
    "chủ đề": "subject",
    "năm xuất bản": "date",
    "nhà xuất bản": "publisher"
}