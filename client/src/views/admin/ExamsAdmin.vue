<template>
  <div class="admin-page">
    <!-- Sidebar -->
    <AdminSidebar />
    
    <!-- Header -->
    <AdminHeader 
      title="Exams" 
      icon-class="fas fa-clipboard-list" 
      :current-user="currentUser" 
      @logout="logout" 
    />

    <!-- Main Content -->
    <main class="admin-content">
    <div class="p-6">
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 class="text-section-header text-gray-900">Exam Management</h1>
          <p class="text-body text-gray-600 mt-1">Create and manage exams</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search exams..."
              class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-body"
            >
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
          <button
            @click="showCreateExamModal = true"
            class="btn-primary flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            Add Exam
          </button>
        </div>
      </div>

      <!-- Exams Table -->
      <div class="chart-container overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="exam in filteredExams" :key="exam._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-clipboard-list text-purple-600"></i>
                    </div>
                    <div>
                      <div class="text-body font-medium text-gray-900">{{ exam.title || 'N/A' }}</div>
                      <div class="text-small text-gray-500">ID: {{ exam._id ? exam._id.slice(-6) : 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-body text-gray-900">{{ getSubjectName(exam.subjectId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getDifficultyBadgeClass(exam.difficulty)" class="inline-flex px-2 py-1 text-small font-semibold rounded-full">
                    {{ (exam.difficulty || 'easy') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-body text-gray-900">{{ exam.duration || 60 }} min</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-body text-gray-900">{{ formatDate(exam.createdAt) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-body font-medium">
                  <div class="flex space-x-2">
                    <button
                      @click="editExam(exam)"
                      class="text-primary hover:text-blue-900 transition-colors duration-150"
                      title="Edit Exam"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="deleteExam(exam._id)"
                      class="text-error hover:text-red-900 transition-colors duration-150"
                      title="Delete Exam"
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

    <!-- Create Exam Modal -->
    <div v-if="showCreateExamModal" class="modal-overlay" @click="showCreateExamModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Exam</h3>
          <button @click="showCreateExamModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createExam">
            <div class="form-group">
              <label>Exam Title</label>
              <input
                v-model="newExam.title"
                type="text"
                required
                class="form-input"
                placeholder="Enter exam title"
              >
            </div>
            <div class="form-group">
              <label>Subject</label>
              <select
                v-model="newExam.subjectId"
                required
                class="form-select"
              >
                <option value="">Select a subject</option>
                <option v-for="subject in subjects" :key="subject._id" :value="subject._id">
                  {{ subject.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Difficulty</label>
              <select
                v-model="newExam.difficulty"
                required
                class="form-select"
              >
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div class="form-group">
              <label>Duration (minutes)</label>
              <input
                v-model="newExam.duration"
                type="number"
                min="1"
                required
                class="form-input"
                placeholder="Enter duration in minutes"
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="showCreateExamModal = false" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" @click="createExam" class="btn-save">
            Create Exam
          </button>
        </div>
      </div>
    </div>

    <!-- Edit Exam Modal -->
    <div v-if="showEditExamModal" class="modal-overlay" @click="showEditExamModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Exam</h3>
          <button @click="showEditExamModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateExam">
            <div class="form-group">
              <label>Exam Title</label>
              <input
                v-model="editingExam.title"
                type="text"
                required
                class="form-input"
                placeholder="Enter exam title"
              >
            </div>
            <div class="form-group">
              <label>Subject</label>
              <select
                v-model="editingExam.subjectId"
                required
                class="form-select"
              >
                <option value="">Select a subject</option>
                <option v-for="subject in subjects" :key="subject._id" :value="subject._id">
                  {{ subject.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Difficulty</label>
              <select
                v-model="editingExam.difficulty"
                required
                class="form-select"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div class="form-group">
              <label>Duration (minutes)</label>
              <input
                v-model="editingExam.duration"
                type="number"
                min="1"
                required
                class="form-input"
                placeholder="Enter duration in minutes"
              >
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="showEditExamModal = false" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" @click="updateExam" class="btn-save">
            Update Exam
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
import { getAllExams, createExam, updateExam, deleteExam } from '@/api/Exam.js'
import { getAllSubjects } from '@/api/Subject.js'

export default {
  name: 'ExamsAdmin',
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
      exams: [],
      subjects: [],
      searchQuery: '',
      showCreateExamModal: false,
      showEditExamModal: false,
      newExam: {
        title: '',
        subjectId: '',
        difficulty: 'easy',
        duration: 60
      },
      editingExam: {
        _id: '',
        title: '',
        subjectId: '',
        difficulty: 'easy',
        duration: 60
      }
    }
  },
  computed: {
    filteredExams() {
      if (!this.searchQuery) return this.exams || []
      return (this.exams || []).filter(exam => 
        (exam.title || '').toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.fetchExams()
    this.fetchSubjects()
  },
  methods: {
    async fetchExams() {
      try {
        this.exams = await getAllExams()
      } catch (error) {
        console.error('Error fetching exams:', error)
        this.showError('Error', 'Failed to fetch exams. Please try again.')
      }
    },
    async fetchSubjects() {
      try {
        this.subjects = await getAllSubjects()
      } catch (error) {
        console.error('Error fetching subjects:', error)
        this.showWarning('Warning', 'Failed to fetch subjects. Some features may be limited.')
      }
    },
    getSubjectName(subjectId) {
      const subject = this.subjects.find(s => s._id === subjectId)
      return subject ? subject.name : 'Unknown'
    },
    async createExam() {
      try {
        await createExam(this.newExam)
        await this.fetchExams()
        this.showCreateExamModal = false
        this.newExam = { title: '', subjectId: '', difficulty: 'easy', duration: 60 }
        this.showSuccess('Success', 'Exam created successfully!')
      } catch (error) {
        console.error('Error creating exam:', error)
        this.showError('Error', 'Failed to create exam. Please try again.')
      }
    },
    editExam(exam) {
      this.editingExam = { ...exam }
      this.showEditExamModal = true
    },
    async updateExam() {
      try {
        await updateExam(this.editingExam._id, this.editingExam)
        await this.fetchExams()
        this.showEditExamModal = false
        this.editingExam = { _id: '', title: '', subjectId: '', difficulty: 'easy', duration: 60 }
        this.showSuccess('Success', 'Exam updated successfully!')
      } catch (error) {
        console.error('Error updating exam:', error)
        this.showError('Error', 'Failed to update exam. Please try again.')
      }
    },
    async deleteExam(examId) {
      if (confirm('Are you sure you want to delete this exam?')) {
        try {
          await deleteExam(examId)
          await this.fetchExams()
          this.showSuccess('Success', 'Exam deleted successfully!')
        } catch (error) {
          console.error('Error deleting exam:', error)
          this.showError('Error', 'Failed to delete exam. Please try again.')
        }
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    getDifficultyBadgeClass(difficulty) {
      const classes = {
        'easy': 'bg-success text-white',
        'medium': 'bg-warning text-white',
        'hard': 'bg-error text-white'
      }
      return classes[difficulty] || 'bg-gray-500 text-white'
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