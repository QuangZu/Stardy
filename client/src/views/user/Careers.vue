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

    <!-- Careers Content -->
    <main class="relative z-10 py-16">
      <div class="max-w-6xl mx-auto px-8">
        <div class="text-center mb-16 fade-in-up">
          <h1 class="text-5xl font-bold mb-6">Join Our Team</h1>
          <p class="text-xl opacity-90 max-w-3xl mx-auto">
            Help us build the future of student learning and make education more accessible and effective for everyone.
          </p>
        </div>
        
        <div class="space-y-16">
          <!-- Why Join Us Section -->
          <section class="glass-effect p-8 rounded-2xl fade-in-up">
            <h2 class="text-3xl font-bold mb-8 text-center">Why Join Stardy?</h2>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div class="careers-value-card">
                <div class="text-4xl mb-4">🚀</div>
                <h3 class="text-xl font-semibold mb-2">Innovation</h3>
                <p class="opacity-90">Work on cutting-edge educational technology that impacts millions of students</p>
              </div>
              <div class="careers-value-card">
                <div class="text-4xl mb-4">🌱</div>
                <h3 class="text-xl font-semibold mb-2">Growth</h3>
                <p class="opacity-90">Continuous learning opportunities and career development programs</p>
              </div>
              <div class="careers-value-card">
                <div class="text-4xl mb-4">🤝</div>
                <h3 class="text-xl font-semibold mb-2">Culture</h3>
                <p class="opacity-90">Collaborative, inclusive environment where every voice matters</p>
              </div>
            </div>
          </section>

          <!-- Open Positions -->
          <section class="fade-in-up">
            <h2 class="text-3xl font-bold mb-8 text-center">Open Positions</h2>
            <div class="space-y-6">
              <div class="glass-effect p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-opacity-15 hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-xl font-semibold mb-2">Frontend Developer</h3>
                    <p class="text-blue-300">Engineering • Full-time • Remote</p>
                  </div>
                  <button class="bg-white text-gray-900 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                    Apply
                  </button>
                </div>
                <p class="opacity-90">Build beautiful, responsive user interfaces using Vue.js, React, and modern web technologies.</p>
              </div>
              
              <div class="glass-effect p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-opacity-15 hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-xl font-semibold mb-2">Backend Developer</h3>
                    <p class="text-blue-300">Engineering • Full-time • Remote</p>
                  </div>
                  <button class="bg-white text-gray-900 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                    Apply
                  </button>
                </div>
                <p class="opacity-90">Develop scalable APIs and services using Node.js, MongoDB, and cloud technologies.</p>
              </div>
              
              <div class="glass-effect p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-opacity-15 hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-xl font-semibold mb-2">UX/UI Designer</h3>
                    <p class="text-blue-300">Design • Full-time • Hybrid</p>
                  </div>
                  <button class="bg-white text-gray-900 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                    Apply
                  </button>
                </div>
                <p class="opacity-90">Create intuitive and engaging user experiences for our study platform.</p>
              </div>
              
              <div class="glass-effect p-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-opacity-15 hover:-translate-y-1">
                <div class="flex justify-between items-start mb-4">
                  <div>
                    <h3 class="text-xl font-semibold mb-2">Product Manager</h3>
                    <p class="text-blue-300">Product • Full-time • Hybrid</p>
                  </div>
                  <button class="bg-white text-gray-900 px-4 py-2 rounded-full font-medium hover:bg-gray-100 transition-colors">
                    Apply
                  </button>
                </div>
                <p class="opacity-90">Drive product strategy and roadmap for our educational technology platform.</p>
              </div>
            </div>
          </section>

          <!-- Benefits Section -->
          <section class="glass-effect p-8 rounded-2xl fade-in-up">
            <h2 class="text-3xl font-bold mb-8 text-center">Benefits & Perks</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">💰</span>
                  <span class="text-lg">Competitive salary and equity</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🏥</span>
                  <span class="text-lg">Comprehensive health insurance</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🏖️</span>
                  <span class="text-lg">Unlimited PTO policy</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-2xl">💻</span>
                  <span class="text-lg">Latest tech equipment</span>
                </div>
              </div>
              <div class="space-y-4">
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🎓</span>
                  <span class="text-lg">Learning & development budget</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🏠</span>
                  <span class="text-lg">Remote work flexibility</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🎉</span>
                  <span class="text-lg">Team events and retreats</span>
                </div>
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🌍</span>
                  <span class="text-lg">Global team collaboration</span>
                </div>
              </div>
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
import '@/styles/careers.css'
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'CareersView',
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