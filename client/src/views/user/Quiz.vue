<template>
  <div class="quiz-container">

    <!-- Loading State -->
    <div v-if="loading" class="loading-container h-screen w-screen">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading quiz...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="goBack" class="retry-btn">Go Back</button>
    </div>

    <!-- Main Quiz Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar
        :userName="userName"
        :userLevel="userLevel"
        currentPage="learning"
        @logout="logout"
      />

      <!-- Quiz Layout -->
      <div class="quiz-layout">
        <!-- Left Sidebar - Quiz Topics -->
        <div class="quiz-topics-sidebar">
          <div class="topics-header">
            <h3><i class="fas fa-list"></i> Quiz Topics</h3>
          </div>

          <div class="topics-list">
            <div class="topic-item add-topic">
              <i class="fas fa-plus"></i>
              <span>Add Topic</span>
              <span class="topic-count">Question 1/5</span>
            </div>

            <div
              v-for="(question, index) in quiz.questions"
              :key="index"
              class="topic-item"
              :class="{
                active: index === currentQuestionIndex,
                answered: userAnswers[index] !== undefined,
                correct: userAnswers[index] !== undefined && userAnswers[index] === question.correctAnswer,
                incorrect: userAnswers[index] !== undefined && userAnswers[index] !== question.correctAnswer
              }"
              @click="goToQuestion(index)"
            >
              <div class="topic-icon">
                <i v-if="userAnswers[index] === undefined" class="fas fa-circle"></i>
                <i v-else-if="userAnswers[index] === question.correctAnswer" class="fas fa-check-circle"></i>
                <i v-else class="fas fa-times-circle"></i>
              </div>
              <div class="topic-content">
                <span class="topic-title">{{ question.question.substring(0, 30) }}...</span>
                <div class="topic-status">
                  <span v-if="userAnswers[index] === undefined" class="status-pending">Not answered</span>
                  <span v-else-if="userAnswers[index] === question.correctAnswer" class="status-correct">✓</span>
                  <span v-else class="status-incorrect">✗</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Quiz Content -->
        <div class="quiz-main-content">
          <!-- Quiz Header -->
          <div class="quiz-header">
            <div class="quiz-title">
              <h1>{{ quiz.title }}</h1>
              <div class="question-indicator">
                <span class="question-number">{{ currentQuestionIndex + 1 }}</span>
                <span class="question-total">/ {{ totalQuestions }}</span>
                <button class="show-text-btn">Show text</button>
              </div>
            </div>
          </div>



          <!-- Question Content -->
          <div class="question-content">
            <div class="question-text">
              <p>{{ currentQuestion.question }}</p>
            </div>

            <div class="answer-options">
              <div
                v-for="(option, index) in currentQuestion.options"
                :key="index"
                class="option-item"
                :class="{ selected: userAnswers[currentQuestionIndex] === index }"
                @click="selectAnswer(index)"
              >
                <div class="option-indicator">{{ String.fromCharCode(65 + index) }}</div>
                <span class="option-text">{{ option }}</span>
              </div>
            </div>

            <!-- AI Help Section -->
            <div class="ai-help-section">
              <button @click="toggleAIHelp" class="ai-help-btn">
                <i class="fas fa-robot"></i>
                Ask AI for help
              </button>

              <!-- AI Chat Interface -->
              <div v-if="showAIHelp" class="ai-chat-interface">
                <div class="chat-messages">
                  <div
                    v-for="(message, index) in chatMessages"
                    :key="index"
                    class="chat-message"
                    :class="message.type"
                  >
                    <div class="message-content">{{ message.content }}</div>
                  </div>
                </div>

                <div class="chat-input-container">
                  <input
                    v-model="chatInput"
                    @keyup.enter="sendMessage"
                    placeholder="Ask AI about this question..."
                    class="chat-input"
                    :disabled="chatLoading"
                  />
                  <button @click="sendMessage" class="send-btn" :disabled="!chatInput.trim() || chatLoading">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation -->
          <div class="quiz-navigation">
            <button
              @click="previousQuestion"
              :disabled="currentQuestionIndex === 0"
              class="nav-btn prev-btn"
            >
              <i class="fas fa-chevron-left"></i> Previous
            </button>

            <button
              @click="nextQuestion"
              :disabled="currentQuestionIndex === totalQuestions - 1"
              class="nav-btn next-btn"
            >
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>



<script>
import { getAccount, getUserIdFromToken } from '@/api/Account';
import { getQuiz, submitQuizAnswers } from '@/api/Quiz';
import { chatWithAI } from '@/api/AI';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'Quiz',
  components: {
    Sidebar
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
      userName: 'Loading...',
      userLevel: 1,
      userId: null,
      loading: true,
      error: null,
      
      // Quiz data
      quiz: {
        title: '',
        description: '',
        questions: [],
        timeLimit: 30,
        difficulty: 'medium'
      },
      
      // Quiz state
      currentQuestionIndex: 0,
      userAnswers: {},
      
      // Results
      results: null,
      
      // UI state
      showSubmitConfirm: false,

      // AI Chat
      showAIHelp: false,
      chatMessages: [],
      chatInput: '',
      chatLoading: false
    }
  },
  computed: {
    currentQuestion() {
      return (this.quiz.questions && this.quiz.questions[this.currentQuestionIndex]) || {};
    },

    answeredCount() {
      return Object.keys(this.userAnswers).length;
    },

    totalQuestions() {
      return (this.quiz.questions && this.quiz.questions.length) || 0;
    }
  },
  async mounted() {
    await this.loadQuizData();
  },

  methods: {
    async loadQuizData() {
      try {
        this.loading = true;
        this.error = null;
        
        // Load user data
        const userId = await getUserIdFromToken();
        if (userId) {
          this.userId = userId;
          const userData = await getAccount(userId);
          this.userName = userData.username;
          this.userLevel = userData.currentLevel || 1;
        }
        
        // Load quiz data
        const quizId = this.$route.params.id;
        if (!quizId) {
          throw new Error('Quiz ID is required');
        }
        
        const quizData = await getQuiz(quizId);
        this.quiz = quizData;
        this.timeRemaining = this.quiz.timeLimit * 60; // Convert to seconds
        
      } catch (error) {
        console.error('Error loading quiz:', error);
        this.error = 'Failed to load quiz';
      } finally {
        this.loading = false;
      }
    },



    selectAnswer(optionIndex) {
      this.userAnswers[this.currentQuestionIndex] = optionIndex;
    },

    nextQuestion() {
      if (this.currentQuestionIndex < this.totalQuestions - 1) {
        this.currentQuestionIndex++;
      }
    },

    previousQuestion() {
      if (this.currentQuestionIndex > 0) {
        this.currentQuestionIndex--;
      }
    },

    async submitQuiz() {
      try {
        const answers = Object.values(this.userAnswers);

        this.results = await submitQuizAnswers(
          this.quiz._id,
          answers,
          this.userId,
          0 // No time tracking
        );

        this.quizCompleted = true;

        if (this.results.passed) {
          this.showSuccess(`Congratulations! You scored ${this.results.score}%`);
        } else {
          this.showInfo(`You scored ${this.results.score}%. Keep studying and try again!`);
        }

      } catch (error) {
        console.error('Error submitting quiz:', error);
        this.showError('Failed to submit quiz. Please try again.');
      }
    },

    reviewAnswers() {
      // Implementation for reviewing answers
      this.showInfo('Review functionality coming soon!');
    },

    retakeQuiz() {
      // Reset quiz state
      this.currentQuestionIndex = 0;
      this.userAnswers = {};
      this.results = null;
      this.showAIHelp = false;
      this.chatMessages = [];
    },

    goToLearning() {
      this.$router.push('/learning');
    },

    goBack() {
      this.$router.go(-1);
    },

    goToQuestion(index) {
      this.currentQuestionIndex = index;
    },

    // AI Chat methods
    toggleAIHelp() {
      this.showAIHelp = !this.showAIHelp;
      if (this.showAIHelp && this.chatMessages.length === 0) {
        // Add welcome message
        this.chatMessages.push({
          type: 'ai',
          content: 'Hi! I\'m here to help you with this quiz question. Feel free to ask me anything about the topic or if you need clarification on the question.'
        });
      }
    },

    async sendMessage() {
      if (!this.chatInput.trim() || this.chatLoading) return;

      const userMessage = this.chatInput.trim();
      this.chatInput = '';

      // Add user message
      this.chatMessages.push({
        type: 'user',
        content: userMessage
      });

      this.chatLoading = true;

      try {
        // Create context from current question
        const context = `Quiz Question: ${this.currentQuestion.question}\nOptions: ${this.currentQuestion.options.join(', ')}`;
        const prompt = `Based on this quiz question:\n\n${context}\n\nUser question: ${userMessage}\n\nPlease provide a helpful answer that guides the user without directly giving away the answer.`;

        const response = await chatWithAI(prompt);
        const responseContent = response || 'No response received from AI service.';

        // Add AI response
        this.chatMessages.push({
          type: 'ai',
          content: responseContent
        });

      } catch (error) {
        console.error('Chat error:', error);
        this.chatMessages.push({
          type: 'ai',
          content: 'Sorry, I encountered an error. Please try again.'
        });
      } finally {
        this.chatLoading = false;
      }
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.quiz-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  color: #ffffff;
  display: flex;
}

/* Quiz Layout */
.quiz-layout {
  display: flex;
  width: 100%;
  margin-left: 250px; /* Account for sidebar */
  min-height: 100vh;
}

/* Quiz Topics Sidebar */
.quiz-topics-sidebar {
  width: 300px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
  overflow-y: auto;
}

.topics-header {
  margin-bottom: 20px;
}

.topics-header h3 {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.topics-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.topic-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
}

.topic-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(138, 43, 226, 0.5);
  transform: translateY(-2px);
}

.topic-item.active {
  background: rgba(138, 43, 226, 0.2);
  border-color: #8a2be2;
}

.topic-item.correct {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.topic-item.incorrect {
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.topic-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.topic-icon .fa-circle {
  color: #6b7280;
}

.topic-icon .fa-check-circle {
  color: #4ade80;
}

.topic-icon .fa-times-circle {
  color: #f87171;
}

.topic-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.topic-title {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.topic-status {
  font-size: 12px;
}

.status-pending {
  color: #9ca3af;
}

.status-correct {
  color: #4ade80;
  font-weight: 600;
}

.status-incorrect {
  color: #f87171;
  font-weight: 600;
}

.add-topic {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  background: transparent;
  justify-content: center;
  color: #9ca3af;
}

.topic-count {
  font-size: 12px;
  color: #9ca3af;
}
/* Main Quiz Content */
.quiz-main-content {
  flex: 1;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.quiz-header {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 30px;
}

.quiz-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.quiz-title h1 {
  color: #ffffff;
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.question-indicator {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-number {
  background: linear-gradient(135deg, #8a2be2, #9d4edd);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 16px;
}

.question-total {
  color: #9ca3af;
  font-size: 16px;
}

.show-text-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.show-text-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Question Content */
.question-content {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 30px;
  margin-bottom: 30px;
}

.question-text {
  margin-bottom: 30px;
}

.question-text p {
  font-size: 18px;
  line-height: 1.6;
  color: #ffffff;
  margin: 0;
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 30px;
}

.option-item {
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.option-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(138, 43, 226, 0.5);
  transform: translateY(-2px);
}

.option-item.selected {
  background: rgba(138, 43, 226, 0.2);
  border-color: #8a2be2;
}

.option-indicator {
  background: linear-gradient(135deg, #8a2be2, #9d4edd);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
}

.option-text {
  font-size: 16px;
  color: #ffffff;
  line-height: 1.5;
}

/* AI Help Section */
.ai-help-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.ai-help-btn {
  background: linear-gradient(135deg, #8a2be2, #9d4edd);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.ai-help-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
}

.ai-chat-interface {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
}

.chat-messages {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-message {
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
}

.chat-message.user {
  background: rgba(138, 43, 226, 0.2);
  border: 1px solid rgba(138, 43, 226, 0.3);
  align-self: flex-end;
  margin-left: auto;
}

.chat-message.ai {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  align-self: flex-start;
}

.message-content {
  color: #ffffff;
  font-size: 14px;
  line-height: 1.5;
}

.chat-input-container {
  display: flex;
  gap: 10px;
}

.chat-input {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 12px 16px;
  color: #ffffff;
  font-size: 14px;
}

.chat-input::placeholder {
  color: #9ca3af;
}

.send-btn {
  background: linear-gradient(135deg, #8a2be2, #9d4edd);
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading and Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
  z-index: 10;
  position: relative;
}

.loading-spinner {
  font-size: 3rem;
  color: #8a2be2;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 1rem;
}

.retry-btn {
  background: linear-gradient(135deg, #8a2be2, #9d4edd);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
}

/* Navigation */
.quiz-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
}

.nav-btn {
  background: linear-gradient(135deg, #8a2be2, #9d4edd);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(138, 43, 226, 0.3);
}

.nav-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: #6b7280;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.prev-btn {
  margin-right: auto;
}

.next-btn {
  margin-left: auto;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .quiz-layout {
    flex-direction: column;
    margin-left: 0;
  }

  .quiz-topics-sidebar {
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
  }

  .quiz-main-content {
    padding: 15px;
  }
}

@media (max-width: 768px) {
  .quiz-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .question-indicator {
    flex-wrap: wrap;
  }

  .option-item {
    padding: 15px;
  }

  .quiz-navigation {
    flex-direction: column;
    gap: 15px;
  }

  .nav-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
