/**
 * Components index - exports all application components
 */

// Import components
import { LoginComponent } from "./login.component.js";
import { DashboardComponent } from "./dashboard.component.js";
import { AttendanceComponent } from "./attendance.component.js";
import { PersonnelComponent } from "./personnel.component.js";
import { PersonnelFormComponent } from "./personnel-form.component.js";
import { AttendanceRecordsComponent } from "./attendance-records.component.js";
import { UserProfileComponent } from "./user-profile.component.js";
import { SettingsComponent } from "./settings.component.js";
import { ReportsComponent } from "./reports.component.js";
import { UserManagementComponent } from "./user-management.component.js";
import { FaceRegistrationComponent } from "./face-registration.component.js";
import { NotFoundComponent } from "./not-found.component.js";

// Export components
export {
  LoginComponent,
  DashboardComponent,
  AttendanceComponent,
  PersonnelComponent,
  PersonnelFormComponent,
  AttendanceRecordsComponent,
  UserProfileComponent,
  SettingsComponent,
  ReportsComponent,
  UserManagementComponent,
  FaceRegistrationComponent,
  NotFoundComponent,
};

/**
 * Component factory to create component instances
 */
export class ComponentFactory {
  constructor() {
    this.components = {
      login: LoginComponent,
      dashboard: DashboardComponent,
      attendance: AttendanceComponent,
      personnel: PersonnelComponent,
      personnelForm: PersonnelFormComponent,
      attendanceRecords: AttendanceRecordsComponent,
      userProfile: UserProfileComponent,
      settings: SettingsComponent,
      reports: ReportsComponent,
      userManagement: UserManagementComponent,
      faceRegistration: FaceRegistrationComponent,
      notFound: NotFoundComponent,
    };
  }

  /**
   * Create a component instance
   * @param {string} componentName - Name of component to create
   * @param {string} containerId - ID of container element
   * @param {object} options - Additional options for component
   * @returns {object|null} - Component instance or null if not found
   */
  createComponent(componentName, containerId, options = {}) {
    const ComponentClass = this.components[componentName];

    if (!ComponentClass) {
      console.error(`Component '${componentName}' not found`);
      return null;
    }

    return new ComponentClass(containerId, options);
  }
}
