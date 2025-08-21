"""
Attendance models for tracking personnel attendance.
"""

import enum
from datetime import datetime

from .base import db, BaseModel
from .personnel import Personnel


class AttendanceType(enum.Enum):
    """Enum for attendance action types."""

    TIME_IN = "Time In"
    TIME_OUT = "Time Out"


class AttendanceStatus(enum.Enum):
    """Enum for attendance status."""

    PRESENT = "Present"
    LATE = "Late"
    ABSENT = "Absent"


class Attendance(BaseModel):
    """
    Model to store attendance records.
    """

    __tablename__ = "attendance"

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    time_in = db.Column(db.DateTime, nullable=True)
    time_out = db.Column(db.DateTime, nullable=True)
    status = db.Column(db.Enum(AttendanceStatus), default=AttendanceStatus.PRESENT)
    confidence_score = db.Column(db.Float, nullable=True)
    is_auto_captured = db.Column(
        db.Boolean, default=True
    )  # Flag for auto vs manual capture
    is_approved = db.Column(db.Boolean, default=True)  # For manual uploads
    approved_by = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    time_in_image = db.Column(db.String(255), nullable=True)  # Path to time-in image
    time_out_image = db.Column(db.String(255), nullable=True)  # Path to time-out image

    # Relationships
    personnel = db.relationship("Personnel", backref="attendances", lazy=True)
    approver = db.relationship("User", backref="approved_attendances", lazy=True)

    @property
    def duration(self):
        """Calculate the duration between time in and time out."""
        if self.time_in and self.time_out:
            return self.time_out - self.time_in
        return None

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        result = super().to_dict()
        # Add derived properties
        if self.duration:
            result["duration"] = str(self.duration)
        # Convert enum to string
        if result.get("status"):
            result["status"] = self.status.value
        return result


class PendingAttendance(BaseModel):
    """
    Model to store manual attendance uploads pending approval.
    """

    __tablename__ = "pending_attendance"

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"), nullable=False)
    date = db.Column(db.Date, nullable=False, default=datetime.utcnow().date)
    attendance_type = db.Column(db.Enum(AttendanceType), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)  # Path to uploaded image
    notes = db.Column(db.Text, nullable=True)  # Optional explanation for manual upload

    # Relationships
    personnel = db.relationship("Personnel", backref="pending_attendances", lazy=True)

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        result = super().to_dict()
        # Convert enum to string
        if result.get("attendance_type"):
            result["attendance_type"] = self.attendance_type.value
        return result
