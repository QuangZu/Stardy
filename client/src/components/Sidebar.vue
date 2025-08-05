<template>
  <div class="sidebar space-sidebar" :class="{ collapsed: isCollapsed }">
    <!-- Toggle Button -->
    <div class="sidebar-toggle" @click="toggleSidebar" v-show="isCollapsed">
      <i class="fas fa-star"></i>
    </div>

    <div class="sidebar-header">
      <div class="logo flex justify-center">
        <h2 v-show="!isCollapsed"><i class="fas fa-star"></i> Stardy</h2>
      </div>
      <button class="collapse-btn" @click="toggleSidebar" v-show="!isCollapsed">
        <i class="fas fa-angle-left"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul>
        <li class="nav-item" :class="{ active: currentRoute === 'dashboard' }">
          <router-link to="/dashboard" class="nav-link" :title="isCollapsed ? 'Dashboard' : ''">
            <i class="icon fas fa-home"></i>
            <span v-show="!isCollapsed">Dashboard</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'learning' }">
          <router-link to="/learning" class="nav-link" :title="isCollapsed ? 'Learning' : ''">
            <i class="icon fas fa-book"></i>
            <span v-show="!isCollapsed">Learning</span>
          </router-link>
        </li>

        <li class="nav-item" :class="{ active: currentRoute === 'ai-assistant' }">
          <router-link to="/ai-assistant" class="nav-link" :title="isCollapsed ? 'Assistant' : ''">
            <i class="icon fas fa-robot"></i>
            <span v-show="!isCollapsed">Assistant</span>
          </router-link>
        </li>
      </ul>
    </nav>

    <!-- User Profile at Bottom -->
    <div class="user-profile" @click="toggleUserDropdown" :class="{ active: showUserDropdown }">
      <div class="avatar">
        <img :src="getAvatarUrl()" alt="User Avatar" @error="handleAvatarError" />
      </div>
      <div class="user-info" v-show="!isCollapsed">
        <h4 class="space-text-primary">{{ userName }}</h4>
      </div>

      <!-- User Dropdown Menu -->
      <div class="user-dropdown" v-show="showUserDropdown && !isCollapsed" @click.stop>
        <!-- Admin Dashboard Access -->
        <div class="dropdown-item admin-item" v-if="isAdmin" @click="goToAdmin">
          <i class="fas fa-cog"></i>
          <span>Admin Dashboard</span>
        </div>

        <!-- User Dashboard (always visible for admins) -->
        <div class="dropdown-item" v-if="isAdmin && $route.path.startsWith('/admin')" @click="goToUserDashboard">
          <i class="fas fa-user"></i>
          <span>User Dashboard</span>
        </div>

        <!-- Account Settings -->
        <div class="dropdown-item" @click="goToAccount">
          <i class="fas fa-user-cog"></i>
          <span>Account Settings</span>
        </div>

        <!-- Logout -->
        <div class="dropdown-item logout-item" @click="handleLogout">
          <i class="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccount, checkUserRole } from '@/api/Account';
import { eventBus } from '@/utils/eventBus';

export default {
  name: 'Sidebar',
  data() {
    return {
      userName: '',
      userProfile: {
        username: '',
        email: '',
        avatar: null
      },
      userId: null,
      loading: false,
      error: null,
      defaultAvatar: 'https://stardy-3old.onrender.com/api/uploads/avatars/default-avatar.jpg',
      isCollapsed: false,
      showUserDropdown: false,
      userRole: 'user',
      isAdmin: false,
      roleLoading: false,
      avatarError: false
    };
  },
  computed: {
    currentRoute() {
      return this.$route.name?.toLowerCase() || this.$route.path.slice(1);
    },
    userInitials() {
      if (!this.userName) return 'U';
      const names = this.userName.split(' ');
      if (names.length >= 2) {
        return (names[0][0] + names[1][0]).toUpperCase();
      }
      return this.userName[0].toUpperCase();
    }
  },
  methods: {
    handleLogout() {
      this.userName = '';
      this.userProfile = {
        username: '',
        email: '',
        avatar: null
      };
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

    updateRecentActivities() {
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

          // Updated avatar handling to match Profile.vue
          this.userProfile.username = accountData.username || 'Unknown User';
          this.userProfile.email = accountData.email || '';
          this.userProfile.avatar = accountData.avatar || null;
        }

        // Load user role
        await this.loadUserRole();

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
    },

    getAvatarUrl() {
      if (this.avatarError || !this.userProfile.avatar) {
        return this.defaultAvatar;
      }

      let avatarPath = this.userProfile.avatar;
      if (avatarPath.startsWith('http')) {
        return avatarPath;
      }
      avatarPath = avatarPath.toString().trim().replace(/^\/+/, '');

      const avatarUrl = `https://stardy-3old.onrender.com/uploads/avatars/${avatarPath}`;
      console.log('Generated avatar URL:', avatarUrl);
      return avatarUrl;
    },
    
    handleAvatarError() {
      this.avatarError = true;
    },
    
    async loadUserRole() {
      try {
        this.roleLoading = true;
        const roleData = await checkUserRole();

        this.userRole = roleData.role || 'user';
        this.isAdmin = roleData.isAdmin || false;

        console.log('User role loaded:', { role: this.userRole, isAdmin: this.isAdmin });

      } catch (error) {
        console.error('Error loading user role:', error);
        // Default to user role if role check fails
        this.userRole = 'user';
        this.isAdmin = false;
      } finally {
        this.roleLoading = false;
      }
    },

    // Sidebar toggle methods
    toggleSidebar() {
      this.isCollapsed = !this.isCollapsed;
      this.showUserDropdown = false;

      // Save state to localStorage
      localStorage.setItem('sidebarCollapsed', this.isCollapsed.toString());

      // Update CSS variable for main content margin
      this.updateSidebarWidth();

      // Emit event for other components
      this.$emit('sidebar-toggle', this.isCollapsed);
    },

    updateSidebarWidth() {
      const width = this.isCollapsed ? '70px' : '280px';
      document.documentElement.style.setProperty('--sidebar-width', width);
    },

    // User dropdown methods
    toggleUserDropdown() {
      if (!this.isCollapsed) {
        this.showUserDropdown = !this.showUserDropdown;
      }
    },

    goToAdmin() {
      this.showUserDropdown = false;
      if (this.isAdmin) {
        this.$router.push('/admin');
      } else {
        console.warn('Access denied: User is not an administrator');
      }
    },

    goToUserDashboard() {
      this.showUserDropdown = false;
      // Navigate back to user dashboard
      this.$router.push('/dashboard');
    },

    goToAccount() {
      this.showUserDropdown = false;
      this.$router.push('/profile');
    },

    // Close dropdown when clicking outside
    handleClickOutside(event) {
      if (!this.$el.contains(event.target)) {
        this.showUserDropdown = false;
      }
    }
  },
  
  mounted() {
    this.loadUserData();

    // Load saved sidebar state
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      this.isCollapsed = savedState === 'true';
    }

    // Set initial CSS variable
    this.updateSidebarWidth();

    // Add click outside listener
    document.addEventListener('click', this.handleClickOutside);

    // Listen for avatar updates from Profile component
    this.avatarUpdateHandler = (newAvatar) => {
      this.userProfile.avatar = newAvatar;
      this.avatarError = false;
    };
    eventBus.on('avatar-updated', this.avatarUpdateHandler);
  },
  
  watch: {
    '$route'() {
      // Always reload user data to ensure avatar is up to date
      this.loadUserData();
    }
  },

  beforeUnmount() {
    // Remove click outside listener
    document.removeEventListener('click', this.handleClickOutside);

    // Remove avatar update listener
    if (this.avatarUpdateHandler) {
      eventBus.off('avatar-updated', this.avatarUpdateHandler);
    }
  }
};
</script>

<style scoped>
/* Sidebar Styles */
.sidebar {
  width: 250px;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  transition: width 0.5s ease-out;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar.collapsed {
  width: 70px;
}

/* Toggle Button */
.sidebar-toggle {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 2rem;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
  z-index: 101;
}

.sidebar.collapsed .sidebar-toggle {
  left: 20px;
}

.sidebar-header {
  font-size: 1.1rem;
  font-weight: 700;
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.fade-out {
  opacity: 0;
  transform: translateX(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.sidebar.collapsed .sidebar-header {
  padding: 2rem 1rem;
  justify-content: center;
}

.logo-icon-only {
  font-size: 1.5rem;
  color: #64b5f6;
}

.collapse-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

/* User Profile at Bottom */
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: auto;
}

.sidebar.collapsed .user-profile {
  align-items: center;
  padding: 0.5rem 0.5rem;
  gap: 0;
}

.sidebar.collapsed .avatar {
  position: relative;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-profile:hover {
  background: rgba(100, 181, 246, 0.1);
  border-color: rgba(100, 181, 246, 0.3);
}

.user-profile.active {
  background: rgba(100, 181, 246, 0.2);
  border-color: #64b5f6;
}

/* Updated Avatar Styles for Better Coverage */
.avatar {
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #64b5f6, #ba68c8);
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures image covers entire container */
  object-position: center; /* Centers the image */
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 3;
}

.sidebar.collapsed .avatar {
  width: 30px;
  height: 30px;
}

.sidebar.collapsed .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Maintains coverage in collapsed state */
}

/* Enhanced hover effects */
.user-profile:hover .avatar::before {
  opacity: 1;
}

.user-profile:hover .avatar {
  transform: scale(1.05);
}

.user-profile:hover .avatar img {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
}

.avatar-text {
  color: white;
  font-weight: 700;
  font-size: 1rem;
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

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 3;
}

.user-info h4 {
  color: white;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.8rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.sidebar-nav {
  flex: 1;
  padding: 0.5rem;
}

.sidebar.collapsed .sidebar-nav {
  padding: 1rem 0.5rem;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.5rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 10px;
  position: relative;
}

.sidebar.collapsed .nav-link {
  gap: 0;
}

.nav-link .icon {
  font-size: 1.2rem;
  min-width: 20px;
  text-align: center;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-info h4 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  margin-bottom: 10px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 1000;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item i {
  font-size: 1rem;
  min-width: 16px;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.logout-item:hover {
  background: rgba(244, 67, 54, 0.2);
  color: #ff5252;
}

/* Role Badge */
.role-badge {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #1a1a2e;
  padding: 8px 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.role-badge i {
  color: #ff6b35;
}

/* Admin Item */
.admin-item {
  background: rgba(255, 193, 7, 0.1);
  border-left: 3px solid #ffc107;
}

.admin-item:hover {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
}
</style>
