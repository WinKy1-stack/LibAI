"""
Document Routes
Routes for managing library documents and resources
"""
from flask import Blueprint, request, jsonify
from app.utils.mongo_helper import MongoHelper

document_bp = Blueprint('documents', __name__)


@document_bp.route('', methods=['GET'])
def get_documents():
    """Lấy danh sách documents"""
    try:
        lang = request.args.get('lang', 'vi')
        doc_type = request.args.get('type', '')
        
        query = {'lang': lang}
        if doc_type:
            query['type'] = doc_type
        
        documents = MongoHelper.find_many('documents', query=query)
        
        return jsonify({'documents': documents}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
