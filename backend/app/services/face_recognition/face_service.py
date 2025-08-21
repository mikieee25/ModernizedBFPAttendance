"""
Face recognition service implementation.
"""

import os
import cv2
import torch
import numpy as np
import json
import logging
import base64
from datetime import datetime, timedelta
import uuid
from flask import current_app
from sqlalchemy import or_

from ...models import Personnel, FaceData, Attendance, AttendanceStatus, User
from ...utils.logger import setup_logger

# Set up logger
logger = setup_logger("face_recognition")

# Global model instance - will be initialized when needed
yolo_model = None


def get_yolo_model():
    """Get or initialize the YOLO face detection model."""
    global yolo_model
    if yolo_model is None:
        try:
            from ultralytics import YOLO

            model_path = current_app.config["YOLO_MODEL_PATH"]

            # Force CPU usage if configured
            device = current_app.config.get("TORCH_DEVICE", "cpu")

            # Print debug info for device configuration
            logger.info(f"PyTorch version: {torch.__version__}")
            logger.info(f"CUDA available: {torch.cuda.is_available()}")
            logger.info(f"Current PyTorch device: {device}")

            # Ensure PyTorch uses the configured device
            if device == "cpu":
                torch.set_default_device("cpu")

            # Initialize model with specific device setting
            yolo_model = YOLO(model_path)
            yolo_model.to(device)
            logger.info(f"YOLO model loaded on {device}")

        except Exception as e:
            logger.error(f"Error loading YOLO model: {e}")
            # Re-raise the exception to be handled by the caller
            raise

    return yolo_model


def extract_face_embeddings(image_path):
    """Extract embeddings from a face image."""
    # Placeholder - will be implemented with full face recognition logic
    logger.info(f"Extracting face embeddings from {image_path}")
    return [], {}


def compare_embeddings(emb1, emb2, threshold=0.75):
    """Compare two face embeddings."""
    # Placeholder - will be implemented with face comparison logic
    logger.info(f"Comparing face embeddings with threshold {threshold}")
    return 0.0, False


def load_face_database(station_id=None):
    """Load face database for recognition."""
    # Placeholder - will be implemented with database loading logic
    logger.info(f"Loading face database for station {station_id}")
    return {}


def recognize_face(face_embedding, face_database, threshold=None):
    """Recognize a face from embeddings."""
    # Placeholder - will be implemented with face recognition logic
    logger.info(f"Recognizing face with threshold {threshold}")
    return None, 0


def process_attendance(personnel_id, confidence, base64_image=None):
    """Process attendance for a recognized face."""
    # Placeholder - will be implemented with attendance processing logic
    logger.info(f"Processing attendance for personnel {personnel_id}")
    return {"success": True, "message": "Attendance processed"}


def process_base64_image(base64_image):
    """Process a base64 encoded image."""
    # Placeholder - will be implemented with image processing logic
    logger.info("Processing base64 image")
    return None, None, None


def register_face(personnel_id, base64_images):
    """Register face images for a personnel."""
    # Placeholder - will be implemented with face registration logic
    logger.info(
        f"Registering {len(base64_images)} face images for personnel {personnel_id}"
    )
    return {"success": True, "message": "Face registration processed"}


def save_attendance_image(personnel_id, base64_image, prefix):
    """Save an attendance image to disk."""
    # Placeholder - will be implemented with image saving logic
    logger.info(f"Saving attendance image for personnel {personnel_id}")
    return f"attendance_images_temp/placeholder_{personnel_id}_{prefix}.jpg"


def cleanup_old_attendance_images():
    """Clean up old attendance images."""
    # Placeholder - will be implemented with cleanup logic
    logger.info("Cleaning up old attendance images")
    return True
