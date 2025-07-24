<template>
  <div class="admin-page">
    <!-- Sidebar -->
    <AdminSidebar />
    
    <!-- Header -->
    <AdminHeader 
      title="Statistics" 
      icon-class="fas fa-chart-bar" 
      :current-user="currentUser" 
      @logout="logout" 
    />

    <!-- Main Content -->
    <main class="admin-content">
      <!-- Dashboard Content -->
    <div class="space-y-6">
      <!-- Stats Overview Cards -->
      <div class="grid-12 mb-8">
        <!-- Total Users Card -->
        <div class="metric-card col-span-12 md:col-span-6 lg:col-span-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-body font-medium text-gray-600 mb-2">Total Users</p>
              <p class="text-dashboard-metrics text-gray-900">{{ stats.totalUsers }}</p>
              <div class="flex items-center mt-2">
                <span class="text-small text-success font-medium">+12%</span>
                <span class="text-micro text-gray-500 ml-1">from last month</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-primary text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Total Admins Card -->
        <div class="metric-card col-span-12 md:col-span-6 lg:col-span-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-body font-medium text-gray-600 mb-2">Administrators</p>
              <p class="text-dashboard-metrics text-gray-900">{{ stats.totalAdmins }}</p>
              <div class="flex items-center mt-2">
                <span class="text-small text-primary font-medium">Active</span>
                <span class="text-micro text-gray-500 ml-1">all online</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-user-shield text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Average Level Card -->
        <div class="metric-card col-span-12 md:col-span-6 lg:col-span-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-body font-medium text-gray-600 mb-2">Average Level</p>
              <p class="text-dashboard-metrics text-gray-900">{{ stats.avgLevel }}</p>
              <div class="flex items-center mt-2">
                <span class="text-small text-success font-medium">+5.2%</span>
                <span class="text-micro text-gray-500 ml-1">improvement</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-chart-line text-success text-xl"></i>
            </div>
          </div>
        </div>

        <!-- Average Streak Card -->
        <div class="metric-card col-span-12 md:col-span-6 lg:col-span-3">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-body font-medium text-gray-600 mb-2">Average Streak</p>
              <p class="text-dashboard-metrics text-gray-900">{{ stats.avgStreak }}</p>
              <div class="flex items-center mt-2">
                <span class="text-small text-warning font-medium">🔥 Hot</span>
                <span class="text-micro text-gray-500 ml-1">streak active</span>
              </div>
            </div>
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-fire text-warning text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- User Growth Chart -->
        <div class="chart-container">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-section-header text-gray-900">User Growth</h3>
            <div class="flex space-x-2">
              <button class="px-3 py-1 text-small bg-blue-100 text-primary rounded-lg font-medium">7D</button>
              <button class="px-3 py-1 text-small text-gray-500 rounded-lg font-medium hover:bg-gray-100">30D</button>
              <button class="px-3 py-1 text-small text-gray-500 rounded-lg font-medium hover:bg-gray-100">90D</button>
            </div>
          </div>
          <div class="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <p class="text-body text-gray-500">Chart visualization would go here</p>
          </div>
        </div>

        <!-- Activity Overview -->
        <div class="chart-container">
          <h3 class="text-section-header text-gray-900 mb-6">Recent Activity</h3>
          <div class="space-y-4">
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <i class="fas fa-user-plus text-success text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-body font-medium text-gray-900">New user registered</p>
                <p class="text-small text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <i class="fas fa-clipboard-check text-primary text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-body font-medium text-gray-900">Exam completed</p>
                <p class="text-small text-gray-500">5 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <i class="fas fa-question-circle text-purple-600 text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-body font-medium text-gray-900">New question added</p>
                <p class="text-small text-gray-500">10 minutes ago</p>
              </div>
            </div>
            <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div class="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <i class="fas fa-book text-warning text-sm"></i>
              </div>
              <div class="flex-1">
                <p class="text-body font-medium text-gray-900">Subject updated</p>
                <p class="text-small text-gray-500">15 minutes ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="chart-container">
        <h3 class="text-section-header text-gray-900 mb-6">Quick Actions</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <router-link to="/admin/accounts" class="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-users text-primary"></i>
            </div>
            <div>
              <p class="text-body font-medium text-gray-900">Manage Users</p>
              <p class="text-small text-gray-500">View and edit accounts</p>
            </div>
          </router-link>
          <router-link to="/admin/subjects" class="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-book text-success"></i>
            </div>
            <div>
              <p class="text-body font-medium text-gray-900">Manage Subjects</p>
              <p class="text-small text-gray-500">Add and edit subjects</p>
            </div>
          </router-link>
          <router-link to="/admin/questions" class="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-question-circle text-purple-600"></i>
            </div>
            <div>
              <p class="text-body font-medium text-gray-900">Manage Questions</p>
              <p class="text-small text-gray-500">Create and edit Q&A</p>
            </div>
          </router-link>
          <router-link to="/admin/exams" class="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-clipboard-list text-warning"></i>
            </div>
            <div>
              <p class="text-body font-medium text-gray-900">Manage Exams</p>
              <p class="text-small text-gray-500">Create and schedule exams</p>
            </div>
          </router-link>
        </div>
      </div>
    </div>
    </main>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import { useNotification } from '@/composables/useNotification'
import { getAdminStats } from '@/api/Statistic.js'

export default {
  name: 'StatsAdmin',
  components: {
    AdminSidebar,
    AdminHeader
  },
  setup() {
    const { showSuccess, showError, showInfo, showWarning } = useNotification()
    return {
      showSuccess,
      showError,
      showInfo,
      showWarning
    }
  },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      stats: {
        totalUsers: 0,
        totalAdmins: 0,
        avgLevel: 0,
        avgStreak: 0
      }
    }
  },
  mounted() {
    this.fetchStats()
  },
  methods: {
    async fetchStats() {
      try {
        this.stats = await getAdminStats()
      } catch (error) {
        console.error('Error fetching stats:', error)
        this.showError('Error', 'Failed to fetch statistics. Please try again.')
      }
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
@import '@/styles/admin/admin-modal.css';
@import '@/styles/admin/design-system.css';
</style>