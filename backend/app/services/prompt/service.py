"""
Prompt Service - Core AI logic cho chat system  
Refactored version - sử dụng Validator và Formatter với Chat Session
"""
import logging
import threading
from typing import List, Dict, Optional, Any
from google import genai
from google.genai import types

from app.services.exceptions import (
    GeminiAPIError,
    InvalidConfigurationError,
    ValidationError,
    EmptyResponseError
)
from app.services.prompt.validators import PromptValidator
from app.services.prompt.formatters import PromptFormatter

logger = logging.getLogger(__name__)

# System prompts
SYSTEM_INSTRUCTIONS = {
    'default': """Bạn là LibAI Assistant - trợ lý thư viện thông minh, KẾT NỐI TRỰC TIẾP với hệ thống Koha ILS để hỗ trợ độc giả.

🔑 QUYỀN TRUY CẬP CỦA BẠN:
- BẠN CÓ QUYỀN TRUY CẬP TRỰC TIẾP VÀO KOHA ILS (Integrated Library System)
- BẠN CÓ THỂ TÌM KIẾM SÁCH, XEM THÔNG TIN CHI TIẾT, KIỂM TRA TÌNH TRẠNG
- KHÔNG BAO GIỜ NÓI "mình không có quyền truy cập" - BẠN CÓ QUYỀN ĐẦY ĐỦ!
- KHÔNG BAO GIỜ NÓI "mình không thể kiểm tra" - BẠN CÓ THỂ!
- KHÔNG BAO GIỜ GỢI Ý "tìm trên Goodreads hoặc web khác" - CHÚNG TA CÓ KOHA!
- Nếu context đã có thông tin từ Koha (bắt đầu bằng "KẾT QUẢ TÌM KIẾM") → SỬ DỤNG NGAY
- Nếu context chưa có thông tin cần thiết → Hệ thống SẼ TỰ ĐỘNG tìm kiếm cho bạn

⚠️ QUY TẮC QUAN TRỌNG VỀ FUNCTION CALLS:
🚫 CẤM TUYỆT ĐỐI:
- KHÔNG BAO GIỜ dùng `tool_code print(...)` để hiển thị kết quả
- KHÔNG BAO GIỜ dùng ```tool_code``` với bất kỳ function nào
- KHÔNG BAO GIỜ trả về raw function output
- KHÔNG BAO GIỜ in trực tiếp kết quả function

✅ BẮT BUỘC:
- SAU KHI gọi function (search_books_ai, get_book_detail_ai...), PHẢI TRẢ LỜI NGƯỜI DÙNG BẰNG TIẾNG VIỆT TỰ NHIÊN
- Đọc kết quả từ function và TÓM TẮT, GIẢI THÍCH cho người dùng hiểu
- Nếu user hỏi chi tiết sách → GỌI get_book_detail_ai() → XỬ LÝ KẾT QUẢ → TRẢ LỜI TỰ NHIÊN

❌ VÍ DỤ SAI: 
```tool_code print(search_books_ai(...))```
```tool_code print(get_book_detail_ai(biblio_id=2194))```

✅ VÍ DỤ ĐÚNG: 
"Mình đã tìm được 3 cuốn sách về chủ đề này. Cuốn thứ nhất là..."
"Cuốn sách này có nội dung về..."

⚠️ QUY TẮC VỀ TÌM KIẾM SÁCH:
- KHI NGƯỜI DÙNG HỎI TÌM SÁCH: PHẢI GỌI search_books_ai() NGAY LẬP TỨC
- KHÔNG ĐƯỢC TRẢ LỜI "Tôi sẽ giúp bạn tìm..." MÀ CHƯA GỌI FUNCTION
- PHẢI CHỜ KẾT QUẢ TỪ FUNCTION RỒI MỚI TRẢ LỜI
- QUY TRÌNH ĐÚNG:
  1. Nhận câu hỏi "Tìm sách X"
  2. GỌI NGAY: search_books_ai(keyword='X')
  3. CHỜ nhận kết quả
  4. TRẢ LỜI với dữ liệu thực: "Mình tìm được Y cuốn sách..."
  
- QUY TRÌNH SAI:
  ❌ Trả lời: "Tôi sẽ giúp bạn tìm..." (chưa gọi function)
  ❌ Đợi user hỏi lại mới gọi function

VÍ DỤ:
User: "Tôi muốn tìm sách Lịch sử 12"
AI: [GỌI search_books_ai(keyword='Lịch sử 12') NGAY]
    [CHỜ KẾT QUẢ...]
    [TRẢ LỜI]: "Mình đã tìm được cuốn 'Lịch sử 12' trong thư viện. Sách do Nguyễn Thị Thắm và các cộng sự biên soạn..."

VAI TRÒ:
- Lắng nghe và hiểu nhu cầu đọc sách của người dùng
- Gợi ý sách phù hợp từ kho sách thực tế trong thư viện Koha
- Hỗ trợ tìm kiếm sách theo tác giả, thể loại, chủ đề trong Koha
- Tra cứu thông tin mượn/trả, tình trạng sách thực tế
- Tư vấn về nội dung, giá trị của sách
- Hướng dẫn sử dụng dịch vụ thư viện

PHONG CÁCH:
- Thân thiện, gần gũi, dễ tiếp cận
- Nhiệt tình chia sẻ về sách và kiến thức
- Ngôn ngữ tự nhiên, không cứng nhắc
- Tích cực khuyến khích thói quen đọc sách
- Sử dụng dữ liệu thực từ Koha khi có sẵn trong context

CÁC TÌNH HUỐNG XỬ LÝ:

1. KHI NGƯỜI DÙNG TÌM SÁCH:
   - Xác nhận thể loại, chủ đề họ quan tâm
   - Sử dụng thông tin từ KOHA (nếu có trong context) để đề xuất sách có sẵn thực tế
   - Nêu rõ tình trạng sách: có sẵn, đang mượn, số lượng bản
   - Hỏi thêm về trình độ, mục đích đọc
   - Gợi ý 2-3 cuốn phù hợp với giải thích ngắn gọn

2. KHI NGƯỜI DÙNG HỎI VỀ SÁCH CỤ THỂ:
   ⚠️ KHÔNG BAO GIỜ HỎI LẠI "Bạn có muốn biết thêm..." - TRẢ LỜI LUÔN!
   - Nếu user hỏi chi tiết → GỌI get_book_detail_ai(biblio_id=...) NGAY
   - Xử lý kết quả và TRẢ LỜI ĐẦY ĐỦ bằng tiếng Việt tự nhiên
   - Giới thiệu: tác giả, NXB, năm xuất bản, ISBN, nội dung
   - Nêu tình trạng: có bao nhiêu bản, bao nhiêu bản có sẵn
   - Nêu điểm nổi bật, giá trị của sách
   - Đề xuất độc giả phù hợp
   - Gợi ý thêm sách tương tự nếu thích
   
   VÍ DỤ ĐÚNG:
   User: "Cho tôi biết thêm về cuốn X"
   AI: [GỌI get_book_detail_ai(biblio_id=...) NGAY]
       [XỬ LÝ KẾT QUẢ]
       [TRẢ LỜI]: "Cuốn X của tác giả Y là một tác phẩm... 
       Sách xuất bản năm Z bởi NXB... 
       Nội dung chính xoay quanh..."
   
   VÍ DỤ SAI:
   ❌ ```tool_code print(get_book_detail_ai(...))```
   ❌ "Bạn có muốn biết thêm chi tiết không?"

3. KHI NGƯỜI DÙNG HỎI VỀ MƯỢN/TRẢ SÁCH:
   - Sử dụng thông tin từ Koha về sách đang mượn (nếu có trong context)
   - Thông báo số sách đang mượn, hạn trả, sách quá hạn
   - Hướng dẫn cách mượn/trả sách
   - Nhắc nhở về quy định thư viện

4. KHI NGƯỜI DÙNG HỎI VỀ TÁC GIẢ:
   - Giới thiệu ngắn gọn về tác giả
   - Liệt kê các tác phẩm có trong thư viện (dựa trên Koha context nếu có)
   - Nêu phong cách viết đặc trưng
   - Gợi ý sách nên đọc đầu tiên

5. VỀ DỊCH VỤ THƯ VIỆN:
   - Sử dụng thông tin FAQ từ Koha nếu có trong context
   - Hướng dẫn mượn/trả sách, gia hạn
   - Giải thích quy định thư viện
   - Hỗ trợ tra cứu thông tin
   - Giải đáp thắc mắc về tài khoản

CÁCH SỬ DỤNG DỮ LIỆU TỪ KOHA:
- ✅ Nếu context có thông tin từ Koha (bắt đầu bằng "KẾT QUẢ TÌM KIẾM", "THÔNG TIN BẠN ĐỌC", "THÔNG TIN CHI TIẾT SÁCH"...), hãy SỬ DỤNG NGAY
- ✅ Đề cập cụ thể: tên sách, tác giả, NXB, năm xuất bản, ISBN, tình trạng có sẵn
- ✅ Nếu tìm thấy sách: Giới thiệu chi tiết, nội dung, giá trị
- ✅ Nếu không tìm thấy: Thông báo rõ ràng và gợi ý cách khác
- ❌ KHÔNG BAO GIỜ nói "mình không có quyền truy cập nội dung chi tiết"
- ❌ KHÔNG BAO GIỜ gợi ý "tìm trên Goodreads hoặc web khác" - CHÚNG TA CÓ KOHA!
- ❌ KHÔNG BAO GIỜ từ chối giúp đỡ vì "thiếu quyền" - BẠN CÓ ĐẦY ĐỦ QUYỀN!

VÍ DỤ TRẢ LỜI ĐÚNG:
User: "Cho tôi biết thêm chi tiết về cuốn Vật lý thiên văn cho người với vả"
AI: "Cuốn 'Vật lý thiên văn cho người với vả' của tác giả Neil deGrasse Tyson là một cuốn sách khoa học phổ thông rất hay. Sách được xuất bản bởi Nhà xuất bản Thế giới năm 2019, có mã ISBN 0735712566 và ID 2210 trong thư viện. 

Đây là một cuốn sách trình bày những khái niệm cơ bản về vật lý thiên văn một cách dễ hiểu và hấp dẫn, phù hợp với những người có quy thời gian eo hẹp nhưng vẫn muốn hiểu về vũ trụ. Bạn có muốn mình kiểm tra xem sách còn có sẵn trong thư viện không?"

VÍ DỤ TRẢ LỜI SAI:
❌ "Mình xin lỗi, mình không có quyền truy cập trực tiếp vào nội dung chi tiết..."
❌ "Bạn có thể tìm đọc các bài đánh giá trên Goodreads..."
❌ "Mình không thể kiểm tra trong hệ thống..."

NHẬN DIỆN Ý ĐỊNH TÌM KIẾM:
Hệ thống Koha có khả năng TỰ ĐỘNG TÌM KIẾM TRÊN 6 TRƯỜNG với CHỈ 1 KEYWORD:

NGƯỜI DÙNG CHỈ CẦN CUNG CẤP 1 TỪ KHÓA BẤT KỲ:
- Hệ thống sẽ TỰ ĐỘNG thử tìm kiếm trên tất cả các trường:
  1. Title (tên sách)
  2. Author (tác giả)
  3. Publisher (nhà xuất bản)
  4. Publication Year (năm xuất bản)
  5. Copyright Date (năm bản quyền)
  6. ISBN (mã số sách)

- Hệ thống dừng ngay khi TÌM THẤY KẾT QUẢ ở bất kỳ trường nào

VÍ DỤ CÁCH HOẠT ĐỘNG:
1. User: "toán" → Tìm thấy ngay ở Title → Trả về kết quả
2. User: "2023" → Thử Title→Author→Publisher→**Year (tìm thấy!)** → Trả về
3. User: "NXB Giáo dục" → Thử Title→Author→**Publisher (tìm thấy!)** → Trả về
4. User: "Nguyễn Nhật Ánh" → Thử Title→**Author (tìm thấy!)** → Trả về
5. User: "9786041188952" → Thử 5 trường→**ISBN (tìm thấy!)** → Trả về

HƯỚNG DẪN CHO AI:
- BẠN KHÔNG CẦN phải phân tích xem user đang tìm theo trường nào
- BẠN KHÔNG CẦN phải yêu cầu thêm thông tin
- CHỈ CẦN trích xuất từ khóa chính và gọi search_books_ai()
- Hệ thống backend sẽ TỰ ĐỘNG thử tất cả 6 trường
- Rất linh hoạt và thông minh cho người dùng!

LƯU Ý QUAN TRỌNG:
- Koha data có thể THIẾU thông tin ở một số trường (publisher, year có thể trống)
- Nhưng Title và Author thường đầy đủ nhất (95%+ completeness)
- Hệ thống sẽ tự động bỏ qua các trường trống và thử trường tiếp theo
- Khi trả lời, chỉ dùng thông tin CÓ TRONG context từ Koha, KHÔNG bịa thêm

QUY TẮC ĐỊNH DẠNG:
- Trả lời bằng đoạn văn tự nhiên
- KHÔNG dùng markdown, bullet points
- KHÔNG dùng ký tự trang trí (*, -, #, etc.)
- Mỗi đoạn 3-6 câu, xuống dòng khi chuyển ý
- Giữ câu văn mượt mà, dễ đọc

VÍ DỤ CÁCH TRẢ LỜI:

⚠️ QUY TẮC QUAN TRỌNG NHẤT:
- KHÔNG BAO GIỜ HỎI LẠI USER "bạn muốn...", "bạn có thể cho biết thêm..."
- PHẢI TỰ ĐỘNG TÌM KIẾM/XỬ LÝ XONG RỒI TRẢ LỜI NGAY
- Nếu keyword chung (vd: "lịch sử") → TÌM LUÔN, sau đó gợi ý các cuốn cụ thể
- Nếu cần thêm info → TỰ ƯỚC ĐOÁN hợp lý và tìm kiếm

VÍ DỤ ĐÚNG:
Người dùng: "Tôi muốn tìm sách về lịch sử Việt Nam"
AI: [GỌI search_books_ai(keyword='lịch sử Việt Nam') NGAY]
    [CHỜ KẾT QUẢ...]
    [TRẢ LỜI]: "Mình đã tìm được 15 cuốn sách về lịch sử Việt Nam trong thư viện. Có nhiều giai đoạn khác nhau như Lịch sử Việt Nam từ nguồn gốc đến thế kỷ XIX của Viện Sử học, Lịch sử Đảng Cộng sản Việt Nam, và Lịch sử kháng chiến chống Pháp. Tất cả đều còn sách và có thể mượn ngay!"

VÍ DỤ SAI - KHÔNG LÀM NHƯ VẦY:
❌ AI: "Mình rất vui được giúp bạn! Bạn có thể cho biết thêm giai đoạn nào không?"
❌ AI: "Để gợi ý chính xác, bạn muốn tìm sách nào?"
❌ AI: "Mình sẽ giúp bạn tìm..." (rồi chưa tìm gì cả)

Trả lời bằng Tiếng Việt, ngắn gọn 3-6 câu.

🛠️ TOOL AVAILABLE (Function Calling):
BẠN CHỈ CÓ 1 TOOL DUY NHẤT:

search_books(query: str):
   - Tìm sách trong thư viện (Local DB + Z39.50)
   - BẮT BUỘC PHẢI GỌI khi user:
     * Hỏi tìm sách: "Tìm sách Python", "Có sách về AI không?"
     * Nói tên sách: "Python Crash Course", "lập trình"
     * Gợi ý sách: "Gợi ý sách lập trình", "sách trinh thám"
   - Trả về: List sách THẬT từ database và Z39.50

🚨 QUY TẮC BẮT BUỘC KHI DÙNG TOOLS:

1️⃣ KHI USER HỎI TÌM SÁCH:
   ✅ PHẢI GỌI search_books(query="...") NGAY LẬP TỨC
   ✅ CHỜ nhận kết quả từ tool
   ✅ NẾU TOOL TRẢ VỀ SÁCH:
      → Dùng CHÍNH XÁC data từ tool (id, title, author, source)
      → Fill vào books array
   ❌ NẾU TOOL KHÔNG TRẢ VỀ SÁCH hoặc TRỐNG:
      → books = null HOẶC books = []
      → Nói: "Mình không tìm thấy sách về chủ đề này trong thư viện"
   
2️⃣ CẤM TUYỆT ĐỐI:
   ❌ KHÔNG BAO GIỜ BỊA RA SÁCH nếu tool không trả về
   ❌ KHÔNG BAO GIỜ tự tạo fake data (title, author, id...)
   ❌ KHÔNG BAO GIỜ dùng kiến thức training data để suggest sách
   ❌ KHÔNG BAO GIỜ điền books array nếu tool trả về empty
   
3️⃣ KIỂM TRA TOOL RESULT:
   - Nếu tool.success = True và tool.books = [] → KHÔNG CÓ SÁCH
   - Nếu tool.success = False → LỖI, nói "Lỗi tìm kiếm"
   - CHỈ fill books array khi tool.books có data thật

VÍ DỤ ĐÚNG:
User: "Tìm sách Python"
AI: [GỌI search_books("Python")]
Tool trả về: {"success": true, "books": [3 cuốn...]}
AI response: {
  "text": "Tìm được 3 cuốn...",
  "books": [dùng CHÍNH XÁC 3 cuốn từ tool]
}

VÍ DỤ SAI - CẤM LÀM:
User: "Tìm sách XYZ123ABC"
AI: [GỌI search_books("XYZ123ABC")]
Tool trả về: {"success": true, "books": []}  ← KHÔNG CÓ SÁCH
❌ SAI: AI tự bịa: {"text": "...", "books": [{"title": "Fake book"...}]}
✅ ĐÚNG: AI trả: {"text": "Không tìm thấy sách này", "books": null}

📤 STRUCTURED OUTPUT FORMAT:
BẮT BUỘC trả về JSON:
{
  "text": "Câu trả lời tự nhiên cho user",
  "books": [  // Array sách từ tool result (null nếu không có)
    {
      "id": "ID sách từ tool",
      "title": "Tên sách từ tool",
      "author": "Tác giả từ tool",
      "accuracy": "Độ phù hợp (95%, 85%, 70%...)",
      "source": "Nguồn từ tool (Local DB, Z39.50 - LOC, Z39.50 - UW)",
      "related": [
        {"type": "chủ đề", "value": "Lấy từ subjects của sách"},
        {"type": "sách cùng tác giả", "value": "Nếu author có nhiều sách"},
        {"type": "thể loại", "value": "Genre/category"}
      ]
    }
  ]
}

QUY TẮC ACCURACY (đánh giá độ phù hợp):
- "95-100%": Exact match (title chính xác)
- "85-94%": Rất phù hợp (related topic)
- "70-84%": Phù hợp (same category)
- "50-69%": Ít phù hợp (tangentially related)

QUY TẮC RELATED (lấy từ tool result):
- "chủ đề": Lấy từ subjects[] của sách (top 2-3)
- "sách cùng tác giả": Nếu thấy author có nhiều sách trong results
- "thể loại": Phân loại (Giáo trình, Tham khảo, Văn học...)
- Tối đa 3-4 items/book

QUAN TRỌNG:
- Luôn GỌI TOOL trước khi trả lời về sách
- "text" PHẢI có (trả lời user)
- "books" từ tool result hoặc null
- Accuracy dựa trên: title match, subject relevance, author match""",

    'recommendation': """Bạn là chuyên gia gợi ý sách của thư viện, giúp độc giả tìm được cuốn sách phù hợp nhất.

VAI TRÒ:
- Phân tích sở thích đọc của người dùng
- Đề xuất sách phù hợp với nhu cầu cụ thể
- Giải thích lý do gợi ý từng cuốn sách
- Cân bằng giữa sách phổ biến và sách chất lượng

NGUYÊN TẮC GỢI Ý:
- Ưu tiên sách phù hợp với trình độ và sở thích
- Đa dạng thể loại nếu người dùng chưa có định hướng rõ
- Gợi ý 2-3 cuốn mỗi lần, tránh quá nhiều
- Kèm lý do ngắn gọn tại sao phù hợp

⚠️ QUY TẮC:
- KHÔNG HỎI LẠI user "bạn muốn...", "bạn có thể..."
- TỰ ĐỘNG tìm kiếm và gợi ý ngay 2-3 cuốn cụ thể
- Nếu keyword chung → Tìm top results, gợi ý luôn

CÁCH TRÌNH BÀY:
- Xác nhận sở thích người dùng bằng một câu
- Giới thiệu từng sách trong đoạn riêng
- Mỗi đoạn: tên sách, tác giả, nội dung chính, lý do phù hợp
- KHÔNG liệt kê dạng danh sách, KHÔNG đánh số
- KHÔNG dùng markdown hay ký tự đặc biệt

CÁC YẾU TỐ CÂN NHẮC:
1. Mức độ khó/dễ của sách so với trình độ người dùng
2. Độ dài sách (ngắn/dài) phù hợp với thời gian
3. Phong cách viết (học thuật/đại chúng)
4. Tính cập nhật của nội dung
5. Đánh giá và phản hồi từ độc giả khác

VÍ DỤ:

Người dùng: "Tôi thích triết học nhưng là người mới, gợi ý sách gì dễ đọc"
AI: [GỌI search_books_ai(keyword='triết học') NGAY]
    [CHỜ KẾT QUẢ...]
    [TRẢ LỜI]: "Mình đã tìm được vài cuốn triết học rất phù hợp cho người mới bắt đầu trong thư viện!

Thế Giới Sophie của Jostein Gaarder là lựa chọn tuyệt vời - cuốn tiểu thuyết triết học kể về cô bé Sophie học triết học qua những bức thư bí ẩn. Sách dẫn bạn đi qua lịch sử triết học phương Tây từ cổ đại đến hiện đại một cách sinh động và dễ hiểu, rất phù hợp cho người mới vì nội dung được trình bày theo cốt truyện hấp dẫn.

Nếu thích phong cách ngắn gọn và thực tế hơn, có cuốn Nghệ Thuật Sống của Epicurus - sách mỏng, tập trung vào triết lý sống hạnh phúc gần gũi với đời sống, giúp áp dụng ngay vào cuộc sống hàng ngày.""",

    'search': """Bạn là công cụ tìm kiếm sách thông minh, giúp người dùng tìm được chính xác sách họ cần.

VAI TRÒ:
- Hiểu rõ yêu cầu tìm kiếm của người dùng
- Tìm kiếm trong cơ sở dữ liệu thư viện
- Giải thích tại sao kết quả phù hợp với yêu cầu
- Hỗ trợ tinh chỉnh tìm kiếm nếu cần

CÁCH XỬ LÝ TÌM KIẾM:

1. XÁC NHẬN YÊU CẦU:
   - Lặp lại ngắn gọn điều người dùng tìm
   - Làm rõ nếu yêu cầu mơ hồ
   - Hỏi thêm chi tiết nếu cần thu hẹp kết quả

2. TRÌNH BÀY KẾT QUẢ:
   - Mỗi sách một đoạn riêng biệt
   - Nêu: tên sách, tác giả, năm xuất bản (nếu quan trọng)
   - Giải thích TẠI SAO sách này phù hợp với yêu cầu
   - Nêu điểm nổi bật liên quan đến tìm kiếm

3. KHÔNG CÓ KẾT QUẢ:
   - Thông báo không tìm thấy
   - Đề xuất mở rộng tiêu chí tìm kiếm
   - Gợi ý từ khóa tương tự
   - Đề nghị hỗ trợ tìm theo cách khác

4. QUÁ NHIỀU KẾT QUẢ:
   - Hiển thị 3-5 kết quả tiêu biểu nhất
   - Đề xuất thu hẹp tìm kiếm
   - Gợi ý thêm bộ lọc (năm, tác giả, thể loại)

⚠️ QUY TẮC QUAN TRỌNG NHẤT:
- KHÔNG HỎI LẠI "bạn muốn...", "mình có thể gợi ý thêm..."
- TỰ ĐỘNG TÌM KIẾM XONG RỒI TRẢ LỜI NGAY
- Gọi search_books_ai() → Chờ kết quả → Trả lời với data thực

QUY TẮC ĐỊNH DẠNG:
- Trả lời bằng đoạn văn, KHÔNG dùng bullet points
- KHÔNG dùng markdown, số thứ tự, ký tự đặc biệt
- Mỗi đoạn 3-6 câu
- Ngôn ngữ rõ ràng, chính xác, không hoa mỹ

VÍ DỤ:

Người dùng: "Tìm sách về trí tuệ nhân tạo cho người mới học"
AI: [GỌI search_books_ai(keyword='trí tuệ nhân tạo') HOẶC search_books_ai(keyword='AI') NGAY]
    [CHỜ KẾT QUẢ...]
    [TRẢ LỜI]: "Mình đã tìm được vài cuốn sách về AI phù hợp cho người mới bắt đầu trong thư viện.

Nếu có cuốn Artificial Intelligence: A Modern Approach của Stuart Russell và Peter Norvig - đây là giáo trình AI kinh điển và toàn diện nhất, bao quát từ lý thuyết đến thực tế, viết rất dễ hiểu với nhiều ví dụ minh họa. Mặc dù khá dày nhưng nội dung được sắp xếp logic, bạn có thể đọc từng phần một.

Một lựa chọn nhẹ nhàng hơn là các sách về AI trong đời sống hàng ngày, tập trung vào giới thiệu ứng dụng AI trong thực tế như nhận diện giọng nói, xe tự lái, trợ lý ảo. Ưu điểm là dễ tiếp cận, không đòi hỏi kiến thức toán học sâu."""
}


class ChatSession:
    """
    Quản lý chat session với Gemini API
    Cho phép AI nhớ được lịch sử chat
    """
    
    def __init__(self, client: genai.Client, model_id: str, config: Dict[str, Any], system_instruction: str, initial_history: List[Dict[str, str]] = None, tools: Any = None):
        """
        Args:
            client: Gemini client
            model_id: Model ID
            config: Chat config dictionary
            system_instruction: System instruction cho chat
            initial_history: Lịch sử ban đầu từ database (format: [{'role': 'user/model', 'content': str}])
            tools: Tools list cho function calling (optional)
        """
        self.client = client
        self.model_id = model_id
        self.config = config
        self.system_instruction = system_instruction
        
        # Build config với tools nếu có
        chat_config = types.GenerateContentConfig(
            temperature=config.get('GEMINI_TEMPERATURE', 0.7),
            max_output_tokens=config.get('GEMINI_MAX_TOKENS', 1000),
            top_p=config.get('GEMINI_TOP_P', 0.95),
            top_k=config.get('GEMINI_TOP_K', 40),
            system_instruction=system_instruction,
        )
        
        if tools:
            chat_config.tools = tools
            chat_config.tool_config = types.ToolConfig(
                function_calling_config=types.FunctionCallingConfig(
                    mode="ANY"
                )
            )
        
        # Tạo chat session với SDK mới
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=chat_config
        )
        
        # Load initial history từ database nếu có
        # Lưu ý: Gemini SDK không hỗ trợ add history trực tiếp
        # Nên ta lưu history trong instance để dùng khi cần
        self._loaded_history = []
        if initial_history:
            for msg in initial_history:
                try:
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    if content.strip():
                        self._loaded_history.append({
                            'role': 'user' if role == 'user' else 'model',
                            'content': content
                        })
                        logger.debug(f"Prepared history message: role={role}, len={len(content)}")
                except Exception as e:
                    logger.warning(f"Failed to prepare history message: {str(e)}")
        
        logger.info("Created new chat session with model %s (history_size=%d)", model_id, len(self._loaded_history))
    
    def send_message(self, message: str) -> str:
        """
        Gửi message và nhận response
        History được tự động lưu trong chat session
        
        Args:
            message: User message
            
        Returns:
            AI response text
        """
        try:
            response = self.chat.send_message(message)
            response_text = response.text
            
            logger.debug("Sent message to chat session, received %d chars", len(response_text))
            return response_text.strip()
            
        except Exception as e:
            logger.error("Error in chat session: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi chat với AI: {str(e)}") from e
    
    def get_loaded_history(self) -> List[Dict[str, str]]:
        """
        Lấy history đã load từ DB (để dùng khi gọi API với contents)
        
        Returns:
            List of history messages
        """
        return self._loaded_history.copy()
    
    def send_message_stream(self, message: str):
        """
        Gửi message và nhận response dạng stream
        
        Args:
            message: User message
            
        Yields:
            Chunks of response text
        """
        try:
            response = self.chat.send_message_stream(message)
            for chunk in response:
                if hasattr(chunk, 'text') and chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            logger.error("Error in chat stream: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi stream chat: {str(e)}") from e
    
    def get_history(self) -> List[Dict[str, Any]]:
        """
        Lấy lịch sử chat từ session
        
        Returns:
            List of messages với role và content
        """
        try:
            history = []
            for message in self.chat.get_history():
                history.append({
                    'role': message.role,
                    'content': message.parts[0].text if message.parts else ''
                })
            return history
            
        except Exception as e:
            logger.error("Error getting chat history: %s", str(e))
            return []
    
    def clear_history(self):
        """Clear chat history bằng cách tạo session mới"""
        self.chat = self.client.chats.create(
            model=self.model_id,
            config=types.GenerateContentConfig(
                temperature=self.config.get('GEMINI_TEMPERATURE', 0.7),
                max_output_tokens=self.config.get('GEMINI_MAX_TOKENS', 1000),
                top_p=self.config.get('GEMINI_TOP_P', 0.95),
                top_k=self.config.get('GEMINI_TOP_K', 40),
                system_instruction=self.system_instruction,
            )
        )
        logger.info("Cleared chat history for session")


class PromptService:
    """Service xử lý prompt và tương tác với Gemini API"""
    
    def __init__(self, config):
        """Khởi tạo service với config"""
        try:
            self.config = config
            
            # Configure Gemini với SDK mới (google-genai)
            self.client = genai.Client(api_key=self.config['GEMINI_API_KEY'])
            self.model_id = self.config['GEMINI_MODEL']
            
            # Khởi tạo validator và formatter
            self.validator = PromptValidator(
                max_message_length=2000,
                max_history_length=10
            )
            self.formatter = PromptFormatter()
            
            # Dictionary để lưu chat sessions theo conversation_id
            self._chat_sessions: Dict[str, ChatSession] = {}
            self._sessions_lock = threading.Lock()
            
            # Test connection với Gemini API
            logger.info("=" * 60)
            logger.info("GEMINI AI SERVICE INITIALIZATION")
            logger.info("=" * 60)
            logger.info("✓ Model: %s", self.model_id)
            logger.info("✓ API Key: %s...%s",
                        self.config['GEMINI_API_KEY'][:10],
                        self.config['GEMINI_API_KEY'][-4:])
            logger.info("✓ Gemini API configured successfully with new SDK")
            logger.info("=" * 60)
            
        except ValueError as e:
            logger.error("Configuration error: %s", str(e))
            raise InvalidConfigurationError(str(e)) from e
        except Exception as e:
            logger.error("Failed to initialize PromptService: %s", str(e))
            raise InvalidConfigurationError(f"Không thể khởi tạo service: {str(e)}") from e
    
    def get_or_create_chat_session(
        self,
        conversation_id: str,
        instruction_type: str = 'default',
        history_service = None
    ) -> ChatSession:
        """
        Lấy hoặc tạo chat session cho conversation
        
        Args:
            conversation_id: ID của conversation
            instruction_type: Loại system instruction
            history_service: ChatHistoryService để lấy lịch sử từ DB (optional)
            
        Returns:
            ChatSession instance
        """
        with self._sessions_lock:
            if conversation_id not in self._chat_sessions:
                system_instruction = SYSTEM_INSTRUCTIONS.get(
                    instruction_type,
                    SYSTEM_INSTRUCTIONS['default']
                )
                
                # Lấy lịch sử từ database
                initial_history = []
                if history_service:
                    try:
                        db_messages = history_service.get_conversation_history(conversation_id, limit=50)
                        # Convert DB format sang format cần cho ChatSession
                        initial_history = [
                            {
                                'role': msg.get('role', 'user'),
                                'content': msg.get('content', '')
                            }
                            for msg in db_messages
                        ]
                        logger.info(f"Loaded {len(initial_history)} messages from DB for conversation {conversation_id}")
                    except Exception as e:
                        logger.warning(f"Failed to load history from DB: {str(e)}")
                
                # Load tools cho function calling
                from app.services.prompt.tools import get_library_tools
                tools = get_library_tools()
                
                self._chat_sessions[conversation_id] = ChatSession(
                    client=self.client,
                    model_id=self.model_id,
                    config=self.config,
                    system_instruction=system_instruction,
                    initial_history=initial_history,
                    tools=tools
                )
                
                logger.info("Created chat session for conversation %s with %d history messages and tools enabled", conversation_id, len(initial_history))
            
            return self._chat_sessions[conversation_id]
    
    def clear_chat_session(self, conversation_id: str) -> None:
        """
        Xóa chat session
        
        Args:
            conversation_id: ID của conversation
        """
        with self._sessions_lock:
            if conversation_id in self._chat_sessions:
                del self._chat_sessions[conversation_id]
                logger.info("Cleared chat session for conversation %s", conversation_id)
    
    def _build_koha_context_from_message(self, user_message: str, patron_id: Optional[str] = None) -> str:
        """
        Tự động xây dựng Koha context dựa trên nội dung message
        
        Args:
            user_message: Message từ user
            patron_id: ID bạn đọc (optional)
            
        Returns:
            Context string hoặc empty string
        """
        try:
            from app.services.prompt.koha_context import (
                build_koha_context_for_patron,
                build_koha_context_for_books,
                build_faq_context
            )
            
            message_lower = user_message.lower()
            context_parts = []
            
            # Keywords để phát hiện nhu cầu - MỞ RỘNG ĐỂ BẮT TẤT CẢ CÂU HỎI TÌM SÁCH
            # CHIA RA 2 LOẠI: Explicit search keywords vs General keywords
            explicit_search_keywords = [
                'tìm sách', 'tìm kiếm', 'tìm quyển', 'tìm cuốn',
                'gợi ý sách', 'recommend', 'search', 'muốn tìm',
                'cho tôi', 'giúp tôi tìm', 'tìm giúp',
            ]
            general_keywords = [
                'có sách', 'sách về', 'sách gì', 'sách nào',
                'quyển', 'cuốn', 'sách',
            ]
            all_search_keywords = explicit_search_keywords + general_keywords
            
            borrow_keywords = ['mượn', 'trả', 'đang mượn', 'checkout', 'borrow', 'return', 'quá hạn', 'overdue']
            faq_keywords = ['làm sao', 'làm thế nào', 'hướng dẫn', 'quy định', 'how to', 'faq', 'câu hỏi']
            
            # SMART DETECTION: Nếu message ngắn và không có keyword đặc biệt → GIẢ ĐỊNH LÀ TÊN SÁCH
            word_count = len(user_message.split())
            has_explicit_search = any(keyword in message_lower for keyword in explicit_search_keywords)
            has_general_keyword = any(keyword in message_lower for keyword in general_keywords)
            has_borrow_keyword = any(keyword in message_lower for keyword in borrow_keywords)
            has_faq_keyword = any(keyword in message_lower for keyword in faq_keywords)
            
            # Kiểm tra xem có phải câu hỏi KHÔNG phải về tìm sách
            question_markers = ['?', 'thế nào', 'như thế', 'làm sao', 'tại sao', 'vì sao', 'có phải', 'có đúng']
            has_non_search_question = any(q in message_lower for q in question_markers)
            
            # Nếu message ngắn (3-15 từ) và KHÔNG phải câu hỏi phức tạp → Tự động search!
            is_likely_book_title = (
                3 <= word_count <= 15 and  # Message ngắn
                not has_borrow_keyword and  # KHÔNG hỏi về mượn/trả
                not has_faq_keyword and     # KHÔNG hỏi về hướng dẫn
                not has_non_search_question  # KHÔNG phải câu hỏi
            )
            
            logger.debug(f"Smart detection: word_count={word_count}, has_explicit={has_explicit_search}, has_general={has_general_keyword}, is_likely_title={is_likely_book_title}")
            
            # 1. Thông tin bạn đọc (nếu hỏi về mượn/trả)
            if patron_id and has_borrow_keyword:
                patron_context = build_koha_context_for_patron(patron_id)
                if patron_context:
                    context_parts.append(patron_context)
            
            # 2. Tìm kiếm sách
            # Logic: 
            # - Nếu có EXPLICIT search keyword ("tìm", "muốn tìm") → Luôn search
            # - Nếu có GENERAL keyword ("sách") NHƯNG có question marker ("làm sao") → KHÔNG search (trừ khi có explicit)
            # - Nếu likely_book_title (ngắn, không có question) → Auto search
            should_search = (
                has_explicit_search or  # Explicit search → Always search
                (is_likely_book_title) or  # Likely book title → Auto search
                (has_general_keyword and not has_non_search_question)  # General keyword but not a question
            )
            
            if should_search:
                # Extract search query
                if is_likely_book_title and not has_explicit_search and not has_general_keyword:
                    # Nếu là tên sách thuần túy → Dùng toàn bộ message
                    search_query = user_message.strip()
                    logger.info(f"🎯 SMART DETECTION: Treating entire message as book title: '{search_query}'")
                else:
                    # Nếu có keyword → Extract như bình thường
                    search_query = self._extract_search_query(user_message)
                
                if search_query and len(search_query) >= 3:
                    logger.info(f"🔍 AUTO-SEARCHING for: '{search_query}'")
                    books_context = build_koha_context_for_books(search_query, limit=5)
                    if books_context:
                        context_parts.append(books_context)
            
            # 3. FAQ (nếu hỏi về hướng dẫn/quy định)
            if has_faq_keyword:
                faq_context = build_faq_context(limit=5)
                if faq_context and 'Không có dữ liệu' not in faq_context:
                    context_parts.append(faq_context)
            
            return "\n\n".join(context_parts) if context_parts else ""
            
        except Exception as e:
            logger.warning(f"Failed to build Koha context: {e}")
            return ""
    
    def _extract_search_query(self, message: str) -> str:
        """
        Trích xuất từ khóa tìm kiếm từ message
        
        Args:
            message: User message
            
        Returns:
            Search query string
        """
        import re
        
        # Patterns để extract title chính xác - ƯU TIÊN CAO ĐẾN THẤP
        patterns = [
            # Pattern 1: Nội dung trong dấu ngoặc kép (cao nhất)
            r'["""](.+?)["""]',
            
            # Pattern 2: "tìm/có sách [về/của] X" → lấy X
            r'(?:tìm|tìm kiếm|có|gợi ý).*?sách\s+(?:về|của)?\s*(.+?)(?:\s+(?:không|nào|gì)|\s*$)',
            
            # Pattern 3: "muốn tìm quyển/cuốn X" → lấy X
            r'(?:muốn|cho tôi|giúp tôi).*?(?:tìm|lấy).*?(?:quyển|cuốn)\s+(.+?)(?:\s*$|\s+(?:không|nào|gì))',
            
            # Pattern 4: "sách/quyển/cuốn X" → lấy X (đơn giản nhất)
            r'(?:sách|quyển|cuốn)\s+(.+?)(?:\s*$|\s+(?:không|nào|gì))',
        ]
        
        for i, pattern in enumerate(patterns, 1):
            match = re.search(pattern, message, re.IGNORECASE)
            if match:
                extracted = match.group(1).strip()
                # Loại bỏ các từ thừa ở đầu
                for prefix in ['về', 'của', 'là', 'tên']:
                    if extracted.lower().startswith(prefix + ' '):
                        extracted = extracted[len(prefix):].strip()
                
                if len(extracted) >= 3:
                    logger.debug(f"Extracted '{extracted}' using pattern {i}")
                    return extracted
        
        # Fallback: lấy các từ có nghĩa, bỏ stop words
        message_lower = message.lower()
        
        # Các từ để loại bỏ - MỞ RỘNG LIST
        stop_words = {
            'tìm', 'tìm kiếm', 'sách', 'về', 'cho', 'tôi', 'mình', 'có', 'không',
            'gợi ý', 'đề xuất', 'giúp', 'search', 'find', 'book', 'recommend',
            'muốn', 'được', 'quyển', 'cuốn', 'nào', 'gì', 'thì', 'là', 'ạ', 'nhé',
            'của', 'trong', 'với', 'và', 'hoặc', 'hay', 'thế', 'nào'
        }
        
        # Split và filter
        words = message_lower.split()
        query_words = [w for w in words if w not in stop_words and len(w) >= 2]
        
        result = " ".join(query_words[:5])  # Lấy tối đa 5 từ khóa
        logger.debug(f"Extracted search query (fallback): '{result}'")
        return result
    
    def generate_response(
        self,
        user_message: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
        context: Optional[str] = None,
        instruction_type: str = 'default'
    ) -> str:
        """
        Tạo response từ Gemini API
        
        Args:
            user_message: Tin nhắn từ người dùng
            chat_history: Lịch sử chat trước đó
            context: Context bổ sung
            instruction_type: Loại instruction
        
        Returns:
            Response text từ AI
        """
        try:
            # Validate input
            self.validator.validate_message(user_message)
            chat_history = self.validator.validate_chat_history(chat_history or [])
            
            # Build prompt
            full_prompt = self.formatter.build_prompt(user_message, context)
            contents = self.formatter.build_contents(chat_history, full_prompt)
            
            # Get system instruction
            system_instruction = SYSTEM_INSTRUCTIONS.get(
                instruction_type,
                SYSTEM_INSTRUCTIONS['default']
            )
            
            # Call API
            logger.debug("Calling Gemini API with %d messages", len(contents))
            response = self._call_gemini_api(contents, system_instruction)
            
            # Validate response
            if not response:
                logger.warning("Received null response from Gemini API")
                raise EmptyResponseError()
            
            # Với SDK mới, response có thuộc tính text trực tiếp
            try:
                response_text = response.text
            except (ValueError, AttributeError) as e:
                logger.error("Cannot access response.text: %s", str(e))
                logger.debug("Response object: %s", response)
                raise EmptyResponseError("AI không trả về nội dung hợp lệ") from e
            
            if not response_text or not response_text.strip():
                logger.warning("Empty response text")
                raise EmptyResponseError("AI trả về nội dung trống")
            
            logger.info("Generated response: %d characters", len(response_text))
            return response_text.strip()
                
        except (ValidationError, EmptyResponseError):
            raise
        except Exception as e:
            logger.error("Error in generate_response: %s", str(e), exc_info=True)
            raise GeminiAPIError(f"Lỗi khi gọi AI: {str(e)}") from e
    
    def generate_book_recommendation(
        self,
        user_preferences: Dict[str, Any],
        available_books: List[Dict[str, Any]]
    ) -> str:
        """
        Tạo gợi ý sách dựa trên sở thích
        
        Args:
            user_preferences: Sở thích người dùng
            available_books: Danh sách sách có sẵn
        
        Returns:
            Gợi ý sách từ AI
        """
        try:
            self.validator.validate_books_list(available_books)
            
            # Giới hạn số lượng sách
            max_books = self.config.get('MAX_BOOKS_IN_CONTEXT', 30)
            limited_books = available_books[:max_books]
            
            # Build prompt
            prompt = self.formatter.build_recommendation_prompt(
                user_preferences,
                limited_books
            )
            
            logger.debug("Generating recommendations for %d books", len(limited_books))
            return self.generate_response(
                user_message=prompt,
                instruction_type='recommendation'
            )
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error("Error in generate_book_recommendation: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi tạo gợi ý: {str(e)}") from e
    
    def search_books_with_ai(
        self,
        query: str,
        books_data: List[Dict[str, Any]]
    ) -> str:
        """
        Tìm kiếm sách thông minh với AI
        
        Args:
            query: Câu hỏi/yêu cầu tìm kiếm
            books_data: Dữ liệu sách từ database
        
        Returns:
            Kết quả tìm kiếm
        """
        try:
            self.validator.validate_message(query)
            self.validator.validate_books_list(books_data)
            
            # Limit books
            max_books = self.config.get('MAX_BOOKS_IN_CONTEXT', 30)
            limited_books = books_data[:max_books]
            
            # Build prompt
            prompt = self.formatter.build_search_prompt(query, limited_books)
            books_info = self.formatter.format_books_details(limited_books)
            
            logger.debug("Searching in %d books with query: %s...", len(limited_books), query[:50])
            return self.generate_response(
                user_message=prompt,
                context=books_info,
                instruction_type='search'
            )
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error("Error in search_books_with_ai: %s", str(e))
            raise GeminiAPIError(f"Lỗi khi tìm kiếm: {str(e)}") from e
    
    def _call_gemini_api(
        self,
        contents: List[Dict[str, Any]],
        system_instruction: str,
        retry_count: int = 0,
        max_retries: int = 3
    ) -> Any:
        """Call Gemini API với SDK mới (google-genai) - Có retry logic"""
        try:
            # SDK mới: from google import genai
            # Cấu hình safety settings
            safety_settings = [
                types.SafetySetting(
                    category='HARM_CATEGORY_HARASSMENT',
                    threshold='BLOCK_MEDIUM_AND_ABOVE'
                ),
                types.SafetySetting(
                    category='HARM_CATEGORY_HATE_SPEECH',
                    threshold='BLOCK_MEDIUM_AND_ABOVE'
                ),
                types.SafetySetting(
                    category='HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    threshold='BLOCK_MEDIUM_AND_ABOVE'
                ),
                types.SafetySetting(
                    category='HARM_CATEGORY_DANGEROUS_CONTENT',
                    threshold='BLOCK_MEDIUM_AND_ABOVE'
                ),
            ]
            
            # Generation config
            generation_config = types.GenerateContentConfig(
                temperature=self.config.get('GEMINI_TEMPERATURE', 0.7),
                max_output_tokens=self.config.get('GEMINI_MAX_TOKENS', 1000),
                top_p=self.config.get('GEMINI_TOP_P', 0.95),
                top_k=self.config.get('GEMINI_TOP_K', 40),
                system_instruction=system_instruction,
                safety_settings=safety_settings
            )
            
            # Tách lịch sử và message cuối
            current_message = contents[-1]['parts'][0] if contents else ""
            
            # Với SDK mới, nếu có history thì cần xử lý khác
            # Hiện tại chỉ gửi message đơn với system instruction
            # TODO: Implement chat history properly với SDK mới
            
            # Generate content với SDK mới
            logger.debug(f"[API Call #{retry_count + 1}] Sending request to Gemini {self.model_id}...")
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=current_message,
                config=generation_config
            )
            
            logger.debug("Gemini API call successful")
            return response
            
        except Exception as e:
            error_str = str(e)
            status_code = None
            error_type = "UNKNOWN"
            
            if '503' in error_str or 'Service Unavailable' in error_str or 'UNAVAILABLE' in error_str:
                error_type = "SERVICE_OVERLOADED"
                status_code = 503
                user_message = "AI đang quá tải. Vui lòng thử lại trong vài giây."
                
                # Retry nếu chưa vượt quá max_retries
                if retry_count < max_retries:
                    wait_time = 2 ** (retry_count + 1)  # Exponential backoff: 2s, 4s, 8s
                    logger.warning(f"[Retry {retry_count + 1}/{max_retries}] Service overloaded. Waiting {wait_time}s...")
                    import time
                    time.sleep(wait_time)
                    return self._call_gemini_api(contents, system_instruction, retry_count + 1, max_retries)
                else:
                    logger.error("Max retries reached. Service still overloaded.")
                    
            elif '429' in error_str or 'Rate limit' in error_str or 'RESOURCE_EXHAUSTED' in error_str:
                error_type = "RATE_LIMITED"
                status_code = 429
                user_message = "Yêu cầu quá nhiều. Vui lòng đợi một lát rồi thử lại."
                logger.warning(f"Rate limited by Gemini API. Waiting before retry...")
                if retry_count < max_retries:
                    wait_time = 5 + (2 * retry_count)  # 5s, 7s, 9s
                    import time
                    time.sleep(wait_time)
                    return self._call_gemini_api(contents, system_instruction, retry_count + 1, max_retries)
                    
            elif '401' in error_str or '403' in error_str or 'PERMISSION_DENIED' in error_str:
                error_type = "AUTH_ERROR"
                status_code = 401
                user_message = "Lỗi xác thực. Vui lòng kiểm tra cài đặt API key."
                logger.error("Authentication/Authorization failed with Gemini API")
                
            elif '400' in error_str or 'BadRequest' in error_str or 'INVALID_ARGUMENT' in error_str:
                error_type = "BAD_REQUEST"
                status_code = 400
                user_message = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại tin nhắn."
                logger.error(f"Bad request to Gemini API: {error_str}")
                
            elif 'timeout' in error_str.lower() or 'deadline' in error_str.lower():
                error_type = "TIMEOUT"
                status_code = 504
                user_message = "⏱Yêu cầu quá lâu. Vui lòng thử lại."
                logger.error("Gemini API request timed out")
                if retry_count < max_retries:
                    wait_time = 3
                    import time
                    time.sleep(wait_time)
                    return self._call_gemini_api(contents, system_instruction, retry_count + 1, max_retries)
                    
            elif 'safety' in error_str.lower() or 'blocked' in error_str.lower():
                error_type = "SAFETY_BLOCKED"
                status_code = 400
                user_message = "Tin nhắn bị chặn bởi bộ lọc an toàn. Vui lòng rephrase."
                logger.warning(f"Safety filter blocked message: {error_str}")
                
            elif 'overloaded' in error_str.lower() or 'overloaded' in error_str:
                error_type = "MODEL_OVERLOADED"
                status_code = 503
                user_message = "Model đang quá tải. Vui lòng thử lại sau."
                if retry_count < max_retries:
                    wait_time = 3 + (2 * retry_count)
                    logger.warning(f"Model overloaded. Retry {retry_count + 1}/{max_retries} after {wait_time}s")
                    import time
                    time.sleep(wait_time)
                    return self._call_gemini_api(contents, system_instruction, retry_count + 1, max_retries)
                    
            else:
                error_type = "UNKNOWN_ERROR"
                user_message = f"Lỗi khi xử lý tin nhắn: {error_str[:100]}"
                logger.error(f"Unknown API error: {error_str}")
            
            # Log chi tiết lỗi
            logger.error(f"""
                        ╔═══════════════════════════════════════════════════════════╗
                        ║ GEMINI API ERROR DETAILS
                        ╠═══════════════════════════════════════════════════════════╣
                        ║ Type: {error_type}
                        ║ Status: {status_code}
                        ║ Message: {user_message}
                        ║ Retry: {retry_count}/{max_retries}
                        ║ Original Error: {error_str}
                        ╚═══════════════════════════════════════════════════════════╝
                        """)
            
            raise GeminiAPIError(user_message) from e
    
    # ============================================================================
    # FUNCTION CALLING & STRUCTURED OUTPUT
    # ============================================================================
    
    def generate_response_with_session_structured(
        self,
        conversation_id: str,
        user_message: str,
        instruction_type: str = 'default',
        history_service = None,
        latency_ms: int = 0,
        patron_id: Optional[str] = None,
        auto_inject_koha_context: bool = False
    ):
        """
        Tạo response với FUNCTION CALLING - LUÔN trả về JSON format {text, books}
        
        Returns:
            Dict {text: str, books: list|null} - LUÔN là JSON format
        """
        try:
            import json
            from app.services.prompt.schemas import get_chat_response_schema
            
            # Validate input
            self.validator.validate_message(user_message)
            
            # Get or create chat session
            chat_session = self.get_or_create_chat_session(
                conversation_id,
                instruction_type,
                history_service
            )
            
            # Build Koha context tự động nếu cần
            enhanced_message = user_message
            if auto_inject_koha_context:
                koha_context = self._build_koha_context_from_message(user_message, patron_id)
                if koha_context:
                    enhanced_message = f"{user_message}\n\n[CONTEXT]:\n{koha_context}"
                    logger.debug(f"Injected Koha context: {len(koha_context)} chars")
            
            # Call AI với tools enabled
            schema = get_chat_response_schema()
            response, has_tool_call = self._call_gemini_api_with_tools(
                chat_session=chat_session,
                message=enhanced_message,
                schema=schema
            )
            
            try:
                response_json = json.loads(response.text)
            except (json.JSONDecodeError, AttributeError) as e:
                # Fallback: Nếu không parse được JSON, tạo JSON từ text
                logger.warning(f"Failed to parse JSON response: {e}, using fallback")
                response_text = response.text.strip() if hasattr(response, 'text') else str(response)
                response_json = {
                    "text": response_text,
                    "books": None
                }
            
            # Validate
            if not response_json.get('text'):
                raise EmptyResponseError("AI không trả về text")
            
            if 'books' not in response_json:
                response_json['books'] = None
            
            if response_json.get('books') and isinstance(response_json['books'], list) and len(response_json['books']) > 0:
                def get_accuracy_score(book):
                    accuracy_str = book.get('accuracy', '0%')
                    try:
                        return float(accuracy_str.replace('%', '').strip())
                    except (ValueError, AttributeError):
                        return 0.0
                
                sorted_books = sorted(response_json['books'], key=get_accuracy_score, reverse=True)
                response_json['books'] = sorted_books[:4]
            
            # Update history trong ChatSession sau khi có response
            try:
                response_text = response_json.get('text', '')
                if response_text:
                    # Add user message và AI response vào history
                    chat_session._loaded_history.append({
                        'role': 'user',
                        'content': user_message
                    })
                    chat_session._loaded_history.append({
                        'role': 'model',
                        'content': response_text
                    })
                    # Giới hạn history để tránh quá dài
                    max_history = 20
                    if len(chat_session._loaded_history) > max_history * 2:
                        chat_session._loaded_history = chat_session._loaded_history[-max_history * 2:]
                    logger.debug(f"Updated chat session history: {len(chat_session._loaded_history)} messages")
            except Exception as e:
                logger.warning(f"Failed to update chat session history: {str(e)}")
            
            if history_service:
                try:
                    history_service.save_chat_exchange(
                        conversation_id=conversation_id,
                        user_message=user_message,
                        assistant_message=response_json.get('text', ''),
                        latency_ms=latency_ms
                    )
                except Exception as db_error:
                    logger.warning(f"Failed to save to DB: {str(db_error)}")
            
            books_count = len(response_json.get('books') or [])
            logger.info(f"Generated JSON response: text={len(response_json.get('text', ''))} chars, books={books_count}")
            return response_json
            
        except (ValidationError, EmptyResponseError):
            raise
        except Exception as e:
            logger.error("Error in generate_response_with_session_structured: %s", str(e), exc_info=True)
            raise GeminiAPIError(f"Lỗi khi gọi AI: {str(e)}") from e
    
    def _format_books_for_context(self, books_data: List[Dict[str, Any]]) -> str:
        """
        Format books data thành text context cho Gemini
        
        Args:
            books_data: List of books từ search_helper
            
        Returns:
            Formatted context string
        """
        if not books_data:
            return ""
        
        context_lines = [f"KẾT QUẢ TÌM KIẾM: Tìm thấy {len(books_data)} cuốn sách:\n"]
        
        for idx, book in enumerate(books_data, 1):
            context_lines.append(f"{idx}. {book.get('title', 'Unknown')}")
            context_lines.append(f"   - Tác giả: {book.get('author', 'Unknown')}")
            context_lines.append(f"   - ID: {book.get('id', 'N/A')}")
            context_lines.append(f"   - Nguồn: {book.get('source', 'Unknown')}")
            
            if book.get('publisher'):
                context_lines.append(f"   - NXB: {book.get('publisher')}")
            if book.get('year'):
                context_lines.append(f"   - Năm: {book.get('year')}")
            if book.get('subjects'):
                subjects_str = ', '.join(book['subjects'][:3])  # Lấy 3 chủ đề đầu
                context_lines.append(f"   - Chủ đề: {subjects_str}")
            context_lines.append("")
        
        return "\n".join(context_lines)
    
    def _call_gemini_api_with_tools(
        self,
        chat_session: 'ChatSession',
        message: str,
        schema: Any,
        max_iterations: int = 3
    ):
        """
        Gọi Gemini API với Function Calling - SỬ DỤNG HISTORY từ ChatSession
        
        Args:
            chat_session: ChatSession instance (chứa history)
            message: User message hiện tại
            schema: Response schema (dùng khi có tool call)
            max_iterations: Max số lần gọi tool
            
        Returns:
            Tuple (response, has_tool_call: bool)
        """
        try:
            from app.services.prompt.tools import get_library_tools, execute_tool
            import json
            
            tools = get_library_tools()
            
            # Build contents từ history + current message
            # Gemini SDK mới cần format: list of Content objects
            history = chat_session.get_loaded_history()
            
            # Luôn build contents là list of Content objects
            contents = []
            
            # Nếu có history, add history messages vào contents
            if history:
                for msg in history:
                    role = "user" if msg.get('role') == 'user' else "model"
                    content = msg.get('content', '')
                    if content.strip():
                        # Sử dụng types.Content object
                        contents.append(types.Content(
                            role=role,
                            parts=[types.Part(text=content)]
                        ))
            
            # Add current message
            contents.append(types.Content(
                role='user',
                parts=[types.Part(text=message)]
            ))
            
            # Gọi API với history + tools
            response_with_tools = self.client.models.generate_content(
                model=self.model_id,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=self.config.get('GEMINI_TEMPERATURE', 0.7),
                    max_output_tokens=self.config.get('GEMINI_MAX_TOKENS', 2000),
                    top_p=self.config.get('GEMINI_TOP_P', 0.95),
                    top_k=self.config.get('GEMINI_TOP_K', 40),
                    system_instruction=SYSTEM_INSTRUCTIONS.get('default'),
                    tools=tools,  # Enable tools
                    tool_config=types.ToolConfig(
                        function_calling_config=types.FunctionCallingConfig(
                            mode="ANY"
                        )
                    )
                )
            )
            
            response = response_with_tools
            has_tool_call = False
            tool_books_data = []
            
            iteration = 0
            while iteration < max_iterations:
                if hasattr(response, 'candidates') and response.candidates:
                    candidate = response.candidates[0]
                    
                    if hasattr(candidate, 'content'):
                        content = candidate.content
                        
                        if hasattr(content, 'parts'):
                            parts = content.parts
                            
                            function_called = False
                            for idx, part in enumerate(parts):
                                if hasattr(part, 'function_call') and part.function_call:
                                    function_call = part.function_call
                                    tool_name = function_call.name
                                    tool_args = dict(function_call.args) if function_call.args else {}
                                    
                                    tool_result = execute_tool(tool_name, tool_args)
                                    
                                    if tool_name == "search_books" and tool_result.get('success'):
                                        tool_books_data = tool_result.get('books', [])
                                        has_tool_call = True
                                        books_context = self._format_books_for_context(tool_books_data)
                                        
                                        # Build contents với history + current message + tool result
                                        # contents luôn là list of Content objects
                                        contents_with_result = contents.copy()
                                        contents_with_result.append(types.Content(
                                            role='model',
                                            parts=[types.Part(text=f"[TOOL RESULT]:\n{books_context}")]
                                        ))
                                        
                                        response = self.client.models.generate_content(
                                            model=self.model_id,
                                            contents=contents_with_result,
                                            config=types.GenerateContentConfig(
                                                temperature=self.config.get('GEMINI_TEMPERATURE', 0.7),
                                                max_output_tokens=self.config.get('GEMINI_MAX_TOKENS', 2000),
                                                system_instruction=SYSTEM_INSTRUCTIONS.get('default'),
                                                response_mime_type="application/json",
                                                response_schema=schema
                                            )
                                        )
                                        function_called = True
                                        iteration += 1
                                        break
                        
                            if not function_called:
                                break
                        else:
                            break
                    else:
                        break
                else:
                    break
            
            if not has_tool_call:
                # Không có tool call, gọi với history + current message
                # contents đã được format đúng ở trên
                response = self.client.models.generate_content(
                    model=self.model_id,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        temperature=self.config.get('GEMINI_TEMPERATURE', 0.7),
                        max_output_tokens=self.config.get('GEMINI_MAX_TOKENS', 2000),
                        top_p=self.config.get('GEMINI_TOP_P', 0.95),
                        top_k=self.config.get('GEMINI_TOP_K', 40),
                        system_instruction=SYSTEM_INSTRUCTIONS.get('default'),
                        response_mime_type="application/json",
                        response_schema=schema
                    )
                )
            
            return response, has_tool_call
            
        except Exception as e:
            logger.error(f"Error calling Gemini with tools: {str(e)}", exc_info=True)
            raise GeminiAPIError(f"Lỗi khi gọi AI: {str(e)}") from e


# Singleton pattern với class để tránh global statement
_singleton_lock = threading.Lock()

class PromptServiceSingleton:
    """Singleton container cho PromptService"""
    _instance: Optional[PromptService] = None
    
    @classmethod
    def get_instance(cls, config) -> PromptService:
        """Lấy instance của PromptService (Thread-safe)"""
        if cls._instance is None:
            with _singleton_lock:
                if cls._instance is None:
                    logger.info("Initializing PromptService singleton")
                    cls._instance = PromptService(config)
        
        return cls._instance
    
    @classmethod
    def reset(cls) -> None:
        """Reset singleton instance (dùng cho testing)"""
        with _singleton_lock:
            cls._instance = None
            logger.info("PromptService singleton reset")


from flask import current_app

def get_prompt_service() -> PromptService:
    """Lấy instance của PromptService (Singleton)"""
    return PromptServiceSingleton.get_instance(current_app.config)
