<template>
  <div class="dashboard-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading your dashboard...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadUserData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main Dashboard Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar 
        :user-name="userName" 
        :user-level="userLevel" 
        current-page="dashboard"
        @logout="logout"
      />
      
      <!-- Main Content -->
      <div class="main-content">
        <header class="dashboard-header">
          <div class="header-content">
            <h1 class="space-text-primary space-glow">Welcome back, {{ userName }}!</h1>
            <p class="space-text-secondary">Ready to continue your learning journey?</p>
          </div>
          <div class="header-actions">
            <button class="notification-btn">
              <i class="icon fas fa-bell"></i>
              <span class="notification-badge">3</span>
            </button>
          </div>
        </header>
        
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-chart-line"></i></div>
            <div class="stat-content">
              <h3>{{ userStats.experience }}</h3>
              <p>Total XP</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-fire"></i></div>
            <div class="stat-content">
              <h3>{{ userStats.streak }}</h3>
              <p>Day Streak</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-check-circle"></i></div>
            <div class="stat-content">
              <h3>{{ userStats.completedQuestions }}</h3>
              <p>Questions Solved</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"><i class="fas fa-trophy"></i></div>
            <div class="stat-content">
              <h3>{{ userStats.achievements }}</h3>
              <p>Achievements</p>
            </div>
          </div>
        </div>
        
        <!-- Subject and Level Information -->
        <div class="subject-level-section">
          <div class="section-row">
            <!-- Current Level Progress -->
            <div class="level-progress-card">
              <h2><i class="fas fa-star"></i> Level Progress</h2>
              <div class="level-info">
                <div class="current-level">
                  <span class="level-number">{{ userLevel }}</span>
                  <span class="level-label">Current Level</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: levelProgress + '%' }"></div>
                </div>
                <div class="progress-text">
                  <span>{{ userStats.experience }} / {{ nextLevelXP }} XP</span>
                  <span class="next-level">Level {{ userLevel + 1 }}</span>
                </div>
              </div>
            </div>
            
            <!-- Today's Schedule -->
            <div class="schedule-card space-card">
              <h2 class="space-text-primary"><i class="fas fa-calendar"></i> Today's Schedule</h2>
              <div class="schedule-events">
                <div class="schedule-event" v-for="event in todayEvents" :key="event.id" @click="openSchedule">
                  <div class="event-time space-text-secondary">
                    {{ event.startTime }}
                  </div>
                  <div class="event-details">
                    <h4 class="space-text-primary">{{ event.title }}</h4>
                    <p class="space-text-muted">{{ event.description }}</p>
                    <span :class="['event-type', `event-${event.type}`]">
                      <i :class="getEventIcon(event.type)"></i> {{ event.type }}
                    </span>
                  </div>
                </div>
                <div v-if="todayEvents.length === 0" class="no-events space-text-muted">
                  <i class="fas fa-calendar-times"></i>
                  <p>No events scheduled for today</p>
                </div>
              </div>
              <button class="view-schedule-btn space-button" @click="openSchedule">
                <i class="fas fa-calendar"></i> View Full Schedule
              </button>
            </div>
          </div>
        </div>
        
        <!-- Recent Notes -->
        <div class="notes-section">
          <div class="section-header">
            <h2><i class="fas fa-sticky-note"></i> Recent Notes</h2>
            <router-link to="/notes" class="view-all-btn">
              <i class="fas fa-plus"></i> View All Notes
            </router-link>
          </div>
          <div class="notes-grid">
            <div class="note-card" v-for="note in recentNotes" :key="note.id" @click="openNote(note.id)">
              <div class="note-header">
                <h4>{{ note.title }}</h4>
                <span class="note-category">{{ note.category }}</span>
              </div>
              <div class="note-content">
                <p>{{ truncateNoteContent(note.content) }}</p>
              </div>
              <div class="note-footer">
                <span class="note-date">{{ formatNoteDate(note.updatedAt) }}</span>
                <div class="note-actions">
                  <button @click.stop="toggleNoteFavorite(note)" class="favorite-btn">
                    <i :class="note.isFavorite ? 'fas fa-heart' : 'far fa-heart'"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="create-note-card" @click="createNewNote">
              <div class="create-note-content">
                <i class="fas fa-plus"></i>
                <h4>Create New Note</h4>
                <p>Add a new study note</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
            <div class="action-card" @click="startLearning">
              <div class="action-icon"><i class="fas fa-rocket"></i></div>
              <h3>Start Learning</h3>
              <p>Continue where you left off</p>
            </div>
            <div class="action-card" @click="takeExam">
              <div class="action-icon"><i class="fas fa-file-alt"></i></div>
              <h3>Take Exam</h3>
              <p>Test your knowledge</p>
            </div>
            <div class="action-card" @click="askAI">
              <div class="action-icon"><i class="fas fa-robot"></i></div>
              <h3>Ask AI Tutor</h3>
              <p>Get instant help</p>
            </div>
            <div class="action-card" @click="viewProgress">
              <div class="action-icon"><i class="fas fa-chart-bar"></i></div>
              <h3>View Progress</h3>
              <p>Track your improvement</p>
            </div>
          </div>
        </div>
        
        <!-- Recent Activity -->
        <div class="recent-activity">
          <h2>Recent Activity</h2>
          <div class="activity-list">
            <div class="activity-item" v-for="activity in recentActivities" :key="activity.id">
              <div class="activity-icon"><i :class="activity.iconClass"></i></div>
              <div class="activity-content">
                <h4>{{ activity.title }}</h4>
                <p>{{ activity.description }}</p>
                <span class="activity-time">{{ activity.time }}</span>
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
import { getUserProgress } from '@/api/UserProgress';
import { getUserNotes } from '@/api/Note';
import { getTodaySchedules } from '@/api/Schedule';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'Dashboard',
  components: {
    Sidebar
  },
  data() {
    return {
      userName: 'Loading...',
      userLevel: 1,
      userEmail: '',
      userId: null,
      userStats: {
        experience: 0,
        streak: 0,
        completedQuestions: 0,
        achievements: 0
      },
      levelProgress: 0,
      nextLevelXP: 1000,
      todayEvents: [],
      recentNotes: [],
      recentActivities: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadUserData();
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
    // Helper function to decode JWT token and get user ID
    getUserIdFromToken() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        // Decode JWT token (simple base64 decode for payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    },
    
    async loadUserData() {
      try {
        this.loading = true;
        this.error = null;
        
        // Get user ID from JWT token
        const userId = this.getUserIdFromToken();
        if (!userId) {
          throw new Error('No valid user token found');
        }
        
        this.userId = userId;
        
        // Fetch user account data
        const accountData = await getAccount(userId);
        this.userName = accountData.username;
        this.userEmail = accountData.email;
        this.userLevel = accountData.currentLevel;
        this.userAvatar = accountData.avatar;
        
        // Update user stats from account data
        this.userStats.experience = accountData.experience || 0;
        this.userStats.completedQuestions = accountData.completedQuestions?.length || 0;
        this.userStats.achievements = accountData.achievements?.length || 0;
        
        // Calculate level progress
        this.calculateLevelProgress();
        
        // Fetch user progress data
        try {
          const progressData = await getUserProgress(userId);
          if (progressData && progressData.studyStreak) {
            this.userStats.streak = progressData.studyStreak.currentStreak || 0;
          }
          
          // Update recent activities based on progress data
          if (progressData && progressData.examHistory) {
            this.updateRecentActivities(progressData);
          }
        } catch (progressError) {
          console.warn('Could not load user progress:', progressError);
          // Continue without progress data
        }
        
        // Fetch today's schedule events
        try {
          const scheduleData = await getTodaySchedules(userId);
          this.todayEvents = scheduleData.map(schedule => ({
            id: schedule._id,
            title: schedule.title,
            description: schedule.description,
            startTime: schedule.time,
            type: schedule.type
          }));
        } catch (scheduleError) {
          console.error('Error loading schedule data:', scheduleError);
          this.todayEvents = [];
        }
        
        // Fetch recent notes
        try {
          const notesData = await getUserNotes(userId);
          this.recentNotes = notesData.slice(0, 6).map(note => ({
            id: note._id,
            title: note.title,
            content: note.content,
            category: note.category,
            isFavorite: note.isFavorite,
            updatedAt: note.date_updated || note.updatedAt
          }));
        } catch (notesError) {
          console.error('Error loading notes data:', notesError);
          this.recentNotes = [];
        }
        
      } catch (error) {
        console.error('Error loading user data:', error);
        this.error = 'Failed to load user data';
        
        // If token is invalid, redirect to login
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    updateRecentActivities(progressData) {
      const activities = [];
      
      // Add recent exam completions
      if (progressData.examHistory && progressData.examHistory.length > 0) {
        const recentExams = progressData.examHistory
          .sort((a, b) => new Date(b.dateTaken) - new Date(a.dateTaken))
          .slice(0, 2);
          
        recentExams.forEach(exam => {
          activities.push({
            id: `exam-${exam.examId}`,
            iconClass: exam.passed ? 'fas fa-check-circle' : 'fas fa-file-alt',
            title: exam.passed ? 'Exam Passed!' : 'Exam Completed',
            description: `Scored ${exam.score}% ${exam.passed ? '- Well done!' : '- Keep practicing!'}`,
            time: this.formatTimeAgo(exam.dateTaken)
          });
        });
      }
      
      // Add study streak info
      if (progressData.studyStreak && progressData.studyStreak.currentStreak > 0) {
        activities.push({
          id: 'streak',
          iconClass: 'fas fa-fire',
          title: 'Study Streak Active',
          description: `${progressData.studyStreak.currentStreak} days in a row!`,
          time: this.formatTimeAgo(progressData.studyStreak.lastStudyDate)
        });
      }
      
      // Update recent activities if we have new data
      if (activities.length > 0) {
        this.recentActivities = [...activities, ...this.recentActivities].slice(0, 5);
      }
    },
    
    formatTimeAgo(dateString) {
      if (!dateString) return 'Recently';
      
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
      
      return date.toLocaleDateString();
    },
    
    startLearning() {
      this.$router.push('/learning');
    },
    takeExam() {
      this.$router.push('/exams');
    },
    askAI() {
      this.$router.push('/ai-tutor');
    },
    viewProgress() {
      this.$router.push('/progress');
    },
    logout() {
      // Clear authentication token
      localStorage.removeItem('token');
      // Redirect to login
      this.$router.push('/login');
    },
    
    calculateLevelProgress() {
      // Calculate XP needed for next level (exponential growth)
      const baseXP = 1000;
      const currentLevelXP = baseXP * Math.pow(1.5, this.userLevel - 1);
      this.nextLevelXP = Math.floor(baseXP * Math.pow(1.5, this.userLevel));
      
      // Calculate progress percentage
      const xpInCurrentLevel = this.userStats.experience - currentLevelXP;
      const xpNeededForNextLevel = this.nextLevelXP - currentLevelXP;
      this.levelProgress = Math.max(0, Math.min(100, (xpInCurrentLevel / xpNeededForNextLevel) * 100));
    },
    
    openSchedule() {
      this.$router.push('/schedule');
    },
    
    getEventIcon(eventType) {
      const iconMap = {
        'exam': 'fas fa-clipboard-check',
        'study': 'fas fa-book-open',
        'lab': 'fas fa-flask',
        'lecture': 'fas fa-chalkboard-teacher',
        'assignment': 'fas fa-file-alt',
        'meeting': 'fas fa-users'
      };
      return iconMap[eventType] || 'fas fa-calendar';
    },
    
    // Note-related methods
    openNote(noteId) {
      this.$router.push(`/notes/${noteId}`);
    },
    
    createNewNote() {
      this.$router.push('/notes/new');
    },
    
    async toggleNoteFavorite(note) {
      try {
        const { toggleNoteFavorite } = await import('../../api/Note.js');
        const updatedNote = await toggleNoteFavorite(note.id);
        note.isFavorite = updatedNote.isFavorite;
      } catch (error) {
        console.error('Error toggling note favorite:', error);
        // Revert the change if API call fails
        note.isFavorite = !note.isFavorite;
      }
    },
    
    truncateNoteContent(content) {
      return content.length > 80 ? content.substring(0, 80) + '...' : content;
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
        'History': 'fas fa-landmark',
        'Geography': 'fas fa-globe',
        'Literature': 'fas fa-book',
        'English': 'fas fa-language',
        'Art': 'fas fa-palette',
        'Music': 'fas fa-music',
        'Economics': 'fas fa-chart-line',
        'Psychology': 'fas fa-brain'
      };
      
      // Try exact match first
      if (iconMap[subjectName]) {
        return iconMap[subjectName];
      }
      
      // Try partial match
      for (const [key, icon] of Object.entries(iconMap)) {
        if (subjectName.toLowerCase().includes(key.toLowerCase())) {
          return icon;
        }
      }
      
      // Default icon
      return 'fas fa-book';
    },
    
    formatNoteDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
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

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
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

.notification-btn {
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #ff4757;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.stat-icon {
  font-size: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content h3 {
  color: white;
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.stat-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 2rem;
}

.quick-actions h2 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.15);
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.action-card h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.action-card p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.9rem;
}

/* Recent Activity */
.recent-activity h2 {
  color: white;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.activity-list {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  font-size: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.activity-content h4 {
  color: white;
  margin: 0;
  font-size: 1rem;
}

.activity-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.activity-time {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
}

/* Subject and Level Section Styles */
.subject-level-section {
  margin: 2rem 0;
}

.section-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.level-progress-card, .schedule-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.level-progress-card h2, .schedule-card h2 {
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.level-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.current-level {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.level-number {
  font-size: 3rem;
  font-weight: bold;
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.level-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.progress-text {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.next-level {
  color: #ffd700;
  font-weight: 600;
}

.schedule-events {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.schedule-event {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.schedule-event:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.event-time {
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 80px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 0.5rem;
}

.event-details {
  flex: 1;
}

.event-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
}

.event-details p {
  margin: 0 0 0.5rem 0;
  font-size: 0.85rem;
}

.event-type {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.event-exam {
  background: rgba(255, 107, 107, 0.2);
  color: #ff6b6b;
}

.event-study {
  background: rgba(74, 144, 226, 0.2);
  color: #4a90e2;
}

.event-lab {
  background: rgba(123, 201, 111, 0.2);
  color: #7bc96f;
}

.no-events {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.5);
}

.no-events i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.no-events p {
  margin: 0;
  font-size: 0.9rem;
}

.view-schedule-btn {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.view-schedule-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Enhanced Icon Styles */
.icon {
  font-size: 1.2rem;
  width: 1.2rem;
  text-align: center;
}

.stat-icon i {
  font-size: 1.5rem;
}

.action-icon i {
  font-size: 2rem;
}

.activity-icon i {
  font-size: 1.2rem;
}

.notification-btn i {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
}

.loading-spinner i {
  font-size: 2rem;
  color: white;
}

.error-icon i {
  font-size: 2rem;
  color: #ff4757;
}

/* Notes Section Styles */
.notes-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.note-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.note-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.note-header h4 {
  color: white;
  margin: 0;
  font-size: 1rem;
  flex: 1;
}

.note-category {
  background: rgba(102, 126, 234, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.note-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.4;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
}

.note-actions {
  display: flex;
  gap: 0.25rem;
}

.favorite-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.favorite-btn:hover {
  color: #ff6b6b;
}

.create-note-card {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.create-note-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.create-note-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.create-note-content i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
}

.create-note-content h4 {
  margin: 0 0 0.25rem 0;
  color: white;
  font-size: 1rem;
}

.create-note-content p {
  margin: 0;
  font-size: 0.8rem;
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