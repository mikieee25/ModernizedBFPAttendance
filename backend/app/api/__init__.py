"""
API blueprint initialization.
"""

from flask import Blueprint, jsonify
from flask_restful import Api

from app.utils.errors import AppError, ErrorCode


# Create a custom API class that handles our custom errors
class CustomApi(Api):
    def handle_error(self, e):
        # Handle our custom AppError
        if isinstance(e, AppError):
            return jsonify(e.to_dict()), 400

        # Let the parent handle other errors
        return super().handle_error(e)


# Create blueprint and API
api_bp = Blueprint("api", __name__, url_prefix="/api/v1")
api = CustomApi(api_bp)


# Add documentation endpoint for the API
@api_bp.route("/")
def api_documentation():
    """Return documentation for the API."""
    return {
        "name": "BFP Sorsogon Attendance System API",
        "version": "1.0.0",
        "endpoints": {
            "authentication": {
                "/api/v1/auth/login": "POST - Authenticate and get access token",
                "/api/v1/auth/logout": "POST - Invalidate current token",
                "/api/v1/auth/refresh": "POST - Refresh access token",
            },
            "personnel": {
                "/api/v1/personnel": "GET - List all personnel, POST - Create new personnel",
                "/api/v1/personnel/<id>": "GET - Get personnel details, PUT - Update personnel, DELETE - Remove personnel",
            },
            "attendance": {
                "/api/v1/attendance": "GET - Get today's attendance, POST - Record attendance",
                "/api/v1/attendance/history": "GET - Get attendance history",
                "/api/v1/attendance/pending": "GET - Get pending attendance, POST - Submit for approval",
            },
            "face_recognition": {
                "/api/v1/face/recognize": "POST - Recognize face for attendance",
                "/api/v1/face/register": "POST - Register face for personnel",
            },
        },
    }


# Register resources
from .auth import LoginResource, LogoutResource, TokenRefreshResource
from .personnel import PersonnelResource, PersonnelListResource
from .attendance import (
    AttendanceResource,
    AttendanceHistoryResource,
    PendingAttendanceResource,
)
from .face import FaceRecognitionResource, FaceRegistrationResource

# API Routes
api.add_resource(LoginResource, "/auth/login")
api.add_resource(LogoutResource, "/auth/logout")
api.add_resource(TokenRefreshResource, "/auth/refresh")
api.add_resource(PersonnelResource, "/personnel/<int:personnel_id>")
api.add_resource(PersonnelListResource, "/personnel")
api.add_resource(AttendanceResource, "/attendance")
api.add_resource(AttendanceHistoryResource, "/attendance/history")
api.add_resource(PendingAttendanceResource, "/attendance/pending")
api.add_resource(FaceRecognitionResource, "/face/recognize")
api.add_resource(FaceRegistrationResource, "/face/register")
