<template>
  <aside class="admin-sidebar bg-sidebar shadow-sm h-full py-3">
    <!-- Logo Section -->
    <div class="flex h-16 items-center justify-center px-6">
      <h1 class="text-section-header text-gray-800">
        <i class="fas fa-star"></i>
        Stardy Admin
      </h1>
    </div>

    <!-- Navigation Menu -->
    <nav class="mt-8 px-4">
      <ul class="space-y-1">
        <li>
          <router-link
            to="/admin/stats"
            class="sidebar-item flex items-center text-navigation text-gray-700"
            :class="{ 'active': $route.path === '/admin/stats' }"
          >
            <i class="fas fa-chart-bar mr-3 h-3 w-5"></i>
            Dashboard
          </router-link>
        </li>

        <li>
          <router-link
            to="/admin/accounts"
            class="sidebar-item flex items-center text-navigation text-gray-700"
            :class="{ 'active': $route.path === '/admin/accounts' }"
          >
            <i class="fas fa-users mr-3 h-3 w-5"></i>
            Accounts
          </router-link>
        </li>
        <li>
          <router-link
            to="/admin/subjects"
            class="sidebar-item flex items-center text-navigation text-gray-700"
            :class="{ 'active': $route.path === '/admin/subjects' }"
          >
            <i class="fas fa-book mr-3 h-3 w-5"></i>
            Subjects
          </router-link>
        </li>
        <li>
          <router-link
            to="/admin/questions"
            class="sidebar-item flex items-center text-navigation text-gray-700"
            :class="{ 'active': $route.path === '/admin/questions' }"
          >
            <i class="fas fa-question-circle mr-3 h-3 w-5"></i>
            Questions
          </router-link>
        </li>
        <li>
          <router-link
            to="/admin/exams"
            class="sidebar-item flex items-center text-navigation text-gray-700"
            :class="{ 'active': $route.path === '/admin/exams' }"
          >
            <i class="fas fa-clipboard-list mr-3 h-3 w-5"></i>
            Exams
          </router-link>
        </li>

        <li>
          <router-link
            to="/admin/system"
            class="sidebar-item flex items-center text-navigation text-gray-700"
            :class="{ 'active': $route.path === '/admin/system' }"
          >
            <i class="fas fa-cog mr-3 h-3 w-5"></i>
            System
          </router-link>
        </li>
      </ul>
    </nav>


  </aside>
</template>

<script>
export default {
  name: 'AdminSidebar',
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  methods: {
    isActive(path) {
      return this.$route.path === path
    },
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
.menu-item {
  @apply flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200;
}

.menu-item-active {
  @apply bg-blue-50 text-blue-700 border-r-2 border-blue-500;
}

.menu-item-inactive {
  @apply text-gray-700 hover:bg-gray-100 hover:text-gray-900;
}

.dark .menu-item-active {
  @apply bg-blue-900/20 text-blue-400 border-blue-400;
}

.dark .menu-item-inactive {
  @apply text-gray-300 hover:bg-gray-800 hover:text-white;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.dark ::-webkit-scrollbar-thumb {
  background: #4b5563;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>