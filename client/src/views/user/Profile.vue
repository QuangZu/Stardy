<template>
  <div class="profile-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading your profile...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadUserData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main Profile Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar 
        :user-name="userName" 
        :user-level="userLevel" 
        current-page="profile"
        @logout="logout"
      />
      
      <!-- Main Content -->
      <div class="main-content">
        <header class="profile-header">
          <div class="header-content">
            <h1><i class="fas fa-user"></i> My Profile</h1>
            <p>Manage your account settings and preferences</p>
          </div>
        </header>
        
        <!-- Profile Information -->
        <div class="profile-sections">
          <!-- Personal Information -->
          <div class="profile-section">
            <h2><i class="fas fa-id-card"></i> Personal Information</h2>
            <div class="profile-card">
              <div class="profile-avatar">
                <img src="https://via.placeholder.com/120" alt="Profile Avatar" />
                <button class="change-avatar-btn">
                  <i class="fas fa-camera"></i>
                </button>
              </div>
              <div class="profile-details">
                <div class="detail-group">
                  <label>Username</label>
                  <input v-model="userProfile.username" type="text" :disabled="!editMode" />
                </div>
                <div class="detail-group">
                  <label>Email</label>
                  <input v-model="userProfile.email" type="email" :disabled="!editMode" />
                </div>
                <div class="detail-group">
                  <label>Bio</label>
                  <textarea v-model="userProfile.bio" :disabled="!editMode" rows="3"></textarea>
                </div>
              </div>
            </div>
            <div class="profile-actions">
              <button v-if="!editMode" @click="enableEdit" class="edit-btn">
                <i class="fas fa-edit"></i> Edit Profile
              </button>
              <template v-else>
                <button @click="saveProfile" class="save-btn">
                  <i class="fas fa-save"></i> Save Changes
                </button>
                <button @click="cancelEdit" class="cancel-btn">
                  <i class="fas fa-times"></i> Cancel
                </button>
              </template>
            </div>
          </div>
          
          <!-- Account Statistics -->
          <div class="profile-section">
            <h2><i class="fas fa-chart-bar"></i> Account Statistics</h2>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-calendar"></i></div>
                <div class="stat-info">
                  <h3>{{ accountStats.memberSince }}</h3>
                  <p>Member Since</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-trophy"></i></div>
                <div class="stat-info">
                  <h3>Level {{ userLevel }}</h3>
                  <p>Current Level</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-star"></i></div>
                <div class="stat-info">
                  <h3>{{ accountStats.totalXP }}</h3>
                  <p>Total Experience</p>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="fas fa-fire"></i></div>
                <div class="stat-info">
                  <h3>{{ accountStats.longestStreak }}</h3>
                  <p>Longest Streak</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Security Settings -->
          <div class="profile-section">
            <h2><i class="fas fa-shield-alt"></i> Security Settings</h2>
            <div class="security-options">
              <div class="security-item">
                <div class="security-info">
                  <h3>Change Password</h3>
                  <p>Update your account password</p>
                </div>
                <button @click="showPasswordModal = true" class="security-btn">
                  <i class="fas fa-key"></i> Change
                </button>
              </div>
              <div class="security-item">
                <div class="security-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security</p>
                </div>
                <button class="security-btn">
                  <i class="fas fa-mobile-alt"></i> Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Password Change Modal -->
    <div v-if="showPasswordModal" class="modal-overlay" @click="showPasswordModal = false">
      <div class="modal-content" @click.stop>
        <h3><i class="fas fa-key"></i> Change Password</h3>
        <form @submit.prevent="changePassword">
          <div class="form-group">
            <label>Current Password</label>
            <input v-model="passwordForm.current" type="password" required />
          </div>
          <div class="form-group">
            <label>New Password</label>
            <input v-model="passwordForm.new" type="password" required />
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input v-model="passwordForm.confirm" type="password" required />
          </div>
          <div class="modal-actions">
            <button type="submit" class="save-btn">
              <i class="fas fa-save"></i> Update Password
            </button>
            <button type="button" @click="showPasswordModal = false" class="cancel-btn">
              <i class="fas fa-times"></i> Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccount } from '@/api/Account';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'Profile',
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
      userProfile: {
        username: '',
        email: '',
        bio: ''
      },
      accountStats: {
        memberSince: '',
        totalXP: 0,
        longestStreak: 0
      },
      editMode: false,
      originalProfile: {},
      showPasswordModal: false,
      passwordForm: {
        current: '',
        new: '',
        confirm: ''
      },
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
    getUserIdFromToken() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (error) {
        console.error('Error decoding token:', error);
        this.showError('Error decoding authentication token');
        return null;
      }
    },
    
    async loadUserData() {
      try {
        this.loading = true;
        this.error = null;
        
        const userId = this.getUserIdFromToken();
        if (!userId) {
          throw new Error('No valid user token found');
        }
        
        this.userId = userId;
        
        const accountData = await getAccount(userId);
        this.userName = accountData.username || 'User';
        this.userLevel = accountData.currentLevel || 1;
        
        this.userProfile = {
          username: accountData.username || '',
          email: accountData.email || '',
          bio: accountData.bio || 'No bio available'
        };
        
        this.accountStats = {
          memberSince: this.formatDate(accountData.createdAt),
          totalXP: accountData.experience || 0,
          longestStreak: accountData.longestStreak || 0
        };
        
      } catch (error) {
        console.error('Error loading user data:', error);
        this.error = 'Failed to load profile data';
        this.showError('Failed to load profile data');
        
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    },
    
    enableEdit() {
      this.editMode = true;
      this.originalProfile = { ...this.userProfile };
    },
    
    cancelEdit() {
      this.editMode = false;
      this.userProfile = { ...this.originalProfile };
    },
    
    async saveProfile() {
      try {
        // Here you would call an API to update the profile
        // await updateAccount(this.userId, this.userProfile);
        
        this.editMode = false;
        this.showSuccess('Profile updated successfully!');
      } catch (error) {
        console.error('Error saving profile:', error);
        this.showError('Failed to update profile');
      }
    },
    
    async changePassword() {
      if (this.passwordForm.new !== this.passwordForm.confirm) {
        this.showWarning('New passwords do not match');
        return;
      }
      
      try {
        // Here you would call an API to change the password
        // await changePassword(this.userId, this.passwordForm);
        
        this.showPasswordModal = false;
        this.passwordForm = { current: '', new: '', confirm: '' };
        this.showSuccess('Password changed successfully!');
      } catch (error) {
        console.error('Error changing password:', error);
        this.showError('Failed to change password');
      }
    },
    
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.profile-container {
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-profile {
    padding: 0; /* Keep no padding on mobile */
  }
  
  .avatar img {
    width: 36px;
    height: 36px;
  }
  
  .user-info h4 {
    font-size: 0.85rem;
  }
  
  .user-info p {
    font-size: 0.75rem;
  }
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
}

.profile-header {
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

/* Profile Sections */
.profile-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
}

.profile-section h2 {
  color: white;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Profile Card */
.profile-card {
  display: flex;
  gap: 2rem;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  position: relative;
}

.profile-avatar img {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #667eea;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.change-avatar-btn:hover {
  background: #5a67d8;
  transform: scale(1.1);
}

.profile-details {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-group {
  display: flex;
  flex-direction: column;
}

.detail-group:nth-child(4) {
  grid-column: 1 / -1;
}

.detail-group label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.detail-group input,
.detail-group textarea {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.9rem;
}

.detail-group input:disabled,
.detail-group textarea:disabled {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
}

.detail-group input:focus,
.detail-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* Profile Actions */
.profile-actions {
  display: flex;
  gap: 1rem;
}

.edit-btn,
.save-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.edit-btn {
  background: #667eea;
  color: white;
}

.save-btn {
  background: #48bb78;
  color: white;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.edit-btn:hover {
  background: #5a67d8;
}

.save-btn:hover {
  background: #38a169;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: 12px;
}

.stat-icon {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
}

.stat-info h3 {
  color: white;
  margin: 0;
  font-size: 1.2rem;
}

.stat-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

/* Security Options */
.security-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
}

.security-info h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
}

.security-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0 0 0;
  font-size: 0.9rem;
}

.security-btn {
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
}

.security-btn:hover {
  background: #5a67d8;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
}

.modal-content h3 {
  color: white;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem;
  color: white;
  font-size: 0.9rem;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
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
    width: 100%;
    position: relative;
    height: auto;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-details {
    grid-template-columns: 1fr;
  }
  
  .security-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
}

</style>