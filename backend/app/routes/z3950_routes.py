"""
Z39.50 API Routes
Provides endpoints for library catalog searches
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.z3950 import Z3950Service
from app.utils.decorators import librarian_required
import logging

logger = logging.getLogger(__name__)

z3950_bp = Blueprint('z3950', __name__, url_prefix='/api/z3950')

# Initialize Z39.50 service
z3950_service = Z3950Service(cache_enabled=True)


@z3950_bp.route('/test', methods=['POST'])
@jwt_required()
@librarian_required()
def test_connection():
    """
    Test Z39.50 connection
    
    Body:
        - host: Host address
        - port: Port number
        - database: Database name
        - ...
        
    Returns:
        Connection result
    """
    try:
        config = request.json
        if not config:
             return jsonify({'error': 'No configuration provided'}), 400
             
        required = ['host', 'port', 'database']
        if not all(k in config for k in required):
             return jsonify({'error': f'Missing required fields: {required}'}), 400
             
        result = z3950_service.test_connection(config)
        return jsonify(result), 200

    except Exception as e:
        logger.error(f"Error testing connection: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@z3950_bp.route('/search/all', methods=['GET'])
def search_all_sources():
    """
    Search all enabled Z39.50 sources

    Query params:
        - q: Search query (required)
        - type: Query type (isbn, title, author, subject, keyword) - default: keyword
        - limit: Max results per source - default: 5
        - cache: Use cache (true/false) - default: true
        - save: Save new records to DB (true/false) - default: false

    Returns:
        JSON with results from all sources
    """
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'error': 'Query parameter "q" is required'}), 400

        query_type = request.args.get('type', 'keyword')
        limit = int(request.args.get('limit', 5))
        use_cache = request.args.get('cache', 'true').lower() == 'true'
        save_to_db = request.args.get('save', 'false').lower() == 'true'

        # Validate limit
        if limit < 1 or limit > 100:
            return jsonify({'error': 'Limit must be between 1 and 100'}), 400

        # Validate query type
        valid_types = ['isbn', 'title', 'author', 'subject', 'keyword']
        if query_type not in valid_types:
            return jsonify({'error': f'Invalid query type. Must be one of: {valid_types}'}), 400

        # Search
        if save_to_db:
            result = z3950_service.search_and_save(
                query=query,
                query_type=query_type,
                limit=limit,
                save_to_db=True
            )
            return jsonify(result), 200
        else:
            results = z3950_service.search_all(
                query=query,
                query_type=query_type,
                limit=limit,
                use_cache=use_cache
            )

            # Count total results
            total = sum(len(records) for records in results.values())

            return jsonify({
                'query': query,
                'query_type': query_type,
                'total_results': total,
                'sources': results
            }), 200

    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Error in search_all: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@z3950_bp.route('/search/<source>', methods=['GET'])
def search_single_source(source):
    """
    Search a specific Z39.50 source

    Path params:
        - source: Source key (loc, uw, oclc)

    Query params:
        - q: Search query (required)
        - type: Query type - default: keyword
        - limit: Max results - default: 5
        - cache: Use cache - default: true
        - save: Save new records to DB - default: false

    Returns:
        JSON with search results
    """
    try:
        valid_sources = ['loc', 'uw', 'oclc']
        if source not in valid_sources:
            return jsonify({'error': f'Invalid source. Must be one of: {valid_sources}'}), 400

        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'error': 'Query parameter "q" is required'}), 400

        query_type = request.args.get('type', 'keyword')
        limit = int(request.args.get('limit', 5))
        use_cache = request.args.get('cache', 'true').lower() == 'true'
        save_to_db = request.args.get('save', 'false').lower() == 'true'

        # Search
        if save_to_db:
            result = z3950_service.search_and_save(
                query=query,
                query_type=query_type,
                limit=limit,
                source=source,
                save_to_db=True
            )
            return jsonify(result), 200
        else:
            results = z3950_service.search_single(
                source=source,
                query=query,
                query_type=query_type,
                limit=limit,
                use_cache=use_cache
            )

            return jsonify({
                'query': query,
                'query_type': query_type,
                'source': source,
                'total_results': len(results),
                'results': results
            }), 200

    except ValueError as e:
        return jsonify({'error': f'Invalid parameter: {str(e)}'}), 400
    except Exception as e:
        logger.error(f"Error in search_single_source: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@z3950_bp.route('/cache/clear', methods=['POST'])
@jwt_required()
@librarian_required()
def clear_cache():
    """
    Clear all Z39.50 cache entries (Librarian/Admin only)

    Returns:
        Success message
    """
    try:
        success = z3950_service.clear_cache()
        if success:
            return jsonify({'message': 'Cache cleared successfully'}), 200
        else:
            return jsonify({'error': 'Failed to clear cache'}), 500

    except Exception as e:
        logger.error(f"Error clearing cache: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@z3950_bp.route('/cache/stats', methods=['GET'])
@jwt_required()
@librarian_required()
def cache_stats():
    """
    Get cache statistics (Librarian/Admin only)

    Returns:
        Cache statistics
    """
    try:
        stats = z3950_service.get_cache_stats()
        return jsonify(stats), 200

    except Exception as e:
        logger.error(f"Error getting cache stats: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@z3950_bp.route('/sources', methods=['GET'])
def get_sources():
    """
    Get list of available Z39.50 sources

    Returns:
        List of sources with their configurations
    """
    try:
        from app.services.z3950.config import Z3950_SOURCES

        sources = {}
        for key, config in Z3950_SOURCES.items():
            sources[key] = {
                'name': config['name'],
                'enabled': config.get('enabled', False),
                'requires_auth': config.get('requires_auth', False)
            }

        return jsonify({'sources': sources}), 200

    except Exception as e:
        logger.error(f"Error getting sources: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@z3950_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint

    Returns:
        Service health status
    """
    try:
        cache_stats = z3950_service.get_cache_stats()

        return jsonify({
            'status': 'healthy',
            'service': 'Z39.50 Search Service',
            'cache': cache_stats
        }), 200

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500
