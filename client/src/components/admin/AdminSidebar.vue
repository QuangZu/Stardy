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
            <i class="fas fa-tachometer-alt mr-3 h-3 w-5"></i>
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
            to="/admin/quizzes"
            class="sidebar-item flex items-center text-navigation text-gray-700"
            :class="{ 'active': $route.path === '/admin/quizzes' }"
          >
            <i class="fas fa-sticky-note mr-3 h-3 w-5"></i>
            Quizzes
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
.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 4px 0;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s ease;
  font-weight: 500;
}

.sidebar-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.sidebar-item.active {
  background-color: #3b82f6;
  color: white;
  border-left: 4px solid #1d4ed8;
}

.sidebar-item.active i {
  color: white;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-item-active {
  background-color: #eff6ff;
  color: #1d4ed8;
  border-right: 2px solid #3b82f6;
}

.menu-item-inactive {
  color: #374151;
}

.menu-item-inactive:hover {
  background-color: #f3f4f6;
  color: #111827;
}

.dark .menu-item-active {
  background-color: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  border-color: #60a5fa;
}

.dark .menu-item-inactive {
  color: #d1d5db;
}

.dark .menu-item-inactive:hover {
  background-color: #374151;
  color: white;
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