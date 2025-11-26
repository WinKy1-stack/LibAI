from flask import Blueprint, request, jsonify
from app.services.admin_config import AdminConfigService
from app.utils.decorators import admin_required
from app.ai.pipelines.prompt.service import PromptServiceSingleton
import logging

logger = logging.getLogger(__name__)

admin_config_bp = Blueprint('admin_config', __name__, url_prefix='/api/admin/config')

@admin_config_bp.route('/ai', methods=['GET'])
@admin_required()
def get_ai_config():
    """Get AI configuration"""
    try:
        config = AdminConfigService.get_ai_config()
        # Mask API Key for security if needed, or return as is for admin
        # config['apiKey'] = '********' 
        return jsonify(config), 200
    except Exception as e:
        logger.error(f"Error getting AI config: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_config_bp.route('/ai', methods=['PUT'])
@admin_required()
def update_ai_config():
    """Update AI configuration"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        success = AdminConfigService.update_ai_config(data)
        if success:
            # Reset AI Service to reload config
            PromptServiceSingleton.reset()
            return jsonify({'message': 'AI configuration updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update configuration'}), 500
    except Exception as e:
        logger.error(f"Error updating AI config: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_config_bp.route('/system', methods=['GET'])
@admin_required()
def get_system_config():
    """Get System configuration"""
    try:
        config = AdminConfigService.get_system_config()
        return jsonify(config), 200
    except Exception as e:
        logger.error(f"Error getting System config: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@admin_config_bp.route('/system', methods=['PUT'])
@admin_required()
def update_system_config():
    """Update System configuration"""
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        success = AdminConfigService.update_system_config(data)
        if success:
            # Reload Z39.50 service if z3950Libraries were updated
            if 'z3950Libraries' in data:
                try:
                    from app.routes.z3950_routes import z3950_service
                    z3950_service.reload_config()
                    logger.info("Z39.50 configuration reloaded after system config update")
                except Exception as reload_error:
                    logger.error(f"Error reloading Z39.50 config: {str(reload_error)}")
                    # Don't fail the request, just log the error

            return jsonify({'message': 'System configuration updated successfully'}), 200
        else:
            return jsonify({'error': 'Failed to update configuration'}), 500
    except Exception as e:
        logger.error(f"Error updating System config: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
