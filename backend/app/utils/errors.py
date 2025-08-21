"""
Error handling utilities for the API.
"""

from enum import Enum, auto


class ErrorCode(Enum):
    """Error codes for the API."""

    # Authentication errors: 1000-1999
    AUTH_INVALID_CREDENTIALS = 1001
    AUTH_TOKEN_EXPIRED = 1002
    AUTH_INSUFFICIENT_PERMISSIONS = 1003
    AUTH_INVALID_TOKEN = 1004

    # Face Recognition errors: 2000-2999
    FACE_NOT_DETECTED = 2001
    FACE_LOW_CONFIDENCE = 2002
    FACE_REGISTRATION_FAILED = 2003
    FACE_NOT_RECOGNIZED = 2004

    # Attendance errors: 3000-3999
    ATTENDANCE_DUPLICATE = 3001
    ATTENDANCE_INVALID_TIME = 3002
    ATTENDANCE_NOT_FOUND = 3003
    ATTENDANCE_INVALID_STATUS = 3004

    # Personnel errors: 4000-4999
    PERSONNEL_NOT_FOUND = 4001
    PERSONNEL_DUPLICATE = 4002
    PERSONNEL_INVALID_DATA = 4003

    # System errors: 9000-9999
    SYSTEM_DATABASE_ERROR = 9001
    SYSTEM_FILE_ERROR = 9002
    SYSTEM_VALIDATION_ERROR = 9003
    SYSTEM_UNKNOWN_ERROR = 9999


class AppError(Exception):
    """
    Application-specific error that includes an error code and a message.

    This exception is meant to be caught and converted to a proper API response.
    """

    def __init__(self, message, code=ErrorCode.SYSTEM_UNKNOWN_ERROR):
        """
        Initialize a new AppError.

        Args:
            message (str): Human-readable error message
            code (ErrorCode): Error code from the ErrorCode enum
        """
        self.message = message
        self.code = code
        super().__init__(self.message)

    def to_dict(self):
        """
        Convert the error to a dictionary suitable for API responses.

        Returns:
            dict: Error response dictionary
        """
        return {
            "success": False,
            "error": self.message,
            "error_code": self.code.value,
        }
