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

    <!-- Contact Content -->
    <main class="relative z-10 py-16">
      <div class="max-w-6xl mx-auto px-8">
        <div class="text-center mb-16 fade-in-up">
          <h1 class="text-5xl font-bold mb-6">Get In Touch</h1>
          <p class="text-xl opacity-90 max-w-3xl mx-auto">
            Have questions about Stardy? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>
        
        <div class="grid lg:grid-cols-2 gap-16">
          <!-- Contact Information -->
          <div class="space-y-8 fade-in-left">
            <div class="contact-info-card">
              <h2 class="text-2xl font-bold mb-6">Contact Information</h2>
              <div class="space-y-6">
                <div class="contact-item">
                  <div class="contact-icon bg-blue-500">
                    📧
                  </div>
                  <div>
                    <h3 class="font-semibold">Email</h3>
                    <a href="mailto:minhquangvuxd@gmail.com" class="text-blue-300 hover:text-blue-200 transition-colors">
                      minhquangvuxd@gmail.com
                    </a>
                  </div>
                </div>
                <div class="contact-item flex items-center gap-4">
                <div class="contact-icon w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-xl">
                    📱
                </div>
                <div>
                    <h3 class="font-semibold">Phone</h3>
                    <a href="tel:+84971966699" class="text-blue-300 hover:text-blue-200 transition-colors">
                    +84 971 966 699
                    </a>
                </div>
                </div>
                
                <div class="contact-item flex items-center gap-4">
                  <div class="contact-icon w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-xl">
                    🌐
                  </div>
                  <div>
                    <h3 class="font-semibold">Website</h3>
                    <span class="text-blue-300">www.stardy.com</span>
                  </div>
                </div>
                
                <div class="contact-item flex items-center gap-4">
                  <div class="contact-icon w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-xl">
                    📍
                  </div>
                  <div>
                    <h3 class="font-semibold">Address</h3>
                    <span class="text-gray-300">Ho Chi Minh City, Vietnam</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Social Media -->
            <div class="contact-info-card">
              <h2 class="text-2xl font-bold mb-6">Follow Us</h2>
              <div class="flex gap-4">
                <a href="#" class="social-icon bg-blue-600">
                  📘
                </a>
                <a href="#" class="social-icon w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center text-xl hover:bg-blue-500 transition-colors hover:-translate-y-1">
                  🐦
                </a>
                <a href="#" class="social-icon w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center text-xl hover:bg-pink-700 transition-colors hover:-translate-y-1">
                  📷
                </a>
                <a href="#" class="social-icon w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center text-xl hover:bg-blue-900 transition-colors hover:-translate-y-1">
                  💼
                </a>
              </div>
            </div>
          </div>
          
          <!-- Contact Form -->
          <div class="fade-in-right">
            <div class="contact-form-card">
              <h2 class="text-2xl font-bold mb-6">Send us a Message</h2>
              <form class="space-y-6">
                <div class="grid md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium mb-2">First Name</label>
                    <input type="text" class="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all">
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2">Last Name</label>
                    <input type="text" class="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all">
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium mb-2">Email</label>
                  <input type="email" class="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all">
                </div>
                
                <div>
                  <label class="block text-sm font-medium mb-2">Message</label>
                  <textarea rows="5" class="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all resize-none"></textarea>
                </div>
                
                <button type="submit" class="w-full bg-white text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <!-- FAQ Section -->
        <div class="mt-16 fade-in-up">
          <div class="glass-effect p-8 rounded-2xl">
            <h2 class="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
            <div class="grid md:grid-cols-2 gap-8">
              <div>
                <h3 class="text-lg font-semibold mb-2">How do I get started with Stardy?</h3>
                <p class="opacity-90 mb-4">Simply sign up for a free account and start exploring our study tools. No credit card required for the trial.</p>
                
                <h3 class="text-lg font-semibold mb-2">Is Stardy free to use?</h3>
                <p class="opacity-90 mb-4">We offer a free tier with basic features, and premium plans with advanced functionality for serious learners.</p>
              </div>
              <div>
                <h3 class="text-lg font-semibold mb-2">Can I use Stardy on mobile devices?</h3>
                <p class="opacity-90 mb-4">Yes! Stardy is fully responsive and works great on all devices including smartphones and tablets.</p>
                
                <h3 class="text-lg font-semibold mb-2">Do you offer student discounts?</h3>
                <p class="opacity-90 mb-4">Absolutely! We offer special pricing for students and educational institutions. Contact us for details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<script>
import '@/styles/contact.css'
import Navigation from '@/components/Navigation.vue'
import Footer from '@/components/Footer.vue'

export default {
  name: 'ContactView',
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
      const colors = ['blue', 'purple', 'cyan', 'white'];
      return `particle-${colors[index % 4]}`;
    }
  }
}
</script>