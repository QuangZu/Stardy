<template>
  <div class="ai-assistant-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" 
           :class="`particle particle-${i} ${getParticleSize(i)} ${getParticleColor(i)}`">
      </div>
    </div>
    
    <!-- Loading State -->
    <div v-if="loading" class="loading-container h-screen w-screen">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading AI Assistant...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadAssistantData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main AI Assistant Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar
        :userName="userName"
        :userLevel="userLevel"
        currentPage="ai-assistant"
        @logout="logout"
      />

      <!-- Chat History Sidebar -->
      <div class="chat-history-sidebar" :class="{ 'sidebar-collapsed': !chatHistorySidebarOpen }">
        <div class="chat-sidebar-header">
          <div class="sidebar-title">
            <i class="fas fa-comments"></i>
            <span v-if="chatHistorySidebarOpen">Chat History</span>
          </div>
          <button @click="toggleChatHistorySidebar" class="sidebar-toggle">
            <i class="fas" :class="chatHistorySidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'"></i>
          </button>
        </div>

        <div v-if="chatHistorySidebarOpen" class="chat-sidebar-content">
          <!-- New Chat Button -->
          <button @click="createNewChat" class="new-chat-btn">
            <i class="fas fa-plus"></i>
            <span>New chat</span>
          </button>

          <!-- Search Chat -->
          <div class="chat-search">
            <i class="fas fa-search"></i>
            <input
              v-model="chatSearchQuery"
              placeholder="Search chats..."
              class="search-input"
              @input="filterChatHistory"
            />
          </div>

          <!-- Chat Categories -->
          <div class="chat-categories">
            <div class="category-section">
              <h4 class="category-title">
                <i class="fas fa-comments"></i>
                Chats
              </h4>
            </div>
          </div>

          <!-- Recent Chats -->
          <div class="recent-chats">
            <h5 class="section-title">Recents</h5>
            <div class="chat-list">
              <div
                v-for="chat in filteredChatHistory"
                :key="chat.id"
                class="chat-item"
                :class="{ 'active': currentChatId === chat.id }"
                @click="loadChat(chat.id)"
              >
                <div class="chat-item-content">
                  <div class="chat-title" :title="chat.title">
                    {{ chat.title || 'Untitled' }}
                  </div>
                  <div class="chat-date">
                    {{ formatChatDate(chat.updatedAt) }}
                  </div>
                </div>
                <div class="chat-actions">
                  <button @click.stop="showChatMenu(chat.id)" class="chat-menu-btn">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Menu Dropdown -->
        <div v-if="showingChatMenu" class="chat-menu-dropdown" :style="chatMenuPosition">
          <button @click="openEditTitleModal" class="menu-item">
            <i class="fas fa-edit"></i>
            Edit title
          </button>
          <button @click="openDeleteChatModal" class="menu-item delete">
            <i class="fas fa-trash"></i>
            Delete chat
          </button>
        </div>
      </div>

      <!-- Reopen Chat History Button (when sidebar is closed) -->
      <button 
        v-if="!chatHistorySidebarOpen" 
        @click="toggleChatHistorySidebar" 
        class="reopen-chat-btn"
        title="Open Chat History"
      >
        <i class="fas fa-bars"></i>
      </button>

      <!-- Main Content -->
      <div class="main-content">
        <header class="ai-assistant-header">
          <div class="header-content">
            <h1>AI Assistant</h1>
            <p>Your intelligent study companion powered by advanced AI</p>
          </div>
        </header>

        <!-- Chat Interface -->
        <div class="chat-section">
          <h2><i class="fas fa-comments"></i> Chat with AI Assistant</h2>
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessages">
              <!-- Welcome Message -->
              <div class="message ai-message">
                <div class="message-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                  <div class="message-text">
                    <p>Hello! I'm your AI Assistant, powered by advanced language models. I can help you with:</p>
                    <ul>
                      <li>📚 Analyzing and summarizing your study notes</li>
                      <li>🎯 Creating personalized study plans</li>
                      <li>❓ Generating practice questions and quizzes</li>
                      <li>💡 Explaining complex concepts in simple terms</li>
                      <li>🔍 Recommending relevant study resources</li>
                      <li>🎓 Preparing comprehensive exam strategies</li>
                    </ul>
                    <p>How can I assist you with your studies today?</p>
                  </div>
                  <div class="message-time">{{ formatTime(new Date()) }}</div>
                </div>
              </div>
              
              <!-- Chat Messages -->
              <div 
                v-for="message in chatMessages" 
                :key="message.id" 
                :class="['message', message.type + '-message']"
              >
                <div class="message-avatar">
                  <i :class="message.type === 'user' ? 'fas fa-user' : message.type === 'action' ? 'fas fa-check-circle' : 'fas fa-robot'"></i>
                </div>
                <div class="message-content">
                  <!-- Image Display (if message has image) -->
                  <div v-if="message.image" class="message-image">
                    <div v-if="message.imageUrl && !message.image.unavailable" class="image-container">
                      <img :src="message.imageUrl" :alt="message.image.name" class="uploaded-image">
                    </div>
                    <div v-else class="image-unavailable">
                      <i class="fas fa-image"></i>
                      <span>Image no longer available</span>
                    </div>
                    <div class="image-info">
                      <span class="image-name">{{ message.image.name }}</span>
                      <span class="image-size">{{ message.image.size }}</span>
                    </div>
                  </div>

                  <div class="message-text">
                    <div v-html="formatMessage(message.text)"></div>
                  </div>

                  <!-- Action Link (for MCP responses) -->
                  <div v-if="message.link && message.action" class="action-link">
                    <button @click="navigateToLink(message.link)" class="action-button">
                      <i class="fas fa-external-link-alt"></i>
                      View {{ message.action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
                    </button>
                  </div>

                  <!-- New Action Button (for action type messages) -->
                  <div v-if="message.type === 'action' && message.action" class="action-link">
                    <button @click="navigateToLink(message.action.link)" class="action-button success">
                      <i class="fas fa-arrow-right"></i>
                      {{ message.action.text }}
                    </button>
                  </div>

                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
              
              <!-- Typing Indicator -->
              <div v-if="isTyping" class="message ai-message typing">
                <div class="message-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                  <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          
            <!-- Image Preview (if image is selected) -->
            <div v-if="selectedImage" class="image-preview-container">
              <div class="image-preview">
                <img :src="imagePreviewUrl" alt="Selected image" class="preview-image">
                <div class="image-info">
                  <span class="image-name">{{ selectedImage.name }}</span>
                  <span class="image-size">{{ formatFileSize(selectedImage.size) }}</span>
                </div>
                <button @click="removeSelectedImage" class="remove-image-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="input-wrapper">
              <!-- Attachment Button -->
              <button
                @click="triggerImageUpload"
                class="attachment-btn"
                title="Attach image for AI analysis"
                :disabled="isTyping"
              >
                <i class="fas fa-paperclip"></i>
              </button>

              <!-- Hidden File Input -->
              <input
                ref="imageInput"
                type="file"
                accept="image/*,.pdf"
                @change="handleImageSelect"
                style="display: none"
              >

              <input
                v-model="currentMessage"
                @keypress.enter="sendMessage"
                type="text"
                placeholder="Ask me anything about your studies... or attach an image for analysis"
                :disabled="isTyping"
                class="chat-input"
              >
              <button
                @click="sendMessage"
                :disabled="(!currentMessage.trim() && !selectedImage) || isTyping"
                class="send-btn"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <!-- Settings Modal -->
    <div v-if="showSettings" class="modal-overlay" @click="showSettings = false">
      <div class="modal-content settings-modal" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-cog"></i> AI Assistant Settings</h2>
          <button @click="showSettings = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="setting-group">
            <label>Response Style</label>
            <select v-model="settings.responseStyle" class="setting-select">
              <option value="detailed">Detailed Explanations</option>
              <option value="concise">Concise Answers</option>
              <option value="casual">Casual Conversation</option>
            </select>
          </div>
          <div class="setting-group">
            <label>Learning Level</label>
            <select v-model="settings.learningLevel" class="setting-select">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <!-- Chat History Section -->
        <div class="settings-section">
          <h3>Chat History</h3>
          <div class="setting-item">
            <label>Manage Chat History</label>
            <button @click="clearChatHistory" class="clear-history-btn">
              <i class="fas fa-trash"></i> Clear Chat History
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="showSettings = false" class="cancel-btn">Cancel</button>
          <button @click="saveSettings" class="save-btn">Save Settings</button>
        </div>
      </div>
    </div>

    <!-- Note Selector Modal -->
    <div v-if="showNoteSelector" class="modal-overlay" @click="showNoteSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-file-text"></i> Select Note to Enhance</h2>
          <button @click="showNoteSelector = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="userNotes.length === 0" class="no-notes">
            <p>No notes available. Create some notes first!</p>
          </div>
          <div v-else class="notes-list">
            <div
              v-for="note in userNotes"
              :key="note._id"
              @click="enhanceNote(note._id)"
              class="note-item"
            >
              <div class="note-title">{{ note.title }}</div>
              <div class="note-preview">{{ note.content.substring(0, 100) }}...</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Selector Modal -->
    <div v-if="showSummarySelector" class="modal-overlay" @click="showSummarySelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-compress-alt"></i> Select Note to Summarize</h2>
          <button @click="showSummarySelector = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="userNotes.length === 0" class="no-notes">
            <p>No notes available. Create some notes first!</p>
          </div>
          <div v-else class="notes-list">
            <div
              v-for="note in userNotes"
              :key="note._id"
              @click="summarizeNoteAction(note._id)"
              class="note-item"
            >
              <div class="note-title">{{ note.title }}</div>
              <div class="note-preview">{{ note.content.substring(0, 100) }}...</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Question Generator Modal -->
    <div v-if="showQuestionSelector" class="modal-overlay" @click="showQuestionSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-question-circle"></i> Generate Questions from Note</h2>
          <button @click="showQuestionSelector = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="userNotes.length === 0" class="no-notes">
            <p>No notes available. Create some notes first!</p>
          </div>
          <div v-else class="notes-list">
            <div
              v-for="note in userNotes"
              :key="note._id"
              @click="generateQuestionsAction(note._id)"
              class="note-item"
            >
              <div class="note-title">{{ note.title }}</div>
              <div class="note-preview">{{ note.content.substring(0, 100) }}...</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Flashcard Generator Modal -->
    <div v-if="showFlashcardSelector" class="modal-overlay" @click="showFlashcardSelector = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-clone"></i> Create Flashcards from Note</h2>
          <button @click="showFlashcardSelector = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="userNotes.length === 0" class="no-notes">
            <p>No notes available. Create some notes first!</p>
          </div>
          <div v-else class="notes-list">
            <div
              v-for="note in userNotes"
              :key="note._id"
              @click="createFlashcardsAction(note._id)"
              class="note-item"
            >
              <div class="note-title">{{ note.title }}</div>
              <div class="note-preview">{{ note.content.substring(0, 100) }}...</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Video Processor Modal -->
    <div v-if="showVideoProcessor" class="modal-overlay" @click="showVideoProcessor = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-video"></i> Analyze YouTube Video</h2>
          <button @click="showVideoProcessor = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>YouTube URL</label>
            <input
              v-model="videoUrl"
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              class="setting-input"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showVideoProcessor = false" class="cancel-btn">Cancel</button>
          <button @click="processVideo" :disabled="!videoUrl.trim() || isProcessing" class="save-btn">
            {{ isProcessing ? 'Processing...' : 'Analyze Video' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Document Processor Modal -->
    <div v-if="showDocumentProcessor" class="modal-overlay" @click="showDocumentProcessor = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-upload"></i> Process Document</h2>
          <button @click="showDocumentProcessor = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="upload-area" @click="$refs.fileInput.click()">
            <div class="upload-icon">
              <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <p v-if="!selectedFile">Click to select a document</p>
            <p v-else>{{ selectedFile.name }}</p>
            <small>Supports PDF, DOC, DOCX, TXT files</small>
          </div>
          <input
            ref="fileInput"
            type="file"
            @change="handleFileSelect"
            accept=".pdf,.doc,.docx,.txt"
            style="display: none"
          />
        </div>
        <div class="modal-footer">
          <button @click="showDocumentProcessor = false" class="cancel-btn">Cancel</button>
          <button @click="processDocumentFile" :disabled="!selectedFile || isProcessing" class="save-btn">
            {{ isProcessing ? 'Processing...' : 'Process Document' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Audio Processor Modal -->
    <div v-if="showAudioProcessor" class="modal-overlay" @click="showAudioProcessor = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-microphone"></i> Process Audio File</h2>
          <button @click="showAudioProcessor = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="upload-area" @click="$refs.audioFileInput.click()">
            <div class="upload-icon">
              <i class="fas fa-microphone"></i>
            </div>
            <p v-if="!selectedAudioFile">Click to select an audio file</p>
            <p v-else>{{ selectedAudioFile.name }}</p>
            <small>Supports MP3, WAV, M4A, OGG files</small>
          </div>
          <input
            ref="audioFileInput"
            type="file"
            @change="handleAudioFileSelect"
            accept=".mp3,.wav,.m4a,.ogg,.aac"
            style="display: none"
          />
        </div>
        <div class="modal-footer">
          <button @click="showAudioProcessor = false" class="cancel-btn">Cancel</button>
          <button @click="processAudioFile" :disabled="!selectedAudioFile || isProcessing" class="save-btn">
            {{ isProcessing ? 'Processing...' : 'Process Audio' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Video Analyzer Modal -->
    <div v-if="showVideoAnalyzer" class="modal-overlay" @click="showVideoAnalyzer = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="fas fa-film"></i> Analyze Video Content</h2>
          <button @click="showVideoAnalyzer = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Video Title</label>
            <input
              v-model="videoAnalysisData.title"
              type="text"
              placeholder="Enter video title"
              class="setting-input"
            />
          </div>
          <div class="form-group">
            <label>Video Description</label>
            <textarea
              v-model="videoAnalysisData.description"
              placeholder="Enter video description"
              class="setting-input"
              rows="3"
            ></textarea>
          </div>
          <div class="form-group">
            <label>Video Transcript (Optional)</label>
            <textarea
              v-model="videoAnalysisData.transcript"
              placeholder="Paste video transcript here"
              class="setting-input"
              rows="5"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showVideoAnalyzer = false" class="cancel-btn">Cancel</button>
          <button @click="analyzeVideo" :disabled="!videoAnalysisData.title.trim() || isProcessing" class="save-btn">
            {{ isProcessing ? 'Analyzing...' : 'Analyze Video' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Processing Modal -->
    <div v-if="isProcessing" class="modal-overlay">
      <div class="modal-content processing-modal" @click.stop>
        <div class="modal-body text-center">
          <div class="processing-spinner">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <h3>{{ processingMessage }}</h3>
          <p>Please wait while AI processes your request...</p>
        </div>
      </div>
    </div>

    <!-- Edit Chat Title Modal -->
    <div v-if="showEditTitleModal" class="modal-overlay" @click="closeEditTitleModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-edit"></i> Edit Chat Title</h3>
          <button @click="closeEditTitleModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Chat Title</label>
            <input
              v-model="editTitleInput"
              type="text"
              placeholder="Enter new chat title..."
              class="form-input"
              @keyup.enter="confirmEditTitle"
              ref="titleInput"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeEditTitleModal" class="cancel-btn">Cancel</button>
          <button @click="confirmEditTitle" :disabled="!editTitleInput.trim()" class="save-btn">
            <i class="fas fa-save"></i> Save Title
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Chat Confirmation Modal -->
    <div v-if="showDeleteChatModal" class="modal-overlay" @click="closeDeleteChatModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-exclamation-triangle"></i> Delete Chat</h3>
          <button @click="closeDeleteChatModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-content">
            <div class="warning-icon">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            <p>Are you sure you want to delete "<strong>{{ selectedChatForDeletion?.title }}</strong>"?</p>
            <p class="warning-text">This action cannot be undone. All messages in this chat will be permanently removed.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDeleteChatModal" class="cancel-btn">Cancel</button>
          <button @click="confirmDeleteChat" class="delete-btn">
            <i class="fas fa-trash"></i> Delete Chat
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccount, getUserIdFromToken } from '@/api/Account';
import { getUserNotes } from '@/api/Note';
import {
  chatWithAI,
  enhanceExistingNote,
  summarizeNote,
  generateStudyQuestions,
  createFlashcards,
  analyzeVideoContent,
  processYouTubeVideo,
  processDocument,
  processAudio,
  generateNoteTitle,
  isAIServiceAvailable,
  formatAIResponse
} from '@/api/AI';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'AIAssistant',
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
      loading: true,
      error: null,

      // Chat
      chatMessages: [],
      currentMessage: '',
      isTyping: false,

      // Settings
      showSettings: false,
      settings: {
        responseStyle: 'detailed',
        learningLevel: 'intermediate',
      },

      // AI Feature Modals
      showNoteSelector: false,
      showSummarySelector: false,
      showQuestionSelector: false,
      showFlashcardSelector: false,
      showVideoProcessor: false,
      showDocumentProcessor: false,
      showAudioProcessor: false,
      showVideoAnalyzer: false,

      // Processing states
      isProcessing: false,
      processingMessage: '',

      // User data
      userNotes: [],
      userProgress: {},

      // Video processing
      videoUrl: '',

      // Document processing
      selectedFile: null,

      // Audio processing
      selectedAudioFile: null,

      // Video analysis
      videoAnalysisData: {
        title: '',
        description: '',
        transcript: ''
      },
      // Image processing
      selectedImage: null,
      imagePreviewUrl: null,
      isProcessingImage: false,

      // Blob URL management
      activeBlobUrls: new Set(), // Track active blob URLs for cleanup

      // Chat History Sidebar
      chatHistorySidebarOpen: true,
      chatSearchQuery: '',
      chatHistoryList: [],
      filteredChatHistory: [],
      currentChatId: null,
      showingChatMenu: false,
      selectedChatId: null,
      chatMenuPosition: { top: '0px', left: '0px' },

      // Modal states
      showEditTitleModal: false,
      showDeleteChatModal: false,
      editTitleInput: '',
      selectedChatForDeletion: null
    }
  },
  async mounted() {
    await this.loadAssistantData();
    await this.checkAIAvailability();

    // Initialize chat history sidebar
    this.loadChatHistoryFromStorage();
  },
  beforeUnmount() {
    // Clean up all blob URLs when component is destroyed
    this.cleanupAllBlobUrls();
  },
  methods: {
    // Blob URL management methods
    createBlobUrl(file) {
      const url = URL.createObjectURL(file);
      this.activeBlobUrls.add(url);
      return url;
    },

    revokeBlobUrl(url) {
      if (url && this.activeBlobUrls.has(url)) {
        URL.revokeObjectURL(url);
        this.activeBlobUrls.delete(url);
      }
    },

    cleanupAllBlobUrls() {
      this.activeBlobUrls.forEach(url => {
        URL.revokeObjectURL(url);
      });
      this.activeBlobUrls.clear();
    },

    // Show action link for MCP responses
    showActionLink(action, link, data = null) {
      console.log(`Action detected: ${action}, Link: ${link}`);

      // Use the data parameter to avoid ESLint error
      if (data) {
        console.log('Action data:', data);
      }

      // Show a success notification with navigation option
      const actionName = action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      this.showSuccess(`${actionName} completed successfully! Click here to view it.`);

      // Add a clickable message to the chat
      const actionMessage = {
        id: Date.now() + 1,
        type: 'action',
        text: `✅ **${actionName} Created Successfully!**\n\nClick the button below to view your new ${action.replace('create_', '')}.`,
        action: {
          type: action,
          link: link,
          text: `View ${action.replace('create_', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
        },
        timestamp: new Date()
      };

      this.chatMessages.push(actionMessage);
      this.saveChatHistory();
      this.scrollToBottom();
    },

    // Navigate to action link
    navigateToLink(link) {
      console.log('Navigating to:', link);
      this.$router.push(link);
    },

    // Fallback method for regular chat when MCP fails
    async sendRegularChatMessage(messageText) {
      try {
        const contextPrompt = this.createContextPrompt(messageText);
        const response = await chatWithAI(contextPrompt);

        if (typeof response === 'string') {
          return response;
        } else {
          return formatAIResponse(response);
        }
      } catch (error) {
        console.error('Regular chat fallback failed:', error);
        throw error;
      }
    },

    // Check if user needs to re-authenticate
    async checkAuthenticationStatus() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return false;
        }

        const response = await fetch('/api/accounts/user-id', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        return response.ok;
      } catch (error) {
        console.error('Auth status check failed:', error);
        return false;
      }
    },

    // Chat History Sidebar Methods
    toggleChatHistorySidebar() {
      this.chatHistorySidebarOpen = !this.chatHistorySidebarOpen;
    },

    createNewChat() {
      // Generate new chat ID
      const newChatId = 'chat_' + Date.now();

      // Clear current messages
      this.chatMessages = [];
      this.currentChatId = newChatId;

      // Save empty chat to history
      this.saveChatToHistory(newChatId, 'New Chat', []);

      console.log('[ChatHistory] Created new chat:', newChatId);
    },

    filterChatHistory() {
      if (!this.chatSearchQuery.trim()) {
        this.filteredChatHistory = [...this.chatHistoryList];
      } else {
        const query = this.chatSearchQuery.toLowerCase();
        this.filteredChatHistory = this.chatHistoryList.filter(chat =>
          chat.title.toLowerCase().includes(query) ||
          chat.messages.some(msg => msg.text.toLowerCase().includes(query))
        );
      }
    },

    loadChat(chatId) {
      const chat = this.chatHistoryList.find(c => c.id === chatId);
      if (chat) {
        this.currentChatId = chatId;
        this.chatMessages = [...chat.messages];
        this.scrollToBottom();
        console.log('[ChatHistory] Loaded chat:', chatId);
      }
    },

    showChatMenu(chatId, event) {
      this.selectedChatId = chatId;
      this.showingChatMenu = true;

      // Position menu near the click
      if (event) {
        this.chatMenuPosition = {
          top: event.clientY + 'px',
          left: event.clientX + 'px'
        };
      }

      // Close menu when clicking outside
      setTimeout(() => {
        document.addEventListener('click', this.closeChatMenu, { once: true });
      }, 100);
    },

    closeChatMenu() {
      this.showingChatMenu = false;
      this.selectedChatId = null;
    },

    // Modal methods
    openEditTitleModal() {
      const currentChat = this.chatHistoryList.find(chat => chat.id === this.selectedChatId);
      this.editTitleInput = currentChat?.title || '';
      this.showEditTitleModal = true;
      this.showingChatMenu = false;
      
      // Focus input after modal opens
      this.$nextTick(() => {
        if (this.$refs.titleInput) {
          this.$refs.titleInput.focus();
        }
      });
    },
    
    closeEditTitleModal() {
      this.showEditTitleModal = false;
      this.editTitleInput = '';
    },
    
    confirmEditTitle() {
      if (this.editTitleInput.trim()) {
        this.editChatTitle(this.selectedChatId, this.editTitleInput.trim());
        this.closeEditTitleModal();
      }
    },
    
    openDeleteChatModal() {
      const currentChat = this.chatHistoryList.find(chat => chat.id === this.selectedChatId);
      this.selectedChatForDeletion = currentChat;
      this.showDeleteChatModal = true;
      this.showingChatMenu = false;
    },
    
    closeDeleteChatModal() {
      this.showDeleteChatModal = false;
      this.selectedChatForDeletion = null;
    },
    
    confirmDeleteChat() {
      if (this.selectedChatForDeletion) {
        this.deleteChat(this.selectedChatForDeletion.id);
        this.closeDeleteChatModal();
      }
    },

    editChatTitle(chatId, newTitle) {
      const chat = this.chatHistoryList.find(c => c.id === chatId);
      if (chat) {
        chat.title = newTitle;
        this.saveChatHistoryToStorage();
        this.filterChatHistory(); // Refresh filtered list
      }
    },

    deleteChat(chatId) {
      this.chatHistoryList = this.chatHistoryList.filter(c => c.id !== chatId);

      // If deleting current chat, create new one
      if (this.currentChatId === chatId) {
        this.createNewChat();
      }

      this.saveChatHistoryToStorage();
      this.filterChatHistory(); // Refresh filtered list
    },

    formatChatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return 'Today';
      } else if (diffDays === 2) {
        return 'Yesterday';
      } else if (diffDays <= 7) {
        return `${diffDays - 1} days ago`;
      } else {
        return date.toLocaleDateString();
      }
    },
    async loadAssistantData() {
      try {
        this.loading = true;
        this.error = null;

        // Check token first
        const token = localStorage.getItem('token');
        console.log('[AIAssistant] Token check:', {
          hasToken: !!token,
          tokenLength: token ? token.length : 0,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'null'
        });

        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        // Load user data with better error handling
        const userId = await getUserIdFromToken();
        console.log('[AIAssistant] User ID retrieved:', userId);

        if (userId) {
          this.userId = userId;
          const userData = await getAccount(userId);
          this.userName = userData.username;
          this.userLevel = userData.currentLevel || 1;

          console.log('[AIAssistant] User data loaded:', {
            userId: this.userId,
            userName: this.userName,
            userLevel: this.userLevel
          });

          // Load user notes for context
          const notesResponse = await getUserNotes(userId);
          this.userNotes = Array.isArray(notesResponse) ? notesResponse : (notesResponse.data || []);

          // Load chat history
          this.loadChatHistory();
        } else {
          throw new Error('Failed to get user ID from token');
        }

      } catch (error) {
        console.error('[AIAssistant] Error loading data:', error);

        // If it's an authentication error, clear the token and redirect
        if (error.message.includes('token') || error.message.includes('401') || error.message.includes('403')) {
          console.log('[AIAssistant] Authentication error detected, clearing token');
          localStorage.removeItem('token');
          this.error = 'Authentication expired. Please log in again.';

          // Redirect to login after a short delay
          setTimeout(() => {
            this.$router.push('/login');
          }, 2000);
        } else {
          this.error = 'Failed to load AI Assistant';
        }
      } finally {
        this.loading = false;
      }
    },

    async sendMessage() {
      // Check if we have either a message or an image
      if ((!this.currentMessage.trim() && !this.selectedImage) || this.isTyping) return;

      // Handle image processing
      if (this.selectedImage) {
        await this.processImageMessage();
        return;
      }

      // Handle regular text message
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: this.currentMessage,
        timestamp: new Date()
      };

      this.chatMessages.push(userMessage);
      this.saveChatHistory(); // Save chat history after adding user message

      const messageText = this.currentMessage;
      this.currentMessage = '';

      this.scrollToBottom();
      this.isTyping = true;

      try {
        // Use MCP (Multi-Capable Assistant) for enhanced functionality
        console.log('Sending message to MCP:', messageText);

        // Check if we have a valid token and user ID
        const token = localStorage.getItem('token');
        console.log('[MCP] Authentication check:', {
          hasToken: !!token,
          hasUserId: !!this.userId,
          tokenPreview: token ? token.substring(0, 20) + '...' : 'null',
          userId: this.userId
        });

        if (!token) {
          throw new Error('No authentication token found. Please log in again.');
        }

        if (!this.userId) {
          throw new Error('User ID not available. Please refresh the page.');
        }

        // Enhanced debugging for 405 error
        const requestUrl = 'https://stardy-3old.onrender.com/api/mcp/process';
        const requestHeaders = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        };
        const requestBody = {
          message: messageText,
          userProfile: {
            name: this.userName,
            level: this.userLevel,
            responseStyle: this.settings.responseStyle,
            learningLevel: this.settings.learningLevel
          }
        };

        console.log('[MCP] Making request to:', requestUrl);
        console.log('[MCP] Request method:', 'POST');
        console.log('[MCP] Request headers:', requestHeaders);
        console.log('[MCP] Request body:', requestBody);
        console.log('[MCP] Current URL:', window.location.href);
        console.log('[MCP] Base URL:', window.location.origin);

        const response = await fetch(requestUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: JSON.stringify(requestBody)
        });

        console.log('[MCP] Response status:', response.status);
        console.log('[MCP] Response status text:', response.statusText);
        console.log('[MCP] Response headers:', Object.fromEntries(response.headers.entries()));
        console.log('[MCP] Response URL:', response.url);

        if (!response.ok) {
          // Enhanced error handling for 405 Method Not Allowed
          if (response.status === 405) {
            console.error('[MCP] 405 Method Not Allowed Error Details:');
            console.error('- Request URL:', requestUrl);
            console.error('- Request Method:', 'POST');
            console.error('- Response Status:', response.status);
            console.error('- Response Headers:', Object.fromEntries(response.headers.entries()));
            
            // Try to get response body for more details
            try {
              const errorBody = await response.text();
              console.error('- Response Body:', errorBody);
            } catch (bodyError) {
              console.error('- Could not read response body:', bodyError);
            }
            
            throw new Error(`Method Not Allowed (405): The server does not support POST requests for ${requestUrl}. This might be a deployment configuration issue.`);
          } else if (response.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
          } else if (response.status === 403) {
            throw new Error('Access denied. You may not have permission to use this feature.');
          } else {
            // Try to get error details from response
            let errorDetails = `HTTP error! status: ${response.status}`;
            try {
              const errorBody = await response.text();
              if (errorBody) {
                errorDetails += ` - ${errorBody}`;
              }
            } catch (bodyError) {
              console.error('Could not read error response body:', bodyError);
            }
            throw new Error(errorDetails);
          }
        }

        const data = await response.json();
        console.log('MCP response received:', data);

        if (data.success) {
          const responseText = data.message || 'Action completed successfully!';

          const aiResponse = {
            id: Date.now() + 1,
            type: 'ai',
            text: responseText,
            timestamp: new Date(),
            action: data.action,
            confidence: data.confidence,
            link: data.link,
            data: data.data
          };

          this.chatMessages.push(aiResponse);

          // Auto-generate chat title if this is a new chat
          if (this.chatMessages.length <= 2) { // First user message + first AI response
            this.updateChatTitle();
          }

          this.saveChatHistory(); // Save chat history after adding AI response

          // If there's a link, show it as a clickable action
          if (data.link) {
            this.showActionLink(data.action, data.link, data.data);
          }

        } else {
          throw new Error(data.error || 'Failed to process message');
        }

      } catch (error) {
        console.error('AI chat error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });

        // If it's an authentication error, try to fallback to regular chat
        if (error.message.includes('Authentication failed') || error.message.includes('401') || error.message.includes('invalid')) {
          console.log('Authentication failed for MCP, falling back to regular chat...');

          // Show user-friendly message about authentication
          const authWarningResponse = {
            id: Date.now(),
            type: 'ai',
            text: '⚠️ **Authentication Issue Detected**\n\nI\'m having trouble with advanced features due to an authentication issue. Let me try to help you with basic chat functionality instead.\n\n*If this persists, please try logging out and logging back in.*',
            timestamp: new Date()
          };
          this.chatMessages.push(authWarningResponse);

          try {
            // Fallback to regular chat API
            const fallbackResponse = await this.sendRegularChatMessage(messageText);
            const aiResponse = {
              id: Date.now() + 1,
              type: 'ai',
              text: fallbackResponse,
              timestamp: new Date()
            };
            this.chatMessages.push(aiResponse);
            this.saveChatHistory();
            return; // Exit successfully
          } catch (fallbackError) {
            console.error('Fallback chat also failed:', fallbackError);
          }
        }

        const errorResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: `I apologize, but I'm having trouble connecting right now. Error: ${error.message}. Please try again later.`,
          timestamp: new Date()
        };
        this.chatMessages.push(errorResponse);
        this.saveChatHistory(); // Save chat history after adding error response
        this.showError('Error', `Failed to get AI response: ${error.message}`);
      } finally {
        this.isTyping = false;
        this.scrollToBottom();
      }
    },

    async processImageMessage() {
      const messageText = this.currentMessage.trim();

      // Create a managed blob URL for the message
      const messageImageUrl = this.createBlobUrl(this.selectedImage);

      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: messageText || 'Uploaded an image for analysis',
        image: {
          name: this.selectedImage.name,
          size: this.formatFileSize(this.selectedImage.size),
          type: this.selectedImage.type
        },
        imageUrl: messageImageUrl, // Use the managed blob URL for the message
        timestamp: new Date()
      };

      this.chatMessages.push(userMessage);
      this.saveChatHistory(); // Save chat history after adding user image message

      const imageFile = this.selectedImage;

      // Clear inputs (but keep the image URL for the message)
      this.currentMessage = '';
      this.selectedImage = null;
      this.imagePreviewUrl = null;
      this.$refs.imageInput.value = '';

      this.scrollToBottom();
      this.isTyping = true;
      this.isProcessingImage = true;

      try {
        console.log('Processing image:', imageFile.name);

        // Import processImage function
        const { processImage } = await import('@/api/AI.js');

        // Process the image with OCR and AI
        const response = await processImage(imageFile);
        console.log('Image processing response:', response);

        let responseText = '';

        if (response && response.data && response.data.ocrResult) {
          const ocrResult = response.data.ocrResult;
          const imageInfo = response.data.imageInfo;

          responseText = `📸 **Image Analysis Complete!**\n\n`;

          // Include user's message if provided
          if (messageText) {
            responseText += `**Your Question:** ${messageText}\n\n`;
          }

          responseText += `**File:** ${imageInfo.fileName} (${this.formatFileSize(imageInfo.fileSize)})\n\n`;

          if (ocrResult.textFound) {
            responseText += `**Text Extracted:** ${ocrResult.textLength} characters, ${ocrResult.wordCount} words\n`;
            responseText += `**Confidence:** ${Math.round(ocrResult.confidence * 100)}%\n\n`;
            responseText += `**Extracted Text:**\n${ocrResult.extractedText}`;
          } else {
            responseText += `**Note:** No readable text was found in the image.`;
          }
        } else {
          responseText = formatAIResponse(response);
        }

        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: responseText,
          timestamp: new Date()
        };

        this.chatMessages.push(aiResponse);
        this.saveChatHistory(); // Save chat history after adding AI image response
        this.showSuccess('Success', 'Image processed successfully!');

      } catch (error) {
        console.error('Image processing error:', error);

        const errorResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: `I apologize, but I encountered an error processing your image: ${error.message}. Please try again with a different image or check that the image contains readable text.`,
          timestamp: new Date()
        };

        this.chatMessages.push(errorResponse);
        this.saveChatHistory(); // Save chat history after adding image error response
        this.showError('Error', `Failed to process image: ${error.message}`);
      } finally {
        this.isTyping = false;
        this.isProcessingImage = false;
        this.scrollToBottom();
      }
    },

    // AI Feature Methods
    async enhanceNote(noteId) {
      try {
        this.showNoteSelector = false;
        this.isProcessing = true;
        this.processingMessage = 'Enhancing your note with AI...';

        const response = await enhanceExistingNote(noteId);

        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: `✨ **Note Enhanced Successfully!**\n\n${formatAIResponse(response)}`,
          timestamp: new Date()
        };

        this.chatMessages.push(aiMessage);
        this.showSuccess('Success', 'Note enhanced successfully!');

      } catch (error) {
        console.error('Error enhancing note:', error);
        this.showError('Error', 'Failed to enhance note. Please try again.');
      } finally {
        this.isProcessing = false;
        this.scrollToBottom();
      }
    },

    async summarizeNoteAction(noteId) {
      try {
        this.showSummarySelector = false;
        this.isProcessing = true;
        this.processingMessage = 'Creating summary of your note...';

        const response = await summarizeNote(noteId);

        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: `📝 **Note Summary**\n\n${formatAIResponse(response)}`,
          timestamp: new Date()
        };

        this.chatMessages.push(aiMessage);
        this.showSuccess('Success', 'Note summarized successfully!');

      } catch (error) {
        console.error('Error summarizing note:', error);
        this.showError('Error', 'Failed to summarize note. Please try again.');
      } finally {
        this.isProcessing = false;
        this.scrollToBottom();
      }
    },

    async generateQuestionsAction(noteId) {
      try {
        this.showQuestionSelector = false;
        this.isProcessing = true;
        this.processingMessage = 'Generating study questions...';

        const response = await generateStudyQuestions(noteId);

        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: `❓ **Study Questions Generated**\n\n${formatAIResponse(response)}`,
          timestamp: new Date()
        };

        this.chatMessages.push(aiMessage);
        this.showSuccess('Success', 'Study questions generated successfully!');

      } catch (error) {
        console.error('Error generating questions:', error);
        this.showError('Error', 'Failed to generate questions. Please try again.');
      } finally {
        this.isProcessing = false;
        this.scrollToBottom();
      }
    },

    async createFlashcardsAction(noteId) {
      try {
        this.showFlashcardSelector = false;
        this.isProcessing = true;
        this.processingMessage = 'Creating flashcards...';

        const response = await createFlashcards(noteId);

        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: `🃏 **Flashcards Created**\n\n${formatAIResponse(response)}`,
          timestamp: new Date()
        };

        this.chatMessages.push(aiMessage);
        this.showSuccess('Success', 'Flashcards created successfully!');

      } catch (error) {
        console.error('Error creating flashcards:', error);
        this.showError('Error', 'Failed to create flashcards. Please try again.');
      } finally {
        this.isProcessing = false;
        this.scrollToBottom();
      }
    },

    async processVideo() {
      try {
        this.showVideoProcessor = false;
        this.isProcessing = true;
        this.processingMessage = 'Analyzing YouTube video...';

        const response = await processYouTubeVideo(this.videoUrl);

        // Generate a smart title for the video analysis
        const responseText = formatAIResponse(response);
        const smartTitle = await this.generateSmartTitle(responseText);

        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: `🎥 **${smartTitle}**\n\n${responseText}`,
          timestamp: new Date()
        };

        this.chatMessages.push(aiMessage);
        this.showSuccess('Success', 'Video analyzed successfully!');
        this.videoUrl = '';

      } catch (error) {
        console.error('Error processing video:', error);
        this.showError('Error', 'Failed to analyze video. Please check the URL and try again.');
      } finally {
        this.isProcessing = false;
        this.scrollToBottom();
      }
    },

    handleFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFile = file;
      }
    },

    handleAudioFileSelect(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedAudioFile = file;
      }
    },

    async processDocumentFile() {
      try {
        this.showDocumentProcessor = false;
        this.isProcessing = true;
        this.processingMessage = 'Processing document...';

        const response = await processDocument(this.selectedFile);
        const responseText = formatAIResponse(response);

        // Generate a smart title for the document
        const smartTitle = await this.generateSmartTitle(responseText);

        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: `📄 **${smartTitle}**\n\n${responseText}`,
          timestamp: new Date()
        };

        this.chatMessages.push(aiMessage);
        this.showSuccess('Success', 'Document processed successfully!');
        this.selectedFile = null;

      } catch (error) {
        console.error('Error processing document:', error);
        this.showError('Error', 'Failed to process document. Please try again.');
      } finally {
        this.isProcessing = false;
        this.scrollToBottom();
      }
    },

    async processAudioFile() {
      try {
        this.showAudioProcessor = false;
        this.isProcessing = true;
        this.processingMessage = 'Processing audio file...';

        const response = await processAudio(this.selectedAudioFile);
        const responseText = formatAIResponse(response);

        // Generate a smart title for the audio content
        const smartTitle = await this.generateSmartTitle(responseText);

        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: `🎵 **${smartTitle}**\n\n${responseText}`,
          timestamp: new Date()
        };

        this.chatMessages.push(aiMessage);
        this.showSuccess('Success', 'Audio processed successfully!');
        this.selectedAudioFile = null;

      } catch (error) {
        console.error('Error processing audio:', error);
        this.showError('Error', 'Failed to process audio. Please try again.');
      } finally {
        this.isProcessing = false;
        this.scrollToBottom();
      }
    },

    async analyzeVideo() {
      try {
        this.showVideoAnalyzer = false;
        this.isProcessing = true;
        this.processingMessage = 'Analyzing video content...';

        const response = await analyzeVideoContent(this.videoAnalysisData);

        const aiMessage = {
          id: Date.now(),
          type: 'ai',
          text: `🎬 **Video Content Analyzed**\n\n${formatAIResponse(response)}`,
          timestamp: new Date()
        };

        this.chatMessages.push(aiMessage);
        this.showSuccess('Success', 'Video content analyzed successfully!');
        this.videoAnalysisData = { title: '', description: '', transcript: '' };

      } catch (error) {
        console.error('Error analyzing video:', error);
        this.showError('Error', 'Failed to analyze video content. Please try again.');
      } finally {
        this.isProcessing = false;
        this.scrollToBottom();
      }
    },

    async generateSmartTitle(content) {
      try {
        const title = await generateNoteTitle(content);
        return title;
      } catch (error) {
        console.error('Error generating title:', error);
        return 'AI Generated Content';
      }
    },

    sendQuickMessage(message) {
      this.currentMessage = message;
      this.sendMessage();
    },

    async testAIConnection() {
      try {
        this.isTyping = true;
        console.log('Testing AI connection...');

        const testMessage = 'Hello, this is a test message. Please respond with "AI connection test successful!"';
        const response = await chatWithAI(testMessage);

        console.log('Test response:', response);

        const testResult = {
          id: Date.now(),
          type: 'ai',
          text: `🔧 **AI Connection Test Result:**\n\n${formatAIResponse(response) || 'Test failed - no response'}`,
          timestamp: new Date()
        };

        this.chatMessages.push(testResult);
        this.showSuccess('Test Complete', 'AI connection test completed. Check the chat for results.');

      } catch (error) {
        console.error('AI connection test failed:', error);

        const errorResult = {
          id: Date.now(),
          type: 'ai',
          text: `🔧 **AI Connection Test Failed:**\n\nError: ${error.message}\n\nPlease check:\n- Server is running\n- AI service is configured\n- Network connection is stable`,
          timestamp: new Date()
        };

        this.chatMessages.push(errorResult);
        this.showError('Test Failed', `AI connection test failed: ${error.message}`);
      } finally {
        this.isTyping = false;
        this.scrollToBottom();
      }
    },

    createContextPrompt(userMessage) {
      let context = `User Profile:
- Name: ${this.userName}
- Level: ${this.userLevel}
- Learning Style: ${this.settings.responseStyle}
- Learning Level: ${this.settings.learningLevel}`;

      if (this.userNotes.length > 0) {
        context += `\n\nUser's Recent Notes (for context):`;
        this.userNotes.slice(0, 3).forEach(note => {
          context += `\n- ${note.title}: ${note.content.substring(0, 200)}...`;
        });
      }

      return `${context}

User Question: ${userMessage}

Please provide a helpful, educational response based on the user's profile and context. Be encouraging and supportive in your teaching approach.`;
    },

    clearChat() {
      this.clearChatHistory(); // This will clear both memory and localStorage
    },

    saveSettings() {
      localStorage.setItem('aiAssistantSettings', JSON.stringify(this.settings));
      this.showSettings = false;
      this.showSuccess('Settings saved successfully!');
    },

    loadSettings() {
      const saved = localStorage.getItem('aiAssistantSettings');
      if (saved) {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      }
    },

    // Chat history persistence methods
    async saveChatHistory() {
      try {
        // Legacy storage for backward compatibility
        const chatData = {
          messages: this.chatMessages,
          timestamp: new Date().toISOString(),
          userId: this.userId
        };
        localStorage.setItem('aiChatHistory', JSON.stringify(chatData));

        // New enhanced chat history system
        if (this.currentChatId && this.chatMessages.length > 0) {
          // Generate title from first user message or use existing title
          let title = 'New Chat';
          const existingChat = this.chatHistoryList.find(c => c.id === this.currentChatId);

          if (existingChat && existingChat.title !== 'New Chat') {
            title = existingChat.title;
          } else {
            title = await this.generateChatTitle(this.chatMessages);
          }

          this.saveChatToHistory(this.currentChatId, title, this.chatMessages);
        }
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    },

    loadChatHistory() {
      try {
        // Load new chat history system first
        this.loadChatHistoryFromStorage();

        // Legacy support - load old chat history if new system is empty
        if (this.chatHistoryList.length === 0) {
          const saved = localStorage.getItem('aiChatHistory');
          if (saved) {
            const chatData = JSON.parse(saved);

            // Only load if it's for the same user
            if (chatData.userId === this.userId && chatData.messages) {
              // Process messages to handle invalid blob URLs
              const processedMessages = chatData.messages.map(message => {
                if (message.imageUrl && message.imageUrl.startsWith('blob:')) {
                  // Remove invalid blob URLs from loaded messages
                  console.warn('Removing invalid blob URL from loaded message:', message.imageUrl);
                  return {
                    ...message,
                    imageUrl: null, // Remove the invalid blob URL
                    image: {
                      ...message.image,
                      unavailable: true // Mark as unavailable
                    }
                  };
                }
                return message;
              });

              // Migrate to new system
              const legacyChatId = 'legacy_' + Date.now();
              this.currentChatId = legacyChatId;
              this.chatMessages = processedMessages;

              // Save to new system
              this.saveChatToHistory(legacyChatId, 'Imported Chat', processedMessages);

              console.log(`Migrated ${processedMessages.length} chat messages from legacy storage`);

              // Scroll to bottom after loading
              this.$nextTick(() => {
                this.scrollToBottom();
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
        // If there's an error, start with empty chat
        this.chatMessages = [];
        this.createNewChat();
      }
    },

    clearChatHistory() {
      localStorage.removeItem('aiChatHistory');
      this.chatMessages = [];
      this.chatHistoryList = [];
      localStorage.removeItem('ai_chat_history_list');
      this.createNewChat();
      this.showSuccess('Chat history cleared successfully!');
    },

    // Enhanced chat history methods for sidebar
    saveChatToHistory(chatId, title, messages) {
      const existingChatIndex = this.chatHistoryList.findIndex(c => c.id === chatId);
      const chatData = {
        id: chatId,
        title: title,
        messages: [...messages],
        createdAt: existingChatIndex === -1 ? new Date().toISOString() : this.chatHistoryList[existingChatIndex].createdAt,
        updatedAt: new Date().toISOString()
      };

      if (existingChatIndex !== -1) {
        this.chatHistoryList[existingChatIndex] = chatData;
      } else {
        this.chatHistoryList.unshift(chatData); // Add to beginning
      }

      // Keep only last 50 chats
      if (this.chatHistoryList.length > 50) {
        this.chatHistoryList = this.chatHistoryList.slice(0, 50);
      }

      this.saveChatHistoryToStorage();
      this.filterChatHistory();
    },

    saveChatHistoryToStorage() {
      try {
        localStorage.setItem('ai_chat_history_list', JSON.stringify(this.chatHistoryList));
      } catch (error) {
        console.error('Error saving chat history list:', error);
      }
    },

    loadChatHistoryFromStorage() {
      try {
        const savedData = localStorage.getItem('ai_chat_history_list');
        if (savedData) {
          this.chatHistoryList = JSON.parse(savedData);
          this.filterChatHistory();

          // If no current chat, create new one
          if (!this.currentChatId && this.chatHistoryList.length > 0) {
            this.loadChat(this.chatHistoryList[0].id);
          } else if (!this.currentChatId) {
            this.createNewChat();
          }
        } else {
          this.createNewChat();
        }
      } catch (error) {
        console.error('Error loading chat history list:', error);
        this.chatHistoryList = [];
        this.createNewChat();
      }
    },

    // Generate smart title using AI
    async generateChatTitle(messages) {
      try {
        // Find the first meaningful user message
        const firstUserMessage = messages.find(msg => msg.type === 'user' && msg.text.trim().length > 5);
        if (!firstUserMessage) {
          return 'New Chat';
        }

        // Use first 50 characters as title
        let title = firstUserMessage.text.substring(0, 50);
        if (firstUserMessage.text.length > 50) {
          title += '...';
        }

        // Clean up the title
        title = title.replace(/[^\w\s-]/g, '').trim();

        return title || 'New Chat';
      } catch (error) {
        console.error('Error generating chat title:', error);
        return 'New Chat';
      }
    },

    // Update current chat title
    async updateChatTitle() {
      try {
        if (this.currentChatId && this.chatMessages.length > 0) {
          const title = await this.generateChatTitle(this.chatMessages);
          const existingChat = this.chatHistoryList.find(c => c.id === this.currentChatId);
          if (existingChat && existingChat.title === 'New Chat') {
            existingChat.title = title;
            this.saveChatHistoryToStorage();
            this.filterChatHistory();
            console.log('[ChatHistory] Updated chat title to:', title);
          }
        }
      } catch (error) {
        console.error('Error updating chat title:', error);
      }
    },

    formatMessage(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.chatMessages;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },

    async checkAIAvailability() {
      try {
        console.log('Checking AI service availability...');
        const isAvailable = await isAIServiceAvailable();
        console.log('AI service available:', isAvailable);

        if (!isAvailable) {
          this.showWarning('AI Service', 'AI service may be temporarily unavailable. Some features might not work properly.');
        } else {
          console.log('AI service is available and ready');
        }
      } catch (error) {
        console.error('Error checking AI availability:', error);
        this.showWarning('AI Service', 'Unable to verify AI service status. Please check your connection.');
      }
    },

    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
    },

    // Particle animation methods
    getParticleSize(index) {
      const sizes = ['small', 'medium', 'large'];
      return sizes[index % 3];
    },

    getParticleColor(index) {
      const colors = ['blue', 'purple', 'pink', 'cyan'];
      return colors[index % 4];
    },

    // Image processing methods
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },

    handleImageSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        this.showError('File Too Large', 'Image file size must be less than 50MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.showError('Invalid File Type', 'Please select an image file (JPEG, PNG, GIF, BMP, WebP, TIFF) or PDF');
        return;
      }

      this.selectedImage = file;

      // Clean up previous preview URL if it exists
      if (this.imagePreviewUrl) {
        this.revokeBlobUrl(this.imagePreviewUrl);
      }

      // Create preview URL for images (not for PDFs)
      if (file.type.startsWith('image/')) {
        this.imagePreviewUrl = this.createBlobUrl(file);
      } else {
        this.imagePreviewUrl = null; // For PDFs, we won't show preview
      }

      console.log('Image selected:', file.name, file.size, file.type);
    },

    removeSelectedImage() {
      // Use managed blob URL cleanup
      if (this.imagePreviewUrl) {
        this.revokeBlobUrl(this.imagePreviewUrl);
      }
      this.selectedImage = null;
      this.imagePreviewUrl = null;
      this.$refs.imageInput.value = '';
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  },

  created() {
    this.loadSettings();
  }
}
</script>

<style scoped>
/* Base Styles */
.ai-assistant-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
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
  min-height: 100vh;
  text-align: center;
  z-index: 10;
  position: relative;
}

.loading-spinner {
  font-size: 3rem;
  color: #64b5f6;
  margin-bottom: 1rem;
}

.error-icon {
  font-size: 3rem;
  color: #f44336;
  margin-bottom: 1rem;
}

.retry-btn {
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(100, 181, 246, 0.3);
}

/* Main Layout */
.main-content {
  flex: 1;
  margin-left: 280px;
  padding: 2rem;
  overflow-y: auto;
  z-index: 5;
  position: relative;
  transition: margin-left 0.5s ease-out;
}

.ai-assistant-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  flex-direction: column;
  padding: 2rem;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2.5rem;
  font-weight: 700;
  background: white;
  background-clip: text;
  -webkit-background-clip: text;
  display: flex;
  align-items: center;
  gap: 15px;
}

.header-content p {
  margin: 0;
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.8);
}

.header-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.clear-chat-btn, .settings-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.clear-chat-btn:hover, .settings-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* AI Features Section */
.ai-features-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 2rem;
}

.ai-features-section h2 {
  color: #64b5f6;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.feature-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(100, 181, 246, 0.2);
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.feature-content h3 {
  margin: 0 0 0.5rem 0;
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.feature-content p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* Chat Section */
.chat-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-section h2 {
  color: #64b5f6;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-container {
  height: 600px;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  margin-bottom: 1rem;
}

.message {
  display: flex;
  margin-bottom: 1.5rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
}

.message-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.user-message .message-content {
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.2), rgba(69, 160, 73, 0.2));
}

.ai-message .message-content {
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.2), rgba(66, 165, 245, 0.2));
}

/* Image Display Styles */
.message-image {
  margin-bottom: 0.75rem;
}

.image-container {
  margin-bottom: 0.5rem;
}

.uploaded-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  display: block;
}

.image-unavailable {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.image-unavailable i {
  font-size: 1.2rem;
  opacity: 0.7;
}

/* MCP Action Links */
.action-link {
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.action-button:active {
  transform: translateY(0);
}

.action-button i {
  font-size: 0.8rem;
}

.message-image .image-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  background: rgba(0, 0, 0, 0.2);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.message-image .image-name {
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.message-image .image-size {
  color: rgba(255, 255, 255, 0.6);
}

.message-text {
  color: white;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.message-text ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-text li {
  margin-bottom: 0.3rem;
}

.message-time {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: right;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #64b5f6;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

/* Image Preview */
.image-preview-container {
  margin-bottom: 1rem;
}

.image-preview {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.image-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.image-name {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.image-size {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
}

.remove-image-btn {
  background: rgba(255, 100, 100, 0.2);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b6b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-image-btn:hover {
  background: rgba(255, 100, 100, 0.3);
  border-color: rgba(255, 100, 100, 0.5);
  transform: scale(1.1);
}

.input-wrapper {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.attachment-btn {
  background: rgba(100, 181, 246, 0.2);
  border: 1px solid rgba(100, 181, 246, 0.3);
  border-radius: 50%;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64b5f6;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.1rem;
}

.attachment-btn:hover:not(:disabled) {
  background: rgba(100, 181, 246, 0.3);
  border-color: rgba(100, 181, 246, 0.5);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(100, 181, 246, 0.3);
}

.attachment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.chat-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.chat-input:focus {
  outline: none;
  border-color: #64b5f6;
  box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
}

.send-btn {
  background: linear-gradient(135deg, #64b5f6, #42a5f5);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(100, 181, 246, 0.3);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e, #16213e);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modal-header h2 {
  margin: 0;
  color: #64b5f6;
  display: flex;
  align-items: center;
  gap: 10px;
}

.modal-header h3 {
  color: #64b5f6;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: rotate(90deg);
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1rem 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Settings Modal */
.setting-group {
  margin-bottom: 1.5rem;
}

.setting-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #64b5f6;
  font-weight: 600;
}

.setting-select, .setting-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.setting-select:focus, .setting-input:focus {
  outline: none;
  border-color: #64b5f6;
  box-shadow: 0 0 20px rgba(100, 181, 246, 0.3);
}

.setting-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.cancel-btn, .save-btn {
  padding: 12px 24px;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.save-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.cancel-btn:hover, .save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.clear-history-btn {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-history-btn:hover {
  background: linear-gradient(135deg, #d32f2f, #b71c1c);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
}

/* Notes List Styles */
.notes-list {
  max-height: 400px;
  overflow-y: auto;
}

.note-item {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.note-item:hover {
  background: rgba(100, 181, 246, 0.2);
  border-color: #64b5f6;
}

.note-title {
  color: white;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.note-preview {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.no-notes {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  padding: 2rem;
}

/* Upload Area Styles */
.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: #64b5f6;
  background: rgba(100, 181, 246, 0.1);
}

.upload-icon {
  font-size: 3rem;
  color: #64b5f6;
  margin-bottom: 1rem;
}

.upload-area p {
  color: white;
  margin: 0.5rem 0;
  font-weight: 600;
}

.upload-area small {
  color: rgba(255, 255, 255, 0.6);
}

/* Processing Modal */
.processing-modal {
  text-align: center;
}

.processing-spinner {
  font-size: 3rem;
  color: #64b5f6;
  margin-bottom: 1rem;
}

.processing-modal h3 {
  color: #64b5f6;
  margin: 0 0 1rem 0;
}

.processing-modal p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* Responsive to sidebar state */
@media (min-width: 769px) {
  .main-content {
    margin-left: var(--sidebar-width, 280px);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
    padding: 1rem;
  }

  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .feature-card {
    flex-direction: column;
    text-align: center;
    padding: 1rem;
  }

  .feature-icon {
    margin-bottom: 0.5rem;
  }

  .chat-container {
    height: 500px;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .notes-list {
    max-height: 300px;
  }

  .upload-area {
    padding: 2rem 1rem;
  }
}

@media (max-width: 480px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .feature-card {
    padding: 1rem;
  }

  .ai-features-section,
  .chat-section {
    padding: 1rem;
  }

  .header-content h1 {
    font-size: 2rem;
  }
}

/* Chat History Sidebar Styles */
.chat-history-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
  transition: transform 0.3s ease;
  overflow: hidden;
}

.chat-history-sidebar.sidebar-collapsed {
  transform: translateX(100%);
}

.chat-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
}

.chat-sidebar-content {
  padding: 20px;
  height: calc(100vh - 80px);
  overflow-y: auto;
}

.new-chat-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.new-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.chat-search {
  position: relative;
  margin-bottom: 20px;
}

.chat-search i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: rgba(255, 255, 255, 0.15);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.section-title {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 10px;
}

.chat-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
}

.chat-item:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.chat-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%);
  border-color: #667eea;
}

.chat-item-content {
  flex: 1;
  min-width: 0;
}

.chat-title {
  color: white;
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.chat-date {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
}

.chat-actions {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.chat-menu-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.chat-menu-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.chat-menu-dropdown {
  position: fixed;
  background: rgba(15, 15, 35, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px;
  z-index: 1001;
  min-width: 150px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.menu-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-item.delete {
  color: #ff6b6b;
}

.menu-item.delete:hover {
  background: rgba(255, 107, 107, 0.1);
}

/* Adjust main content for chat history sidebar */
.main-content {
  margin-right: 300px;
  transition: margin-right 0.3s ease;
}

/* When chat history sidebar is collapsed */
.chat-history-sidebar.sidebar-collapsed ~ .main-content {
  margin-right: 0;
}

/* Reopen Chat History Button */
.reopen-chat-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  z-index: 100;
}

.reopen-chat-btn:hover {
  transform: scale(1.1);
}

/* Form Styles */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #64b5f6;
  font-weight: 600;
}

.form-input {
  width: 100%;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #64b5f6;
  box-shadow: 0 0 0 2px rgba(100, 181, 246, 0.2);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Warning Content */
.warning-content {
  text-align: center;
}

.warning-icon {
  font-size: 3rem;
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.warning-content p {
  color: white;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.warning-text {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 0.9rem;
}

/* Enhanced Button Styles */
.save-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-btn {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  border: none;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.3);
}
</style>
