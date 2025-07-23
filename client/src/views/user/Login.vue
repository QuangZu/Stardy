<template>
  <div class="min-h-screen space-background text-white relative overflow-x-hidden" style="padding-top: 80px;">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>

    <!-- Navigation Header -->
    <Navigation />

    <!-- Login Content -->
    <main class="relative z-10 py-16">
      <div class="max-w-md mx-auto px-8">
        <div class="text-center mb-8 fade-in-up">
          <div class="text-6xl mb-4">👋</div>
          <h1 class="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p class="text-lg opacity-90">
            Ready to continue your learning journey? Sign in to access your study materials.
          </p>
        </div>
        
        <!-- Login Form -->
        <div class="login-form-card fade-in-up">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label class="block text-sm font-medium mb-2">Email Address</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">📧</span>
                <input 
                  type="email" 
                  v-model="email"
                  @blur="validateEmail"
                  :class="{
                    'border-red-400': emailError,
                    'border-green-400': email && !emailError
                  }"
                  class="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-white placeholder-opacity-60"
                  placeholder="Enter your email"
                  required
                >
              </div>
              <div v-if="emailError" class="mt-1 text-red-300 text-xs">
                ❌ {{ emailError }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔒</span>
                <input 
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  @blur="validatePassword"
                  :class="{
                    'border-red-400': passwordError,
                    'border-green-400': password && !passwordError
                  }"
                  class="w-full pl-12 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-white placeholder-opacity-60"
                  placeholder="Enter your password"
                  required
                >
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xl hover:scale-110 transition-transform"
                >
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
              <div v-if="passwordError" class="mt-1 text-red-300 text-xs">
                ❌ {{ passwordError }}
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input type="checkbox" v-model="rememberMe" class="mr-2 rounded">
                <span class="text-sm">Remember me</span>
              </label>
              <a href="#" class="text-sm text-blue-300 hover:text-blue-200 transition-colors">
                Forgot password?
              </a>
            </div>
            
            <button 
              type="submit" 
              class="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              :disabled="loading || !isFormValid"
              :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
            >
              <span v-if="loading">Signing in... ⏳</span>
              <span v-else>Sign In 🚀</span>
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <p class="text-sm opacity-80">
              Don't have an account? 
              <router-link to="/register" class="text-blue-300 hover:text-blue-200 transition-colors font-medium">
                Sign up here
              </router-link>
            </p>
          </div>
          
          <!-- Social Login -->
          <div class="mt-8">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white border-opacity-20"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-transparent text-white opacity-80">Or continue with</span>
              </div>
            </div>
            
            <div class="mt-6 grid grid-cols-2 gap-3">
              <button class="social-login-btn">
                <span class="text-xl">🔵</span>
                <span>Google</span>
              </button>
              <button class="social-login-btn">
                <span class="text-xl">📘</span>
                <span>Facebook</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { login } from '@/api/Auth'
import Navigation from '@/components/Navigation.vue'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      loading: false,
      emailError: '',
      passwordError: ''
    }
  },
  components: {
    Navigation
  },
  computed: {
    isFormValid() {
      return this.email && 
             this.password && 
             !this.emailError &&
             !this.passwordError;
    }
  },
  mounted() {
    this.observeAnimations();
  },
  methods: {
    validateEmail() {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!this.email) {
        this.emailError = 'Email is required';
      } else if (!emailRegex.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
      } else {
        this.emailError = '';
      }
    },
    
    validatePassword() {
      if (!this.password) {
        this.passwordError = 'Password is required';
      } else if (this.password.length < 6) {
        this.passwordError = 'Password must be at least 6 characters';
      } else {
        this.passwordError = '';
      }
    },
    
    async handleLogin() {
      // Validate fields before submission
      this.validateEmail();
      this.validatePassword();
      
      if (!this.isFormValid) {
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await login(
          this.email,
          this.password
        );
        
        console.log('Login successful:', response);
        
        // Store the actual token from response
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Redirect to role-based access checker
        this.$router.push('/access');
      } catch (error) {
        console.error('Login error:', error);
        // Show user-friendly error message
        alert('Login failed. Please check your credentials and try again.');
      } finally {
        this.loading = false;
      }
    },
    
    observeAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      }, { threshold: 0.1 });
      
      document.querySelectorAll('.fade-in-up').forEach(el => {
        observer.observe(el);
      });
    },
    getParticleSize(index) {
      const sizes = ['small', 'medium', 'large'];
      return sizes[index % 3];
    },
    getParticleColor(index) {
      const colors = ['blue', 'purple', 'cyan', 'white'];
      return `particle-${colors[index % 4]}`;
    }
  }
}
</script>

<style scoped>
.login-form-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.login-form-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.social-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  cursor: pointer;
}

.social-login-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.fade-in-up.animate {
  opacity: 1;
  transform: translateY(0);
}
</style>