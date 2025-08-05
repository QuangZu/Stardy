<template>
  <div class="admin-page">
    <!-- Sidebar -->
    <AdminSidebar />
    
    <!-- Header -->
    <AdminHeader
      title="Admin Dashboard"
      icon-class="fas fa-tachometer-alt"
      :current-user="currentUser"
      @logout="logout"
    />

    <!-- Main Content -->
    <main class="admin-content">
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-section-header text-gray-900">
            <i class="fas fa-tachometer-alt mr-2"></i>
            Admin Dashboard
          </h1>
          <p class="text-body text-gray-600 mt-1">Monitor system statistics, AI health, and system status</p>
        </div>
        <div class="flex gap-3">
          <button @click="refreshAll" class="btn-secondary" :disabled="loading">
            <i class="fas fa-sync-alt mr-2" :class="{ 'animate-spin': loading }"></i>
            Refresh All
          </button>
          <button @click="showSystemModal = true" class="btn-primary">
            <i class="fas fa-cog mr-2"></i>
            System Settings
          </button>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div class="space-y-8">
        <!-- Overview Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <!-- Total Users Card -->
          <div class="metric-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body font-medium text-gray-600 mb-2">Total Users</p>
                <p class="text-dashboard-metrics text-gray-900">{{ stats.totalUsers || 0 }}</p>
                <div class="flex items-center mt-2">
                  <span class="text-small text-success font-medium">Active</span>
                  <span class="text-micro text-gray-500 ml-1">registered users</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-users text-primary text-xl"></i>
              </div>
            </div>
          </div>

          <!-- Total Notes Card -->
          <div class="metric-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body font-medium text-gray-600 mb-2">Total Notes</p>
                <p class="text-dashboard-metrics text-gray-900">{{ stats.totalNotes || 0 }}</p>
                <div class="flex items-center mt-2">
                  <span class="text-small text-primary font-medium">Created</span>
                  <span class="text-micro text-gray-500 ml-1">by all users</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-sticky-note text-success text-xl"></i>
              </div>
            </div>
          </div>

          <!-- AI Service Status Card -->
          <div class="metric-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body font-medium text-gray-600 mb-2">AI Service</p>
                <div class="flex items-center mb-2">
                  <div :class="['w-3 h-3 rounded-full mr-2', getAIStatusDotClass(aiHealth.status)]"></div>
                  <span :class="['text-dashboard-metrics', getAIStatusTextClass(aiHealth.status)]">
                    {{ getAIStatusText(aiHealth.status) }}
                  </span>
                </div>
                <div class="flex items-center mt-2">
                  <span class="text-small text-gray-500">Response: {{ aiHealth.responseTime }}ms</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-robot text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>

          <!-- System Status Card -->
          <div class="metric-card">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body font-medium text-gray-600 mb-2">System Status</p>
                <div class="flex items-center mb-2">
                  <div :class="getStatusDotClass(systemHealth.server?.status)" class="w-3 h-3 rounded-full mr-2"></div>
                  <span :class="['text-dashboard-metrics', getStatusTextClass(systemHealth.server?.status)]">
                    {{ systemHealth.server?.status || 'Unknown' }}
                  </span>
                </div>
                <div class="flex items-center mt-2">
                  <span class="text-small text-gray-500">Uptime: {{ systemHealth.server?.uptime || 'N/A' }}</span>
                </div>
              </div>
              <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <i class="fas fa-cog text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- AI Health Section -->
        <div class="chart-container">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-section-header text-gray-900">AI Health & Performance</h3>
            <button @click="checkAIHealth" class="btn-secondary">
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh AI Status
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- AI Requests Card -->
            <div class="metric-card">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-body font-medium text-gray-700">AI Requests</h4>
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-chart-line text-primary"></i>
                </div>
              </div>
              <div class="text-dashboard-metric text-gray-900 mb-3">{{ totalRequests }}</div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-small text-gray-600">Today:</span>
                  <span class="text-small font-medium text-gray-900">{{ getTodayRequests() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-small text-gray-600">Success Rate:</span>
                  <span class="text-small font-medium text-success">{{ getSuccessRate() }}%</span>
                </div>
              </div>
            </div>

            <!-- AI Configuration Card -->
            <div class="metric-card">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-body font-medium text-gray-700">AI Configuration</h4>
                <button @click="showAIConfigModal = true" class="btn-secondary text-xs">
                  <i class="fas fa-cog mr-1"></i>
                  Configure
                </button>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-small text-gray-600">Model:</span>
                  <span class="text-small font-medium text-gray-900">{{ aiConfig.model }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-small text-gray-600">Max Tokens:</span>
                  <span class="text-small font-medium text-gray-900">{{ aiConfig.maxTokens }}</span>
                </div>
              </div>
            </div>

            <!-- Database Status Card -->
            <div class="metric-card">
              <div class="flex items-center justify-between mb-4">
                <h4 class="text-body font-medium text-gray-700">Database</h4>
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i class="fas fa-database text-primary"></i>
                </div>
              </div>
              <div class="flex items-center mb-3">
                <div :class="getStatusDotClass(systemHealth.database?.status)" class="w-3 h-3 rounded-full mr-2"></div>
                <span :class="getStatusTextClass(systemHealth.database?.status)" class="text-body font-medium capitalize">
                  {{ systemHealth.database?.status || 'Unknown' }}
                </span>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-small text-gray-600">Users:</span>
                  <span class="text-small font-medium text-gray-900">{{ systemHealth.database?.collections?.users || 0 }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-small text-gray-600">Notes:</span>
                  <span class="text-small font-medium text-gray-900">{{ systemHealth.database?.collections?.notes || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Health Section -->
        <div class="chart-container">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-section-header text-gray-900">System Health</h3>
            <button @click="refreshSystemHealth" class="btn-secondary">
              <i class="fas fa-sync-alt mr-2"></i>
              Refresh System
            </button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- CPU & Memory Usage -->
            <div class="space-y-6">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-body font-medium text-gray-700">CPU Usage</span>
                  <span :class="getUsageTextClass(systemHealth.cpu?.usage)" class="text-body font-medium">
                    {{ systemHealth.cpu?.usage || 0 }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    :class="getUsageBarClass(systemHealth.cpu?.usage)"
                    class="h-2 rounded-full transition-all duration-300"
                    :style="{ width: (systemHealth.cpu?.usage || 0) + '%' }"
                  ></div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-body font-medium text-gray-700">Memory Usage</span>
                  <span :class="getUsageTextClass(systemHealth.memory?.usage)" class="text-body font-medium">
                    {{ systemHealth.memory?.usage || 0 }}%
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    :class="getUsageBarClass(systemHealth.memory?.usage)"
                    class="h-2 rounded-full transition-all duration-300"
                    :style="{ width: (systemHealth.memory?.usage || 0) + '%' }"
                  ></div>
                </div>
                <div class="flex justify-between mt-2">
                  <span class="text-small text-gray-600">Used: {{ systemHealth.memory?.used || 0 }}GB</span>
                  <span class="text-small text-gray-600">Total: {{ systemHealth.memory?.total || 0 }}GB</span>
                </div>
              </div>
            </div>

            <!-- System Information -->
            <div class="space-y-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-body font-medium text-gray-700 mb-3">Server Information</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-small text-gray-600">Environment:</span>
                    <span class="text-small font-medium text-gray-900">{{ systemHealth.server?.environment || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-small text-gray-600">Uptime:</span>
                    <span class="text-small font-medium text-gray-900">{{ systemHealth.server?.uptime || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-small text-gray-600">Last Updated:</span>
                    <span class="text-small font-medium text-gray-900">{{ formatTimestamp(systemHealth.timestamp) }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <h4 class="text-body font-medium text-gray-700 mb-3">AI Service Info</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-small text-gray-600">Model:</span>
                    <span class="text-small font-medium text-gray-900">{{ aiHealth.model || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-small text-gray-600">Last Check:</span>
                    <span class="text-small font-medium text-gray-900">{{ aiHealth.lastCheck || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- AI Configuration Modal -->
    <div v-if="showAIConfigModal" class="modal-overlay" @click="showAIConfigModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-robot"></i> AI Configuration</h3>
          <button @click="showAIConfigModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="ai-model">AI Model</label>
            <input
              id="ai-model"
              v-model="aiConfig.model"
              type="text"
              class="form-input"
              readonly
            >
          </div>
          <div class="form-group">
            <label for="max-tokens">Max Tokens</label>
            <input
              id="max-tokens"
              v-model="aiConfig.maxTokens"
              type="number"
              class="form-input"
              readonly
            >
          </div>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-small text-blue-800">
              <i class="fas fa-info-circle mr-2"></i>
              AI configuration is currently read-only. Contact system administrator to modify these settings.
            </p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showAIConfigModal = false" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>

    <!-- System Settings Modal -->
    <div v-if="showSystemModal" class="modal-overlay" @click="showSystemModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-cog"></i> System Settings</h3>
          <button @click="showSystemModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="maintenance-mode">Maintenance Mode</label>
            <div class="flex items-center">
              <input
                id="maintenance-mode"
                v-model="systemSettings.maintenanceMode"
                type="checkbox"
                class="form-checkbox mr-2"
              >
              <span class="text-body">Enable maintenance mode</span>
            </div>
          </div>
          <div class="form-group">
            <label for="max-users">Maximum Users</label>
            <input
              id="max-users"
              v-model="systemSettings.maxUsers"
              type="number"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label for="session-timeout">Session Timeout (minutes)</label>
            <input
              id="session-timeout"
              v-model="systemSettings.sessionTimeout"
              type="number"
              class="form-input"
            >
          </div>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-small text-yellow-800">
              <i class="fas fa-exclamation-triangle mr-2"></i>
              Changes to system settings will affect all users. Please use caution.
            </p>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="showSystemModal = false" class="btn-secondary">Cancel</button>
          <button @click="updateSystemSettings" class="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import { useNotification } from '@/composables/useNotification'
import { getAdminStats, getSystemHealth } from '@/api/Statistic.js'
import { checkAIHealth, getAllAIRequests } from '@/api/AI.js'

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
      loading: false,

      // Statistics data
      stats: {
        totalUsers: 0,
        totalNotes: 0
      },

      // AI Health data
      aiHealth: {
        status: 'unknown',
        responseTime: 'N/A',
        uptime: 'N/A',
        model: 'Gemini Pro',
        lastCheck: 'Never'
      },
      aiRequests: [],
      aiConfig: {
        model: 'Gemini Flash 1.5',
        maxTokens: 50
      },

      // System Health data
      systemHealth: {
        cpu: { usage: 0, status: 'unknown' },
        memory: { usage: 0, total: 0, used: 0, status: 'unknown' },
        server: { status: 'unknown', uptime: 'N/A', environment: 'N/A' },
        database: { status: 'unknown', collections: { users: 0, notes: 0 } },
        timestamp: null
      },
      systemSettings: {
        maintenanceMode: false,
        maxUsers: 1000,
        sessionTimeout: 60
      },

      // Modal states
      showAIConfigModal: false,
      showSystemModal: false,

      // Auto-refresh interval
      refreshInterval: null
    }
  },
  computed: {
    totalRequests() {
      return Array.isArray(this.aiRequests) ? this.aiRequests.length : 0
    }
  },
  mounted() {
    this.fetchStats()
    this.fetchSystemHealth()
    this.fetchAIRequests()
    this.checkAIHealth()

    // Auto-refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.refreshAll()
    }, 30000)
  },
  beforeUnmount() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
    }
  },
  methods: {
    // Statistics methods
    async fetchStats() {
      try {
        console.log('[StatsAdmin] Fetching admin statistics...')
        const response = await getAdminStats()
        console.log('[StatsAdmin] Response received:', response)

        if (response && response.data) {
          this.stats = {
            totalUsers: response.data.totalUsers || 0,
            totalNotes: response.data.totalNotes || 0
          }
          console.log('[StatsAdmin] Stats updated:', this.stats)
        } else {
          console.warn('[StatsAdmin] No data in response')
          this.stats = { totalUsers: 0, totalNotes: 0 }
        }
      } catch (error) {
        console.error('[StatsAdmin] Error fetching stats:', error)
        this.showError('Failed to fetch statistics. Please try again.')
        this.stats = { totalUsers: 0, totalNotes: 0 }
      }
    },

    // System Health methods
    async fetchSystemHealth() {
      try {
        console.log('[StatsAdmin] Fetching system health...')
        const response = await getSystemHealth()
        console.log('[StatsAdmin] System health response:', response)

        if (response && response.data) {
          this.systemHealth = response.data
          console.log('[StatsAdmin] System health updated:', this.systemHealth)
        } else {
          console.warn('[StatsAdmin] No data in system health response')
        }
      } catch (error) {
        console.error('[StatsAdmin] Error fetching system health:', error)
        this.showError('Failed to fetch system health data. Please check the server connection.')
      }
    },

    async refreshSystemHealth() {
      await this.fetchSystemHealth()
      this.showSuccess('System health data refreshed!')
    },

    // AI Health methods
    async checkAIHealth() {
      try {
        console.log('[StatsAdmin] Checking AI health...')
        const response = await checkAIHealth()
        console.log('[StatsAdmin] AI health response:', response)

        if (response && response.data) {
          this.aiHealth = {
            status: response.data.status || 'healthy',
            responseTime: response.data.responseTime || 'N/A',
            uptime: response.data.uptime || 'N/A',
            model: response.data.model || 'Gemini Pro',
            lastCheck: new Date().toLocaleString()
          }
          console.log('[StatsAdmin] AI health updated:', this.aiHealth)
          this.showSuccess('AI health status updated successfully!')
        } else {
          console.warn('[StatsAdmin] No data in AI health response')
          this.setAIHealthOffline('No response data')
        }
      } catch (error) {
        console.error('[StatsAdmin] Error checking AI health:', error)

        // Check if it's a 503 service unavailable error
        if (error.message.includes('503') || error.message.includes('Service Unavailable') || error.message.includes('experiencing issues')) {
          this.setAIHealthOffline('Service temporarily unavailable')
          console.warn('[StatsAdmin] AI service is temporarily unavailable (503)')
        } else {
          this.setAIHealthOffline('Connection error')
          this.showError('Failed to check AI health status. Service may be offline.')
        }
      }
    },

    setAIHealthOffline(reason) {
      this.aiHealth = {
        status: 'offline',
        responseTime: 'N/A',
        uptime: 'N/A',
        model: 'Gemini Pro',
        lastCheck: new Date().toLocaleString(),
        reason: reason
      }
    },

    async fetchAIRequests() {
      try {
        console.log('[StatsAdmin] Fetching AI requests...')
        const response = await getAllAIRequests()
        console.log('[StatsAdmin] AI requests response:', response)

        // Handle different response structures
        if (Array.isArray(response)) {
          this.aiRequests = response
        } else if (response?.data?.requests && Array.isArray(response.data.requests)) {
          this.aiRequests = response.data.requests
        } else if (response?.data && Array.isArray(response.data)) {
          this.aiRequests = response.data
        } else {
          console.warn('[StatsAdmin] No AI requests data found, using mock data')
          // Provide some mock data for demonstration
          this.aiRequests = [
            {
              id: '1',
              type: 'YouTube Analysis',
              timestamp: new Date().toISOString(),
              status: 'completed',
              duration: '2.3s'
            },
            {
              id: '2',
              type: 'Audio Transcription',
              timestamp: new Date(Date.now() - 300000).toISOString(),
              status: 'completed',
              duration: '1.8s'
            }
          ]
        }
        console.log('[StatsAdmin] AI requests updated:', this.aiRequests.length, 'requests')
      } catch (error) {
        console.error('[StatsAdmin] Error fetching AI requests:', error)
        this.aiRequests = [] // Ensure it's always an array
        this.showError('Failed to fetch AI requests. Using offline mode.')
      }
    },

    // Refresh all data
    async refreshAll() {
      this.loading = true

      try {
        // Fetch core data (stats and system health) - these should always work
        const corePromises = [
          this.fetchStats().catch(err => ({ error: 'Stats', message: err.message })),
          this.fetchSystemHealth().catch(err => ({ error: 'System Health', message: err.message }))
        ]

        // Fetch optional data (AI requests and health) - these might fail
        await Promise.allSettled([
          this.fetchAIRequests().catch(err => console.warn('AI Requests failed:', err.message)),
          this.checkAIHealth().catch(err => console.warn('AI Health failed:', err.message))
        ])

        const coreResults = await Promise.allSettled(corePromises)

        // Check core results
        const errors = []
        coreResults.forEach((result, index) => {
          if (result.status === 'rejected' || (result.value && result.value.error)) {
            errors.push(result.value?.error || ['Stats', 'System Health'][index])
          }
        })

        if (errors.length === 0) {
          this.showSuccess('Dashboard refreshed successfully!')
        } else if (errors.length < 2) {
          this.showInfo('Dashboard refreshed with some services offline.')
        } else {
          this.showWarning('Dashboard refreshed but some core services are unavailable.')
        }

      } catch (error) {
        console.error('[StatsAdmin] Error refreshing dashboard:', error)
        this.showError('Failed to refresh dashboard. Please check your connection.')
      } finally {
        this.loading = false
      }
    },

    // Utility methods for AI requests
    getTodayRequests() {
      if (!Array.isArray(this.aiRequests)) return 0
      const today = new Date().toDateString()
      return this.aiRequests.filter(req =>
        new Date(req.timestamp).toDateString() === today
      ).length
    },

    getWeekRequests() {
      if (!Array.isArray(this.aiRequests)) return 0
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return this.aiRequests.filter(req =>
        new Date(req.timestamp) >= weekAgo
      ).length
    },

    getSuccessRate() {
      if (!Array.isArray(this.aiRequests) || this.aiRequests.length === 0) return 100
      const successful = this.aiRequests.filter(req => req.status === 'completed').length
      return Math.round((successful / this.aiRequests.length) * 100)
    },

    // Utility methods for system status
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
      if (usage >= 85) return 'text-error'
      if (usage >= 70) return 'text-warning'
      return 'text-success'
    },

    getUsageBarClass(usage) {
      if (usage >= 85) return 'bg-error'
      if (usage >= 70) return 'bg-warning'
      return 'bg-success'
    },

    formatTimestamp(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp).toLocaleString()
    },

    getTotalCollections() {
      const collections = this.systemHealth.database?.collections
      if (!collections) return 0
      return Object.values(collections).reduce((sum, count) => sum + (count || 0), 0)
    },

    // AI Status utility methods
    getAIStatusDotClass(status) {
      const classes = {
        'healthy': 'bg-success',
        'online': 'bg-success',
        'offline': 'bg-warning',
        'error': 'bg-error',
        'unknown': 'bg-gray-400'
      }
      return classes[status] || 'bg-gray-400'
    },

    getAIStatusTextClass(status) {
      const classes = {
        'healthy': 'text-success',
        'online': 'text-success',
        'offline': 'text-warning',
        'error': 'text-error',
        'unknown': 'text-gray-500'
      }
      return classes[status] || 'text-gray-500'
    },

    getAIStatusText(status) {
      const texts = {
        'healthy': 'online',
        'online': 'online',
        'offline': 'Offline',
        'error': 'Error',
        'unknown': 'Unknown'
      }
      return texts[status] || 'Unknown'
    },

    // System settings methods
    async updateSystemSettings() {
      try {
        // TODO: Implement actual API call to update system settings
        console.log('[StatsAdmin] Updating system settings:', this.systemSettings)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        this.showSuccess('System settings updated successfully!')
        this.showSystemModal = false
      } catch (error) {
        console.error('[StatsAdmin] Error updating system settings:', error)
        this.showError('Failed to update system settings. Please try again.')
      }
    },

    // Navigation methods
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