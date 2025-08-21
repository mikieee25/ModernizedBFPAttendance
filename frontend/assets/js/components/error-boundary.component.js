/**
 * ErrorBoundary Component
 * Catches JavaScript errors in child components and displays a fallback UI
 */
export class ErrorBoundaryComponent {
  /**
   * Create a new ErrorBoundaryComponent
   * @param {Object} options - Component options
   * @param {HTMLElement} options.outlet - The container element
   * @param {Function} options.childComponent - The component to render inside the error boundary
   * @param {Object} options.childOptions - Options to pass to the child component
   */
  constructor(options = {}) {
    this.options = {
      outlet: null,
      childComponent: null,
      childOptions: {},
      ...options,
    };

    this.outlet = this.options.outlet;
    this.childComponent = this.options.childComponent;
    this.childOptions = this.options.childOptions;

    this.hasError = false;
    this.error = null;
    this.errorInfo = null;
    this.childInstance = null;

    this.initialize();
  }

  /**
   * Initialize the component
   */
  initialize() {
    try {
      this.renderChild();
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Render the child component
   */
  renderChild() {
    if (!this.childComponent) {
      console.error("ErrorBoundary: No child component provided");
      return;
    }

    try {
      // Create the child component
      this.childInstance = new this.childComponent({
        ...this.childOptions,
        outlet: this.outlet,
      });
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Handle errors that occur in the child component
   * @param {Error} error - The error that occurred
   * @param {Object} errorInfo - Additional error information
   */
  handleError(error, errorInfo = {}) {
    this.hasError = true;
    this.error = error;
    this.errorInfo = errorInfo;

    console.error("ErrorBoundary caught an error:", error);

    // Log error to server
    this.logErrorToServer(error, errorInfo);

    // Render fallback UI
    this.renderFallbackUI();
  }

  /**
   * Log error to server for monitoring
   * @param {Error} error - The error that occurred
   * @param {Object} errorInfo - Additional error information
   */
  logErrorToServer(error, errorInfo) {
    // In a real implementation, this would send the error to a server
    // For now, just log to console
    console.group("Error details for server logging");
    console.error("Error:", error?.message);
    console.error("Component:", this.childComponent?.name);
    console.error("Stack:", error?.stack);
    console.error("Additional info:", errorInfo);
    console.groupEnd();

    // In production, would use:
    // window.app.services.api.post('/api/logs/error', {
    //   message: error?.message,
    //   component: this.childComponent?.name,
    //   stack: error?.stack,
    //   additionalInfo: errorInfo,
    //   url: window.location.href,
    //   timestamp: new Date().toISOString()
    // });
  }

  /**
   * Render fallback UI when an error occurs
   */
  renderFallbackUI() {
    const componentName = this.childComponent?.name || "Unknown component";
    const errorMessage = this.error?.message || "Unknown error";

    const html = `
      <div class="error-boundary fade-in p-6 border border-red-300 bg-red-50 rounded-md">
        <div class="flex items-center mb-4">
          <i class="fas fa-exclamation-triangle text-red-600 text-2xl mr-3"></i>
          <h2 class="text-xl font-semibold text-red-800">Something went wrong</h2>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-700">There was an error rendering the <strong>${componentName}</strong> component.</p>
          <p class="text-red-700 mt-2 font-mono text-sm p-2 bg-red-100 rounded">${errorMessage}</p>
        </div>
        
        <div class="mt-6 flex gap-3">
          <button id="error-retry-btn" class="btn btn-outline-danger">
            <i class="fas fa-sync-alt mr-2"></i> Try Again
          </button>
          
          <button id="error-dashboard-btn" class="btn btn-primary">
            <i class="fas fa-home mr-2"></i> Go to Dashboard
          </button>
        </div>
      </div>
    `;

    this.outlet.innerHTML = html;
    this.attachFallbackEventListeners();
  }

  /**
   * Attach event listeners for the fallback UI
   */
  attachFallbackEventListeners() {
    // Retry button
    const retryBtn = document.getElementById("error-retry-btn");
    if (retryBtn) {
      retryBtn.addEventListener("click", () => {
        this.retry();
      });
    }

    // Dashboard button
    const dashboardBtn = document.getElementById("error-dashboard-btn");
    if (dashboardBtn) {
      dashboardBtn.addEventListener("click", () => {
        if (window.app.services.auth.isAuthenticated()) {
          window.app.router.navigateTo("/dashboard");
        } else {
          window.app.router.navigateTo("/login");
        }
      });
    }
  }

  /**
   * Retry rendering the child component
   */
  retry() {
    this.hasError = false;
    this.error = null;
    this.errorInfo = null;

    if (
      this.childInstance &&
      typeof this.childInstance.destroy === "function"
    ) {
      this.childInstance.destroy();
    }

    this.outlet.innerHTML = ""; // Clear the outlet
    this.initialize(); // Re-initialize
  }

  /**
   * Clean up component resources
   */
  destroy() {
    if (
      this.childInstance &&
      typeof this.childInstance.destroy === "function"
    ) {
      this.childInstance.destroy();
    }
  }
}
