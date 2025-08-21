"""
Validation utilities for the application.
"""

import re
from datetime import datetime
from flask import request, jsonify
from functools import wraps

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


def validate_email(email):
    """Validate email format."""
    if not email or not EMAIL_REGEX.match(email):
        return False
    return True


def validate_password(password):
    """
    Validate password strength.

    Password should be at least 8 characters long and contain at least one digit,
    one uppercase letter, and one lowercase letter.
    """
    if not password or len(password) < 8:
        return False

    # Check for at least one digit
    if not any(char.isdigit() for char in password):
        return False

    # Check for at least one uppercase letter
    if not any(char.isupper() for char in password):
        return False

    # Check for at least one lowercase letter
    if not any(char.islower() for char in password):
        return False

    return True


def validate_required_fields(required_fields):
    """
    Decorator to validate required fields in a request.

    Args:
        required_fields (list): List of field names to validate
    """

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            if request.is_json:
                data = request.json
            else:
                data = request.form

            missing_fields = [
                field
                for field in required_fields
                if field not in data or not data[field]
            ]

            if missing_fields:
                return (
                    jsonify(
                        {
                            "success": False,
                            "error": f"Missing required fields: {', '.join(missing_fields)}",
                        }
                    ),
                    400,
                )

            return fn(*args, **kwargs)

        return wrapper

    return decorator


def validate_date_format(date_str, format="%Y-%m-%d"):
    """Validate date string format."""
    try:
        datetime.strptime(date_str, format)
        return True
    except ValueError:
        return False
