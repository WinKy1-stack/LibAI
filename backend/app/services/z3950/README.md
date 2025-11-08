# Z39.50 Library Search Service

Multi-source library catalog search service with Redis caching and MongoDB integration.

## Features

- **Multi-source search**: Search multiple library catalogs simultaneously (LOC, UW-Madison, OCLC)
- **MARC normalization**: Convert MARC21 records to clean JSON format
- **Redis caching**: Fast response times with intelligent caching
- **Database integration**: Save search results to MongoDB for future use
- **Concurrent searches**: Parallel searches across multiple sources

## Architecture

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│   Flask API (Gateway)           │
│   - /api/z3950/search/all       │
│   - /api/z3950/search/{source}  │
│   - /api/z3950/cache/clear      │
│   - /api/z3950/sources          │
└────────┬────────────────────────┘
         │
    ┌────┴─────┬──────────┬────────┐
    ▼          ▼          ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  LOC   │ │   UW   │ │  OCLC  │ │ Redis  │
│ Worker │ │ Worker │ │ Worker │ │ Cache  │
└────────┘ └────────┘ └────────┘ └────────┘
```

## Supported Sources

| Source | Name | Enabled | Auth Required |
|--------|------|---------|---------------|
| `loc` | Library of Congress | ✅ | ❌ |
| `uw` | UW-Madison | ✅ | ❌ |
| `oclc` | OCLC WorldCat | ❌ | ✅ |

## API Endpoints

### 1. Search All Sources

```bash
GET /api/z3950/search/all?q={query}&type={type}&limit={limit}&save={true/false}
```

**Parameters:**
- `q` (required): Search query
- `type` (optional): Query type - `isbn`, `title`, `author`, `subject`, `keyword` (default: `keyword`)
- `limit` (optional): Max results per source (default: 10, max: 100)
- `cache` (optional): Use cache (default: true)
- `save` (optional): Save new records to database (default: false)

**Example:**
```bash
curl "http://localhost:5000/api/z3950/search/all?q=machine%20learning&type=title&limit=5"
```

**Response:**
```json
{
  "query": "machine learning",
  "query_type": "title",
  "total_results": 15,
  "sources": {
    "loc": [...],
    "uw": [...],
    "oclc": []
  }
}
```

### 2. Search Single Source

```bash
GET /api/z3950/search/{source}?q={query}&type={type}&limit={limit}
```

**Example:**
```bash
curl "http://localhost:5000/api/z3950/search/loc?q=978-0262035613&type=isbn"
```

### 3. Get Available Sources

```bash
GET /api/z3950/sources
```

### 4. Clear Cache (Auth Required)

```bash
POST /api/z3950/cache/clear
Authorization: Bearer {token}
```

### 5. Get Cache Stats (Auth Required)

```bash
GET /api/z3950/cache/stats
Authorization: Bearer {token}
```

### 6. Health Check

```bash
GET /api/z3950/health
```

## Query Types

| Type | Description | Example |
|------|-------------|---------|
| `isbn` | ISBN search | `978-0262035613` |
| `title` | Title search | `Introduction to Algorithms` |
| `author` | Author search | `Cormen` |
| `subject` | Subject search | `Computer Science` |
| `keyword` | Any field | `machine learning python` |

## Response Format (LibraryRecordLite)

```json
{
  "record_id": "uuid-string",
  "title": {
    "main": "Introduction to Algorithms",
    "subtitle": "Third Edition"
  },
  "contributors": [
    {
      "role": "author",
      "name": "Cormen, Thomas H."
    }
  ],
  "subjects": [
    {
      "term": "Algorithms",
      "subdivisions": []
    }
  ],
  "publication": {
    "place": "Cambridge",
    "publisher": "MIT Press",
    "year": "2024"
  },
  "identifiers": {
    "isbn": [
      {"value": "9780262035613"}
    ]
  },
  "languages": ["eng"],
  "format": ["book"],
  "holdings": [],
  "source": {
    "name": "Library of Congress",
    "key": "loc",
    "url": "https://lccn.loc.gov/..."
  }
}
```

## Configuration

### Environment Variables

Add to `.env`:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# OCLC Authentication (if needed)
OCLC_USERNAME=your_username
OCLC_PASSWORD=your_password
```

### Config File

Edit `app/services/z3950/config.py`:

```python
Z3950_SOURCES = {
    "loc": {
        "host": "z3950.loc.gov",
        "port": 7090,
        "database": "voyager",
        "name": "Library of Congress",
        "enabled": True,
        "timeout": 30,
        "max_results": 100
    },
    # ... other sources
}
```

## Usage Examples

### Python

```python
from app.services.z3950 import Z3950Service

service = Z3950Service(cache_enabled=True)

# Search all sources
results = service.search_all(
    query="machine learning",
    query_type="title",
    limit=10
)

# Search single source
loc_results = service.search_single(
    source="loc",
    query="978-0262035613",
    query_type="isbn"
)

# Search and save to database
result = service.search_and_save(
    query="python programming",
    query_type="title",
    save_to_db=True
)
```

### JavaScript/Frontend

```javascript
// Search all sources
const response = await fetch(
  '/api/z3950/search/all?q=machine%20learning&type=title&limit=5'
);
const data = await response.json();

// Search with save to DB
const saveResponse = await fetch(
  '/api/z3950/search/all?q=python&type=title&save=true'
);
const savedData = await saveResponse.json();
console.log(`Saved ${savedData.stats.saved_to_db} new records`);
```

## Caching

### Cache Strategy

- **TTL**: 1 hour (configurable in `config.py`)
- **Key Format**: `z3950:{source}:{hash(query+type+limit)}`
- **Policy**: LRU (Least Recently Used)
- **Max Memory**: 256MB (configurable in docker-compose.yml)

### Cache Management

```bash
# Clear all cache (requires auth)
curl -X POST http://localhost:5000/api/z3950/cache/clear \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get cache stats
curl http://localhost:5000/api/z3950/cache/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Running with Docker

```bash
# Start all services
docker-compose up -d

# Start with Redis Commander GUI
docker-compose --profile tools up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

## Troubleshooting

### Connection Issues

```bash
# Test Z39.50 connection
from app.services.z3950.workers import LOCWorker

with LOCWorker() as worker:
    results = worker.search("test", "keyword", 1)
    print(f"Found {len(results)} results")
```

### Redis Issues

```bash
# Check Redis connection
docker exec library-redis redis-cli ping
# Should return: PONG

# View cache keys
docker exec library-redis redis-cli KEYS "z3950:*"

# Clear cache manually
docker exec library-redis redis-cli FLUSHDB
```

### OCLC Authentication

OCLC requires authentication. To enable:

1. Set credentials in `.env`:
   ```
   OCLC_USERNAME=your_username
   OCLC_PASSWORD=your_password
   ```

2. Enable in `config.py`:
   ```python
   "oclc": {
       ...
       "enabled": True,
       ...
   }
   ```

## Performance

- **Parallel searches**: ~2-5 seconds for all sources
- **Cache hit**: < 100ms
- **Single source**: ~1-3 seconds
- **MARC parsing**: ~10ms per record

## Dependencies

- `PyZ3950==3.4` - Z39.50 protocol
- `pymarc==5.3.1` - MARC record parsing
- `redis==5.0.1` - Redis client
- `lxml==5.3.0` - XML processing

## License

MIT
