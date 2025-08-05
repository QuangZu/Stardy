<template>
  <div id="app" class="min-h-screen gradient-bg text-white relative overflow-x-hidden">
    <!-- Persistent Animated Background -->    
    <transition name="page" mode="out-in">
      <router-view />
    </transition>
    
    <!-- Global Notification Container -->
    <NotificationContainer />
  </div>
</template>

<script>
import NotificationContainer from './components/NotificationContainer.vue';

export default {
  name: 'App',
  components: {
    NotificationContainer
  }
}
</script>

<style>
@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');
@import './styles/animations.css';
@import './styles/navigation.css';
@import './styles/background.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

/* Smooth Page Transitions */
.page-enter-active, .page-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.page-enter-to, .page-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>
