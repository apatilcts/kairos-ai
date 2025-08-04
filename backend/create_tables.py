#!/usr/bin/env python3
"""
Database table creation script for KairosAI
Creates all the necessary tables for the application.
"""

from app.db.database import engine
from app.db.models import Base

def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    create_tables()