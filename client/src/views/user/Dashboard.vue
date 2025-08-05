<template>
  <div class="dashboard-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container h-screen w-screen">
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
            <h1>Dashboard</h1>
            <p>Start your future</p>
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

        <!-- Notes Section -->
        <div class="notes-section" v-if="recentNotes.length > 0 || searchQuery.trim()">
          <div class="section-header">
            <h2><i class="fas fa-sticky-note"></i> {{ searchQuery.trim() ? 'Search Results' : 'Recent Notes' }}</h2>
            <div class="header-actions">
              <div class="search-container">
                <div class="search-input-wrapper">
                  <i class="fas fa-search search-icon"></i>
                  <input
                    v-model="searchQuery"
                    @input="handleSearchInput"
                    type="text"
                    placeholder="Search notes..."
                    class="search-input"
                  />
                  <button
                    v-if="searchQuery.trim()"
                    @click="clearSearch"
                    class="clear-search-btn"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div class="notes-list">
            <!-- No results message -->
            <div v-if="searchQuery.trim() && filteredNotes.length === 0" class="no-results">
              <div class="no-results-icon">
                <i class="fas fa-search"></i>
              </div>
              <h3>No notes found</h3>
              <p>Try adjusting your search terms or create a new note.</p>
            </div>

            <!-- Notes list -->
            <div class="note-item" v-for="note in displayedNotes" :key="note.id">
              <div class="note-icon">
                <i :class="getNoteIcon(note.category)"></i>
              </div>
              <div class="note-main" @click="openNote(note.id)">
                <div class="note-header">
                  <h4>{{ note.title }}</h4>
                  <span class="note-date">{{ formatNoteDate(note.updatedAt) }}</span>
                </div>
                <div class="note-content">
                  <p>{{ truncateNoteContent(note.content) }}</p>
                </div>
              </div>
              <div class="note-actions">
                <div class="dropdown" :class="{ active: activeDropdown === note.id }">
                  <button @click.stop="toggleDropdown(note.id)" class="dropdown-toggle">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <div class="dropdown-menu" v-if="activeDropdown === note.id">
                    <button @click.stop="exportNote(note, 'pdf')" class="dropdown-item">
                      <i class="fas fa-file-pdf"></i> Export as PDF
                    </button>
                    <button @click.stop="exportNote(note, 'doc')" class="dropdown-item">
                      <i class="fas fa-file-word"></i> Export as DOC
                    </button>
                    <button @click.stop="deleteNoteConfirm(note)" class="dropdown-item delete">
                      <i class="fas fa-trash"></i> Delete
                    </button>
                  </div>
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
            <button @click="processAudio" :disabled="!canProcessAudio" class="process-btn">
              <i class="fas fa-magic"></i> Process with AI
              <span v-if="!canProcessAudio" class="debug-info">(No audio)</span>
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

    <!-- Create Note Modal -->
    <div v-if="showCreateNoteModal" class="modal-overlay" @click="closeCreateNoteModal">
      <div class="modal-content create-note-modal" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-plus"></i> Create New Note</h3>
          <button @click="closeCreateNoteModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Title</label>
            <input
              v-model="newNote.title"
              type="text"
              placeholder="Enter note title..."
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Category</label>
            <input
              v-model="newNote.category"
              type="text"
              placeholder="Enter category..."
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Content</label>
            <textarea
              v-model="newNote.content"
              placeholder="Write your note here..."
              rows="8"
              class="form-textarea"
            ></textarea>
          </div>

          <div class="modal-actions">
            <button @click="closeCreateNoteModal" class="cancel-btn">Cancel</button>
            <button @click="createNewNote" :disabled="!newNote.title.trim()" class="create-btn">
              <i class="fas fa-save"></i> Create Note
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccount, getUserIdFromToken } from '@/api/Account';
import { getUserNotes, createNote, deleteNote } from '@/api/Note';
import {
  processYouTubeVideo,
  processDocument,
  processAudioFile
} from '@/api/AI';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

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
      isProcessing: false,
      isProcessingAudio: false,

      // Create Note Modal
      showCreateNoteModal: false,
      newNote: {
        title: '',
        category: '',
        content: ''
      },

      // Notes dropdown
      activeDropdown: null,

      // Search functionality
      searchQuery: '',
      allNotes: [], // Store all notes for searching
      searchTimeout: null
    }
  },
  async mounted() {
    await this.loadUserData();
    await this.loadRecentNotes();

    // Add click outside handler for dropdown
    document.addEventListener('click', this.handleClickOutside);
  },

  beforeUnmount() {
    // Remove click outside handler
    document.removeEventListener('click', this.handleClickOutside);

    // Clear search timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  },

  computed: {
    canProcessAudio() {
      const hasFile = this.selectedAudioFile && this.selectedAudioFile.size > 0;
      const hasBlob = this.audioBlob && this.audioBlob.size > 0;
      return hasFile || hasBlob;
    },

    filteredNotes() {
      if (!this.searchQuery.trim()) {
        return this.recentNotes;
      }

      const query = this.searchQuery.toLowerCase().trim();
      return this.allNotes.filter(note => {
        return (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          (note.category && note.category.toLowerCase().includes(query))
        );
      });
    },

    displayedNotes() {
      return this.searchQuery.trim() ? this.filteredNotes : this.recentNotes;
    }
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
          // Map all notes for search functionality
          this.allNotes = notesData.map(note => ({
            id: note._id,
            title: note.title,
            content: note.content,
            category: note.category,
            isFavorite: note.isFavorite,
            updatedAt: note.date_updated || note.updatedAt
          }));

          // Show only recent 6 notes for the recent notes section
          this.recentNotes = this.allNotes.slice(0, 6);
        } else {
          console.warn('Notes data is not an array:', notesData);
          this.recentNotes = [];
          this.allNotes = [];
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
      console.log('Opening audio modal');
      this.showAudioModal = true;
      this.resetAudioState();
      console.log('Audio state after reset:', {
        selectedAudioFile: this.selectedAudioFile,
        audioBlob: this.audioBlob,
        canProcessAudio: this.canProcessAudio
      });
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

    closeCreateNoteModal() {
      this.showCreateNoteModal = false;
      this.newNote = {
        title: '',
        category: '',
        content: ''
      };
    },

    async createNewNote() {
      try {
        if (!this.newNote.title.trim()) {
          this.showError('Please enter a note title');
          return;
        }

        const noteData = {
          title: this.newNote.title.trim(),
          category: this.newNote.category.trim() || 'General',
          content: this.newNote.content.trim() || 'No content',
          userId: this.userId
        };

        const response = await createNote(noteData);

        if (response.success) {
          this.showSuccess('Note created successfully!');
          this.closeCreateNoteModal();
          // Refresh notes list
          await this.loadRecentNotes();
        } else {
          this.showError('Failed to create note');
        }
      } catch (error) {
        console.error('Error creating note:', error);
        this.showError('Failed to create note');
      }
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
      this.startProcessing('Transcribing audio and generating AI analysis...');
      this.closeAudioModal();

      try {
        this.updateProgress(10);
        
        // Get audio file from input
        let audioFile = null;
        
        // Check if file is selected via file input
        if (this.selectedAudioFile) {
          audioFile = this.selectedAudioFile;
        } else if (this.$refs.audioFileInput && this.$refs.audioFileInput.files.length > 0) {
          audioFile = this.$refs.audioFileInput.files[0];
        }
        
        // Validate audio file
        if (!audioFile) {
          throw new Error('Please select an audio file to process');
        }
        
        // Check file size (max 50MB)
        if (audioFile.size > 50 * 1024 * 1024) {
          throw new Error('Audio file is too large. Maximum size is 50MB.');
        }
        
        // Check file type
        const allowedTypes = [
          'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 
          'audio/m4a', 'audio/aac', 'audio/flac', 'audio/webm'
        ];
        
        if (!allowedTypes.includes(audioFile.type)) {
          throw new Error(`Unsupported audio format: ${audioFile.type}. Supported formats: MP3, WAV, OGG, M4A, AAC, FLAC`);
        }
        
        // Check if file is actually readable
        if (audioFile.size === 0) {
          throw new Error('Selected audio file is empty or corrupted');
        }
        
        this.updateProgress(20);
        console.log('Processing audio file:', audioFile.name, audioFile.size, audioFile.type);
        
        // Use the new AssemblyAI + Gemini integration
        const result = await processAudioFile(audioFile);
        this.updateProgress(80);
        
        if (result && result.data && result.data.note) {
          this.updateProgress(90);
          
          // Show detailed success message
          const transcriptionInfo = result.data.transcription;
          let successMessage = 'Audio processed successfully! ';
          if (transcriptionInfo) {
            successMessage += `Transcribed ${transcriptionInfo.textLength} characters in ${transcriptionInfo.language || 'detected language'}.`;
          }
          
          this.updateProgress(100);
          this.showSuccess(successMessage);
          
          // Refresh notes list to show the newly created note
          await this.loadRecentNotes();
          
          // Clear the file input
          this.selectedAudioFile = null;
          if (this.$refs.audioFileInput) {
            this.$refs.audioFileInput.value = '';
          }
        } else {
          throw new Error(result?.message || 'Failed to process audio - no valid response');
        }
        
      } catch (error) {
        console.error('Audio processing error:', error);
        
        if (error.message.includes('timeout')) {
          this.showError('Processing timeout. The audio file might be too large or the service is busy.');
        } else if (error.message.includes('Network error')) {
          this.showError('Network error. Please check your internet connection.');
        } else {
          this.showError(error.message || 'Failed to process audio file');
        }
      } finally {
        this.updateProgress(0);
        this.isProcessingAudio = false;
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

      this.startProcessing('Extracting audio, transcribing, and generating AI analysis...');
      this.closeYouTubeModal();

      try {
        this.updateProgress(10);
        console.log('Processing YouTube URL:', trimmedUrl);

        // Use the new AssemblyAI + Gemini integration
        const result = await processYouTubeVideo(trimmedUrl);
        this.updateProgress(80);

        if (result && result.data && result.data.note) {
          // Note is already created by the backend, no need to create it again
          this.updateProgress(90);

          // Show detailed success message
          const videoInfo = result.data.videoInfo;
          const transcriptionInfo = result.data.transcription;
          let successMessage = 'YouTube video processed successfully! ';
          if (videoInfo && transcriptionInfo) {
            const duration = Math.floor(videoInfo.duration / 60);
            successMessage += `Analyzed "${videoInfo.title}" (${duration} min) with ${transcriptionInfo.textLength} characters transcribed.`;
          }

          this.updateProgress(100);
          this.showSuccess(successMessage);

          // Refresh notes list to show the newly created note
          await this.loadRecentNotes();
        } else {
          throw new Error(result?.message || 'Failed to process YouTube video - no valid response');
        }

      } catch (error) {
        console.error('YouTube processing error:', error);

        // Enhanced error handling
        if (error.message.includes('Invalid YouTube URL')) {
          this.showError('Invalid YouTube URL. Please check the URL and try again.');
        } else if (error.message.includes('bot detection') || error.message.includes('automated access') || error.message.includes('demonstration purposes')) {
          this.showWarning('YouTube has detected automated access. The system has provided a sample analysis for demonstration. For full functionality, please try again later.');
        } else if (error.message.includes('too long')) {
          this.showError('Video is too long (over 2 hours). Please use a shorter video.');
        } else if (error.message.includes('No audio stream')) {
          this.showError('No audio found in this YouTube video. Please try a different video.');
        } else if (error.message.includes('timeout')) {
          this.showError('Processing timeout. The video might be too long or the service is busy.');
        } else if (error.message.includes('Network error')) {
          this.showError('Network error. Please check your internet connection.');
        } else if (error.message.includes('overloaded')) {
          this.showError('AI service is currently overloaded. Please try again in a few moments.');
        } else if (error.message.includes('quota exceeded')) {
          this.showError('Service quota exceeded. Please try again later.');
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

      console.log('Processing document:', this.selectedDocumentFile.name, this.selectedDocumentFile.type);

      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
      if (!allowedTypes.includes(this.selectedDocumentFile.type)) {
        this.showError('Please select a valid document file (PDF, DOC, DOCX, PPT, PPTX)');
        return;
      }

      // Store file reference before closing modal
      const fileToProcess = this.selectedDocumentFile;

      // Show different messages for different file types
      const fileExtension = fileToProcess.name.toLowerCase().substring(fileToProcess.name.lastIndexOf('.'));
      let processingMessage = 'Processing document and generating notes...';

      if (fileExtension === '.pptx' || fileExtension === '.ppt') {
        processingMessage = 'Processing PowerPoint presentation... This may take a few minutes for complex slides.';
      } else if (fileExtension === '.pdf') {
        processingMessage = 'Processing PDF document... Please wait while we extract and analyze the content.';
      }

      this.startProcessing(processingMessage);
      this.closeDocumentModal();

      try {
        this.updateProgress(20);
        console.log('[Dashboard] Sending document to backend:', fileToProcess.name);

        // Update progress message for PowerPoint files
        if (fileExtension === '.pptx' || fileExtension === '.ppt') {
          this.updateProgress(30, 'Extracting text from slides...');

          // Add a longer timeout warning for PowerPoint
          setTimeout(() => {
            if (this.isProcessing) {
              this.updateProgress(40, 'Still processing slides... PowerPoint files can take longer.');
            }
          }, 30000); // 30 seconds

          setTimeout(() => {
            if (this.isProcessing) {
              this.updateProgress(50, 'Almost done with slide processing...');
            }
          }, 60000); // 60 seconds
        }

        const result = await processDocument(fileToProcess);
        console.log('[Dashboard] Backend response:', result);
        this.updateProgress(70);

        // More flexible response validation
        if (result && result.success) {
          console.log('[Dashboard] Document processed successfully');

          // Check if note was created (either in result.data.note or result.note)
          const noteCreated = result.data?.note || result.note;
          if (noteCreated) {
            console.log('[Dashboard] Note created:', noteCreated.title);
          }

          this.updateProgress(100);
          this.showSuccess(result.message || 'Document processed successfully! Notes have been created.');
          await this.loadRecentNotes();
        } else {
          console.error('[Dashboard] Processing failed. Full response:', result);

          // More detailed error message
          let errorMessage = 'Failed to process document';
          if (result?.message) {
            errorMessage = result.message;
          } else if (result?.error) {
            errorMessage = result.error;
          } else if (!result) {
            errorMessage = 'No response received from server';
          } else if (!result.success) {
            errorMessage = 'Server reported processing failure';
          }

          throw new Error(errorMessage);
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
        this.$router.push({ path: `/note/${noteId}` });
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
    },

    // Get icon for note category
    getNoteIcon(category) {
      const icons = {
        'Document': 'fas fa-file-alt',
        'Document Notes': 'fas fa-file-alt',
        'Video': 'fab fa-youtube',
        'Audio': 'fas fa-microphone',
        'General': 'fas fa-sticky-note',
        'Study': 'fas fa-book',
        'Research': 'fas fa-search',
        'Meeting': 'fas fa-users',
        'Personal': 'fas fa-user'
      };
      return icons[category] || 'fas fa-sticky-note';
    },

    // Toggle dropdown menu
    toggleDropdown(noteId) {
      this.activeDropdown = this.activeDropdown === noteId ? null : noteId;
    },

    // Export note functionality
    async exportNote(note, format) {
      this.activeDropdown = null;

      try {
        if (format === 'pdf') {
          await this.exportNoteToPDF(note);
        } else if (format === 'doc') {
          await this.exportNoteToDOC(note);
        }

        this.showSuccess(`Note exported as ${format.toUpperCase()} successfully!`);
      } catch (error) {
        console.error('Export error:', error);
        this.showError(`Failed to export note as ${format.toUpperCase()}`);
      }
    },

    async exportNoteToPDF(note) {
      const pdf = new jsPDF();

      // Set font
      pdf.setFont('helvetica');

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text(note.title || 'Untitled Note', 20, 30);

      // Add metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Created: ${this.formatNoteDate(note.date_created)}`, 20, 45);
      pdf.text(`Category: ${note.category || 'General'}`, 20, 55);

      // Add content
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);

      // Split content into lines that fit the page width
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);

      const lines = pdf.splitTextToSize(note.content || 'No content available', maxLineWidth);

      let yPosition = 70;
      const lineHeight = 7;
      const pageHeight = pdf.internal.pageSize.getHeight();

      lines.forEach(line => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 30;
        }
        pdf.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Save the PDF
      const fileName = `${note.title || 'note'}.pdf`;
      pdf.save(fileName);
    },

    async exportNoteToDOC(note) {
      // Create a new document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: note.title || 'Untitled Note',
                  bold: true,
                  size: 32,
                  color: "2E2E2E"
                })
              ],
              heading: HeadingLevel.TITLE,
              spacing: {
                after: 400
              }
            }),

            // Metadata
            new Paragraph({
              children: [
                new TextRun({
                  text: `Created: ${this.formatNoteDate(note.date_created)}`,
                  size: 20,
                  color: "666666"
                })
              ],
              spacing: {
                after: 200
              }
            }),

            new Paragraph({
              children: [
                new TextRun({
                  text: `Category: ${note.category || 'General'}`,
                  size: 20,
                  color: "666666"
                })
              ],
              spacing: {
                after: 400
              }
            }),

            // Content
            ...this.formatContentForDOC(note.content || 'No content available')
          ]
        }]
      });

      // Generate and save the document
      const buffer = await Packer.toBuffer(doc);
      const fileName = `${note.title || 'note'}.docx`;
      saveAs(new Blob([buffer]), fileName);
    },

    formatContentForDOC(content) {
      // Split content into paragraphs and format them
      const paragraphs = content.split('\n\n').filter(p => p.trim());

      return paragraphs.map(paragraph => {
        return new Paragraph({
          children: [
            new TextRun({
              text: paragraph.trim(),
              size: 24,
              color: "3C3C3C"
            })
          ],
          spacing: {
            after: 200
          }
        });
      });
    },

    // Delete note confirmation
    deleteNoteConfirm(note) {
      this.activeDropdown = null;

      if (confirm(`Are you sure you want to delete "${note.title}"? This action cannot be undone.`)) {
        this.deleteNoteAction(note);
      }
    },

    // Delete note action
    async deleteNoteAction(note) {
      try {
        const response = await deleteNote(note.id);

        if (response.success) {
          this.showSuccess('Note deleted successfully');
          await this.loadRecentNotes();
        } else {
          this.showError('Failed to delete note');
        }
      } catch (error) {
        console.error('Delete note error:', error);
        this.showError('Failed to delete note');
      }
    },

    // Handle click outside dropdown
    handleClickOutside(event) {
      if (!event.target.closest('.dropdown')) {
        this.activeDropdown = null;
      }
    },

    // Search functionality
    handleSearchInput() {
      // Clear existing timeout
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }

      // If search query is empty, just show recent notes
      if (!this.searchQuery.trim()) {
        return;
      }

      // Debounce search to avoid too many API calls
      this.searchTimeout = setTimeout(async () => {
        await this.performSearch();
      }, 300);
    },

    async performSearch() {
      try {
        if (!this.searchQuery.trim()) {
          return;
        }

        // Load all notes if not already loaded
        if (this.allNotes.length === 0) {
          await this.loadAllNotes();
        }

        // The filtering is handled by the computed property
        console.log(`Search performed for: "${this.searchQuery}"`);
        console.log(`Found ${this.filteredNotes.length} results`);

      } catch (error) {
        console.error('Search error:', error);
        this.showError('Failed to search notes');
      }
    },

    async loadAllNotes() {
      try {
        if (!this.userId) return;

        const notesResponse = await getUserNotes(this.userId);
        const notesData = notesResponse.data || notesResponse || [];

        if (Array.isArray(notesData)) {
          this.allNotes = notesData.map(note => ({
            id: note._id,
            title: note.title,
            content: note.content,
            category: note.category,
            isFavorite: note.isFavorite,
            updatedAt: note.date_updated || note.updatedAt
          }));
        } else {
          console.warn('Notes data is not an array:', notesData);
          this.allNotes = [];
        }
      } catch (error) {
        console.error('Error loading all notes:', error);
        this.showWarning('Could not load notes for search');
        this.allNotes = [];
      }
    },

    clearSearch() {
      this.searchQuery = '';
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = null;
      }
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
  overflow: hidden;
}

/* Space Background */
.space-background {
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
}

/* Space Particles */
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
  transition: margin-left 0.5s ease-out;
}

/* Responsive to sidebar state */
@media (min-width: 769px) {
  .main-content {
    margin-left: var(--sidebar-width, 280px);
  }
}

.dashboard-header {
  margin-bottom: 3rem;
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: white;
  -webkit-background-clip: text;
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-content p {
  color: white;
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

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.add-note-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
}

.add-note-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
  background: linear-gradient(135deg, #45a049, #388e3c);
}

/* Search Container */
.search-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  padding: 0.5rem 1rem;
  transition: all 0.3s ease;
  min-width: 300px;
}

.search-input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.15);
  border-color: #64b5f6;
  box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 0.75rem;
  font-size: 0.9rem;
}

.search-input {
  background: none;
  border: none;
  color: white;
  font-size: 0.9rem;
  outline: none;
  flex: 1;
  padding: 0;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.clear-search-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  margin-left: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}

.clear-search-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 3rem 2rem;
  color: rgba(255, 255, 255, 0.7);
}

.no-results-icon {
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 1rem;
}

.no-results h3 {
  color: white;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.no-results p {
  margin: 0;
  font-size: 0.9rem;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.note-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem;
  transition: all 0.3s ease;
  width: 100%;
  position: relative;
}

.note-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
}

.note-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.note-icon i {
  font-size: 1.2rem;
  color: #64b5f6;
}

.note-main {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.note-header h4 {
  margin: 0;
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.note-date {
  color: #b0b0b0;
  font-size: 0.85rem;
  white-space: nowrap;
}

.note-content p {
  margin: 0;
  color: #e0e0e0;
  font-size: 0.9rem;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-actions {
  position: relative;
  margin-left: 1rem;
  flex-shrink: 0;
}

.dropdown {
  position: relative;
  z-index: 10;
}

.dropdown.active {
  z-index: 1000;
}

.dropdown-toggle {
  background: none;
  border: none;
  color: #b0b0b0;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.dropdown-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: rgba(30, 30, 50, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 0;
  min-width: 160px;
  z-index: 9999;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transform: translateZ(0);
  will-change: transform;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  text-align: left;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.dropdown-item.delete:hover {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.dropdown-item i {
  margin-right: 0.5rem;
  width: 16px;
  text-align: center;
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

/* Create Note Modal */
.create-note-modal {
  max-width: 600px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #64b5f6;
  font-weight: 600;
}

.form-input, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
  resize: vertical;
}

.form-input::placeholder, .form-textarea::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.form-input:focus, .form-textarea:focus {
  outline: none;
  border-color: #64b5f6;
  box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
}

.form-textarea {
  min-height: 120px;
  font-family: inherit;
  line-height: 1.5;
}

.create-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.create-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

.create-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  
  .note-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .note-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .note-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .note-header h4 {
    max-width: 100%;
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