<template>
  <div v-if="visible" class="notification-container">
    <div :class="notificationClasses" class="notification">
      <div class="notification-content">
        <div class="notification-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="notification-text">
          <h4 class="notification-title">{{ title }}</h4>
          <p class="notification-message">{{ message }}</p>
        </div>
      </div>
      <button @click="close" class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Notification',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'info', 'warning'].includes(value)
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    autoClose: {
      type: Boolean,
      default: true
    },
    duration: {
      type: Number,
      default: 5000
    }
  },
  computed: {
    notificationClasses() {
      const baseClasses = 'flex items-start p-4 rounded-lg shadow-lg border-l-4 max-w-md w-full'
      const typeClasses = {
        success: 'bg-green-50 border-green-500 text-green-800',
        error: 'bg-red-50 border-red-500 text-red-800',
        info: 'bg-blue-50 border-blue-500 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-500 text-yellow-800'
      }
      return `${baseClasses} ${typeClasses[this.type]}`
    },
    iconClass() {
      const iconClasses = {
        success: 'fas fa-check-circle text-green-600',
        error: 'fas fa-times-circle text-red-600',
        info: 'fas fa-info-circle text-blue-600',
        warning: 'fas fa-exclamation-triangle text-yellow-600'
      }
      return iconClasses[this.type]
    }
  },
  mounted() {
    if (this.autoClose && this.visible) {
      setTimeout(() => {
        this.close()
      }, this.duration)
    }
  },
  watch: {
    visible(newVal) {
      if (newVal && this.autoClose) {
        setTimeout(() => {
          this.close()
        }, this.duration)
      }
    }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  pointer-events: none;
}

.notification {
  pointer-events: auto;
  animation: slideIn 0.3s ease-out;
  transition: all 0.3s ease;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.notification-icon {
  margin-right: 12px;
  margin-top: 2px;
  font-size: 20px;
}

.notification-text {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 16px;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.notification-message {
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
  opacity: 0.9;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 12px;
  opacity: 0.6;
  transition: opacity 0.2s;
  font-size: 14px;
}

.notification-close:hover {
  opacity: 1;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification {
    max-width: none;
  }
}
</style>