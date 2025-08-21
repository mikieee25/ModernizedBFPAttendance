/**
 * Main application entry point.
 */
import { Router } from "./utils/router.js";
import { UIManager } from "./utils/ui-manager.js";
import { EventBus } from "./utils/event-bus.js";
import { initializeServices } from "./services/index.js";
import { ComponentFactory } from "./components/index.js";

class App {
  constructor() {
    // Set global reference early for other modules to use
    window.app = this;

    // Initialize UI manager
    this.ui = new UIManager();

    // Set up global event bus
    this.events = EventBus;

    // Initialize services
    this.services = initializeServices();

    // Initialize component factory
    this.componentFactory = new ComponentFactory();

    // Initialize the application
    this.initializeApp();
  }

  async initializeApp() {
    try {
      // Show loading indicator
      this.ui.showLoading();

      // Initialize UI components
      this.ui.setupUI();

      // Check authentication status
      await this.services.auth.checkAuth();

      // Update navigation based on auth status
      this.ui.updateNavigation();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize router with routes
      this.initializeRouter();

      // Hide loading indicator
      this.ui.hideLoading();
    } catch (error) {
      console.error("Application initialization error:", error);
      this.ui.showNotification("Error initializing application", "error");
      this.ui.hideLoading();
    }
  }

  /**
   * Initialize router with application routes
   */
  initializeRouter() {
    // Create and configure router
    this.router = new Router({
      app: this,
      outlet: document.getElementById("main-content"),
      routes: this.defineRoutes(),
      defaultRoute: "/login",
    });
  }

  /**
   * Define application routes
   * @returns {Object} - Route definitions
   */
  defineRoutes() {
    return {
      // Public routes
      "/login": {
        component: "login",
        title: "Login",
        publicOnly: true,
      },

      "/forgot-password": {
        component: "forgotPassword",
        title: "Forgot Password",
        publicOnly: true,
      },

      // Protected routes
      "/dashboard": {
        component: "dashboard",
        title: "Dashboard",
        requiresAuth: true,
      },

      "/attendance": {
        component: "attendance",
        title: "Attendance",
        requiresAuth: true,
      },

      "/attendance/records": {
        component: "attendanceRecords",
        title: "Attendance Records",
        requiresAuth: true,
      },

      "/personnel": {
        component: "personnel",
        title: "Personnel Management",
        requiresAuth: true,
      },

      "/personnel/add": {
        component: "personnelForm",
        title: "Add Personnel",
        requiresAuth: true,
      },

      "/personnel/edit": {
        component: "personnelForm",
        title: "Edit Personnel",
        requiresAuth: true,
      },

      "/reports": {
        component: "reports",
        title: "Reports",
        requiresAuth: true,
      },

      "/settings": {
        component: "settings",
        title: "Settings",
        requiresAuth: true,
      },

      "/profile": {
        component: "userProfile",
        title: "User Profile",
        requiresAuth: true,
      },

      "/not-found": {
        component: "notFound",
        title: "Not Found",
      },
    };
  }

  /**
   * Set up application event listeners
   */
  setupEventListeners() {
    // Authentication events
    this.events.on("auth:login", (userData) => {
      this.ui.updateNavigation();
      this.router.navigateTo("/dashboard");
    });

    this.events.on("auth:logout", () => {
      this.ui.updateNavigation();
      this.router.navigateTo("/login");
    });

    this.events.on("auth:session-expired", () => {
      this.services.notification.show(
        "Your session has expired. Please log in again.",
        "warning"
      );
      this.services.auth.logout();
    });

    // Error events
    this.events.on("error:api", (error) => {
      this.services.notification.show(error.message || "API Error", "error");

      // Handle authentication errors
      if (error.status === 401) {
        this.events.emit("auth:session-expired");
      }
    });

    // Personnel events
    this.events.on("personnel:created", (personnel) => {
      this.services.notification.show(
        "Personnel created successfully",
        "success"
      );
    });

    this.events.on("personnel:updated", (personnel) => {
      this.services.notification.show(
        "Personnel updated successfully",
        "success"
      );
    });

    this.events.on("personnel:deleted", (data) => {
      this.services.notification.show(
        "Personnel deleted successfully",
        "success"
      );
    });

    // Attendance events
    this.events.on("attendance:recorded", (attendance) => {
      this.services.notification.show(
        `Attendance recorded successfully`,
        "success"
      );
    });

    // Face recognition events
    this.events.on("face:registered", (data) => {
      this.services.notification.show(
        "Face registered successfully",
        "success"
      );
    });

    this.events.on("face:deleted", (data) => {
      this.services.notification.show(
        "Face data deleted successfully",
        "success"
      );
    });
  }

  /**
   * Create a component instance
   * @param {string} componentName - Component name
   * @param {Object} options - Component options
   * @returns {Object} - Component instance
   */
  createComponent(componentName, options = {}) {
    return this.componentFactory.createComponent(componentName, options);
  }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new App();
});
