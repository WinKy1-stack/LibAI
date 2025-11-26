"""
Z39.50 Service Configuration
Defines connection settings for various Z39.50 library sources
"""

import logging

logger = logging.getLogger(__name__)

# Default Z39.50 sources (used as fallback if no DB config)
DEFAULT_Z3950_SOURCES = {
    "loc": {
        "host": "z3950.loc.gov",
        "port": 7090,
        "database": "voyager",
        "name": "Library of Congress",
        "source_code": "z3950_loc",
        "catalog_url": "https://lccn.loc.gov/{control_number}",
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
        "source_code": "z3950_uw",
        "catalog_url": "https://search.library.wisc.edu",
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
        "source_code": "z3950_oclc",
        "catalog_url": "https://www.worldcat.org/search?q={query}",
        "enabled": False,
        "requires_auth": True,
        "timeout": 30,
        "max_results": 100,
        "syntax": "USMARC",
        "username": "",
        "password": ""
    }
}

def get_z3950_sources():
    """
    Get Z39.50 sources from database or return defaults

    Returns:
        Dict of Z39.50 source configurations
    """
    try:
        from app.services.admin_config import AdminConfigService

        # Get system config from DB
        system_config = AdminConfigService.get_system_config()
        db_libraries = system_config.get('z3950Libraries', [])

        if not db_libraries:
            logger.info("No Z39.50 libraries in database, using defaults")
            return DEFAULT_Z3950_SOURCES.copy()

        # Convert array of libraries to dict keyed by 'key' field
        sources = {}
        for lib in db_libraries:
            key = lib.get('key')
            if not key:
                # Generate key from name if not provided
                key = lib.get('name', '').lower().replace(' ', '_')

            if key:
                # Build source config from library data
                sources[key] = {
                    'host': lib.get('host', ''),
                    'port': lib.get('port', 210),
                    'database': lib.get('database', ''),
                    'name': lib.get('name', key),
                    'source_code': f'z3950_{key}',
                    'enabled': lib.get('enabled', True),
                    'timeout': 30,
                    'max_results': 100,
                    'syntax': lib.get('syntax', 'USMARC')
                }

        if sources:
            logger.info(f"Loaded {len(sources)} Z39.50 sources from database")
            return sources
        else:
            logger.warning("No valid Z39.50 sources in database, using defaults")
            return DEFAULT_Z3950_SOURCES.copy()

    except Exception as e:
        logger.error(f"Error loading Z39.50 sources from database: {str(e)}")
        logger.info("Falling back to default sources")
        return DEFAULT_Z3950_SOURCES.copy()

# For backward compatibility - load sources on module import
Z3950_SOURCES = get_z3950_sources()

def get_source_enum_map():
    """
    Automatically generate source enum mapping from config
    Makes it easy to add new sources without code changes

    Returns:
        Dict mapping source_key to source_code
    """
    return {
        key: config.get('source_code', f'z3950_{key}')
        for key, config in Z3950_SOURCES.items()
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
