/**
 * UI Manager for handling common UI operations.
 */
export class UIManager {
  constructor() {
    this.loadingOverlay = document.getElementById("loading-overlay");
    this.navElement = document.getElementById("main-nav");
    this.footerElement = document.getElementById("main-footer");
    this.currentTheme = localStorage.getItem("theme") || "light";
  }

  /**
   * Set up UI components
   */
  setupUI() {
    this.loadNavigation();
    this.loadFooter();
    this.applyTheme(this.currentTheme);
  }

  /**
   * Load navigation component
   */
  async loadNavigation() {
    try {
      // Temporary placeholder navigation
      const html = `
        <div class="container mx-auto px-4 py-2 flex justify-between items-center">
          <div class="flex items-center">
            <img src="assets/images/logo.png" alt="BFP Logo" class="h-10 mr-3">
            <div class="text-xl font-bold">BFP Sorsogon</div>
          </div>
          
          <div class="hidden md:flex">
            <a href="#/dashboard" data-route="dashboard" data-auth-required class="nav-link">Dashboard</a>
            <a href="#/attendance" data-route="attendance" data-auth-required class="nav-link">Attendance</a>
            <a href="#/personnel" data-route="personnel" data-auth-required class="nav-link">Personnel</a>
            <a href="#/reports" data-route="reports" data-auth-required class="nav-link">Reports</a>
            <a href="#/login" data-route="login" data-public-only class="nav-link">Login</a>
          </div>
          
          <div class="flex items-center">
            <div class="dropdown" data-auth-required>
              <button class="flex items-center text-white focus:outline-none">
                <span id="user-name" class="mr-2">User</span>
                <i class="fas fa-chevron-down text-xs"></i>
              </button>
              <div class="dropdown-menu">
                <a href="#/profile" class="dropdown-item">
                  <i class="fas fa-user mr-2"></i> Profile
                </a>
                <a href="#/settings" class="dropdown-item">
                  <i class="fas fa-cog mr-2"></i> Settings
                </a>
                <hr class="my-1 border-gray-200">
                <button id="logout-btn" class="dropdown-item text-red-500">
                  <i class="fas fa-sign-out-alt mr-2"></i> Logout
                </button>
              </div>
            </div>
            
            <button id="mobile-menu-btn" class="md:hidden ml-4">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
        
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="md:hidden hidden bg-red-700 py-2">
          <div class="container mx-auto px-4">
            <a href="#/dashboard" data-route="dashboard" data-auth-required class="mobile-nav-link">
              <i class="fas fa-tachometer-alt mr-2"></i> Dashboard
            </a>
            <a href="#/attendance" data-route="attendance" data-auth-required class="mobile-nav-link">
              <i class="fas fa-user-check mr-2"></i> Attendance
            </a>
            <a href="#/personnel" data-route="personnel" data-auth-required class="mobile-nav-link">
              <i class="fas fa-users mr-2"></i> Personnel
            </a>
            <a href="#/reports" data-route="reports" data-auth-required class="mobile-nav-link">
              <i class="fas fa-chart-bar mr-2"></i> Reports
            </a>
            <a href="#/login" data-route="login" data-public-only class="mobile-nav-link">
              <i class="fas fa-sign-in-alt mr-2"></i> Login
            </a>
          </div>
        </div>
      `;

      this.navElement.innerHTML = html;

      // Update navigation based on authentication state
      this.updateNavigation();

      // Set up event listeners
      this.setupNavigationListeners();
    } catch (error) {
      console.error("Error loading navigation:", error);
    }
  }

  /**
   * Set up navigation event listeners
   */
  setupNavigationListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
      });
    }

    // Logout button
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        window.app.services.auth.logout();
      });
    }
  }

  /**
   * Load footer component
   */
  async loadFooter() {
    try {
      // Temporary placeholder footer
      const html = `
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row justify-between items-center">
            <div class="mb-4 md:mb-0">
              <p>&copy; ${new Date().getFullYear()} Bureau of Fire Protection - Sorsogon</p>
            </div>
            <div class="flex space-x-4">
              <a href="#" class="text-gray-300 hover:text-white">
                <i class="fab fa-facebook"></i>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <i class="fab fa-twitter"></i>
              </a>
              <a href="#" class="text-gray-300 hover:text-white">
                <i class="fab fa-instagram"></i>
              </a>
            </div>
          </div>
          <div class="mt-4 text-center text-sm text-gray-400">
            <p>Face Recognition Attendance System | Version 2.0</p>
          </div>
        </div>
      `;

      this.footerElement.innerHTML = html;
    } catch (error) {
      console.error("Error loading footer:", error);
    }
  }

  /**
   * Update navigation based on authentication state
   */
  updateNavigation() {
    const isAuthenticated = window.app.services.auth.isAuthenticated();
    const authLinks = document.querySelectorAll("[data-auth-required]");
    const publicLinks = document.querySelectorAll("[data-public-only]");

    // Show/hide auth-required links
    authLinks.forEach((link) => {
      link.style.display = isAuthenticated ? "" : "none";
    });

    // Show/hide public-only links
    publicLinks.forEach((link) => {
      link.style.display = isAuthenticated ? "none" : "";
    });

    // Update user info if authenticated
    if (isAuthenticated) {
      const user = window.app.services.auth.getCurrentUser();
      const userNameElement = document.getElementById("user-name");
      if (userNameElement && user) {
        userNameElement.textContent = user.name || user.username || "User";
      }
    }
  }

  /**
   * Update active navigation link
   * @param {string} routeName - The current route name
   */
  updateActiveNavLink(routeName) {
    const navLinks = document.querySelectorAll("[data-route]");

    navLinks.forEach((link) => {
      const linkRoute = link.getAttribute("data-route");
      if (linkRoute === routeName) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });
  }

  /**
   * Apply theme
   * @param {string} theme - Theme name (light or dark)
   */
  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.currentTheme = theme;
    localStorage.setItem("theme", theme);
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
  }

  /**
   * Show loading overlay
   */
  showLoading() {
    this.loadingOverlay.classList.remove("hidden");
    this.loadingOverlay.classList.add("flex");
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    this.loadingOverlay.classList.add("hidden");
    this.loadingOverlay.classList.remove("flex");
  }

  /**
   * Show notification
   * Uses the NotificationService
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} [duration] - Duration in ms
   */
  showNotification(message, type = "info", duration = 5000) {
    if (window.app && window.app.services && window.app.services.notification) {
      window.app.services.notification.show(message, type, duration);
    } else {
      console.error("NotificationService not available");
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}
