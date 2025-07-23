<template>
  <div class="role-router">
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Checking access permissions...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <h2>Access Error</h2>
      <p>{{ error }}</p>
      <button @click="$router.push('/login')" class="btn btn-primary">
        Go to Login
      </button>
    </div>
  </div>
</template>

<script>
import { checkUserRole } from '@/api/Account';

export default {
  name: 'RoleBasedRouter',
  data() {
    return {
      loading: true,
      error: null,
      userRole: null
    };
  },
  async mounted() {
    await this.checkUserAccess();
  },
  methods: {
    async checkUserAccess() {
      try {
        this.loading = true;
        this.error = null;
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          this.$router.push('/login');
          return;
        }
        
        // Check user role
        const roleData = await checkUserRole();
        this.userRole = roleData.role;
        
        // Redirect based on role
        if (roleData.isAdmin) {
          this.$router.push('/admin');
        } else {
          this.$router.push('/client');
        }
        
      } catch (error) {
        console.error('Role check failed:', error);
        
        if (error.response?.status === 401) {
          // Token is invalid or expired
          localStorage.removeItem('token');
          this.$router.push('/login');
        } else {
          this.error = 'Failed to verify access permissions. Please try again.';
        }
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style scoped>
.role-router {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.loading-container, .error-container {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 90%;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container h2 {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-container p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s;
}

.btn-primary {
  background-color: #667eea;
  color: white;
}

.btn-primary:hover {
  background-color: #5a6fd8;
}
</style>