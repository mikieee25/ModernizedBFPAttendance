/**
 * Service for handling UI notifications.
 */
export class NotificationService {
  constructor() {
    this.container = null;
    this.notificationIdCounter = 0;
    this.notificationQueue = [];
    this.maxVisibleNotifications = 3;
    this.isProcessingQueue = false;

    // Create notification container
    this.initialize();
  }

  /**
   * Initialize notification container
   */
  initialize() {
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.className = "notification-container";
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 350px;
      `;
      document.body.appendChild(this.container);
    }
  }

  /**
   * Show a notification
   * @param {string} message - Notification message
   * @param {string} type - Notification type (success, error, warning, info)
   * @param {number} duration - Duration in ms
   * @param {boolean} dismissable - Whether notification can be dismissed manually
   * @returns {number} - Notification ID
   */
  show(message, type = "info", duration = 5000, dismissable = true) {
    // Generate notification ID
    const id = ++this.notificationIdCounter;

    // Add to queue
    this.notificationQueue.push({
      id,
      message,
      type,
      duration,
      dismissable,
    });

    // Process queue
    if (!this.isProcessingQueue) {
      this.processQueue();
    }

    return id;
  }

  /**
   * Process notification queue
   */
  async processQueue() {
    try {
      this.isProcessingQueue = true;

      // Get visible notifications count
      const visibleCount = this.container.children.length;

      // Process queue if space available
      if (
        visibleCount < this.maxVisibleNotifications &&
        this.notificationQueue.length > 0
      ) {
        const notification = this.notificationQueue.shift();
        this.displayNotification(notification);
      }

      // Continue processing if queue not empty
      if (this.notificationQueue.length > 0) {
        setTimeout(() => this.processQueue(), 300);
      } else {
        this.isProcessingQueue = false;
      }
    } catch (error) {
      console.error("Error processing notification queue:", error);
      this.isProcessingQueue = false;
    }
  }

  /**
   * Display a notification
   * @param {object} notification - Notification object
   */
  displayNotification(notification) {
    // Create notification element
    const element = document.createElement("div");
    element.className = `notification notification--${notification.type}`;
    element.dataset.id = notification.id;
    element.style.cssText = `
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      opacity: 0;
      transition: transform 0.3s ease-out, opacity 0.3s ease-out;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      overflow: hidden;
      max-width: 100%;
    `;

    // Set background color based on type
    switch (notification.type) {
      case "success":
        element.style.backgroundColor = "var(--color-success, #4caf50)";
        element.style.color = "white";
        break;
      case "error":
        element.style.backgroundColor = "var(--color-error, #f44336)";
        element.style.color = "white";
        break;
      case "warning":
        element.style.backgroundColor = "var(--color-warning, #ff9800)";
        element.style.color = "white";
        break;
      default:
        element.style.backgroundColor = "var(--color-info, #2196f3)";
        element.style.color = "white";
        break;
    }

    // Create message container
    const messageContainer = document.createElement("div");
    messageContainer.className = "notification__message";
    messageContainer.textContent = notification.message;
    messageContainer.style.cssText = `
      flex: 1;
      padding-right: 10px;
    `;

    // Add to notification
    element.appendChild(messageContainer);

    // Add close button if dismissable
    if (notification.dismissable) {
      const closeButton = document.createElement("button");
      closeButton.className = "notification__close";
      closeButton.innerHTML = "&times;";
      closeButton.style.cssText = `
        background: none;
        border: none;
        color: inherit;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        margin: 0;
        width: 24px;
        height: 24px;
        line-height: 24px;
        text-align: center;
        opacity: 0.7;
      `;

      // Add hover effect
      closeButton.onmouseenter = () => {
        closeButton.style.opacity = "1";
      };
      closeButton.onmouseleave = () => {
        closeButton.style.opacity = "0.7";
      };

      // Add click handler
      closeButton.onclick = () => {
        this.dismiss(notification.id);
      };

      element.appendChild(closeButton);
    }

    // Add to container
    this.container.appendChild(element);

    // Trigger animation
    setTimeout(() => {
      element.style.transform = "translateX(0)";
      element.style.opacity = "1";
    }, 10);

    // Auto-dismiss after duration
    if (notification.duration > 0) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, notification.duration);
    }
  }

  /**
   * Dismiss a notification
   * @param {number} id - Notification ID
   */
  dismiss(id) {
    // Find notification element
    const element = this.container.querySelector(
      `.notification[data-id="${id}"]`
    );

    if (element) {
      // Trigger exit animation
      element.style.opacity = "0";
      element.style.transform = "translateX(100%)";

      // Remove after animation
      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }

        // Process queue in case we have pending notifications
        if (this.notificationQueue.length > 0 && !this.isProcessingQueue) {
          this.processQueue();
        }
      }, 300);
    }
  }

  /**
   * Show success notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in ms
   * @returns {number} - Notification ID
   */
  success(message, duration = 5000) {
    return this.show(message, "success", duration);
  }

  /**
   * Show error notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in ms
   * @returns {number} - Notification ID
   */
  error(message, duration = 8000) {
    return this.show(message, "error", duration);
  }

  /**
   * Show warning notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in ms
   * @returns {number} - Notification ID
   */
  warning(message, duration = 7000) {
    return this.show(message, "warning", duration);
  }

  /**
   * Show info notification
   * @param {string} message - Notification message
   * @param {number} duration - Duration in ms
   * @returns {number} - Notification ID
   */
  info(message, duration = 5000) {
    return this.show(message, "info", duration);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    // Clear queue
    this.notificationQueue = [];

    // Get all notifications
    const notifications = this.container.querySelectorAll(".notification");

    // Dismiss each notification
    notifications.forEach((element) => {
      const id = parseInt(element.dataset.id, 10);
      this.dismiss(id);
    });
  }
}
