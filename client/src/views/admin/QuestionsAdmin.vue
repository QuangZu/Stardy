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
          <p class="text-body text-gray-600 mt-1">Create and manage questions for exams</p>
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
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-small font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="question in filteredQuestions" :key="question._id" class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <i class="fas fa-question-circle text-primary"></i>
                    </div>
                    <div>
                      <div class="text-body font-medium text-gray-900">{{ question.question.substring(0, 50) }}...</div>
                      <div class="text-small text-gray-500">ID: {{ question._id.slice(-6) }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-body text-gray-900">{{ getSubjectName(question.subjectId) }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-small font-semibold rounded-full bg-blue-100 text-blue-800">
                    Level {{ question.levelId }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="inline-flex px-2 py-1 text-small font-semibold rounded-full bg-gray-100 text-gray-800">
                    {{ question.type }}
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
                      @click="deleteQuestion(question._id)"
                      class="text-error hover:text-red-900 transition-colors duration-150"
                      title="Delete Question"
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

    <!-- Create Question Modal -->
    <div v-if="showCreateQuestionModal" class="modal-overlay" @click="showCreateQuestionModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Create New Question</h3>
          <button @click="showCreateQuestionModal = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="createQuestion">
            <div class="form-group">
              <label>Question</label>
              <textarea
                v-model="newQuestion.question"
                rows="3"
                required
                class="form-textarea"
                placeholder="Enter the question text"
              ></textarea>
            </div>
            <div class="form-group">
              <label>Subject</label>
              <select
                v-model="newQuestion.subjectId"
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
              <label>Level</label>
              <input
                v-model="newQuestion.levelId"
                type="number"
                min="1"
                required
                class="form-input"
                placeholder="Enter difficulty level"
              >
            </div>
            <div class="form-group">
              <label>Type</label>
              <select v-model="newQuestion.type" class="form-select">
                <option value="multiple-choice">Multiple Choice</option>
                <option value="true-false">True/False</option>
                <option value="short-answer">Short Answer</option>
              </select>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" @click="showCreateQuestionModal = false" class="btn-cancel">
            Cancel
          </button>
          <button type="submit" @click="createQuestion" class="btn-save">
            Create Question
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
import { getAllQAs, createQA, deleteQA } from '@/api/QA.js'
import { getAllSubjects } from '@/api/Subject.js'

export default {
  name: 'QuestionsAdmin',
  components: {
    AdminSidebar,
    AdminHeader
  },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user') || '{}'),
      questions: [],
      subjects: [],
      searchQuery: '',
      showCreateQuestionModal: false,
      newQuestion: {
        question: '',
        subjectId: '',
        levelId: 1,
        type: 'multiple-choice'
      }
    }
  },
  computed: {
    filteredQuestions() {
      if (!this.searchQuery) return this.questions
      return this.questions.filter(question => 
        question.question.toLowerCase().includes(this.searchQuery.toLowerCase())
      )
    }
  },
  mounted() {
    this.fetchQuestions()
    this.fetchSubjects()
  },
  methods: {
    async fetchQuestions() {
      try {
        this.questions = await getAllQAs()
      } catch (error) {
        console.error('Error fetching questions:', error)
      }
    },
    async fetchSubjects() {
      try {
        this.subjects = await getAllSubjects()
      } catch (error) {
        console.error('Error fetching subjects:', error)
      }
    },
    getSubjectName(subjectId) {
      const subject = this.subjects.find(s => s._id === subjectId)
      return subject ? subject.name : 'Unknown'
    },
    async createQuestion() {
      try {
        await createQA(this.newQuestion)
        await this.fetchQuestions()
        this.showCreateQuestionModal = false
        this.newQuestion = { question: '', subjectId: '', levelId: 1, type: 'multiple-choice' }
      } catch (error) {
        console.error('Error creating question:', error)
      }
    },
    editQuestion(question) {
      console.log('Edit question:', question)
    },
    async deleteQuestion(questionId) {
      if (confirm('Are you sure you want to delete this question?')) {
        try {
          await deleteQA(questionId)
          await this.fetchQuestions()
        } catch (error) {
          console.error('Error deleting question:', error)
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