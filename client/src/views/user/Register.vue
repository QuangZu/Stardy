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

    <!-- Register Content -->
    <main class="relative z-10 py-16">
      <div class="max-w-md mx-auto px-8">
        <div class="text-center mb-8 fade-in-up">
          <div class="text-6xl mb-4">🎉</div>
          <h1 class="text-4xl font-bold mb-4">Join Stardy!</h1>
          <p class="text-lg opacity-90">
            Start your learning adventure today. Create your account and unlock powerful study tools.
          </p>
        </div>
        
        <!-- Register Form -->
        <div class="register-form-card fade-in-up">
          <form @submit.prevent="handleRegister" class="space-y-6">
            <div>
              <label class="block text-sm font-medium mb-2">Username</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">👤</span>
                <input 
                  type="text" 
                  v-model="username"
                  @blur="validateUsername"
                  :class="{
                    'border-red-400': usernameError,
                    'border-green-400': username && !usernameError
                  }"
                  class="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-white placeholder-opacity-60"
                  placeholder="johndoe123"
                  required
                >
              </div>
              <div v-if="usernameError" class="mt-1 text-red-300 text-xs">
                ❌ {{ usernameError }}
              </div>
              <div v-else-if="username && !usernameError" class="mt-1 text-green-300 text-xs">
                ✅ Valid username
              </div>
            </div>
            
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
                  placeholder="john@example.com"
                  required
                >
              </div>
              <div v-if="emailError" class="mt-1 text-red-300 text-xs">
                ❌ {{ emailError }}
              </div>
              <div v-else-if="email && !emailError" class="mt-1 text-green-300 text-xs">
                ✅ Valid email address
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔒</span>
                <input 
                  :type="showPassword ? 'text' : 'password'"
                  v-model="password"
                  @input="validatePassword"
                  :class="{
                    'border-red-400': passwordError,
                    'border-green-400': password && !passwordError && passwordStrength === 100
                  }"
                  class="w-full pl-12 pr-12 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-white placeholder-opacity-60"
                  placeholder="Create a strong password"
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
              <div class="mt-2">
                <div class="flex items-center gap-2 text-xs">
                  <div class="flex-1 h-1 bg-white bg-opacity-20 rounded">
                    <div 
                      class="h-full rounded transition-all duration-300"
                      :class="passwordStrengthClass"
                      :style="{ width: passwordStrength + '%' }"
                    ></div>
                  </div>
                  <span class="text-xs opacity-80">{{ passwordStrengthText }}</span>
                </div>
              </div>
              <div v-if="passwordError" class="mt-1 text-red-300 text-xs">
                ❌ {{ passwordError }}
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-2">Confirm Password</label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">🔒</span>
                <input 
                  type="password"
                  v-model="confirmPassword"
                  @blur="validateConfirmPassword"
                  :class="{
                    'border-red-400': confirmPasswordError,
                    'border-green-400': confirmPassword && !confirmPasswordError
                  }"
                  class="w-full pl-12 pr-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all placeholder-white placeholder-opacity-60"
                  placeholder="Confirm your password"
                  required
                >
              </div>
              <div v-if="confirmPasswordError" class="mt-1 text-red-300 text-xs">
                ❌ {{ confirmPasswordError }}
              </div>
              <div v-else-if="confirmPassword && !confirmPasswordError" class="mt-1 text-green-300 text-xs">
                ✅ Passwords match
              </div>
            </div>
            
            <div>
              <label class="flex items-start gap-3">
                <input type="checkbox" v-model="agreeToTerms" class="mt-1 rounded" required>
                <span class="text-sm">
                  I agree to the 
                  <a href="#" class="text-blue-300 hover:text-blue-200 transition-colors">Terms of Service</a> 
                  and 
                  <a href="#" class="text-blue-300 hover:text-blue-200 transition-colors">Privacy Policy</a>
                </span>
              </label>
            </div>
            
            <button 
              type="submit" 
              class="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              :disabled="loading || !isFormValid"
              :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
            >
              <span v-if="loading">Creating account... ⏳</span>
              <span v-else>Create Account 🎯</span>
            </button>
          </form>
          
          <div class="mt-6 text-center">
            <p class="text-sm opacity-80">
              Already have an account? 
              <router-link to="/login" class="text-blue-300 hover:text-blue-200 transition-colors font-medium">
                Sign in here
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import { register } from '@/api/Auth'
import Navigation from '@/components/Navigation.vue'

export default {
  name: 'RegisterView',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      showPassword: false,
      agreeToTerms: false,
      loading: false,
      // Error messages
      usernameError: '',
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      // Regex patterns
      regexPatterns: {
        username: /^[a-zA-Z0-9_]{3,20}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        password: {
          minLength: /.{8,}/,
          uppercase: /[A-Z]/,
          lowercase: /[a-z]/,
          number: /[0-9]/,
          special: /[!@#$%^&*(),.?":{}|<>]/
        }
      }
    }
  },
  components: {
    Navigation
  },
  computed: {
    passwordStrength() {
      if (!this.password) return 0;
      let strength = 0;
      if (this.regexPatterns.password.minLength.test(this.password)) strength += 20;
      if (this.regexPatterns.password.uppercase.test(this.password)) strength += 20;
      if (this.regexPatterns.password.lowercase.test(this.password)) strength += 20;
      if (this.regexPatterns.password.number.test(this.password)) strength += 20;
      if (this.regexPatterns.password.special.test(this.password)) strength += 20;
      return strength;
    },
    
    passwordStrengthText() {
      if (this.passwordStrength === 0) return '';
      if (this.passwordStrength <= 40) return 'Weak';
      if (this.passwordStrength <= 60) return 'Fair';
      if (this.passwordStrength <= 80) return 'Good';
      return 'Strong';
    },
    
    passwordStrengthClass() {
      if (this.passwordStrength <= 40) return 'bg-red-500';
      if (this.passwordStrength <= 60) return 'bg-yellow-500';
      if (this.passwordStrength <= 80) return 'bg-blue-500';
      return 'bg-green-500';
    },
    
    isFormValid() {
      return this.username && 
             this.email && 
             this.password && 
             this.confirmPassword && 
             !this.usernameError &&
             !this.emailError &&
             !this.passwordError &&
             !this.confirmPasswordError &&
             this.password === this.confirmPassword && 
             this.agreeToTerms &&
             this.passwordStrength === 100;
    }
  },
  mounted() {
    this.observeAnimations();
  },
  methods: {
    validateUsername() {
      if (!this.username) {
        this.usernameError = 'Username is required';
      } else if (!this.regexPatterns.username.test(this.username)) {
        this.usernameError = 'Username must be 3-20 characters (letters, numbers, underscore only)';
      } else {
        this.usernameError = '';
      }
    },
    
    validateEmail() {
      if (!this.email) {
        this.emailError = 'Email is required';
      } else if (!this.regexPatterns.email.test(this.email)) {
        this.emailError = 'Please enter a valid email address';
      } else {
        this.emailError = '';
      }
    },
    
    validatePassword() {
      if (!this.password) {
        this.passwordError = 'Password is required';
      } else if (this.passwordStrength < 100) {
        this.passwordError = 'Password must meet all requirements';
      } else {
        this.passwordError = '';
      }
      
      // Re-validate confirm password if it exists
      if (this.confirmPassword) {
        this.validateConfirmPassword();
      }
    },
    
    validateConfirmPassword() {
      if (!this.confirmPassword) {
        this.confirmPasswordError = 'Please confirm your password';
      } else if (this.password !== this.confirmPassword) {
        this.confirmPasswordError = 'Passwords do not match';
      } else {
        this.confirmPasswordError = '';
      }
    },
    
    async handleRegister() {
      // Validate all fields before submission
      this.validateUsername();
      this.validateEmail();
      this.validatePassword();
      this.validateConfirmPassword();
      
      if (!this.isFormValid) {
        return;
      }
      
      this.loading = true;
      
      try {
        const response = await register(
          this.username,
          this.email, 
          this.password
        );
        
        console.log('Registration successful:', response);
        
        // Store the token if needed
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Redirect to login on success
        this.$router.push('/login');
      } catch (error) {
        console.error('Registration failed:', error);
        // Handle registration error - show user-friendly message
        const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
        alert(errorMessage);
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
.register-form-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.register-form-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
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