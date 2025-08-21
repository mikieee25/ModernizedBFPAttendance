/**
 * NotFound Component
 * Displays a 404 page when route is not found
 */
export class NotFoundComponent {
  /**
   * Create a new NotFoundComponent
   * @param {Object} options - Component options
   */
  constructor(options = {}) {
    this.options = {
      outlet: null,
      params: {},
      ...options,
    };

    this.outlet = this.options.outlet;

    this.initialize();
  }

  /**
   * Initialize the component
   */
  initialize() {
    this.render();
    this.attachEventListeners();
  }

  /**
   * Render the component
   */
  render() {
    const html = `
      <div class="not-found-page fade-in flex flex-col items-center justify-center py-12">
        <div class="text-center">
          <div class="mb-6">
            <span class="text-9xl font-bold text-red-700">404</span>
          </div>
          
          <h1 class="text-3xl font-bold mb-4">Page Not Found</h1>
          
          <p class="text-gray-600 text-lg mb-8">The page you are looking for does not exist or has been moved.</p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <button id="go-back-btn" class="btn btn-outline">
              <i class="fas fa-arrow-left mr-2"></i> Go Back
            </button>
            
            <button id="go-home-btn" class="btn btn-primary">
              <i class="fas fa-home mr-2"></i> Go to Dashboard
            </button>
          </div>
        </div>
        
        <div class="mt-12 text-gray-500">
          <p>If you believe this is an error, please contact system administrator.</p>
        </div>
      </div>
    `;

    this.outlet.innerHTML = html;
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Go back button
    const goBackBtn = document.getElementById("go-back-btn");
    if (goBackBtn) {
      goBackBtn.addEventListener("click", () => {
        window.history.back();
      });
    }

    // Go home button
    const goHomeBtn = document.getElementById("go-home-btn");
    if (goHomeBtn) {
      goHomeBtn.addEventListener("click", () => {
        if (window.app.services.auth.isAuthenticated()) {
          window.app.router.navigateTo("/dashboard");
        } else {
          window.app.router.navigateTo("/login");
        }
      });
    }
  }

  /**
   * Clean up component resources
   */
  destroy() {
    // Nothing specific to clean up
  }
}
