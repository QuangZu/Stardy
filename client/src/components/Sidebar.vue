<template>
  <div class="sidebar space-sidebar">
    <div class="sidebar-header">
      <div class="logo space-glow">
        <h2><i class="fas fa-star"></i> Stardy</h2>
      </div>
      <router-link to="/profile" class="nav-link">
        <div class="user-profile">
          <div class="avatar">
            <img :src="getAvatarUrl()" alt="User Avatar" @error="handleAvatarError" />
          </div>
          <div class="user-info">
            <h4 class="space-text-primary">{{ userName }}</h4>
            <p class="space-text-secondary">Level {{ userLevel || 0 }}</p>
          </div>
        </div>
      </router-link>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li class="nav-item" :class="{ active: currentRoute === 'dashboard' }">
          <router-link to="/dashboard" class="nav-link">
            <i class="icon fas fa-home"></i>
            <span>Dashboard</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'learning' }">
          <router-link to="/learning" class="nav-link">
            <i class="icon fas fa-book"></i>
            <span>Learning</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'exams' }">
          <router-link to="/exams" class="nav-link">
            <i class="icon fas fa-file-alt"></i>
            <span>Exams</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'progress' }">
          <router-link to="/progress" class="nav-link">
            <i class="icon fas fa-chart-line"></i>
            <span>Progress</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'notes' }">
          <router-link to="/notes" class="nav-link">
            <i class="icon fas fa-sticky-note"></i>
            <span>Notes</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'ai-tutor' }">
          <router-link to="/ai-tutor" class="nav-link">
            <i class="icon fas fa-robot"></i>
            <span>AI Tutor</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn space-button" :disabled="loading">
        <i class="icon fas fa-sign-out-alt"></i>
        <span>{{ loading ? 'Loading...' : 'Logout' }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { getAccount, getUserProgress } from '@/api/Account';
import { getUserNotes } from '@/api/Note';

export default {
  name: 'Sidebar',
  data() {
    return {
      userName: '',
      userLevel: 1,
      userAvatar: null,
      userEmail: '',
      userId: null,
      loading: false,
      error: null,
      defaultAvatar: require('@/assets/avatar/astronaunt.jpg'),
      avatarError: false,
      userStats: {
        experience: 0,
        completedQuestions: 0,
        achievements: 0,
        streak: 0
      },
      recentNotes: []
    };
  },
  computed: {
    currentRoute() {
      return this.$route.name?.toLowerCase() || this.$route.path.slice(1);
    }
  },
  methods: {
    handleLogout() {
      this.userName = '';
      this.userLevel = 1;
      this.userAvatar = '';
      this.userId = null;
      
      localStorage.removeItem('token');
      
      this.$emit('logout');
      
      this.$router.push('/login');
    },

    getUserIdFromToken() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id || payload.sub;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    },

    // Calculate level progress based on experience
    calculateLevelProgress() {
      const experiencePerLevel = 1000;
      const currentLevelExp = this.userStats.experience % experiencePerLevel;
      const progressPercentage = (currentLevelExp / experiencePerLevel) * 100;
      
      this.$emit('level-progress', {
        current: currentLevelExp,
        total: experiencePerLevel,
        percentage: progressPercentage
      });
    },

    updateRecentActivities(progressData) {
      if (progressData.examHistory && Array.isArray(progressData.examHistory)) {
        const recentActivities = progressData.examHistory
          .slice(0, 5)
          .map(exam => ({
            id: exam._id,
            type: 'exam',
            title: exam.title || 'Exam Completed',
            description: `Score: ${exam.score || 0}%`,
            date: exam.completedAt || exam.date,
            icon: 'fas fa-file-alt'
          }));
        
        this.$emit('recent-activities', recentActivities);
      }
    },

    getAvatarUrl() {
      // If there's an avatar error or no user avatar, use default
      if (this.avatarError || !this.userAvatar) {
        return this.defaultAvatar;
      }
      
      // Default fallback
      return this.defaultAvatar;
    },
    
    handleAvatarError() {
      this.avatarError = true;
    },
    
    async loadUserData() {
      try {
        this.loading = true;
        this.error = null;
        this.avatarError = false;
        
        const userId = this.getUserIdFromToken();
        if (!userId) {
          throw new Error('No valid user token found');
        }
        
        this.userId = userId;
        
        const accountData = await getAccount(userId);
        if (accountData) {
          this.userName = accountData.username || 'Unknown User';
          this.userEmail = accountData.email || '';
          this.userLevel = accountData.currentLevel || 1;
          this.userAvatar = accountData.avatar;
          
          this.userStats.experience = accountData.experience || 0;
          this.userStats.completedQuestions = accountData.completedQuestions?.length || 0;
          this.userStats.achievements = accountData.achievements?.length || 0;
          this.calculateLevelProgress();
        }
        
        try {
          const progressData = await getUserProgress(userId);
          if (progressData && progressData.studyStreak) {
            this.userStats.streak = progressData.studyStreak.currentStreak || 0;
          }
          if (progressData && progressData.examHistory) {
            this.updateRecentActivities(progressData);
          }
        } catch (progressError) {
          console.warn('Could not load user progress:', progressError);
        }
        
        try {
          const notesData = await getUserNotes(userId);
          if (Array.isArray(notesData)) {
            this.recentNotes = notesData.slice(0, 6).map(note => ({
              id: note._id,
              title: note.title || 'Untitled Note',
              content: note.content || '',
              category: note.category || 'general',
              isFavorite: note.isFavorite || false,
              updatedAt: note.date_updated || note.updatedAt
            }));
            this.$emit('recent-notes', this.recentNotes);
          }
        } catch (notesError) {
          console.error('Error loading notes data:', notesError);
          this.recentNotes = [];
        }
        
      } catch (error) {
        console.error('Error loading user data:', error);
        this.error = 'Failed to load user data';
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    }
  },
  
  mounted() {
    this.loadUserData();
  }
};
</script>

<style scoped>
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

.logout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
}
</style>