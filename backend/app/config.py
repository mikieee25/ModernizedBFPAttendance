"""
Configuration for the BFP Sorsogon Attendance System.
"""

import os
import json
from datetime import timedelta

# Get base directory of application
BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))


class Config:
    """Base configuration."""

    # App settings
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key-please-change-in-production")
    JWT_SECRET_KEY = os.environ.get(
        "JWT_SECRET_KEY", "jwt-dev-key-please-change-in-production"
    )

    # Database settings - use MySQL
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "DATABASE_URL", "mysql://root:@localhost/bfp_sorsogon_attendance"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_recycle": 280,  # recycle connections after 280 seconds
        "pool_pre_ping": True,  # enable connection pool pre-ping feature
    }

    # JWT settings
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    # File upload settings
    UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "face_data")
    TEMP_ATTENDANCE_FOLDER = os.path.join(BASE_DIR, "..", "attendance_images_temp")
    ANNOTATIONS_FOLDER = os.path.join(BASE_DIR, "..", "annotations")
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max file size

    # Face recognition settings
    YOLO_MODEL_PATH = "./app/services/face_recognition/yolov11n-face.pt"
    FACE_DETECTION_CONFIDENCE = 0.5
    FACE_RECOGNITION_THRESHOLD = 0.75
    TORCH_DEVICE = os.environ.get("TORCH_DEVICE", "cpu")  # 'cpu' or 'cuda'

    # Attendance settings
    WORK_START_TIME = "08:00"  # Format: HH:MM
    ATTENDANCE_COOLDOWN = 60  # seconds
    ATTENDANCE_IMAGE_RETENTION_DAYS = 1  # days

    # CORS settings
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

    # Rate limiting
    RATELIMIT_DEFAULT = "200 per day, 50 per hour"
    RATELIMIT_STORAGE_URL = "memory://"

    # Logging
    LOG_LEVEL = os.environ.get("LOG_LEVEL", "INFO")
    LOG_FORMAT = os.environ.get("LOG_FORMAT", "json")  # 'json' or 'text'


class DevelopmentConfig(Config):
    """Development configuration."""

    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    """Testing configuration."""

    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"
    PRESERVE_CONTEXT_ON_EXCEPTION = False


class ProductionConfig(Config):
    """Production configuration."""

    DEBUG = False
    TESTING = False

    # In production, override these with environment variables
    SECRET_KEY = os.environ.get("SECRET_KEY") or "prod-default-secret-key-change-me"
    JWT_SECRET_KEY = (
        os.environ.get("JWT_SECRET_KEY") or "prod-default-jwt-secret-key-change-me"
    )

    # Issue a warning instead of an error if keys are not set properly
    if not os.environ.get("SECRET_KEY") or not os.environ.get("JWT_SECRET_KEY"):
        import warnings

        warnings.warn(
            "WARNING: Production environment should have SECRET_KEY and JWT_SECRET_KEY set via environment variables for security.",
            UserWarning,
        )

    # Add production-specific settings
    RATELIMIT_DEFAULT = "1000 per day, 100 per hour"


# Configuration dictionary
config = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
    "default": DevelopmentConfig,
}


def get_config(config_name):
    """Get configuration class by name."""
    return config.get(config_name, config["default"])
