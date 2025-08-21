"""
Personnel model representing fire personnel.
"""

from .base import db, BaseModel
from .user import User


class Personnel(BaseModel):
    """
    Personnel model representing fire personnel.
    """

    __tablename__ = "personnel"

    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    rank = db.Column(db.String(100), nullable=False)
    station_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    image_path = db.Column(db.String(255), nullable=True)  # Path to profile picture

    # Relationships
    station = db.relationship("User", backref="personnel", lazy=True)
    # face_data and attendances will be defined in their respective models

    @property
    def full_name(self):
        """Get the full name with rank."""
        return f"{self.rank} {self.first_name} {self.last_name}"

    @property
    def has_face_data(self):
        """Check if the personnel has face recognition data."""
        from .face_data import FaceData

        # Use a direct count query for better performance
        count = FaceData.query.filter_by(personnel_id=self.id).count()
        return count > 0

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        result = super().to_dict()
        # Add derived properties
        result["full_name"] = self.full_name
        result["has_face_data"] = self.has_face_data
        return result
