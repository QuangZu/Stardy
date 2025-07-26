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
          <p class="text-body text-gray-600 mt-1">Create and manage exams with questions</p>
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
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Questions</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="exam in filteredExams" :key="exam._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-small font-mono text-gray-500">{{ exam._id ? exam._id.slice(-6) : 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-clipboard-list text-purple-600"></i>
                    </div>
                    <div>
                      <div class="text-body font-medium text-gray-900">{{ exam.title || 'N/A' }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-body text-gray-900">{{ getSubjectName(exam.subjectId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <span class="text-body text-gray-900">{{ getQuestionCount(exam) }}</span>
                    <button
                      @click="manageQuestions(exam)"
                      class="text-primary hover:text-blue-900 transition-colors duration-150"
                      title="Manage Questions"
                    >
                      <i class="fas fa-cog text-small"></i>
                    </button>
                  </div>
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
                      @click="confirmDeleteExam(exam)"
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

    <!-- Question Management Modal -->
    <div v-if="showQuestionModal" class="modal-overlay" @click="showQuestionModal = false">
      <div class="modal-content large-modal" @click.stop>
        <div class="modal-header">
          <h3>Manage Questions - {{ currentExam?.title }}</h3>
          <button @click="showQuestionModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="mb-4">
            <button
              @click="showAddQuestionForm = !showAddQuestionForm"
              class="btn-primary flex items-center gap-2"
            >
              <i class="fas fa-plus"></i>
              Add Question
            </button>
          </div>
          
          <!-- Add Question Form -->
          <div v-if="showAddQuestionForm" class="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 class="text-lg font-medium mb-3">Add New Question</h4>
            <div class="form-group">
              <label>Select Question</label>
              <select
                v-model="selectedQuestionId"
                class="form-select"
              >
                <option value="">Select a question</option>
                <option v-for="question in availableQuestions" :key="question._id" :value="question._id">
                  {{ question.question }} ({{ question.subjectName || getSubjectName(question.subjectId) }})
                </option>
              </select>
            </div>
            <div class="flex gap-2 mt-3">
              <button
                @click="addQuestionToExam"
                :disabled="!selectedQuestionId"
                class="btn-save"
              >
                Add Question
              </button>
              <button
                @click="showAddQuestionForm = false"
                class="btn-cancel"
              >
                Cancel
              </button>
            </div>
          </div>

          <!-- Current Questions List -->
          <div class="space-y-3">
            <h4 class="text-lg font-medium">Current Questions ({{ examQuestions.length }})</h4>
            <div v-if="examQuestions.length === 0" class="text-gray-500 text-center py-8">
              No questions added to this exam yet.
            </div>
            <div v-for="question in examQuestions" :key="question._id" class="bg-white border rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ question.question }}</p>
                  <p class="text-small text-gray-600 mt-1">Answer: {{ question.answer }}</p>
                  <p class="text-small text-gray-500 mt-1">Subject: {{ question.subjectName || getSubjectName(question.subjectId) }}</p>
                </div>
                <button
                  @click="removeQuestionFromExam(question._id)"
                  class="text-error hover:text-red-900 transition-colors duration-150 ml-4"
                  title="Remove Question"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showQuestionModal = false" class="btn-cancel">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirm Delete</h3>
          <button @click="showDeleteModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete the exam "{{ examToDelete?.title }}"?</p>
          <p class="text-small text-gray-600 mt-2">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-cancel">
            Cancel
          </button>
          <button @click="deleteExam" class="btn-delete">
            Delete Exam
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
import { getAllQAs } from '@/api/QA.js'

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
      questions: [],
      examQuestions: [],
      availableQuestions: [],
      searchQuery: '',
      showCreateExamModal: false,
      showEditExamModal: false,
      showQuestionModal: false,
      showAddQuestionForm: false,
      showDeleteModal: false,
      selectedQuestionId: '',
      currentExam: null,
      examToDelete: null,
      newExam: {
        title: '',
        subjectId: '',
        questions: []
      },
      editingExam: {
        _id: '',
        title: '',
        subjectId: '',
        questions: []
      }
    }
  },
  computed: {
    filteredExams() {
      if (!this.searchQuery) return this.exams || []
      return (this.exams || []).filter(exam => 
        (exam.title || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        this.getSubjectName(exam.subjectId).toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.fetchExams()
    this.fetchSubjects()
    this.fetchQuestions()
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
        this.subjects = []
      }
    },
    async fetchQuestions() {
      try {
        this.questions = await getAllQAs()
      } catch (error) {
        console.error('Error fetching questions:', error)
        this.showWarning('Warning', 'Failed to fetch questions. Question management may be limited.')
        this.questions = []
      }
    },
    getSubjectName(subjectId) {
      const subject = this.subjects.find(s => s._id === subjectId)
      return subject ? subject.name : 'Unknown'
    },
    getQuestionCount(exam) {
      return exam.questions ? exam.questions.length : 0
    },
    async createExam() {
      try {
        await createExam(this.newExam)
        await this.fetchExams()
        this.showCreateExamModal = false
        this.newExam = { 
          title: '',
          subjectId: '',
          questions: []
        }
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
        this.editingExam = { 
          _id: '', 
          title: '', 
          subjectId: '',
          questions: []
        }
        this.showSuccess('Success', 'Exam updated successfully!')
      } catch (error) {
        console.error('Error updating exam:', error)
        this.showError('Error', 'Failed to update exam. Please try again.')
      }
    },
    confirmDeleteExam(exam) {
      this.examToDelete = exam
      this.showDeleteModal = true
    },
    async deleteExam() {
      try {
        await deleteExam(this.examToDelete._id)
        await this.fetchExams()
        this.showDeleteModal = false
        this.examToDelete = null
        this.showSuccess('Success', 'Exam deleted successfully!')
      } catch (error) {
        console.error('Error deleting exam:', error)
        this.showError('Error', 'Failed to delete exam. Please try again.')
      }
    },
    async manageQuestions(exam) {
      this.currentExam = exam
      this.examQuestions = exam.questions || []
      
      // Filter available questions (exclude already added ones)
      this.availableQuestions = this.questions.filter(q => 
        !this.examQuestions.some(eq => eq._id === q._id)
      )
      
      this.showQuestionModal = true
      this.showAddQuestionForm = false
      this.selectedQuestionId = ''
    },
    async addQuestionToExam() {
      if (!this.selectedQuestionId) return
      
      try {
        const question = this.questions.find(q => q._id === this.selectedQuestionId)
        if (!question) return
        
        // Add question to current exam's questions array
        const updatedQuestions = [...this.examQuestions, question]
        
        // Update the exam with new questions
        await updateExam(this.currentExam._id, {
          ...this.currentExam,
          questions: updatedQuestions.map(q => q._id)
        })
        
        // Update local state
        this.examQuestions = updatedQuestions
        this.availableQuestions = this.availableQuestions.filter(q => q._id !== this.selectedQuestionId)
        this.selectedQuestionId = ''
        this.showAddQuestionForm = false
        
        // Refresh exams list
        await this.fetchExams()
        
        this.showSuccess('Success', 'Question added to exam successfully!')
      } catch (error) {
        console.error('Error adding question to exam:', error)
        this.showError('Error', 'Failed to add question to exam. Please try again.')
      }
    },
    async removeQuestionFromExam(questionId) {
      try {
        // Remove question from current exam's questions array
        const updatedQuestions = this.examQuestions.filter(q => q._id !== questionId)
        
        // Update the exam with new questions
        await updateExam(this.currentExam._id, {
          ...this.currentExam,
          questions: updatedQuestions.map(q => q._id)
        })
        
        // Update local state
        const removedQuestion = this.examQuestions.find(q => q._id === questionId)
        this.examQuestions = updatedQuestions
        if (removedQuestion) {
          this.availableQuestions.push(removedQuestion)
        }
        
        // Refresh exams list
        await this.fetchExams()
        
        this.showSuccess('Success', 'Question removed from exam successfully!')
      } catch (error) {
        console.error('Error removing question from exam:', error)
        this.showError('Error', 'Failed to remove question from exam. Please try again.')
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

.large-modal {
  max-width: 800px;
  width: 90vw;
}

.btn-delete {
  @apply bg-error text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-150;
}
</style>