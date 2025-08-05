<template>
  <div class="learning-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i"
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container h-screen w-screen">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading your learning materials...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadLearningData" class="retry-btn">Try Again</button>
    </div>

    <!-- Main Learning Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar
        :userName="userName"
        :userLevel="userLevel"
        currentPage="learning"
        @logout="logout"
      />

      <!-- Main Content -->
      <div class="main-content">
        <!-- Header -->
        <header class="learning-header">
          <div class="header-content">
            <h1>Learning Hub</h1>
            <p>Your AI-generated quizzes and flashcards</p>
          </div>
        </header>

        <!-- Tab Navigation -->
        <div class="tab-navigation">
          <button
            @click="activeTab = 'quizzes'"
            :class="['tab-btn', { active: activeTab === 'quizzes' }]"
          >
            <i class="fas fa-question-circle"></i>
            <span>Quizzes</span>
            <span class="count">{{ userQuizzes.length }}</span>
          </button>
          <button
            @click="activeTab = 'flashcards'"
            :class="['tab-btn', { active: activeTab === 'flashcards' }]"
          >
            <i class="fas fa-layer-group"></i>
            <span>Flashcards</span>
            <span class="count">{{ userFlashcardSets.length }}</span>
          </button>
        </div>

        <!-- Quizzes Tab -->
        <div v-if="activeTab === 'quizzes'" class="tab-content">
          <div class="section-header">
            <h2><i class="fas fa-question-circle"></i> Your Quizzes</h2>
            <div class="header-actions">
              <button @click="refreshQuizzes" class="refresh-btn" :disabled="loadingQuizzes">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingQuizzes }"></i>
                {{ loadingQuizzes ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>

          <div v-if="userQuizzes.length === 0" class="no-content">
            <div class="no-content-icon">
              <i class="fas fa-question-circle"></i>
            </div>
            <h3>No quizzes yet</h3>
            <p>Generate quizzes from your notes to test your knowledge!</p>
            <router-link to="/dashboard" class="create-content-btn">
              <i class="fas fa-plus"></i> Go to Notes
            </router-link>
          </div>

          <div v-else class="content-grid">
            <div
              v-for="quiz in userQuizzes"
              :key="quiz._id"
              class="content-card quiz-card"
              @click="takeQuiz(quiz._id)"
            >
              <div class="card-header">
                <div class="card-icon quiz-icon">
                  <i class="fas fa-question-circle"></i>
                </div>
                <div class="card-actions">
                  <button @click.stop="showQuizMenu(quiz)" class="action-btn">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
              <div class="card-content">
                <h3>{{ quiz.title }}</h3>
                <p>{{ quiz.description }}</p>
                <div class="card-meta">
                  <span class="meta-item">
                    <i class="fas fa-list"></i>
                    {{ (quiz.questions && quiz.questions.length) || 0 }} Questions
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-clock"></i>
                    {{ quiz.timeLimit || 'N/A' }} min
                  </span>
                  <span class="meta-item difficulty" :class="quiz.difficulty || 'medium'">
                    <i class="fas fa-signal"></i>
                    {{ quiz.difficulty || 'Medium' }}
                  </span>
                </div>
                <div class="card-stats" v-if="quiz.totalAttempts && quiz.totalAttempts > 0">
                  <span class="stat-item">
                    <i class="fas fa-chart-line"></i>
                    Avg Score: {{ quiz.averageScore || 0 }}%
                  </span>
                  <span class="stat-item">
                    <i class="fas fa-redo"></i>
                    {{ quiz.totalAttempts || 0 }} attempts
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <span class="created-date">
                  Created {{ formatDate(quiz.createdAt) }}
                </span>
                <button @click.stop="takeQuiz(quiz._id)" class="take-quiz-btn">
                  <i class="fas fa-play"></i> Take Quiz
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Flashcards Tab -->
        <div v-if="activeTab === 'flashcards'" class="tab-content">
          <div class="section-header">
            <h2><i class="fas fa-layer-group"></i> Your Flashcard Sets</h2>
            <div class="header-actions">
              <button @click="refreshFlashcards" class="refresh-btn" :disabled="loadingFlashcards">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingFlashcards }"></i>
                {{ loadingFlashcards ? 'Loading...' : 'Refresh' }}
              </button>
            </div>
          </div>

          <div v-if="userFlashcardSets.length === 0" class="no-content">
            <div class="no-content-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <h3>No flashcard sets yet</h3>
            <p>Generate flashcards from your notes to enhance your learning!</p>
            <router-link to="/dashboard" class="create-content-btn">
              <i class="fas fa-plus"></i> Go to Notes
            </router-link>
          </div>

          <div v-else class="content-grid">
            <div
              v-for="flashcardSet in userFlashcardSets"
              :key="flashcardSet._id"
              class="content-card flashcard-card"
              @click="studyFlashcards(flashcardSet._id)"
            >
              <div class="card-header">
                <div class="card-icon flashcard-icon">
                  <i class="fas fa-layer-group"></i>
                </div>
                <div class="card-actions">
                  <button @click.stop="showFlashcardMenu(flashcardSet)" class="action-btn">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
              <div class="card-content">
                <h3>{{ flashcardSet.title }}</h3>
                <p>{{ flashcardSet.description }}</p>
                <div class="card-meta">
                  <span class="meta-item">
                    <i class="fas fa-clone"></i>
                    {{ (flashcardSet.cards && flashcardSet.cards.length) || 0 }} Cards
                  </span>
                  <span class="meta-item">
                    <i class="fas fa-tag"></i>
                    {{ flashcardSet.category || 'Uncategorized' }}
                  </span>
                </div>
                <div class="card-stats" v-if="flashcardSet.totalStudySessions && flashcardSet.totalStudySessions > 0">
                  <span class="stat-item">
                    <i class="fas fa-clock"></i>
                    Avg Time: {{ flashcardSet.averageSessionTime || 0 }}m
                  </span>
                  <span class="stat-item">
                    <i class="fas fa-book-open"></i>
                    {{ flashcardSet.totalStudySessions || 0 }} sessions
                  </span>
                </div>
              </div>
              <div class="card-footer">
                <span class="created-date">
                  Created {{ formatDate(flashcardSet.createdAt) }}
                </span>
                <button @click.stop="studyFlashcards(flashcardSet._id)" class="study-btn">
                  <i class="fas fa-play"></i> Study
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Menus -->
        <div v-if="showQuizActions" class="action-menu-overlay" @click="showQuizActions = false">
          <div class="action-menu" @click.stop>
            <div class="menu-header">
              <h3>{{ selectedQuiz?.title }}</h3>
              <button @click="showQuizActions = false" class="close-menu-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="menu-actions">
              <button @click="takeQuiz(selectedQuiz?._id)" class="menu-action-btn">
                <i class="fas fa-play"></i> Take Quiz
              </button>
              <button @click="editQuiz(selectedQuiz)" class="menu-action-btn">
                <i class="fas fa-edit"></i> Edit Quiz
              </button>
              <button @click="deleteQuiz(selectedQuiz)" class="menu-action-btn delete">
                <i class="fas fa-trash"></i> Delete Quiz
              </button>
            </div>
          </div>
        </div>

        <div v-if="showFlashcardActions" class="action-menu-overlay" @click="showFlashcardActions = false">
          <div class="action-menu" @click.stop>
            <div class="menu-header">
              <h3>{{ selectedFlashcardSet?.title }}</h3>
              <button @click="showFlashcardActions = false" class="close-menu-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="menu-actions">
              <button @click="studyFlashcards(selectedFlashcardSet?._id)" class="menu-action-btn">
                <i class="fas fa-play"></i> Study Cards
              </button>
              <button @click="editFlashcardSet(selectedFlashcardSet)" class="menu-action-btn">
                <i class="fas fa-edit"></i> Edit Set
              </button>
              <button @click="deleteFlashcardSet(selectedFlashcardSet)" class="menu-action-btn delete">
                <i class="fas fa-trash"></i> Delete Set
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { getAccount } from '@/api/Account';
import { getUserQuizzes, deleteQuiz as deleteQuizAPI } from '@/api/Quiz';
import { getUserFlashcardSets, deleteFlashcardSet as deleteFlashcardSetAPI } from '@/api/Flashcard';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'Learning',
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

      // Tab management
      activeTab: 'quizzes',

      // Loading states
      loadingQuizzes: false,
      loadingFlashcards: false,

      // Data
      userQuizzes: [],
      userFlashcardSets: [],

      // Action menus
      showQuizActions: false,
      showFlashcardActions: false,
      selectedQuiz: null,
      selectedFlashcardSet: null
    }
  },

  async mounted() {
    await this.loadLearningData();
  },
  methods: {
    async loadLearningData() {
      try {
        this.loading = true;
        this.error = null;

        // Load user data
        const userId = this.getUserIdFromToken();
        if (userId) {
          this.userId = userId;
          const userData = await getAccount(userId);
          this.userName = userData.username;
          this.userLevel = userData.currentLevel || 1;

          // Load quizzes and flashcards
          await Promise.all([
            this.loadUserQuizzes(),
            this.loadUserFlashcards()
          ]);

          // Check for new items from route query
          this.checkForNewItems();
        }

      } catch (error) {
        console.error('Error loading learning data:', error);
        this.error = 'Failed to load learning data';
      } finally {
        this.loading = false;
      }
    },

    async loadUserQuizzes() {
      try {
        this.loadingQuizzes = true;
        const quizzes = await getUserQuizzes(this.userId);

        // Ensure we have an array and normalize the data structure
        this.userQuizzes = Array.isArray(quizzes) ? quizzes.map(quiz => ({
          ...quiz,
          questions: quiz.questions || [],
          difficulty: quiz.difficulty || 'medium',
          timeLimit: quiz.timeLimit || 'N/A',
          totalAttempts: quiz.totalAttempts || 0,
          averageScore: quiz.averageScore || 0
        })) : [];

      } catch (error) {
        console.error('Error loading quizzes:', error);
        this.showError('Failed to load quizzes');
        this.userQuizzes = []; // Ensure it's always an array
      } finally {
        this.loadingQuizzes = false;
      }
    },

    async loadUserFlashcards() {
      try {
        this.loadingFlashcards = true;
        const flashcardSets = await getUserFlashcardSets(this.userId);

        // Ensure we have an array and normalize the data structure
        this.userFlashcardSets = Array.isArray(flashcardSets) ? flashcardSets.map(set => ({
          ...set,
          cards: set.cards || [],
          category: set.category || 'Uncategorized',
          totalStudySessions: set.totalStudySessions || 0,
          averageSessionTime: set.averageSessionTime || 0
        })) : [];

      } catch (error) {
        console.error('Error loading flashcard sets:', error);
        this.showError('Failed to load flashcard sets');
        this.userFlashcardSets = []; // Ensure it's always an array
      } finally {
        this.loadingFlashcards = false;
      }
    },

    checkForNewItems() {
      const query = this.$route.query;

      if (query.tab) {
        this.activeTab = query.tab;
      }

      if (query.newQuiz) {
        this.activeTab = 'quizzes';
        this.showSuccess('Quiz generated successfully!');
        // Clear the query parameter
        this.$router.replace({ query: {} });
      }

      if (query.newFlashcardSet) {
        this.activeTab = 'flashcards';
        this.showSuccess('Flashcards generated successfully!');
        // Clear the query parameter
        this.$router.replace({ query: {} });
      }
    },

    // Quiz actions
    async refreshQuizzes() {
      await this.loadUserQuizzes();
      this.showSuccess('Quizzes refreshed!');
    },

    takeQuiz(quizId) {
      this.$router.push(`/quiz/${quizId}`);
    },

    showQuizMenu(quiz) {
      this.selectedQuiz = quiz;
      this.showQuizActions = true;
    },

    // eslint-disable-next-line no-unused-vars
    editQuiz(_quiz) {
      this.showInfo('Quiz editing functionality coming soon!');
      this.showQuizActions = false;
    },

    async deleteQuiz(quiz) {
      try {
        await deleteQuizAPI(quiz._id);
        this.showSuccess('Quiz deleted successfully!');
        this.showQuizActions = false;
        await this.loadUserQuizzes();
      } catch (error) {
        console.error('Error deleting quiz:', error);
        this.showError('Failed to delete quiz');
      }
    },

    // Flashcard actions
    async refreshFlashcards() {
      await this.loadUserFlashcards();
      this.showSuccess('Flashcard sets refreshed!');
    },

    studyFlashcards(flashcardSetId) {
      this.$router.push(`/flashcards/${flashcardSetId}`);
    },

    showFlashcardMenu(flashcardSet) {
      this.selectedFlashcardSet = flashcardSet;
      this.showFlashcardActions = true;
    },

    // eslint-disable-next-line no-unused-vars
    editFlashcardSet(_flashcardSet) {
      this.showInfo('Flashcard set editing functionality coming soon!');
      this.showFlashcardActions = false;
    },

    async deleteFlashcardSet(flashcardSet) {
      try {
        await deleteFlashcardSetAPI(flashcardSet._id);
        this.showSuccess('Flashcard set deleted successfully!');
        this.showFlashcardActions = false;
        await this.loadUserFlashcards();
      } catch (error) {
        console.error('Error deleting flashcard set:', error);
        this.showError('Failed to delete flashcard set');
      }
    },

    // Utility methods
    formatDate(timestamp) {
      if (!timestamp) return 'Unknown date';
      return new Date(timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },

    getUserIdFromToken() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    },

    // Particle animation methods
    getParticleSize(index) {
      const sizes = ['small', 'medium', 'large'];
      return sizes[index % 3];
    },

    getParticleColor(index) {
      const colors = ['blue', 'purple', 'pink', 'cyan'];
      return colors[index % 4];
    }

  }
}
</script>

<style scoped>
/* Base Styles */
.learning-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #1a1a1a;
  color: #ffffff;
}

.space-background {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

/* Space Particles */
.space-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}
.particle.small { width: 4px; height: 4px; }
.particle.medium { width: 6px; height: 6px; }
.particle.large { width: 8px; height: 8px; }

.particle.blue { background: rgba(100, 200, 255, 0.6); }
.particle.purple { background: rgba(150, 100, 255, 0.6); }
.particle.pink { background: rgba(255, 100, 200, 0.6); }
.particle.cyan { background: rgba(100, 255, 200, 0.6); }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Generate random positions for particles */
.particle-1 { top: 10%; left: 10%; animation-delay: 0s; }
.particle-2 { top: 20%; left: 80%; animation-delay: 1s; }
.particle-3 { top: 80%; left: 20%; animation-delay: 2s; }
.particle-4 { top: 60%; left: 90%; animation-delay: 3s; }
.particle-5 { top: 30%; left: 60%; animation-delay: 4s; }
.particle-6 { top: 90%; left: 70%; animation-delay: 5s; }
.particle-7 { top: 15%; left: 40%; animation-delay: 0.5s; }
.particle-8 { top: 70%; left: 15%; animation-delay: 1.5s; }
.particle-9 { top: 40%; left: 85%; animation-delay: 2.5s; }
.particle-10 { top: 85%; left: 45%; animation-delay: 3.5s; }
.particle-11 { top: 25%; left: 25%; animation-delay: 4.5s; }
.particle-12 { top: 65%; left: 75%; animation-delay: 5.5s; }
.particle-13 { top: 5%; left: 55%; animation-delay: 0.8s; }
.particle-14 { top: 75%; left: 5%; animation-delay: 1.8s; }
.particle-15 { top: 45%; left: 95%; animation-delay: 2.8s; }
.particle-16 { top: 95%; left: 35%; animation-delay: 3.8s; }
.particle-17 { top: 35%; left: 15%; animation-delay: 4.8s; }
.particle-18 { top: 55%; left: 65%; animation-delay: 5.8s; }
.particle-19 { top: 12%; left: 75%; animation-delay: 1.2s; }
.particle-20 { top: 82%; left: 55%; animation-delay: 2.2s; }

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
  color: #64b5f6;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 1rem;
}

.retry-btn {
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
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
  box-shadow: 0 8px 25px rgba(100, 181, 246, 0.3);
}

/* Main Layout */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
  z-index: 5;
  position: relative;
  transition: margin-left 0.5s ease-out;
}

.learning-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: white;
  -webkit-background-clip: text;
  background-clip: text;
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-content p {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Tab Navigation */
.tab-navigation {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.tab-btn.active {
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  color: white;
  border-color: #64b5f6;
}

.tab-btn .count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.tab-btn.active .count {
  background: rgba(255, 255, 255, 0.3);
}

/* Tab Content */
.tab-content {
  min-height: 60vh;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  margin: 0;
  color: #64b5f6;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.8rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.refresh-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* No Content State */
.no-content {
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.no-content-icon {
  font-size: 4rem;
  color: #64b5f6;
  margin-bottom: 1.5rem;
}

.no-content h3 {
  margin: 0 0 1rem 0;
  color: white;
  font-size: 1.5rem;
}

.no-content p {
  margin: 0 0 2rem 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
}

.create-content-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.create-content-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.content-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.content-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(100, 181, 246, 0.2);
  border-color: #64b5f6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.quiz-icon {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}

.flashcard-icon {
  background: linear-gradient(135deg, #f59e0b, #f97316);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.card-content {
  flex: 1;
  margin-bottom: 1rem;
}

.card-content h3 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;
}

.card-content p {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  font-size: 0.9rem;
}

.card-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.meta-item.difficulty {
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}

.meta-item.difficulty.easy {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.meta-item.difficulty.medium {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.meta-item.difficulty.hard {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.card-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.8rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.6);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.created-date {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
}

.take-quiz-btn, .study-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}

.take-quiz-btn:hover, .study-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

/* Action Menus */
.action-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.action-menu {
  background: #2a2a2a;
  border-radius: 15px;
  min-width: 300px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.menu-header h3 {
  margin: 0;
  color: #64b5f6;
  font-size: 1.2rem;
}

.close-menu-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.close-menu-btn:hover {
  color: #fff;
  background: #333;
}

.menu-actions {
  padding: 1rem;
}

.menu-action-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.menu-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.menu-action-btn.delete {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.3);
  color: #f44336;
}

.menu-action-btn.delete:hover {
  background: rgba(244, 67, 54, 0.3);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  .header-content {
    padding: 1.5rem;
    text-align: center;
  }

  .header-content h1 {
    font-size: 2rem;
    justify-content: center;
  }

  .tab-navigation {
    flex-direction: column;
    gap: 0.5rem;
  }

  .tab-btn {
    justify-content: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .card-meta {
    justify-content: center;
  }

  .card-footer {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

/* Responsive to sidebar state */
@media (min-width: 769px) {
  .main-content {
    margin-left: var(--sidebar-width, 280px);
  }
}











/* Responsive to sidebar state */
@media (min-width: 769px) {
  .main-content {
    margin-left: var(--sidebar-width, 280px);
  }
}
</style>