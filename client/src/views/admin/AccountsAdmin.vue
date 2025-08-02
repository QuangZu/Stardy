<template>
  <div class="admin-page">
    <!-- Sidebar -->
    <AdminSidebar />
    
    <!-- Header -->
    <AdminHeader 
      title="Account Management" 
      icon-class="fas fa-users" 
      :current-user="currentUser" 
      @logout="logout" 
    />

    <!-- Main Content -->
    <main class="admin-content">
    <div class="p-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-section-header text-gray-900 dark:text-white">Account Management</h1>
          <p class="text-body text-gray-600 dark:text-gray-300 mt-1">Manage user accounts and permissions</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search accounts..."
              class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-body dark:bg-gray-700 dark:text-white"
            >
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          <button
            @click="showCreateAccountModal = true"
            class="btn-primary flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            Add Account
          </button>
        </div>
      </div>

      <!-- Accounts Table -->
      <div class="chart-container overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Progress</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="account in filteredAccounts" :key="account._id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-body font-mono text-gray-900 dark:text-gray-100">
                  {{ account._id ? account._id.slice(-6) : 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span class="text-body font-medium text-white">{{ (account.username || 'U').charAt(0).toUpperCase() }}</span>
                    </div>
                    <div>
                      <div class="text-body font-medium text-gray-900 dark:text-white">{{ account.username || 'N/A' }}</div>
                      <div class="text-small text-gray-500 dark:text-gray-400">{{ account.email || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleBadgeClass(account.role)" class="inline-flex px-2 py-1 text-small font-semibold rounded-full">
                    {{ (account.role || 'user').toUpperCase() }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-body text-gray-900 dark:text-gray-100">
                  <div class="flex flex-col space-y-1">
                    <div class="flex items-center space-x-2">
                      <span class="text-small text-gray-500 dark:text-gray-400">Level:</span>
                      <span class="font-medium">{{ account.currentLevel || 1 }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-small text-gray-500 dark:text-gray-400">XP:</span>
                      <span class="font-medium">{{ account.experience || 0 }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <span class="text-small text-gray-500 dark:text-gray-400">Streak:</span>
                      <span class="font-medium">{{ account.streak || 0 }}</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-body text-gray-500 dark:text-gray-400">
                  {{ formatDate(account.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-body font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="editAccount(account)"
                      class="text-primary hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-150"
                      title="Edit Account"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="deleteAccount(account._id)"
                      class="text-error hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-150"
                      title="Delete Account"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Account Modal -->
    <div v-if="showCreateAccountModal" class="modal-overlay" @click="showCreateAccountModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Account</h3>
          <button @click="showCreateAccountModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createAccount">
            <div class="form-group">
              <label>Username</label>
              <input
                v-model="newAccount.username"
                type="text"
                required
                class="form-input"
                placeholder="Enter username"
              >
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                v-model="newAccount.email"
                type="email"
                required
                class="form-input"
                placeholder="Enter email address"
              >
            </div>
            <div class="form-group">
              <label>Password</label>
              <input
                v-model="newAccount.password"
                type="password"
                required
                class="form-input"
                placeholder="Enter password"
              >
            </div>
            <div class="form-group">
              <label>Role</label>
              <select v-model="newAccount.role" class="form-select">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="showCreateAccountModal = false" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" @click="createAccount" class="btn-save">
            Create Account
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Account Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Account</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveAccount">
            <div class="form-group">
              <label>Username</label>
              <input
                v-model="editingAccount.username"
                type="text"
                required
                class="form-input"
                placeholder="Enter username"
              >
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                v-model="editingAccount.email"
                type="email"
                required
                class="form-input"
                placeholder="Enter email address"
              >
            </div>
            <div class="form-group">
              <label>Role</label>
              <select v-model="editingAccount.role" class="form-select">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div class="form-group">
              <label>Level</label>
              <input
                v-model="editingAccount.currentLevel"
                type="number"
                min="1"
                class="form-input"
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeEditModal" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" @click="saveAccount" class="btn-save">
            Update Account
          </button>
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
import { getAllAccounts, createAccount, updateAccount, deleteAccount } from '@/api/Account.js'

export default {
  name: 'AccountsAdmin',
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
      accounts: [],
      searchQuery: '',
      showCreateAccountModal: false,
      showEditModal: false,
      editingAccount: {},
      newAccount: {
        username: '',
        email: '',
        password: '',
        role: 'user'
      },
      loading: false
    }
  },
  computed: {
    filteredAccounts() {
      if (!this.searchQuery) return this.accounts || []
      return (this.accounts || []).filter(account => 
        (account.username || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (account.email || '').toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.fetchAccounts()
  },
  methods: {
    async fetchAccounts() {
      try {
        this.loading = true
        this.accounts = await getAllAccounts()
      } catch (error) {
        console.error('Error fetching accounts:', error)
        this.showError('Error', 'Failed to fetch accounts. Please try again.')
      } finally {
        this.loading = false
      }
    },
    async createAccount() {
      try {
        await createAccount(this.newAccount)
        await this.fetchAccounts()
        this.showCreateAccountModal = false
        this.newAccount = { username: '', email: '', password: '', role: 'user' }
        this.showSuccess('Success', 'Account created successfully!')
      } catch (error) {
        console.error('Error creating account:', error)
        this.showError('Error', 'Failed to create account. Please try again.')
      }
    },
    editAccount(account) {
      this.editingAccount = { ...account }
      this.showEditModal = true
    },
    async saveAccount() {
      try {
        await updateAccount(this.editingAccount._id, this.editingAccount)
        await this.fetchAccounts()
        this.closeEditModal()
        this.showSuccess('Success', 'Account updated successfully!')
      } catch (error) {
        console.error('Error updating account:', error)
        this.showError('Error', 'Failed to update account. Please try again.')
      }
    },
    async deleteAccount(accountId) {
      if (confirm('Are you sure you want to delete this account?')) {
        try {
          await deleteAccount(accountId)
          await this.fetchAccounts()
          this.showSuccess('Success', 'Account deleted successfully!')
        } catch (error) {
          console.error('Error deleting account:', error)
          this.showError('Error', 'Failed to delete account. Please try again.')
        }
      }
    },
    closeEditModal() {
      this.showEditModal = false
      this.editingAccount = {}
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    getRoleBadgeClass(role) {
      const classes = {
        'admin': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200',
        'user': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
      }
      return classes[role] || 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    },
    logout() {
      localStorage.removeItem('token')
      localStorage.removeItem('account')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
@import '@/styles/admin/design-system.css';
@import '@/styles/admin/admin-modal.css';
</style>