"""
Koha Service - Core authentication and connection management
"""

import requests
import logging
from typing import Optional, Dict, Any
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from functools import wraps
from flask import current_app

logger = logging.getLogger(__name__)


class KohaAuthenticationError(Exception):
    """Raised when authentication with Koha fails"""
    pass


class KohaConnectionError(Exception):
    """Raised when connection to Koha fails"""
    pass


class KohaAPIError(Exception):
    """Raised when Koha API returns an error"""
    pass


def handle_koha_errors(func):
    """Decorator to handle Koha API errors"""
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except requests.exceptions.ConnectionError as e:
            logger.error(f"Connection error to Koha: {str(e)}")
            raise KohaConnectionError(f"Không thể kết nối đến Koha: {str(e)}")
        except requests.exceptions.Timeout as e:
            logger.error(f"Timeout connecting to Koha: {str(e)}")
            raise KohaConnectionError(f"Timeout kết nối Koha: {str(e)}")
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error from Koha: {str(e)}")
            raise KohaAPIError(f"Lỗi API Koha: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error with Koha: {str(e)}")
            raise
    return wrapper


class KohaService:
    """
    Service to manage Koha ILS connections
    Uses public API endpoints (no authentication required)
    """
    
    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize Koha Service
        
        Args:
            base_url: Base URL of Koha installation (e.g., http://103.124.95.249:8001)
        """
        self.base_url = base_url or current_app.config.get('KOHA_BASE_URL')
        
        if not self.base_url:
            raise ValueError("KOHA_BASE_URL must be configured")
        
        self.base_url = self.base_url.rstrip('/')
        self.session = self._create_session()
        
        logger.info(f"KohaService initialized with base_url: {self.base_url}")
    
    def _create_session(self) -> requests.Session:
        """
        Create a requests session with retry strategy and connection pooling
        """
        session = requests.Session()
        
        # Retry strategy
        retry_strategy = Retry(
            total=3,
            backoff_factor=1,
            status_forcelist=[429, 500, 502, 503, 504],
            allowed_methods=["HEAD", "GET", "POST", "PUT", "DELETE", "OPTIONS", "TRACE"]
        )
        
        adapter = HTTPAdapter(max_retries=retry_strategy, pool_connections=10, pool_maxsize=20)
        session.mount("http://", adapter)
        session.mount("https://", adapter)
        
        # Set default headers
        session.headers.update({
            'Accept': 'application/json'
        })
        
        return session
    
    def test_connection(self) -> Dict[str, Any]:
        """Test connection to Koha API"""
        try:
            response = self.session.get(f"{self.base_url}/api/v1/public/libraries", timeout=10)
            
            if response.status_code == 200:
                logger.info("Koha connection successful")
                return {
                    "status": "success",
                    "message": "Kết nối Koha thành công",
                    "base_url": self.base_url
                }
            else:
                raise KohaAPIError(f"Status code: {response.status_code}")
                
        except Exception as e:
            logger.error(f"Connection failed: {str(e)}")
            return {
                "status": "error",
                "message": f"Lỗi kết nối: {str(e)}",
                "base_url": self.base_url
            }
    
    @handle_koha_errors
    def get(self, endpoint: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Make GET request to Koha API"""
        url = f"{self.base_url}{endpoint}"
        logger.debug(f"GET {url}")
        
        response = self.session.get(url, params=params, timeout=30)
        response.raise_for_status()
        return response.json()
    
    @handle_koha_errors
    def post(self, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make POST request to Koha API"""
        url = f"{self.base_url}{endpoint}"
        logger.debug(f"POST {url}")
        
        response = self.session.post(url, json=data, timeout=30)
        response.raise_for_status()
        return response.json()
    
    @handle_koha_errors
    def put(self, endpoint: str, data: Optional[Dict] = None) -> Dict[str, Any]:
        """Make PUT request to Koha API"""
        url = f"{self.base_url}{endpoint}"
        logger.debug(f"PUT {url}")
        
        response = self.session.put(url, json=data, timeout=30)
        response.raise_for_status()
        return response.json()
    
    @handle_koha_errors
    def delete(self, endpoint: str) -> bool:
        """Make DELETE request to Koha API"""
        url = f"{self.base_url}{endpoint}"
        logger.debug(f"DELETE {url}")
        
        response = self.session.delete(url, timeout=30)
        response.raise_for_status()
        return True
    
    def close(self):
        """Close the session"""
        if self.session:
            self.session.close()
            logger.info("Koha session closed")
