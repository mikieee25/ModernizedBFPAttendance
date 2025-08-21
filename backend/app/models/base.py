"""
Base model class for the ORM.
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()


class BaseModel(db.Model):
    """Abstract base model with common fields and methods."""

    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    # Using date_created to match the SQL schema
    date_created = db.Column(db.DateTime, default=datetime.utcnow)

    def save(self):
        """Save the model to the database."""
        if not self.date_created:
            self.date_created = datetime.utcnow()
        db.session.add(self)
        db.session.commit()

    def delete(self):
        """Delete the model from the database."""
        db.session.delete(self)
        db.session.commit()

    def to_dict(self):
        """Convert model to dictionary for API responses."""
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
