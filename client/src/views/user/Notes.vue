<template>
  <div class="notes-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading your notes...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadNotesData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main Notes Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar 
        :userName="userName" 
        :userLevel="userLevel" 
        currentPage="notes"
        @logout="logout"
      />
      
      <!-- Main Content -->
      <div class="main-content">
        <header class="notes-header">
          <div class="header-content space-glow">
            <h1><i class="fas fa-sticky-note"></i> My Notes</h1>
            <p>Organize and manage your study notes</p>
          </div>
          <div class="header-actions">
            <button @click="showCreateModal = true" class="create-note-btn">
              <i class="fas fa-plus"></i> New Note
            </button>
          </div>
        </header>
        
        <!-- Search and Filter Bar -->
        <div class="search-filter-bar">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search notes..."
              @input="filterNotes"
            >
          </div>
          <div class="filter-options">
            <select v-model="selectedCategory" @change="filterNotes" class="category-filter">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
            <select v-model="sortBy" @change="sortNotes" class="sort-filter">
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>
        </div>
        
        <!-- Notes Grid -->
        <div class="notes-section">
          <div v-if="filteredNotes.length === 0" class="empty-state">
            <i class="fas fa-sticky-note"></i>
            <h3>No notes found</h3>
            <p>{{ searchQuery ? 'Try adjusting your search criteria' : 'Create your first note to get started!' }}</p>
          </div>
          
          <div v-else class="notes-grid">
            <div 
              v-for="note in filteredNotes" 
              :key="note.id" 
              class="note-card"
              @click="openNote(note)"
            >
              <div class="note-header">
                <h3>{{ note.title }}</h3>
                <div class="note-actions">
                  <button @click.stop="toggleFavorite(note)" class="favorite-btn">
                    <i :class="note.isFavorite ? 'fas fa-heart' : 'far fa-heart'"></i>
                  </button>
                  <button @click.stop="deleteNote(note.id)" class="delete-btn">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <div class="note-content">
                <p>{{ truncateContent(note.content) }}</p>
              </div>
              <div class="note-footer">
                <span class="note-category">{{ note.category }}</span>
                <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Categories Section -->
        <div class="categories-section">
          <h2><i class="fas fa-tags"></i> Categories</h2>
          <div class="categories-grid">
            <div v-for="category in categories" :key="category.id" class="category-card">
              <div class="category-icon">
                <i :class="category.icon"></i>
              </div>
              <div class="category-info">
                <h4>{{ category.name }}</h4>
                <p>{{ category.noteCount }} notes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Create/Edit Note Modal -->
    <div v-if="showCreateModal || showEditModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-sticky-note"></i>
            {{ showEditModal ? 'Edit Note' : 'Create New Note' }}
          </h3>
          <button @click="closeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Title</label>
            <input v-model="noteForm.title" type="text" placeholder="Enter note title...">
          </div>
          <div class="form-group">
            <label>Category</label>
            <select v-model="noteForm.category">
              <option value="">Select category</option>
              <option v-for="category in categories" :key="category.id" :value="category.name">
                {{ category.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea 
              v-model="noteForm.content" 
              placeholder="Write your note here..."
              rows="10"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeModal" class="cancel-btn">Cancel</button>
          <button @click="saveNote" class="save-btn">
            <i class="fas fa-save"></i>
            {{ showEditModal ? 'Update Note' : 'Create Note' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccount } from '@/api/Account';
import { getUserNotes, createNote, updateNote, deleteNote, toggleNoteFavorite } from '@/api/Note';
import { getAllSubjects } from '@/api/Subject';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'Notes',
  components: {
    Sidebar
  },
  setup() {
    const { showSuccess, showError, showInfo, showWarning } = useNotification()
    return {
      showSuccess,
      showError,
      showInfo,
      showWarning
    }
  },
  data() {
    return {
      userName: 'Loading...',
      userLevel: 1,
      userId: null,
      searchQuery: '',
      selectedCategory: '',
      sortBy: 'date',
      showCreateModal: false,
      showEditModal: false,
      noteForm: {
        id: null,
        title: '',
        content: '',
        category: ''
      },
      notes: [],
      filteredNotes: [],
      categories: [],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadNotesData();
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
    
    async loadNotesData() {
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
        
        // Load categories from subjects
        try {
          const subjectsData = await getAllSubjects();
          this.categories = subjectsData.map(subject => ({
            id: subject._id,
            name: subject.name,
            icon: this.getSubjectIcon(subject.name),
            noteCount: 0 // Will be updated after loading notes
          }));
          
          // Add General category
          this.categories.push({
            id: 'general',
            name: 'General',
            icon: 'fas fa-bookmark',
            noteCount: 0
          });
        } catch (error) {
          console.warn('Could not load subjects for categories:', error);
          // Fallback categories
          this.categories = [
            { id: 'general', name: 'General', icon: 'fas fa-bookmark', noteCount: 0 }
          ];
        }
        
        // Load notes from API
        try {
          const notesData = await getUserNotes(userId);
          this.notes = notesData.map(note => ({
            id: note._id,
            title: note.title,
            content: note.content,
            category: note.category || 'General',
            isFavorite: note.isFavorite || false,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt)
          }));
          
          // Update category note counts
          this.updateCategoryNoteCounts();
          
        } catch (error) {
          console.warn('Could not load notes:', error);
          this.notes = [];
        }
        
        this.filteredNotes = [...this.notes];
        this.sortNotes();
        
      } catch (error) {
        console.error('Error loading notes data:', error);
        this.error = 'Failed to load notes';
        
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    filterNotes() {
      let filtered = [...this.notes];
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(note => 
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query)
        );
      }
      
      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(note => note.category === this.selectedCategory);
      }
      
      this.filteredNotes = filtered;
      this.sortNotes();
    },
    
    sortNotes() {
      this.filteredNotes.sort((a, b) => {
        switch (this.sortBy) {
          case 'title':
            return a.title.localeCompare(b.title);
          case 'category':
            return a.category.localeCompare(b.category);
          case 'date':
          default:
            return new Date(b.updatedAt) - new Date(a.updatedAt);
        }
      });
    },
    
    openNote(note) {
      this.noteForm = {
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category
      };
      this.showEditModal = true;
    },
    
    closeModal() {
      this.showCreateModal = false;
      this.showEditModal = false;
      this.noteForm = {
        id: null,
        title: '',
        content: '',
        category: ''
      };
    },
    
    async saveNote() {
      if (!this.noteForm.title.trim() || !this.noteForm.content.trim()) {
        this.showWarning('Please fill in both title and content');
        return;
      }
      
      try {
        if (this.showEditModal) {
          // Update existing note
          const updatedNote = await updateNote(this.noteForm.id, {
            title: this.noteForm.title,
            content: this.noteForm.content,
            category: this.noteForm.category
          });
          
          const noteIndex = this.notes.findIndex(n => n.id === this.noteForm.id);
          if (noteIndex !== -1) {
            this.notes[noteIndex] = {
              id: updatedNote._id,
              title: updatedNote.title,
              content: updatedNote.content,
              category: updatedNote.category,
              isFavorite: updatedNote.isFavorite,
              createdAt: new Date(updatedNote.createdAt),
              updatedAt: new Date(updatedNote.updatedAt)
            };
          }
        } else {
          // Create new note
          const newNote = await createNote({
            title: this.noteForm.title,
            content: this.noteForm.content,
            category: this.noteForm.category || 'General'
          });
          
          this.notes.unshift({
            id: newNote._id,
            title: newNote.title,
            content: newNote.content,
            category: newNote.category,
            isFavorite: newNote.isFavorite || false,
            createdAt: new Date(newNote.createdAt),
            updatedAt: new Date(newNote.updatedAt)
          });
        }
        
        this.updateCategoryNoteCounts();
        this.filterNotes();
        this.closeModal();
        this.showSuccess(this.showEditModal ? 'Note updated successfully!' : 'Note created successfully!');
        
      } catch (error) {
        console.error('Error saving note:', error);
        this.showError('Failed to save note. Please try again.');
      }
    },
    
    async deleteNote(noteId) {
      if (confirm('Are you sure you want to delete this note?')) {
        try {
          await deleteNote(noteId);
          
          const noteIndex = this.notes.findIndex(n => n.id === noteId);
          if (noteIndex !== -1) {
            this.notes.splice(noteIndex, 1);
            this.updateCategoryNoteCounts();
            this.filterNotes();
            this.showSuccess('Note deleted successfully!');
          }
        } catch (error) {
          console.error('Error deleting note:', error);
          this.showError('Failed to delete note. Please try again.');
        }
      }
    },
    
    async toggleFavorite(note) {
      try {
        await toggleNoteFavorite(note.id);
        note.isFavorite = !note.isFavorite;
        this.showSuccess(note.isFavorite ? 'Added to favorites!' : 'Removed from favorites!');
      } catch (error) {
        console.error('Error toggling favorite:', error);
        this.showError('Failed to update favorite status.');
      }
    },
    
    truncateContent(content) {
      return content.length > 150 ? content.substring(0, 150) + '...' : content;
    },
    
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    },
    
    getSubjectIcon(subjectName) {
      const iconMap = {
        'Mathematics': 'fas fa-calculator',
        'Math': 'fas fa-calculator',
        'Physics': 'fas fa-atom',
        'Chemistry': 'fas fa-flask',
        'Biology': 'fas fa-dna',
        'Computer Science': 'fas fa-laptop-code',
        'Programming': 'fas fa-code',
        'Database': 'fas fa-database',
        'Web Development': 'fas fa-globe',
        'Data Structures': 'fas fa-sitemap',
        'Algorithms': 'fas fa-project-diagram',
        'Software Engineering': 'fas fa-cogs'
      };
      return iconMap[subjectName] || 'fas fa-book';
    },
    
    updateCategoryNoteCounts() {
      // Reset all counts
      this.categories.forEach(category => {
        category.noteCount = 0;
      });
      
      // Count notes for each category
      this.notes.forEach(note => {
        const category = this.categories.find(c => c.name === note.category);
        if (category) {
          category.noteCount++;
        }
      });
    },
    
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  }
}
</script>

<style scoped>
.notes-container {  
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
  font-size: 1.5rem;
  padding: 2rem;
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

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.create-note-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-note-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

/* Search and Filter Bar */
.search-filter-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
}

.search-box {
  flex: 1;
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
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.filter-options {
  display: flex;
  gap: 1rem;
}

.category-filter, .sort-filter {
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

/* Notes Grid */
.notes-section {
  margin-bottom: 2rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.8);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.6);
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.note-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.note-header h3 {
  color: white;
  margin: 0;
  font-size: 1.1rem;
  flex: 1;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
}

.favorite-btn, .delete-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  color: #ff6b6b;
}

.delete-btn:hover {
  color: #ff4757;
  background: rgba(255, 71, 87, 0.2);
}

.note-content {
  flex: 1;
}

.note-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.note-category {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.note-date {
  color: rgba(255, 255, 255, 0.6);
}

/* Categories Section */
.categories-section {
  margin-bottom: 2rem;
}

.categories-section h2 {
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.category-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.category-card:hover {
  background: rgba(255, 255, 255, 0.15);
}

.category-icon {
  font-size: 1.5rem;
  color: #667eea;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.category-info h4 {
  color: white;
  margin: 0;
  font-size: 1rem;
}

.category-info p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0.25rem 0 0 0;
  font-size: 0.8rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  resize: vertical;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cancel-btn, .save-btn {
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  background: rgba(102, 126, 234, 0.8);
  color: white;
}

.save-btn:hover {
  background: rgba(102, 126, 234, 1);
}

/* Loading and Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  text-align: center;
}

.loading-spinner, .error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  margin-top: 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .calendar-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .view-toggle {
    width: 100%;
    justify-content: center;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal {
    width: 95%;
    margin: 1rem;
  }
}
</style>