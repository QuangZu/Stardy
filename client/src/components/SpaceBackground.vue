<template>
  <div class="space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in particleCount" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    
    <!-- Content Slot -->
    <div class="space-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpaceBackground',
  props: {
    particleCount: {
      type: Number,
      default: 20
    }
  },
  methods: {
    getParticleSize(index) {
      const sizes = ['small', 'medium', 'large'];
      return sizes[index % sizes.length];
    },
    getParticleColor(index) {
      const colors = ['blue', 'purple', 'pink', 'cyan'];
      return colors[index % colors.length];
    }
  }
}
</script>

<style scoped>
.space-background {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%);
  overflow: hidden;
}

.space-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
  opacity: 0.7;
}

.particle.small {
  width: 4px;
  height: 4px;
}

.particle.medium {
  width: 8px;
  height: 8px;
}

.particle.large {
  width: 12px;
  height: 12px;
}

.particle.blue {
  background: #4facfe;
  box-shadow: 0 0 20px #4facfe;
}

.particle.purple {
  background: #a855f7;
  box-shadow: 0 0 20px #a855f7;
}

.particle.pink {
  background: #ec4899;
  box-shadow: 0 0 20px #ec4899;
}

.particle.cyan {
  background: #06b6d4;
  box-shadow: 0 0 20px #06b6d4;
}

/* Particle positioning */
.particle-1 { top: 10%; left: 10%; animation-delay: 0s; }
.particle-2 { top: 20%; left: 80%; animation-delay: 1s; }
.particle-3 { top: 30%; left: 30%; animation-delay: 2s; }
.particle-4 { top: 40%; left: 70%; animation-delay: 3s; }
.particle-5 { top: 50%; left: 20%; animation-delay: 4s; }
.particle-6 { top: 60%; left: 90%; animation-delay: 5s; }
.particle-7 { top: 70%; left: 40%; animation-delay: 0.5s; }
.particle-8 { top: 80%; left: 60%; animation-delay: 1.5s; }
.particle-9 { top: 15%; left: 50%; animation-delay: 2.5s; }
.particle-10 { top: 25%; left: 15%; animation-delay: 3.5s; }
.particle-11 { top: 35%; left: 85%; animation-delay: 4.5s; }
.particle-12 { top: 45%; left: 25%; animation-delay: 5.5s; }
.particle-13 { top: 55%; left: 75%; animation-delay: 0.8s; }
.particle-14 { top: 65%; left: 35%; animation-delay: 1.8s; }
.particle-15 { top: 75%; left: 85%; animation-delay: 2.8s; }
.particle-16 { top: 85%; left: 45%; animation-delay: 3.8s; }
.particle-17 { top: 5%; left: 65%; animation-delay: 4.8s; }
.particle-18 { top: 95%; left: 25%; animation-delay: 5.8s; }
.particle-19 { top: 12%; left: 75%; animation-delay: 1.2s; }
.particle-20 { top: 88%; left: 55%; animation-delay: 2.2s; }

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

.space-content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 100vh;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .particle {
    animation-duration: 8s;
  }
  
  .particle.large {
    width: 8px;
    height: 8px;
  }
  
  .particle.medium {
    width: 6px;
    height: 6px;
  }
  
  .particle.small {
    width: 3px;
    height: 3px;
  }
}
</style>
