/**
 * Login component for user authentication
 */
class LoginComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.authService = window.app.services.auth;
    this.notificationService = window.app.services.notification;

    // Initialize component
    this.initialize();
  }

  /**
   * Initialize component
   */
  async initialize() {
    try {
      // Render login form
      this.render();

      // Attach event listeners
      this.attachEventListeners();

      // Apply animations
      this.applyAnimations();
    } catch (error) {
      console.error("Failed to initialize login component:", error);
      this.notificationService.error("Failed to initialize login component");
    }
  }

  /**
   * Render login form
   */
  render() {
    const template = `
      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <img src="assets/images/logo.png" alt="BFP Sorsogon Logo" class="login-logo">
            <h1 class="login-title">BFP Sorsogon</h1>
            <p class="login-subtitle">Face Recognition Attendance System</p>
          </div>
          
          <div class="login-body">
            <form id="login-form">
              <div class="form-group">
                <label for="login-email">Email</label>
                <input type="email" id="login-email" name="email" required placeholder="Enter your email">
              </div>
              
              <div class="form-group">
                <label for="login-password">Password</label>
                <div class="password-input-container">
                  <input type="password" id="login-password" name="password" required placeholder="Enter your password">
                  <button type="button" class="password-toggle" id="password-toggle">
                    <i class="fas fa-eye"></i>
                  </button>
                </div>
              </div>
              
              <div class="form-group remember-me">
                <label class="checkbox-container">
                  <input type="checkbox" id="login-remember" name="remember">
                  <span class="checkmark"></span>
                  Remember me
                </label>
                <a href="#/forgot-password" class="forgot-password">Forgot Password?</a>
              </div>
              
              <div class="form-group">
                <button type="submit" class="btn btn-primary btn-login">
                  <span class="btn-text">Login</span>
                  <span class="btn-loader hidden">
                    <i class="fas fa-circle-notch fa-spin"></i>
                  </span>
                </button>
              </div>
            </form>
          </div>
          
          <div class="login-footer">
            <p>&copy; ${new Date().getFullYear()} Bureau of Fire Protection - Sorsogon</p>
          </div>
        </div>
      </div>
    `;

    // Set container content
    this.container.innerHTML = template;

    // Get DOM elements
    this.form = document.getElementById("login-form");
    this.emailInput = document.getElementById("login-email");
    this.passwordInput = document.getElementById("login-password");
    this.rememberCheckbox = document.getElementById("login-remember");
    this.passwordToggle = document.getElementById("password-toggle");
    this.loginButton = this.form.querySelector(".btn-login");
    this.loginButtonText = this.loginButton.querySelector(".btn-text");
    this.loginButtonLoader = this.loginButton.querySelector(".btn-loader");
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Form submission
    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    // Password visibility toggle
    this.passwordToggle.addEventListener(
      "click",
      this.togglePasswordVisibility.bind(this)
    );

    // Auto-focus email field
    setTimeout(() => {
      this.emailInput.focus();
    }, 500);
  }

  /**
   * Apply animations
   */
  applyAnimations() {
    // Add entrance animation class
    document.querySelector(".login-card").classList.add("animate-entrance");
  }

  /**
   * Handle form submission
   * @param {Event} event - Form submit event
   */
  async handleSubmit(event) {
    event.preventDefault();

    try {
      // Show loader
      this.setLoading(true);

      // Get form data
      const email = this.emailInput.value.trim();
      const password = this.passwordInput.value;
      const remember = this.rememberCheckbox.checked;

      // Validate inputs
      if (!email || !password) {
        throw new Error("Please enter both email and password");
      }

      // Attempt login
      const response = await this.authService.login(email, password);

      if (response.success) {
        // Show success notification
        this.notificationService.success("Login successful");

        // Store remember me preference
        if (remember) {
          localStorage.setItem("remember_email", email);
        } else {
          localStorage.removeItem("remember_email");
        }

        // Redirect to dashboard
        window.app.router.navigate("/dashboard");
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      this.notificationService.error(
        error.message || "Invalid email or password"
      );

      // Shake animation for error
      const loginCard = document.querySelector(".login-card");
      loginCard.classList.add("shake");

      // Remove animation class after animation completes
      setTimeout(() => {
        loginCard.classList.remove("shake");
      }, 500);
    } finally {
      // Hide loader
      this.setLoading(false);
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    const type = this.passwordInput.type === "password" ? "text" : "password";
    this.passwordInput.type = type;

    // Toggle icon
    const icon = this.passwordToggle.querySelector("i");
    icon.classList.toggle("fa-eye");
    icon.classList.toggle("fa-eye-slash");
  }

  /**
   * Set loading state
   * @param {boolean} isLoading - Whether component is in loading state
   */
  setLoading(isLoading) {
    if (isLoading) {
      this.loginButton.disabled = true;
      this.loginButtonText.classList.add("hidden");
      this.loginButtonLoader.classList.remove("hidden");
    } else {
      this.loginButton.disabled = false;
      this.loginButtonText.classList.remove("hidden");
      this.loginButtonLoader.classList.add("hidden");
    }
  }

  /**
   * Destroy component and clean up
   */
  destroy() {
    // Remove event listeners
    if (this.form) {
      this.form.removeEventListener("submit", this.handleSubmit.bind(this));
    }

    if (this.passwordToggle) {
      this.passwordToggle.removeEventListener(
        "click",
        this.togglePasswordVisibility.bind(this)
      );
    }

    // Clear container
    this.container.innerHTML = "";
  }
}
