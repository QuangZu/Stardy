<template>
  <div class="admin-page">
    <AdminSidebar />
    <AdminHeader />
    <main class="admin-content">
    <div class="p-6">
      <!-- Header Section -->
      <div class="flex justify-between items-center mb-6">
        <div>
          <h1 class="text-section-header text-gray-900">AI Health & Configuration</h1>
          <p class="text-body text-gray-600 mt-1">Monitor AI service status and manage configuration</p>
        </div>
        <button @click="checkAIHealth" class="btn-primary">
          <i class="fas fa-sync-alt mr-2"></i>
          Refresh Status
        </button>
      </div>

      <!-- AI Status Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="metric-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-body font-medium text-gray-700">AI Service Status</h3>
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-robot text-success text-xl"></i>
            </div>
          </div>
          <div class="flex items-center mb-3">
            <div :class="['w-3 h-3 rounded-full mr-2', aiHealth.status === 'healthy' ? 'bg-success' : 'bg-error']"></div>
            <span :class="['text-dashboard-metric', aiHealth.status === 'healthy' ? 'text-success' : 'text-error']">
              {{ aiHealth.status === 'healthy' ? 'Online' : 'Offline' }}
            </span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-small text-gray-600">Response Time:</span>
              <span class="text-small font-medium text-gray-900">{{ aiHealth.responseTime }}ms</span>
            </div>
            <div class="flex justify-between">
              <span class="text-small text-gray-600">Uptime:</span>
              <span class="text-small font-medium text-gray-900">{{ aiHealth.uptime }}</span>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-body font-medium text-gray-700">AI Requests</h3>
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-chart-line text-primary text-xl"></i>
            </div>
          </div>
          <div class="text-dashboard-metric text-gray-900 mb-3">{{ aiRequests.length }}</div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-small text-gray-600">Today:</span>
              <span class="text-small font-medium text-gray-900">{{ getTodayRequests() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-small text-gray-600">This Week:</span>
              <span class="text-small font-medium text-gray-900">{{ getWeekRequests() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-small text-gray-600">Success Rate:</span>
              <span class="text-small font-medium text-success">{{ getSuccessRate() }}%</span>
            </div>
          </div>
        </div>

        <div class="metric-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-body font-medium text-gray-700">Configuration</h3>
            <button @click="showAIConfigModal = true" class="btn-secondary">
              <i class="fas fa-cog mr-2"></i>
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
            <div class="flex justify-between">
              <span class="text-small text-gray-600">Temperature:</span>
              <span class="text-small font-medium text-gray-900">{{ aiConfig.temperature }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Requests Table -->
      <div class="chart-container">
        <h3 class="text-section-header text-gray-900 mb-4">Recent AI Requests</h3>
        <div class="overflow-x-auto">
          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Request Type</th>
                <th>Status</th>
                <th>Response Time</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="request in recentAIRequests" :key="request._id">
                <td class="font-medium text-gray-900">{{ request.username || 'Anonymous' }}</td>
                <td class="text-gray-600">{{ request.type }}</td>
                <td>
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    request.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  ]">
                    {{ request.status.toUpperCase() }}
                  </span>
                </td>
                <td class="text-gray-600">{{ request.responseTime }}ms</td>
                <td class="text-gray-600">{{ formatDate(request.timestamp) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </main>

    <!-- AI Configuration Modal -->
    <div v-if="showAIConfigModal" class="modal-overlay" @click="showAIConfigModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>AI Configuration</h3>
          <button @click="showAIConfigModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateAIConfig">
            <div class="form-group">
              <label for="model">AI Model</label>
              <select id="model" v-model="aiConfig.model" class="form-input">
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4">GPT-4</option>
              </select>
            </div>
            <div class="form-group">
              <label for="maxTokens">Max Tokens</label>
              <input id="maxTokens" type="number" v-model="aiConfig.maxTokens" class="form-input" min="1" max="4096">
            </div>
            <div class="form-group">
              <label for="temperature">Temperature</label>
              <input id="temperature" type="number" v-model="aiConfig.temperature" class="form-input" min="0" max="2" step="0.1">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showAIConfigModal = false" class="btn-secondary">Cancel</button>
          <button @click="updateAIConfig" class="btn-primary">Save Configuration</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import { getAllAIRequests, checkAIHealth } from '@/api/AI.js'

export default {
  name: 'AIHealthAdmin',
  components: {
    AdminSidebar,
    AdminHeader
  },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      aiHealth: {
        status: 'healthy',
        responseTime: 150,
        lastCheck: new Date(),
        uptime: '99.9%'
      },
      aiRequests: [],
      aiConfig: {
        model: 'gpt-3.5-turbo',
        maxTokens: 2048,
        temperature: 0.7
      },
      showAIConfigModal: false
    }
  },
  computed: {
    recentAIRequests() {
      return this.aiRequests.slice(0, 10)
    }
  },
  mounted() {
    this.fetchAIRequests()
    this.checkAIHealth()
  },
  methods: {
    async fetchAIRequests() {
      try {
        this.aiRequests = await getAllAIRequests()
      } catch (error) {
        console.error('Error fetching AI requests:', error)
      }
    },
    async checkAIHealth() {
      try {
        this.aiHealth = await checkAIHealth()
      } catch (error) {
        console.error('Error checking AI health:', error)
      }
    },
    async updateAIConfig() {
      try {
        // API call to update AI configuration would go here
        console.log('Updating AI config:', this.aiConfig)
        this.showAIConfigModal = false
      } catch (error) {
        console.error('Error updating AI config:', error)
      }
    },
    getTodayRequests() {
      const today = new Date().toDateString()
      return this.aiRequests.filter(req => 
        new Date(req.timestamp).toDateString() === today
      ).length
    },
    getWeekRequests() {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return this.aiRequests.filter(req => 
        new Date(req.timestamp) > weekAgo
      ).length
    },
    getSuccessRate() {
      if (this.aiRequests.length === 0) return 100
      const successful = this.aiRequests.filter(req => req.status === 'success').length
      return Math.round((successful / this.aiRequests.length) * 100)
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
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