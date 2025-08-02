<template>
  <div class="admin-page">
    <!-- Sidebar -->
    <AdminSidebar />

    <!-- Header -->
    <AdminHeader
      title="Quiz Management"
      icon-class="fas fa-question-circle"
      :current-user="currentUser"
      @logout="logout"
    />

    <!-- Main Content -->
    <main class="admin-content">
      <div class="p-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-section-header text-gray-900 dark:text-white">Quiz Management</h1>
            <p class="text-body text-gray-600 dark:text-gray-300 mt-1">Manage quizzes and quiz questions</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search quizzes..."
                class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-body dark:bg-gray-700 dark:text-white"
              >
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button
              @click="showCreateQuizModal = true"
              class="btn-primary flex items-center gap-2"
            >
              <i class="fas fa-plus"></i>
              Create Quiz
            </button>
          </div>
        </div>

        <!-- Quiz Statistics Cards -->
        <div class="grid-12 mb-6">
          <div class="metric-card col-span-12 md:col-span-6 lg:col-span-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body font-medium text-gray-600 dark:text-gray-300 mb-2">Total Quizzes</p>
                <p class="text-dashboard-metrics text-gray-900 dark:text-white">{{ totalQuizzes }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <i class="fas fa-question-circle text-primary text-xl"></i>
              </div>
            </div>
          </div>

          <div class="metric-card col-span-12 md:col-span-6 lg:col-span-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body font-medium text-gray-600 dark:text-gray-300 mb-2">Total Quiz</p>
                <p class="text-dashboard-metrics text-gray-900 dark:text-white">{{ totalQuizzes }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                <i class="fas fa-list text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div class="metric-card col-span-12 md:col-span-6 lg:col-span-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-body font-medium text-gray-600 dark:text-gray-300 mb-2">Active Quizzes</p>
                <p class="text-dashboard-metrics text-gray-900 dark:text-white">{{ activeQuizzes }}</p>
              </div>
              <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <i class="fas fa-play-circle text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Quizzes Table -->
        <div class="chart-container overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quiz</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="quiz in filteredQuizzes" :key="quiz._id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-small text-gray-500 dark:text-gray-400 font-mono">{{ quiz._id ? quiz._id.slice(-6) : 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-question-circle text-blue-600 dark:text-blue-400"></i>
                      </div>
                      <div class="max-w-xs">
                        <div class="text-body font-medium text-gray-900 dark:text-white truncate" :title="quiz.title">
                          {{ quiz.title || 'N/A' }}
                        </div>
                        <div class="text-small text-gray-500 dark:text-gray-400 truncate" :title="quiz.description">
                          {{ quiz.description || 'No description' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center mr-3">
                        <i class="fas fa-user text-gray-600 dark:text-gray-300 text-sm"></i>
                      </div>
                      <div>
                        <div class="text-body font-medium text-gray-900 dark:text-white">
                          {{ quiz.userId?.username || 'Unknown User' }}
                        </div>
                        <div class="text-small text-gray-500 dark:text-gray-400">
                          {{ quiz.userId?.email || 'No email' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <span class="text-body text-gray-900 dark:text-white font-medium">{{ quiz.quiz?.length || 0 }}</span>
                      <span class="text-small text-gray-500 dark:text-gray-400 ml-1">quiz</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-body text-gray-900 dark:text-white">{{ formatDate(quiz.createdAt) }}</div>
                    <div class="text-small text-gray-500 dark:text-gray-400">{{ formatTime(quiz.createdAt) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-body font-medium">
                    <div class="flex items-center space-x-3">
                      <button
                        @click="viewQuiz(quiz)"
                        class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                        title="View Quiz"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                      <button
                        @click="editQuiz(quiz)"
                        class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-200"
                        title="Edit Quiz"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="confirmDeleteQuiz(quiz._id)"
                        class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200"
                        title="Delete Quiz"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredQuizzes.length === 0">
                  <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center justify-center py-12">
                      <div class="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                        <i class="fas fa-question-circle text-gray-400 dark:text-gray-500 text-2xl"></i>
                      </div>
                      <p class="text-body text-gray-500 dark:text-gray-400 mb-2">No quizzes found</p>
                      <p class="text-small text-gray-400 dark:text-gray-500 mb-4">Create your first quiz to get started</p>
                      <button
                        @click="showCreateQuizModal = true"
                        class="btn-primary text-small"
                      >
                        <i class="fas fa-plus mr-2"></i>
                        Create Quiz
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="filteredQuizzes.length > 0" class="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div class="flex items-center">
            <span class="text-small text-gray-700 dark:text-gray-300">
              Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to {{ Math.min(currentPage * itemsPerPage, totalQuizzes) }} of {{ totalQuizzes }} results
            </span>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="previousPage"
              :disabled="currentPage === 1"
              class="px-3 py-1 text-small text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="px-3 py-1 text-small text-gray-700 dark:text-gray-300">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 text-small text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Quiz Modal -->
    <div v-if="showCreateQuizModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Create New Quiz</h3>
          <button
            @click="showCreateQuizModal = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        <div class="p-6">
          <form @submit.prevent="createQuiz" class="space-y-6">
            <div>
              <label for="quizTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quiz Title</label>
              <input
                id="quizTitle"
                v-model="newQuiz.title"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter quiz title"
              />
            </div>

            <div>
              <label for="quizDescription" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
              <textarea
                id="quizDescription"
                v-model="newQuiz.description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="Enter quiz description"
              ></textarea>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showCreateQuizModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isLoading || !newQuiz.title"
                class="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
                {{ isLoading ? 'Creating...' : 'Create Quiz' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center mb-4">
            <div class="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mr-4">
              <i class="fas fa-exclamation-triangle text-red-600 dark:text-red-400 text-xl"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">Delete Quiz</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
            </div>
          </div>
          <p class="text-gray-700 dark:text-gray-300 mb-6">
            Are you sure you want to delete this quiz? All associated quiz and data will be permanently removed.
          </p>
          <div class="flex items-center justify-end space-x-3">
            <button
              @click="showDeleteModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              @click="deleteQuiz"
              :disabled="isLoading"
              class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
            >
              <i v-if="isLoading" class="fas fa-spinner fa-spin mr-2"></i>
              {{ isLoading ? 'Deleting...' : 'Delete Quiz' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import { useNotification } from '@/composables/useNotification'
import { checkUserRole } from '@/api/Account'
import {
  getAllQuizzes,
  createQuiz as createQuizAPI,
  updateQuiz as updateQuizAPI,
  deleteQuiz as deleteQuizAPI
} from '@/api/Quiz.js'

export default {
  name: 'QuizAdmin',
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
      quizzes: [],
      searchQuery: '',
      isLoading: false,
      showCreateQuizModal: false,
      showEditQuizModal: false,
      showDeleteModal: false,
      quizToDeleteId: null,
      currentPage: 1,
      itemsPerPage: 10,
      newQuiz: {
        title: '',
        description: ''
      },
      editingQuiz: {
        _id: '',
        title: '',
        description: ''
      }
    }
  },
  computed: {
    filteredQuizzes() {
      if (!this.searchQuery) return this.paginatedQuizzes
      const filtered = (this.quizzes || []).filter(quiz =>
        (quiz.title || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (quiz.description || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (quiz.userId?.username || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (quiz.category || '').toLowerCase().includes(this.searchQuery.toLowerCase())
      )
      return filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage)
    },

    paginatedQuizzes() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return (this.quizzes || []).slice(start, end)
    },

    totalQuizzes() {
      return this.quizzes?.reduce((total, quiz) => total + (quiz.questions?.length || 0), 0) || 0
    },

    activeQuizzes() {
      return this.quizzes?.filter(quiz => quiz.questions?.length > 0).length || 0
    },

    totalPages() {
      return Math.ceil(this.totalQuizzes / this.itemsPerPage)
    }
  },
  async mounted() {
    await this.checkAdminAccess()
    await this.fetchQuizzes()
  },
  methods: {
    async checkAdminAccess() {
      try {
        const response = await checkUserRole()
        if (response.role !== 'admin') {
          this.$router.push('/dashboard')
          return
        }
        this.currentUser = response
      } catch (error) {
        console.error('Error checking admin access:', error)
        this.$router.push('/login')
      }
    },

    async fetchQuizzes() {
      try {
        this.isLoading = true
        const response = await getAllQuizzes()
        this.quizzes = Array.isArray(response) ? response : (response.data || [])
      } catch (error) {
        console.error('Error fetching quizzes:', error)
        this.showError('Failed to fetch quizzes. Please try again.')
        this.quizzes = []
      } finally {
        this.isLoading = false
      }
    },

    async createQuiz() {
      if (!this.newQuiz.title.trim()) {
        this.showError('Please enter a quiz title')
        return
      }

      try {
        this.isLoading = true
        await createQuizAPI(this.newQuiz)
        await this.fetchQuizzes()
        this.showCreateQuizModal = false
        this.newQuiz = { title: '', description: '', difficulty: 'medium', category: '' }
        this.showSuccess('Quiz created successfully!')
      } catch (error) {
        console.error('Error creating quiz:', error)
        this.showError('Failed to create quiz. Please try again.')
      } finally {
        this.isLoading = false
      }
    },

    viewQuiz(quiz) {
      // Navigate to quiz detail view
      this.$router.push(`/admin/quizzes/${quiz._id}`)
    },

    editQuiz(quiz) {
      this.editingQuiz = { ...quiz }
      this.showEditQuizModal = true
    },

    async updateQuiz() {
      try {
        this.isLoading = true
        await updateQuizAPI(this.editingQuiz._id, this.editingQuiz)
        await this.fetchQuizzes()
        this.showEditQuizModal = false
        this.showSuccess('Quiz updated successfully!')
      } catch (error) {
        console.error('Error updating quiz:', error)
        this.showError('Failed to update quiz. Please try again.')
      } finally {
        this.isLoading = false
      }
    },

    confirmDeleteQuiz(quizId) {
      this.quizToDeleteId = quizId
      this.showDeleteModal = true
    },

    async deleteQuiz() {
      try {
        this.isLoading = true
        await deleteQuizAPI(this.quizToDeleteId)
        await this.fetchQuizzes()
        this.showDeleteModal = false
        this.quizToDeleteId = null
        this.showSuccess('Quiz deleted successfully!')
      } catch (error) {
        console.error('Error deleting quiz:', error)
        this.showError('Failed to delete quiz. Please try again.')
      } finally {
        this.isLoading = false
      }
    },

    getDifficultyClass(difficulty) {
      const classes = {
        easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      }
      return classes[difficulty] || classes.medium
    },

    capitalizeFirst(str) {
      if (!str) return ''
      return str.charAt(0).toUpperCase() + str.slice(1)
    },

    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },

    formatTime(timestamp) {
      if (!timestamp) return ''
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--
      }
    },

    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++
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
