"""
Test script for database migrations.

This script tests the migration setup for the database schema.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import the app
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from flask import Flask
from flask_migrate import Migrate

from app.models import db
from app.models.user import User
from app.models.personnel import Personnel
from app.models.attendance import Attendance, PendingAttendance
from app.models.face_data import FaceData
from app.models.activity_log import ActivityLog


def create_test_app():
    """Create a Flask test application for migrations."""
    app = Flask(__name__)

    # Configure the database connection for testing
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "TEST_DATABASE_URL", "mysql://root:@localhost/bfp_sorsogon_attendance_test"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize the database with the app
    db.init_app(app)

    return app


def main():
    """Test the migration setup."""
    app = create_test_app()
    migrate = Migrate(app, db)

    with app.app_context():
        print("Migration setup successful!")
        print(f"Test database: {app.config['SQLALCHEMY_DATABASE_URI']}")
        print("All models imported successfully.")


if __name__ == "__main__":
    main()
