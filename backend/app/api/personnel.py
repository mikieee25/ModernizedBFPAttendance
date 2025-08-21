"""
Personnel API endpoints.
"""

from flask import request, jsonify, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models.user import User
from app.models.personnel import Personnel
from app.models.activity_log import ActivityLog
from app.utils.security import admin_required, station_access_required
from app.utils.validators import validate_required_fields
from app.utils.errors import AppError, ErrorCode


class PersonnelListResource(Resource):
    """Resource for listing and creating personnel."""

    @jwt_required()
    def get(self):
        """
        Get all personnel or filter by station.

        Returns:
            dict: Response with personnel data
        """
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                raise AppError("User not found", ErrorCode.AUTH_INVALID_TOKEN)

            # Get query parameters
            station_id = request.args.get("station_id", type=int)

            # Check access
            if not user.is_admin and (not station_id or station_id != user.station_id):
                raise AppError("Access denied", ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS)

            # Build query
            query = Personnel.query

            # Filter by station if provided
            if station_id:
                query = query.filter_by(station_id=station_id)
            elif not user.is_admin:
                # Non-admin users can only see their station's personnel
                query = query.filter_by(station_id=user.station_id)

            # Execute query
            personnel = query.all()

            return {"success": True, "data": [p.to_dict() for p in personnel]}, 200

        except AppError as e:
            return e.to_dict(), (
                403 if e.code == ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS else 400
            )

        except Exception as e:
            current_app.logger.error(f"Personnel list error: {str(e)}")
            return {
                "success": False,
                "error": "An error occurred while retrieving personnel",
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500

    @jwt_required()
    @validate_required_fields(["first_name", "last_name", "rank", "station_id"])
    def post(self):
        """
        Create a new personnel.

        Returns:
            dict: Response with created personnel data
        """
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                raise AppError("User not found", ErrorCode.AUTH_INVALID_TOKEN)

            # Get request data
            data = request.json
            station_id = data.get("station_id")

            # Check access
            if not user.is_admin and station_id != user.station_id:
                raise AppError("Access denied", ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS)

            # Create new personnel
            personnel = Personnel(
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                rank=data.get("rank"),
                station_id=station_id,
            )

            # Save to database
            personnel.save()

            # Log activity
            activity_log = ActivityLog(
                user_id=user_id,
                title="Create Personnel",
                description=f"Created personnel {personnel.full_name}",
            )
            activity_log.save()

            return {"success": True, "data": personnel.to_dict()}, 201

        except AppError as e:
            return e.to_dict(), (
                403 if e.code == ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS else 400
            )

        except Exception as e:
            current_app.logger.error(f"Create personnel error: {str(e)}")
            return {
                "success": False,
                "error": "An error occurred while creating personnel",
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500


class PersonnelResource(Resource):
    """Resource for individual personnel."""

    @jwt_required()
    def get(self, personnel_id):
        """Get a personnel by ID."""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Get personnel
        personnel = Personnel.query.get(personnel_id)

        # Check if personnel exists
        if not personnel:
            return {"success": False, "error": "Personnel not found"}, 404

        # Check access
        if not user.is_admin and personnel.station_id != user.id:
            return {"success": False, "error": "Access denied"}, 403

        return {"success": True, "data": personnel.to_dict()}, 200

    @jwt_required()
    def put(self, personnel_id):
        """Update a personnel."""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Get personnel
        personnel = Personnel.query.get(personnel_id)

        # Check if personnel exists
        if not personnel:
            return {"success": False, "error": "Personnel not found"}, 404

        # Check access
        if not user.is_admin and personnel.station_id != user.id:
            return {"success": False, "error": "Access denied"}, 403

        # Get request data
        data = request.json

        # Update personnel
        if "first_name" in data:
            personnel.first_name = data["first_name"]
        if "last_name" in data:
            personnel.last_name = data["last_name"]
        if "rank" in data:
            personnel.rank = data["rank"]

        # Only admin can change station
        if user.is_admin and "station_id" in data:
            personnel.station_id = data["station_id"]

        # Save changes
        personnel.save()

        # Log activity
        log = ActivityLog(
            user_id=user_id,
            title="Update Personnel",
            description=f"Updated personnel {personnel.full_name}",
        )
        log.save()

        return {"success": True, "data": personnel.to_dict()}, 200

    @jwt_required()
    def delete(self, personnel_id):
        """Delete a personnel."""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Only admin can delete personnel
        if not user.is_admin:
            return {"success": False, "error": "Admin access required"}, 403

        # Get personnel
        personnel = Personnel.query.get(personnel_id)

        # Check if personnel exists
        if not personnel:
            return {"success": False, "error": "Personnel not found"}, 404

        # Store name for logging
        full_name = personnel.full_name

        # Delete personnel
        personnel.delete()

        # Log activity
        log = ActivityLog(
            user_id=user_id,
            title="Delete Personnel",
            description=f"Deleted personnel {full_name}",
        )
        log.save()

        return {"success": True, "message": "Personnel deleted successfully"}, 200
