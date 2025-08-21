/**
 * Toast Component
 * Displays toast notifications for user feedback
 */
export class ToastComponent {
  /**
   * Create a new ToastComponent (singleton)
   * @param {Object} options - Component options
   * @param {string} options.position - Position of toasts ('top-right', 'top-left', 'bottom-right', 'bottom-left')
   * @param {number} options.duration - Default duration in ms
   */
  constructor(options = {}) {
    // Singleton pattern
    if (ToastComponent.instance) {
      return ToastComponent.instance;
    }

    this.options = {
      position: "top-right",
      duration: 5000,
      maxToasts: 5,
      ...options,
    };

    this.container = null;
    this.toasts = [];
    this.counter = 0;

    this.initialize();

    // Set instance
    ToastComponent.instance = this;
  }

  /**
   * Initialize the toast container
   */
  initialize() {
    // Create toast container if it doesn't exist
    if (!this.container) {
      this.createContainer();
    }
  }

  /**
   * Create the toast container element
   */
  createContainer() {
    // Check if container already exists
    const existingContainer = document.getElementById("toast-container");
    if (existingContainer) {
      this.container = existingContainer;
      return;
    }

    // Create new container
    this.container = document.createElement("div");
    this.container.id = "toast-container";

    // Set position classes
    let positionClasses = "fixed z-50 p-4 flex flex-col gap-3 max-w-md w-full";

    switch (this.options.position) {
      case "top-right":
        positionClasses += " top-0 right-0";
        break;
      case "top-left":
        positionClasses += " top-0 left-0";
        break;
      case "bottom-right":
        positionClasses += " bottom-0 right-0";
        break;
      case "bottom-left":
        positionClasses += " bottom-0 left-0";
        break;
      default:
        positionClasses += " top-0 right-0";
    }

    this.container.className = positionClasses;
    document.body.appendChild(this.container);
  }

  /**
   * Show a success toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Optional settings
   */
  success(message, options = {}) {
    return this.show(message, {
      type: "success",
      icon: "check-circle",
      ...options,
    });
  }

  /**
   * Show an error toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Optional settings
   */
  error(message, options = {}) {
    return this.show(message, {
      type: "error",
      icon: "exclamation-circle",
      ...options,
    });
  }

  /**
   * Show a warning toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Optional settings
   */
  warning(message, options = {}) {
    return this.show(message, {
      type: "warning",
      icon: "exclamation-triangle",
      ...options,
    });
  }

  /**
   * Show an info toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Optional settings
   */
  info(message, options = {}) {
    return this.show(message, {
      type: "info",
      icon: "info-circle",
      ...options,
    });
  }

  /**
   * Show a toast notification
   * @param {string} message - Message to display
   * @param {Object} options - Toast options
   * @returns {string} Toast ID
   */
  show(message, options = {}) {
    // Merge default options
    const toastOptions = {
      duration: this.options.duration,
      type: "info",
      icon: "info-circle",
      dismissible: true,
      ...options,
    };

    // Generate unique ID
    const id = `toast-${++this.counter}`;

    // Create toast element
    const toastElement = document.createElement("div");
    toastElement.id = id;
    toastElement.className = this.getToastClasses(toastOptions.type);

    // Set toast content
    toastElement.innerHTML = this.getToastTemplate(message, toastOptions);

    // Add to container
    this.container.appendChild(toastElement);

    // Limit number of toasts
    this.limitToastCount();

    // Add to tracking array
    this.toasts.push({
      id,
      element: toastElement,
      timeout: null,
    });

    // Show animation
    setTimeout(() => {
      toastElement.classList.add("opacity-100");
      toastElement.classList.remove("opacity-0");
    }, 10);

    // Set up auto dismiss
    if (toastOptions.duration > 0) {
      const toast = this.toasts.find((t) => t.id === id);
      if (toast) {
        toast.timeout = setTimeout(() => {
          this.dismiss(id);
        }, toastOptions.duration);
      }
    }

    // Set up dismiss button
    if (toastOptions.dismissible) {
      const dismissBtn = toastElement.querySelector(".toast-dismiss-btn");
      if (dismissBtn) {
        dismissBtn.addEventListener("click", () => {
          this.dismiss(id);
        });
      }
    }

    return id;
  }

  /**
   * Get CSS classes for toast based on type
   * @param {string} type - Toast type
   * @returns {string} CSS class string
   */
  getToastClasses(type) {
    const baseClasses =
      "toast-notification flex items-start p-4 mb-2 rounded-md shadow-md transition-all duration-300 transform opacity-0 translate-x-2";

    let typeClasses = "";
    switch (type) {
      case "success":
        typeClasses = "bg-green-50 border-l-4 border-green-500 text-green-800";
        break;
      case "error":
        typeClasses = "bg-red-50 border-l-4 border-red-500 text-red-800";
        break;
      case "warning":
        typeClasses =
          "bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800";
        break;
      case "info":
      default:
        typeClasses = "bg-blue-50 border-l-4 border-blue-500 text-blue-800";
    }

    return `${baseClasses} ${typeClasses}`;
  }

  /**
   * Get HTML template for toast content
   * @param {string} message - Message to display
   * @param {Object} options - Toast options
   * @returns {string} HTML template
   */
  getToastTemplate(message, options) {
    // Get icon color class
    let iconColorClass = "";
    switch (options.type) {
      case "success":
        iconColorClass = "text-green-500";
        break;
      case "error":
        iconColorClass = "text-red-500";
        break;
      case "warning":
        iconColorClass = "text-yellow-500";
        break;
      case "info":
      default:
        iconColorClass = "text-blue-500";
    }

    return `
      <div class="flex-shrink-0 mr-3">
        <i class="fas fa-${options.icon} text-xl ${iconColorClass}"></i>
      </div>
      <div class="flex-grow">
        <div class="toast-message">${message}</div>
      </div>
      ${
        options.dismissible
          ? `
        <button class="toast-dismiss-btn flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none">
          <i class="fas fa-times"></i>
        </button>
      `
          : ""
      }
    `;
  }

  /**
   * Dismiss a specific toast
   * @param {string} id - Toast ID
   */
  dismiss(id) {
    const index = this.toasts.findIndex((toast) => toast.id === id);
    if (index === -1) return;

    const toast = this.toasts[index];
    const { element, timeout } = toast;

    // Clear timeout if exists
    if (timeout) {
      clearTimeout(timeout);
    }

    // Add dismissing animation
    element.classList.add("opacity-0");
    element.style.transform = "translateX(100%)";

    // Remove after animation
    setTimeout(() => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.toasts.splice(index, 1);
    }, 300);
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    [...this.toasts].forEach((toast) => {
      this.dismiss(toast.id);
    });
  }

  /**
   * Limit the number of visible toasts
   */
  limitToastCount() {
    if (this.toasts.length >= this.options.maxToasts) {
      // Remove oldest toast
      const oldestToast = this.toasts[0];
      if (oldestToast) {
        this.dismiss(oldestToast.id);
      }
    }
  }

  /**
   * Clean up component resources
   */
  destroy() {
    this.dismissAll();

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    this.toasts = [];

    // Remove singleton instance
    ToastComponent.instance = null;
  }
}

// Initialize the singleton instance
ToastComponent.instance = null;
