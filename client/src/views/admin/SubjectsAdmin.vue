<template>
  <div class="admin-page">
    <AdminSidebar />

    <AdminHeader 
      title="Subjects" 
      icon-class="fas fa-book" 
      :current-user="currentUser" 
      @logout="logout" 
    />
    <main class="admin-content">
      <!-- Content Area -->
    <div class="p-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-section-header text-gray-900 dark:text-white">Subjects Management</h1>
          <p class="text-body text-gray-600 dark:text-gray-300 mt-1">Manage educational subjects and categories</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search subjects..."
              class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-body dark:bg-gray-700 dark:text-white"
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
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Icon</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              <tr v-for="subject in filteredSubjects" :key="subject._id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap text-body font-mono text-gray-900 dark:text-gray-100">
                  {{ subject._id ? subject._id.slice(-6) : 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-body font-medium text-gray-900 dark:text-white">{{ subject.name || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-small font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                    {{ getCategoryLabel(subject.category) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <i :class="subject.icon || 'fas fa-book'" class="text-gray-600 dark:text-gray-400 text-lg"></i>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-body text-gray-500 dark:text-gray-400">
                  {{ formatDate(subject.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-body font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="editSubject(subject)"
                      class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-150"
                      title="Edit Subject"
                    >
                      <i class="fas fa-edit mr-1"></i>
                      Edit
                    </button>
                    <button
                      @click="deleteSubject(subject._id)"
                      class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-150"
                      title="Delete Subject"
                    >
                      <i class="fas fa-trash mr-1"></i>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredSubjects.length === 0">
                <td colspan="6" class="px-6 py-12 text-center">
                  <div class="flex flex-col items-center">
                    <i class="fas fa-book text-4xl text-gray-300 dark:text-gray-600 mb-4"></i>
                    <p class="text-gray-500 dark:text-gray-400 text-lg font-medium">No subjects found</p>
                    <p class="text-gray-400 dark:text-gray-500 text-sm mt-1">Get started by creating your first subject</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Create Subject Modal -->
    <div v-if="showCreateSubjectModal" class="modal-overlay" @click="showCreateSubjectModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Subject</h3>
          <button @click="showCreateSubjectModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createSubject">
            <div class="form-group">
              <label>Subject Name</label>
              <input
                v-model="newSubject.name"
                type="text"
                required
                class="form-input"
                placeholder="Enter subject name"
              >
            </div>
            <div class="form-group">
              <label>Category</label>
              <select 
                v-model="newSubject.category" 
                class="form-input" 
                required
              >
                <option value="">Select a category</option>
                <option 
                  v-for="category in categories" 
                  :key="category.value" 
                  :value="category.value"
                >
                  {{ category.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Icon (Font Awesome class)</label>
              <input
                v-model="newSubject.icon"
                type="text"
                class="form-input"
                placeholder="e.g., fas fa-code"
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="showCreateSubjectModal = false" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" @click="createSubject" class="btn-save">
            Create Subject
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Subject Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Subject</h3>
          <button @click="closeEditModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveSubject">
            <div class="form-group">
              <label>Subject Name</label>
              <input
                v-model="editingSubject.name"
                type="text"
                required
                class="form-input"
                placeholder="Enter subject name"
              >
            </div>
            <div class="form-group">
              <label>Category</label>
              <select 
                v-model="editingSubject.category" 
                class="form-input" 
                required
              >
                <option value="">Select a category</option>
                <option 
                  v-for="category in categories" 
                  :key="category.value" 
                  :value="category.value"
                >
                  {{ category.label }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Icon (Font Awesome class)</label>
              <input
                v-model="editingSubject.icon"
                type="text"
                class="form-input"
                placeholder="e.g., fas fa-code"
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="closeEditModal" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" @click="saveSubject" class="btn-save">
            Update Subject
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
import { getAllSubjects, createSubject, updateSubject, deleteSubject, getSubjectCategories } from '@/api/Subject'
import { useNotification } from '@/composables/useNotification'

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
      categories: [],
      searchQuery: '',
      showCreateSubjectModal: false,
      showEditModal: false,
      editingSubject: {},
      newSubject: {
        name: '',
        category: '',
        icon: 'fas fa-book'
      },
      loading: false
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
    this.fetchCategories()
  },
  methods: {
    async fetchSubjects() {
      try {
        this.loading = true
        const response = await getAllSubjects()
        this.subjects = response.data || response || []
      } catch (error) {
        console.error('Error fetching subjects:', error)
        this.showError('Error', 'Failed to fetch subjects. Please try again.')
        this.subjects = []
      } finally {
        this.loading = false
      }
    },
    async fetchCategories() {
      try {
        const response = await getSubjectCategories()
        
        // Handle different response formats
        if (Array.isArray(response)) {
          this.categories = response
        } else if (response && response.data) {
          this.categories = Array.isArray(response.data) ? response.data : []
        } else {
          throw new Error('Invalid categories response format')
        }
        
        // Validate categories structure
        if (this.categories.length === 0 || !this.categories[0].value) {
          throw new Error('Categories data is empty or malformed')
        }
        
      } catch (error) {
        console.error('Error fetching categories:', error)
        this.showWarning('Warning', 'Failed to fetch categories. Using default categories.')
        
        // Fallback to default categories
        this.categories = [
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
          { value: 'senior secondary', label: 'Senior Secondary' },
          { value: 'university', label: 'University' },
          { value: 'special', label: 'Special' }
        ]
      }
    },
    getCategoryLabel(categoryValue) {
      if (!categoryValue) return 'N/A'
      
      const category = this.categories.find(cat => cat.value === categoryValue)
      return category ? category.label : categoryValue.toUpperCase()
    },
    async createSubject() {
      try {
        // Validate form data
        if (!this.newSubject.name.trim()) {
          this.showError('Error', 'Subject name is required.')
          return
        }
        if (!this.newSubject.category) {
          this.showError('Error', 'Please select a category.')
          return
        }
        
        await createSubject(this.newSubject)
        await this.fetchSubjects()
        this.showCreateSubjectModal = false
        this.newSubject = { name: '', category: '', icon: 'fas fa-book' }
        this.showSuccess('Success', 'Subject created successfully!')
      } catch (error) {
        console.error('Error creating subject:', error)
        this.showError('Error', 'Failed to create subject. Please try again.')
      }
    },
    editSubject(subject) {
      this.editingSubject = { ...subject }
      this.showEditModal = true
    },
    async saveSubject() {
      try {
        // Validate form data
        if (!this.editingSubject.name.trim()) {
          this.showError('Error', 'Subject name is required.')
          return
        }
        if (!this.editingSubject.category) {
          this.showError('Error', 'Please select a category.')
          return
        }
        
        await updateSubject(this.editingSubject._id, this.editingSubject)
        await this.fetchSubjects()
        this.closeEditModal()
        this.showSuccess('Success', 'Subject updated successfully!')
      } catch (error) {
        console.error('Error updating subject:', error)
        this.showError('Error', 'Failed to update subject. Please try again.')
      }
    },
    async deleteSubject(subjectId) {
      if (confirm('Are you sure you want to delete this subject?')) {
        try {
          await deleteSubject(subjectId)
          await this.fetchSubjects()
          this.showSuccess('Success', 'Subject deleted successfully!')
        } catch (error) {
          console.error('Error deleting subject:', error)
          this.showError('Error', 'Failed to delete subject. Please try again.')
        }
      }
    },
    closeEditModal() {
      this.showEditModal = false
      this.editingSubject = {}
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
@import '@/styles/admin/design-system.css';
@import '@/styles/admin/admin-modal.css';
</style>