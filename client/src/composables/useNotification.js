import { ref } from 'vue'

// Global notification state
const notifications = ref([])
let notificationId = 0

export function useNotification() {
  const showNotification = (type, title, message, options = {}) => {
    const id = ++notificationId
    const notification = {
      id,
      type,
      title,
      message,
      visible: true,
      autoClose: options.autoClose !== false,
      duration: options.duration || 5000,
      ...options
    }
    
    notifications.value.push(notification)
    
    // Auto remove after duration
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(id)
      }, notification.duration)
    }
    
    return id
  }
  
  const removeNotification = (id) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }
  
  const clearAllNotifications = () => {
    notifications.value = []
  }
  
  // Convenience methods for different types
  const showSuccess = (title, message, options) => {
    return showNotification('success', title, message, options)
  }
  
  const showError = (title, message, options) => {
    return showNotification('error', title, message, options)
  }
  
  const showInfo = (title, message, options) => {
    return showNotification('info', title, message, options)
  }
  
  const showWarning = (title, message, options) => {
    return showNotification('warning', title, message, options)
  }
  
  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    showSuccess,
    showError,
    showInfo,
    showWarning
  }
}

// Global notification methods for use in Options API
export const $notify = {
  success: (title, message, options) => {
    const { showSuccess } = useNotification()
    return showSuccess(title, message, options)
  },
  error: (title, message, options) => {
    const { showError } = useNotification()
    return showError(title, message, options)
  },
  info: (title, message, options) => {
    const { showInfo } = useNotification()
    return showInfo(title, message, options)
  },
  warning: (title, message, options) => {
    const { showWarning } = useNotification()
    return showWarning(title, message, options)
  }
}
