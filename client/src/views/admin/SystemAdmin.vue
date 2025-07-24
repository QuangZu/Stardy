<template>
  <div class="admin-page">
    <!-- Sidebar -->
    <AdminSidebar />
    
    <!-- Header -->
    <AdminHeader 
      title="System Settings" 
      icon-class="fas fa-cog" 
      :current-user="currentUser" 
      @logout="logout" 
    />

    <!-- Main Content -->
    <main class="admin-content">
    <div class="p-6">
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-section-header text-gray-900">System Settings</h1>
          <p class="text-body text-gray-600 mt-1">Monitor system health and configure settings</p>
        </div>
        <div class="flex gap-3">
          <button @click="refreshSystemHealth" class="btn-secondary">
            <i class="fas fa-sync-alt mr-2"></i>
            Refresh
          </button>
          <button @click="showSystemModal = true" class="btn-primary">
            <i class="fas fa-cog mr-2"></i>
            System Settings
          </button>
        </div>
      </div>

      <!-- System Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-body font-medium text-gray-700">Server Status</h3>
              <div class="flex items-center mt-2">
                <div :class="getStatusDotClass(systemHealth.server?.status)" class="w-3 h-3 rounded-full mr-2"></div>
                <span :class="getStatusTextClass(systemHealth.server?.status)" class="text-dashboard-metric capitalize">
                  {{ systemHealth.server?.status || 'Unknown' }}
                </span>
              </div>
              <p class="text-small text-gray-500 mt-1">Uptime: {{ systemHealth.server?.uptime || 'N/A' }}</p>
            </div>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-server text-success text-xl"></i>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-body font-medium text-gray-700">Database</h3>
              <div class="flex items-center mt-2">
                <div :class="getStatusDotClass(systemHealth.database?.status)" class="w-3 h-3 rounded-full mr-2"></div>
                <span :class="getStatusTextClass(systemHealth.database?.status)" class="text-dashboard-metric capitalize">
                  {{ systemHealth.database?.status || 'Unknown' }}
                </span>
              </div>
              <p class="text-small text-gray-500 mt-1">Collections: {{ getTotalCollections() }}</p>
            </div>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-database text-primary text-xl"></i>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-body font-medium text-gray-700">Last Updated</h3>
              <p class="text-small text-gray-500 mt-2">{{ formatTimestamp(systemHealth.timestamp) }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-clock text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- System Health Section -->
      <div class="mt-8">
        <div class="chart-container">
          <h3 class="text-section-header text-gray-900 mb-4">System Health</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-body text-gray-700">CPU Usage</span>
                <span :class="getUsageTextClass(systemHealth.cpu?.usage)" class="text-body font-medium">
                  {{ systemHealth.cpu?.usage || 0 }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  :class="getUsageBarClass(systemHealth.cpu?.usage)" 
                  class="h-2 rounded-full transition-all duration-300" 
                  :style="`width: ${systemHealth.cpu?.usage || 0}%`"
                ></div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-body text-gray-700">Memory Usage</span>
                <span :class="getUsageTextClass(systemHealth.memory?.usage)" class="text-body font-medium">
                  {{ systemHealth.memory?.usage || 0 }}%
                </span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  :class="getUsageBarClass(systemHealth.memory?.usage)" 
                  class="h-2 rounded-full transition-all duration-300" 
                  :style="`width: ${systemHealth.memory?.usage || 0}%`"
                ></div>
              </div>
              <p class="text-small text-gray-500">
                {{ systemHealth.memory?.used || 0 }}GB / {{ systemHealth.memory?.total || 0 }}GB
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </main>

    <!-- System Settings Modal -->
    <div v-if="showSystemModal" class="modal-overlay" @click="showSystemModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>System Settings</h3>
          <button @click="showSystemModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateSystemSettings">
            <div class="form-group">
              <label for="maintenanceMode">Maintenance Mode</label>
              <select id="maintenanceMode" v-model="systemSettings.maintenanceMode" class="form-input">
                <option value="false">Disabled</option>
                <option value="true">Enabled</option>
              </select>
            </div>
            <div class="form-group">
              <label for="maxUsers">Maximum Users</label>
              <input id="maxUsers" type="number" v-model="systemSettings.maxUsers" class="form-input" min="1">
            </div>
            <div class="form-group">
              <label for="sessionTimeout">Session Timeout (minutes)</label>
              <input id="sessionTimeout" type="number" v-model="systemSettings.sessionTimeout" class="form-input" min="5" max="1440">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showSystemModal = false" class="btn-secondary">Cancel</button>
          <button @click="updateSystemSettings" class="btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import { useNotification } from '@/composables/useNotification'
import { getSystemHealth } from '@/api/Statistic.js'

export default {
  name: 'SystemAdmin',
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
      showSystemModal: false,
      systemHealth: {
        server: { status: 'unknown', uptime: 'N/A' },
        database: { status: 'unknown', collections: {} },
        cpu: { usage: 0, status: 'unknown' },
        memory: { usage: 0, total: 0, used: 0, status: 'unknown' },
        timestamp: null
      },
      systemSettings: {
        maintenanceMode: false,
        maxUsers: 1000,
        sessionTimeout: 60
      },
      refreshInterval: null
    }
  },
  mounted() {
    this.fetchSystemHealth()
    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.fetchSystemHealth()
    }, 30000)
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  methods: {
    async fetchSystemHealth() {
      try {
        const response = await getSystemHealth()
        this.systemHealth = response.data
      } catch (error) {
        console.error('Error fetching system health:', error)
        this.showError('Error', 'Failed to fetch system health data.')
      }
    },
    async refreshSystemHealth() {
      await this.fetchSystemHealth()
      this.showSuccess('Success', 'System health data refreshed!')
    },
    getStatusDotClass(status) {
      const classes = {
        'online': 'bg-success',
        'connected': 'bg-success',
        'offline': 'bg-error',
        'disconnected': 'bg-error',
        'warning': 'bg-warning'
      }
      return classes[status] || 'bg-gray-400'
    },
    getStatusTextClass(status) {
      const classes = {
        'online': 'text-success',
        'connected': 'text-success',
        'offline': 'text-error',
        'disconnected': 'text-error',
        'warning': 'text-warning'
      }
      return classes[status] || 'text-gray-500'
    },
    getUsageTextClass(usage) {
      if (usage < 70) return 'text-success'
      if (usage < 85) return 'text-warning'
      return 'text-error'
    },
    getUsageBarClass(usage) {
      if (usage < 70) return 'bg-success'
      if (usage < 85) return 'bg-warning'
      return 'bg-error'
    },
    getTotalCollections() {
      const collections = this.systemHealth.database?.collections || {}
      return Object.values(collections).reduce((sum, count) => sum + (count || 0), 0)
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return 'Never'
      return new Date(timestamp).toLocaleString()
    },
    async updateSystemSettings() {
      try {
        // API call to update system settings would go here
        console.log('Updating system settings:', this.systemSettings)
        this.showSystemModal = false
        this.showSuccess('Success', 'System settings updated successfully!')
      } catch (error) {
        console.error('Error updating system settings:', error)
        this.showError('Error', 'Failed to update system settings.')
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