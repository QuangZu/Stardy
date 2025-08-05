<template>
  <div class="relative z-10 space-background" style="padding-top: 80px;">
    <!-- Space Particles -->
    <div class="space-particles home-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    <div class="h-screen">
    <!-- Navigation Header -->
    <Navigation />

    <!-- Main Section -->
    <main class="max-w-6xl mx-auto px-8 grid md:grid-cols-2 hero-section items-center">
      <div class="text-left fade-in-up">
        <h1 class="hero-title">
          The All-In-One Study<br>
          App for <span class="highlight">
            Students
          </span>
        </h1>
        <p class="text-lg mb-8 opacity-90 leading-relaxed">
          Rewrite you whole chapter with ease.<br>
          Get started with a free trial today!
        </p>
          <router-link to="/login">
          <button class="btn pulse-animation">
            <strong>GET STARTED</strong>
            <div id="container-stars">
              <div id="stars"></div>
            </div>
            <div id="glow">
              <div class="circle"></div>
              <div class="circle"></div>
            </div>
          </button>
          </router-link>
      </div>
      
      <!-- Space Learning Scene -->
      <div class="relative fade-in-right">
        <div class="floating-animation">
          <!-- Main Planet -->
          <div class="planet-container">
            <div class="planet">
              <div class="planet-surface"></div>
              <div class="planet-atmosphere"></div>
              <!-- Study Elements on Planet -->
              <div class="study-elements">
                <div class="book-icon">📚</div>
                <div class="brain-icon">🧠</div>
                <div class="lightbulb-icon">💡</div>
              </div>
            </div>
          </div>
          
          <!-- Astronaut -->
          <div class="astronaut-container">
            <div class="astronaut">
              <!-- Helmet -->
              <div class="helmet">
                <div class="helmet-glass"></div>
                <div class="helmet-reflection"></div>
              </div>
              <!-- Body -->
              <div class="astronaut-body">
                <div class="chest-panel"></div>
                <div class="arm left-arm"></div>
                <div class="arm right-arm"></div>
              </div>
              <!-- Jetpack -->
              <div class="jetpack">
                <div class="jetpack-flame"></div>
              </div>
            </div>
          </div>
          
          <!-- Floating Study Items -->
          <div class="floating-items">
            <div class="floating-item item-1">📖</div>
            <div class="floating-item item-2">🎓</div>
            <div class="floating-item item-3">⭐</div>
            <div class="floating-item item-4">🚀</div>
            <div class="floating-item item-5">📝</div>
          </div>
          
          <!-- Orbital Rings -->
          <div class="orbital-ring ring-1"></div>
          <div class="orbital-ring ring-2"></div>
          
          <!-- Background Stars -->
          <div class="background-stars">
            <div class="star star-1"></div>
            <div class="star star-2"></div>
            <div class="star star-3"></div>
            <div class="star star-4"></div>
            <div class="star star-5"></div>
          </div>
        </div>
      </div>
    </main>
    </div>

    <!-- Features Section -->
    <section class="py-24 glass-effect relative z-10">
      <div class="max-w-6xl mx-auto px-8">
        <h2 class="text-4xl font-bold text-center mb-12 fade-in-up">Powerful Study Features</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="feature-card fade-in-up" style="animation-delay: 0.1s">
            <div class="feature-icon">🃏</div>
            <h3>Smart Flashcards</h3>
            <p>Create and study with intelligent flashcards that adapt to your learning pace</p>
          </div>
          <div class="feature-card fade-in-up" style="animation-delay: 0.2s">
            <div class="feature-icon">📝</div>
            <h3>Practice Exams</h3>
            <p>Take comprehensive practice exams with detailed analytics and progress tracking</p>
          </div>
          <div class="feature-card fade-in-up" style="animation-delay: 0.3s">
            <div class="feature-icon">📚</div>
            <h3>Note Taking</h3>
            <p>Organize your study materials with our advanced note-taking system</p>
          </div>
          <div class="feature-card fade-in-up" style="animation-delay: 0.4s">
            <div class="feature-icon">📅</div>
            <h3>Study Scheduler</h3>
            <p>Plan your study sessions with intelligent scheduling and reminders</p>
          </div>
          <div class="feature-card fade-in-up" style="animation-delay: 0.5s">
            <div class="feature-icon">🏆</div>
            <h3>Achievements</h3>
            <p>Stay motivated with achievements, streaks, and progress rewards</p>
          </div>
          <div class="feature-card fade-in-up" style="animation-delay: 0.6s">
            <div class="feature-icon">🤖</div>
            <h3>AI Assistant</h3>
            <p>Get personalized study tips and answers with our AI-powered assistant</p>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import '@/styles/space_button.css'
import '@/styles/home.css'
import '@/styles/background.css'
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'Homepage',
  components: {
    Navigation,
    Footer
  },
  mounted() {
    this.observeAnimations();
  },
  methods: {
    observeAnimations() {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      }, { threshold: 0.1 });

      document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right').forEach(el => {
        observer.observe(el);
      });
    },
    getParticleSize(index) {
      const sizes = ['small', 'medium', 'large'];
      return sizes[index % 3];
    },
    getParticleColor(index) {
      const colors = ['blue', 'cyan', 'white', 'blue'];
      return `particle-${colors[index % 4]}`;
    }
  }
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
  overflow-x: hidden;
}

/* Animated Background */
.animated-background {
  position: -webkit-sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  top: 80%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 30%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(10px) rotate(240deg); }
}

/* Navigation */
.navbar {
  padding: 1rem 0;
  position: relative;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
  animation: slideInLeft 0.8s ease-out;
}

.logo-icon {
  font-size: 1.8rem;
}

.nav-menu {
  display: flex;
  gap: 2rem;
  position: relative;
  animation: slideInDown 0.8s ease-out 0.2s both;
}

.nav-underline {
  position: absolute;
  bottom: -5px;
  height: 2px;
  background: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 1px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link:hover {
  transform: translateY(-2px);
}

.nav-auth {
  animation: slideInRight 0.8s ease-out 0.4s both;
}

.sign-in-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.sign-in-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.hero-section {
  margin: 0 auto;
  padding: 4rem 2rem;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  z-index: 10;
  padding-top: 10rem;
}

.hero-content {
  text-align: left;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.highlight {
  color: #a8b5ff;
  position: relative;
}

.highlight::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #a8b5ff, #667eea);
  animation: highlightGlow 2s ease-in-out infinite alternate;
}

@keyframes highlightGlow {
  0% { opacity: 0.6; transform: scaleX(0.8); }
  100% { opacity: 1; transform: scaleX(1); }
}

.hero-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta-button {
  background: #1a1a1a;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.cta-button:hover {
  background: #333;
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.pulse-animation {
  animation: pulse 2s;
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(26, 26, 26, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(26, 26, 26, 0); }
  100% { box-shadow: 0 0 0 0 rgba(26, 26, 26, 0); }
}

.app-preview {
  position: relative;
}

.preview-window {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  transform: perspective(1000px) rotateY(-5deg) rotateX(5deg);
  transition: all 0.3s ease;
}

.preview-window:hover {
  transform: perspective(1000px) rotateY(-2deg) rotateX(2deg) scale(1.02);
}

.floating-animation {
  animation: floating 3s ease-in-out infinite;
}

@keyframes floating {
  0%, 100% { transform: perspective(1000px) rotateY(-5deg) rotateX(5deg) translateY(0px); }
  50% { transform: perspective(1000px) rotateY(-5deg) rotateX(5deg) translateY(-10px); }
}

.window-header {
  background: #f5f5f5;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.window-controls {
  display: flex;
  gap: 0.5rem;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.control:hover {
  transform: scale(1.2);
}

.control.red { background: #ff5f57; }
.control.yellow { background: #ffbd2e; }
.control.green { background: #28ca42; }

.window-content {
  height: 300px;
  background: #fafafa;
}

.app-interface {
  display: flex;
  height: 100%;
}

.sidebar {
  width: 250px;
  background: #4f46e5;
  color: white;
  padding: 1.5rem;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.sidebar-logo {
  font-size: 1.5rem;
}

.sidebar-subtitle {
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
}

.sidebar-subtitle-sub {
  font-size: 0.9rem;
  opacity: 0.8;
}

.main-content {
  flex: 1;
  padding: 1rem;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icons {
  display: flex;
  gap: 1rem;
}

.icon {
  font-size: 1.2rem;
  color: #666;
  transition: all 0.2s ease;
}

.icon:hover {
  transform: scale(1.2);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: #ff6b6b;
  border-radius: 50%;
  animation: avatarPulse 2s ease-in-out infinite;
}

@keyframes avatarPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.built-with {
  position: absolute;
  bottom: -2rem;
  right: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.tech-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

/* Features Section */
.features-section {
  padding: 6rem 0;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 10;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  font-weight: bold;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Enhanced Feature Cards with Hover Scale Effect */
.feature-card {
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 16px;
  text-align: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  cursor: pointer;
  transform-origin: center;
}

.feature-card:hover {
  transform: translateY(-8px) scale(1.05);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(255, 255, 255, 0.3),
    0 0 20px rgba(99, 102, 241, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  display: inline-block;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) translateY(-2px);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.feature-card h3 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.feature-card:hover h3 {
  color: #a8b5ff;
  transform: translateY(-1px);
}

.feature-card p {
  opacity: 0.9;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.feature-card:hover p {
  opacity: 1;
  transform: translateY(-1px);
}

/* Progress Section */
.progress-section {
  padding: 6rem 0;
  position: relative;
  z-index: 10;
}

.progress-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.progress-text h2 {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
  font-weight: bold;
}

.progress-text p {
  font-size: 1.1rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.progress-features {
  list-style: none;
}

.progress-features li {
  margin-bottom: 1rem;
  font-size: 1.1rem;
  opacity: 0.9;
}

.progress-dashboard {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.dashboard-header h3 {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  text-align: center;
}

.progress-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: scale(1.05);
  background: rgba(255, 255, 255, 0.15);
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #a8b5ff;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Animation Classes */
.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.fade-in-up.animate {
  opacity: 1;
  transform: translateY(0);
}

.fade-in-left {
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.8s ease;
}

.fade-in-left.animate {
  opacity: 1;
  transform: translateX(0);
}

.fade-in-right {
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.8s ease;
}

.fade-in-right.animate {
  opacity: 1;
  transform: translateX(0);
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .hero-section {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .nav-menu {
    display: none;
  }
  
  .preview-window {
    transform: none;
  }
  
  .floating-animation {
    animation: none;
  }
  
  .progress-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-stats {
    grid-template-columns: 1fr;
  }
}
</style>
