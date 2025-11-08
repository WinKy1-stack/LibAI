"""Tests for Koha integration (mocked HTTP responses)

We mock requests.get to avoid hitting a real Koha instance.
"""
import json
import types
import pytest
from app.services.library.koha_client import KohaClient

class DummyResp:
    def __init__(self, status_code=200, json_data=None, text=''):
        self.status_code = status_code
        self._json = json_data or {}
        self.text = text or json.dumps(self._json)
    def json(self):
        return self._json

@pytest.fixture
def mock_requests(monkeypatch):
    calls = {}
    def fake_get(url, headers=None, params=None, timeout=15):
        # Simple routing
        if url.endswith('/api/v1/biblios'):
            query = params.get('query') if params else ''
            data = [{'_id': 1, 'title': f'Book about {query}'}]
            return DummyResp(json_data=data)
        if '/api/v1/biblios/' in url:
            biblio_id = url.split('/')[-1]
            return DummyResp(json_data={'_id': biblio_id, 'title': 'Sample Title'})
        return DummyResp(status_code=404, json_data={'error': 'not found'})
    monkeypatch.setattr('requests.get', fake_get)
    return calls

@pytest.fixture
def koha_env(monkeypatch):
    monkeypatch.setenv('KOHA_BASE_URL', 'http://example-koha:8080')
    monkeypatch.setenv('KOHA_AUTH_MODE', 'api_key')
    monkeypatch.setenv('KOHA_API_KEY', 'dummy-key')

def test_search_biblios(mock_requests, koha_env):
    client = KohaClient()
    result = client.search_biblios('python', limit=5)
    assert result['query'] == 'python'
    assert result['count'] == 1
    assert len(result['results']) == 1

def test_get_biblio(mock_requests, koha_env):
    client = KohaClient()
    result = client.get_biblio(42)
    assert result['id'] == 42
    assert result['record']['title'] == 'Sample Title'

def test_invalid_query(mock_requests, koha_env):
    client = KohaClient()
    with pytest.raises(Exception):
        client.search_biblios('a')  # too short
