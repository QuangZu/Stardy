<template>
  <div class="admin-sidebar space-sidebar">
    <div class="sidebar-header">
      <div class="logo space-glow">
        <h2><i class="fas fa-shield-alt"></i> Admin </h2>
      </div>
      <div class="admin-profile">
        <div class="avatar">
          <i class="fas fa-user-shield"></i>
        </div>
        <div class="admin-info">
          <h4 class="space-text-primary">{{ currentUser.username || 'Administrator' }}</h4>
          <p class="space-text-secondary">Admin Access</p>
        </div>
      </div>
    </div>
    
    <nav class="sidebar-nav">
      <ul>
        <li class="nav-item" :class="{ active: currentRoute === 'accounts' }">
          <router-link to="/admin/accounts" class="nav-link">
            <i class="icon fas fa-users"></i>
            <span>Accounts</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'subjects' }">
          <router-link to="/admin/subjects" class="nav-link">
            <i class="icon fas fa-book"></i>
            <span>Subjects</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'questions' }">
          <router-link to="/admin/questions" class="nav-link">
            <i class="icon fas fa-question-circle"></i>
            <span>Questions</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'exams' }">
          <router-link to="/admin/exams" class="nav-link">
            <i class="icon fas fa-clipboard-list"></i>
            <span>Exams</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'ai-health' }">
          <router-link to="/admin/ai-health" class="nav-link">
            <i class="icon fas fa-robot"></i>
            <span>AI Health</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'stats' }">
          <router-link to="/admin/stats" class="nav-link">
            <i class="icon fas fa-chart-bar"></i>
            <span>Statistics</span>
          </router-link>
        </li>
        <li class="nav-item" :class="{ active: currentRoute === 'system' }">
          <router-link to="/admin/system" class="nav-link">
            <i class="icon fas fa-cog"></i>
            <span>System</span>
          </router-link>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <button @click="handleLogout" class="logout-btn space-button">
        <i class="icon fas fa-sign-out-alt"></i>
        <span>Logout</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminNavigation',
  props: {
    currentRoute: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentUser: JSON.parse(localStorage.getItem('user') || '{}')
    }
  },
  methods: {
    handleLogout() {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>
/* Admin Sidebar Styles */
.admin-sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header {
  font-size: 1.5rem;
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  margin-bottom: 1.5rem;
}

.logo h2 {
  color: #fff;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.logo i {
  margin-right: 0.5rem;
  color: #ffd700;
}

.admin-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.admin-profile:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.admin-profile:hover .avatar {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
}

.avatar i {
  color: #1a1a2e;
  font-size: 1.2rem;
}

.admin-info h4 {
  color: white;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.admin-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.8rem;
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
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
  padding: 1rem 1.25rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-link:hover::before {
  left: 100%;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(5px);
}

.nav-item.active .nav-link {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1));
  color: #ffd700;
  border-left: 3px solid #ffd700;
}

.nav-item.active .nav-link .icon {
  color: #ffd700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.icon {
  width: 20px;
  text-align: center;
  font-size: 1.1rem;
  transition: all 0.3s ease;
}

.nav-link:hover .icon {
  transform: scale(1.1);
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
  background: linear-gradient(135deg, #dc3545, #c82333);
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #c82333, #bd2130);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(220, 53, 69, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
}

/* Space theme effects */
.space-glow {
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}

.space-text-primary {
  color: #ffffff;
}

.space-text-secondary {
  color: rgba(255, 255, 255, 0.7);
}

/* Responsive Design */
@media (max-width: 768px) {
  .admin-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .admin-sidebar.mobile-open {
    transform: translateX(0);
  }
}

/* Scrollbar styling */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>