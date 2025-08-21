/**
 * Settings Component
 * Allows users to configure application settings
 */
export class SettingsComponent {
  /**
   * Create a new SettingsComponent
   * @param {Object} options - Component options
   */
  constructor(options = {}) {
    this.options = {
      outlet: null,
      params: {},
      ...options,
    };

    this.outlet = this.options.outlet;
    this.settings = null;
    this.userRole = window.app.services.auth.getCurrentUser()?.role || "user";

    this.initialize();
  }

  /**
   * Initialize the component
   */
  async initialize() {
    try {
      // Show loading state
      window.app.ui.showLoading();

      // Get current settings
      this.settings = await window.app.services.settings.getSettings();

      // Render the component
      this.render();

      // Attach event listeners
      this.attachEventListeners();

      // Hide loading
      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error initializing settings:", error);
      window.app.ui.showNotification("Failed to load settings", "error");
      window.app.ui.hideLoading();
    }
  }

  /**
   * Render the component
   */
  render() {
    const isAdmin = this.userRole === "admin";

    const html = `
      <div class="settings-page fade-in">
        <div class="mb-6">
          <h1 class="text-2xl font-bold mb-2">Settings</h1>
          <p class="text-gray-600">Configure application settings</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- UI Settings -->
          <div class="col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold mb-4">UI Settings</h2>
              
              <div class="space-y-4">
                <!-- Theme Setting -->
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Theme</label>
                  <div class="flex items-center space-x-2">
                    <select id="theme-setting" class="form-control">
                      <option value="light" ${
                        this.getCurrentTheme() === "light" ? "selected" : ""
                      }>Light</option>
                      <option value="dark" ${
                        this.getCurrentTheme() === "dark" ? "selected" : ""
                      }>Dark</option>
                    </select>
                  </div>
                </div>
                
                <!-- Date Format Setting -->
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Date Format</label>
                  <div class="flex items-center space-x-2">
                    <select id="date-format-setting" class="form-control">
                      <option value="YYYY-MM-DD" ${
                        this.settings?.dateFormat === "YYYY-MM-DD"
                          ? "selected"
                          : ""
                      }>YYYY-MM-DD</option>
                      <option value="MM/DD/YYYY" ${
                        this.settings?.dateFormat === "MM/DD/YYYY"
                          ? "selected"
                          : ""
                      }>MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY" ${
                        this.settings?.dateFormat === "DD/MM/YYYY"
                          ? "selected"
                          : ""
                      }>DD/MM/YYYY</option>
                    </select>
                  </div>
                </div>
                
                <!-- Time Format Setting -->
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Time Format</label>
                  <div class="flex items-center space-x-2">
                    <select id="time-format-setting" class="form-control">
                      <option value="hh:mm:ss A" ${
                        this.settings?.timeFormat === "hh:mm:ss A"
                          ? "selected"
                          : ""
                      }>12-hour (01:30:00 PM)</option>
                      <option value="HH:mm:ss" ${
                        this.settings?.timeFormat === "HH:mm:ss"
                          ? "selected"
                          : ""
                      }>24-hour (13:30:00)</option>
                    </select>
                  </div>
                </div>
                
                <button id="save-ui-settings" class="btn btn-primary mt-4 w-full">
                  <i class="fas fa-save mr-2"></i> Save UI Settings
                </button>
              </div>
            </div>
          </div>
          
          <!-- Attendance Settings -->
          <div class="col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6">
              <h2 class="text-xl font-semibold mb-4">Attendance Settings</h2>
              
              <div class="space-y-4">
                <!-- Face Recognition Confidence -->
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Face Recognition Confidence Threshold</label>
                  <div class="flex items-center space-x-2">
                    <input type="range" id="face-confidence" class="w-full" min="0.1" max="0.9" step="0.05" 
                           value="${
                             this.settings?.faceRecognition?.minConfidence ||
                             0.6
                           }">
                    <span id="face-confidence-value">${
                      (this.settings?.faceRecognition?.minConfidence || 0.6) *
                      100
                    }%</span>
                  </div>
                </div>
                
                <!-- Face Recognition Captures -->
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Face Capture Count</label>
                  <div class="flex items-center space-x-2">
                    <input type="number" id="face-captures" class="form-control" min="1" max="10" 
                           value="${
                             this.settings?.faceRecognition?.captureCount || 5
                           }">
                  </div>
                  <p class="text-sm text-gray-500 mt-1">Number of images to capture for face registration</p>
                </div>
                
                <!-- Allow Multiple Face Recognition -->
                <div class="flex items-center">
                  <input type="checkbox" id="enable-multi-face" class="mr-2"
                         ${
                           this.settings?.faceRecognition?.enableMultiFace
                             ? "checked"
                             : ""
                         }>
                  <label for="enable-multi-face" class="text-gray-700 text-sm font-medium">Enable Multi-Face Detection</label>
                </div>
                
                <button id="save-attendance-settings" class="btn btn-primary mt-4 w-full">
                  <i class="fas fa-save mr-2"></i> Save Attendance Settings
                </button>
              </div>
            </div>
          </div>
          
          <!-- System Settings (Admin Only) -->
          <div class="col-span-1">
            <div class="bg-white rounded-lg shadow-md p-6 ${
              isAdmin ? "" : "opacity-60"
            }">
              <h2 class="text-xl font-semibold mb-4">System Settings</h2>
              <p class="text-sm text-gray-500 mb-4 ${
                isAdmin ? "hidden" : ""
              }">Admin privileges required to modify these settings</p>
              
              <div class="space-y-4">
                <!-- Log Level -->
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Log Level</label>
                  <div class="flex items-center space-x-2">
                    <select id="log-level-setting" class="form-control" ${
                      isAdmin ? "" : "disabled"
                    }>
                      <option value="error" ${
                        this.settings?.logLevel === "error" ? "selected" : ""
                      }>Error</option>
                      <option value="warning" ${
                        this.settings?.logLevel === "warning" ? "selected" : ""
                      }>Warning</option>
                      <option value="info" ${
                        this.settings?.logLevel === "info" ? "selected" : ""
                      }>Info</option>
                      <option value="debug" ${
                        this.settings?.logLevel === "debug" ? "selected" : ""
                      }>Debug</option>
                    </select>
                  </div>
                </div>
                
                <!-- Enable Debug Mode -->
                <div class="flex items-center">
                  <input type="checkbox" id="enable-debug-mode" class="mr-2"
                         ${
                           this.settings?.features?.debugMode ? "checked" : ""
                         } ${isAdmin ? "" : "disabled"}>
                  <label for="enable-debug-mode" class="text-gray-700 text-sm font-medium">Enable Debug Mode</label>
                </div>
                
                <!-- Database Backup Frequency -->
                <div>
                  <label class="block text-gray-700 text-sm font-medium mb-1">Database Backup Frequency</label>
                  <div class="flex items-center space-x-2">
                    <select id="backup-frequency" class="form-control" ${
                      isAdmin ? "" : "disabled"
                    }>
                      <option value="daily" ${
                        this.settings?.backupFrequency === "daily"
                          ? "selected"
                          : ""
                      }>Daily</option>
                      <option value="weekly" ${
                        this.settings?.backupFrequency === "weekly"
                          ? "selected"
                          : ""
                      }>Weekly</option>
                      <option value="monthly" ${
                        this.settings?.backupFrequency === "monthly"
                          ? "selected"
                          : ""
                      }>Monthly</option>
                      <option value="never" ${
                        this.settings?.backupFrequency === "never"
                          ? "selected"
                          : ""
                      }>Never</option>
                    </select>
                  </div>
                </div>
                
                <button id="save-system-settings" class="btn btn-primary mt-4 w-full" ${
                  isAdmin ? "" : "disabled"
                }>
                  <i class="fas fa-save mr-2"></i> Save System Settings
                </button>
                
                ${
                  isAdmin
                    ? `
                <div class="mt-6 pt-6 border-t border-gray-200">
                  <h3 class="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                  
                  <div class="space-y-4">
                    <button id="purge-attendance-logs" class="btn btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white w-full">
                      <i class="fas fa-trash mr-2"></i> Purge Old Attendance Logs
                    </button>
                    
                    <button id="reset-system-settings" class="btn btn-outline border-red-500 text-red-500 hover:bg-red-500 hover:text-white w-full">
                      <i class="fas fa-undo mr-2"></i> Reset to Default Settings
                    </button>
                  </div>
                </div>
                `
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.outlet.innerHTML = html;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Theme setting
    const themeSelect = document.getElementById("theme-setting");
    if (themeSelect) {
      themeSelect.addEventListener("change", () =>
        this.handleThemeChange(themeSelect.value)
      );
    }

    // Face confidence slider
    const faceConfidence = document.getElementById("face-confidence");
    const faceConfidenceValue = document.getElementById(
      "face-confidence-value"
    );
    if (faceConfidence && faceConfidenceValue) {
      faceConfidence.addEventListener("input", () => {
        faceConfidenceValue.textContent = `${Math.round(
          faceConfidence.value * 100
        )}%`;
      });
    }

    // Save UI settings button
    const saveUiSettings = document.getElementById("save-ui-settings");
    if (saveUiSettings) {
      saveUiSettings.addEventListener("click", () => this.saveUiSettings());
    }

    // Save attendance settings button
    const saveAttendanceSettings = document.getElementById(
      "save-attendance-settings"
    );
    if (saveAttendanceSettings) {
      saveAttendanceSettings.addEventListener("click", () =>
        this.saveAttendanceSettings()
      );
    }

    // Save system settings button (admin only)
    const saveSystemSettings = document.getElementById("save-system-settings");
    if (saveSystemSettings && this.userRole === "admin") {
      saveSystemSettings.addEventListener("click", () =>
        this.saveSystemSettings()
      );
    }

    // Purge attendance logs button (admin only)
    const purgeAttendanceLogs = document.getElementById(
      "purge-attendance-logs"
    );
    if (purgeAttendanceLogs && this.userRole === "admin") {
      purgeAttendanceLogs.addEventListener("click", () =>
        this.confirmPurgeAttendanceLogs()
      );
    }

    // Reset system settings button (admin only)
    const resetSystemSettings = document.getElementById(
      "reset-system-settings"
    );
    if (resetSystemSettings && this.userRole === "admin") {
      resetSystemSettings.addEventListener("click", () =>
        this.confirmResetSystemSettings()
      );
    }
  }

  /**
   * Get current theme
   * @returns {string} - Current theme (light or dark)
   */
  getCurrentTheme() {
    return document.documentElement.getAttribute("data-theme") || "light";
  }

  /**
   * Handle theme change
   * @param {string} theme - Theme to apply
   */
  handleThemeChange(theme) {
    window.app.ui.applyTheme(theme);
  }

  /**
   * Save UI settings
   */
  async saveUiSettings() {
    try {
      window.app.ui.showLoading();

      const theme = document.getElementById("theme-setting").value;
      const dateFormat = document.getElementById("date-format-setting").value;
      const timeFormat = document.getElementById("time-format-setting").value;

      const settings = {
        ui: {
          defaultTheme: theme,
          dateFormat,
          timeFormat,
        },
      };

      // Save settings
      await window.app.services.settings.updateSettings(settings);

      // Apply theme
      window.app.ui.applyTheme(theme);

      // Show success message
      window.app.ui.showNotification("UI settings saved", "success");

      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error saving UI settings:", error);
      window.app.ui.showNotification("Failed to save UI settings", "error");
      window.app.ui.hideLoading();
    }
  }

  /**
   * Save attendance settings
   */
  async saveAttendanceSettings() {
    try {
      window.app.ui.showLoading();

      const faceConfidence = parseFloat(
        document.getElementById("face-confidence").value
      );
      const faceCaptures = parseInt(
        document.getElementById("face-captures").value,
        10
      );
      const enableMultiFace =
        document.getElementById("enable-multi-face").checked;

      const settings = {
        faceRecognition: {
          minConfidence: faceConfidence,
          captureCount: faceCaptures,
          enableMultiFace,
        },
      };

      // Save settings
      await window.app.services.settings.updateSettings(settings);

      // Show success message
      window.app.ui.showNotification("Attendance settings saved", "success");

      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error saving attendance settings:", error);
      window.app.ui.showNotification(
        "Failed to save attendance settings",
        "error"
      );
      window.app.ui.hideLoading();
    }
  }

  /**
   * Save system settings (admin only)
   */
  async saveSystemSettings() {
    if (this.userRole !== "admin") {
      window.app.ui.showNotification(
        "Administrator privileges required",
        "error"
      );
      return;
    }

    try {
      window.app.ui.showLoading();

      const logLevel = document.getElementById("log-level-setting").value;
      const enableDebugMode =
        document.getElementById("enable-debug-mode").checked;
      const backupFrequency = document.getElementById("backup-frequency").value;

      const settings = {
        logLevel,
        features: {
          debugMode: enableDebugMode,
        },
        backupFrequency,
      };

      // Save settings
      await window.app.services.settings.updateSettings(settings);

      // Show success message
      window.app.ui.showNotification("System settings saved", "success");

      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error saving system settings:", error);
      window.app.ui.showNotification("Failed to save system settings", "error");
      window.app.ui.hideLoading();
    }
  }

  /**
   * Confirm purge attendance logs (admin only)
   */
  confirmPurgeAttendanceLogs() {
    if (this.userRole !== "admin") {
      window.app.ui.showNotification(
        "Administrator privileges required",
        "error"
      );
      return;
    }

    // Create confirmation dialog
    const confirmed = confirm(
      "Are you sure you want to purge old attendance logs? This action cannot be undone."
    );

    if (confirmed) {
      this.purgeAttendanceLogs();
    }
  }

  /**
   * Purge attendance logs (admin only)
   */
  async purgeAttendanceLogs() {
    try {
      window.app.ui.showLoading();

      // Purge logs
      await window.app.services.settings.purgeAttendanceLogs();

      // Show success message
      window.app.ui.showNotification(
        "Old attendance logs purged successfully",
        "success"
      );

      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error purging attendance logs:", error);
      window.app.ui.showNotification(
        "Failed to purge attendance logs",
        "error"
      );
      window.app.ui.hideLoading();
    }
  }

  /**
   * Confirm reset system settings (admin only)
   */
  confirmResetSystemSettings() {
    if (this.userRole !== "admin") {
      window.app.ui.showNotification(
        "Administrator privileges required",
        "error"
      );
      return;
    }

    // Create confirmation dialog
    const confirmed = confirm(
      "Are you sure you want to reset all settings to default values?"
    );

    if (confirmed) {
      this.resetSystemSettings();
    }
  }

  /**
   * Reset system settings (admin only)
   */
  async resetSystemSettings() {
    try {
      window.app.ui.showLoading();

      // Reset settings
      await window.app.services.settings.resetSettings();

      // Get updated settings
      this.settings = await window.app.services.settings.getSettings();

      // Re-render component
      this.render();
      this.attachEventListeners();

      // Show success message
      window.app.ui.showNotification(
        "Settings reset to default values",
        "success"
      );

      window.app.ui.hideLoading();
    } catch (error) {
      console.error("Error resetting settings:", error);
      window.app.ui.showNotification("Failed to reset settings", "error");
      window.app.ui.hideLoading();
    }
  }

  /**
   * Clean up component resources
   */
  destroy() {
    // Nothing specific to clean up
  }
}
