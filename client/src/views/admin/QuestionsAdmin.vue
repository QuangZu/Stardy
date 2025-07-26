<template>
  <div class="admin-page">
    <!-- Sidebar -->
    <AdminSidebar />
    
    <!-- Header -->
    <AdminHeader 
      title="Questions" 
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
            <h1 class="text-section-header text-gray-900">Question Management</h1>
            <p class="text-body text-gray-600 mt-1">Create and manage questions</p>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search questions..."
                class="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-body"
              >
              <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <button
              @click="showCreateQuestionModal = true"
              class="btn-primary flex items-center gap-2"
            >
              <i class="fas fa-plus"></i>
              Add Question
            </button>
          </div>
        </div>

        <!-- Questions Table -->
        <div class="chart-container overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Question</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Exam</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="question in filteredQuestions" :key="question._id" class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-small text-gray-500 font-mono">{{ question._id ? question._id.slice(-6) : 'N/A' }}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="flex items-center">
                      <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                        <i class="fas fa-question text-purple-600"></i>
                      </div>
                      <div class="max-w-xs">
                        <div class="text-body font-medium text-gray-900 truncate" :title="question.question">
                          {{ question.question || 'N/A' }}
                        </div>
                        <div class="text-small text-gray-500 truncate" :title="question.answer">
                          Answer: {{ question.answer || 'N/A' }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {{ question.subjectName || getSubjectName(question.subjectId) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span v-if="question.examId" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {{ getExamName(question.examId) }}
                    </span>
                    <span v-else class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      No Exam
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-body text-gray-900">{{ formatDate(question.createdAt) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-body font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="editQuestion(question)"
                        class="text-primary hover:text-blue-900 transition-colors duration-150"
                        title="Edit Question"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="confirmDeleteQuestion(question._id)"
                        class="text-error hover:text-red-900 transition-colors duration-150"
                        title="Delete Question"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredQuestions.length === 0">
                  <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center py-8">
                      <i class="fas fa-question-circle text-gray-300 text-4xl mb-4"></i>
                      <p class="text-body text-gray-500">No questions found</p>
                      <p class="text-small text-gray-400">Create a new question to get started</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- Create Question Modal -->
    <div v-if="showCreateQuestionModal" class="modal-overlay" @click="showCreateQuestionModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Question</h3>
          <button @click="showCreateQuestionModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createQuestion">
            <div class="form-group">
              <label for="questionText">Question</label>
              <textarea
                id="questionText"
                v-model="newQuestion.question"
                class="form-textarea"
                placeholder="Enter question text"
                rows="3"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="answerText">Answer</label>
              <textarea
                id="answerText"
                v-model="newQuestion.answer"
                class="form-textarea"
                placeholder="Enter answer text"
                rows="3"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="questionSubject">Subject</label>
              <select
                id="questionSubject"
                v-model="newQuestion.subjectId"
                class="form-input"
                required
              >
                <option value="" disabled>Select a subject</option>
                <option v-for="subject in subjects" :key="subject._id" :value="subject._id">
                  {{ subject.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="questionExam">Exam (Optional)</label>
              <select
                id="questionExam"
                v-model="newQuestion.examId"
                class="form-input"
              >
                <option value="">No Exam</option>
                <option v-for="exam in exams" :key="exam._id" :value="exam._id">
                  {{ exam.title }}
                </option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showCreateQuestionModal = false" class="btn-secondary">Cancel</button>
          <button @click="createQuestion" class="btn-primary" :disabled="isLoading">Create Question</button>
        </div>
      </div>
    </div>

    <!-- Edit Question Modal -->
    <div v-if="showEditQuestionModal" class="modal-overlay" @click="showEditQuestionModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Edit Question</h3>
          <button @click="showEditQuestionModal = false" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateQuestion">
            <div class="form-group">
              <label for="editQuestionText">Question</label>
              <textarea
                id="editQuestionText"
                v-model="editingQuestion.question"
                class="form-textarea"
                placeholder="Enter question text"
                rows="3"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="editAnswerText">Answer</label>
              <textarea
                id="editAnswerText"
                v-model="editingQuestion.answer"
                class="form-textarea"
                placeholder="Enter answer text"
                rows="3"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <label for="editQuestionSubject">Subject</label>
              <select
                id="editQuestionSubject"
                v-model="editingQuestion.subjectId"
                class="form-input"
                required
              >
                <option value="" disabled>Select a subject</option>
                <option v-for="subject in subjects" :key="subject._id" :value="subject._id">
                  {{ subject.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="editQuestionExam">Exam (Optional)</label>
              <select
                id="editQuestionExam"
                v-model="editingQuestion.examId"
                class="form-input"
              >
                <option value="">No Exam</option>
                <option v-for="exam in exams" :key="exam._id" :value="exam._id">
                  {{ exam.title }}
                </option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button @click="showEditQuestionModal = false" class="btn-secondary">Cancel</button>
          <button @click="updateQuestion" class="btn-primary" :disabled="isLoading">Update Question</button>
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
            <p class="text-body text-gray-700 mb-4">Are you sure you want to delete this question?</p>
            <p class="text-small text-error">This action cannot be undone.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showDeleteModal = false" class="btn-secondary">Cancel</button>
          <button @click="deleteQuestion" class="btn-primary bg-error hover:bg-red-700" :disabled="isLoading">Delete Question</button>
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
  getAllQAs, 
  createQA, 
  updateQA, 
  deleteQA 
} from '@/api/QA.js'
import { getAllSubjects } from '@/api/Subject.js'
import { getAllExams } from '@/api/Exam.js'

export default {
  name: 'QuestionsAdmin',
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
      questions: [],
      subjects: [],
      searchQuery: '',
      isLoading: false,
      showCreateQuestionModal: false,
      showEditQuestionModal: false,
      showDeleteModal: false,
      questionToDeleteId: null,
      newQuestion: {
        question: '',
        answer: '',
        subjectId: '',
        examId: ''
      },
      editingQuestion: {
        _id: '',
        question: '',
        answer: '',
        subjectId: '',
        examId: ''
      }
    }
  },
  computed: {
    filteredQuestions() {
      if (!this.searchQuery) return this.questions || []
      return (this.questions || []).filter(question => 
        (question.question || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (question.answer || '').toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (question.subjectName || this.getSubjectName(question.subjectId)).toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        this.getExamName(question.examId).toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.fetchQuestions()
    this.fetchSubjects()
    this.fetchExams()
  },
  methods: {
    async fetchQuestions() {
      try {
        this.isLoading = true
        const response = await getAllQAs()
        this.questions = Array.isArray(response) ? response : (response.data || [])
      } catch (error) {
        console.error('Error fetching questions:', error)
        this.showError('Error', 'Failed to fetch questions. Please try again.')
        this.questions = []
      } finally {
        this.isLoading = false
      }
    },
    async fetchSubjects() {
      try {
        const response = await getAllSubjects()
        this.subjects = Array.isArray(response) ? response : (response.data || [])
      } catch (error) {
        console.error('Error fetching subjects:', error)
        this.showWarning('Warning', 'Failed to fetch subjects. Some features may be limited.')
        this.subjects = []
      }
    },
    async fetchExams() {
      try {
        const response = await getAllExams()
        this.exams = Array.isArray(response) ? response : (response.data || [])
      } catch (error) {
        console.error('Error fetching exams:', error)
        this.showWarning('Warning', 'Failed to fetch exams. Some features may be limited.')
        this.exams = []
      }
    },
    getSubjectName(subjectId) {
      if (!subjectId) return 'No Subject'
      const subject = this.subjects.find(s => s._id === subjectId)
      return subject ? subject.name : 'Unknown Subject'
    },
    async createQuestion() {
      try {
        this.isLoading = true
        await createQA(this.newQuestion)
        await this.fetchQuestions()
        this.showCreateQuestionModal = false
        this.newQuestion = { question: '', answer: '', subjectId: '' }
        this.showSuccess('Success', 'Question created successfully!')
      } catch (error) {
        console.error('Error creating question:', error)
        this.showError('Error', 'Failed to create question. Please try again.')
      } finally {
        this.isLoading = false
      }
    },
    editQuestion(question) {
      this.editingQuestion = { ...question }
      this.showEditQuestionModal = true
    },
    async updateQuestion() {
      try {
        this.isLoading = true
        await updateQA(this.editingQuestion._id, this.editingQuestion)
        await this.fetchQuestions()
        this.showEditQuestionModal = false
        this.showSuccess('Success', 'Question updated successfully!')
      } catch (error) {
        console.error('Error updating question:', error)
        this.showError('Error', 'Failed to update question. Please try again.')
      } finally {
        this.isLoading = false
      }
    },
    confirmDeleteQuestion(questionId) {
      this.questionToDeleteId = questionId
      this.showDeleteModal = true
    },
    async deleteQuestion() {
      try {
        this.isLoading = true
        await deleteQA(this.questionToDeleteId)
        await this.fetchQuestions()
        this.showDeleteModal = false
        this.questionToDeleteId = null
        this.showSuccess('Success', 'Question deleted successfully!')
      } catch (error) {
        console.error('Error deleting question:', error)
        this.showError('Error', 'Failed to delete question. Please try again.')
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
