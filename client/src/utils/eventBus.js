class EventBus {
  constructor() {
    this.events = {};
  }

  // Subscribe to an event
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  // Unsubscribe from an event
  off(event, callback) {
    if (!this.events[event]) return;
    
    if (callback) {
      // Remove specific callback
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    } else {
      // Remove all callbacks for this event
      delete this.events[event];
    }
  }

  // Emit an event
  emit(event, ...args) {
    if (!this.events[event]) return;
    
    this.events[event].forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in event listener for '${event}':`, error);
      }
    });
  }

  // Subscribe to an event only once
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  // Clear all events
  clear() {
    this.events = {};
  }
}

// Create and export a singleton instance
export const eventBus = new EventBus();

// For backward compatibility, also export as default
export default eventBus;
