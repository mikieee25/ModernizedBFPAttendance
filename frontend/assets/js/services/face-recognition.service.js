/**
 * Service for handling face recognition operations.
 */
import { ApiService } from "./api.service.js";

export class FaceRecognitionService {
  constructor() {
    this.api = new ApiService();
    this.videoElement = null;
    this.stream = null;
    this.canvas = document.createElement("canvas");
    this.isCapturing = false;
  }

  /**
   * Initialize webcam
   * @param {HTMLVideoElement} videoElement - Video element to display webcam feed
   * @returns {Promise<boolean>} - True if initialization successful
   */
  async initializeWebcam(videoElement) {
    try {
      this.videoElement = videoElement;

      // Stop any existing stream
      await this.stopWebcam();

      // Get webcam access
      const constraints = {
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      };

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);

      // Set video source
      this.videoElement.srcObject = this.stream;

      // Wait for video to be ready
      return new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve(true);
        };
      });
    } catch (error) {
      console.error("Failed to initialize webcam:", error);
      window.app.events.emit("error:face-recognition", {
        message: "Failed to access webcam",
      });
      return false;
    }
  }

  /**
   * Stop webcam
   */
  async stopWebcam() {
    try {
      // Stop any running face detection
      this.stopFaceDetection();

      // Stop existing stream
      if (this.stream) {
        this.stream.getTracks().forEach((track) => track.stop());
        this.stream = null;
      }

      // Clear video source
      if (this.videoElement) {
        this.videoElement.srcObject = null;
      }
    } catch (error) {
      console.error("Error stopping webcam:", error);
    }
  }

  /**
   * Take photo from webcam
   * @returns {Blob|null} - Photo blob or null if failed
   */
  takePhoto() {
    try {
      if (!this.videoElement || !this.stream) {
        throw new Error("Webcam not initialized");
      }

      // Set canvas dimensions to match video
      this.canvas.width = this.videoElement.videoWidth;
      this.canvas.height = this.videoElement.videoHeight;

      // Draw video frame to canvas
      const context = this.canvas.getContext("2d");
      context.drawImage(
        this.videoElement,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      // Convert canvas to blob
      return new Promise((resolve) => {
        this.canvas.toBlob(
          (blob) => {
            resolve(blob);
          },
          "image/jpeg",
          0.9
        );
      });
    } catch (error) {
      console.error("Failed to take photo:", error);
      window.app.events.emit("error:face-recognition", {
        message: "Failed to capture photo",
      });
      return null;
    }
  }

  /**
   * Start face detection in webcam feed
   * @param {function} onFaceDetected - Callback when face is detected
   * @returns {boolean} - True if started successfully
   */
  startFaceDetection(onFaceDetected) {
    try {
      if (!this.videoElement || !this.stream) {
        throw new Error("Webcam not initialized");
      }

      this.isCapturing = true;

      // Start detection loop
      this.detectFaces(onFaceDetected);

      return true;
    } catch (error) {
      console.error("Failed to start face detection:", error);
      window.app.events.emit("error:face-recognition", {
        message: "Failed to start face detection",
      });
      return false;
    }
  }

  /**
   * Stop face detection
   */
  stopFaceDetection() {
    this.isCapturing = false;
  }

  /**
   * Detect faces in webcam feed
   * @param {function} onFaceDetected - Callback when face is detected
   */
  async detectFaces(onFaceDetected) {
    try {
      if (!this.isCapturing) {
        return;
      }

      // Take photo
      const photoBlob = await this.takePhoto();

      if (photoBlob) {
        // Send to API for face detection
        const formData = new FormData();
        formData.append("image", photoBlob, "face.jpg");

        const response = await this.api.uploadFile("/face/detect", formData);

        // If faces detected, call callback
        if (response.success && response.faces && response.faces.length > 0) {
          onFaceDetected(response);
        }
      }

      // Continue detection loop if still capturing
      if (this.isCapturing) {
        // Use requestAnimationFrame for smoother performance
        // Adjust timeout for desired detection frequency
        setTimeout(() => {
          requestAnimationFrame(() => this.detectFaces(onFaceDetected));
        }, 500); // Check every 500ms
      }
    } catch (error) {
      console.error("Face detection error:", error);

      // Continue detection loop despite error
      if (this.isCapturing) {
        setTimeout(() => {
          requestAnimationFrame(() => this.detectFaces(onFaceDetected));
        }, 1000); // Longer delay after error
      }
    }
  }

  /**
   * Register face for personnel
   * @param {number} personnelId - Personnel ID
   * @param {Blob} imageBlob - Image blob from webcam
   * @param {function} progressCallback - Progress callback
   * @returns {Promise<object>} - Response with success status
   */
  async registerFace(personnelId, imageBlob, progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append("image", imageBlob, "face.jpg");

      const response = await this.api.uploadFile(
        `/personnel/${personnelId}/face`,
        formData,
        progressCallback
      );

      window.app.events.emit("face:registered", {
        personnelId,
        faceId: response.face_id,
      });

      return response;
    } catch (error) {
      console.error(
        `Failed to register face for personnel with ID ${personnelId}:`,
        error
      );
      window.app.events.emit("error:face-recognition", {
        message: "Failed to register face",
      });
      throw error;
    }
  }

  /**
   * Delete registered face
   * @param {number} personnelId - Personnel ID
   * @param {number} faceId - Face ID
   * @returns {Promise<object>} - Response with success status
   */
  async deleteFace(personnelId, faceId) {
    try {
      const response = await this.api.request(
        `/personnel/${personnelId}/face/${faceId}`,
        {
          method: "DELETE",
        }
      );

      window.app.events.emit("face:deleted", {
        personnelId,
        faceId,
      });

      return response;
    } catch (error) {
      console.error(`Failed to delete face with ID ${faceId}:`, error);
      window.app.events.emit("error:face-recognition", {
        message: "Failed to delete face",
      });
      throw error;
    }
  }

  /**
   * Get all faces for personnel
   * @param {number} personnelId - Personnel ID
   * @returns {Promise<object>} - Response with faces list
   */
  async getPersonnelFaces(personnelId) {
    try {
      return await this.api.request(`/personnel/${personnelId}/faces`);
    } catch (error) {
      console.error(
        `Failed to get faces for personnel with ID ${personnelId}:`,
        error
      );
      window.app.events.emit("error:face-recognition", {
        message: "Failed to get faces",
      });
      throw error;
    }
  }

  /**
   * Get face recognition stats
   * @returns {Promise<object>} - Response with statistics
   */
  async getStatistics() {
    try {
      return await this.api.request("/face/statistics");
    } catch (error) {
      console.error("Failed to get face recognition statistics:", error);
      window.app.events.emit("error:face-recognition", {
        message: "Failed to get face recognition statistics",
      });
      throw error;
    }
  }
}
