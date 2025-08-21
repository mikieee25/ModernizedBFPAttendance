"""
Test script to initialize the database with some initial data.

This script creates an admin user and the different fire stations.
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path so we can import the app
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from flask import Flask
from app.models import db
from app.models.user import User, StationType


def main():
    """Main function to initialize the database with some initial data."""
    app = Flask(__name__)

    # Configure the database connection
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "mysql://root:@localhost/bfp_sorsogon_attendance_test"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize the database with the app
    db.init_app(app)

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


if __name__ == "__main__":
    main()
