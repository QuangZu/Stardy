import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/user/Home.vue'
import About from './views/user/About.vue'
import Contact from './views/user/Contact.vue'
import Careers from './views/user/Careers.vue'
import Login from './views/user/Login.vue'
import Register from './views/user/Register.vue'
import Dashboard from './views/user/Dashboard.vue'
import Learning from './views/user/Learning.vue'

import AIAssistant from './views/user/AIAssistant.vue'
import Note from './views/user/Note.vue'
import Quiz from './views/user/Quiz.vue'
import Flashcard from './views/user/Flashcard.vue'
import Profile from './views/user/Profile.vue'

import UsersAdmin from './views/admin/AccountsAdmin.vue'
import QuizAdmin from './views/admin/QuizAdmin.vue'

import StatsAdmin from './views/admin/StatsAdmin.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  },
  {
    path: '/careers',
    name: 'Careers',
    component: Careers
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/learning',
    name: 'Learning',
    component: Learning,
    meta: { requiresAuth: true }
  },
  {
    path: '/quiz/:id',
    name: 'Quiz',
    component: Quiz,
    meta: { requiresAuth: true }
  },
  {
    path: '/flashcards/:id',
    name: 'Flashcard',
    component: Flashcard,
    meta: { requiresAuth: true }
  },

  {
    path: '/ai-assistant',
    name: 'AIAssistant',
    component: AIAssistant,
    meta: { requiresAuth: true }
  },
  {
    path: '/note/:id',
    name: 'Note',
    component: Note,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },

  {
    path: '/access',
    redirect: '/dashboard'
  },
  
  {
    path: '/admin',
    redirect: '/admin/accounts'
  },
  {
    path: '/admin/accounts',
    name: 'AccountsAdmin',
    component: UsersAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/quizzes',
    name: 'QuizAdmin',
    component: QuizAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: StatsAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stats',
    name: 'StatsAdmin',
    component: StatsAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  if (to.meta.requiresAdmin && isAuthenticated) {
    try {
      const { checkUserRole } = await import('./api/Account.js')
      const roleData = await checkUserRole()

      if (!roleData.isAdmin) {
        next('/dashboard')
        return
      }
    } catch (error) {
      console.error('Role check failed:', error)
      localStorage.removeItem('token')
      next('/login')
      return
    }
  }

  next()
})

export default router