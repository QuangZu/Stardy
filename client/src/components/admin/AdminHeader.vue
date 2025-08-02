<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
    <div class="flex items-center justify-between px-4 py-4 md:px-6">
      <!-- Left Section -->
      <div class="flex items-center space-x-4">
        <!-- Mobile Menu Button -->
        <button
          class="lg:hidden p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
          @click="toggleMobileMenu"
        >
          <i class="fas fa-bars w-5 h-5"></i>
        </button>
      </div>

      <!-- Right Section -->
      <div class="flex items-center space-x-4">
        <!-- User Menu -->
        <div class="relative">
          <button
            class="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
            @click="toggleUserMenu"
          >
            <div class="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <i class="fas fa-user text-white text-sm"></i>
            </div>
            <span class="hidden md:block text-sm font-medium text-gray-900 dark:text-white">
              {{ currentUser.username || 'Admin' }}
            </span>
            <i :class="['fas', showUserMenu ? 'fa-chevron-up' : 'fa-chevron-down', 'w-3', 'h-3', 'transition-transform', 'duration-200']"></i>
          </button>

          <!-- User Dropdown -->
          <transition name="fade">
            <div
              v-if="showUserMenu"
              class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            >
            <div class="p-4">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ currentUser.username || 'Admin User' }}
              </p>
            </div>
            <div class="py-2">
              <button @click="goToClientDashboard" class="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-user w-4 h-4 mr-2"></i>
                Client Dashboard
              </button>
              <hr class="my-2">
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <i class="fas fa-sign-out-alt w-4 h-4 mr-2"></i>
                Logout
              </button>
            </div>
          </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AdminHeader',
  props: {
    iconClass: {
      type: String,
      default: 'fas fa-tachometer-alt'
    },
    currentUser: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      showUserMenu: false
    }
  },
  computed: {
  },
  methods: {
    toggleMobileMenu() {
      this.$emit('toggle-mobile-menu')
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
    },
    handleLogout() {
      this.$emit('logout')
    },
    goToClientDashboard() {
      this.showUserMenu = false
      this.$router.push('/dashboard')
    }
  },
  mounted() {
    // Get current user from localStorage if not provided
    if (!this.currentUser.username) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      this.$emit('update-user', user)
    }

    // Close dropdowns when clicking outside
    this.handleClickOutside = (e) => {
      if (!this.$el.contains(e.target)) {
        this.showUserMenu = false
      }
    }
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    // Clean up event listener
    if (this.handleClickOutside) {
      document.removeEventListener('click', this.handleClickOutside)
    }
  }
}
</script>

<style scoped>
/* Custom styles for dropdowns */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>