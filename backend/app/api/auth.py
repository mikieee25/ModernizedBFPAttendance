"""
Authentication API endpoints.
"""

from flask import request, jsonify, current_app
from flask_restful import Resource
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt,
)

from app.models.user import User
from app.models.activity_log import ActivityLog
from app.utils.validators import validate_required_fields
from app.utils.errors import AppError, ErrorCode

# JWT token blocklist - would be better in Redis for production
# This should be moved to a more appropriate location in a real application
jwt_blocklist = set()


class LoginResource(Resource):
    """Resource for user login."""

    @validate_required_fields(["email", "password"])
    def post(self):
        """
        Login a user.

        Returns:
            dict: Response with user data and tokens
        """
        try:
            email = request.json.get("email")
            password = request.json.get("password")

            # Find user by email
            user = User.query.filter_by(email=email).first()

            # Check if user exists and password is correct
            if not user or not user.check_password(password):
                raise AppError(
                    "Invalid email or password", ErrorCode.AUTH_INVALID_CREDENTIALS
                )

            # Create access and refresh tokens
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)

            # Log activity
            activity_log = ActivityLog(
                user_id=user.id,
                title="User Login",
                description=f"User logged in from {request.remote_addr}",
            )
            activity_log.save()

            return {
                "success": True,
                "access_token": access_token,
                "refresh_token": refresh_token,
                "user": user.to_dict(),
            }, 200

        except AppError as e:
            return e.to_dict(), 401

        except Exception as e:
            current_app.logger.error(f"Login error: {str(e)}")
            return {
                "success": False,
                "error": "An error occurred during login",
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500


class LogoutResource(Resource):
    """Resource for user logout."""

    @jwt_required()
    def post(self):
        """
        Logout a user.

        Returns:
            dict: Response with logout status
        """
        try:
            jti = get_jwt()["jti"]
            jwt_blocklist.add(jti)

            # Log activity
            user_id = get_jwt_identity()

            activity_log = ActivityLog(
                user_id=user_id,
                title="User Logout",
                description=f"User logged out from {request.remote_addr}",
            )
            activity_log.save()

            return {"success": True, "message": "Successfully logged out"}, 200

        except Exception as e:
            current_app.logger.error(f"Logout error: {str(e)}")
            return {
                "success": False,
                "error": "An error occurred during logout",
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500


class TokenRefreshResource(Resource):
    """Resource for refreshing JWT tokens."""

    @jwt_required(refresh=True)
    def post(self):
        """
        Refresh a user's access token.

        Returns:
            dict: Response with new access token
        """
        try:
            user_id = get_jwt_identity()

            # Verify that user still exists
            user = User.query.get(user_id)
            if not user:
                raise AppError("User not found", ErrorCode.AUTH_INVALID_TOKEN)

            access_token = create_access_token(identity=user_id)

            return {"success": True, "access_token": access_token}, 200

        except AppError as e:
            return e.to_dict(), 401

        except Exception as e:
            current_app.logger.error(f"Token refresh error: {str(e)}")
            return {
                "success": False,
                "error": "An error occurred during token refresh",
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500
