"""KohaClient - Integration with Koha REST API

This client wraps basic Koha catalog operations so AI and other services
can fetch live bibliographic data.

Authentication modes supported:
- API Key: provide KOHA_API_KEY -> sent as `X-Koha-Auth` header (preferred)
- Basic Auth: provide KOHA_USERNAME + KOHA_PASSWORD -> sent via HTTP Basic

Environment variables (see config + .env.example):
KOHA_BASE_URL=https://your-koha-host:port
KOHA_API_KEY=optional-api-key
KOHA_AUTH_MODE=api_key|basic (default: api_key)
KOHA_USERNAME=admin (only if KOHA_AUTH_MODE=basic)
KOHA_PASSWORD=*** (only if KOHA_AUTH_MODE=basic)

NOTE: Do NOT commit real credentials.
"""
from __future__ import annotations
import base64
import logging
from typing import Any, Dict, Optional
import requests
from app.config import Config
from app.exceptions import ApiError

logger = logging.getLogger(__name__)

class KohaClient:
    def __init__(self,
                 base_url: Optional[str] = None,
                 auth_mode: Optional[str] = None,
                 api_key: Optional[str] = None,
                 username: Optional[str] = None,
                 password: Optional[str] = None):
        self.base_url = (base_url or Config.KOHA_BASE_URL).rstrip('/')
        self.auth_mode = (auth_mode or Config.KOHA_AUTH_MODE or 'api_key').lower()
        self.api_key = api_key or Config.KOHA_API_KEY
        self.username = username or Config.KOHA_USERNAME
        self.password = password or Config.KOHA_PASSWORD

        if not self.base_url:
            raise ApiError("KOHA_BASE_URL chưa được cấu hình", 500)

        if self.auth_mode == 'api_key' and not self.api_key:
            raise ApiError("KOHA_API_KEY chưa được cấu hình (hoặc chuyển sang basic)", 500)
        if self.auth_mode == 'basic' and (not self.username or not self.password):
            raise ApiError("KOHA_USERNAME/KOHA_PASSWORD chưa được cấu hình cho basic auth", 500)

    def _headers(self) -> Dict[str, str]:
        # Simple JSON Accept header - Koha gets confused with complex Accept strings
        headers = {
            'Accept': 'application/json'
        }
        if self.auth_mode == 'api_key':
            headers['X-Koha-Auth'] = self.api_key
        else:  # basic
            token = base64.b64encode(f"{self.username}:{self.password}".encode()).decode()
            headers['Authorization'] = f"Basic {token}"
        return headers
    
    def _log_api_call(self, method: str, endpoint: str, params: Optional[Dict] = None, data: Optional[Dict] = None):
        """Log API call for debugging - shows that we're calling real Koha API"""
        logger.info("=" * 80)
        logger.info("🔵 KOHA API CALL")
        logger.info(f"   Method: {method}")
        logger.info(f"   URL: {self.base_url}{endpoint}")
        if params:
            logger.info(f"   Params: {params}")
        if data:
            logger.info(f"   Data: {data}")
        logger.info("=" * 80)
    
    def _log_api_response(self, status_code: int, data_preview: str = None, count: int = None):
        """Log API response for debugging"""
        logger.info("=" * 80)
        logger.info(f"✅ KOHA API RESPONSE - Status: {status_code}")
        if count is not None:
            logger.info(f"   Records returned: {count}")
        if data_preview:
            logger.info(f"   Preview: {data_preview[:200]}...")
        logger.info("=" * 80)

    def _handle_response(self, resp: requests.Response) -> Any:
        if resp.status_code >= 400:
            text = resp.text[:1000]
            # Log status + body for debugging (may contain details why Koha returned 400)
            logger.warning("Koha API error %s: %s", resp.status_code, text)
            # Try to include JSON error body when possible
            try:
                body = resp.json()
            except Exception:
                body = text
            raise ApiError(f"Koha API trả về lỗi {resp.status_code}: {body}", resp.status_code)
        
        try:
            # Koha sometimes returns response with BOM or garbage chars
            # Try to clean the content before parsing
            content = resp.content
            
            # Remove UTF-8 BOM if present
            if content.startswith(b'\xef\xbb\xbf'):
                content = content[3:]
            
            # Decode and parse
            text = content.decode('utf-8', errors='ignore').strip()
            
            # Parse JSON
            import json
            return json.loads(text)
            
        except ValueError as e:
            logger.error(f"JSON parse error: {e}, response[:200]: {resp.text[:200]}")
            raise ApiError(f"Koha API trả về dữ liệu không phải JSON: {str(e)}", 502)

    # --------------------- Public Methods ---------------------
    def search_biblios(self, query: str, limit: int = 20, offset: int = 0) -> Dict[str, Any]:
        """Tìm kiếm biblios (bản ghi thư mục).

        Endpoint: GET /api/v1/biblios
        Koha yêu cầu JSON query format: ?q={"field": {"-like": "%keyword%"}}
        
        Returns normalized dict: { 'query': ..., 'count': N, 'results': [...] }
        """
        import json
        
        if not query or len(query) < 2:
            raise ApiError("Từ khóa tìm kiếm quá ngắn", 400)

        safe_query = query.strip()
        url = f"{self.base_url}/api/v1/biblios"
        
        # Try multiple search strategies
        search_strategies = [
            # Strategy 1: Search title only (simplest, most reliable)
            {"title": {"-like": f"%{safe_query}%"}},
            
            # Strategy 2: Search author only
            {"author": {"-like": f"%{safe_query}%"}},
            
            # Strategy 3: No filter - get all and filter client-side (fallback)
            {}
        ]
        
        for idx, koha_query in enumerate(search_strategies):
            try:
                params = {
                    '_per_page': limit,
                    '_page': (offset // limit) + 1 if limit > 0 else 1
                }
                
                if koha_query:  # Only add 'q' if query not empty
                    # Use ensure_ascii=False to preserve Unicode characters
                    params['q'] = json.dumps(koha_query, ensure_ascii=False)
                
                # DEBUG LOG
                self._log_api_call('GET', '/api/v1/biblios', params=params)
                
                logger.info("Koha search strategy %d: %s with params=%s", idx + 1, url, params)
                resp = requests.get(url, headers=self._headers(), params=params, timeout=15)
                logger.info("Koha response: status=%d, content_length=%d", resp.status_code, len(resp.text))
                
                data = self._handle_response(resp)
                
                # Normalize results - Koha trả về list trực tiếp
                results = data if isinstance(data, list) else []
                logger.info("Koha data type: %s, results count: %d", type(data).__name__, len(results))
                
                # DEBUG LOG
                preview = str(results[0]) if results else "No results"
                self._log_api_response(resp.status_code, data_preview=preview, count=len(results))
                
                # If we got results, return them
                if results:
                    logger.info(f"Koha search strategy {idx + 1} succeeded with {len(results)} results")
                    return {'query': safe_query, 'count': len(results), 'results': results}
                else:
                    logger.info(f"Strategy {idx + 1} returned 0 results, trying next strategy")
                    
            except Exception as e:
                logger.warning(f"Strategy {idx + 1} failed with error: {e}", exc_info=True)
                continue
        
        # All strategies failed - return empty
        logger.warning(f"All search strategies exhausted for query '{safe_query}', returning empty")
        return {'query': safe_query, 'count': 0, 'results': []}

    def get_biblio(self, biblio_id: str | int) -> Dict[str, Any]:
        """Fetch a single biblio record by id."""
        url = f"{self.base_url}/api/v1/biblios/{biblio_id}"
        
        # DEBUG LOG
        self._log_api_call('GET', f'/api/v1/biblios/{biblio_id}')
        
        logger.debug("Koha get biblio: %s", url)
        resp = requests.get(url, headers=self._headers(), timeout=15)
        data = self._handle_response(resp)
        
        # DEBUG LOG
        self._log_api_response(resp.status_code, data_preview=str(data)[:200])
        
        return {'id': biblio_id, 'record': data}

    def get_items_by_biblio(self, biblio_id: str | int, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Lấy danh sách items (bản vật lý) của một biblio.

        Endpoint: GET /api/v1/biblios/{biblio_id}/items
        hoặc GET /api/v1/items?biblio_id={biblio_id}
        """
        # Thử endpoint chuẩn trước
        url = f"{self.base_url}/api/v1/biblios/{biblio_id}/items"
        logger.debug("Koha get items by biblio: %s", url)
        try:
            resp = requests.get(url, headers=self._headers(), timeout=15)
            data = self._handle_response(resp)
        except Exception as e:
            # Fallback sang /api/v1/items với biblio_id param
            logger.debug("Trying fallback /api/v1/items?biblio_id=%s", biblio_id)
            url = f"{self.base_url}/api/v1/items"
            params = {'biblio_id': str(biblio_id), 'limit': limit, 'offset': offset}
            resp = requests.get(url, headers=self._headers(), params=params, timeout=15)
            data = self._handle_response(resp)

        items = data if isinstance(data, list) else data.get('items', []) or data.get('results', [])
        count = len(items) if isinstance(items, list) else data.get('count', 0)
        return {'biblio_id': biblio_id, 'count': count, 'items': items}
    
    def get_item(self, item_id: str | int) -> Dict[str, Any]:
        """Lấy thông tin một item cụ thể.
        
        Endpoint: GET /api/v1/items/{item_id}
        """
        url = f"{self.base_url}/api/v1/items/{item_id}"
        logger.debug("Koha get item: %s", url)
        resp = requests.get(url, headers=self._headers(), timeout=15)
        data = self._handle_response(resp)
        return {'item_id': item_id, 'item': data}

    # --------------------- Loan / circulation methods (deprecated, giữ để backward compat) ---------------------
    def _try_get(self, paths: list, params: Optional[Dict[str, Any]] = None, timeout: int = 15) -> Any:
        """Try multiple relative paths until one returns a successful JSON response.

        paths: list of relative paths (without base_url). The first that returns
        HTTP 200 and valid JSON is returned.
        """
        last_exc = None
        for p in paths:
            url = p if p.startswith('http') else f"{self.base_url}{p if p.startswith('/') else '/' + p}"
            try:
                logger.debug("Koha try GET %s params=%s", url, params)
                resp = requests.get(url, headers=self._headers(), params=params or {}, timeout=timeout)
                data = self._handle_response(resp)
                return data
            except Exception as e:
                last_exc = e
                logger.debug("Koha path failed %s: %s", url, e)
                continue
        # if none worked, raise last exception
        if last_exc:
            raise last_exc
        return None

    # --------------------- Patrons (bạn đọc) ---------------------
    def get_patron(self, patron_id: str | int) -> Dict[str, Any]:
        """Lấy thông tin patron/bạn đọc theo ID.
        
        Endpoint: GET /api/v1/patrons/{patron_id}
        """
        url = f"{self.base_url}/api/v1/patrons/{patron_id}"
        
        # DEBUG LOG
        self._log_api_call('GET', f'/api/v1/patrons/{patron_id}')
        
        logger.debug("Koha get patron: %s", url)
        resp = requests.get(url, headers=self._headers(), timeout=15)
        data = self._handle_response(resp)
        
        # DEBUG LOG
        self._log_api_response(resp.status_code, data_preview=str(data)[:200])
        
        return {'patron_id': patron_id, 'patron': data}

    def search_patrons(self, query: str = "", limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """Tìm kiếm patrons.
        
        Endpoint: GET /api/v1/patrons
        """
        params = {'limit': limit, 'offset': offset}
        if query:
            params['q'] = query
        url = f"{self.base_url}/api/v1/patrons"
        logger.debug("Koha search patrons: %s params=%s", url, params)
        resp = requests.get(url, headers=self._headers(), params=params, timeout=15)
        data = self._handle_response(resp)
        results = data if isinstance(data, list) else data.get('results', [])
        return {'query': query, 'count': len(results), 'patrons': results}

    # --------------------- Checkouts (mượn sách) ---------------------
    def get_patron_checkouts(self, patron_id: str | int) -> Dict[str, Any]:
        """Lấy danh sách sách đang mượn của patron.
        
        Endpoint: GET /api/v1/patrons/{patron_id}/checkouts
        hoặc GET /api/v1/checkouts?patron_id={patron_id}
        """
        # Thử endpoint chuẩn trước
        url = f"{self.base_url}/api/v1/patrons/{patron_id}/checkouts"
        logger.debug("Koha get patron checkouts: %s", url)
        try:
            resp = requests.get(url, headers=self._headers(), timeout=15)
            data = self._handle_response(resp)
        except Exception as e:
            # Fallback sang /api/v1/checkouts với patron_id param
            logger.debug("Trying fallback /api/v1/checkouts?patron_id=%s", patron_id)
            url = f"{self.base_url}/api/v1/checkouts"
            resp = requests.get(url, headers=self._headers(), params={'patron_id': str(patron_id)}, timeout=15)
            data = self._handle_response(resp)
        
        checkouts = data if isinstance(data, list) else data.get('checkouts', []) or data.get('results', [])
        return {'patron_id': patron_id, 'count': len(checkouts), 'checkouts': checkouts}

    def get_checkout(self, checkout_id: str | int) -> Dict[str, Any]:
        """Lấy thông tin một checkout cụ thể.
        
        Endpoint: GET /api/v1/checkouts/{checkout_id}
        """
        url = f"{self.base_url}/api/v1/checkouts/{checkout_id}"
        logger.debug("Koha get checkout: %s", url)
        resp = requests.get(url, headers=self._headers(), timeout=15)
        data = self._handle_response(resp)
        return {'checkout_id': checkout_id, 'checkout': data}

    # --------------------- Holds (giữ chỗ/đặt trước) ---------------------
    def get_patron_holds(self, patron_id: str | int) -> Dict[str, Any]:
        """Lấy danh sách holds/đặt chỗ của patron.
        
        Endpoint: GET /api/v1/patrons/{patron_id}/holds
        """
        url = f"{self.base_url}/api/v1/patrons/{patron_id}/holds"
        logger.debug("Koha get patron holds: %s", url)
        resp = requests.get(url, headers=self._headers(), timeout=15)
        data = self._handle_response(resp)
        holds = data if isinstance(data, list) else data.get('holds', []) or data.get('results', [])
        return {'patron_id': patron_id, 'count': len(holds), 'holds': holds}

    def get_hold(self, hold_id: str | int) -> Dict[str, Any]:
        """Lấy thông tin một hold cụ thể.
        
        Endpoint: GET /api/v1/holds/{hold_id}
        """
        url = f"{self.base_url}/api/v1/holds/{hold_id}"
        logger.debug("Koha get hold: %s", url)
        resp = requests.get(url, headers=self._headers(), timeout=15)
        data = self._handle_response(resp)
        return {'hold_id': hold_id, 'hold': data}

    # Giữ lại method cũ để backward compatible, nhưng gọi sang method mới
    def get_loans_by_borrower(self, borrower_id: str | int, status: Optional[str] = None, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Deprecated: dùng get_patron_checkouts() thay thế.
        
        Wrapper cho backward compatibility.
        """
        logger.warning("get_loans_by_borrower is deprecated, use get_patron_checkouts instead")
        result = self.get_patron_checkouts(borrower_id)
        # Đổi key 'checkouts' thành 'loans' để giữ API cũ
        result['loans'] = result.pop('checkouts', [])
        result['borrower_id'] = result.pop('patron_id')
        return result

    def get_loans_by_item(self, item_id: str | int, limit: int = 100, offset: int = 0) -> Dict[str, Any]:
        """Deprecated: method cũ, giữ để tương thích ngược.
        
        Nên dùng get_item() để lấy thông tin item, status có thông tin checkout.
        """
        logger.warning("get_loans_by_item is deprecated")
        # Fallback đơn giản
        try:
            item_info = self.get_item(item_id)
            return {'item_id': item_id, 'count': 0, 'loans': [], 'note': 'Use get_item for current status'}
        except Exception as e:
            raise ApiError(f"Cannot fetch item info: {e}", 500)

    def get_recent_loans(self, limit: int = 50) -> Dict[str, Any]:
        """Deprecated: method cũ.
        
        Koha REST API không có endpoint 'recent loans' chung.
        Nên dùng get_patron_checkouts() với patron_id cụ thể.
        """
        logger.warning("get_recent_loans is deprecated - no generic endpoint in Koha REST API")
        return {'count': 0, 'loans': [], 'note': 'Use get_patron_checkouts(patron_id) instead'}

# Convenience singleton accessor
_koha_client: Optional[KohaClient] = None

def get_koha_client() -> KohaClient:
    global _koha_client
    if _koha_client is None:
        try:
            _koha_client = KohaClient()
        except ApiError as e:
            logger.error("Không khởi tạo được KohaClient: %s", e)
            raise
    return _koha_client
