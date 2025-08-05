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
          <div class="text-6xl mb-4"><i class="fas fa-star"></i></div>
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
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl"><i class="fas fa-envelope"></i></span>
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
                <i class="fas fa-times-circle"></i> {{ emailError }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl"><i class="fas fa-lock"></i></span>
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
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div v-if="passwordError" class="mt-1 text-red-300 text-xs">
                <i class="fas fa-times-circle"></i> {{ passwordError }}
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
              <span v-if="loading"><i class="fas fa-spinner fa-spin"></i> Signing in...</span>
              <span v-else>Sign In</span>
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
          <div class="mt-8" v-if="googleSignInEnabled">
            <div class="relative">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-white border-opacity-20"></div>
              </div>
              <div class="relative flex justify-center text-sm">
                <span class="px-2 bg-transparent text-white opacity-80">Or continue with</span>
              </div>
            </div>

            <div class="mt-6">
              <button
                @click="handleGoogleSignIn"
                :disabled="loading"
                class="w-full google-signin-btn"
              >
                <div class="google-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          <!-- Firebase Configuration Notice -->
          <div v-if="!googleSignInEnabled" class="mt-8 p-4 bg-yellow-500 bg-opacity-20 border border-yellow-400 rounded-lg">
            <div class="flex items-center">
              <i class="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
              <span class="text-sm text-yellow-200">
                Google Sign-In is temporarily disabled. Please use email/password login.
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { login, signInWithGoogle } from '@/api/Auth'
import Navigation from '@/components/Navigation.vue'
import { useNotification } from '@/composables/useNotification'

export default {
  name: 'LoginView',
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
      email: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      googleSignInEnabled: true, // Re-enabled after Firebase configuration
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

    // Listen for Google sign-in events from redirect
    window.addEventListener('googleSignInSuccess', this.handleGoogleSignInSuccess);
    window.addEventListener('googleSignInError', this.handleGoogleSignInError);
  },

  beforeUnmount() {
    // Clean up event listeners
    window.removeEventListener('googleSignInSuccess', this.handleGoogleSignInSuccess);
    window.removeEventListener('googleSignInError', this.handleGoogleSignInError);
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
        this.showError('Login failed. Please check your credentials and try again.');
      } finally {
        this.loading = false;
      }
    },

    async handleGoogleSignIn() {
      if (this.loading) return;

      this.loading = true;

      try {
        console.log('Starting Google sign-in...');

        const result = await signInWithGoogle();

        // Handle redirect case
        if (result && result.redirecting) {
          this.showInfo('Redirecting to Google for authentication...');
          // Don't set loading to false as page will redirect
          return;
        }

        if (result.success && result.token) {
          // Store token
          localStorage.setItem('token', result.token);

          this.showSuccess(`Welcome back, ${result.user.username}! 🎉`);

          // Redirect to dashboard
          setTimeout(() => {
            this.$router.push('/dashboard');
          }, 1000);
        } else {
          throw new Error(result.message || 'Google sign-in failed');
        }

      } catch (error) {
        console.error('Google sign-in error:', error);

        // Handle specific error messages
        if (error.message.includes('cancelled')) {
          this.showInfo('Sign-in was cancelled. Please try again if you want to continue.');
        } else if (error.message.includes('popup-blocked')) {
          this.showError('Pop-up was blocked. Please allow pop-ups for this site and try again.');
        } else if (error.message.includes('network')) {
          this.showError('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('Cross-Origin-Opener-Policy')) {
          this.showInfo('Redirecting to Google for authentication...');
          // Don't show error for COOP issues as redirect will handle it
          return;
        } else {
          this.showError(`Google sign-in failed: ${error.message}`);
        }
      } finally {
        this.loading = false;
      }
    },

    // Handle Google sign-in success from redirect
    handleGoogleSignInSuccess(event) {
      const result = event.detail;
      if (result && result.user) {
        this.showSuccess(`Welcome back, ${result.user.username}! 🎉`);
        setTimeout(() => {
          this.$router.push('/dashboard');
        }, 1000);
      }
    },

    // Handle Google sign-in error from redirect
    handleGoogleSignInError(event) {
      const error = event.detail;
      console.error('Google sign-in redirect error:', error);
      this.showError(`Google sign-in failed: ${error.message || 'Unknown error'}`);
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

.social-login-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.social-login-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Google Sign-In Button */
.google-signin-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  background: white;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.google-signin-btn:hover:not(:disabled) {
  background: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.google-signin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.google-icon {
  display: flex;
  align-items: center;
  justify-content: center;
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