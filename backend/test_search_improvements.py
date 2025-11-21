"""
Test Script for Z39.50 Search Improvements
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ai.pipelines.prompt.query_analyzer import QueryAnalyzer


def test_query_analyzer():
    """Test query analyzer with various queries"""

    test_cases = [
        # Test ISBN detection
        ("9780134685991", "isbn"),
        ("978-0-13-468599-1", "isbn"),

        # Test author detection
        ("books by Ernest Hemingway", "author"),
        ("author John Green", "author"),
        ("tác giả Nguyễn Nhật Ánh", "author"),

        # Test title detection
        ("The Great Gatsby", "title"),
        ("Python Crash Course", "title"),
        ("1984", "title"),
        ('"To Kill a Mockingbird"', "title"),

        # Test keyword search
        ("programming", "keyword"),
        ("artificial intelligence", "keyword"),
        ("machine learning algorithms", "keyword"),
    ]

    print("=" * 80)
    print("TESTING QUERY ANALYZER")
    print("=" * 80)

    for i, (query, expected_type) in enumerate(test_cases, 1):
        optimized, detected_type, keywords = QueryAnalyzer.analyze_query(query)

        status = "✓" if detected_type == expected_type else "✗"

        print(f"\n{status} Test {i}:")
        print(f"   Input:         '{query}'")
        print(f"   Expected:      {expected_type}")
        print(f"   Detected:      {detected_type}")
        print(f"   Optimized:     '{optimized}'")
        print(f"   Keywords:      {keywords}")


def test_yaz_query_building():
    """Test YAZ query building"""
    from app.services.z3950.workers.z3950_worker import Z3950Worker

    print("\n" + "=" * 80)
    print("TESTING YAZ QUERY BUILDING")
    print("=" * 80)

    # Create a dummy worker instance
    try:
        worker = Z3950Worker('loc')
    except Exception as e:
        print(f"Cannot create worker: {e}")
        return

    test_cases = [
        ("Python Crash Course", "title"),
        ("Ernest Hemingway", "author"),
        ("9780134685991", "isbn"),
        ("machine learning", "keyword"),
        ("programming", "keyword"),
    ]

    for query, query_type in test_cases:
        yaz_query = worker._build_yaz_query(query, query_type)
        print(f"\n  Query:         '{query}'")
        print(f"  Type:          {query_type}")
        print(f"  YAZ Query:     {yaz_query}")


def test_full_search_flow():
    """Test full search flow with query analyzer + search"""
    print("\n" + "=" * 80)
    print("TESTING FULL SEARCH FLOW")
    print("=" * 80)

    test_queries = [
        "Python programming",
        "The Great Gatsby",
        "books by Hemingway",
    ]

    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"Query: '{query}'")
        print('='*60)

        optimized, query_type, keywords = QueryAnalyzer.analyze_query(query)
        print(f"  Optimized:     '{optimized}'")
        print(f"  Type:          {query_type}")
        print(f"  Keywords:      {keywords}")

        # Note: Actual search would require MongoDB and Z39.50 connection
        print(f"  → Would search with: type={query_type}, query='{optimized}'")


if __name__ == "__main__":
    print("\n🔍 Z39.50 Search Improvements Test Suite\n")

    try:
        # Test 1: Query Analyzer
        test_query_analyzer()

        # Test 2: YAZ Query Building
        test_yaz_query_building()

        # Test 3: Full Flow
        test_full_search_flow()

        print("\n" + "=" * 80)
        print("✓ All tests completed!")
        print("=" * 80)

    except Exception as e:
        print(f"\n✗ Error during testing: {e}")
        import traceback
        traceback.print_exc()
