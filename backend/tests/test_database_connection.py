"""
Test the database connection and create tables.

This script connects to the database and creates all tables if they don't exist.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import the app
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from flask import Flask
from app.models import db


def main():
    """Main function to test the database connection and create tables."""
    app = Flask(__name__)

    # Configure the database connection
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "mysql://root:@localhost/bfp_sorsogon_attendance"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize the database with the app
    db.init_app(app)

    with app.app_context():
        try:
            # Test the connection
            conn = db.engine.connect()
            print("Successfully connected to the database!")
            conn.close()

            # Create all tables
            db.create_all()
            print("All tables created successfully!")

        except Exception as e:
            print(f"Error connecting to the database: {e}")
            sys.exit(1)


if __name__ == "__main__":
    main()
