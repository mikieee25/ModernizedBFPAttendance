"""
Activity log model for tracking user actions.
"""

from datetime import datetime
from .base import db, BaseModel
from .user import User


class ActivityLog(BaseModel):
    """
    Model to store user activity logs.
    """

    __tablename__ = "activity_log"

    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    timestamp = db.Column(db.DateTime, nullable=True, default=datetime.utcnow)

    # Define relationship with User model
    user = db.relationship("User", backref="activities", lazy=True)

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        result = super().to_dict()
        # Add user information
        if self.user:
            result["user"] = {
                "id": self.user.id,
                "username": self.user.username,
                "email": self.user.email,
            }
        return result
