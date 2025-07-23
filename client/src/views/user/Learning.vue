<template>
  <div class="learning-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading learning content...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadLearningData" class="retry-btn">Try Again</button>
    </div>
    
      <!-- Sidebar -->
      <Sidebar 
        :user-name="userName" 
        :user-level="userLevel" 
        current-page="learning"
        @logout="logout"
      />
      
      <!-- Main Content -->
      <div class="main-content">
        <header class="learning-header">
          <div class="header-content">
            <h1 class="space-text-primary space-glow"><i class="fas fa-book"></i> Learning Center</h1>
            <p>Continue your learning journey and master new skills</p>
          </div>
          <div class="learning-stats">
            <div class="stat-item">
              <i class="fas fa-fire"></i>
              <span>{{ learningStats.currentStreak }} day streak</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>{{ learningStats.todayTime }} min today</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-trophy"></i>
              <span>{{ learningStats.completedLessons }} lessons completed</span>
            </div>
          </div>
        </header>
        
        <!-- Learning Sections -->
        <div class="learning-sections">
          <!-- Continue Learning -->
          <div class="learning-section">
            <h2><i class="fas fa-play-circle"></i> Continue Learning</h2>
            <div class="continue-learning-grid">
              <div v-for="lesson in continueLearning" :key="lesson.id" class="lesson-card continue-card">
                <div class="lesson-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: lesson.progress + '%' }"></div>
                  </div>
                  <span class="progress-text">{{ lesson.progress }}%</span>
                </div>
                <div class="lesson-content">
                  <h3>{{ lesson.title }}</h3>
                  <p>{{ lesson.subject }}</p>
                  <div class="lesson-meta">
                    <span><i class="fas fa-clock"></i> {{ lesson.duration }} min</span>
                    <span><i class="fas fa-star"></i> {{ lesson.difficulty }}</span>
                  </div>
                </div>
                <button @click="startLesson(lesson)" class="continue-btn">
                  <i class="fas fa-play"></i> Continue
                </button>
              </div>
            </div>
          </div>
          
          <!-- Subject Categories -->
          <div class="learning-section">
            <h2><i class="fas fa-graduation-cap"></i> Browse by Subject</h2>
            <div class="subjects-grid">
              <div v-for="subject in subjects" :key="subject.id" class="subject-card" @click="viewSubject(subject)">
                <div class="subject-icon">
                  <i :class="subject.icon"></i>
                </div>
                <div class="subject-info">
                  <h3>{{ subject.name }}</h3>
                  <p>{{ subject.lessonCount }} lessons</p>
                  <div class="subject-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: subject.progress + '%' }"></div>
                    </div>
                    <span>{{ subject.progress }}% complete</span>
                  </div>
                </div>
                <div class="subject-level">
                  <span class="level-badge">Level {{ subject.level }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recommended Lessons -->
          <div class="learning-section">
            <h2><i class="fas fa-lightbulb"></i> Recommended for You</h2>
            <div class="lessons-grid">
              <div v-for="lesson in recommendedLessons" :key="lesson.id" class="lesson-card">
                <div class="lesson-thumbnail">
                  <img :src="lesson.thumbnail" :alt="lesson.title" />
                  <div class="lesson-duration">
                    <i class="fas fa-play"></i> {{ lesson.duration }} min
                  </div>
                </div>
                <div class="lesson-content">
                  <div class="lesson-subject">{{ lesson.subject }}</div>
                  <h3>{{ lesson.title }}</h3>
                  <p>{{ lesson.description }}</p>
                  <div class="lesson-meta">
                    <span class="difficulty" :class="lesson.difficulty.toLowerCase()">
                      <i class="fas fa-star"></i> {{ lesson.difficulty }}
                    </span>
                    <span class="lesson-type">
                      <i class="fas fa-bookmark"></i> {{ lesson.type }}
                    </span>
                  </div>
                </div>
                <div class="lesson-actions">
                  <button @click="startLesson(lesson)" class="start-btn">
                    <i class="fas fa-play"></i> Start Learning
                  </button>
                  <button @click="bookmarkLesson(lesson)" class="bookmark-btn" :class="{ bookmarked: lesson.bookmarked }">
                    <i class="fas fa-bookmark"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- AI Recommendations -->
          <div class="learning-section ai-recommendations">
            <div class="section-header">
              <h2><i class="fas fa-brain"></i>Recommendations</h2>
              <button @click="refreshAIRecommendations" class="refresh-btn" :disabled="loadingRecommendations">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loadingRecommendations }"></i>
                Refresh
              </button>
            </div>
            
            <!-- Loading State -->
            <div v-if="loadingRecommendations" class="ai-loading">
              <div class="loading-spinner"><i class="fas fa-sync-alt fa-pulse"></i></div>
              <p>AI is analyzing your performance...</p>
            </div>
            
            <!-- AI Recommendations -->
            <div v-else-if="aiRecommendations && aiRecommendations.recommendations" class="ai-recommendations-content">
              <div class="recommendations-header">
                <div class="priority-indicator" :class="aiRecommendations.priority">
                  <i class="fas fa-exclamation-circle" v-if="aiRecommendations.priority === 'high'"></i>
                  <i class="fas fa-info-circle" v-else-if="aiRecommendations.priority === 'medium'"></i>
                  <i class="fas fa-check-circle" v-else></i>
                  <span>{{ aiRecommendations.priority.toUpperCase() }} PRIORITY</span>
                </div>
                <p class="motivational-message">{{ aiRecommendations.motivationalMessage }}</p>
              </div>
              
              <div class="recommendations-grid">
                <div v-for="(recommendation, index) in aiRecommendations.recommendations" :key="index" class="recommendation-card">
                  <div class="recommendation-header">
                    <div class="recommendation-type" :class="recommendation.type">
                      <i class="fas fa-graduation-cap" v-if="recommendation.type === 'exam'"></i>
                      <i class="fas fa-book" v-else-if="recommendation.type === 'study'"></i>
                      <i class="fas fa-chart-line" v-else-if="recommendation.type === 'practice'"></i>
                      <i class="fas fa-lightbulb" v-else></i>
                      <span>{{ recommendation.type.toUpperCase() }}</span>
                    </div>
                    <div class="difficulty-badge" :class="recommendation.difficulty">
                      {{ recommendation.difficulty }}
                    </div>
                  </div>
                  
                  <div class="recommendation-content">
                    <h3>{{ recommendation.title }}</h3>
                    <p>{{ recommendation.description }}</p>
                    
                    <div class="recommendation-meta">
                      <span class="time-estimate">
                        <i class="fas fa-clock"></i> {{ recommendation.estimatedTime }} min
                      </span>
                      <span class="reason">
                        <i class="fas fa-info"></i> {{ recommendation.reason }}
                      </span>
                    </div>
                  </div>
                  
                  <div class="recommendation-actions">
                    <button @click="followRecommendation(recommendation)" class="action-btn primary">
                      <i class="fas fa-arrow-right"></i> Start Now
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="next-steps" v-if="aiRecommendations.nextSteps && aiRecommendations.nextSteps.length">
                <h4><i class="fas fa-list-check"></i> Suggested Next Steps:</h4>
                <ul>
                  <li v-for="(step, index) in aiRecommendations.nextSteps" :key="index">
                    <i class="fas fa-chevron-right"></i> {{ step }}
                  </li>
                </ul>
              </div>
            </div>
            
            <!-- Error State -->
            <div v-else-if="aiError" class="ai-error">
              <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
              <p>{{ aiError }}</p>
              <button @click="refreshAIRecommendations" class="retry-btn">Try Again</button>
            </div>
            
            <!-- No Recommendations -->
            <div v-else class="no-recommendations">
              <div class="empty-icon"><i class="fas fa-robot"></i></div>
              <p>Complete more questions to get personalized AI recommendations!</p>
              <button @click="goToQuestions" class="action-btn">Start Practicing</button>
            </div>
          </div>
          
          <!-- Learning Paths -->
          <div class="learning-section">
            <h2><i class="fas fa-route"></i> Learning Paths</h2>
            <div class="paths-grid">
              <div v-for="path in learningPaths" :key="path.id" class="path-card">
                <div class="path-header">
                  <div class="path-icon">
                    <i :class="path.icon"></i>
                  </div>
                  <div class="path-info">
                    <h3>{{ path.name }}</h3>
                    <p>{{ path.description }}</p>
                  </div>
                  <div class="path-level">
                    <span class="level-badge">{{ path.level }}</span>
                  </div>
                </div>
                <div class="path-progress">
                  <div class="progress-info">
                    <span>{{ path.completedLessons }}/{{ path.totalLessons }} lessons</span>
                    <span>{{ path.progress }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: path.progress + '%' }"></div>
                  </div>
                </div>
                <div class="path-actions">
                  <button @click="startPath(path)" class="path-btn">
                    <i class="fas fa-arrow-right"></i> {{ path.progress > 0 ? 'Continue Path' : 'Start Path' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  </div>
</template>

<script>
import { getAccount } from '@/api/Account';
import { getAllSubjects } from '@/api/Subject';
import { getUserProgress } from '@/api/UserProgress';
import { getRecommendedQAs } from '@/api/QA';
import { getExamRecommendations } from '@/api/AI';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'Learning',
  components: {
    Sidebar
  },
  data() {
    return {
      userName: 'Loading...',
      userLevel: 1,
      userId: null,
      learningStats: {
        currentStreak: 0,
        todayTime: 0,
        completedLessons: 0
      },
      continueLearning: [],
      subjects: [],
      recommendedLessons: [],
      learningPaths: [],
      loading: true,
      error: null,
      // AI Recommendations
      aiRecommendations: null,
      loadingRecommendations: false,
      aiError: null
    }
  },
  async mounted() {
    await this.loadLearningData();
    await this.loadAIRecommendations();
  },
  methods: {
    getParticleSize(index) {
      const sizes = ['small', 'medium', 'large'];
      return sizes[index % 3];
    },
    getParticleColor(index) {
      const colors = ['blue', 'purple', 'pink', 'cyan'];
      return colors[index % 4];
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
    
    async loadLearningData() {
      try {
        this.loading = true;
        this.error = null;
        
        const userId = this.getUserIdFromToken();
        if (!userId) {
          throw new Error('No valid user token found');
        }
        
        this.userId = userId;
        
        // Load user account data
        const accountData = await getAccount(userId);
        this.userName = accountData.username || 'User';
        this.userLevel = accountData.currentLevel || 1;
        
        // Load learning statistics
        this.learningStats = {
          currentStreak: accountData.currentStreak || 0,
          todayTime: accountData.todayStudyTime || 0,
          completedLessons: accountData.completedLessons?.length || 0
        };
        
        // Load user progress data
        let userProgressData = null;
        try {
          userProgressData = await getUserProgress(userId);
        } catch (progressError) {
          console.warn('Could not load user progress:', progressError);
        }
        
        // Load subjects from API
        try {
          const subjectsData = await getAllSubjects();
          this.subjects = subjectsData.map(subject => ({
            id: subject._id,
            name: subject.name,
            icon: this.getSubjectIcon(subject.name),
            lessonCount: subject.lessonCount || 0,
            progress: this.getSubjectProgress(subject._id, userProgressData),
            level: subject.level || 1,
            description: subject.description
          }));
        } catch (subjectError) {
          console.warn('Could not load subjects:', subjectError);
          // Fallback to empty array or basic subjects
          this.subjects = [];
        }
        
        // Load recommended content from QA system
        try {
          const recommendedQAs = await getRecommendedQAs(userId);
          this.recommendedLessons = recommendedQAs.slice(0, 6).map(qa => ({
            id: qa._id,
            title: qa.question,
            subject: qa.subject?.name || 'General',
            description: qa.answer ? qa.answer.substring(0, 150) + '...' : 'Practice question',
            thumbnail: 'https://via.placeholder.com/300x200',
            duration: qa.estimatedTime || 15,
            difficulty: qa.difficulty || 'Intermediate',
            type: 'Q&A',
            bookmarked: false
          }));
        } catch (qaError) {
          console.warn('Could not load recommended QAs:', qaError);
          this.recommendedLessons = [];
        }
        
        // Generate continue learning from user progress
        this.continueLearning = this.generateContinueLearning(userProgressData);
        
        // Generate learning paths based on subjects
        this.learningPaths = this.generateLearningPaths();
        
      } catch (error) {
        console.error('Error loading learning data:', error);
        this.error = 'Failed to load learning content';
        
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    startLesson(lesson) {
      console.log('Starting lesson:', lesson.title);
      // Here you would navigate to the lesson or open a lesson modal
      alert(`Starting lesson: ${lesson.title}`);
    },
    
    viewSubject(subject) {
      console.log('Viewing subject:', subject.name);
      // Here you would navigate to the subject page
      this.$router.push(`/subjects/${subject.id}`);
    },
    
    bookmarkLesson(lesson) {
      lesson.bookmarked = !lesson.bookmarked;
      console.log('Bookmarked lesson:', lesson.title, lesson.bookmarked);
    },
    
    startPath(path) {
      console.log('Starting learning path:', path.name);
      // Here you would navigate to the learning path
      alert(`Starting learning path: ${path.name}`);
    },
    
    getSubjectIcon(subjectName) {
      const iconMap = {
        'Mathematics': 'fas fa-calculator',
        'Math': 'fas fa-calculator',
        'Physics': 'fas fa-atom',
        'Chemistry': 'fas fa-flask',
        'Biology': 'fas fa-dna',
        'Computer Science': 'fas fa-laptop-code',
        'Programming': 'fas fa-code',
        'Database': 'fas fa-database',
        'Web Development': 'fas fa-globe',
        'Data Structures': 'fas fa-sitemap',
        'Algorithms': 'fas fa-project-diagram',
        'Software Engineering': 'fas fa-cogs'
      };
      return iconMap[subjectName] || 'fas fa-book';
    },
    
    getSubjectProgress(subjectId, userProgressData) {
      if (!userProgressData || !userProgressData.subjectProgress) {
        return Math.floor(Math.random() * 50) + 20; // Random progress between 20-70%
      }
      
      const subjectProgress = userProgressData.subjectProgress.find(sp => sp.subjectId === subjectId);
      return subjectProgress ? subjectProgress.progress : 0;
    },
    
    generateContinueLearning(userProgressData) {
      if (!userProgressData || !this.subjects.length) {
        return [];
      }
      
      // Find subjects with partial progress (20-80%) to suggest continuation
      return this.subjects
        .filter(subject => subject.progress > 20 && subject.progress < 80)
        .slice(0, 3)
        .map(subject => ({
          id: subject.id,
          title: `Continue ${subject.name}`,
          subject: subject.name,
          progress: subject.progress,
          duration: 25 + Math.floor(Math.random() * 20), // 25-45 minutes
          difficulty: subject.level > 2 ? 'Advanced' : subject.level > 1 ? 'Intermediate' : 'Beginner'
        }));
    },
    
    generateLearningPaths() {
      const paths = [
        {
          id: 1,
          name: 'Full Stack Developer',
          description: 'Complete path to become a full stack web developer',
          icon: 'fas fa-layer-group',
          level: 'Beginner to Advanced',
          subjects: ['Web Development', 'Programming', 'Database']
        },
        {
          id: 2,
          name: 'Data Scientist',
          description: 'Master data science and analytics',
          icon: 'fas fa-chart-bar',
          level: 'Intermediate to Advanced',
          subjects: ['Mathematics', 'Programming', 'Data Structures']
        },
        {
          id: 3,
          name: 'Software Engineer',
          description: 'Build robust software applications',
          icon: 'fas fa-cogs',
          level: 'Beginner to Advanced',
          subjects: ['Programming', 'Data Structures', 'Algorithms']
        }
      ];
      
      return paths.map(path => {
        const relevantSubjects = this.subjects.filter(subject => 
          path.subjects.some(pathSubject => 
            subject.name.toLowerCase().includes(pathSubject.toLowerCase())
          )
        );
        
        const totalLessons = relevantSubjects.reduce((sum, subject) => sum + subject.lessonCount, 0);
        const avgProgress = relevantSubjects.length > 0 
          ? relevantSubjects.reduce((sum, subject) => sum + subject.progress, 0) / relevantSubjects.length 
          : 0;
        const completedLessons = Math.floor((avgProgress / 100) * totalLessons);
        
        return {
          ...path,
          totalLessons: totalLessons || 50,
          completedLessons,
          progress: Math.floor(avgProgress)
        };
      });
    },
    
    // AI Recommendation Methods
    async loadAIRecommendations() {
      try {
        this.loadingRecommendations = true;
        this.aiError = null;
        
        const response = await getExamRecommendations();
        
        if (response.success) {
          this.aiRecommendations = response.recommendations;
        } else {
          this.aiError = response.error || 'Failed to load AI recommendations';
        }
      } catch (error) {
        console.error('Error loading AI recommendations:', error);
        this.aiError = 'Unable to connect to AI service';
      } finally {
        this.loadingRecommendations = false;
      }
    },
    
    async refreshAIRecommendations() {
      await this.loadAIRecommendations();
    },
    
    followRecommendation(recommendation) {
      if (recommendation.actionLink) {
        this.$router.push(recommendation.actionLink);
      } else {
        // Default action based on recommendation type
        switch (recommendation.type) {
          case 'exam':
            this.$router.push('/exams');
            break;
          case 'study':
            this.$router.push('/learning');
            break;
          case 'practice':
            this.$router.push('/learning');
            break;
          default:
            this.$router.push('/dashboard');
        }
      }
    },
    
    goToQuestions() {
      this.$router.push('/learning');
    },
    
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.learning-container {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  font-size: 1.5rem;
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-left: 0.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.avatar {
  position: relative;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.avatar::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.user-profile:hover .avatar::before {
  opacity: 1;
}

.user-profile:hover .avatar {
  transform: scale(1.05);
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 3;
}

.user-profile:hover .avatar img {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
}

.user-info {
  position: relative;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover .user-info {
  transform: translateX(2px);
}

.user-info h4 {
  color: white;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover .user-info h4 {
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}

.user-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.8rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover .user-info p {
  color: rgba(255, 255, 255, 0.9);
}

.user-profile:active {
  transform: scale(0.98);
}

.user-profile:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.user-profile:hover .avatar {
  transform: scale(1.08);
}

.user-profile:hover .user-info h4 {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
}

.learning-header {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  color: white;
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

.header-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
}

.learning-stats {
  display: flex;
  gap: 1.5rem;
}

.learning-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.learning-stats .stat-item i {
  color: #ffd700;
}

/* Learning Sections */
.learning-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.learning-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.learning-section h2 {
  color: white;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Continue Learning Grid */
.continue-learning-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
}

.continue-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lesson-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s ease;
}

.progress-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
}

.lesson-content h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.lesson-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.lesson-meta {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
}

.lesson-meta span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.continue-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
}

.continue-btn:hover {
  background: #5a67d8;
  transform: translateY(-2px);
}

/* Subjects Grid */
.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.subject-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subject-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.subject-icon {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.subject-info h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.subject-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.subject-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.subject-progress span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
}

.level-badge {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Lessons Grid */
.lessons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.lesson-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.lesson-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.lesson-thumbnail {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.lesson-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lesson-duration {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.lesson-content {
  padding: 1.5rem;
}

.lesson-subject {
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.lesson-content h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.lesson-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.difficulty {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
}

.difficulty.beginner {
  background: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.difficulty.intermediate {
  background: rgba(237, 137, 54, 0.2);
  color: #ed8936;
}

.difficulty.advanced {
  background: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

.lesson-type {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.lesson-actions {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  gap: 0.5rem;
}

.start-btn {
  flex: 1;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.start-btn:hover {
  background: #5a67d8;
}

.bookmark-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 48px;
}

.bookmark-btn:hover,
.bookmark-btn.bookmarked {
  background: #ffd700;
  color: #1a202c;
}

/* Learning Paths Grid */
.paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.path-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.path-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.path-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.path-icon {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.path-info {
  flex: 1;
}

.path-info h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.path-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.9rem;
}

.path-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-info span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.path-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  justify-content: center;
}

.path-btn:hover {
  background: #5a67d8;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  text-align: center;
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-icon i {
  font-size: 3rem;
  color: #ff4757;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #5a67d8;
}

/* AI Recommendations Styles */
.ai-recommendations {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.refresh-btn {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 0.3);
  border-color: rgba(102, 126, 234, 0.5);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-loading {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.ai-loading .loading-spinner {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.recommendations-header {
  margin-bottom: 2rem;
}

.priority-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.priority-indicator.high {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.priority-indicator.medium {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
  border: 1px solid rgba(255, 165, 0, 0.3);
}

.priority-indicator.low {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.3);
}

.motivational-message {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
  font-style: italic;
}

.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.recommendation-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.recommendation-card:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
}

.recommendation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.recommendation-type {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.recommendation-type.exam {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.recommendation-type.study {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
}

.recommendation-type.practice {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.difficulty-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.difficulty-badge.easy {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
}

.difficulty-badge.medium {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.difficulty-badge.hard {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
}

.recommendation-content h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.recommendation-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.recommendation-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.time-estimate,
.reason {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.recommendation-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.action-btn.primary {
  background: #667eea;
  color: white;
}

.action-btn.primary:hover {
  background: #5a67d8;
}

.next-steps {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
}

.next-steps h4 {
  color: white;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.next-steps ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.next-steps li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.next-steps li:last-child {
  border-bottom: none;
}

.next-steps li i {
  color: #667eea;
  font-size: 0.8rem;
}

.ai-error {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.ai-error .error-icon {
  font-size: 2rem;
  color: #ff4757;
  margin-bottom: 1rem;
}

.no-recommendations {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.no-recommendations .empty-icon {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.no-recommendations .action-btn {
  margin-top: 1rem;
  max-width: 200px;
  margin-left: auto;
  margin-right: auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .calendar-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .view-toggle {
    width: 100%;
    justify-content: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }

  .learning-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  }
}

</style>