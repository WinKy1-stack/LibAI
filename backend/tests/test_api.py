"""
Test API endpoints
"""
import pytest
from app import create_app, db
from app.config import TestingConfig

@pytest.fixture
def app():
    """Tạo Flask app cho testing"""
    app = create_app(TestingConfig)

    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    """Tạo test client"""
    return app.test_client()

def test_health_endpoint(client):
    """Test health check endpoint"""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'

def test_api_health_endpoint(client):
    """Test API health check endpoint"""
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'ok'

def test_get_users(client):
    """Test lấy danh sách users"""
    response = client.get('/api/users')
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert isinstance(data['data'], list)

def test_create_user(client):
    """Test tạo user mới"""
    user_data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'password123',
        'full_name': 'Test User'
    }

    response = client.post('/api/users', json=user_data)
    assert response.status_code == 201
    data = response.get_json()
    assert data['success'] is True
    assert data['data']['username'] == 'testuser'

def test_create_user_invalid_data(client):
    """Test tạo user với dữ liệu không hợp lệ"""
    user_data = {
        'username': 'tu',  # quá ngắn
        'email': 'invalid-email',
        'password': '123'  # quá ngắn
    }

    response = client.post('/api/users', json=user_data)
    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
