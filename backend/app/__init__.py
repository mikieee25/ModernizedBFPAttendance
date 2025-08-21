"""
Main application factory for the BFP Sorsogon Attendance System.
"""

import os
import logging
from logging.handlers import RotatingFileHandler
import threading
import time
from datetime import datetime
from flask import Flask, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv

# Load environment variables from .env file if it exists
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)
    print("Loaded environment variables from .env file")

from .models.user import User
from .models.base import db
from .utils.logger import setup_logger
from .config import get_config, BASE_DIR


def cleanup_thread_function(app):
    """
    Background thread to periodically clean up old attendance images.
    """
    with app.app_context():
        while True:
            try:
                # Import here to avoid circular imports
                from .services.face_recognition.face_service import (
                    cleanup_old_attendance_images,
                )

                # Run the cleanup function
                cleanup_old_attendance_images()

                # Sleep for 24 hours (86400 seconds)
                time.sleep(86400)
            except Exception as e:
                app.logger.error(f"Error in cleanup thread: {e}")
                # Sleep for 1 hour before retrying if there was an error
                time.sleep(3600)


def create_app(config_name=None):
    """Application factory function."""
    app = Flask(__name__)

    # Load configuration
    config = get_config(config_name)
    app.config.from_object(config)

    # Create necessary directories
    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["TEMP_ATTENDANCE_FOLDER"], exist_ok=True)
    os.makedirs(app.config["ANNOTATIONS_FOLDER"], exist_ok=True)

    # Initialize CORS
    CORS(
        app,
        resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=True,
    )

    # Initialize database
    db.init_app(app)

    # Initialize JWT
    jwt = JWTManager(app)

    # Initialize rate limiter
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=["200 per day", "50 per hour"],
        storage_uri=app.config["RATELIMIT_STORAGE_URL"],
    )
    app.limiter = limiter

    # Set up logging
    if not app.debug:
        # Create logs directory if it doesn't exist
        logs_dir = os.path.join(BASE_DIR, "..", "logs")
        os.makedirs(logs_dir, exist_ok=True)

        # Set up file handler for error logging
        file_handler = RotatingFileHandler(
            os.path.join(logs_dir, "bfp_attendance.log"),
            maxBytes=1024 * 1024 * 10,  # 10 MB
            backupCount=5,
        )
        file_handler.setFormatter(
            logging.Formatter(
                "%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]"
            )
        )
        file_handler.setLevel(logging.INFO)
        app.logger.addHandler(file_handler)

        app.logger.setLevel(logging.INFO)
        app.logger.info("BFP Attendance System startup")

    # Import and register API blueprints
    from .api import api_bp

    app.register_blueprint(api_bp)

    # Serve frontend files (for development and testing)
    @app.route("/app")
    @app.route("/app/<path:path>")
    def serve_frontend(path=""):
        """Serve the frontend application files."""
        frontend_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "frontend"
        )

        if path == "":
            return send_from_directory(frontend_dir, "index.html")

        # Try to serve the requested file
        if os.path.exists(os.path.join(frontend_dir, path)):
            return send_from_directory(frontend_dir, path)

        # If file doesn't exist, serve index.html (for SPA routing)
        return send_from_directory(frontend_dir, "index.html")

    # Serve frontend assets
    @app.route("/assets/<path:path>")
    def serve_frontend_assets(path):
        """Serve the frontend assets."""
        frontend_assets_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "frontend",
            "assets",
        )
        return send_from_directory(frontend_assets_dir, path)

    # Create database if it doesn't exist
    with app.app_context():
        db.create_all()

        # Create a default admin user if it doesn't exist
        from .models.user import User, StationType

        admin_user = User.query.filter_by(email="admin@bfpsorsogon.gov.ph").first()
        if not admin_user:
            admin_user = User(
                username="admin",
                email="admin@bfpsorsogon.gov.ph",
                station_type=StationType.CENTRAL,
                is_admin=True,
            )
            admin_user.set_password("admin1234")
            db.session.add(admin_user)

            # Create client accounts for each station if they don't exist
            stations = [
                {
                    "username": "central",
                    "email": "central@bfpsorsogon.gov.ph",
                    "type": StationType.CENTRAL,
                },
                {
                    "username": "talisay",
                    "email": "talisay@bfpsorsogon.gov.ph",
                    "type": StationType.TALISAY,
                },
                {
                    "username": "bacon",
                    "email": "bacon@bfpsorsogon.gov.ph",
                    "type": StationType.BACON,
                },
                {
                    "username": "abuyog",
                    "email": "abuyog@bfpsorsogon.gov.ph",
                    "type": StationType.ABUYOG,
                },
            ]

            for station in stations:
                station_user = User.query.filter_by(email=station["email"]).first()
                if not station_user:
                    station_user = User(
                        username=station["username"],
                        email=station["email"],
                        station_type=station["type"],
                        is_admin=False,
                    )
                    station_user.set_password(f"{station['username']}1234")
                    db.session.add(station_user)

            db.session.commit()

    # Start the cleanup thread
    cleanup_thread = threading.Thread(
        target=cleanup_thread_function, args=(app,), daemon=True
    )
    cleanup_thread.start()
    app.logger.info("Started background thread for attendance image cleanup")

    @app.route("/health")
    def health_check():
        """Health check endpoint for the API."""
        return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

    @app.route("/")
    def index():
        """Root endpoint that serves the API documentation HTML page."""
        return send_from_directory(os.path.join(app.root_path, "static"), "index.html")

    @app.route("/favicon.ico")
    def favicon():
        """Serve the favicon."""
        return send_from_directory(
            os.path.join(app.root_path, "static"),
            "favicon.ico",
            mimetype="image/vnd.microsoft.icon",
        )

    return app
