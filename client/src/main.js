import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import Font Awesome CSS
import '@fortawesome/fontawesome-free/css/all.css'

createApp(App).use(router).mount('#app')
