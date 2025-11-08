"""
Migration script to add koha_patron_id to users table
"""
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import db, create_app
from app.config import DevelopmentConfig
from app.models.user import User

def upgrade():
    """Add koha_patron_id column to users table"""
    print("Adding koha_patron_id column to users table...")
    
    # Create app context
    app = create_app(DevelopmentConfig)
    
    with app.app_context():
        # Check if column exists
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns('users')]
        
        if 'koha_patron_id' in columns:
            print("✅ Column koha_patron_id already exists!")
            return
        
        # Add column
        with db.engine.connect() as conn:
            conn.execute(db.text(
                "ALTER TABLE users ADD COLUMN koha_patron_id VARCHAR(50)"
            ))
            conn.execute(db.text(
                "CREATE INDEX idx_users_koha_patron_id ON users(koha_patron_id)"
            ))
            conn.commit()
        
        print("✅ Successfully added koha_patron_id column and index!")

def downgrade():
    """Remove koha_patron_id column from users table"""
    print("Removing koha_patron_id column from users table...")
    
    app = create_app(DevelopmentConfig)
    
    with app.app_context():
        with db.engine.connect() as conn:
            conn.execute(db.text("DROP INDEX IF EXISTS idx_users_koha_patron_id"))
            conn.execute(db.text("ALTER TABLE users DROP COLUMN koha_patron_id"))
            conn.commit()
        
        print("✅ Successfully removed koha_patron_id column!")

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python add_koha_patron_id.py [upgrade|downgrade]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == 'upgrade':
        upgrade()
    elif command == 'downgrade':
        downgrade()
    else:
        print(f"Unknown command: {command}")
        print("Use 'upgrade' or 'downgrade'")
        sys.exit(1)
