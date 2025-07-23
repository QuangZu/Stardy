<template>
  <div class="ai-tutor-container space-background">
    <!-- Space Particles -->
    <div class="space-particles">
      <div v-for="i in 20" :key="i" class="particle" 
           :style="{
             left: Math.random() * 100 + '%',
             top: Math.random() * 100 + '%',
             animationDelay: Math.random() * 3 + 's',
             width: (Math.random() * 4 + 2) + 'px',
             height: (Math.random() * 4 + 2) + 'px'
           }"></div>
    </div>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></div>
      <p>Loading AI Tutor...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon"><i class="fas fa-exclamation-triangle"></i></div>
      <p>{{ error }}</p>
      <button @click="loadAITutorData" class="retry-btn">Try Again</button>
    </div>
    
    <!-- Main AI Tutor Content -->
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
        <header class="ai-tutor-header">
          <div class="header-content space-glow ">
            <h1><i class="fas fa-robot"></i> AI Tutor</h1>
            <p>Get personalized help with your studies</p>
          </div>
          <div class="header-actions">
            <button @click="clearChat" class="clear-chat-btn">
              <i class="fas fa-trash"></i> Clear Chat
            </button>
          </div>
        </header>
        
        <!-- AI Status Banner -->
        <div class="ai-status-banner">
          <div class="status-content">
            <div class="status-icon">
              <i class="fas fa-info-circle"></i>
            </div>
            <div class="status-text">
              <h3>AI Integration Coming Soon</h3>
              <p>This page is ready for Gemini API integration. Add your API key to enable AI-powered tutoring.</p>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2><i class="fas fa-bolt"></i> Quick Actions</h2>
          <div class="actions-grid">
            <div class="action-card" @click="selectQuickAction('explain')">
              <div class="action-icon">
                <i class="fas fa-lightbulb"></i>
              </div>
              <h3>Explain Concept</h3>
              <p>Get detailed explanations of complex topics</p>
            </div>
            <div class="action-card" @click="selectQuickAction('solve')">
              <div class="action-icon">
                <i class="fas fa-calculator"></i>
              </div>
              <h3>Solve Problem</h3>
              <p>Step-by-step problem solving assistance</p>
            </div>
            <div class="action-card" @click="selectQuickAction('quiz')">
              <div class="action-icon">
                <i class="fas fa-question-circle"></i>
              </div>
              <h3>Generate Quiz</h3>
              <p>Create practice questions on any topic</p>
            </div>
            <div class="action-card" @click="selectQuickAction('study')">
              <div class="action-icon">
                <i class="fas fa-book-open"></i>
              </div>
              <h3>Study Plan</h3>
              <p>Get personalized study recommendations</p>
            </div>
          </div>
        </div>
        
        <!-- Chat Interface -->
        <div class="chat-section">
          <h2><i class="fas fa-comments"></i> Chat with AI Tutor</h2>
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessages">
              <!-- Welcome Message -->
              <div class="message ai-message">
                <div class="message-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                  <div class="message-text">
                    <p>Hello! I'm your AI Tutor. I'm here to help you with your studies. Once the Gemini API is integrated, I'll be able to:</p>
                    <ul>
                      <li>Answer questions about any subject</li>
                      <li>Explain complex concepts in simple terms</li>
                      <li>Help solve math and science problems</li>
                      <li>Create personalized study materials</li>
                      <li>Generate practice questions and quizzes</li>
                    </ul>
                    <p>For now, you can explore the interface and see how it will work!</p>
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
                  <i :class="message.type === 'user' ? 'fas fa-user' : 'fas fa-robot'"></i>
                </div>
                <div class="message-content">
                  <div class="message-text">
                    <p v-html="formatMessage(message.text)"></p>
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
            
            <!-- Chat Input -->
            <div class="chat-input-container">
              <div class="input-wrapper">
                <input 
                  v-model="currentMessage" 
                  @keypress.enter="sendMessage"
                  type="text" 
                  placeholder="Ask me anything about your studies..."
                  :disabled="isTyping"
                  class="chat-input"
                >
                <button 
                  @click="sendMessage" 
                  :disabled="!currentMessage.trim() || isTyping"
                  class="send-btn"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
              <div class="input-suggestions">
                <button 
                  v-for="suggestion in suggestions" 
                  :key="suggestion"
                  @click="selectSuggestion(suggestion)"
                  class="suggestion-btn"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI Features Preview -->
        <div class="features-section">
          <h2><i class="fas fa-magic"></i> AI Features (Coming Soon)</h2>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-brain"></i>
              </div>
              <h3>Smart Learning</h3>
              <p>Adaptive learning paths based on your progress and learning style</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-chart-bar"></i>
              </div>
              <h3>Performance Analysis</h3>
              <p>Detailed insights into your strengths and areas for improvement</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-clock"></i>
              </div>
              <h3>24/7 Availability</h3>
              <p>Get help anytime, anywhere with instant AI responses</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">
                <i class="fas fa-language"></i>
              </div>
              <h3>Multi-Subject Support</h3>
              <p>Expert knowledge across mathematics, science, languages, and more</p>
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
  name: 'AITutor',
  components: {
    Sidebar
  },
  data() {
    return {
      userName: 'Loading...',
      userLevel: 1,
      userId: null,
      currentMessage: '',
      chatMessages: [],
      isTyping: false,
      suggestions: [
        'Explain photosynthesis',
        'Help with calculus derivatives',
        'Create a chemistry quiz',
        'Study plan for exams'
      ],
      loading: true,
      error: null
    }
  },
  async mounted() {
    await this.loadAITutorData();
  },
  methods: {
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
    
    async loadAITutorData() {
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
        
        // Load previous chat messages (mock data for now)
        this.chatMessages = [
          // Previous conversations would be loaded here
        ];
        
      } catch (error) {
        this.error = 'Failed to load AI tutor';
        
        if (error.message.includes('token') || error.response?.status === 401) {
          localStorage.removeItem('token');
          this.$router.push('/login');
        }
      } finally {
        this.loading = false;
      }
    },
    
    async sendMessage() {
      if (!this.currentMessage.trim()) return;
      
      const userMessage = {
        id: Date.now(),
        type: 'user',
        text: this.currentMessage,
        timestamp: new Date()
      };
      
      this.chatMessages.push(userMessage);
      const messageText = this.currentMessage;
      this.currentMessage = '';
      
      // Scroll to bottom
      this.$nextTick(() => {
        this.scrollToBottom();
      });
      
      // Show typing indicator
      this.isTyping = true;
      
      // Simulate AI response (replace with actual Gemini API call)
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: this.generateMockResponse(messageText),
          timestamp: new Date()
        };
        
        this.chatMessages.push(aiResponse);
        this.isTyping = false;
        
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }, 2000);
    },
    
    generateMockResponse(userMessage) {
      // Mock responses for demonstration
      const responses = [
        "I understand you're asking about \"" + userMessage + "\". Once the Gemini API is integrated, I'll be able to provide detailed, accurate responses to help with your studies!",
        "That's a great question! When the AI is fully connected, I'll analyze your question and provide step-by-step explanations tailored to your learning level.",
        "I'd love to help you with that topic! The AI integration will allow me to access vast knowledge databases to give you comprehensive answers.",
        "Excellent question! With Gemini AI, I'll be able to break down complex concepts into easy-to-understand explanations with examples and practice problems."
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
    },
    
    selectSuggestion(suggestion) {
      this.currentMessage = suggestion;
    },
    
    selectQuickAction(action) {
      const actionMessages = {
        explain: "Can you explain a concept for me?",
        solve: "I need help solving a problem",
        quiz: "Can you create a quiz for me?",
        study: "I need a study plan"
      };
      
      this.currentMessage = actionMessages[action] || "";
    },
    
    clearChat() {
      if (confirm('Are you sure you want to clear the chat history?')) {
        this.chatMessages = [];
      }
    },
    
    scrollToBottom() {
      const chatMessages = this.$refs.chatMessages;
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    },
    
    formatMessage(text) {
      // Basic formatting for demonstration
      return text.replace(/\n/g, '<br>');
    },
    
    formatTime(date) {
      return new Date(date).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
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
.ai-tutor-container {
  display: flex;
  min-height: 100vh;
  position: relative;
}
.learning-container {
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

.ai-tutor-header {
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

.clear-chat-btn {
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

.clear-chat-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* AI Status Banner */
.ai-status-banner {
  background: rgba(255, 193, 7, 0.2);
  border: 1px solid rgba(255, 193, 7, 0.4);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.status-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-icon {
  font-size: 2rem;
  color: #ffc107;
}

.status-text h3 {
  color: white;
  margin: 0 0 0.5rem 0;
}

.status-text p {
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 2rem;
}

.quick-actions h2 {
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.action-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.action-icon {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.action-card h3 {
  color: white;
  margin: 0 0 0.5rem 0;
}

.action-card p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
}

/* Chat Section */
.chat-section {
  margin-bottom: 2rem;
}

.chat-section h2 {
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chat-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.chat-messages {
  height: 400px;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.user-message {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.ai-message .message-avatar {
  background: rgba(102, 126, 234, 0.8);
  color: white;
}

.user-message .message-avatar {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.message-content {
  flex: 1;
  max-width: 70%;
}

.message-text {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  color: white;
}

.user-message .message-text {
  background: rgba(102, 126, 234, 0.3);
}

.message-text p {
  margin: 0;
  line-height: 1.5;
}

.message-text ul {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.message-time {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
}

.user-message .message-time {
  text-align: right;
}

/* Typing Indicator */
.typing-indicator {
  display: flex;
  gap: 0.25rem;
  padding: 1rem;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Chat Input */
.chat-input-container {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem;
}

.input-wrapper {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chat-input {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
}

.chat-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.send-btn {
  padding: 0.75rem 1rem;
  background: rgba(102, 126, 234, 0.8);
  border: 1px solid rgba(102, 126, 234, 1);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: rgba(102, 126, 234, 1);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-suggestions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.suggestion-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
}

.suggestion-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* Features Section */
.features-section {
  margin-bottom: 2rem;
}

.features-section h2 {
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.feature-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}

.feature-icon {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: white;
  margin: 0 0 0.5rem 0;
}

.feature-card p {
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  font-size: 0.9rem;
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