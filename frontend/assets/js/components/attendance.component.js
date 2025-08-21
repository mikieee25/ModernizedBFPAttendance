/**
 * Attendance component for face recognition attendance
 */
class AttendanceComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.attendanceService = window.app.services.attendance;
    this.faceRecognitionService = window.app.services.faceRecognition;
    this.notificationService = window.app.services.notification;

    // Component state
    this.state = {
      mode: "in", // 'in' or 'out'
      isCapturing: false,
      isCameraActive: false,
      recognizedPersonnel: null,
      recentAttendance: [],
      processingAttendance: false,
    };

    // Initialize component
    this.initialize();
  }

  /**
   * Initialize component
   */
  async initialize() {
    try {
      // Render component
      this.render();

      // Attach event listeners
      this.attachEventListeners();

      // Get recent attendance
      await this.loadRecentAttendance();

      // Initialize camera when component is fully visible
      setTimeout(() => {
        this.initializeCamera();
      }, 500);
    } catch (error) {
      console.error("Failed to initialize attendance component:", error);
      this.notificationService.error(
        "Failed to initialize attendance component"
      );
    }
  }

  /**
   * Render component
   */
  render() {
    const template = `
      <div class="attendance-container">
        <div class="attendance-header">
          <h1 class="attendance-title">Face Recognition Attendance</h1>
          <div class="attendance-mode-selector">
            <button class="btn ${
              this.state.mode === "in" ? "btn-primary" : "btn-outline"
            }" data-mode="in">
              <i class="fas fa-sign-in-alt"></i> Time In
            </button>
            <button class="btn ${
              this.state.mode === "out" ? "btn-primary" : "btn-outline"
            }" data-mode="out">
              <i class="fas fa-sign-out-alt"></i> Time Out
            </button>
          </div>
        </div>
        
        <div class="attendance-content">
          <div class="attendance-column column-camera">
            <div class="camera-container">
              <div class="camera-header">
                <h2 class="camera-title">Camera Feed</h2>
                <div class="camera-controls">
                  <button class="btn btn-sm btn-outline" id="camera-toggle">
                    <i class="fas fa-power-off"></i>
                    <span>Turn Off</span>
                  </button>
                </div>
              </div>
              
              <div class="camera-wrapper">
                <video id="camera-feed" autoplay playsinline></video>
                <div class="camera-overlay" id="camera-overlay">
                  <div class="face-detection-box" id="face-detection-box"></div>
                </div>
                <div class="camera-status" id="camera-status">
                  <span class="status-text">Initializing camera...</span>
                  <div class="spinner"></div>
                </div>
              </div>
              
              <div class="camera-footer">
                <div class="detection-status">
                  <div class="status-indicator ${
                    this.state.isCapturing ? "active" : ""
                  }"></div>
                  <span class="status-text">Face Detection: </span>
                  <span class="status-value" id="detection-status">Inactive</span>
                </div>
                <button class="btn ${
                  this.state.isCapturing ? "btn-danger" : "btn-primary"
                }" id="capture-toggle">
                  <i class="fas ${
                    this.state.isCapturing ? "fa-stop" : "fa-play"
                  }"></i>
                  <span>${
                    this.state.isCapturing
                      ? "Stop Detection"
                      : "Start Detection"
                  }</span>
                </button>
              </div>
            </div>
          </div>
          
          <div class="attendance-column column-info">
            <div class="recognition-result" id="recognition-result">
              <div class="result-placeholder">
                <i class="fas fa-user-circle"></i>
                <p>No personnel recognized yet</p>
                <p class="hint">Start face detection to identify personnel</p>
              </div>
            </div>
            
            <div class="recent-attendance">
              <div class="recent-header">
                <h2 class="recent-title">Recent Attendance</h2>
                <a href="#/attendance/records" class="view-all">View All</a>
              </div>
              
              <div class="recent-list" id="recent-attendance-list">
                <div class="skeleton-loader"></div>
                <div class="skeleton-loader"></div>
                <div class="skeleton-loader"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Set container content
    this.container.innerHTML = template;

    // Get DOM elements
    this.modeButtons = this.container.querySelectorAll(
      ".attendance-mode-selector button"
    );
    this.videoElement = document.getElementById("camera-feed");
    this.cameraOverlay = document.getElementById("camera-overlay");
    this.faceDetectionBox = document.getElementById("face-detection-box");
    this.cameraStatus = document.getElementById("camera-status");
    this.cameraToggle = document.getElementById("camera-toggle");
    this.captureToggle = document.getElementById("capture-toggle");
    this.detectionStatus = document.getElementById("detection-status");
    this.recognitionResult = document.getElementById("recognition-result");
    this.recentAttendanceList = document.getElementById(
      "recent-attendance-list"
    );
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Mode selector
    this.modeButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const mode = button.dataset.mode;
        this.setState({ mode });

        // Update buttons
        this.modeButtons.forEach((btn) => {
          btn.classList.toggle("btn-primary", btn.dataset.mode === mode);
          btn.classList.toggle("btn-outline", btn.dataset.mode !== mode);
        });
      });
    });

    // Camera toggle
    this.cameraToggle.addEventListener("click", () => {
      if (this.state.isCameraActive) {
        this.stopCamera();
      } else {
        this.initializeCamera();
      }
    });

    // Capture toggle
    this.captureToggle.addEventListener("click", () => {
      if (this.state.isCapturing) {
        this.stopFaceDetection();
      } else {
        this.startFaceDetection();
      }
    });
  }

  /**
   * Initialize camera
   */
  async initializeCamera() {
    try {
      // Update status
      this.cameraStatus.style.display = "flex";
      this.cameraStatus.querySelector(".status-text").textContent =
        "Initializing camera...";

      // Initialize webcam
      const success = await this.faceRecognitionService.initializeWebcam(
        this.videoElement
      );

      if (success) {
        // Update UI
        this.setState({ isCameraActive: true });
        this.cameraToggle.querySelector("span").textContent = "Turn Off";
        this.cameraStatus.style.display = "none";
      } else {
        throw new Error("Failed to initialize camera");
      }
    } catch (error) {
      console.error("Camera initialization error:", error);
      this.notificationService.error(
        "Failed to access camera. Please check permissions."
      );

      // Update status
      this.cameraStatus.style.display = "flex";
      this.cameraStatus.querySelector(".status-text").textContent =
        "Camera access denied";
      this.cameraStatus.querySelector(".spinner").style.display = "none";
    }
  }

  /**
   * Stop camera
   */
  async stopCamera() {
    try {
      // Stop face detection if active
      if (this.state.isCapturing) {
        this.stopFaceDetection();
      }

      // Stop webcam
      await this.faceRecognitionService.stopWebcam();

      // Update UI
      this.setState({ isCameraActive: false });
      this.cameraToggle.querySelector("span").textContent = "Turn On";
      this.cameraStatus.style.display = "flex";
      this.cameraStatus.querySelector(".status-text").textContent =
        "Camera is off";
      this.cameraStatus.querySelector(".spinner").style.display = "none";
    } catch (error) {
      console.error("Failed to stop camera:", error);
    }
  }

  /**
   * Start face detection
   */
  startFaceDetection() {
    if (!this.state.isCameraActive) {
      this.notificationService.warning("Please turn on the camera first");
      return;
    }

    // Start detection
    const success = this.faceRecognitionService.startFaceDetection(
      this.handleFaceDetected.bind(this)
    );

    if (success) {
      // Update UI
      this.setState({ isCapturing: true });
      this.captureToggle.innerHTML =
        '<i class="fas fa-stop"></i><span>Stop Detection</span>';
      this.captureToggle.classList.replace("btn-primary", "btn-danger");
      this.detectionStatus.textContent = "Active";
      document.querySelector(".status-indicator").classList.add("active");

      // Clear previous recognition
      this.setState({ recognizedPersonnel: null });
      this.updateRecognitionUI();
    } else {
      this.notificationService.error("Failed to start face detection");
    }
  }

  /**
   * Stop face detection
   */
  stopFaceDetection() {
    // Stop detection
    this.faceRecognitionService.stopFaceDetection();

    // Update UI
    this.setState({ isCapturing: false });
    this.captureToggle.innerHTML =
      '<i class="fas fa-play"></i><span>Start Detection</span>';
    this.captureToggle.classList.replace("btn-danger", "btn-primary");
    this.detectionStatus.textContent = "Inactive";
    document.querySelector(".status-indicator").classList.remove("active");
    this.faceDetectionBox.style.display = "none";
  }

  /**
   * Handle face detection result
   * @param {object} result - Face detection result
   */
  async handleFaceDetected(result) {
    try {
      // Skip if already processing attendance
      if (this.state.processingAttendance) {
        return;
      }

      // Update face detection box
      if (result.faces && result.faces.length > 0) {
        const face = result.faces[0];
        this.updateFaceDetectionBox(face);

        // Check if personnel recognized
        if (face.personnel && face.confidence >= 0.7) {
          // Stop detection
          this.stopFaceDetection();

          // Update state with recognized personnel
          this.setState({
            recognizedPersonnel: face.personnel,
            processingAttendance: true,
          });

          // Update UI
          this.updateRecognitionUI();

          // Record attendance
          await this.recordAttendance(face.personnel);
        }
      } else {
        this.faceDetectionBox.style.display = "none";
      }
    } catch (error) {
      console.error("Face detection error:", error);
    }
  }

  /**
   * Update face detection box
   * @param {object} face - Face data
   */
  updateFaceDetectionBox(face) {
    // Get video dimensions
    const videoWidth = this.videoElement.videoWidth;
    const videoHeight = this.videoElement.videoHeight;

    // Get display dimensions
    const displayWidth = this.videoElement.offsetWidth;
    const displayHeight = this.videoElement.offsetHeight;

    // Calculate scale factors
    const scaleX = displayWidth / videoWidth;
    const scaleY = displayHeight / videoHeight;

    // Get face box dimensions
    const { x, y, width, height } = face.box;

    // Update box position and size
    this.faceDetectionBox.style.display = "block";
    this.faceDetectionBox.style.left = `${x * scaleX}px`;
    this.faceDetectionBox.style.top = `${y * scaleY}px`;
    this.faceDetectionBox.style.width = `${width * scaleX}px`;
    this.faceDetectionBox.style.height = `${height * scaleY}px`;

    // Add animation class
    this.faceDetectionBox.classList.add("detected");

    // Remove animation class after animation completes
    setTimeout(() => {
      this.faceDetectionBox.classList.remove("detected");
    }, 500);
  }

  /**
   * Update recognition UI
   */
  updateRecognitionUI() {
    const personnel = this.state.recognizedPersonnel;

    if (!personnel) {
      // Show placeholder
      this.recognitionResult.innerHTML = `
        <div class="result-placeholder">
          <i class="fas fa-user-circle"></i>
          <p>No personnel recognized yet</p>
          <p class="hint">Start face detection to identify personnel</p>
        </div>
      `;
      return;
    }

    // Show personnel info
    this.recognitionResult.innerHTML = `
      <div class="result-content">
        <div class="result-header">
          <div class="personnel-photo">
            <img src="${
              personnel.photo_url || "assets/images/default-avatar.png"
            }" alt="${personnel.name}">
          </div>
          <div class="personnel-info">
            <h3 class="personnel-name">${personnel.name}</h3>
            <p class="personnel-position">${personnel.position || "N/A"}</p>
            <p class="personnel-id">ID: ${personnel.id_number || "N/A"}</p>
          </div>
        </div>
        
        <div class="result-status">
          <div class="status-processing" id="attendance-processing">
            <div class="spinner"></div>
            <p>Processing attendance...</p>
          </div>
          <div class="status-success hidden" id="attendance-success">
            <i class="fas fa-check-circle"></i>
            <p>Attendance recorded successfully</p>
            <p class="timestamp" id="attendance-timestamp"></p>
          </div>
        </div>
        
        <div class="result-actions">
          <button class="btn btn-primary btn-retry hidden" id="retry-button">
            <i class="fas fa-redo"></i>
            <span>Try Again</span>
          </button>
        </div>
      </div>
    `;

    // Get DOM elements
    this.attendanceProcessing = document.getElementById(
      "attendance-processing"
    );
    this.attendanceSuccess = document.getElementById("attendance-success");
    this.attendanceTimestamp = document.getElementById("attendance-timestamp");
    this.retryButton = document.getElementById("retry-button");

    // Add retry button event listener
    if (this.retryButton) {
      this.retryButton.addEventListener("click", () => {
        // Clear recognized personnel
        this.setState({
          recognizedPersonnel: null,
          processingAttendance: false,
        });

        // Update UI
        this.updateRecognitionUI();

        // Start detection again
        this.startFaceDetection();
      });
    }
  }

  /**
   * Record attendance
   * @param {object} personnel - Personnel data
   */
  async recordAttendance(personnel) {
    try {
      // Show processing UI
      this.attendanceProcessing.classList.remove("hidden");
      this.attendanceSuccess.classList.add("hidden");

      // Record attendance
      const attendanceData = {
        personnel_id: personnel.id,
        attendance_type: this.state.mode,
        source: "face_recognition",
      };

      const response = await this.attendanceService.recordAttendance(
        attendanceData
      );

      // Update UI with success
      this.attendanceProcessing.classList.add("hidden");
      this.attendanceSuccess.classList.remove("hidden");

      // Format timestamp
      const timestamp = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      this.attendanceTimestamp.textContent = `${
        this.state.mode === "in" ? "Time In" : "Time Out"
      }: ${timestamp}`;

      // Show retry button
      this.retryButton.classList.remove("hidden");

      // Show notification
      this.notificationService.success(
        `${personnel.name} ${
          this.state.mode === "in" ? "checked in" : "checked out"
        } successfully`
      );

      // Reload recent attendance
      await this.loadRecentAttendance();

      // Update state
      this.setState({ processingAttendance: false });
    } catch (error) {
      console.error("Failed to record attendance:", error);
      this.notificationService.error("Failed to record attendance");

      // Update UI with error
      this.attendanceProcessing.classList.add("hidden");
      this.attendanceSuccess.classList.add("hidden");

      // Show retry button
      this.retryButton.classList.remove("hidden");

      // Update state
      this.setState({ processingAttendance: false });
    }
  }

  /**
   * Load recent attendance
   */
  async loadRecentAttendance() {
    try {
      // Show skeleton loaders
      this.recentAttendanceList.innerHTML = `
        <div class="skeleton-loader"></div>
        <div class="skeleton-loader"></div>
        <div class="skeleton-loader"></div>
      `;

      // Get recent attendance
      const response = await this.attendanceService.getAttendanceRecords({
        limit: 5,
        sort: "created_at",
        order: "desc",
      });

      // Update state
      this.setState({ recentAttendance: response.data || [] });

      // Update UI
      this.updateRecentAttendanceUI();
    } catch (error) {
      console.error("Failed to load recent attendance:", error);

      // Show error in list
      this.recentAttendanceList.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load recent attendance</p>
        </div>
      `;
    }
  }

  /**
   * Update recent attendance UI
   */
  updateRecentAttendanceUI() {
    // Clear list
    this.recentAttendanceList.innerHTML = "";

    // Check if we have data
    if (
      !this.state.recentAttendance ||
      this.state.recentAttendance.length === 0
    ) {
      this.recentAttendanceList.innerHTML = `
        <div class="empty-message">
          <i class="fas fa-info-circle"></i>
          <p>No recent attendance records</p>
        </div>
      `;
      return;
    }

    // Add attendance items
    this.state.recentAttendance.forEach((record) => {
      // Format time
      const time = record.time_in || record.time_out;
      const formattedTime = time
        ? new Date(time).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

      // Create item element
      const item = document.createElement("div");
      item.className = "attendance-item";

      item.innerHTML = `
        <div class="item-photo">
          <img src="${
            record.personnel.photo_url || "assets/images/default-avatar.png"
          }" alt="${record.personnel.name}">
        </div>
        <div class="item-info">
          <div class="item-name">${record.personnel.name}</div>
          <div class="item-details">
            <span class="item-time">${formattedTime}</span>
            <span class="item-type">${
              record.type === "in" ? "Time In" : "Time Out"
            }</span>
          </div>
        </div>
        <div class="item-status ${
          record.is_late ? "status-late" : "status-ontime"
        }">
          ${record.is_late ? "Late" : "On Time"}
        </div>
      `;

      this.recentAttendanceList.appendChild(item);
    });
  }

  /**
   * Update component state
   * @param {object} newState - New state object
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Destroy component and clean up
   */
  destroy() {
    // Stop camera and face detection
    this.stopCamera();

    // Remove event listeners
    if (this.modeButtons) {
      this.modeButtons.forEach((button) => {
        button.removeEventListener("click", null);
      });
    }

    if (this.cameraToggle) {
      this.cameraToggle.removeEventListener("click", null);
    }

    if (this.captureToggle) {
      this.captureToggle.removeEventListener("click", null);
    }

    if (this.retryButton) {
      this.retryButton.removeEventListener("click", null);
    }

    // Clear container
    this.container.innerHTML = "";
  }
}
