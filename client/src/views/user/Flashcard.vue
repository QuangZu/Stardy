<template>
  <div class="flashcard-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i"
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container h-screen w-screen">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading flashcard set...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="goBack" class="retry-btn">Go Back</button>
    </div>

    <!-- Main Flashcard Content -->
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
        <header class="flashcard-header">
          <div class="header-content">
            <button @click="goBack" class="back-btn">
              <i class="fas fa-arrow-left"></i>
            </button>
            <div class="flashcard-info">
              <h1>{{ flashcardSet.title }}</h1>
              <p>{{ flashcardSet.description }}</p>
              <div class="flashcard-meta">
                <span class="card-count">{{ totalCards }} Cards</span>
                <span class="category">{{ flashcardSet.category }}</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Study Progress -->
        <div class="study-progress" v-if="studyStarted && !studyCompleted">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progressPercentage + '%' }"></div>
          </div>
          <div class="progress-info">
            <span>Card {{ currentCardIndex + 1 }} of {{ totalCards }}</span>
            <span class="time-elapsed">{{ formatTime(timeElapsed) }}</span>
          </div>
        </div>

        <!-- Study Start Screen -->
        <div v-if="!studyStarted" class="study-start">
          <div class="start-card">
            <div class="start-icon">
              <i class="fas fa-layer-group"></i>
            </div>
            <h2>Ready to study?</h2>
            <p>This flashcard set contains {{ totalCards }} cards to help you learn and memorize key concepts.</p>
            <div class="study-instructions">
              <h3>How to study:</h3>
              <ul>
                <li>Read the question on the front of each card</li>
                <li>Think about your answer</li>
                <li>Click to reveal the answer</li>
                <li>Mark whether you got it right or wrong</li>
                <li>Review cards you got wrong at the end</li>
              </ul>
            </div>
            <button @click="startStudy" class="start-study-btn">
              <i class="fas fa-play"></i> Start Studying
            </button>
          </div>
        </div>

        <!-- Flashcard Study -->
        <div v-else-if="studyStarted && !studyCompleted" class="flashcard-study">
          <div class="flashcard-wrapper">
            <div class="flashcard" :class="{ flipped: cardFlipped }" @click="flipCard">
              <div class="flashcard-front">
                <div class="card-content">
                  <h3>{{ currentCard.front }}</h3>
                  <div class="flip-hint">
                    <i class="fas fa-mouse-pointer"></i>
                    Click to reveal answer
                  </div>
                </div>
              </div>
              <div class="flashcard-back">
                <div class="card-content">
                  <h3>{{ currentCard.back }}</h3>
                  <div class="card-difficulty">
                    <span class="difficulty-label">Difficulty:</span>
                    <span :class="['difficulty-badge', currentCard.difficulty]">
                      {{ currentCard.difficulty }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="study-controls" v-if="cardFlipped">
            <div class="feedback-question">
              <h3>Did you get it right?</h3>
            </div>
            <div class="feedback-buttons">
              <button @click="markCard(false)" class="wrong-btn">
                <i class="fas fa-times"></i> Wrong
              </button>
              <button @click="markCard(true)" class="correct-btn">
                <i class="fas fa-check"></i> Correct
              </button>
            </div>
          </div>

          <div class="card-navigation">
            <button 
              @click="previousCard" 
              :disabled="currentCardIndex === 0"
              class="nav-btn prev-btn"
            >
              <i class="fas fa-chevron-left"></i> Previous
            </button>
            <span class="card-counter">
              {{ currentCardIndex + 1 }} / {{ totalCards }}
            </span>
            <button 
              @click="nextCard" 
              :disabled="currentCardIndex === totalCards - 1"
              class="nav-btn next-btn"
            >
              Next <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        <!-- Study Results -->
        <div v-else-if="studyCompleted" class="study-results">
          <div class="results-card">
            <div class="results-header">
              <div class="score-circle">
                <span class="score-percentage">{{ Math.round(correctAnswers / totalCards * 100) }}%</span>
              </div>
              <h2>Study Session Complete!</h2>
              <p>Great job studying these flashcards!</p>
            </div>
            
            <div class="results-summary">
              <div class="summary-item">
                <span class="label">Correct:</span>
                <span class="value correct">{{ correctAnswers }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Wrong:</span>
                <span class="value wrong">{{ wrongAnswers }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Cards:</span>
                <span class="value">{{ totalCards }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Study Time:</span>
                <span class="value">{{ formatTime(timeElapsed) }}</span>
              </div>
            </div>

            <div class="results-actions">
              <button @click="reviewWrongCards" class="review-btn" v-if="wrongCards.length > 0">
                <i class="fas fa-redo"></i> Review Wrong Cards ({{ wrongCards.length }})
              </button>
              <button @click="restartStudy" class="restart-btn">
                <i class="fas fa-refresh"></i> Study Again
              </button>
              <button @click="goToLearning" class="continue-btn">
                <i class="fas fa-arrow-right"></i> Back to Learning
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { getAccount, getUserIdFromToken } from '@/api/Account';
import { getFlashcardSet, recordStudySession } from '@/api/Flashcard';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'Flashcard',
  components: {
    Sidebar
  },
  setup() {
    const { showSuccess, showError, showInfo } = useNotification()
    return {
      showSuccess,
      showError,
      showInfo
    }
  },
  data() {
    return {
      userName: 'Loading...',
      userLevel: 1,
      userId: null,
      loading: true,
      error: null,
      
      // Flashcard data
      flashcardSet: {
        title: '',
        description: '',
        cards: [],
        category: 'General'
      },
      
      // Study state
      studyStarted: false,
      studyCompleted: false,
      currentCardIndex: 0,
      cardFlipped: false,
      startTime: null,
      timeElapsed: 0,
      timer: null,
      
      // Results tracking
      correctAnswers: 0,
      wrongAnswers: 0,
      wrongCards: [],
      cardResults: {}
    }
  },
  computed: {
    currentCard() {
      return (this.flashcardSet.cards && this.flashcardSet.cards[this.currentCardIndex]) || {};
    },

    progressPercentage() {
      const totalCards = (this.flashcardSet.cards && this.flashcardSet.cards.length) || 1;
      return ((this.currentCardIndex + 1) / totalCards) * 100;
    },

    totalCards() {
      return (this.flashcardSet.cards && this.flashcardSet.cards.length) || 0;
    }
  },
  async mounted() {
    await this.loadFlashcardData();
  },
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  },
  methods: {
    async loadFlashcardData() {
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
        
        // Load flashcard set data
        const flashcardSetId = this.$route.params.id;
        if (!flashcardSetId) {
          throw new Error('Flashcard set ID is required');
        }
        
        const flashcardData = await getFlashcardSet(flashcardSetId);
        this.flashcardSet = flashcardData;
        
      } catch (error) {
        console.error('Error loading flashcard set:', error);
        this.error = 'Failed to load flashcard set';
      } finally {
        this.loading = false;
      }
    },

    startStudy() {
      this.studyStarted = true;
      this.startTime = Date.now();
      this.startTimer();
    },

    startTimer() {
      this.timer = setInterval(() => {
        this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
      }, 1000);
    },

    flipCard() {
      this.cardFlipped = true;
    },

    markCard(isCorrect) {
      const cardIndex = this.currentCardIndex;
      this.cardResults[cardIndex] = isCorrect;
      
      if (isCorrect) {
        this.correctAnswers++;
      } else {
        this.wrongAnswers++;
        this.wrongCards.push(cardIndex);
      }
      
      // Auto advance to next card after a short delay
      setTimeout(() => {
        this.nextCard();
      }, 500);
    },

    nextCard() {
      if (this.currentCardIndex < this.totalCards - 1) {
        this.currentCardIndex++;
        this.cardFlipped = false;
      } else {
        this.completeStudy();
      }
    },

    previousCard() {
      if (this.currentCardIndex > 0) {
        this.currentCardIndex--;
        this.cardFlipped = false;
      }
    },

    async completeStudy() {
      this.studyCompleted = true;
      
      if (this.timer) {
        clearInterval(this.timer);
      }
      
      try {
        // Record study session
        await recordStudySession(this.flashcardSet._id, Math.floor(this.timeElapsed / 60));
        this.showSuccess('Study session recorded!');
      } catch (error) {
        console.error('Error recording study session:', error);
      }
    },

    reviewWrongCards() {
      // Reset to review only wrong cards
      this.currentCardIndex = this.wrongCards[0];
      this.studyCompleted = false;
      this.cardFlipped = false;
      this.showInfo('Reviewing cards you got wrong...');
    },

    restartStudy() {
      // Reset all study state
      this.studyStarted = false;
      this.studyCompleted = false;
      this.currentCardIndex = 0;
      this.cardFlipped = false;
      this.correctAnswers = 0;
      this.wrongAnswers = 0;
      this.wrongCards = [];
      this.cardResults = {};
      this.timeElapsed = 0;
      
      if (this.timer) {
        clearInterval(this.timer);
      }
    },

    goToLearning() {
      this.$router.push('/learning');
    },

    goBack() {
      this.$router.go(-1);
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
.flashcard-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #1a1a1a;
  color: #ffffff;
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

.particle.blue { background: #64b5f6; }
.particle.purple { background: #ba68c8; }
.particle.pink { background: #f48fb1; }
.particle.cyan { background: #4dd0e1; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
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
  margin-left: 280px;
  padding: 2rem;
  position: relative;
  z-index: 5;
  min-height: 100vh;
}

/* Flashcard Header */
.flashcard-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.back-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  color: #fff;
  background: #333;
}

.flashcard-info {
  flex: 1;
}

.flashcard-info h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: #f59e0b;
}

.flashcard-info p {
  margin: 0 0 1rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.flashcard-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.flashcard-meta span {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Study Progress */
.study-progress {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #f59e0b, #f97316);
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.time-elapsed {
  font-weight: 600;
  color: #f59e0b;
}

/* Study Start */
.study-start {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.start-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 500px;
}

.start-icon {
  font-size: 4rem;
  color: #f59e0b;
  margin-bottom: 1.5rem;
}

.start-card h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  color: #fff;
}

.start-card p {
  margin: 0 0 2rem 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.study-instructions {
  text-align: left;
  margin-bottom: 2rem;
}

.study-instructions h3 {
  margin: 0 0 1rem 0;
  color: #f59e0b;
  font-size: 1.2rem;
}

.study-instructions ul {
  margin: 0;
  padding-left: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.study-instructions li {
  margin-bottom: 0.5rem;
}

.start-study-btn {
  background: linear-gradient(135deg, #f59e0b, #f97316);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 auto;
}

.start-study-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

/* Flashcard Study */
.flashcard-study {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  min-height: 60vh;
}

.flashcard-wrapper {
  perspective: 1000px;
  width: 100%;
  max-width: 600px;
  height: 400px;
}

.flashcard {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  cursor: pointer;
}

.flashcard.flipped {
  transform: rotateY(180deg);
}

.flashcard-front, .flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.flashcard-back {
  transform: rotateY(180deg);
}

.card-content {
  text-align: center;
  width: 100%;
}

.card-content h3 {
  margin: 0 0 1rem 0;
  font-size: 1.5rem;
  color: #fff;
  line-height: 1.4;
}

.flip-hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-top: 2rem;
}

.card-difficulty {
  margin-top: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.difficulty-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.difficulty-badge {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.difficulty-badge.easy {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.difficulty-badge.medium {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.difficulty-badge.hard {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

/* Study Controls */
.study-controls {
  text-align: center;
}

.feedback-question h3 {
  margin: 0 0 1.5rem 0;
  color: #fff;
  font-size: 1.3rem;
}

.feedback-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.wrong-btn, .correct-btn {
  padding: 12px 24px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.wrong-btn {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

.correct-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.wrong-btn:hover, .correct-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Card Navigation */
.card-navigation {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.card-counter {
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  font-size: 1.1rem;
}

/* Study Results */
.study-results {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.results-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 600px;
  width: 100%;
}

.results-header {
  margin-bottom: 2rem;
}

.score-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.2);
  border: 4px solid #f59e0b;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
}

.score-percentage {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.results-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  color: #fff;
}

.results-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.results-summary {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .label {
  color: rgba(255, 255, 255, 0.8);
}

.summary-item .value {
  font-weight: 600;
}

.summary-item .value.correct {
  color: #4caf50;
}

.summary-item .value.wrong {
  color: #f44336;
}

.summary-item .value:not(.correct):not(.wrong) {
  color: #f59e0b;
}

.results-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.review-btn, .restart-btn, .continue-btn {
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: none;
}

.review-btn {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}

.restart-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.continue-btn {
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  color: white;
}

.review-btn:hover, .restart-btn:hover, .continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    text-align: center;
  }

  .flashcard-meta {
    justify-content: center;
  }

  .flashcard-wrapper {
    height: 300px;
  }

  .feedback-buttons {
    flex-direction: column;
  }

  .card-navigation {
    flex-direction: column;
    gap: 1rem;
  }

  .results-actions {
    flex-direction: column;
  }
}
</style>
