<template>
  <div class="exams-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading exams...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadExamsData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main Exams Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar 
        :user-name="userName" 
        :user-level="userLevel" 
        current-page="exams"
        @logout="logout"
      />
      
      <!-- Main Content -->
      <div class="main-content">
        <header class="exams-header">
          <div class="header-content space-glow">
            <h1><i class="fas fa-file-alt"></i> Exams & Assessments</h1>
            <p>Test your knowledge and track your progress</p>
          </div>
          <div class="exam-stats">
            <div class="stat-item">
              <i class="fas fa-trophy"></i>
              <span>{{ examStats.completedExams }} completed</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-percentage"></i>
              <span>{{ examStats.averageScore }}% avg score</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-clock"></i>
              <span>{{ examStats.totalTime }} min studied</span>
            </div>
          </div>
        </header>
        
        <!-- Exam Sections -->
        <div class="exam-sections">
          <!-- Quick Practice -->
          <div class="exam-section">
            <h2><i class="fas fa-bolt"></i> Quick Practice</h2>
            <div class="quick-practice-grid">
              <div v-for="practice in quickPractice" :key="practice.id" class="practice-card">
                <div class="practice-icon">
                  <i :class="practice.icon"></i>
                </div>
                <div class="practice-content">
                  <h3>{{ practice.title }}</h3>
                  <p>{{ practice.description }}</p>
                  <div class="practice-meta">
                    <span><i class="fas fa-clock"></i> {{ practice.duration }} min</span>
                    <span><i class="fas fa-question-circle"></i> {{ practice.questions }} questions</span>
                  </div>
                </div>
                <button @click="startPractice(practice)" class="practice-btn">
                  <i class="fas fa-play"></i> Start
                </button>
              </div>
            </div>
          </div>
          
          <!-- Available Exams -->
          <div class="exam-section">
            <h2><i class="fas fa-clipboard-list"></i> Available Exams</h2>
            <div class="exams-grid">
              <div v-for="exam in availableExams" :key="exam.id" class="exam-card">
                <div class="exam-header">
                  <div class="exam-subject">
                    <i :class="exam.subjectIcon"></i>
                    <span>{{ exam.subject }}</span>
                  </div>
                  <div class="exam-difficulty" :class="exam.difficulty.toLowerCase()">
                    {{ exam.difficulty }}
                  </div>
                </div>
                <div class="exam-content">
                  <h3>{{ exam.title }}</h3>
                  <p>{{ exam.description }}</p>
                  <div class="exam-details">
                    <div class="detail-item">
                      <i class="fas fa-clock"></i>
                      <span>{{ exam.duration }} minutes</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-question-circle"></i>
                      <span>{{ exam.questions }} questions</span>
                    </div>
                    <div class="detail-item">
                      <i class="fas fa-star"></i>
                      <span>{{ exam.points }} points</span>
                    </div>
                  </div>
                  <div class="exam-requirements" v-if="exam.requirements">
                    <h4>Requirements:</h4>
                    <ul>
                      <li v-for="req in exam.requirements" :key="req">{{ req }}</li>
                    </ul>
                  </div>
                </div>
                <div class="exam-actions">
                  <button @click="startExam(exam)" class="start-exam-btn" :disabled="!exam.available">
                    <i class="fas fa-play"></i> {{ exam.available ? 'Start Exam' : 'Locked' }}
                  </button>
                  <button @click="viewExamDetails(exam)" class="details-btn">
                    <i class="fas fa-info-circle"></i> Details
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recent Results -->
          <div class="exam-section">
            <h2><i class="fas fa-chart-bar"></i> Recent Results</h2>
            <div class="results-list">
              <div v-for="result in recentResults" :key="result.id" class="result-item">
                <div class="result-info">
                  <div class="result-header">
                    <h3>{{ result.examTitle }}</h3>
                    <span class="result-date">{{ formatDate(result.completedAt) }}</span>
                  </div>
                  <div class="result-details">
                    <span class="subject">{{ result.subject }}</span>
                    <span class="duration"><i class="fas fa-clock"></i> {{ result.duration }} min</span>
                  </div>
                </div>
                <div class="result-score">
                  <div class="score-circle" :class="getScoreClass(result.score)">
                    <span class="score-value">{{ result.score }}%</span>
                  </div>
                  <div class="score-details">
                    <span>{{ result.correctAnswers }}/{{ result.totalQuestions }} correct</span>
                    <span class="grade" :class="getGradeClass(result.grade)">{{ result.grade }}</span>
                  </div>
                </div>
                <div class="result-actions">
                  <button @click="viewResultDetails(result)" class="view-btn">
                    <i class="fas fa-eye"></i> View
                  </button>
                  <button @click="retakeExam(result)" class="retake-btn">
                    <i class="fas fa-redo"></i> Retake
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Upcoming Exams -->
          <div class="exam-section">
            <h2><i class="fas fa-calendar"></i> Upcoming Exams</h2>
            <div class="upcoming-exams">
              <div v-for="upcoming in upcomingExams" :key="upcoming.id" class="upcoming-item">
                <div class="upcoming-date">
                  <div class="date-day">{{ formatDay(upcoming.scheduledDate) }}</div>
                  <div class="date-month">{{ formatMonth(upcoming.scheduledDate) }}</div>
                </div>
                <div class="upcoming-info">
                  <h3>{{ upcoming.title }}</h3>
                  <p>{{ upcoming.subject }}</p>
                  <div class="upcoming-meta">
                    <span><i class="fas fa-clock"></i> {{ upcoming.duration }} min</span>
                    <span><i class="fas fa-users"></i> {{ upcoming.participants }} students</span>
                  </div>
                </div>
                <div class="upcoming-actions">
                  <button @click="setReminder(upcoming)" class="reminder-btn" :class="{ active: upcoming.reminderSet }">
                    <i class="fas fa-bell"></i> {{ upcoming.reminderSet ? 'Reminder Set' : 'Set Reminder' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { getAccount } from '@/api/Account';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'Exams',
  components: {
    Sidebar
  },
  data() {
    return {
      userName: 'Loading...',
      userLevel: 1,
      userId: null,
      examStats: {
        completedExams: 0,
        averageScore: 0,
        totalTime: 0
      },
      quickPractice: [],
      availableExams: [],
      recentResults: [],
      upcomingExams: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadExamsData();
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
    
    async loadExamsData() {
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
        
        // Load exam statistics
        this.examStats = {
          completedExams: accountData.completedExams || 0,
          averageScore: accountData.averageExamScore || 0,
          totalTime: accountData.totalExamTime || 0
        };
        
        // Load quick practice options
        this.quickPractice = [
          {
            id: 1,
            title: 'JavaScript Basics',
            description: 'Quick review of JavaScript fundamentals',
            icon: 'fab fa-js-square',
            duration: 10,
            questions: 15
          },
          {
            id: 2,
            title: 'Database Queries',
            description: 'Practice SQL queries and database concepts',
            icon: 'fas fa-database',
            duration: 15,
            questions: 20
          },
          {
            id: 3,
            title: 'Web Development',
            description: 'HTML, CSS, and web development principles',
            icon: 'fas fa-globe',
            duration: 12,
            questions: 18
          }
        ];
        
        // Load available exams
        this.availableExams = [
          {
            id: 1,
            title: 'JavaScript Advanced Concepts',
            subject: 'Programming',
            subjectIcon: 'fab fa-js-square',
            description: 'Comprehensive exam covering advanced JavaScript topics including closures, promises, and async/await.',
            duration: 90,
            questions: 50,
            points: 100,
            difficulty: 'Advanced',
            available: true,
            requirements: [
              'Complete JavaScript Fundamentals course',
              'Score 80% or higher on practice tests'
            ]
          },
          {
            id: 2,
            title: 'Database Design & Management',
            subject: 'Database',
            subjectIcon: 'fas fa-database',
            description: 'Test your knowledge of database design principles, normalization, and SQL optimization.',
            duration: 120,
            questions: 60,
            points: 120,
            difficulty: 'Intermediate',
            available: true,
            requirements: [
              'Complete Database Fundamentals course'
            ]
          },
          {
            id: 3,
            title: 'Full Stack Development',
            subject: 'Web Development',
            subjectIcon: 'fas fa-globe',
            description: 'Comprehensive assessment of full stack development skills including frontend and backend technologies.',
            duration: 150,
            questions: 75,
            points: 150,
            difficulty: 'Advanced',
            available: false,
            requirements: [
              'Complete Frontend Development path',
              'Complete Backend Development path',
              'Complete at least 3 projects'
            ]
          }
        ];
        
        // Load recent results
        this.recentResults = [
          {
            id: 1,
            examTitle: 'JavaScript Fundamentals',
            subject: 'Programming',
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            duration: 45,
            score: 85,
            correctAnswers: 34,
            totalQuestions: 40,
            grade: 'B+'
          },
          {
            id: 2,
            examTitle: 'SQL Basics',
            subject: 'Database',
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            duration: 60,
            score: 92,
            correctAnswers: 46,
            totalQuestions: 50,
            grade: 'A-'
          },
          {
            id: 3,
            examTitle: 'HTML & CSS',
            subject: 'Web Development',
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            duration: 30,
            score: 78,
            correctAnswers: 23,
            totalQuestions: 30,
            grade: 'C+'
          }
        ];
        
        // Load upcoming exams
        this.upcomingExams = [
          {
            id: 1,
            title: 'Midterm Assessment',
            subject: 'Computer Science',
            scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            duration: 120,
            participants: 45,
            reminderSet: false
          },
          {
            id: 2,
            title: 'React.js Certification',
            subject: 'Web Development',
            scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            duration: 90,
            participants: 32,
            reminderSet: true
          }
        ];
        
      } catch (error) {
        console.error('Error loading exams data:', error);
        this.error = 'Failed to load exams data';
        
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    startPractice(practice) {
      console.log('Starting practice:', practice.title);
      alert(`Starting ${practice.title} practice session`);
    },
    
    startExam(exam) {
      if (!exam.available) {
        alert('This exam is not available yet. Please complete the requirements first.');
        return;
      }
      console.log('Starting exam:', exam.title);
      alert(`Starting exam: ${exam.title}`);
    },
    
    viewExamDetails(exam) {
      console.log('Viewing exam details:', exam.title);
      alert(`Viewing details for: ${exam.title}`);
    },
    
    viewResultDetails(result) {
      console.log('Viewing result details:', result.examTitle);
      alert(`Viewing detailed results for: ${result.examTitle}`);
    },
    
    retakeExam(result) {
      console.log('Retaking exam:', result.examTitle);
      alert(`Retaking exam: ${result.examTitle}`);
    },
    
    setReminder(upcoming) {
      upcoming.reminderSet = !upcoming.reminderSet;
      console.log('Reminder set for:', upcoming.title, upcoming.reminderSet);
    },
    
    formatDate(date) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    
    formatDay(date) {
      return date.getDate().toString().padStart(2, '0');
    },
    
    formatMonth(date) {
      return date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    },
    
    getScoreClass(score) {
      if (score >= 90) return 'excellent';
      if (score >= 80) return 'good';
      if (score >= 70) return 'average';
      return 'poor';
    },
    
    getGradeClass(grade) {
      if (grade.startsWith('A')) return 'grade-a';
      if (grade.startsWith('B')) return 'grade-b';
      if (grade.startsWith('C')) return 'grade-c';
      return 'grade-d';
    },
    
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.exams-container {
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

.exams-header {
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

.exam-stats {
  display: flex;
  gap: 1.5rem;
}

.exam-stats .stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.exam-stats .stat-item i {
  color: #ffd700;
}

/* Exam Sections */
.exam-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.exam-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.exam-section h2 {
  color: white;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Quick Practice Grid */
.quick-practice-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.practice-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.practice-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.practice-icon {
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

.practice-content {
  flex: 1;
}

.practice-content h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.practice-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.practice-meta {
  display: flex;
  gap: 1rem;
}

.practice-meta span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.practice-btn {
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
  flex-shrink: 0;
}

.practice-btn:hover {
  background: #5a67d8;
}

/* Exams Grid */
.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.exam-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.exam-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.exam-subject {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 600;
}

.exam-difficulty {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.exam-difficulty.beginner {
  background: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.exam-difficulty.intermediate {
  background: rgba(237, 137, 54, 0.2);
  color: #ed8936;
}

.exam-difficulty.advanced {
  background: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

.exam-content h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.exam-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.exam-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.exam-requirements {
  margin-bottom: 1rem;
}

.exam-requirements h4 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.exam-requirements ul {
  margin: 0;
  padding-left: 1rem;
}

.exam-requirements li {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.exam-actions {
  display: flex;
  gap: 0.5rem;
}

.start-exam-btn,
.details-btn {
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.start-exam-btn {
  flex: 1;
  background: #667eea;
  color: white;
}

.start-exam-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.start-exam-btn:not(:disabled):hover {
  background: #5a67d8;
}

.details-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.details-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Results List */
.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.result-info {
  flex: 1;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.result-header h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.result-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.result-details {
  display: flex;
  gap: 1rem;
}

.result-details .subject {
  color: #667eea;
  font-size: 0.9rem;
  font-weight: 600;
}

.result-details .duration {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.result-score {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border: 3px solid;
}

.score-circle.excellent {
  background: rgba(72, 187, 120, 0.2);
  border-color: #48bb78;
  color: #48bb78;
}

.score-circle.good {
  background: rgba(66, 153, 225, 0.2);
  border-color: #4299e1;
  color: #4299e1;
}

.score-circle.average {
  background: rgba(237, 137, 54, 0.2);
  border-color: #ed8936;
  color: #ed8936;
}

.score-circle.poor {
  background: rgba(245, 101, 101, 0.2);
  border-color: #f56565;
  color: #f56565;
}

.score-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.score-details span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.grade {
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.grade-a {
  background: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.grade-b {
  background: rgba(66, 153, 225, 0.2);
  color: #4299e1;
}

.grade-c {
  background: rgba(237, 137, 54, 0.2);
  color: #ed8936;
}

.grade-d {
  background: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

.result-actions {
  display: flex;
  gap: 0.5rem;
}

.view-btn,
.retake-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.retake-btn {
  background: #667eea;
  color: white;
}

.retake-btn:hover {
  background: #5a67d8;
}

/* Upcoming Exams */
.upcoming-exams {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upcoming-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.upcoming-date {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  min-width: 60px;
}

.date-day {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
}

.date-month {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  font-weight: 600;
}

.upcoming-info {
  flex: 1;
}

.upcoming-info h3 {
  color: white;
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.upcoming-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
}

.upcoming-meta {
  display: flex;
  gap: 1rem;
}

.upcoming-meta span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.reminder-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reminder-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.reminder-btn.active {
  background: #ffd700;
  color: #1a202c;
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
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #5a67d8;
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

  .exam-stats {
    flex-direction: column;
    gap: 1rem;
    padding-left: 1.5rem;
  }
}
</style>