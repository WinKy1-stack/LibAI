"""
Z39.50 Service Configuration
Defines connection settings for various Z39.50 library sources
"""

Z3950_SOURCES = {
    "loc": {
        "host": "z3950.loc.gov",
        "port": 7090,
        "database": "voyager",
        "name": "Library of Congress",
        "enabled": True,
        "timeout": 30,
        "max_results": 100,
        "syntax": "USMARC"
    },
    "uw": {
        "host": "na02.alma.exlibrisgroup.com",
        "port": 1921,
        "database": "01UWI_MAD",
        "name": "UW-Madison",
        "enabled": True,
        "timeout": 30,
        "max_results": 100,
        "syntax": "USMARC"
    },
    "oclc": {
        "host": "zcat.oclc.org",
        "port": 210,
        "database": "OLUCWorldCat",
        "name": "OCLC WorldCat",
        "enabled": False,  # Disabled due to authentication requirements
        "requires_auth": True,
        "timeout": 30,
        "max_results": 100,
        "syntax": "USMARC",
        "username": "",  # Set via environment variable
        "password": ""   # Set via environment variable
    }
}

# Search query types
QUERY_TYPES = {
    "isbn": "@attr 1=7 {}",           # ISBN
    "title": "@attr 1=4 {}",          # Title
    "author": "@attr 1=1003 {}",      # Author
    "subject": "@attr 1=21 {}",       # Subject
    "keyword": "@attr 1=1016 {}"      # Any field
}

# Cache settings
CACHE_CONFIG = {
    "enabled": True,
    "ttl": 3600,  # 1 hour in seconds
    "key_prefix": "z3950:"
}

# Search result limits
SEARCH_LIMITS = {
    "default_limit": 10,
    "max_limit": 100,
    "timeout": 30  # seconds
}
