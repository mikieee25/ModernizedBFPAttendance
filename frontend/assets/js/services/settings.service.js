/**
 * Service for handling application settings.
 */
export class SettingsService {
  constructor() {
    this.settings = {};
    this.defaultSettings = {
      theme: "light",
      language: "en",
      notifications: true,
      attendance: {
        autoLogout: true,
        showRecentAttendance: true,
        attendanceTimeFormat: "24h",
      },
      faceRecognition: {
        enableAutoCapture: true,
        captureDelay: 3000,
        minConfidence: 0.7,
      },
      dashboard: {
        showAttendanceChart: true,
        showPersonnelStats: true,
        defaultDateRange: "week",
      },
      ui: {
        sidebarCollapsed: false,
        tableRowsPerPage: 10,
        animationsEnabled: true,
      },
    };

    // Load settings
    this.loadSettings();
  }

  /**
   * Load settings from localStorage
   */
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem(config.settingsKey);

      if (savedSettings) {
        this.settings = JSON.parse(savedSettings);
      } else {
        // Use default settings
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
        this.saveSettings();
      }

      // Apply theme
      this.applyTheme(this.getTheme());
    } catch (error) {
      console.error("Failed to load settings:", error);

      // Use default settings on error
      this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
      this.saveSettings();
    }
  }

  /**
   * Save settings to localStorage
   */
  saveSettings() {
    try {
      localStorage.setItem(config.settingsKey, JSON.stringify(this.settings));
      window.app.events.emit("settings:updated", this.settings);
    } catch (error) {
      console.error("Failed to save settings:", error);
      window.app.events.emit("error:settings", {
        message: "Failed to save settings",
      });
    }
  }

  /**
   * Get all settings
   * @returns {object} - All settings
   */
  getAllSettings() {
    return JSON.parse(JSON.stringify(this.settings));
  }

  /**
   * Get a specific setting
   * @param {string} key - Setting key (dot notation supported)
   * @param {any} defaultValue - Default value if setting not found
   * @returns {any} - Setting value
   */
  getSetting(key, defaultValue = null) {
    try {
      // Handle dot notation (e.g., 'attendance.autoLogout')
      const parts = key.split(".");
      let value = this.settings;

      for (const part of parts) {
        if (value === undefined || value === null) {
          return defaultValue;
        }
        value = value[part];
      }

      return value !== undefined ? value : defaultValue;
    } catch (error) {
      console.error(`Failed to get setting: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Update a specific setting
   * @param {string} key - Setting key (dot notation supported)
   * @param {any} value - Setting value
   */
  updateSetting(key, value) {
    try {
      // Handle dot notation (e.g., 'attendance.autoLogout')
      const parts = key.split(".");
      const lastPart = parts.pop();
      let target = this.settings;

      // Navigate to the correct object
      for (const part of parts) {
        if (target[part] === undefined) {
          target[part] = {};
        }
        target = target[part];
      }

      // Update value
      target[lastPart] = value;

      // Save changes
      this.saveSettings();

      // Apply changes immediately for certain settings
      if (key === "theme") {
        this.applyTheme(value);
      }

      // Emit specific setting update event
      window.app.events.emit(`settings:${key}:updated`, value);

      return true;
    } catch (error) {
      console.error(`Failed to update setting: ${key}`, error);
      window.app.events.emit("error:settings", {
        message: `Failed to update setting: ${key}`,
      });
      return false;
    }
  }

  /**
   * Reset settings to default
   */
  resetSettings() {
    try {
      // Clone default settings
      this.settings = JSON.parse(JSON.stringify(this.defaultSettings));

      // Save changes
      this.saveSettings();

      // Apply theme
      this.applyTheme(this.getTheme());

      window.app.events.emit("settings:reset");

      return true;
    } catch (error) {
      console.error("Failed to reset settings:", error);
      window.app.events.emit("error:settings", {
        message: "Failed to reset settings",
      });
      return false;
    }
  }

  /**
   * Get current theme
   * @returns {string} - Current theme
   */
  getTheme() {
    return this.getSetting("theme", "light");
  }

  /**
   * Set theme
   * @param {string} theme - Theme name
   */
  setTheme(theme) {
    this.updateSetting("theme", theme);
  }

  /**
   * Apply theme to document
   * @param {string} theme - Theme name
   */
  applyTheme(theme) {
    try {
      // Remove any existing theme classes
      document.body.classList.remove("theme-light", "theme-dark");

      // Add new theme class
      document.body.classList.add(`theme-${theme}`);

      // Update data attribute for CSS variables
      document.documentElement.setAttribute("data-theme", theme);
    } catch (error) {
      console.error(`Failed to apply theme: ${theme}`, error);
    }
  }

  /**
   * Export settings to JSON
   * @returns {string} - Settings JSON
   */
  exportSettings() {
    try {
      return JSON.stringify(this.settings, null, 2);
    } catch (error) {
      console.error("Failed to export settings:", error);
      window.app.events.emit("error:settings", {
        message: "Failed to export settings",
      });
      return null;
    }
  }

  /**
   * Import settings from JSON
   * @param {string} json - Settings JSON
   * @returns {boolean} - True if import successful
   */
  importSettings(json) {
    try {
      const newSettings = JSON.parse(json);

      // Validate settings
      if (!newSettings || typeof newSettings !== "object") {
        throw new Error("Invalid settings format");
      }

      // Update settings
      this.settings = newSettings;

      // Save changes
      this.saveSettings();

      // Apply theme
      this.applyTheme(this.getTheme());

      window.app.events.emit("settings:imported");

      return true;
    } catch (error) {
      console.error("Failed to import settings:", error);
      window.app.events.emit("error:settings", {
        message: "Failed to import settings: Invalid format",
      });
      return false;
    }
  }
}
