<template>
  <div class="note-detail-container space-background">
    <!-- Space Particles -->
    <div class="space-particles"></div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container h-screen w-screen">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading note...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="goBack" class="retry-btn">Go Back</button>
    </div>

    <!-- Main Note Content -->
    <template v-else>
      <!-- Sidebar -->
      <Sidebar
        :userName="userName"
        :userLevel="userLevel"
        currentPage="dashboard"
        @logout="logout"
      />

      <!-- Main Layout Container -->
      <div class="main-content" :class="{ 'chatbot-open': showChatbot }">
        <!-- Left Side - Note Content -->
        <div class="note-content-side">
          <!-- Header with Title -->
          <header class="note-header">
            <div class="header-top">
              <h1 class="note-title">{{ note.title || 'Untitled Note' }}</h1>
              <div class="header-actions">
                <button @click="toggleEdit" class="action-btn" :class="{ active: isEditing }">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="saveNote" v-if="isEditing" class="action-btn save" :disabled="saving">
                  <i class="fas fa-save"></i>
                </button>
                <button @click="toggleChatbot" class="action-btn chatbot-toggle" :class="{ active: showChatbot }">
                  <i class="fas fa-robot"></i>
                </button>
                <button @click="showNoteSettings = true" class="action-btn menu">
                  <i class="fas fa-ellipsis-v"></i>
                </button>
              </div>
            </div>

            <!-- AI Action Buttons -->
            <div class="ai-action-buttons" v-if="!isEditing">
              <button
                @click="generateQuiz"
                class="ai-action-btn quiz"
                :disabled="!canGenerateQuiz"
                :title="getButtonTooltip('quiz')"
              >
                <i v-if="!quizGenerating" class="fas fa-question-circle"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                <span>{{ quizGenerating ? 'Generating Quiz...' : 'Quiz' }}</span>
              </button>
              <button
                @click="generateFlashcards"
                class="ai-action-btn flashcards"
                :disabled="!canGenerateFlashcards"
                :title="getButtonTooltip('flashcards')"
              >
                <i v-if="!flashcardGenerating" class="fas fa-layer-group"></i>
                <i v-else class="fas fa-spinner fa-spin"></i>
                <span>{{ flashcardGenerating ? 'Generating Flashcards...' : 'Flashcards' }}</span>
              </button>
            </div>
          </header>

          <!-- Note Content -->
          <div class="note-content-area">
            <div class="content-container">
              <textarea
                v-if="isEditing"
                v-model="editForm.content"
                class="content-editor"
                placeholder="Write your note content here..."
              ></textarea>
              <div v-else class="content-display" v-html="formatEnhancedContent(note.content || '')"></div>
            </div>
          </div>
        </div>

        <!-- Right Side - AI Chatbot -->
        <div class="chatbot-side" :class="{ 'chatbot-hidden': !showChatbot }">
          <div class="chatbot-container">
            <!-- Chatbot Header -->
            <div class="chatbot-header">
              <div class="chatbot-title">
                <i class="fas fa-robot"></i>
                <span>AI Assistant</span>
              </div>
              <button @click="toggleChatbot" class="close-chat-btn">
                <i class="fas fa-chevron-right"></i>
                <span>Close</span>
              </button>
            </div>

            <!-- Chatbot Messages -->
            <div class="chatbot-messages" ref="chatMessages">
              <div class="welcome-message">
                <div class="ai-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                  <p>Ask me any question about your notes or content!</p>
                </div>
              </div>

              <!-- Chat Messages -->
              <div v-for="(message, index) in chatMessages" :key="index"
                   :class="['chat-message', message.type]">
                <div v-if="message.type === 'ai'" class="ai-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                  <p v-html="formatContent(message.content || '')"></p>
                  <span class="message-time">{{ formatTime(message.timestamp) }}</span>
                </div>
              </div>

              <!-- Loading Indicator -->
              <div v-if="chatLoading" class="chat-loading">
                <div class="ai-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                  <p><i class="fas fa-spinner fa-spin"></i> AI is thinking...</p>
                </div>
              </div>
            </div>

            <!-- Chatbot Input -->
            <div class="chatbot-input">
              <!-- Image Preview (if image is selected) -->
              <div v-if="selectedChatImage" class="chat-image-preview-container">
                <div class="chat-image-preview">
                  <img :src="chatImagePreviewUrl" alt="Selected image" class="chat-preview-image">
                  <div class="chat-image-info">
                    <span class="chat-image-name">{{ selectedChatImage.name }}</span>
                    <span class="chat-image-size">{{ formatFileSize(selectedChatImage.size) }}</span>
                  </div>
                  <button @click="removeSelectedChatImage" class="remove-chat-image-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div class="input-container">
                <div class="input-actions">
                  <!-- Attachment Button -->
                  <button
                    @click="triggerChatImageUpload"
                    class="chat-attachment-btn"
                    title="Attach image for AI analysis"
                    :disabled="chatLoading"
                  >
                    <i class="fas fa-paperclip"></i>
                  </button>

                  <!-- Hidden File Input -->
                  <input
                    ref="chatImageInput"
                    type="file"
                    accept="image/*,.pdf"
                    @change="handleChatImageSelect"
                    style="display: none"
                  >

                  <input
                    v-model="chatInput"
                    @keyup.enter="sendMessage"
                    placeholder="Type a question here... or attach an image for analysis"
                    class="chat-input"
                    :disabled="chatLoading"
                  />
                  <button @click="sendMessage"
                          class="send-btn"
                          :disabled="(!chatInput.trim() && !selectedChatImage) || chatLoading">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chatbot Toggle Button (when hidden) -->
        <div v-if="!showChatbot" class="chatbot-toggle-btn" @click="toggleChatbot">
          <i class="fas fa-chevron-left"></i>
          <span>AI Chat</span>
        </div>
      </div>
    </template>
    
    <!-- Note Settings Modal -->
    <div v-if="showNoteSettings" class="modal-overlay" @click="showNoteSettings = false">
      <div class="note-settings-modal" @click.stop>
        <div class="settings-header">
          <h2>Note settings</h2>
          <button @click="showNoteSettings = false" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="settings-content">
          <!-- Note Title Section -->
          <div class="settings-section">
            <label class="settings-label">Note Title</label>
            <input
              v-model="editableTitle"
              type="text"
              class="title-input"
              placeholder="Enter note title"
              @keyup.enter="updateNoteTitle"
            />
          </div>

          <!-- Export Note Section -->
          <div class="settings-section">
            <label class="settings-label">Export note</label>
            <div class="export-buttons">
              <button @click="exportNote('pdf')" class="export-btn pdf-btn">
                <i class="fas fa-file-pdf"></i>
                Export note as PDF
              </button>
              <button @click="exportNote('doc')" class="export-btn doc-btn">
                <i class="fas fa-file-word"></i>
                Export note as DOC
              </button>
            </div>
          </div>

          <!-- Delete Note Section -->
          <div class="settings-section">
            <button @click="confirmDelete" class="delete-btn">
              <i class="fas fa-trash"></i>
              Delete note
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- AI Result Modal -->
    <div v-if="showAIModal" class="modal-overlay" @click="closeAIModal">
      <div class="modal-content ai-modal" @click.stop>
        <div class="modal-header">
          <h2>
            <i :class="aiModalIcon"></i>
            {{ aiModalTitle }}
          </h2>
          <button @click="closeAIModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="ai-result" v-html="formatContent(aiResult || '')"></div>
        </div>
        <div class="modal-footer">
          <button @click="closeAIModal" class="cancel-btn">Close</button>
          <button @click="applyAIResult" class="apply-btn" v-if="aiModalType === 'enhance'">
            <i class="fas fa-check"></i> Apply Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAccount, getUserIdFromToken } from '@/api/Account';
import { getNoteById, updateNote, deleteNote as deleteNoteAPI } from '@/api/Note';
import {
  enhanceExistingNote,
  generateStudyQuestions,
  summarizeNote as summarizeNoteAPI,
  chatWithAI
} from '@/api/AI';
import { generateQuizFromNote } from '@/api/Quiz';
import { generateFlashcardsFromNote } from '@/api/Flashcard';
import Sidebar from '@/components/Sidebar.vue';
import { useNotification } from '@/composables/useNotification';
import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export default {
  name: 'NoteDetail',
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
      saving: false,
      aiLoading: false,
      quizGenerating: false,
      flashcardGenerating: false,
      
      // Note data
      note: {
        _id: null,
        title: '',
        content: '',
        category: ''
      },
      originalNote: {},
      isEditing: false,
      
      // Edit form
      editForm: {
        title: '',
        category: '',
        content: ''
      },
      
      // AI features
      showAIModal: false,
      aiModalType: '',
      aiModalTitle: '',
      aiModalIcon: '',
      aiResult: null,

      // Chatbot
      showChatbot: true, // Default to showing chatbot
      chatMessages: [],
      chatInput: '',
      chatLoading: false,
      selectedChatImage: null,
      chatImagePreviewUrl: null,
      isProcessingChatImage: false,

      // Note settings modal
      showNoteSettings: false,
      editableTitle: ''
    }
  },
  computed: {
    canGenerateContent() {
      return !this.loading &&
            !this.aiLoading &&
            !this.quizGenerating &&
            !this.flashcardGenerating &&
            this.note &&
            this.note._id &&
            this.userId &&
            this.note.content &&
            this.note.content.trim().length >= 50;
    },

    canGenerateQuiz() {
      return this.canGenerateContent && !this.quizGenerating;
    },

    canGenerateFlashcards() {
      return this.canGenerateContent && !this.flashcardGenerating;
    }
  },
  async mounted() {
    await this.loadNoteData();
  },
  watch: {
    'note.title'(newTitle) {
      this.editableTitle = newTitle || '';
    }
  },
  methods: {
    async loadNoteData() {
      try {
        this.loading = true;
        this.error = null;
        
        // Load user data
        const userId = await getUserIdFromToken();
        if (userId) {
          this.userId = userId;
          const userData = await getAccount(userId);
          this.userName = userData.username;
          this.userLevel = userData.currentLevel || 1;
        }
        
        // Load note data
        const noteId = this.$route.params.id;
        if (!noteId) {
          throw new Error('Note ID is required');
        }
        
        const noteData = await getNoteById(noteId);
        this.note = {
          title: '',
          content: '',
          category: '',
          ...noteData
        };
        this.originalNote = { ...this.note };
        
        // Initialize edit form
        this.editForm = {
          title: noteData.title || '',
          category: noteData.category || '',
          content: noteData.content || ''
        };

        // Initialize editable title
        this.editableTitle = noteData.title || '';

      } catch (error) {
        console.error('Error loading note:', error);
        this.error = 'Failed to load note';
      } finally {
        this.loading = false;
      }
    },

    toggleEdit() {
      if (this.isEditing) {
        // Cancel editing - restore original values
        this.editForm = {
          title: this.originalNote.title || '',
          category: this.originalNote.category || '',
          content: this.originalNote.content || ''
        };
      }
      this.isEditing = !this.isEditing;
    },

    async saveNote() {
      try {
        this.saving = true;
        
        const updatedNote = {
          title: this.editForm.title.trim() || 'Untitled Note',
          category: this.editForm.category.trim() || 'General',
          content: this.editForm.content.trim()
        };
        
        await updateNote(this.note._id, updatedNote);

        // Update local data
        this.note = { ...this.note, ...updatedNote };
        this.originalNote = { ...this.note };
        this.isEditing = false;
        
        this.showSuccess('Note updated successfully!');
        
      } catch (error) {
        console.error('Error saving note:', error);
        this.showError('Failed to save note');
      } finally {
        this.saving = false;
      }
    },

    async confirmDelete() {
      try {
        const noteId = this.note._id;
        await deleteNoteAPI(noteId);
        this.showSuccess('Note deleted successfully!');
        this.goBack();
      } catch (error) {
        console.error('Error deleting note:', error);
        this.showError('Failed to delete note');
      } finally {
        this.showNoteSettings = false;
      }
    },

    async updateNoteTitle() {
      if (this.editableTitle.trim() && this.editableTitle !== this.note.title) {
        try {
          const updatedNote = {
            ...this.note,
            title: this.editableTitle.trim()
          };
          await updateNote(this.note._id, updatedNote);
          this.note.title = this.editableTitle.trim();
          this.showSuccess('Note title updated successfully!');
        } catch (error) {
          console.error('Error updating note title:', error);
          this.showError('Failed to update note title');
          this.editableTitle = this.note.title; // Reset to original
        }
      }
    },

    async exportNote(format) {
      try {
        this.showNoteSettings = false;

        if (format === 'pdf') {
          await this.exportToPDF();
        } else if (format === 'doc') {
          await this.exportToDOC();
        }

        this.showSuccess(`Note exported as ${format.toUpperCase()} successfully!`);
      } catch (error) {
        console.error('Export error:', error);
        this.showError(`Failed to export note as ${format.toUpperCase()}`);
      }
    },

    async exportToPDF() {
      const pdf = new jsPDF();

      // Set font
      pdf.setFont('helvetica');

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(40, 40, 40);
      pdf.text(this.note.title || 'Untitled Note', 20, 30);

      // Add metadata
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Created: ${this.formatDate(this.note.date_created)}`, 20, 45);
      pdf.text(`Category: ${this.note.category || 'General'}`, 20, 55);

      // Add content
      pdf.setFontSize(12);
      pdf.setTextColor(60, 60, 60);

      // Split content into lines that fit the page width
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);

      const lines = pdf.splitTextToSize(this.note.content || 'No content available', maxLineWidth);

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
      const fileName = `${this.note.title || 'note'}.pdf`;
      pdf.save(fileName);
    },

    async exportToDOC() {
      try {
        // Create a new document
        const doc = new Document({
          sections: [{
            properties: {},
            children: [
              // Title
              new Paragraph({
                children: [
                  new TextRun({
                    text: this.note.title || 'Untitled Note',
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
                    text: `Created: ${this.formatDate(this.note.date_created)}`,
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
                    text: `Category: ${this.note.category || 'General'}`,
                    size: 20,
                    color: "666666"
                  })
                ],
                spacing: {
                  after: 400
                }
              }),
              // Content
              ...this.formatContentForDOC(this.note.content || 'No content available')
            ]
          }]
        });

        // Generate and save the document using blob instead of buffer
        const blob = await Packer.toBlob(doc);
        const fileName = `${this.note.title || 'note'}.docx`;
        saveAs(blob, fileName);
      } catch (error) {
        console.error('DOC export error:', error);
        throw error;
      }
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

    formatDate(dateString) {
      if (!dateString) return 'Unknown';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    goBack() {
      this.$router.push('/dashboard');
    },

    formatContent(content) {
      if (!content) return '';

      let text = '';

      // Handle different content types
      if (typeof content === 'string') {
        text = content;
      } else if (typeof content === 'object') {
        // Handle Gemini API response format
        if (content.candidates && Array.isArray(content.candidates)) {
          const parts = content.candidates[0]?.content?.parts;
          if (parts && Array.isArray(parts)) {
            text = parts.map(p => p.text || '').join('\n');
          }
        }
        // Handle direct parts array
        else if (Array.isArray(content)) {
          text = content.map(p => p.text || p).join('\n');
        }
        // Handle object with text property
        else if (content.text) {
          text = content.text;
        }
        // Handle object with parts property
        else if (content.parts && Array.isArray(content.parts)) {
          text = content.parts.map(p => p.text || p).join('\n');
        }
        // Fallback: try to stringify
        else {
          try {
            text = JSON.stringify(content);
          } catch (e) {
            text = String(content);
          }
        }
      } else {
        text = String(content);
      }

      // Format the text
      return text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
    },

    // AI Enhancement methods
    async enhanceWithAI() {
      await this.callAIFunction(
        () => enhanceExistingNote(this.note._id),
        'enhance',
        'Enhanced Note Content',
        'fas fa-magic'
      );
    },

    async generateSummary() {
      await this.callAIFunction(
        () => summarizeNoteAPI(this.note._id),
        'summary',
        'Note Summary',
        'fas fa-compress-alt'
      );
    },

    async generateQuestions() {
      await this.callAIFunction(
        () => generateStudyQuestions(this.note._id),
        'questions',
        'Practice Questions',
        'fas fa-question-circle'
      );
    },

    async callAIFunction(apiCall, type, title, icon) {
      try {
        this.aiLoading = true;
        const result = await apiCall();
        
        this.aiResult = result.response || result.message || 'No result available';
        this.aiModalType = type;
        this.aiModalTitle = title;
        this.aiModalIcon = icon;
        this.showAIModal = true;
        
      } catch (error) {
        console.error(`Error with AI ${type}:`, error);
        this.showError(`Failed to ${type} note with AI`);
      } finally {
        this.aiLoading = false;
      }
    },

    closeAIModal() {
      this.showAIModal = false;
      this.aiResult = null;
    },

    applyAIResult() {
      if (this.aiModalType === 'enhance' && this.aiResult) {
        this.editForm.content = this.aiResult;
        this.isEditing = true;
        this.closeAIModal();
        this.showInfo('Enhanced content applied to editor. Review and save when ready.');
      }
    },

    // Enhanced content formatting with AI-generated icons and headers
    formatEnhancedContent(content) {
      if (!content) return '';

      // Use the same content extraction logic as formatContent
      let text = '';

      if (typeof content === 'string') {
        text = content;
      } else if (typeof content === 'object') {
        // Handle Gemini API response format
        if (content.candidates && Array.isArray(content.candidates)) {
          const parts = content.candidates[0]?.content?.parts;
          if (parts && Array.isArray(parts)) {
            text = parts.map(p => p.text || '').join('\n');
          }
        }
        // Handle direct parts array
        else if (Array.isArray(content)) {
          text = content.map(p => p.text || p).join('\n');
        }
        // Handle object with text property
        else if (content.text) {
          text = content.text;
        }
        // Handle object with parts property
        else if (content.parts && Array.isArray(content.parts)) {
          text = content.parts.map(p => p.text || p).join('\n');
        }
        // Fallback: try to stringify
        else {
          try {
            text = JSON.stringify(content);
          } catch (e) {
            text = String(content);
          }
        }
      } else {
        text = String(content);
      }

      let formatted = text
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      // Add AI-generated icons to headers
      formatted = formatted.replace(
        /<br><br>([A-Z][^<]*?)<br>/g,
        '<div class="ai-section-header"><i class="fas fa-lightbulb ai-icon"></i><h3>$1</h3></div>'
      );

      // Add icons to important concepts
      formatted = formatted.replace(
        /"([^"]*?)"/g,
        '<span class="highlighted-quote"><i class="fas fa-quote-left"></i> $1 <i class="fas fa-quote-right"></i></span>'
      );

      return formatted;
    },

    // Chatbot methods
    async sendMessage() {
      // Check if we have either a message or an image
      if ((!this.chatInput.trim() && !this.selectedChatImage) || this.chatLoading) return;

      // Handle image processing
      if (this.selectedChatImage) {
        await this.processChatImageMessage();
        return;
      }

      const userMessage = this.chatInput.trim();
      this.chatInput = '';

      // Add user message
      this.chatMessages.push({
        type: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      this.chatLoading = true;

      try {
        // Create context from note content
        const context = `Note Title: ${this.note.title}\nNote Content: ${this.note.content}`;
        const prompt = `Based on this note content:\n\n${context}\n\nUser question: ${userMessage}\n\nPlease provide a helpful answer based on the note content.`;

        const response = await chatWithAI(prompt);

        // chatWithAI now returns just the message string
        const responseContent = response || 'No response received from AI service.';

        // Add AI response
        this.chatMessages.push({
          type: 'ai',
          content: responseContent,
          timestamp: new Date()
        });

        // Scroll to bottom
        this.$nextTick(() => {
          const messagesContainer = this.$refs.chatMessages;
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });

      } catch (error) {
        console.error('Chat error:', error);
        this.chatMessages.push({
          type: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        });
      } finally {
        this.chatLoading = false;
      }
    },

    async processChatImageMessage() {
      const messageText = this.chatInput.trim();
      const userMessage = {
        type: 'user',
        content: messageText || 'Uploaded an image for analysis',
        image: {
          name: this.selectedChatImage.name,
          size: this.formatFileSize(this.selectedChatImage.size),
          type: this.selectedChatImage.type
        },
        timestamp: new Date()
      };

      this.chatMessages.push(userMessage);

      const imageFile = this.selectedChatImage;

      // Clear inputs
      this.chatInput = '';
      this.removeSelectedChatImage();

      this.chatLoading = true;
      this.isProcessingChatImage = true;

      try {
        console.log('Processing chat image:', imageFile.name);

        // Import processImage function
        const { processImage } = await import('@/api/AI.js');

        // Process the image with OCR and AI
        const response = await processImage(imageFile);
        console.log('Chat image processing response:', response);

        let responseContent = '';

        if (response && response.data && response.data.note) {
          const note = response.data.note;
          const ocrResult = response.data.ocrResult;
          const imageInfo = response.data.imageInfo;

          responseContent = `📸 **Image Analysis Complete!**\n\n`;

          // Include user's message if provided
          if (messageText) {
            responseContent += `**Your Question:** ${messageText}\n\n`;
          }

          responseContent += `**File:** ${imageInfo.fileName} (${this.formatFileSize(imageInfo.fileSize)})\n\n`;

          if (ocrResult.textFound) {
            responseContent += `**Text Extracted:** ${ocrResult.textLength} characters, ${ocrResult.wordCount} words\n`;
            responseContent += `**Confidence:** ${Math.round(ocrResult.confidence * 100)}%\n\n`;
          } else {
            responseContent += `**Note:** No readable text was found in the image.\n\n`;
          }

          responseContent += `**AI Analysis:**\n${note.content}`;

          // Add note creation success message
          responseContent += `\n\n✅ **Note Created:** "${note.title}" has been saved to your notes.`;
        } else {
          responseContent = 'Image processed successfully, but no detailed analysis was returned.';
        }

        // Add AI response
        this.chatMessages.push({
          type: 'ai',
          content: responseContent,
          timestamp: new Date()
        });

        this.showSuccess('Success', 'Image processed and note created successfully!');

      } catch (error) {
        console.error('Chat image processing error:', error);

        this.chatMessages.push({
          type: 'ai',
          content: `I apologize, but I encountered an error processing your image: ${error.message}. Please try again with a different image or check that the image contains readable text.`,
          timestamp: new Date()
        });

        this.showError('Error', `Failed to process image: ${error.message}`);
      } finally {
        this.chatLoading = false;
        this.isProcessingChatImage = false;

        // Scroll to bottom
        this.$nextTick(() => {
          const messagesContainer = this.$refs.chatMessages;
          if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        });
      }
    },

    askQuestion(question) {
      this.chatInput = question;
      this.sendMessage();
    },

    toggleChatbot() {
      this.showChatbot = !this.showChatbot;
      console.log('Chatbot toggled:', this.showChatbot ? 'shown' : 'hidden');
    },

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    // New AI action methods
    async generateQuiz() {
      try {
        // Prevent multiple simultaneous quiz generations
        if (this.quizGenerating) {
          this.showWarning('Quiz generation is already in progress. Please wait...');
          return;
        }

        // Validate required data before proceeding
        if (!this.note || !this.note._id) {
          this.showError('Note data is not loaded yet. Please wait and try again.');
          return;
        }

        if (!this.userId) {
          this.showError('User authentication required. Please refresh the page and try again.');
          return;
        }

        if (!this.note.content || this.note.content.trim().length < 50) {
          this.showError('Note content is too short to generate a quiz. Please add more content.');
          return;
        }

        this.quizGenerating = true;
        this.showInfo('Generating quiz from your note...');

        const result = await generateQuizFromNote(this.note._id, this.userId, {
          difficulty: 'medium',
          questionCount: 5
        });

        this.showSuccess('Quiz generated successfully!');

        // Handle different possible response structures
        let quizId = null;
        if (result && result.quiz && result.quiz._id) {
          quizId = result.quiz._id;
        } else if (result && result._id) {
          quizId = result._id;
        } else if (result && result.id) {
          quizId = result.id;
        }

        // Navigate to the quiz page or Learning page
        if (quizId) {
          this.$router.push({
            path: '/learning',
            query: {
              tab: 'quizzes',
              newQuiz: quizId
            }
          });
        } else {
          // Fallback navigation without specific quiz ID
          this.$router.push({
            path: '/learning',
            query: {
              tab: 'quizzes'
            }
          });
        }

      } catch (error) {
        console.error('Error generating quiz:', error);
        this.showError('Failed to generate quiz. Please try again.');
      } finally {
        this.quizGenerating = false;
      }
    },

    async generateFlashcards() {
      try {
        // Prevent multiple simultaneous flashcard generations
        if (this.flashcardGenerating) {
          this.showWarning('Flashcard generation is already in progress. Please wait...');
          return;
        }

        // Validate required data before proceeding
        if (!this.note || !this.note._id) {
          this.showError('Note data is not loaded yet. Please wait and try again.');
          return;
        }

        if (!this.userId) {
          this.showError('User authentication required. Please refresh the page and try again.');
          return;
        }

        if (!this.note.content || this.note.content.trim().length < 50) {
          this.showError('Note content is too short to generate flashcards. Please add more content.');
          return;
        }

        this.flashcardGenerating = true;
        this.showInfo('Generating flashcards from your note...');

        const result = await generateFlashcardsFromNote(this.note._id, this.userId, {
          cardCount: 10
        });

        this.showSuccess('Flashcards generated successfully!');

        // Handle different possible response structures
        let flashcardSetId = null;
        if (result && result.flashcardSet && result.flashcardSet._id) {
          flashcardSetId = result.flashcardSet._id;
        } else if (result && result._id) {
          flashcardSetId = result._id;
        } else if (result && result.id) {
          flashcardSetId = result.id;
        }

        // Navigate to the flashcards page or Learning page
        if (flashcardSetId) {
          this.$router.push({
            path: '/learning',
            query: {
              tab: 'flashcards',
              newFlashcardSet: flashcardSetId
            }
          });
        } else {
          // Fallback navigation without specific flashcard set ID
          this.$router.push({
            path: '/learning',
            query: {
              tab: 'flashcards'
            }
          });
        }

      } catch (error) {
        console.error('Error generating flashcards:', error);
        this.showError('Failed to generate flashcards. Please try again.');
      } finally {
        this.flashcardGenerating = false;
      }
    },

    getButtonTooltip(type) {
      if (this.loading) {
        return 'Loading note data...';
      }
      if (type === 'quiz' && this.quizGenerating) {
        return 'Quiz generation in progress...';
      }
      if (type === 'flashcards' && this.flashcardGenerating) {
        return 'Flashcard generation in progress...';
      }
      if (this.aiLoading || this.quizGenerating || this.flashcardGenerating) {
        return 'AI is currently processing...';
      }
      if (!this.userId) {
        return 'User authentication required';
      }
      if (!this.note || !this.note._id) {
        return 'Note data not loaded';
      }
      if (!this.note.content || this.note.content.trim().length < 50) {
        return 'Note content too short (minimum 50 characters required)';
      }
      return type === 'quiz' ? 'Generate quiz from this note' : 'Generate flashcards from this note';
    },

    // Particle animation methods
    // Chat image processing methods
    triggerChatImageUpload() {
      this.$refs.chatImageInput.click();
    },

    handleChatImageSelect(event) {
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

      this.selectedChatImage = file;

      // Create preview URL for images (not for PDFs)
      if (file.type.startsWith('image/')) {
        this.chatImagePreviewUrl = URL.createObjectURL(file);
      } else {
        this.chatImagePreviewUrl = null; // For PDFs, we won't show preview
      }

      console.log('Chat image selected:', file.name, file.size, file.type);
    },

    removeSelectedChatImage() {
      if (this.chatImagePreviewUrl) {
        URL.revokeObjectURL(this.chatImagePreviewUrl);
      }
      this.selectedChatImage = null;
      this.chatImagePreviewUrl = null;
      this.$refs.chatImageInput.value = '';
    },

    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    getParticleSize(index) {
      const sizes = ['small', 'medium', 'large'];
      return sizes[index % 3];
    },

    getParticleColor(index) {
      const colors = ['blue', 'purple', 'pink', 'cyan'];
      return colors[index % 4];
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.note-detail-container {
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  background: #1a1a1a;
  color: #ffffff;
}

.space-background {
  background: #1a1a1a;
  color: #ffffff;
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

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

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
}

/* Main Content */
.main-content {
  display: flex;
  margin-left: 280px;
  z-index: 5;
  position: relative;
  transition: margin-left 0.5s ease-out, margin-right 0.5s ease-out;
  height: 100vh;
  /* Default: chatbot is open, so reserve space for it */
  margin-right: 400px;
}

/* Responsive to sidebar state */
@media (min-width: 769px) {
  .main-content {
    margin-left: var(--sidebar-width, 280px);
  }

  /* When chatbot is open, reserve space for it */
  .main-content.chatbot-open {
    margin-right: 400px;
  }

  /* When chatbot is hidden, use full width */
  .main-content:not(.chatbot-open) {
    margin-right: 0;
  }
}

.note-content-side {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background: #1a1a1a;
}

.chatbot-side {
  width: 400px;
  background: #2a2a2a;
  border-left: 1px solid #333;
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  z-index: 10;
  transition: transform 0.5s ease-out;
  transform: translateX(0);
  flex-shrink: 0;
}

.chatbot-side.chatbot-hidden {
  transform: translateX(100%);
}

/* Chatbot Toggle Button (when hidden) */
.chatbot-toggle-btn {
  position: fixed;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #64b5f6;
  color: #fff;
  border: none;
  padding: 15px 10px;
  border-radius: 25px 0 0 25px;
  cursor: pointer;
  z-index: 15;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
}

.chatbot-toggle-btn:hover {
  background: #42a5f5;
  transform: translateY(-50%) translateX(-5px);
}

.chatbot-toggle-btn i {
  font-size: 1.2rem;
}

.chatbot-toggle-btn span {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Note Header */
.note-header {
  padding: 20px 30px;
  border-bottom: 1px solid #333;
  background: #1a1a1a;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.note-title {
  flex: 1;
  font-size: 1.8rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
  padding: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  background: #333;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.action-btn:hover {
  background: #444;
}

.action-btn.save {
  background: #4caf50;
}

.action-btn.delete {
  background: #f44336;
}

.action-btn.chatbot-toggle {
  background: #64b5f6;
  color: #fff;
}

.action-btn.chatbot-toggle:hover {
  background: #42a5f5;
}

.action-btn.chatbot-toggle.active {
  background: #1976d2;
}

/* AI Action Buttons */
.ai-action-buttons {
  padding-left: 30px;
  display: flex;
  gap: 30px;
}

.ai-action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: #333;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.ai-action-btn:hover {
  background: #444;
  transform: translateY(-2px);
}

.ai-action-btn.quiz {
  background: #6366f1;
}

.ai-action-btn.flashcards {
  background: #f59e0b;
}

.ai-action-btn i {
  font-size: 1.2rem;
}

.ai-action-btn span {
  font-weight: 600;
  font-size: 0.9rem;
}

.ai-action-btn small {
  display: block;
  font-size: 0.75rem;
  opacity: 0.8;
  margin-top: 2px;
}

/* Note Content Area */
.note-content-area {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.content-container {
  background: #1a1a1a;
  border-radius: 12px;
  padding: 30px;
  min-height: 500px;
}

.content-editor {
  width: 100%;
  min-height: 500px;
  background: #2a2a2a;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  color: #fff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
}

.content-display {
  color: #fff;
  font-size: 1rem;
  line-height: 1.8;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* AI Enhanced Content Styles */
.ai-section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 30px 0 15px 0;
  padding: 15px 0;
  border-bottom: 1px solid #333;
}

.ai-icon {
  color: #ffd700;
  font-size: 1.2rem;
}

.ai-section-header h3 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 600;
  color: #fff;
}

.highlighted-quote {
  background: rgba(255, 215, 0, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  border-left: 3px solid #ffd700;
  margin: 10px 0;
  display: inline-block;
  font-style: italic;
}

.highlighted-quote i {
  color: #ffd700;
  font-size: 0.8rem;
}

/* Chatbot Styles */
.chatbot-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #2a2a2a;
}

.chatbot-header {
  padding: 20px;
  border-bottom: 1px solid #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #2a2a2a;
}

.chatbot-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #fff;
  font-weight: 600;
}

.chatbot-title i {
  color: #64b5f6;
  font-size: 1.2rem;
}

.close-chat-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.close-chat-btn:hover {
  color: #fff;
  background: #333;
}

.chatbot-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #2a2a2a;
}

.welcome-message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.ai-avatar {
  width: 32px;
  height: 32px;
  background: #64b5f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.chat-message {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
}

.chat-message.user {
  flex-direction: row-reverse;
}

.chat-message.user .message-content {
  background: #64b5f6;
  color: #fff;
  margin-left: 44px;
}

.chat-loading {
  display: flex;
  gap: 12px;
  margin-bottom: 15px;
  opacity: 0.8;
}

.chat-loading .message-content {
  background: #333;
  padding: 12px 16px;
  border-radius: 12px;
  color: #fff;
  font-size: 0.9rem;
}

.chat-loading .fa-spinner {
  color: #64b5f6;
}

.message-content {
  background: #333;
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 80%;
  color: #fff;
  font-size: 0.9rem;
  line-height: 1.4;
}

.message-time {
  display: block;
  font-size: 0.75rem;
  opacity: 0.6;
  margin-top: 5px;
}

.suggested-questions {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #333;
}

.suggestions-title {
  color: #888;
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.suggestion-btn {
  display: block;
  width: 100%;
  background: #333;
  border: none;
  color: #fff;
  padding: 10px 12px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  text-align: left;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.suggestion-btn:hover {
  background: #444;
}

.chatbot-input {
  padding: 20px;
  border-top: 1px solid #333;
  background: #2a2a2a;
}

/* Chat Image Preview */
.chat-image-preview-container {
  margin-bottom: 15px;
}

.chat-image-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.chat-preview-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.chat-image-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chat-image-name {
  color: white;
  font-weight: 500;
  font-size: 0.85rem;
}

.chat-image-size {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
}

.remove-chat-image-btn {
  background: rgba(255, 100, 100, 0.2);
  border: 1px solid rgba(255, 100, 100, 0.3);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ff6b6b;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.remove-chat-image-btn:hover {
  background: rgba(255, 100, 100, 0.3);
  border-color: rgba(255, 100, 100, 0.5);
  transform: scale(1.1);
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chat-input {
  display: flex;
  width: 100%;
  background: #333;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 12px;
  color: #fff;
  font-size: 0.9rem;
  resize: none;
}

.chat-input:focus {
  outline: none;
  border-color: #64b5f6;
}

.input-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.chat-attachment-btn {
  background: rgba(100, 181, 246, 0.2);
  border: 1px solid rgba(100, 181, 246, 0.3);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64b5f6;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.chat-attachment-btn:hover:not(:disabled) {
  background: rgba(100, 181, 246, 0.3);
  border-color: rgba(100, 181, 246, 0.5);
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(100, 181, 246, 0.3);
}

.chat-attachment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-btn {
  background: #64b5f6;
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: #42a5f5;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* Note Settings Modal */
.note-settings-modal {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-radius: 16px;
  width: 90%;
  max-width: 480px;
  margin: 5% auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.settings-header h2 {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  padding-bottom: 16px;
}

.settings-header .close-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-header .close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.settings-content {
  padding: 0 24px 24px 24px;
}

.settings-section {
  margin-bottom: 32px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-label {
  display: block;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 12px;
}

.title-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.title-input:focus {
  outline: none;
  border-color: #6366f1;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.title-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.export-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.export-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  color: #ffffff;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.export-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.export-btn i {
  font-size: 18px;
  width: 20px;
}

.pdf-btn:hover {
  border-color: #ef4444;
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
}

.pdf-btn i {
  color: #ef4444;
}

.doc-btn:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 20px rgba(37, 99, 235, 0.2);
}

.doc-btn i {
  color: #2563eb;
}

.delete-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #ef4444;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
}

.delete-btn i {
  font-size: 18px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .chatbot-side {
    width: 350px;
  }

  .main-content.chatbot-open {
    margin-right: 350px;
  }
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    margin-left: 0;
    margin-right: 0;
  }

  /* Override margin-right for mobile */
  .main-content.chatbot-open,
  .main-content:not(.chatbot-open) {
    margin-right: 0;
  }

  .chatbot-side {
    width: 100%;
    height: 50vh;
    position: relative;
    right: auto;
    top: auto;
  }

  .chatbot-side.chatbot-hidden {
    transform: translateY(100%);
  }

  .note-content-side {
    height: 50vh;
  }

  .chatbot-toggle-btn {
    bottom: 20px;
    right: 20px;
    top: auto;
    transform: none;
    border-radius: 50%;
    padding: 15px;
    flex-direction: row;
    width: auto;
    height: auto;
  }

  .chatbot-toggle-btn span {
    writing-mode: initial;
    text-orientation: initial;
    margin-left: 5px;
  }

  .chatbot-toggle-btn:hover {
    transform: translateY(-5px);
  }

  .ai-action-buttons {
    flex-direction: column;
  }
}
</style>
