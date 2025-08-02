<template>
  <div class="relative z-10 space-background" style="padding-top: 80px;">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>

    <!-- Navigation Header -->
    <Navigation />

    <!-- About Content -->
    <main class="relative z-10 py-16">
      <div class="max-w-6xl mx-auto px-8">
        <div class="text-center mb-16 fade-in-up">
          <h1 class="text-5xl font-bold mb-6">About Stardy</h1>
          <p class="text-xl opacity-90 max-w-3xl mx-auto">
            Empowering students to achieve their academic goals through innovative study tools and personalized learning experiences.
          </p>
        </div>
        
        <div class="space-y-16">
          <!-- Mission Section -->
          <section class="glass-effect p-8 rounded-2xl fade-in-up">
            <h2 class="text-3xl font-bold mb-6 text-center">Our Mission</h2>
            <p class="text-lg text-center max-w-4xl mx-auto opacity-90 leading-relaxed">
              We believe that every student deserves access to powerful, intuitive study tools that make learning more effective and enjoyable. 
              Stardy combines cutting-edge technology with proven educational methodologies to create the ultimate study companion that adapts to each learner's unique needs.
            </p>
          </section>
          
          <!-- Values Section -->
          <section class="fade-in-up">
            <h2 class="text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div class="grid md:grid-cols-3 gap-8">
              <div class="value-card">
                <div class="text-5xl mb-4">🎯</div>
                <h3 class="text-xl font-semibold mb-4">Focus</h3>
                <p class="opacity-90">We help students maintain focus and achieve their academic goals through structured learning paths and distraction-free study environments.</p>
              </div>
              <div class="value-card">
                <div class="text-5xl mb-4">🚀</div>
                <h3 class="text-xl font-semibold mb-4">Innovation</h3>
                <p class="opacity-90">We continuously innovate to provide the most effective and modern study tools, incorporating AI and machine learning for personalized experiences.</p>
              </div>
              <div class="value-card">
                <div class="text-5xl mb-4">🤝</div>
                <h3 class="text-xl font-semibold mb-4">Community</h3>
                <p class="opacity-90">We foster a supportive learning community where students can grow, collaborate, and succeed together in their educational journey.</p>
              </div>
            </div>
          </section>
          
          <!-- Story Section -->
          <section class="glass-effect p-8 rounded-2xl fade-in-up">
            <h2 class="text-3xl font-bold mb-6 text-center">Our Story</h2>
            <div class="max-w-4xl mx-auto text-lg opacity-90 leading-relaxed space-y-4">
              <p>
                Stardy was born from the frustration of students struggling with scattered study materials, ineffective learning methods, and lack of personalized guidance. 
                Our founders, having experienced these challenges firsthand during their academic journey, envisioned a platform that would revolutionize how students learn.
              </p>
              <p>
                Starting as a simple flashcard app, Stardy has evolved into a comprehensive study ecosystem that includes AI-powered tutoring, progress tracking, 
                collaborative features, and adaptive learning algorithms. Today, we serve thousands of students worldwide, helping them achieve better grades and 
                develop lifelong learning skills.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import '@/styles/about.css'
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'AboutView',
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