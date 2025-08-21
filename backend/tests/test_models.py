"""
Test the database models against the actual database schema.
"""

import pytest
from flask import Flask
from app.models import (
    db,
    User,
    Personnel,
    Attendance,
    FaceData,
    ActivityLog,
    PendingAttendance,
)
from app.models.base import BaseModel


@pytest.fixture
def test_app():
    """Create a test Flask application."""
    app = Flask(__name__)
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = (
        "mysql://root:@localhost/bfp_sorsogon_attendance_test"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()


def test_model_columns(test_app):
    """Test that all model columns align with the database schema."""
    with test_app.app_context():
        # Test User model
        user_columns = [column.name for column in User.__table__.columns]
        assert "id" in user_columns
        assert "username" in user_columns
        assert "email" in user_columns
        assert "password" in user_columns
        assert "station_type" in user_columns
        assert "is_admin" in user_columns
        assert "profile_picture" in user_columns
        assert "date_created" in user_columns

        # Test Personnel model
        personnel_columns = [column.name for column in Personnel.__table__.columns]
        assert "id" in personnel_columns
        assert "first_name" in personnel_columns
        assert "last_name" in personnel_columns
        assert "rank" in personnel_columns
        assert "station_id" in personnel_columns
        assert "image_path" in personnel_columns
        assert "date_created" in personnel_columns

        # Test Attendance model
        attendance_columns = [column.name for column in Attendance.__table__.columns]
        assert "id" in attendance_columns
        assert "personnel_id" in attendance_columns
        assert "date" in attendance_columns
        assert "time_in" in attendance_columns
        assert "time_out" in attendance_columns
        assert "status" in attendance_columns
        assert "confidence_score" in attendance_columns
        assert "is_auto_captured" in attendance_columns
        assert "is_approved" in attendance_columns
        assert "approved_by" in attendance_columns
        assert "time_in_image" in attendance_columns
        assert "time_out_image" in attendance_columns
        assert "date_created" in attendance_columns

        # Test FaceData model
        face_data_columns = [column.name for column in FaceData.__table__.columns]
        assert "id" in face_data_columns
        assert "personnel_id" in face_data_columns
        assert "filename" in face_data_columns
        assert "embedding" in face_data_columns
        assert "confidence" in face_data_columns
        assert "date_created" in face_data_columns

        # Test ActivityLog model
        activity_log_columns = [column.name for column in ActivityLog.__table__.columns]
        assert "id" in activity_log_columns
        assert "user_id" in activity_log_columns
        assert "title" in activity_log_columns
        assert "description" in activity_log_columns
        assert "timestamp" in activity_log_columns
        assert "date_created" in activity_log_columns

        # Test PendingAttendance model
        pending_attendance_columns = [
            column.name for column in PendingAttendance.__table__.columns
        ]
        assert "id" in pending_attendance_columns
        assert "personnel_id" in pending_attendance_columns
        assert "date" in pending_attendance_columns
        assert "attendance_type" in pending_attendance_columns
        assert "image_path" in pending_attendance_columns
        assert "notes" in pending_attendance_columns
        assert "date_created" in pending_attendance_columns


def test_create_instances(test_app):
    """Test that we can create instances of all models."""
    with test_app.app_context():
        # Create a user
        user = User(
            username="testuser",
            email="test@example.com",
            station_type="CENTRAL",
            is_admin=True,
        )
        user.set_password("password")
        db.session.add(user)
        db.session.commit()

        assert User.query.count() == 1

        # Create a personnel
        personnel = Personnel(
            first_name="John", last_name="Doe", rank="Fire Officer", station_id=user.id
        )
        db.session.add(personnel)
        db.session.commit()

        assert Personnel.query.count() == 1

        # Create an activity log
        activity = ActivityLog(
            user_id=user.id,
            title="Test Activity",
            description="This is a test activity",
        )
        db.session.add(activity)
        db.session.commit()

        assert ActivityLog.query.count() == 1
