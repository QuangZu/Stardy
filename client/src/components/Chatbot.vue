<template>
  <div class="chatbot-container">
    <!-- Chatbot Toggle Button -->
    <button 
      v-if="!isOpen" 
      @click="toggleChatbot" 
      class="chatbot-toggle"
      :class="{ 'has-notification': hasNewMessage }"
    >
      <i class="fas fa-comments"></i>
      <span v-if="hasNewMessage" class="notification-dot"></span>
    </button>

    <!-- Chatbot Window -->
    <div v-if="isOpen" class="chatbot-window">
      <!-- Header -->
      <div class="chatbot-header">
        <div class="header-content">
          <i class="fas fa-robot"></i>
          <span>Stardy</span>
        </div>
        <button @click="toggleChatbot" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Messages -->
      <div class="chatbot-messages" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index" 
          class="message"
          :class="{ 'user-message': message.isUser, 'ai-message': !message.isUser }"
        >
          <div class="message-content">
            <div class="message-text">{{ message.text }}</div>
            <div v-if="message.navigationLinks && message.navigationLinks.length > 0" class="navigation-links">
              <h4>Quick Links:</h4>
              <div class="link-buttons">
                <button 
                  v-for="link in message.navigationLinks" 
                  :key="link.url"
                  @click="navigateToPage(link.url)"
                  class="nav-link-btn"
                  :title="link.description"
                >
                  {{ link.text }}
                </button>
              </div>
            </div>
            <div v-if="message.suggestedActions && message.suggestedActions.length > 0" class="suggested-actions">
              <h4>Suggested Actions:</h4>
              <ul>
                <li v-for="action in message.suggestedActions" :key="action">{{ action }}</li>
              </ul>
            </div>
          </div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
        
        <!-- Typing indicator -->
        <div v-if="isTyping" class="message ai-message">
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Input -->
      <div class="chatbot-input">
        <div class="input-container">
          <input 
            v-model="currentMessage" 
            @keypress.enter="sendMessage"
            @input="handleInput"
            placeholder="Ask me anything about your learning..."
            :disabled="isTyping"
            class="message-input"
          />
          <button 
            @click="sendMessage" 
            :disabled="!currentMessage.trim() || isTyping"
            class="send-btn"
          >
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        
        <!-- Quick suggestions -->
        <div v-if="quickSuggestions.length > 0 && messages.length === 1" class="quick-suggestions">
          <button 
            v-for="suggestion in quickSuggestions" 
            :key="suggestion"
            @click="sendQuickMessage(suggestion)"
            class="suggestion-btn"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { chatWithAI } from '@/api/AI';

export default {
  name: 'Chatbot',
  data() {
    return {
      isOpen: false,
      currentMessage: '',
      messages: [],
      isTyping: false,
      hasNewMessage: false,
      quickSuggestions: [
        'How do I get started?',
        'Show me my progress',
        'What should I study next?',
        'Take me to practice questions',
        'Help me find exams'
      ]
    };
  },
  mounted() {
    this.initializeChatbot();
  },
  methods: {
    initializeChatbot() {
      // Add welcome message
      this.messages.push({
        text: `Hi 😻! I'm your AI assistant 😍. I can help you navigate the platform, suggest study materials and answer questions ❤️‍🔥. How can I help you today? 👀`,
        isUser: false,
        timestamp: new Date(),
        navigationLinks: [],
        suggestedActions: []
      });
    },
    
    toggleChatbot() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.hasNewMessage = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    
    async sendMessage() {
      if (!this.currentMessage.trim() || this.isTyping) return;
      
      const userMessage = this.currentMessage.trim();
      this.currentMessage = '';
      
      // Add user message
      this.messages.push({
        text: userMessage,
        isUser: true,
        timestamp: new Date()
      });
      
      this.isTyping = true;
      this.scrollToBottom();
      
      try {
        const response = await chatWithAI(userMessage);
        
        if (response.success) {
          this.messages.push({
            text: response.message,
            isUser: false,
            timestamp: new Date(),
            navigationLinks: response.navigationLinks || [],
            suggestedActions: response.suggestedActions || [],
            intent: response.intent,
            confidence: response.confidence
          });
        } else {
          this.messages.push({
            text: response.fallbackMessage || 'Sorry, I encountered an error. Please try again.',
            isUser: false,
            timestamp: new Date(),
            navigationLinks: [],
            suggestedActions: []
          });
        }
      } catch (error) {
        console.error('Chatbot error:', error);
        this.messages.push({
          text: 'I\'m sorry, I\'m having trouble connecting right now. Please try again later.',
          isUser: false,
          timestamp: new Date(),
          navigationLinks: [],
          suggestedActions: []
        });
      } finally {
        this.isTyping = false;
        this.scrollToBottom();
        
        if (!this.isOpen) {
          this.hasNewMessage = true;
        }
      }
    },
    
    sendQuickMessage(suggestion) {
      this.currentMessage = suggestion;
      this.sendMessage();
    },
    
    navigateToPage(url) {
      this.$router.push(url);
      this.toggleChatbot();
    },
    
    handleInput() {
      // Could add typing indicators or suggestions here
    },
    
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    },
    
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  }
};
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
}

.chatbot-toggle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
}

.chatbot-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.chatbot-toggle.has-notification {
  animation: pulse 2s infinite;
}

.notification-dot {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 12px;
  height: 12px;
  background: #ff4757;
  border-radius: 50%;
  border: 2px solid white;
}

.chatbot-window {
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chatbot-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.chatbot-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  display: flex;
  flex-direction: column;
  max-width: 85%;
}

.user-message {
  align-self: flex-end;
}

.user-message .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
}

.ai-message .message-content {
  background: #f1f3f4;
  color: #333;
  border-radius: 18px 18px 18px 4px;
}

.message-content {
  padding: 12px 16px;
  word-wrap: break-word;
}

.message-text {
  line-height: 1.4;
}

.navigation-links {
  margin-top: 12px;
}

.navigation-links h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.link-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.nav-link-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: inherit;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.ai-message .nav-link-btn {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #1976d2;
}

.nav-link-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.suggested-actions {
  margin-top: 12px;
}

.suggested-actions h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
}

.suggested-actions ul {
  margin: 0;
  padding-left: 16px;
  font-size: 14px;
}

.suggested-actions li {
  margin-bottom: 4px;
}

.message-time {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  align-self: flex-end;
}

.user-message .message-time {
  align-self: flex-end;
}

.ai-message .message-time {
  align-self: flex-start;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #999;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

.chatbot-input {
  padding: 16px;
  border-top: 1px solid #e0e0e0;
}

.input-container {
  display: flex;
  gap: 8px;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 24px;
  outline: none;
  font-size: 14px;
  transition: border-color 0.2s;
}

.message-input:focus {
  border-color: #667eea;
}

.message-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.quick-suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.suggestion-btn {
  background: #f0f0f0;
  border: 1px solid #ddd;
  color: #333;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-10px);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .chatbot-window {
    width: 300px;
    height: 450px;
  }
  
  .chatbot-container {
    bottom: 10px;
    right: 10px;
  }
}
</style>