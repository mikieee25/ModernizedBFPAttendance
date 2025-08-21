"""
Attendance API endpoints.
"""

from flask import request, jsonify, current_app
from flask_restful import Resource
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from app.models.user import User
from app.models.personnel import Personnel
from app.models.attendance import (
    Attendance,
    PendingAttendance,
    AttendanceType,
    AttendanceStatus,
)
from app.models.activity_log import ActivityLog
from app.utils.security import admin_required, station_access_required
from app.utils.validators import validate_required_fields, validate_date_format
from app.utils.errors import AppError, ErrorCode
from app.services.face_recognition import process_attendance, save_attendance_image


class AttendanceResource(Resource):
    """Resource for recording attendance."""

    @jwt_required()
    @validate_required_fields(["image"])
    def post(self):
        """
        Record attendance with face recognition.

        Returns:
            dict: Response with attendance status
        """
        try:
            # Get image data
            image_data = request.json.get("image")

            if not image_data:
                raise AppError(
                    "Image data is required", ErrorCode.SYSTEM_VALIDATION_ERROR
                )

            # Process with face recognition service
            result = process_attendance(None, None, image_data)

            if not result.get("success"):
                error_message = result.get("error", "Attendance recording failed")
                error_code = result.get(
                    "error_code", ErrorCode.SYSTEM_UNKNOWN_ERROR.value
                )
                return {
                    "success": False,
                    "error": error_message,
                    "error_code": error_code,
                }, 400

            return result, 200

        except AppError as e:
            return e.to_dict(), 400

        except Exception as e:
            current_app.logger.error(f"Face attendance error: {str(e)}")
            return {
                "success": False,
                "error": "An error occurred while processing attendance",
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500

    @jwt_required()
    @validate_required_fields(["personnel_id", "attendance_type"])
    def put(self):
        """
        Record manual attendance.

        Returns:
            dict: Response with attendance status
        """
        try:
            user_id = get_jwt_identity()
            user = User.query.get(user_id)

            if not user:
                raise AppError("User not found", ErrorCode.AUTH_INVALID_TOKEN)

            # Get request data
            data = request.json
            personnel_id = data.get("personnel_id")
            attendance_type = data.get("attendance_type")
            notes = data.get("notes", "")
            image_data = data.get("image")

            if not image_data:
                raise AppError(
                    "Image data is required", ErrorCode.SYSTEM_VALIDATION_ERROR
                )

            # Check if personnel exists
            personnel = Personnel.query.get(personnel_id)
            if not personnel:
                raise AppError("Personnel not found", ErrorCode.PERSONNEL_NOT_FOUND)

            # Check access
            if not user.is_admin and personnel.station_id != user.station_id:
                raise AppError("Access denied", ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS)

            # Save the image
            today = datetime.now().date()
            image_path = save_attendance_image(
                personnel.id, image_data, f"manual_{attendance_type.lower()}"
            )

            if not image_path:
                raise AppError("Error saving image", ErrorCode.SYSTEM_FILE_ERROR)

            # Create pending attendance record
            pending = PendingAttendance(
                personnel_id=personnel.id,
                date=today,
                attendance_type=AttendanceType(attendance_type),
                image_path=image_path,
                notes=notes,
            )

            pending.save()

            return {
                "success": True,
                "message": "Manual attendance submitted for approval",
                "data": pending.to_dict(),
            }, 200

        except AppError as e:
            status_code = (
                403 if e.code == ErrorCode.AUTH_INSUFFICIENT_PERMISSIONS else 400
            )
            return e.to_dict(), status_code

        except Exception as e:
            current_app.logger.error(f"Manual attendance error: {str(e)}")
            return {
                "success": False,
                "error": "An error occurred while recording manual attendance",
                "error_code": ErrorCode.SYSTEM_UNKNOWN_ERROR.value,
            }, 500


class AttendanceHistoryResource(Resource):
    """Resource for attendance history."""

    @jwt_required()
    def get(self):
        """Get attendance history."""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Get filter parameters
        personnel_id = request.args.get("personnel_id", type=int)
        date_from = request.args.get(
            "date_from", (datetime.now() - timedelta(days=7)).date().isoformat()
        )
        date_to = request.args.get("date_to", datetime.now().date().isoformat())

        # Validate date formats
        if not validate_date_format(date_from) or not validate_date_format(date_to):
            return {
                "success": False,
                "error": "Invalid date format. Use YYYY-MM-DD.",
            }, 400

        # Build query
        query = Attendance.query

        # Filter by personnel if provided
        if personnel_id:
            query = query.filter_by(personnel_id=personnel_id)

        # Filter by date range
        if date_from:
            query = query.filter(Attendance.date >= date_from)

        if date_to:
            query = query.filter(Attendance.date <= date_to)

        # Filter by user's access
        if not user.is_admin:
            query = query.join(Personnel).filter(Personnel.station_id == user.id)

        # Execute query
        attendance_records = query.order_by(
            Attendance.date.desc(), Attendance.time_in.desc()
        ).all()

        return {
            "success": True,
            "data": [record.to_dict() for record in attendance_records],
        }, 200


class PendingAttendanceResource(Resource):
    """Resource for pending attendance approvals."""

    @jwt_required()
    def get(self):
        """Get pending attendance records."""
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Build query
        query = PendingAttendance.query

        # Filter by user's access
        if not user.is_admin:
            query = query.join(Personnel).filter(Personnel.station_id == user.id)

        # Execute query
        pending_records = query.order_by(PendingAttendance.date_created.desc()).all()

        return {
            "success": True,
            "data": [record.to_dict() for record in pending_records],
        }, 200

    @jwt_required()
    @admin_required
    def post(self):
        """Approve or reject a pending attendance record."""
        # Get request data
        data = request.json
        pending_id = data.get("pending_id")
        action = data.get("action")  # 'approve' or 'reject'

        if not pending_id or not action or action not in ["approve", "reject"]:
            return {
                "success": False,
                "error": "Invalid request. Provide pending_id and action.",
            }, 400

        # Get pending record
        pending = PendingAttendance.query.get(pending_id)

        if not pending:
            return {
                "success": False,
                "error": "Pending attendance record not found",
            }, 404

        user_id = get_jwt_identity()

        if action == "approve":
            # Create approved attendance record
            today = pending.date
            attendance_type = pending.attendance_type

            # Find existing attendance record for the day
            attendance = Attendance.query.filter_by(
                personnel_id=pending.personnel_id, date=today
            ).first()

            if not attendance:
                # Create new attendance record if none exists
                attendance = Attendance(
                    personnel_id=pending.personnel_id,
                    date=today,
                    is_auto_captured=False,
                    is_approved=True,
                    approved_by=user_id,
                )

            # Update time_in or time_out based on attendance type
            if attendance_type == AttendanceType.TIME_IN:
                attendance.time_in = pending.date_created
                attendance.time_in_image = pending.image_path
            else:  # TIME_OUT
                attendance.time_out = pending.date_created
                attendance.time_out_image = pending.image_path

            attendance.save()

            # Log activity
            log = ActivityLog(
                user_id=user_id,
                title="Approve Attendance",
                description=f"Approved {attendance_type.value} for Personnel ID {pending.personnel_id}",
            )
            log.save()

            result = {
                "success": True,
                "message": f"Attendance {attendance_type.value} approved",
                "data": attendance.to_dict(),
            }
        else:  # reject
            # Log activity
            log = ActivityLog(
                user_id=user_id,
                title="Reject Attendance",
                description=f"Rejected {pending.attendance_type.value} for Personnel ID {pending.personnel_id}",
            )
            log.save()

            result = {
                "success": True,
                "message": f"Attendance {pending.attendance_type.value} rejected",
            }

        # Delete the pending record
        pending.delete()

        return result, 200
