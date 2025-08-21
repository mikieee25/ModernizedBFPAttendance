"""
Face data model for storing face recognition data.
"""

from .base import db, BaseModel
from .personnel import Personnel


class FaceData(BaseModel):
    """
    Model to store face recognition data for personnel.
    """

    __tablename__ = "face_data"

    personnel_id = db.Column(db.Integer, db.ForeignKey("personnel.id"), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    embedding = db.Column(
        db.Text(length=4294967295), nullable=True
    )  # LONGTEXT - JSON string of face embedding
    confidence = db.Column(db.Float, nullable=True)

    # Relationships
    personnel = db.relationship("Personnel", backref="face_data", lazy=True)

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        result = super().to_dict()
        # Remove the embedding data as it's large and not needed in API responses
        result.pop("embedding", None)
        return result
