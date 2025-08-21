"""
Test script to validate models against the database schema.

This script connects to the database and checks if the models match the actual
database schema.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import the app
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from flask import Flask
from app.models import db
from app.models.user import User
from app.models.personnel import Personnel
from app.models.attendance import Attendance, PendingAttendance
from app.models.face_data import FaceData
from app.models.activity_log import ActivityLog


def check_table_exists(table_name, engine):
    """Check if a table exists in the database."""
    query = f"SHOW TABLES LIKE '{table_name}'"
    result = engine.execute(query).fetchone()
    return result is not None


def check_column_exists(table_name, column_name, engine):
    """Check if a column exists in a table."""
    query = f"SHOW COLUMNS FROM `{table_name}` LIKE '{column_name}'"
    result = engine.execute(query).fetchone()
    return result is not None


def validate_model(model_class, engine):
    """Validate that a model matches the database schema."""
    table_name = model_class.__tablename__
    print(f"\nValidating model: {model_class.__name__} (table: {table_name})")

    # Check if the table exists
    if not check_table_exists(table_name, engine):
        print(f"  ERROR: Table '{table_name}' does not exist in the database")
        return False

    # Check if all columns exist
    all_columns_exist = True
    for column in model_class.__table__.columns:
        if not check_column_exists(table_name, column.name, engine):
            print(
                f"  ERROR: Column '{column.name}' does not exist in table '{table_name}'"
            )
            all_columns_exist = False

    if all_columns_exist:
        print(
            f"  SUCCESS: All columns in model {model_class.__name__} exist in the database"
        )

    return all_columns_exist


def main():
    """Main function to validate models against the database schema."""
    app = Flask(__name__)

    # Configure the database connection
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "mysql://root:@localhost/bfp_sorsogon_attendance"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize the database with the app
    db.init_app(app)

    # List of models to validate
    models = [User, Personnel, Attendance, PendingAttendance, FaceData, ActivityLog]

    with app.app_context():
        engine = db.engine

        # Validate each model
        all_valid = True
        for model in models:
            if not validate_model(model, engine):
                all_valid = False

        if all_valid:
            print("\nAll models are valid and match the database schema!")
        else:
            print("\nSome models do not match the database schema. See errors above.")


if __name__ == "__main__":
    main()
