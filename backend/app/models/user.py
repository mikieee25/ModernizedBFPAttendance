"""
User model representing system users.
"""

import enum
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func

from .base import db, BaseModel


class StationType(enum.Enum):
    """Enum for the different BFP stations in Sorsogon."""

    CENTRAL = "Central Fire Station"
    TALISAY = "Talisay Station"
    BACON = "Bacon Station"
    ABUYOG = "Abuyog Station"


class User(BaseModel, UserMixin):
    """
    User model representing station accounts and admin users.
    """

    __tablename__ = "user"

    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(
        db.String(255), nullable=False
    )  # Increased length for hashed passwords
    station_type = db.Column(db.Enum(StationType), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    profile_picture = db.Column(
        db.String(255), nullable=True, default="images/profile-placeholder.jpg"
    )

    # Relationships - will be defined in the personnel model to avoid circular imports
    # personnel = db.relationship("Personnel", backref="station", lazy=True)

    def set_password(self, password):
        """Hash and set the user's password."""
        self.password = generate_password_hash(password)

    def check_password(self, password):
        """Check if the provided password matches the stored hash."""
        return check_password_hash(self.password, password)

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        result = super().to_dict()
        # Remove sensitive information
        result.pop("password", None)
        # Convert enum to string
        if result.get("station_type"):
            result["station_type"] = self.station_type.value
        return result
