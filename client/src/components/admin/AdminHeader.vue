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

        <!-- Page Title -->
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <i :class="iconClass" class="text-blue-600 dark:text-blue-400"></i>
            <span>{{ title }}</span>
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ pageDescription }}
          </p>
        </div>
      </div>

      <!-- Right Section -->
      <div class="flex items-center space-x-4">

        <!-- Notifications -->
        <div class="relative">
          <button
            class="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200 relative"
            @click="toggleNotifications"
          >
            <i class="fas fa-bell w-6 h-6"></i>
            <span class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center p-2">
              <span class="text-xs text-white font-bold">{{ notificationCount }}</span>
            </span>
          </button>

          <!-- Notifications Dropdown -->
          <div
            v-if="showNotifications"
            class="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 class="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
            </div>
            <div class="max-h-64 overflow-y-auto">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <i :class="notification.icon" class="text-blue-600 dark:text-blue-400 text-sm"></i>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                      {{ notification.title }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {{ notification.message }}
                    </p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {{ notification.time }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
              <button class="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                View all notifications
              </button>
            </div>
          </div>
        </div>

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
            <i class="fas fa-chevron-down w-3 h-3"></i>
          </button>

          <!-- User Dropdown -->
          <div
            v-if="showUserMenu"
            class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
          >
            <div class="p-4 border-b border-gray-200 dark:border-gray-700">
              <p class="text-sm font-medium text-gray-900 dark:text-white">
                {{ currentUser.username || 'Admin User' }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ currentUser.email || 'admin@example.com' }}
              </p>
            </div>
            <div class="py-2">
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-user-circle w-4 h-4 mr-2"></i>
                Profile
              </a>
              <a href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                <i class="fas fa-cog w-4 h-4 mr-2"></i>
                Settings
              </a>
              <hr class="my-2 border-gray-200 dark:border-gray-700">
              <button
                @click="handleLogout"
                class="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <i class="fas fa-sign-out-alt w-4 h-4 mr-2"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AdminHeader',
  props: {
    title: {
      type: String,
      default: 'Admin Dashboard'
    },
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
      showNotifications: false,
      showUserMenu: false,
      notificationCount: 3,
      notifications: [
        {
          id: 1,
          title: 'New user registered',
          message: 'John Doe has created a new account',
          time: '2 minutes ago',
          icon: 'fas fa-user-plus'
        },
        {
          id: 2,
          title: 'System update',
          message: 'System maintenance scheduled for tonight',
          time: '1 hour ago',
          icon: 'fas fa-tools'
        },
        {
          id: 3,
          title: 'New exam submitted',
          message: 'Mathematics exam has been submitted for review',
          time: '3 hours ago',
          icon: 'fas fa-clipboard-check'
        }
      ]
    }
  },
  computed: {
  },
  methods: {
    toggleMobileMenu() {
      this.$emit('toggle-mobile-menu')
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications
      this.showUserMenu = false
    },
    toggleUserMenu() {
      this.showUserMenu = !this.showUserMenu
      this.showNotifications = false
    },
    handleLogout() {
      this.$emit('logout')
    }
  },
  mounted() {
    // Get current user from localStorage if not provided
    if (!this.currentUser.username) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      this.$emit('update-user', user)
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.showNotifications = false
        this.showUserMenu = false
      }
    })
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