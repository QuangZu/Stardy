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
        <button @click="showSystemModal = true" class="btn-primary">
          <i class="fas fa-cog mr-2"></i>
          System Settings
        </button>
      </div>

      <!-- System Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="metric-card">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-body font-medium text-gray-700">Server Status</h3>
              <div class="flex items-center mt-2">
                <div class="w-3 h-3 bg-success rounded-full mr-2"></div>
                <span class="text-dashboard-metric text-success">Online</span>
              </div>
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
                <div class="w-3 h-3 bg-success rounded-full mr-2"></div>
                <span class="text-dashboard-metric text-success">Connected</span>
              </div>
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
              <p class="text-small text-gray-500 mt-2">{{ new Date().toLocaleString() }}</p>
            </div>
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-clock text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Additional System Information -->
      <div class="mt-8">
        <div class="chart-container">
          <h3 class="text-section-header text-gray-900 mb-4">System Health</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-body text-gray-700">CPU Usage</span>
                <span class="text-body font-medium text-gray-900">45%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary h-2 rounded-full" style="width: 45%"></div>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between items-center">
                <span class="text-body text-gray-700">Memory Usage</span>
                <span class="text-body font-medium text-gray-900">62%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-warning h-2 rounded-full" style="width: 62%"></div>
              </div>
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
      systemSettings: {
        maintenanceMode: false,
        maxUsers: 1000,
        sessionTimeout: 60
      }
    }
  },
  methods: {
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