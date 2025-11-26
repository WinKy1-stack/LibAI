"""
Z39.50 Workers

All Z39.50 sources use the unified Z3950Worker class.
Source-specific configuration (URLs, auth, etc.) is handled via config.py.
"""

from .z3950_worker import Z3950Worker

__all__ = ['Z3950Worker']
