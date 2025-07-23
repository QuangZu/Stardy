import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/user/Home.vue'
import About from './views/user/About.vue'
import Contact from './views/user/Contact.vue'
import Careers from './views/user/Careers.vue'
import Login from './views/user/Login.vue'
import Register from './views/user/Register.vue'
import Dashboard from './views/user/Dashboard.vue'
import Learning from './views/user/Learning.vue'
import Exams from './views/user/Exams.vue'
import Subjects from './views/user/Subjects.vue'
import Progress from './views/user/Progress.vue'
import Notes from './views/user/Notes.vue'
import Schedule from './views/user/Schedule.vue'
import AITutor from './views/user/AITutor.vue'
import Profile from './views/user/Profile.vue'
// Admin pages
import UsersAdmin from './views/admin/AccountsAdmin.vue'
import SubjectsAdmin from './views/admin/SubjectsAdmin.vue'
import QuestionsAdmin from './views/admin/QuestionsAdmin.vue'
import ExamsAdmin from './views/admin/ExamsAdmin.vue'
import AIHealthAdmin from './views/admin/AIHealthAdmin.vue'
import StatsAdmin from './views/admin/StatsAdmin.vue'
import SystemAdmin from './views/admin/SystemAdmin.vue'
import RoleBasedRouter from './components/RoleBasedRouter.vue'

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
    path: '/exams',
    name: 'Exams',
    component: Exams,
    meta: { requiresAuth: true }
  },
  {
    path: '/subjects',
    name: 'Subjects',
    component: Subjects,
    meta: { requiresAuth: true }
  },
  {
    path: '/subjects/:id',
    name: 'SubjectDetail',
    component: Subjects,
    meta: { requiresAuth: true }
  },
  {
    path: '/progress',
    name: 'Progress',
    component: Progress,
    meta: { requiresAuth: true }
  },
  {
    path: '/notes',
    name: 'Notes',
    component: Notes,
    meta: { requiresAuth: true }
  },
  {
    path: '/schedule',
    name: 'Schedule',
    component: Schedule,
    meta: { requiresAuth: true }
  },
  {
    path: '/ai-tutor',
    name: 'AITutor',
    component: AITutor,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  
  // Admin routes
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
    path: '/admin/subjects',
    name: 'SubjectsAdmin',
    component: SubjectsAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/questions',
    name: 'QuestionsAdmin',
    component: QuestionsAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/exams',
    name: 'ExamsAdmin',
    component: ExamsAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/ai-health',
    name: 'AIHealthAdmin',
    component: AIHealthAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/stats',
    name: 'StatsAdmin',
    component: StatsAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/system',
    name: 'SystemAdmin',
    component: SystemAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/client',
    name: 'Client',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/access',
    name: 'RoleBasedAccess',
    component: RoleBasedRouter,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for authentication and authorization
router.beforeEach(async (to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }
  
  // Check if route requires admin access
  if (to.meta.requiresAdmin && isAuthenticated) {
    try {
      const { checkUserRole } = await import('./api/Account.js')
      const roleData = await checkUserRole()
      
      if (!roleData.isAdmin) {
        // User is not admin, redirect to client dashboard
        next('/client')
        return
      }
    } catch (error) {
      console.error('Role check failed:', error)
      // If role check fails, redirect to login
      localStorage.removeItem('token')
      next('/login')
      return
    }
  }
  
  next()
})

export default router