<template>
  <div class="notification-container">
    <transition-group name="notification" tag="div">
      <Notification
        v-for="notification in notifications"
        :key="notification.id"
        :type="notification.type"
        :title="notification.title"
        :message="notification.message"
        :visible="notification.visible"
        :auto-close="false"
        @close="removeNotification(notification.id)"
        class="notification-item"
      />
    </transition-group>
  </div>
</template>

<script>
import Notification from './Notification.vue'
import { useNotification } from '@/composables/useNotification'

export default {
  name: 'NotificationContainer',
  components: {
    Notification
  },
  setup() {
    const { notifications, removeNotification } = useNotification()
    
    return {
      notifications,
      removeNotification
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
  max-width: 400px;
}

.notification-item {
  pointer-events: auto;
  margin-bottom: 12px;
}

/* Transition animations */
.notification-enter-active {
  transition: all 0.3s ease-out;
}

.notification-leave-active {
  transition: all 0.3s ease-in;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

/* Responsive design */
@media (max-width: 640px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>