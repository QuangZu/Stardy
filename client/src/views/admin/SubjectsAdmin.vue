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
    <div class="space-y-6">
      <!-- Header Section -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 class="text-section-header text-gray-900 dark:text-white">Subjects Management</h2>
            <p class="text-body text-gray-600 dark:text-gray-400 mt-1">Manage educational subjects and categories</p>
          </div>
          <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <!-- Search Bar -->
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i class="fas fa-search text-gray-400 text-sm"></i>
              </div>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search subjects..."
                class="w-full sm:w-64 pl-10 pr-4 py-2 text-body border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
            </div>
            <!-- Add Subject Button -->
            <button 
              @click="showCreateSubjectModal = true" 
              class="btn-primary inline-flex items-center"
            >
              <i class="fas fa-plus mr-2"></i>
              Add Subject
            </button>
          </div>
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
              <tr v-for="subject in filteredSubjects" :key="subject._id" class="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <td class="px-6 py-4 whitespace-nowrap text-body font-mono text-gray-500 dark:text-gray-400">
                  {{ subject._id ? subject._id.slice(-6) : 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-body font-medium text-gray-900 dark:text-white">{{ subject.name || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {{ subject.category || 'N/A' }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <i :class="subject.icon || 'fas fa-book'" class="text-gray-600 dark:text-gray-400"></i>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-body text-gray-500 dark:text-gray-400">
                  {{ formatDate(subject.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-body font-medium">
                  <div class="flex space-x-2">
                    <button 
                      @click="editSubject(subject)" 
                      class="inline-flex items-center p-2 text-primary hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                      title="Edit Subject"
                    >
                      <i class="fas fa-edit text-sm"></i>
                    </button>
                    <button 
                      @click="deleteSubject(subject._id)" 
                      class="inline-flex items-center p-2 text-error hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                      title="Delete Subject"
                    >
                      <i class="fas fa-trash text-sm"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredSubjects.length === 0">
                <td colspan="7" class="px-6 py-12 text-center">
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
                required
                class="form-input"
                placeholder="Enter subject name"
              >
            </div>
            <div class="form-group">
              <label for="subjectCategory">Category</label>
              <select id="subjectCategory" v-model="newSubject.category" class="form-input" required>
                <option value="">Select a category</option>
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="senior secondary">Senior Secondary</option>
                <option value="university">University</option>
                <option value="special">Special</option>
              </select>
            </div>
            <div class="form-group">
              <label for="subjectIcon">Icon (Font Awesome class)</label>
              <input 
                id="subjectIcon"
                v-model="newSubject.icon" 
                type="text" 
                class="form-input"
                placeholder="e.g., fas fa-code"
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="showCreateSubjectModal = false" class="btn-secondary">
            Cancel
          </button>
          <button type="submit" @click="createSubject" class="btn-primary">
            Create Subject
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
import { getAllSubjects, createSubject, deleteSubject } from '@/api/Subject.js'

export default {
  name: 'SubjectsAdmin',
  components: {
    AdminSidebar,
    AdminHeader
  },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      subjects: [],
      searchQuery: '',
      showCreateSubjectModal: false,
      newSubject: {
        name: '',
        category: '',
        icon: 'fas fa-book'
      },
      // Categories matching the backend enum
      categories: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'senior secondary', label: 'Senior Secondary' },
        { value: 'university', label: 'University' },
        { value: 'special', label: 'Special' }
      ]
    }
  },
  computed: {
    filteredSubjects() {
      if (!this.subjects || !Array.isArray(this.subjects)) return []
      if (!this.searchQuery) return this.subjects
      return this.subjects.filter(subject => 
        subject && subject.name && subject.category &&
        (subject.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        subject.category.toLowerCase().includes(this.searchQuery.toLowerCase()))
      )
    }
  },
  mounted() {
    this.fetchSubjects()
  },
  methods: {
    async fetchSubjects() {
      try {
        this.subjects = await getAllSubjects()
      } catch (error) {
        console.error('Error fetching subjects:', error)
      }
    },
    async createSubject() {
      console.log('Creating subject with data:', this.newSubject); // Add this line
      try {
        await createSubject(this.newSubject)
        await this.fetchSubjects()
        this.showCreateSubjectModal = false
        this.newSubject = { 
          name: '', 
          category: '', 
          icon: 'fas fa-book'
        }
      } catch (error) {
        console.error('Error creating subject:', error)
        alert('Error creating subject: ' + error.message) // Add this line for user feedback
      }
    },
    editSubject(subject) {
      // Implementation for edit functionality
      console.log('Edit subject:', subject)
    },
    async deleteSubject(subjectId) {
      if (confirm('Are you sure you want to delete this subject?')) {
        try {
          await deleteSubject(subjectId)
          await this.fetchSubjects()
        } catch (error) {
          console.error('Error deleting subject:', error)
        }
      }
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