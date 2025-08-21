"""
Face recognition API endpoints.
"""

from flask import request, jsonify
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.personnel import Personnel
from app.models.face_data import FaceData
from app.models.activity_log import ActivityLog
from app.utils.security import admin_required, station_access_required
from app.utils.validators import validate_required_fields
from app.utils.errors import AppError, ErrorCode
from app.services.face_recognition import (
    process_base64_image,
    load_face_database,
    recognize_face,
    register_face,
)


class FaceRecognitionResource(Resource):
    """Resource for face recognition."""

    def post(self):
        """
        Recognize a face from an image.

        Returns:
            dict: Response with personnel data and confidence score
        """
        try:
            # Get image data
            image_data = request.json.get("image")

            if not image_data:
                raise AppError("Image data required", ErrorCode.SYSTEM_VALIDATION_ERROR)

            # Extract face from image
            face_embedding, face_metadata, temp_path = process_base64_image(image_data)

            if not face_embedding:
                raise AppError("No face detected in image", ErrorCode.FACE_NOT_DETECTED)

            # Load face database
            face_database = load_face_database()

            # Recognize face
            personnel_id, confidence = recognize_face(face_embedding, face_database)

            if not personnel_id:
                raise AppError("Face not recognized", ErrorCode.FACE_NOT_RECOGNIZED)

            # Get personnel info
            personnel = Personnel.query.get(personnel_id)

            if not personnel:
                raise AppError("Personnel not found", ErrorCode.PERSONNEL_NOT_FOUND)

            return {
                "success": True,
                "personnel": {
                    "id": personnel.id,
                    "name": personnel.full_name,
                    "rank": personnel.rank,
                    "station": personnel.station.station_type.value,
                },
                "confidence": confidence,
            }, 200

        except AppError as e:
            return e.to_dict(), 400

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500


class FaceRegistrationResource(Resource):
    """Resource for face registration."""

    @jwt_required()
    @validate_required_fields(["personnel_id", "images"])
    def post(self):
        """
        Register face images for a personnel.

        Returns:
            dict: Response with registration result
        """
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                raise AppError("User not found", ErrorCode.AUTH_INVALID_TOKEN)

            # Get request data
            data = request.json
            personnel_id = data.get("personnel_id")
            images = data.get("images")

            # Check if personnel exists
            personnel = Personnel.query.get(personnel_id)
            if not personnel:
                raise AppError("Personnel not found", ErrorCode.PERSONNEL_NOT_FOUND)

            # Check access
            if not user.is_admin and personnel.station_id != user.station_id:
                raise AppError("Access denied", ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS)

            # Register faces
            result = register_face(personnel_id, images)

            if result.get("success"):
                # Log activity
                activity_log = ActivityLog(
                    user_id=user_id,
                    title="Face Registration",
                    description=f"Registered face images for {personnel.full_name}",
                )
                activity_log.save()

            if not result.get("success"):
                raise AppError(
                    result.get("error", "Face registration failed"),
                    ErrorCode.FACE_REGISTRATION_FAILED,
                )

            return result, 200

        except AppError as e:
            return e.to_dict(), 400

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500
