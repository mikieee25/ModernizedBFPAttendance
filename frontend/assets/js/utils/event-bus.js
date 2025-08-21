/**
 * Event bus for application-wide events.
 */
class EventBusClass {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event
   * @param {string} event - The event name
   * @param {function} callback - The callback function
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);

    // Return an unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - The event name
   * @param {function} callback - The callback function to remove
   */
  off(event, callback) {
    if (!this.events[event]) {
      return;
    }

    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  /**
   * Emit an event
   * @param {string} event - The event name
   * @param {any} data - The data to pass to callbacks
   */
  emit(event, data) {
    if (!this.events[event]) {
      return;
    }

    this.events[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for "${event}":`, error);
      }
    });
  }

  /**
   * Subscribe to an event only once
   * @param {string} event - The event name
   * @param {function} callback - The callback function
   */
  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };

    return this.on(event, onceCallback);
  }

  /**
   * Clear all event listeners
   * @param {string} [event] - The event name to clear, or all events if not provided
   */
  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

// Create a singleton instance
export const EventBus = new EventBusClass();
