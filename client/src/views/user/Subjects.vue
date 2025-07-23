<template>
  <div class="subjects-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading subjects...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadSubjectsData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main Subjects Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar 
        :userName="userName" 
        :userLevel="userLevel" 
        currentPage="subjects"
        @logout="logout"
      />
      
      <!-- Main Content -->
      <div class="main-content">
        <header class="subjects-header">
          <div class="header-content">
            <h1><i class="fas fa-graduation-cap"></i> Subjects</h1>
            <p>Explore and master different subjects at your own pace</p>
          </div>
          <div class="header-actions">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input v-model="searchQuery" type="text" placeholder="Search subjects..." />
            </div>
            <div class="filter-dropdown">
              <select v-model="selectedFilter">
                <option value="all">All Subjects</option>
                <option value="enrolled">Enrolled</option>
                <option value="completed">Completed</option>
                <option value="available">Available</option>
              </select>
            </div>
          </div>
        </header>
        
        <!-- Subject Categories -->
        <div class="subject-categories">
          <div class="category-tabs">
            <button 
              v-for="category in categories" 
              :key="category.id"
              @click="selectedCategory = category.id"
              class="category-tab"
              :class="{ active: selectedCategory === category.id }"
            >
              <i :class="category.icon"></i>
              <span>{{ category.name }}</span>
              <span class="count">{{ category.count }}</span>
            </button>
          </div>
        </div>
        
        <!-- Subjects Grid -->
        <div class="subjects-section">
          <div class="section-header">
            <h2>{{ getCategoryName(selectedCategory) }}</h2>
            <div class="view-options">
              <button @click="viewMode = 'grid'" class="view-btn" :class="{ active: viewMode === 'grid' }">
                <i class="fas fa-th"></i>
              </button>
              <button @click="viewMode = 'list'" class="view-btn" :class="{ active: viewMode === 'list' }">
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>
          
          <div class="subjects-grid" :class="viewMode">
            <div v-for="subject in filteredSubjects" :key="subject.id" class="subject-card" @click="viewSubject(subject)">
              <div class="subject-header">
                <div class="subject-icon">
                  <i :class="subject.icon"></i>
                </div>
                <div class="subject-status" :class="subject.status">
                  <i :class="getStatusIcon(subject.status)"></i>
                </div>
              </div>
              
              <div class="subject-content">
                <h3>{{ subject.name }}</h3>
                <p>{{ subject.description }}</p>
                
                <div class="subject-stats">
                  <div class="stat-item">
                    <i class="fas fa-book"></i>
                    <span>{{ subject.lessons }} lessons</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-clock"></i>
                    <span>{{ subject.duration }} hours</span>
                  </div>
                  <div class="stat-item">
                    <i class="fas fa-users"></i>
                    <span>{{ subject.students }} students</span>
                  </div>
                </div>
                
                <div class="subject-progress" v-if="subject.status === 'enrolled' || subject.status === 'completed'">
                  <div class="progress-info">
                    <span>Progress</span>
                    <span>{{ subject.progress }}%</span>
                  </div>
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: subject.progress + '%' }"></div>
                  </div>
                </div>
                
                <div class="subject-level">
                  <span class="level-badge" :class="subject.difficulty.toLowerCase()">
                    {{ subject.difficulty }}
                  </span>
                  <div class="rating">
                    <div class="stars">
                      <i v-for="n in 5" :key="n" class="fas fa-star" :class="{ filled: n <= subject.rating }"></i>
                    </div>
                    <span class="rating-text">({{ subject.rating }}/5)</span>
                  </div>
                </div>
              </div>
              
              <div class="subject-actions">
                <button 
                  @click.stop="handleSubjectAction(subject)" 
                  class="action-btn"
                  :class="getActionClass(subject.status)"
                >
                  <i :class="getActionIcon(subject.status)"></i>
                  {{ getActionText(subject.status) }}
                </button>
                <button @click.stop="toggleBookmark(subject)" class="bookmark-btn" :class="{ bookmarked: subject.bookmarked }">
                  <i class="fas fa-bookmark"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Featured Subjects -->
        <div class="featured-section">
          <h2><i class="fas fa-star"></i> Featured Subjects</h2>
          <div class="featured-grid">
            <div v-for="featured in featuredSubjects" :key="featured.id" class="featured-card">
              <div class="featured-image">
                <img :src="featured.image" :alt="featured.name" />
                <div class="featured-badge">Featured</div>
              </div>
              <div class="featured-content">
                <h3>{{ featured.name }}</h3>
                <p>{{ featured.description }}</p>
                <div class="featured-meta">
                  <span class="instructor">
                    <i class="fas fa-user"></i>
                    {{ featured.instructor }}
                  </span>
                  <span class="price" v-if="featured.price">
                    <i class="fas fa-tag"></i>
                    ${{ featured.price }}
                  </span>
                  <span class="free" v-else>
                    <i class="fas fa-gift"></i>
                    Free
                  </span>
                </div>
                <button @click="enrollSubject(featured)" class="enroll-btn">
                  <i class="fas fa-plus"></i> Enroll Now
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Learning Paths -->
        <div class="paths-section">
          <h2><i class="fas fa-route"></i> Recommended Learning Paths</h2>
          <div class="paths-grid">
            <div v-for="path in learningPaths" :key="path.id" class="path-card">
              <div class="path-header">
                <div class="path-icon">
                  <i :class="path.icon"></i>
                </div>
                <div class="path-info">
                  <h3>{{ path.name }}</h3>
                  <p>{{ path.description }}</p>
                </div>
                <div class="path-duration">
                  <span>{{ path.duration }}</span>
                </div>
              </div>
              <div class="path-subjects">
                <div class="subjects-list">
                  <span v-for="subject in path.subjects" :key="subject" class="subject-tag">
                    {{ subject }}
                  </span>
                </div>
              </div>
              <div class="path-footer">
                <div class="path-stats">
                  <span><i class="fas fa-graduation-cap"></i> {{ path.subjectCount }} subjects</span>
                  <span><i class="fas fa-users"></i> {{ path.enrolled }} enrolled</span>
                </div>
                <button @click="startPath(path)" class="path-btn">
                  <i class="fas fa-arrow-right"></i> Start Path
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { getAccount } from '@/api/Account';
import Sidebar from '@/components/Sidebar.vue';

export default {
  name: 'Subjects',
  components: {
    Sidebar
  },
  data() {
    return {
      userName: 'Loading...',
      userLevel: 1,
      userId: null,
      searchQuery: '',
      selectedFilter: 'all',
      selectedCategory: 'all',
      viewMode: 'grid',
      categories: [],
      subjects: [],
      featuredSubjects: [],
      learningPaths: [],
      loading: true,
      error: null
    }
  },
  computed: {
    filteredSubjects() {
      let filtered = this.subjects;
      
      // Filter by category
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(subject => subject.category === this.selectedCategory);
      }
      
      // Filter by status
      if (this.selectedFilter !== 'all') {
        filtered = filtered.filter(subject => subject.status === this.selectedFilter);
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(subject => 
          subject.name.toLowerCase().includes(query) ||
          subject.description.toLowerCase().includes(query)
        );
      }
      
      return filtered;
    }
  },
  async mounted() {
    await this.loadSubjectsData();
  },
  methods: {
    getParticleSize(index) {
      const sizes = ['small', 'medium', 'large'];
      return sizes[index % 3];
    },
    getParticleColor(index) {
      const colors = ['blue', 'purple', 'pink', 'cyan'];
      return colors[index % 4];
    },
    getUserIdFromToken() {
      try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    },
    
    async loadSubjectsData() {
      try {
        this.loading = true;
        this.error = null;
        
        const userId = this.getUserIdFromToken();
        if (!userId) {
          throw new Error('No valid user token found');
        }
        
        this.userId = userId;
        
        // Load user account data
        const accountData = await getAccount(userId);
        this.userName = accountData.username || 'User';
        this.userLevel = accountData.currentLevel || 1;
        
        // Load categories
        this.categories = [
          { id: 'all', name: 'All Subjects', icon: 'fas fa-th', count: 24 },
          { id: 'programming', name: 'Programming', icon: 'fas fa-code', count: 8 },
          { id: 'database', name: 'Database', icon: 'fas fa-database', count: 5 },
          { id: 'web', name: 'Web Development', icon: 'fas fa-globe', count: 6 },
          { id: 'data', name: 'Data Science', icon: 'fas fa-chart-bar', count: 5 }
        ];
        
        // Load subjects
        this.subjects = [
          {
            id: 1,
            name: 'JavaScript Fundamentals',
            description: 'Learn the basics of JavaScript programming language including variables, functions, and control structures.',
            category: 'programming',
            icon: 'fab fa-js-square',
            lessons: 25,
            duration: 15,
            students: 1250,
            difficulty: 'Beginner',
            rating: 4.8,
            status: 'enrolled',
            progress: 65,
            bookmarked: true
          },
          {
            id: 2,
            name: 'Advanced Python',
            description: 'Master advanced Python concepts including decorators, generators, and object-oriented programming.',
            category: 'programming',
            icon: 'fab fa-python',
            lessons: 35,
            duration: 25,
            students: 890,
            difficulty: 'Advanced',
            rating: 4.9,
            status: 'available',
            progress: 0,
            bookmarked: false
          },
          {
            id: 3,
            name: 'Database Design',
            description: 'Learn how to design efficient and scalable database systems using modern principles.',
            category: 'database',
            icon: 'fas fa-database',
            lessons: 20,
            duration: 18,
            students: 650,
            difficulty: 'Intermediate',
            rating: 4.6,
            status: 'completed',
            progress: 100,
            bookmarked: true
          },
          {
            id: 4,
            name: 'React.js Development',
            description: 'Build modern web applications using React.js and its ecosystem of tools and libraries.',
            category: 'web',
            icon: 'fab fa-react',
            lessons: 30,
            duration: 22,
            students: 1100,
            difficulty: 'Intermediate',
            rating: 4.7,
            status: 'enrolled',
            progress: 40,
            bookmarked: false
          },
          {
            id: 5,
            name: 'Machine Learning Basics',
            description: 'Introduction to machine learning algorithms and their practical applications.',
            category: 'data',
            icon: 'fas fa-brain',
            lessons: 28,
            duration: 30,
            students: 750,
            difficulty: 'Advanced',
            rating: 4.5,
            status: 'available',
            progress: 0,
            bookmarked: true
          },
          {
            id: 6,
            name: 'Node.js Backend',
            description: 'Create robust backend applications using Node.js, Express, and MongoDB.',
            category: 'web',
            icon: 'fab fa-node-js',
            lessons: 32,
            duration: 28,
            students: 920,
            difficulty: 'Intermediate',
            rating: 4.6,
            status: 'available',
            progress: 0,
            bookmarked: false
          }
        ];
        
        // Load featured subjects
        this.featuredSubjects = [
          {
            id: 101,
            name: 'Full Stack Web Development',
            description: 'Complete course covering both frontend and backend development with modern technologies.',
            image: 'https://via.placeholder.com/300x200',
            instructor: 'Dr. Sarah Johnson',
            price: null, // Free
            category: 'web'
          },
          {
            id: 102,
            name: 'AI & Machine Learning Masterclass',
            description: 'Comprehensive course on artificial intelligence and machine learning with hands-on projects.',
            image: 'https://via.placeholder.com/300x200',
            instructor: 'Prof. Michael Chen',
            price: 99,
            category: 'data'
          },
          {
            id: 103,
            name: 'Cloud Computing Essentials',
            description: 'Learn cloud computing fundamentals with AWS, Azure, and Google Cloud Platform.',
            image: 'https://via.placeholder.com/300x200',
            instructor: 'Alex Rodriguez',
            price: 79,
            category: 'programming'
          }
        ];
        
        // Load learning paths
        this.learningPaths = [
          {
            id: 1,
            name: 'Frontend Developer',
            description: 'Complete path to become a professional frontend developer',
            icon: 'fas fa-laptop-code',
            duration: '6 months',
            subjectCount: 8,
            enrolled: 450,
            subjects: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript']
          },
          {
            id: 2,
            name: 'Data Scientist',
            description: 'Master data science from basics to advanced machine learning',
            icon: 'fas fa-chart-line',
            duration: '8 months',
            subjectCount: 10,
            enrolled: 320,
            subjects: ['Python', 'Statistics', 'Machine Learning', 'Deep Learning']
          },
          {
            id: 3,
            name: 'DevOps Engineer',
            description: 'Learn modern DevOps practices and cloud technologies',
            icon: 'fas fa-cogs',
            duration: '5 months',
            subjectCount: 7,
            enrolled: 280,
            subjects: ['Linux', 'Docker', 'Kubernetes', 'AWS']
          }
        ];
        
      } catch (error) {
        console.error('Error loading subjects data:', error);
        this.error = 'Failed to load subjects data';
        
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    getCategoryName(categoryId) {
      const category = this.categories.find(cat => cat.id === categoryId);
      return category ? category.name : 'All Subjects';
    },
    
    getStatusIcon(status) {
      switch (status) {
        case 'enrolled': return 'fas fa-play-circle';
        case 'completed': return 'fas fa-check-circle';
        case 'available': return 'fas fa-plus-circle';
        default: return 'fas fa-circle';
      }
    },
    
    getActionClass(status) {
      switch (status) {
        case 'enrolled': return 'continue';
        case 'completed': return 'review';
        case 'available': return 'enroll';
        default: return 'enroll';
      }
    },
    
    getActionIcon(status) {
      switch (status) {
        case 'enrolled': return 'fas fa-play';
        case 'completed': return 'fas fa-redo';
        case 'available': return 'fas fa-plus';
        default: return 'fas fa-plus';
      }
    },
    
    getActionText(status) {
      switch (status) {
        case 'enrolled': return 'Continue';
        case 'completed': return 'Review';
        case 'available': return 'Enroll';
        default: return 'Enroll';
      }
    },
    
    viewSubject(subject) {
      console.log('Viewing subject:', subject.name);
      // Here you would navigate to the subject detail page
      alert(`Viewing ${subject.name}`);
    },
    
    handleSubjectAction(subject) {
      console.log('Subject action:', subject.status, subject.name);
      switch (subject.status) {
        case 'enrolled':
          alert(`Continuing ${subject.name}`);
          break;
        case 'completed':
          alert(`Reviewing ${subject.name}`);
          break;
        case 'available':
          alert(`Enrolling in ${subject.name}`);
          subject.status = 'enrolled';
          subject.progress = 0;
          break;
      }
    },
    
    toggleBookmark(subject) {
      subject.bookmarked = !subject.bookmarked;
      console.log('Bookmarked:', subject.name, subject.bookmarked);
    },
    
    enrollSubject(subject) {
      console.log('Enrolling in featured subject:', subject.name);
      alert(`Enrolling in ${subject.name}`);
    },
    
    startPath(path) {
      console.log('Starting learning path:', path.name);
      alert(`Starting learning path: ${path.name}`);
    },
    
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.subjects-container {
  display: flex;
  min-height: 100vh;
  position: relative;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
  margin-left: 0.5rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  text-decoration: none;
}

.avatar {
  position: relative;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

.avatar::before {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1));
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: -1;
}

.user-profile:hover .avatar::before {
  opacity: 1;
}

.user-profile:hover .avatar {
  transform: scale(1.05);
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 3;
}

.user-profile:hover .avatar img {
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
}

.user-info {
  position: relative;
  z-index: 2;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover .user-info {
  transform: translateX(2px);
}

.user-info h4 {
  color: white;
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover .user-info h4 {
  color: #ffffff;
  text-shadow: 0 2px 8px rgba(255, 255, 255, 0.3);
}

.user-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.8rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-profile:hover .user-info p {
  color: rgba(255, 255, 255, 0.9);
}

.user-profile:active {
  transform: scale(0.98);
}

.user-profile:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}

.user-profile:hover .avatar {
  transform: scale(1.08);
}

.user-profile:hover .user-info h4 {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .user-profile {
    padding: 0; /* Keep no padding on mobile */
  }
  
  .avatar img {
    width: 36px;
    height: 36px;
  }
  
  .user-info h4 {
    font-size: 0.85rem;
  }
  
  .user-info p {
    font-size: 0.75rem;
  }
}

/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
}

.subjects-header {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  color: white;
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
}

.header-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.search-box input {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  color: white;
  font-size: 0.9rem;
  width: 250px;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.filter-dropdown select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-dropdown select:focus {
  outline: none;
  border-color: #667eea;
}

/* Category Tabs */
.subject-categories {
  margin-bottom: 2rem;
}

.category-tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab:hover,
.category-tab.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.category-tab .count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Subjects Section */
.subjects-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  color: white;
  margin: 0;
  font-size: 1.5rem;
}

.view-options {
  display: flex;
  gap: 0.5rem;
}

.view-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover,
.view-btn.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Subjects Grid */
.subjects-grid {
  display: grid;
  gap: 1.5rem;
}

.subjects-grid.grid {
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
}

.subjects-grid.list {
  grid-template-columns: 1fr;
}

.subject-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.subject-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.subjects-grid.list .subject-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.subject-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.subjects-grid.list .subject-header {
  margin-bottom: 0;
}

.subject-icon {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.subject-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.subject-status.enrolled {
  background: rgba(66, 153, 225, 0.2);
  color: #4299e1;
}

.subject-status.completed {
  background: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.subject-status.available {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.subject-content {
  flex: 1;
}

.subject-content h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.subject-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.subject-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.subjects-grid.list .subject-stats {
  flex-direction: column;
  gap: 0.25rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.subject-progress {
  margin-bottom: 1rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-info span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #48bb78, #38a169);
  transition: width 0.3s ease;
}

.subject-level {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.level-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.level-badge.beginner {
  background: rgba(72, 187, 120, 0.2);
  color: #48bb78;
}

.level-badge.intermediate {
  background: rgba(237, 137, 54, 0.2);
  color: #ed8936;
}

.level-badge.advanced {
  background: rgba(245, 101, 101, 0.2);
  color: #f56565;
}

.rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stars {
  display: flex;
  gap: 0.1rem;
}

.stars i {
  color: rgba(255, 255, 255, 0.3);
  font-size: 0.8rem;
}

.stars i.filled {
  color: #ffd700;
}

.rating-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.subject-actions {
  display: flex;
  gap: 0.5rem;
}

.subjects-grid.list .subject-actions {
  flex-direction: column;
}

.action-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.action-btn.continue {
  background: #667eea;
  color: white;
}

.action-btn.continue:hover {
  background: #5a67d8;
}

.action-btn.review {
  background: #48bb78;
  color: white;
}

.action-btn.review:hover {
  background: #38a169;
}

.action-btn.enroll {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.action-btn.enroll:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.bookmark-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 48px;
}

.bookmark-btn:hover,
.bookmark-btn.bookmarked {
  background: #ffd700;
  color: #1a202c;
}

/* Featured Section */
.featured-section {
  margin-bottom: 3rem;
}

.featured-section h2 {
  color: white;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.featured-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.featured-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.featured-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-4px);
}

.featured-image {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.featured-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: #ffd700;
  color: #1a202c;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.featured-content {
  padding: 1.5rem;
}

.featured-content h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
}

.featured-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.featured-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.featured-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.featured-meta .price {
  color: #48bb78;
  font-weight: 600;
}

.featured-meta .free {
  color: #ffd700;
  font-weight: 600;
}

.enroll-btn {
  width: 100%;
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.enroll-btn:hover {
  background: #5a67d8;
}

/* Learning Paths Section */
.paths-section h2 {
  color: white;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.paths-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}

.path-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.path-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.path-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.path-icon {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.path-info {
  flex: 1;
}

.path-info h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}

.path-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.9rem;
}

.path-duration {
  color: #667eea;
  font-size: 0.8rem;
  font-weight: 600;
}

.path-subjects {
  margin-bottom: 1rem;
}

.subjects-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.subject-tag {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.path-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.path-stats {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.path-stats span {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.path-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.path-btn:hover {
  background: #5a67d8;
}

/* Loading and Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  text-align: center;
}

.loading-spinner i {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.error-icon i {
  font-size: 3rem;
  color: #ff4757;
  margin-bottom: 1rem;
}

.retry-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
}

.retry-btn:hover {
  background: #5a67d8;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    position: relative;
    height: auto;
  }
  
  .main-content {
    margin-left: 0;
  }
  
  .subjects-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .category-tabs {
    flex-wrap: wrap;
  }
  
  .subjects-grid.grid,
  .featured-grid,
  .paths-grid {
    grid-template-columns: 1fr;
  }
  
  .subjects-grid.list .subject-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>