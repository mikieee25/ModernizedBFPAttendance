"""
Face recognition services.
"""

from .face_service import (
    extract_face_embeddings,
    compare_embeddings,
    load_face_database,
    recognize_face,
    process_attendance,
    register_face,
    process_base64_image,
    save_attendance_image,
    cleanup_old_attendance_images,
)
