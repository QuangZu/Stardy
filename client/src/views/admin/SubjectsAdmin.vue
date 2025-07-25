<template>
  <div class="admin-page">
    <!-- Sidebar -->
    <AdminSidebar />
    
    <!-- Header -->
    <AdminHeader 
      title="Subjects" 
      icon-class="fas fa-book" 
      :current-user="currentUser" 
      @logout="logout" 
    />

    <!-- Main Content -->
    <main class="admin-content">
      <div class="p-6">
        <!-- Header Section -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 class="text-section-header text-gray-900">Subject Management</h1>
            <p class="text-body text-gray-600 mt-1">Create and manage subjects</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search subjects..."
                class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-body"
              >
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button
              @click="showCreateSubjectModal = true"
              class="btn-primary flex items-center gap-2"
            >
              <i class="fas fa-plus"></i>
              Add Subject
            </button>
          </div>
        </div>

        <!-- Subjects Table -->
        <div class="chart-container overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="subject in filteredSubjects" :key="subject._id" class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-small text-gray-500 font-mono">{{ subject._id ? subject._id.slice(-6) : 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                        <i :class="subject.icon || 'fas fa-book'" class="text-blue-600"></i>
                      </div>
                      <div>
                        <div class="text-body font-medium text-gray-900">{{ subject.name || 'N/A' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getCategoryBadgeClass(subject.category)">
                      {{ getCategoryLabel(subject.category) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-body text-gray-900">
                      <i :class="subject.icon || 'fas fa-book'" class="text-blue-600 mr-2"></i>
                      <span class="text-small text-gray-500">{{ subject.icon || 'fas fa-book' }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-body text-gray-900">{{ formatDate(subject.createdAt) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-body font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="editSubject(subject)"
                        class="text-primary hover:text-blue-900 transition-colors duration-150"
                        title="Edit Subject"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="confirmDeleteSubject(subject._id)"
                        class="text-error hover:text-red-900 transition-colors duration-150"
                        title="Delete Subject"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredSubjects.length === 0">
                  <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center py-8">
                      <i class="fas fa-book text-gray-300 text-4xl mb-4"></i>
                      <p class="text-body text-gray-500">No subjects found</p>
                      <p class="text-small text-gray-400">Create a new subject to get started</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Subject Modal -->
    <div v-if="showCreateSubjectModal" class="modal-overlay" @click="showCreateSubjectModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Subject</h3>
          <button @click="showCreateSubjectModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createSubject">
            <div class="form-group">
              <label for="subjectName">Subject Name</label>
              <input 
                id="subjectName" 
                v-model="newSubject.name" 
                type="text" 
                class="form-input" 
                placeholder="Enter subject name"
                required
              >
            </div>
            <div class="form-group">
              <label for="subjectCategory">Category</label>
              <select id="subjectCategory" v-model="newSubject.category" class="form-input" required>
                <option value="" disabled>Select a category</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="senior secondary">Senior Secondary</option>
                <option value="university">University</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div class="form-group">
              <label for="subjectIcon">Icon (FontAwesome class)</label>
              <input 
                id="subjectIcon" 
                v-model="newSubject.icon" 
                type="text" 
                class="form-input" 
                placeholder="fas fa-book"
              >
              <div class="mt-2 flex items-center gap-2">
                <span class="text-small text-gray-500">Preview:</span>
                <i :class="newSubject.icon || 'fas fa-book'" class="text-blue-600"></i>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showCreateSubjectModal = false" class="btn-secondary">Cancel</button>
          <button @click="createSubject" class="btn-primary" :disabled="isLoading">Create Subject</button>
        </div>
      </div>
    </div>

    <!-- Edit Subject Modal -->
    <div v-if="showEditSubjectModal" class="modal-overlay" @click="showEditSubjectModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Subject</h3>
          <button @click="showEditSubjectModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateSubject">
            <div class="form-group">
              <label for="editSubjectName">Subject Name</label>
              <input 
                id="editSubjectName" 
                v-model="editingSubject.name" 
                type="text" 
                class="form-input" 
                required
              >
            </div>
            <div class="form-group">
              <label for="editSubjectCategory">Category</label>
              <select id="editSubjectCategory" v-model="editingSubject.category" class="form-input" required>
                <option value="" disabled>Select a category</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="senior secondary">Senior Secondary</option>
                <option value="university">University</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div class="form-group">
              <label for="editSubjectIcon">Icon (FontAwesome class)</label>
              <input 
                id="editSubjectIcon" 
                v-model="editingSubject.icon" 
                type="text" 
                class="form-input" 
                placeholder="fas fa-book"
              >
              <div class="mt-2 flex items-center gap-2">
                <span class="text-small text-gray-500">Preview:</span>
                <i :class="editingSubject.icon || 'fas fa-book'" class="text-blue-600"></i>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showEditSubjectModal = false" class="btn-secondary">Cancel</button>
          <button @click="updateSubject" class="btn-primary" :disabled="isLoading">Update Subject</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="showDeleteModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="text-center">
            <i class="fas fa-exclamation-triangle text-error text-4xl mb-4"></i>
            <p class="text-body text-gray-700 mb-4">Are you sure you want to delete this subject?</p>
            <p class="text-small text-error">Warning: This action cannot be undone and will remove all associated exams and questions.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-secondary">Cancel</button>
          <button @click="deleteSubject" class="btn-primary bg-error hover:bg-red-700" :disabled="isLoading">Delete Subject</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import { useNotification } from '@/composables/useNotification'
import { 
  getAllSubjects, 
  createSubject as createSubjectAPI, 
  updateSubject as updateSubjectAPI, 
  deleteSubject as deleteSubjectAPI 
} from '@/api/Subject.js'

export default {
  name: 'SubjectsAdmin',
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
      subjects: [],
      searchQuery: '',
      isLoading: false,
      showCreateSubjectModal: false,
      showEditSubjectModal: false,
      showDeleteModal: false,
      subjectToDeleteId: null,
      newSubject: {
        name: '',
        category: '',
        icon: 'fas fa-book'
      },
      editingSubject: {
        _id: '',
        name: '',
        category: '',
        icon: ''
      }
    }
  },
  computed: {
    filteredSubjects() {
      if (!this.searchQuery) return this.subjects || []
      return (this.subjects || []).filter(subject => 
        (subject.name || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (subject.category || '').toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.fetchSubjects()
  },
  methods: {
    async fetchSubjects() {
      try {
        this.isLoading = true
        const response = await getAllSubjects()
        this.subjects = Array.isArray(response) ? response : (response.data || [])
      } catch (error) {
        console.error('Error fetching subjects:', error)
        this.showError('Error', 'Failed to fetch subjects. Please try again.')
        this.subjects = []
      } finally {
        this.isLoading = false
      }
    },
    getCategoryLabel(categoryValue) {
      const categories = {
        'primary': 'Primary',
        'secondary': 'Secondary', 
        'senior secondary': 'Senior Secondary',
        'university': 'University',
        'special': 'Special'
      }
      return categories[categoryValue] || categoryValue || 'Unknown'
    },
    getCategoryBadgeClass(category) {
      const classes = {
        'primary': 'bg-green-100 text-green-800',
        'secondary': 'bg-blue-100 text-blue-800',
        'senior secondary': 'bg-purple-100 text-purple-800',
        'university': 'bg-red-100 text-red-800',
        'special': 'bg-yellow-100 text-yellow-800'
      }
      return classes[category] || 'bg-gray-100 text-gray-800'
    },
    async createSubject() {
      try {
        this.isLoading = true
        await createSubjectAPI(this.newSubject)
        await this.fetchSubjects()
        this.showCreateSubjectModal = false
        this.newSubject = { name: '', category: '', icon: 'fas fa-book' }
        this.showSuccess('Success', 'Subject created successfully!')
      } catch (error) {
        console.error('Error creating subject:', error)
        this.showError('Error', 'Failed to create subject. Please try again.')
      } finally {
        this.isLoading = false
      }
    },
    editSubject(subject) {
      this.editingSubject = { ...subject }
      this.showEditSubjectModal = true
    },
    async updateSubject() {
      try {
        this.isLoading = true
        await updateSubjectAPI(this.editingSubject._id, this.editingSubject)
        await this.fetchSubjects()
        this.showEditSubjectModal = false
        this.showSuccess('Success', 'Subject updated successfully!')
      } catch (error) {
        console.error('Error updating subject:', error)
        this.showError('Error', 'Failed to update subject. Please try again.')
      } finally {
        this.isLoading = false
      }
    },
    confirmDeleteSubject(subjectId) {
      this.subjectToDeleteId = subjectId
      this.showDeleteModal = true
    },
    async deleteSubject() {
      try {
        this.isLoading = true
        await deleteSubjectAPI(this.subjectToDeleteId)
        await this.fetchSubjects()
        this.showDeleteModal = false
        this.subjectToDeleteId = null
        this.showSuccess('Success', 'Subject deleted successfully!')
      } catch (error) {
        console.error('Error deleting subject:', error)
        this.showError('Error', 'Failed to delete subject. Please try again.')
      } finally {
        this.isLoading = false
      }
    },
    formatDate(timestamp) {
      if (!timestamp) return 'N/A'
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
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