"""
Script to seed MongoDB with sample library data
Run: python scripts/seed_mongodb.py
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.utils.mongo_helper import MongoHelper

def seed_books():
    """Seed sample books data"""
    print("📚 Seeding books...")
    
    books = [
        {
            "title": "Python Programming for Beginners",
            "author": "John Smith",
            "isbn": "978-1234567890",
            "category": "Programming",
            "description": "A comprehensive guide to learning Python from scratch",
            "publisher": "Tech Books Publishing",
            "publishedYear": 2023,
            "totalCopies": 10,
            "availableCopies": 10,
            "tags": ["python", "programming", "beginner"],
            "status": "available"
        },
        {
            "title": "Advanced JavaScript Techniques",
            "author": "Jane Doe",
            "isbn": "978-0987654321",
            "category": "Programming",
            "description": "Master advanced JavaScript patterns and techniques",
            "publisher": "Web Dev Press",
            "publishedYear": 2023,
            "totalCopies": 8,
            "availableCopies": 6,
            "tags": ["javascript", "web", "advanced"],
            "status": "available"
        },
        {
            "title": "Data Structures and Algorithms",
            "author": "Robert Johnson",
            "isbn": "978-1122334455",
            "category": "Computer Science",
            "description": "Essential data structures and algorithms for programmers",
            "publisher": "CS Academic Press",
            "publishedYear": 2022,
            "totalCopies": 15,
            "availableCopies": 12,
            "tags": ["algorithms", "data-structures", "computer-science"],
            "status": "available"
        },
        {
            "title": "Machine Learning Fundamentals",
            "author": "Sarah Williams",
            "isbn": "978-5566778899",
            "category": "Artificial Intelligence",
            "description": "Introduction to machine learning concepts and applications",
            "publisher": "AI Books Inc",
            "publishedYear": 2024,
            "totalCopies": 12,
            "availableCopies": 10,
            "tags": ["machine-learning", "ai", "python"],
            "status": "available"
        },
        {
            "title": "Database Design Principles",
            "author": "Michael Brown",
            "isbn": "978-2233445566",
            "category": "Database",
            "description": "Learn to design efficient and scalable databases",
            "publisher": "DB Publishing House",
            "publishedYear": 2023,
            "totalCopies": 7,
            "availableCopies": 5,
            "tags": ["database", "sql", "design"],
            "status": "available"
        },
        {
            "title": "Web Development with React",
            "author": "Emily Chen",
            "isbn": "978-7788990011",
            "category": "Web Development",
            "description": "Build modern web applications with React",
            "publisher": "Frontend Press",
            "publishedYear": 2024,
            "totalCopies": 9,
            "availableCopies": 8,
            "tags": ["react", "web", "frontend"],
            "status": "available"
        },
        {
            "title": "Cloud Computing with AWS",
            "author": "David Lee",
            "isbn": "978-3344556677",
            "category": "Cloud Computing",
            "description": "Master AWS services and cloud architecture",
            "publisher": "Cloud Books Ltd",
            "publishedYear": 2023,
            "totalCopies": 6,
            "availableCopies": 4,
            "tags": ["aws", "cloud", "devops"],
            "status": "available"
        },
        {
            "title": "Cybersecurity Essentials",
            "author": "Jennifer Taylor",
            "isbn": "978-9988776655",
            "category": "Security",
            "description": "Fundamentals of cybersecurity and ethical hacking",
            "publisher": "Security Press",
            "publishedYear": 2022,
            "totalCopies": 8,
            "availableCopies": 6,
            "tags": ["security", "hacking", "networking"],
            "status": "available"
        },
        {
            "title": "Mobile App Development",
            "author": "Kevin Martinez",
            "isbn": "978-4455667788",
            "category": "Mobile Development",
            "description": "Create native mobile apps for iOS and Android",
            "publisher": "Mobile Dev Publishing",
            "publishedYear": 2024,
            "totalCopies": 11,
            "availableCopies": 9,
            "tags": ["mobile", "ios", "android"],
            "status": "available"
        },
        {
            "title": "Software Engineering Best Practices",
            "author": "Linda Anderson",
            "isbn": "978-6677889900",
            "category": "Software Engineering",
            "description": "Industry best practices for software development",
            "publisher": "Engineering Press",
            "publishedYear": 2023,
            "totalCopies": 10,
            "availableCopies": 8,
            "tags": ["software-engineering", "best-practices", "agile"],
            "status": "available"
        },
        {
            "title": "Introduction to DevOps",
            "author": "Thomas White",
            "isbn": "978-8899001122",
            "category": "DevOps",
            "description": "Learn DevOps practices and tools",
            "publisher": "Tech Ops Books",
            "publishedYear": 2023,
            "totalCopies": 7,
            "availableCopies": 5,
            "tags": ["devops", "ci-cd", "automation"],
            "status": "available"
        },
        {
            "title": "The Art of Clean Code",
            "author": "Patricia Garcia",
            "isbn": "978-1122998877",
            "category": "Programming",
            "description": "Write clean, maintainable, and efficient code",
            "publisher": "Code Quality Press",
            "publishedYear": 2022,
            "totalCopies": 14,
            "availableCopies": 11,
            "tags": ["clean-code", "refactoring", "best-practices"],
            "status": "available"
        },
        {
            "title": "Blockchain Technology Explained",
            "author": "Christopher Miller",
            "isbn": "978-3344221100",
            "category": "Blockchain",
            "description": "Understanding blockchain and cryptocurrency",
            "publisher": "Crypto Books Inc",
            "publishedYear": 2024,
            "totalCopies": 5,
            "availableCopies": 3,
            "tags": ["blockchain", "cryptocurrency", "web3"],
            "status": "available"
        },
        {
            "title": "UI/UX Design Principles",
            "author": "Amanda Rodriguez",
            "isbn": "978-5566443322",
            "category": "Design",
            "description": "Create beautiful and user-friendly interfaces",
            "publisher": "Design Publishing",
            "publishedYear": 2023,
            "totalCopies": 9,
            "availableCopies": 7,
            "tags": ["design", "ui", "ux"],
            "status": "available"
        },
        {
            "title": "Network Administration Guide",
            "author": "Daniel Wilson",
            "isbn": "978-7788554433",
            "category": "Networking",
            "description": "Comprehensive guide to network administration",
            "publisher": "Network Books Ltd",
            "publishedYear": 2022,
            "totalCopies": 6,
            "availableCopies": 4,
            "tags": ["networking", "administration", "infrastructure"],
            "status": "available"
        }
    ]
    
    # Clear existing books
    deleted = MongoHelper.delete_many('books', {})
    print(f"  Deleted {deleted} existing books")
    
    # Insert new books
    book_ids = MongoHelper.insert_many('books', books)
    print(f"  ✅ Created {len(book_ids)} books")
    
    return len(book_ids)

def seed_categories():
    """Create indexes for categories"""
    print("\n📑 Setting up indexes...")
    
    # Create text index for search
    MongoHelper.create_index('books', [('title', 'text'), ('author', 'text'), ('description', 'text')])
    print("  ✅ Created text search index")
    
    # Create index for ISBN (unique)
    MongoHelper.create_index('books', [('isbn', 1)], unique=True)
    print("  ✅ Created ISBN unique index")
    
    # Create index for category
    MongoHelper.create_index('books', [('category', 1)])
    print("  ✅ Created category index")
    
    # Create compound index for status and available copies
    MongoHelper.create_index('books', [('status', 1), ('availableCopies', -1)])
    print("  ✅ Created status index")

def print_statistics():
    """Print database statistics"""
    print("\n📊 Database Statistics:")
    
    total_books = MongoHelper.count_documents('books', {})
    print(f"  Total books: {total_books}")
    
    available = MongoHelper.count_documents('books', {'availableCopies': {'$gt': 0}})
    print(f"  Available books: {available}")
    
    # Category distribution
    pipeline = [
        {'$group': {
            '_id': '$category',
            'count': {'$sum': 1},
            'totalCopies': {'$sum': '$totalCopies'}
        }},
        {'$sort': {'count': -1}}
    ]
    
    categories = list(MongoHelper.aggregate('books', pipeline))
    print(f"\n  📚 Categories ({len(categories)}):")
    for cat in categories:
        print(f"    - {cat['_id']}: {cat['count']} books, {cat['totalCopies']} copies")

def main():
    """Main seeding function"""
    print("=" * 60)
    print("🌱 MongoDB Seeding Script")
    print("=" * 60)
    
    # Create Flask app context
    app = create_app()
    
    with app.app_context():
        try:
            # Test connection
            print("\n🔌 Testing MongoDB connection...")
            from app import mongo
            mongo.cx.admin.command('ping')
            print("  ✅ MongoDB connected successfully\n")
            
            # Seed data
            seed_books()
            seed_categories()
            print_statistics()
            
            print("\n" + "=" * 60)
            print("✅ Seeding completed successfully!")
            print("=" * 60)
            print("\n💡 You can now:")
            print("  - Access books API: http://localhost:5000/api/mongodb/books")
            print("  - Test connection: http://localhost:5000/mongodb-test")
            print("  - View in MongoDB Compass: mongodb://localhost:27017/library_chatbox")
            
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            print("\nTroubleshooting:")
            print("  1. Make sure MongoDB is running: net start MongoDB")
            print("  2. Check .env file has correct MONGO_URI")
            print("  3. Verify MongoDB is listening on localhost:27017")
            sys.exit(1)

if __name__ == '__main__':
    main()
