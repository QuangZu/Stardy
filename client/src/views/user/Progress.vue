<template>
  <div class="progress-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" class="particle" 
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animationDelay: Math.random() * 3 + 's',
             width: (Math.random() * 4 + 2) + 'px',
             height: (Math.random() * 4 + 2) + 'px'
           }"></div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading your progress...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadProgressData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main Progress Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar 
        :userName="userName" 
        :userLevel="userLevel" 
        currentPage="progress"
        @logout="logout"
      />
      
      <!-- Main Content -->
      <div class="main-content">
        <header class="progress-header">
          <div class="header-content space-glow">
            <h1><i class="fas fa-chart-line"></i> Learning Progress</h1>
            <p>Track your learning journey and achievements</p>
          </div>
          <div class="time-filter">
            <select v-model="selectedTimeframe" @change="updateCharts" class="timeframe-select">
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </header>
        
        <!-- Progress Overview -->
        <div class="progress-overview">
          <div class="overview-cards">
            <div class="overview-card">
              <div class="card-icon"><i class="fas fa-trophy"></i></div>
              <div class="card-content">
                <h3>{{ progressStats.totalXP }}</h3>
                <p>Total XP Earned</p>
                <span class="change positive">+{{ progressStats.xpThisWeek }} this week</span>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon"><i class="fas fa-fire"></i></div>
              <div class="card-content">
                <h3>{{ progressStats.currentStreak }}</h3>
                <p>Day Streak</p>
                <span class="change positive">{{ progressStats.streakStatus }}</span>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon"><i class="fas fa-clock"></i></div>
              <div class="card-content">
                <h3>{{ progressStats.totalStudyTime }}h</h3>
                <p>Study Time</p>
                <span class="change positive">+{{ progressStats.studyTimeThisWeek }}h this week</span>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon"><i class="fas fa-check-circle"></i></div>
              <div class="card-content">
                <h3>{{ progressStats.completedLessons }}</h3>
                <p>Lessons Completed</p>
                <span class="change positive">{{ progressStats.completionRate }}% completion rate</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Charts Section -->
        <div class="charts-section">
          <div class="charts-grid">
            <!-- Study Time Chart -->
            <div class="chart-card">
              <h3><i class="fas fa-chart-area"></i> Study Time Trend</h3>
              <div class="chart-placeholder">
                <div class="mock-chart">
                  <div class="chart-bars">
                    <div class="bar" style="height: 60%"></div>
                    <div class="bar" style="height: 80%"></div>
                    <div class="bar" style="height: 45%"></div>
                    <div class="bar" style="height: 90%"></div>
                    <div class="bar" style="height: 70%"></div>
                    <div class="bar" style="height: 85%"></div>
                    <div class="bar" style="height: 95%"></div>
                  </div>
                  <div class="chart-labels">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Subject Progress Chart -->
            <div class="chart-card">
              <h3><i class="fas fa-chart-pie"></i> Subject Progress</h3>
              <div class="subject-progress-list">
                <div v-for="subject in subjectProgress" :key="subject.id" class="subject-progress-item">
                  <div class="subject-info">
                    <i :class="subject.icon"></i>
                    <span>{{ subject.name }}</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: subject.progress + '%' }"></div>
                  </div>
                  <span class="progress-percentage">{{ subject.progress }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Achievements Section -->
        <div class="achievements-section">
          <h2><i class="fas fa-medal"></i> Recent Achievements</h2>
          <div class="achievements-grid">
            <div v-for="achievement in recentAchievements" :key="achievement.id" class="achievement-card">
              <div class="achievement-icon">
                <i :class="achievement.icon"></i>
              </div>
              <div class="achievement-content">
                <h4>{{ achievement.title }}</h4>
                <p>{{ achievement.description }}</p>
                <span class="achievement-date">{{ achievement.dateEarned }}</span>
              </div>
              <div class="achievement-badge">
                <i class="fas fa-star"></i>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Goals Section -->
        <div class="goals-section">
          <h2><i class="fas fa-target"></i> Learning Goals</h2>
          <div class="goals-grid">
            <div v-for="goal in learningGoals" :key="goal.id" class="goal-card">
              <div class="goal-header">
                <h4>{{ goal.title }}</h4>
                <span class="goal-deadline">{{ goal.deadline }}</span>
              </div>
              <p>{{ goal.description }}</p>
              <div class="goal-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: goal.progress + '%' }"></div>
                </div>
                <span class="progress-text">{{ goal.progress }}% Complete</span>
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
import { getAllSubjects } from '@/api/Subject';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'Progress',
  components: {
    Sidebar
  },
  data() {
    return {
      userName: 'Loading...',
      userLevel: 1,
      userId: null,
      selectedTimeframe: 'week',
      progressStats: {
        totalXP: 0,
        xpThisWeek: 0,
        currentStreak: 0,
        streakStatus: 'Keep it up!',
        totalStudyTime: 0,
        studyTimeThisWeek: 0,
        completedLessons: 0,
        completionRate: 0
      },
      subjectProgress: [],
      recentAchievements: [],
      learningGoals: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadProgressData();
  },
  methods: {
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
    
    async loadProgressData() {
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
        
        // Load user progress data
        let userProgressData = null;
        try {
          userProgressData = await getUserProgress(userId);
        } catch (progressError) {
          console.warn('Could not load user progress:', progressError);
        }
        
        // Load progress statistics
        this.progressStats = {
          totalXP: accountData.experience || 0,
          xpThisWeek: this.calculateWeeklyXP(accountData),
          currentStreak: accountData.currentStreak || 0,
          streakStatus: this.getStreakStatus(accountData.currentStreak || 0),
          totalStudyTime: accountData.totalStudyTime || 0,
          studyTimeThisWeek: accountData.todayStudyTime || 0,
          completedLessons: accountData.completedLessons?.length || 0,
          completionRate: this.calculateCompletionRate(userProgressData)
        };
        
        // Load subject progress from API
        try {
          const subjectsData = await getAllSubjects();
          this.subjectProgress = subjectsData.map(subject => ({
            id: subject._id,
            name: subject.name,
            icon: this.getSubjectIcon(subject.name),
            progress: this.getSubjectProgress(subject._id, userProgressData)
          }));
        } catch (subjectError) {
          console.warn('Could not load subjects:', subjectError);
          this.subjectProgress = [];
        }
        
        // Generate achievements based on real data
         this.recentAchievements = this.generateAchievements(accountData);
        
        // Generate learning goals based on subjects and progress
        this.learningGoals = await this.generateLearningGoals(userProgressData);
        
      } catch (error) {
        console.error('Error loading progress data:', error);
        this.error = 'Failed to load progress data';
        
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    updateCharts() {
      console.log('Updating charts for timeframe:', this.selectedTimeframe);
      // Here you would update the chart data based on the selected timeframe
    },
    
    calculateWeeklyXP(accountData) {
      // Calculate XP gained this week based on recent activity
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // For now, return a portion of total XP as weekly XP
      // This could be enhanced with actual weekly tracking
      return Math.floor((accountData.experience || 0) * 0.1);
    },
    
    getStreakStatus(streak) {
      if (streak >= 30) return 'Amazing streak! 🔥';
      if (streak >= 14) return 'Great momentum! 💪';
      if (streak >= 7) return 'Keep it up! 👍';
      if (streak >= 3) return 'Good start! 📈';
      if (streak >= 1) return 'Getting started! 🌱';
      return 'Start your streak today! ⭐';
    },
    
    calculateCompletionRate(userProgressData) {
      if (!userProgressData || !userProgressData.length) return 0;
      
      const totalProgress = userProgressData.reduce((sum, progress) => sum + progress.progress, 0);
      return Math.round(totalProgress / userProgressData.length);
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
      if (!userProgressData) return 0;
      
      const subjectProgress = userProgressData.find(progress => progress.subjectId === subjectId);
      return subjectProgress ? subjectProgress.progress : 0;
    },
    
    generateAchievements(accountData) {
      const achievements = [];
      
      // Streak-based achievements
      if (accountData.currentStreak >= 7) {
        achievements.push({
          id: 1,
          title: 'Week Warrior',
          description: `Studied for ${accountData.currentStreak} consecutive days`,
          icon: 'fas fa-fire',
          dateEarned: this.getRelativeDate(new Date())
        });
      }
      
      // XP-based achievements
      if (accountData.experience >= 1000) {
        achievements.push({
          id: 2,
          title: 'Knowledge Seeker',
          description: 'Earned over 1000 XP',
          icon: 'fas fa-star',
          dateEarned: this.getRelativeDate(new Date())
        });
      }
      
      // Lesson completion achievements
      if (accountData.completedLessons && accountData.completedLessons.length >= 10) {
        achievements.push({
          id: 3,
          title: 'Dedicated Learner',
          description: `Completed ${accountData.completedLessons.length} lessons`,
          icon: 'fas fa-graduation-cap',
          dateEarned: this.getRelativeDate(new Date())
        });
      }
      
      return achievements.slice(0, 3); // Show only top 3 achievements
    },
    
    async generateLearningGoals(userProgressData) {
      const goals = [];
      
      try {
        // Get subjects to create goals for
        const subjects = await getAllSubjects();
        
        subjects.slice(0, 3).forEach((subject, index) => {
          const progress = this.getSubjectProgress(subject._id, userProgressData);
          const deadline = new Date();
          deadline.setMonth(deadline.getMonth() + 2 + index); // Stagger deadlines
          
          goals.push({
            id: index + 1,
            title: `Master ${subject.name}`,
            description: `Complete all ${subject.name} modules and exercises`,
            progress: progress,
            deadline: deadline.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric' 
            })
          });
        });
      } catch (error) {
        console.warn('Could not generate learning goals:', error);
        // Fallback goals
        goals.push({
          id: 1,
          title: 'Complete Current Course',
          description: 'Finish all modules in your current course',
          progress: 50,
          deadline: 'Dec 31, 2024'
        });
      }
      
      return goals;
    },
    
    getRelativeDate(date) {
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day ago';
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 14) return '1 week ago';
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
      return `${Math.floor(diffDays / 30)} months ago`;
    },
    
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.progress-container {
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

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
}

.progress-header {
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

.timeframe-select {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

/* Progress Overview */
.progress-overview {
  margin-bottom: 2rem;
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.overview-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-icon {
  font-size: 2rem;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-content h3 {
  color: white;
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.card-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.change {
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.change.positive {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.2);
}

/* Charts Section */
.charts-section {
  margin-bottom: 2rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.chart-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.chart-card h3 {
  color: white;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mock-chart {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.chart-bars {
  display: flex;
  align-items: end;
  gap: 0.5rem;
  height: 160px;
}

.bar {
  flex: 1;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-top: 0.5rem;
}

.subject-progress-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.subject-progress-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.subject-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 120px;
  color: white;
  font-size: 0.9rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-percentage {
  color: white;
  font-size: 0.8rem;
  min-width: 40px;
  text-align: right;
}

/* Achievements Section */
.achievements-section {
  margin-bottom: 2rem;
}

.achievements-section h2 {
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.achievement-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
}

.achievement-icon {
  font-size: 2rem;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.2);
  border-radius: 12px;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.achievement-content h4 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.achievement-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

.achievement-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.achievement-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #ffd700;
  font-size: 1.2rem;
}

/* Goals Section */
.goals-section h2 {
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.goals-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.goal-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
}

.goal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.goal-header h4 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.goal-deadline {
  color: #ffd700;
  font-size: 0.8rem;
  background: rgba(255, 215, 0, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.goal-card p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
}

.goal-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-text {
  color: white;
  font-size: 0.8rem;
  min-width: 80px;
}

/* Loading and Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  text-align: center;
}

.loading-spinner, .error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  margin-top: 1rem;
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