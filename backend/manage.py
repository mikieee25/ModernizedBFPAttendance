"""
Database migration and management script.

This script handles database migrations and provides utilities for database management.
"""

import os
import sys
import click
from pathlib import Path

# Add the parent directory to the path so we can import the app
sys.path.insert(0, str(Path(__file__).parent.parent))

from flask import Flask
from flask_migrate import Migrate

from app.models import db
from app.models.user import User
from app.models.personnel import Personnel
from app.models.attendance import Attendance, PendingAttendance
from app.models.face_data import FaceData
from app.models.activity_log import ActivityLog


def create_app():
    """Create a Flask application for migrations."""
    app = Flask(__name__)

    # Configure the database connection
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "mysql://root:@localhost/bfp_sorsogon_attendance"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize the database with the app
    db.init_app(app)

    # Initialize migrations
    Migrate(app, db)

    return app


@click.group()
def cli():
    """Management commands for the BFP Sorsogon Attendance System."""
    pass


@cli.command()
def initialize_db():
    """Initialize the database with default users."""
    app = create_app()

    with app.app_context():
        # Check if there are any users
        if User.query.count() == 0:
            print("Creating initial users...")

            # Create admin user
            admin = User(
                username="admin",
                email="admin@bfpsorsogon.gov.ph",
                station_type=StationType.CENTRAL,
                is_admin=True,
            )
            admin.set_password("admin")  # Remember to change this in production!
            db.session.add(admin)

            # Create station users
            stations = [
                {
                    "username": "central",
                    "email": "central@bfpsorsogon.gov.ph",
                    "station_type": StationType.CENTRAL,
                },
                {
                    "username": "talisay",
                    "email": "talisay@bfpsorsogon.gov.ph",
                    "station_type": StationType.TALISAY,
                },
                {
                    "username": "bacon",
                    "email": "bacon@bfpsorsogon.gov.ph",
                    "station_type": StationType.BACON,
                },
                {
                    "username": "abuyog",
                    "email": "abuyog@bfpsorsogon.gov.ph",
                    "station_type": StationType.ABUYOG,
                },
            ]

            for station in stations:
                user = User(
                    username=station["username"],
                    email=station["email"],
                    station_type=station["station_type"],
                    is_admin=False,
                )
                user.set_password(
                    station["username"]
                )  # Remember to change this in production!
                db.session.add(user)

            # Commit the changes
            db.session.commit()
            print("Initial users created successfully!")
        else:
            print("Database already has users. Skipping initialization.")


@cli.command()
def validate_models():
    """Validate models against the database schema."""
    from tests.test_validate_models import main as validate_models_main

    validate_models_main()


@cli.command()
def test_connection():
    """Test the database connection."""
    from tests.test_database_connection import main as test_connection_main

    test_connection_main()


if __name__ == "__main__":
    # Import StationType for initialize_db command
    from app.models.user import StationType

    app = create_app()

    if len(sys.argv) > 1 and sys.argv[1] == "db":
        # Use Flask-Migrate's CLI for db commands
        from flask.cli import CLI

        cli = CLI(app)
        cli.main(args=sys.argv[1:])
    else:
        # Use our own CLI for other commands
        cli()
