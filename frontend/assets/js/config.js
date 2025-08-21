/**
 * Configuration settings for the BFP Attendance System frontend.
 */
export const config = {
  // API Configuration
  api: {
    baseUrl: "http://127.0.0.1:5000/api/v1",
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // Authentication Settings
  auth: {
    tokenName: "bfp_token",
    refreshTokenName: "bfp_refresh_token",
    tokenExpiry: 60 * 60 * 1000, // 1 hour
    refreshTokenExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
    refreshBeforeExpiry: 5 * 60 * 1000, // 5 minutes
  },

  // Face Recognition Settings
  faceRecognition: {
    captureInterval: 500, // milliseconds between captures
    stabilityThreshold: 2000, // milliseconds of stable face before recording
    minConfidence: 0.6, // minimum confidence score for recognition
    maxAttempts: 5, // maximum number of attempts before giving up
    modelSize: "small", // small, medium, large
    enableMultiFace: false,
  },

  // UI Settings
  ui: {
    notificationDuration: 5000, // milliseconds to show notifications
    loadingTimeout: 30000, // milliseconds before showing timeout message
    dateFormat: "YYYY-MM-DD", // date format for display
    timeFormat: "hh:mm:ss A", // time format for display
    defaultTheme: "light", // light or dark
  },

  // Feature Flags
  features: {
    offlineMode: true, // Support offline operation
    debugMode: false, // Show debug information
    biometricAuth: false, // Use device biometric auth if available
    realTimeUpdates: false, // Will be enabled in future version
  },

  // Development Settings
  development: {
    logApiCalls: true,
    mockData: false,
    slowAnimations: false,
  },
};
