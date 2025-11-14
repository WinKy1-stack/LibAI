"""
Library System Routes
Main entry point for all library-related routes
"""
from flask import Blueprint

# Create main library blueprint
library_bp = Blueprint('library', __name__, url_prefix='/api/library')

# Import sub-blueprints
from .marc_routes import marc_bp
from .item_routes import item_bp
from .loan_routes import loan_bp
from .faq_routes import faq_bp
from .document_routes import document_bp
from .admin_routes import admin_bp
from .stats_routes import stats_bp
from .koha_routes import koha_bp

# Register sub-blueprints
library_bp.register_blueprint(marc_bp, url_prefix='/marc-records')
library_bp.register_blueprint(item_bp, url_prefix='/items')
library_bp.register_blueprint(loan_bp, url_prefix='/loans')
library_bp.register_blueprint(faq_bp, url_prefix='/faq')
library_bp.register_blueprint(document_bp, url_prefix='/documents')
library_bp.register_blueprint(admin_bp, url_prefix='/admin')
library_bp.register_blueprint(stats_bp, url_prefix='/stats')
library_bp.register_blueprint(koha_bp, url_prefix='/koha')

__all__ = ['library_bp']

