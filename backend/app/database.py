"""
Database connection and query utilities
"""
import sqlite3
import pandas as pd
from app.config import DB_PATH

# Global database connection
db_connection = None

def get_db_connection():
    """Get database connection"""
    global db_connection
    if db_connection is None:
        db_connection = sqlite3.connect(DB_PATH, check_same_thread=False)
        db_connection.row_factory = sqlite3.Row  # Enable column access by name
    return db_connection

def execute_query(query, params=None):
    """Execute a database query and return results as pandas DataFrame"""
    conn = get_db_connection()
    if params:
        return pd.read_sql_query(query, conn, params=params)
    else:
        return pd.read_sql_query(query, conn)

def close_db_connection():
    """Close database connection"""
    global db_connection
    if db_connection:
        db_connection.close()
        db_connection = None

def initialize_database():
    """Initialize database connection and verify tables"""
    try:
        print("Connecting to database...")
        conn = get_db_connection()
        
        # Test connection with simple queries
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM teams")
        teams_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM players")
        players_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM matches")
        matches_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM ball_by_ball")
        ball_count = cursor.fetchone()[0]
        
        print(f"✓ Database connected successfully!")
        print(f"✓ Teams: {teams_count} records")
        print(f"✓ Players: {players_count} records")
        print(f"✓ Matches: {matches_count} records")
        print(f"✓ Ball by ball: {ball_count} records")
        
        return True
    except Exception as e:
        print(f"✗ Error connecting to database: {e}")
        return False

