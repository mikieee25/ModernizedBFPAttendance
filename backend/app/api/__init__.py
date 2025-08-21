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
