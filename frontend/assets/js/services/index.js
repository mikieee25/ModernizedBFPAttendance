/**
 * Services index - exports all application services
 */

export { ApiService } from "./api.service.js";
export { AuthService } from "./auth.service.js";
export { AttendanceService } from "./attendance.service.js";
export { PersonnelService } from "./personnel.service.js";
export { FaceRecognitionService } from "./face-recognition.service.js";
export { NotificationService } from "./notification.service.js";
export { UserService } from "./user.service.js";
export { SettingsService } from "./settings.service.js";
export { ReportService } from "./report.service.js";

/**
 * Initialize all required services for the application
 * @returns {object} - Object containing all initialized services
 */
export function initializeServices() {
  return {
    api: new ApiService(),
    auth: new AuthService(),
    attendance: new AttendanceService(),
    personnel: new PersonnelService(),
    faceRecognition: new FaceRecognitionService(),
    notification: new NotificationService(),
    user: new UserService(),
    settings: new SettingsService(),
    report: new ReportService(),
  };
}
