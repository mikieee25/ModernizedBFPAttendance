/**
 * Simple router for handling navigation in the application.
 */
export class Router {
  /**
   * Create a new router
   * @param {Object} options - Router options
   * @param {Object} options.app - Main app instance
   * @param {HTMLElement} options.outlet - Element where components will be rendered
   * @param {Object} options.routes - Route definitions
   * @param {string} options.defaultRoute - Default route to navigate to
   */
  constructor(options = {}) {
    this.options = options;
    this.app = options.app;
    this.outlet = options.outlet || document.getElementById("main-content");
    this.routes = options.routes || {};
    this.defaultRoute = options.defaultRoute || "/";
    this.currentComponent = null;

    this.init();
  }

  /**
   * Initialize the router
   */
  init() {
    // Handle hash changes
    window.addEventListener("hashchange", this.handleRouteChange.bind(this));

    // Handle initial load
    this.handleRouteChange();
  }

  /**
   * Handle route changes
   */
  handleRouteChange() {
    // Get current hash without the # symbol
    let hash = window.location.hash.slice(1);

    // If no hash, use default route
    if (!hash) {
      this.navigateTo(this.defaultRoute);
      return;
    }

    // Parse route path and query parameters
    const [path, queryString] = hash.split("?");
    const queryParams = queryString ? this.parseQueryParams(queryString) : {};

    // Check if route exists
    if (!this.routes[path]) {
      console.error(`Route ${path} not found`);
      this.navigateTo(this.defaultRoute);
      return;
    }

    // Get route configuration
    const route = this.routes[path];

    // Check authentication if needed
    if (route.requiresAuth && !this.app.services.auth.isAuthenticated()) {
      // Redirect to login
      this.navigateTo("/login", { returnUrl: hash });
      return;
    }

    // Check if the route is public-only (like login page)
    if (route.publicOnly && this.app.services.auth.isAuthenticated()) {
      // Redirect to dashboard
      this.navigateTo("/dashboard");
      return;
    }

    // Show loading state
    this.app.ui.showLoading();

    try {
      // Clean up previous component if exists
      if (
        this.currentComponent &&
        typeof this.currentComponent.destroy === "function"
      ) {
        this.currentComponent.destroy();
      }

      // Clear the outlet
      this.outlet.innerHTML = "";

      // Create and render component
      this.currentComponent = this.app.createComponent(route.component, {
        outlet: this.outlet,
        params: queryParams,
      });

      // Update active navigation link
      this.app.ui.updateActiveNavLink(path.substring(1)); // Remove leading slash

      // Update document title
      document.title = `${route.title || "Page"} | BFP Sorsogon Attendance`;
    } catch (error) {
      console.error("Error loading component:", error);
      this.app.ui.showNotification(
        `Error loading page: ${error.message}`,
        "error"
      );
    } finally {
      // Hide loading state
      this.app.ui.hideLoading();
    }
  }

  /**
   * Parse query parameters
   * @param {string} queryString - Query string to parse
   * @returns {Object} - Object with parsed parameters
   */
  parseQueryParams(queryString) {
    const params = {};
    const searchParams = new URLSearchParams(queryString);

    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  /**
   * Navigate to a specific route
   * @param {string} path - Path to navigate to
   * @param {Object} [params] - Query parameters
   */
  navigateTo(path, params = {}) {
    // Create query string from params
    let queryString = "";
    if (Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams();

      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, value);
      }

      queryString = `?${searchParams.toString()}`;
    }

    // Update location
    window.location.hash = `${path}${queryString}`;
  }

  /**
   * Register a new route
   * @param {string} path - Route path
   * @param {Object} config - Route configuration
   */
  registerRoute(path, config) {
    this.routes[path] = config;
  }
}
