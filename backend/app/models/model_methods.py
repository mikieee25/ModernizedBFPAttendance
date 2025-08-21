"""
Model extension methods.
"""

from flask import current_app
from sqlalchemy.exc import SQLAlchemyError

from app.utils.errors import AppError, ErrorCode


class ModelMethods:
    """
    Mixin class that provides common methods for all models.

    This class adds convenience methods for CRUD operations to all models.
    """

    def save(self):
        """
        Save the current model instance to the database.

        Returns:
            self: The model instance

        Raises:
            AppError: If there's a database error
        """
        try:
            from app import db

            db.session.add(self)
            db.session.commit()
            return self
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database error: {str(e)}")
            raise AppError(
                "Database error occurred while saving", ErrorCode.SYSTEM_DATABASE_ERROR
            )

    def delete(self):
        """
        Delete the current model instance from the database.

        Returns:
            bool: True if the deletion was successful

        Raises:
            AppError: If there's a database error
        """
        try:
            from app import db

            db.session.delete(self)
            db.session.commit()
            return True
        except SQLAlchemyError as e:
            db.session.rollback()
            current_app.logger.error(f"Database error: {str(e)}")
            raise AppError(
                "Database error occurred while deleting",
                ErrorCode.SYSTEM_DATABASE_ERROR,
            )

    @classmethod
    def get_by_id(cls, id):
        """
        Get a model instance by its ID.

        Args:
            id: The ID of the model instance

        Returns:
            object: The model instance or None if not found
        """
        return cls.query.get(id)

    @classmethod
    def get_all(cls):
        """
        Get all model instances.

        Returns:
            list: All model instances
        """
        return cls.query.all()
