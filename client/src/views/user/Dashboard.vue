<template>
  <div class="dashboard-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading your dashboard...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadUserData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main Dashboard Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar 
        :user-name="userName" 
        :user-level="userLevel" 
        current-page="dashboard"
        @logout="logout"
      />
      
      <!-- Main Content -->
      <div class="main-content">
        <header class="dashboard-header">
          <div class="header-content">
            <h1 class="space-text-primary space-glow">Dashboard</h1>
            <p class="space-text-secondary">Create new notes</p>
          </div>
        </header>
        
        <!-- AI Study Tools Grid -->
        <div class="study-tools-grid">
          <!-- Record or Upload Audio -->
          <div class="tool-card audio-card" @click="openAudioModal">
            <div class="tool-icon">
              <i class="fas fa-microphone"></i>
            </div>
            <div class="tool-content">
              <h3>Record or upload audio</h3>
              <p>Upload an audio file</p>
            </div>
            <div class="tool-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

          <!-- YouTube Video -->
          <div class="tool-card youtube-card" @click="openYouTubeModal">
            <div class="tool-icon youtube-icon">
              <i class="fab fa-youtube"></i>
            </div>
            <div class="tool-content">
              <h3>YouTube video</h3>
              <p>Paste a YouTube link</p>
            </div>
            <div class="tool-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

          <!-- Document Upload -->
          <div class="tool-card document-card" @click="openDocumentModal">
            <div class="tool-icon document-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="tool-content">
              <h3>Document upload</h3>
              <p>Any PDF, DOC, PPT, etc!</p>
            </div>
            <div class="tool-arrow">
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>
        </div>

        <!-- Recent Notes Section -->
        <div class="notes-section" v-if="recentNotes.length > 0">
          <div class="section-header">
            <h2><i class="fas fa-sticky-note"></i> Recent Notes</h2>
            <router-link to="/notes" class="view-all-btn">
              <i class="fas fa-plus"></i> View All Notes
            </router-link>
          </div>
          <div class="notes-grid">
            <div class="note-card" v-for="note in recentNotes" :key="note.id" @click="openNote(note.id)">
              <div class="note-header">
                <h4>{{ note.title }}</h4>
                <span class="note-category">{{ note.category }}</span>
              </div>
              <div class="note-content">
                <p>{{ truncateNoteContent(note.content) }}</p>
              </div>
              <div class="note-footer">
                <span class="note-date">{{ formatNoteDate(note.updatedAt) }}</span>
                <div class="note-actions">
                  <button @click.stop="toggleNoteFavorite(note)" class="favorite-btn">
                    <i :class="note.isFavorite ? 'fas fa-heart' : 'far fa-heart'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Audio Upload Modal -->
    <div v-if="showAudioModal" class="modal-overlay" @click="closeAudioModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-microphone"></i> Record or Upload Audio</h3>
          <button @click="closeAudioModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="upload-options">
            <!-- File Upload -->
            <div class="upload-section">
              <div class="upload-area" 
                   :class="{ 'drag-over': isDragOver }"
                   @drop="handleAudioDrop"
                   @dragover.prevent="isDragOver = true"
                   @dragleave="isDragOver = false"
                   @click="triggerAudioFileInput">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Drag .mp3 audio file here, or click to select</p>
                <input ref="audioFileInput" type="file" accept=".mp3,.wav,.m4a" @change="handleAudioFileSelect" style="display: none;">
              </div>
            </div>
            
            <!-- Recording Section -->
            <div class="recording-section">
              <div class="record-controls">
                <button v-if="!isRecording && !audioBlob" @click="startRecording" class="record-btn">
                  <i class="fas fa-microphone"></i> Start Recording
                </button>
                <button v-if="isRecording" @click="stopRecording" class="stop-btn">
                  <i class="fas fa-stop"></i> Stop Recording
                </button>
                <button v-if="audioBlob && !isRecording" @click="playRecording" class="play-btn">
                  <i class="fas fa-play"></i> Play Recording
                </button>
              </div>
              <div v-if="isRecording" class="recording-indicator">
                <div class="pulse-dot"></div>
                <span>Recording... {{ recordingTime }}s</span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button @click="closeAudioModal" class="cancel-btn">Cancel</button>
            <button @click="processAudio" :disabled="!selectedAudioFile && !audioBlob" class="process-btn">
              <i class="fas fa-magic"></i> Process with AI
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- YouTube Modal -->
    <div v-if="showYouTubeModal" class="modal-overlay" @click="closeYouTubeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fab fa-youtube"></i> YouTube Video</h3>
          <button @click="closeYouTubeModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="input-section">
            <label for="youtube-url">YouTube URL</label>
            <input 
              id="youtube-url"
              v-model="youtubeUrl" 
              type="url" 
              placeholder="https://www.youtube.com/watch?v=..."
              class="url-input"
            >
            <div v-if="youtubeUrl && isValidYouTubeUrl(youtubeUrl)" class="url-preview">
              <i class="fab fa-youtube"></i>
              <span>Valid YouTube URL detected</span>
            </div>
          </div>
          
          <div class="modal-actions">
            <button @click="closeYouTubeModal" class="cancel-btn">Cancel</button>
            <button @click="processYouTube" :disabled="!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)" class="process-btn">
              <i class="fas fa-magic"></i> Process with AI
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Upload Modal -->
    <div v-if="showDocumentModal" class="modal-overlay" @click="closeDocumentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-file-alt"></i> Document Upload</h3>
          <button @click="closeDocumentModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="upload-section">
            <div class="upload-area" 
                 :class="{ 'drag-over': isDragOverDoc }"
                 @drop="handleDocumentDrop"
                 @dragover.prevent="isDragOverDoc = true"
                 @dragleave="isDragOverDoc = false"
                 @click="triggerDocumentFileInput">
              <i class="fas fa-cloud-upload-alt"></i>
              <p>Drag PDF, DOC, PPT files here, or click to select</p>
              <input ref="documentFileInput" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" @change="handleDocumentFileSelect" style="display: none;">
            </div>
            
            <div v-if="selectedDocumentFile" class="file-preview">
              <div class="file-info">
                <i :class="getFileIcon(selectedDocumentFile.name)"></i>
                <div class="file-details">
                  <span class="file-name">{{ selectedDocumentFile.name }}</span>
                  <span class="file-size">{{ formatFileSize(selectedDocumentFile.size) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button @click="closeDocumentModal" class="cancel-btn">Cancel</button>
            <button @click="processDocument" :disabled="!selectedDocumentFile" class="process-btn">
              <i class="fas fa-magic"></i> Process with AI
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Processing Modal -->
    <div v-if="showProcessingModal" class="modal-overlay">
      <div class="modal-content processing-modal">
        <div class="processing-content">
          <div class="processing-spinner">
            <i class="fas fa-magic fa-spin"></i>
          </div>
          <h3>AI is processing your content...</h3>
          <p>{{ processingMessage }}</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: processingProgress + '%' }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccount, getUserIdFromToken } from '@/api/Account';
import { getUserNotes, createNote } from '@/api/Note';
import { processYouTubeVideo, processDocument, processAudio } from '@/api/AI';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'Dashboard',
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
      userEmail: '',
      userId: null,
      userLevel: 1,
      recentNotes: [],
      loading: true,
      error: null,
      
      // Modal states
      showAudioModal: false,
      showYouTubeModal: false,
      showDocumentModal: false,
      showProcessingModal: false,
      
      // Audio recording
      isRecording: false,
      mediaRecorder: null,
      audioBlob: null,
      recordingTime: 0,
      recordingTimer: null,
      selectedAudioFile: null,
      isDragOver: false,
      
      // YouTube
      youtubeUrl: '',
      
      // Document upload
      selectedDocumentFile: null,
      isDragOverDoc: false,
      
      // Processing
      processingMessage: '',
      processingProgress: 0,
      isProcessing: false
    }
  },
  async mounted() {
    await this.loadUserData();
    await this.loadRecentNotes();
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
    
    async loadUserData() {
      try {
        this.loading = true;
        this.error = null;

        // Get user ID from JWT token
        const userId = await getUserIdFromToken();
        if (!userId) {
          throw new Error('No valid user token found');
        }
        this.userId = userId;

        // Fetch user account data
        const accountData = await getAccount(userId);
        this.userName = accountData.username;
        this.userEmail = accountData.email;
        this.userLevel = accountData.currentLevel || 1;

      } catch (error) {
        console.error('Error loading user data:', error);
        this.error = 'Failed to load user data';
        this.showError('Failed to load user data');

        // If token is invalid, redirect to login
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },

    async loadRecentNotes() {
      try {
        if (!this.userId) return;
        
        const notesResponse = await getUserNotes(this.userId);
        const notesData = notesResponse.data || notesResponse || [];
        
        if (Array.isArray(notesData)) {
          this.recentNotes = notesData.slice(0, 6).map(note => ({
            id: note._id,
            title: note.title,
            content: note.content,
            category: note.category,
            isFavorite: note.isFavorite,
            updatedAt: note.date_updated || note.updatedAt
          }));
        } else {
          console.warn('Notes data is not an array:', notesData);
          this.recentNotes = [];
        }
      } catch (error) {
        console.error('Error loading notes:', error);
        this.showWarning('Could not load recent notes');
        this.recentNotes = [];
      }
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
    
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    
    // Modal methods
    openAudioModal() {
      this.showAudioModal = true;
      this.resetAudioState();
    },
    
    closeAudioModal() {
      this.showAudioModal = false;
      this.stopRecording();
      this.resetAudioState();
    },
    
    openYouTubeModal() {
      this.showYouTubeModal = true;
      this.youtubeUrl = '';
    },
    
    closeYouTubeModal() {
      this.showYouTubeModal = false;
      this.youtubeUrl = '';
    },
    
    openDocumentModal() {
      this.showDocumentModal = true;
      this.selectedDocumentFile = null;
    },
    
    closeDocumentModal() {
      this.showDocumentModal = false;
      this.selectedDocumentFile = null;
    },
    
    // Audio recording methods
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        const audioChunks = [];
        
        this.mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        this.mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          stream.getTracks().forEach(track => track.stop());
        };
        
        this.mediaRecorder.start();
        this.isRecording = true;
        this.recordingTime = 0;
        
        this.recordingTimer = setInterval(() => {
          this.recordingTime++;
        }, 1000);
        
      } catch (error) {
        console.error('Error starting recording:', error);
        this.showError('Could not access microphone');
      }
    },
    
    stopRecording() {
      if (this.mediaRecorder && this.isRecording) {
        this.mediaRecorder.stop();
        this.isRecording = false;
        
        if (this.recordingTimer) {
          clearInterval(this.recordingTimer);
          this.recordingTimer = null;
        }
      }
    },
    
    playRecording() {
      if (this.audioBlob) {
        const audio = new Audio(URL.createObjectURL(this.audioBlob));
        audio.play();
      }
    },
    
    resetAudioState() {
      this.selectedAudioFile = null;
      this.audioBlob = null;
      this.recordingTime = 0;
      this.isDragOver = false;
    },
    
    // File handling methods
    triggerAudioFileInput() {
      this.$refs.audioFileInput.click();
    },
    
    handleAudioFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedAudioFile = file;
      }
    },
    
    handleAudioDrop(event) {
      event.preventDefault();
      this.isDragOver = false;
      
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('audio/')) {
          this.selectedAudioFile = file;
        } else {
          this.showError('Please select an audio file');
        }
      }
    },
    
    triggerDocumentFileInput() {
      this.$refs.documentFileInput.click();
    },
    
    handleDocumentFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedDocumentFile = file;
      }
    },
    
    handleDocumentDrop(event) {
      event.preventDefault();
      this.isDragOverDoc = false;
      
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        const allowedTypes = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (allowedTypes.includes(fileExtension)) {
          this.selectedDocumentFile = file;
        } else {
          this.showError('Please select a PDF, DOC, or PPT file');
        }
      }
    },
    
    // Processing methods
    async processAudio() {
      if (!this.selectedAudioFile && !this.audioBlob) {
        this.showError('Please select an audio file or record audio');
        return;
      }
      
      this.startProcessing('Processing audio and generating notes...');
      this.closeAudioModal();
      
      try {
        this.updateProgress(20);
        
        // Use either uploaded file or recorded blob
        const audioToProcess = this.selectedAudioFile || this.audioBlob;
        const result = await processAudio(audioToProcess);
        this.updateProgress(70);
        
        if (result && result.success && result.note) {
          const noteData = {
            title: result.note.title || 'Audio Notes',
            content: result.note.content || 'No content available',
            category: 'Audio Notes',
            userId: this.userId
          };
          
          this.updateProgress(90);
          await createNote(noteData);
          this.updateProgress(100);
          
          this.showSuccess('Audio processed successfully! Notes have been created.');
          await this.loadRecentNotes();
        } else {
          throw new Error(result?.error || 'Failed to process audio - no valid response');
        }
        
      } catch (error) {
        console.error('Audio processing error:', error);
        
        if (error.message.includes('timeout')) {
          this.showError('Processing timeout. The audio file might be too large.');
        } else if (error.message.includes('Network error')) {
          this.showError('Network error. Please check your internet connection.');
        } else {
          this.showError(`Failed to process audio: ${error.message}`);
        }
      } finally {
        this.stopProcessing();
        this.resetAudioState();
      }
    },
    
    async processYouTube() {
      // Enhanced validation
      if (!this.youtubeUrl || typeof this.youtubeUrl !== 'string' || this.youtubeUrl.trim() === '') {
        this.showError('Please enter a YouTube URL');
        return;
      }
      
      const trimmedUrl = this.youtubeUrl.trim();
      if (!this.isValidYouTubeUrl(trimmedUrl)) {
        this.showError('Please enter a valid YouTube URL');
        return;
      }
      
      this.startProcessing('Processing YouTube video and generating notes...');
      this.closeYouTubeModal();
      
      try {
        this.updateProgress(20);
        
        // Pass the trimmed URL to ensure it's clean
        const result = await processYouTubeVideo(trimmedUrl);
        this.updateProgress(70);
        
        if (result && result.success && result.note) {
          const noteData = {
            title: result.note.title || 'YouTube Video Notes',
            content: result.note.content || 'No content available',
            category: 'YouTube Notes',
            userId: this.userId
          };
          
          this.updateProgress(90);
          await createNote(noteData);
          this.updateProgress(100);
          
          this.showSuccess('YouTube video processed successfully! Notes have been created.');
          await this.loadRecentNotes();
        } else {
          throw new Error(result?.error || 'Failed to process YouTube video - no valid response');
        }
        
      } catch (error) {
        console.error('YouTube processing error:', error);
        
        // Enhanced error handling
        if (error.message.includes('YouTube URL is required')) {
          this.showError('Invalid YouTube URL. Please check the URL and try again.');
        } else if (error.message.includes('timeout')) {
          this.showError('Processing timeout. The video might be too long or the server is busy.');
        } else if (error.message.includes('Network error')) {
          this.showError('Network error. Please check your internet connection.');
        } else {
          this.showError(`Failed to process YouTube video: ${error.message}`);
        }
      } finally {
        this.stopProcessing();
        this.youtubeUrl = '';
      }
    },
    
    async processDocument() {
      if (!this.selectedDocumentFile) {
        this.showError('Please select a document file');
        return;
      }
      
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!allowedTypes.includes(this.selectedDocumentFile.type)) {
        this.showError('Please select a valid document file (PDF, DOC, DOCX, PPT, PPTX)');
        return;
      }
      
      this.startProcessing('Processing document and generating notes...');
      this.closeDocumentModal();
      
      try {
        this.updateProgress(20);
        const result = await processDocument(this.selectedDocumentFile);
        this.updateProgress(70);
        
        if (result && result.success && result.note) {
          const noteData = {
            title: result.note.title || `Document Notes - ${this.selectedDocumentFile.name}`,
            content: result.note.content || 'No content available',
            category: 'Document Notes',
            userId: this.userId
          };
          
          this.updateProgress(90);
          await createNote(noteData);
          this.updateProgress(100);
          
          this.showSuccess('Document processed successfully! Notes have been created.');
          await this.loadRecentNotes();
        } else {
          throw new Error(result?.error || 'Failed to process document - no valid response');
        }
        
      } catch (error) {
        console.error('Document processing error:', error);
        
        if (error.message.includes('timeout')) {
          this.showError('Processing timeout. The document might be too large or complex.');
        } else if (error.message.includes('Network error')) {
          this.showError('Network error. Please check your internet connection.');
        } else {
          this.showError(`Failed to process document: ${error.message}`);
        }
      } finally {
        this.stopProcessing();
        this.selectedDocumentFile = null;
      }
    },
    
    // Processing helper methods
    startProcessing(message) {
      this.isProcessing = true;
      this.showProcessingModal = true;
      this.processingMessage = message;
      this.processingProgress = 0;
    },
    
    updateProgress(progress) {
      this.processingProgress = progress;
    },
    
    stopProcessing() {
      this.isProcessing = false;
      this.showProcessingModal = false;
      this.processingProgress = 0;
      this.processingMessage = '';
    },
    
    // Utility methods
    // Enhanced YouTube URL validation
    isValidYouTubeUrl(url) {
      if (!url || typeof url !== 'string') return false;
      
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
      return youtubeRegex.test(url.trim());
    },
    
    getFileIcon(fileName) {
      const extension = fileName.split('.').pop().toLowerCase();
      const iconMap = {
        pdf: 'fas fa-file-pdf',
        doc: 'fas fa-file-word',
        docx: 'fas fa-file-word',
        ppt: 'fas fa-file-powerpoint',
        pptx: 'fas fa-file-powerpoint',
        default: 'fas fa-file'
      };
      return iconMap[extension] || iconMap.default;
    },
    
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // Note methods
    openNote(noteId) {
      if (noteId) {
        this.$router.push({ path: '/notes', query: { noteId: noteId } });
      } else {
        console.error('Note ID is undefined');
        this.showError('Unable to open note - invalid note ID');
      }
    },
    
    async toggleNoteFavorite(note) {
      try {
        const { toggleNoteFavorite } = await import('../../api/Note.js');
        const updatedNote = await toggleNoteFavorite(note.id);
        note.isFavorite = updatedNote.data.isFavorite;
        this.showSuccess(`Note ${note.isFavorite ? 'added to' : 'removed from'} favorites`);
      } catch (error) {
        console.error('Error toggling note favorite:', error);
        note.isFavorite = !note.isFavorite;
        
        if (error.response?.status === 404) {
          this.showError('Note not found');
        } else if (error.code === 'ERR_NETWORK') {
          this.showError('Unable to connect to server. Please check your connection.');
        } else {
          this.showError('Failed to update note favorite status');
        }
      }
    },
    
    truncateNoteContent(content) {
      return content.length > 80 ? content.substring(0, 80) + '...' : content;
    },
    
    formatNoteDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  position: relative;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
  overflow: hidden;
}

/* Space Background */
.space-background {
  position: relative;
}

.space-particles {
  position: fixed;
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
}

.particle.small { width: 4px; height: 4px; }
.particle.medium { width: 6px; height: 6px; }
.particle.large { width: 8px; height: 8px; }

.particle.blue { background: rgba(100, 200, 255, 0.6); }
.particle.purple { background: rgba(150, 100, 255, 0.6); }
.particle.pink { background: rgba(255, 100, 200, 0.6); }
.particle.cyan { background: rgba(100, 255, 200, 0.6); }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Generate random positions for particles */
.particle-1 { top: 10%; left: 10%; animation-delay: 0s; }
.particle-2 { top: 20%; left: 80%; animation-delay: 1s; }
.particle-3 { top: 80%; left: 20%; animation-delay: 2s; }
.particle-4 { top: 60%; left: 90%; animation-delay: 3s; }
.particle-5 { top: 30%; left: 60%; animation-delay: 4s; }
.particle-6 { top: 90%; left: 70%; animation-delay: 5s; }
.particle-7 { top: 15%; left: 40%; animation-delay: 0.5s; }
.particle-8 { top: 70%; left: 15%; animation-delay: 1.5s; }
.particle-9 { top: 40%; left: 85%; animation-delay: 2.5s; }
.particle-10 { top: 85%; left: 45%; animation-delay: 3.5s; }
.particle-11 { top: 25%; left: 25%; animation-delay: 4.5s; }
.particle-12 { top: 65%; left: 75%; animation-delay: 5.5s; }
.particle-13 { top: 5%; left: 55%; animation-delay: 0.8s; }
.particle-14 { top: 75%; left: 5%; animation-delay: 1.8s; }
.particle-15 { top: 45%; left: 95%; animation-delay: 2.8s; }
.particle-16 { top: 95%; left: 35%; animation-delay: 3.8s; }
.particle-17 { top: 35%; left: 15%; animation-delay: 4.8s; }
.particle-18 { top: 55%; left: 65%; animation-delay: 5.8s; }
.particle-19 { top: 12%; left: 75%; animation-delay: 1.2s; }
.particle-20 { top: 82%; left: 55%; animation-delay: 2.2s; }

/* Loading and Error States */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  z-index: 10;
  position: relative;
}

.loading-spinner {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #64b5f6;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #f44336;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(45deg, #64b5f6, #42a5f5);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.3);
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
  z-index: 5;
  position: relative;
}

.dashboard-header {
  margin-bottom: 3rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content h1 {
  color: white;
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
}

.header-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0.5rem 0 0 0;
  font-size: 1.1rem;
}

/* Study Tools Grid */
.study-tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.tool-card {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tool-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 0.3);
}

.tool-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: white;
}

.audio-card .tool-icon {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
}

.youtube-card .tool-icon {
  background: linear-gradient(45deg, #ff0000, #cc0000);
}

.document-card .tool-icon {
  background: linear-gradient(45deg, #4834d4, #686de0);
}

.tool-content {
  flex: 1;
}

.tool-content h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;
  font-weight: 600;
}

.tool-content p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.9rem;
}

.tool-arrow {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  transition: all 0.3s ease;
}

.tool-card:hover .tool-arrow {
  color: white;
  transform: translateX(4px);
}

/* Notes Section */
.notes-section {
  margin-top: 3rem;
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
  font-weight: 600;
}

.section-header h2 i {
  margin-right: 0.5rem;
  color: #64b5f6;
}

.view-all-btn {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: rgba(100, 181, 246, 0.2);
  color: #64b5f6;
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid rgba(100, 181, 246, 0.3);
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.view-all-btn:hover {
  background: rgba(100, 181, 246, 0.3);
  transform: translateY(-2px);
}

.view-all-btn i {
  margin-right: 0.5rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.note-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.note-header h4 {
  color: white;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
}

.note-category {
  background: rgba(100, 181, 246, 0.2);
  color: #64b5f6;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.note-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.note-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
}

.favorite-btn {
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
  background: rgba(255, 107, 107, 0.1);
}

.favorite-btn .fas {
  color: #ff6b6b;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
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
  font-size: 1.3rem;
  font-weight: 600;
}

.modal-header h3 i {
  margin-right: 0.5rem;
  color: #64b5f6;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-btn, .process-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.process-btn {
  background: linear-gradient(45deg, #64b5f6, #42a5f5);
  color: white;
}

.process-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(100, 181, 246, 0.3);
}

.process-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Upload Area */
.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
}

.upload-area:hover, .upload-area.drag-over {
  border-color: #64b5f6;
  background: rgba(100, 181, 246, 0.1);
}

.upload-area i {
  font-size: 2rem;
  color: #64b5f6;
  margin-bottom: 1rem;
}

.upload-area p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Recording Section */
.recording-section {
  margin-top: 1rem;
  text-align: center;
}

.record-controls {
  margin-bottom: 1rem;
}

.record-btn, .stop-btn, .play-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  color: white;
}

.record-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
}

.stop-btn {
  background: linear-gradient(45deg, #ff4757, #c44569);
}

.play-btn {
  background: linear-gradient(45deg, #5f27cd, #341f97);
}

.record-btn:hover, .stop-btn:hover, .play-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.recording-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #ff6b6b;
  font-weight: 500;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #ff6b6b;
  border-radius: 50%;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* Input Section */
.input-section {
  margin-bottom: 1rem;
}

.input-section label {
  display: block;
  color: white;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.url-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
}

.url-input:focus {
  outline: none;
  border-color: #64b5f6;
  box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
}

.url-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.url-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(100, 181, 246, 0.1);
  border-radius: 6px;
  color: #64b5f6;
  font-size: 0.9rem;
}

/* File Preview */
.file-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-info i {
  font-size: 1.5rem;
  color: #64b5f6;
}

.file-details {
  flex: 1;
}

.file-name {
  display: block;
  color: white;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.file-size {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

/* Processing Modal */
.processing-modal {
  max-width: 400px;
}

.processing-content {
  text-align: center;
  padding: 2rem;
}

.processing-spinner {
  font-size: 3rem;
  color: #64b5f6;
  margin-bottom: 1rem;
}

.processing-content h3 {
  color: white;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
}

.processing-content p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 1.5rem 0;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(45deg, #64b5f6, #42a5f5);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }
  
  .study-tools-grid {
    grid-template-columns: 1fr;
  }
  
  .notes-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>