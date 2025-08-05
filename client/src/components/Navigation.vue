<template>
  <header class="nav-header">
      <div class="nav-container">
        <div class="logo">
            <h2 class="text-2xl font-bold"><i class="fas fa-star"></i> Stardy</h2>
          </div>
        <nav class="hidden md:flex items-center gap-4 nav-links">
          <router-link to="/" class="menu__link" data-hover="Home">Home</router-link>
          <router-link to="/about" class="menu__link" data-hover="About">About</router-link>
          <router-link to="/careers" class="menu__link" data-hover="Careers">Careers</router-link>
          <router-link to="/contact" class="menu__link" data-hover="Contact">Contact</router-link>
        </nav>
        <div>
          <router-link to="/login" class="sign-in-btn">
            Sign In
          </router-link>
        </div>
      </div>
    </header>
</template>

<script>
import '@/styles/navigation.css'
export default {
  name: 'Navigation'
}
</script>