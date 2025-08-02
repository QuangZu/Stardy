<template>
  <footer class="footer">
    <div class="footer-container">
      <!-- Main Footer Content -->
      <div class="footer-content">
        <!-- Brand Section -->
        <div class="footer-brand">
          <div class="brand-logo">
            <h3 class="text-2xl font-bold space-glow">
              <i class="fas fa-star"></i> Stardy
            </h3>
          </div>
          <p class="brand-description">
            Empowering students to achieve their academic goals through innovative study tools and personalized learning experiences.
          </p>
          <div class="social-links">
            <a href="#" class="social-link" aria-label="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="social-link" aria-label="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="social-link" aria-label="Instagram">
              <i class="fab fa-instagram"></i>
            </a>
            <a href="#" class="social-link" aria-label="LinkedIn">
              <i class="fab fa-linkedin-in"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h4 class="footer-title">Quick Links</h4>
          <ul class="footer-links">
            <li><router-link to="/" class="footer-link">Home</router-link></li>
            <li><router-link to="/about" class="footer-link">About</router-link></li>
            <li><router-link to="/careers" class="footer-link">Careers</router-link></li>
            <li><router-link to="/contact" class="footer-link">Contact</router-link></li>
          </ul>
        </div>

        <!-- Features -->
        <div class="footer-section">
          <h4 class="footer-title">Features</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">Smart Flashcards</a></li>
            <li><a href="#" class="footer-link">Practice Exams</a></li>
            <li><a href="#" class="footer-link">Note Taking</a></li>
            <li><a href="#" class="footer-link">AI Assistant</a></li>
          </ul>
        </div>

        <!-- Support -->
        <div class="footer-section">
          <h4 class="footer-title">Support</h4>
          <ul class="footer-links">
            <li><a href="#" class="footer-link">Help Center</a></li>
            <li><a href="#" class="footer-link">Privacy Policy</a></li>
            <li><a href="#" class="footer-link">Terms of Service</a></li>
            <li><a href="#" class="footer-link">FAQ</a></li>
          </ul>
        </div>

        <!-- Contact Info -->
        <div class="footer-section">
          <h4 class="footer-title">Contact</h4>
          <div class="contact-info">
            <div class="contact-item">
              <i class="fas fa-envelope"></i>
              <span>minhquangvuxd@gmail.com</span>
            </div>
            <div class="contact-item">
              <i class="fas fa-phone"></i>
              <span>+84 971 966 699</span>
            </div>
            <div class="contact-item">
              <i class="fas fa-map-marker-alt"></i>
              <span>Ha Noi, Vietnam</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="footer-bottom">
        <div class="footer-bottom-content">
          <p class="copyright">
            © {{ currentYear }} Stardy. All rights reserved.
          </p>
          <div class="footer-bottom-links">
            <a href="#" class="footer-bottom-link">Privacy</a>
            <a href="#" class="footer-bottom-link">Terms</a>
            <a href="#" class="footer-bottom-link">Cookies</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="footer-particles">
      <div v-for="i in 10" :key="i" 
           :class="`footer-particle footer-particle-${i}`">
      </div>
    </div>
  </footer>
</template>

<script>
import '@/styles/footer.css'

export default {
  name: 'Footer',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    }
  }
}
</script>