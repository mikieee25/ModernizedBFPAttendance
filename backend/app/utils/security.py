"""
Security utilities for the application.
"""

from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

from ..models.user import User


def admin_required(fn):
    """
    Decorator to restrict access to admin users only.

    Must be used after jwt_required decorator.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user or not user.is_admin:
            return jsonify({"msg": "Admin access required"}), 403

        return fn(*args, **kwargs)

    return wrapper


def station_access_required(fn):
    """
    Decorator to check if a user has access to a station.

    Must be used after jwt_required decorator.
    """

    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        # Admins have access to all stations
        if user and user.is_admin:
            return fn(*args, **kwargs)

        # Check station access
        station_id = kwargs.get("station_id")
        if not station_id and request.method in ["GET", "POST"]:
            station_id = request.args.get("station_id") or request.json.get(
                "station_id"
            )

        if not station_id:
            return jsonify({"msg": "Station ID required"}), 400

        if not user or user.id != int(station_id):
            return jsonify({"msg": "Access denied for this station"}), 403

        return fn(*args, **kwargs)

    return wrapper
