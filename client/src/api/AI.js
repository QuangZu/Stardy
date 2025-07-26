import axios from 'axios';

const backendURL = 'http://localhost:3000/api';

// Get authorization header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};


/**
 * Send a message to the AI chatbot
 * @param {string} message - User's message
 * @returns {Promise<Object>} AI response with message, intent, navigation links, etc.
 */
export const chatWithAI = async (message) => {
  try {
    const response = await axios.post(`${backendURL}/ai/chat`, { message }, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error chatting with AI:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to communicate with AI',
      fallbackMessage: 'I\'m sorry, I\'m having trouble understanding right now. Please try again later.'
    };
  }
};

/**
 * Get personalized learning recommendations
 * @param {string} context - Current page context (optional)
 * @param {string} subject - Current subject (optional)
 * @returns {Promise<Object>} Personalized recommendations
 */
export const getRecommendations = async (context = null, subject = null) => {
  try {
    const params = {};
    if (context) params.context = context;
    if (subject) params.subject = subject;
    
    const response = await axios.get(`${backendURL}/ai/recommendations`, { 
      params,
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get recommendations',
      recommendations: {
        priority: 'medium',
        recommendations: [{
          type: 'study',
          title: 'Continue Learning',
          description: 'Keep practicing to improve your skills',
          estimatedTime: '30',
          difficulty: 'medium',
          reason: 'Consistent practice leads to improvement',
          actionLink: '/learning'
        }],
        nextSteps: ['Practice regularly', 'Review weak areas', 'Take practice exams'],
        motivationalMessage: 'Keep up the great work! Every question you answer brings you closer to mastery.'
      }
    };
  }
};

/**
 * Get exam-specific recommendations for learning preparation
 * @param {string} subject - Subject for exam recommendations (optional)
 * @returns {Promise<Object>} Exam-focused recommendations
 */
export const getExamRecommendations = async (subject = null) => {
  try {
    const params = {};
    if (subject) params.subject = subject;
    
    const response = await axios.get(`${backendURL}/ai/recommendations/exam`, { 
      params,
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting exam recommendations:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get exam recommendations',
      recommendations: {
        priority: 'high',
        recommendations: [{
          type: 'exam',
          title: 'Practice Exam',
          description: 'Take a practice exam to test your knowledge',
          estimatedTime: '45',
          difficulty: 'medium',
          reason: 'Practice exams help identify knowledge gaps',
          actionLink: '/exams'
        }],
        nextSteps: ['Review weak areas', 'Take practice exams', 'Study consistently'],
        motivationalMessage: 'You\'re making great progress! Practice exams will help you succeed.'
      }
    };
  }
};

/**
 * Get contextual help based on current user state
 * @param {string} intent - Type of help needed (optional)
 * @param {string} page - Current page (optional)
 * @returns {Promise<Object>} Contextual help response
 */
export const getContextualHelp = async (intent = 'general', page = null) => {
  try {
    const params = { intent };
    if (page) params.page = page;
    
    const response = await axios.get(`${backendURL}/ai/help`, { 
      params,
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting contextual help:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get help',
      help: 'I\'m here to help! You can ask me about navigation, learning resources, or your progress.'
    };
  }
};

/**
 * Get user analytics for AI services
 * @returns {Promise<Object>} User analytics data
 */
export const getUserAnalytics = async () => {
  try {
    const response = await axios.get(`${backendURL}/ai/analytics`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user analytics:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to get analytics',
      analytics: {
        currentLevel: 1,
        experience: 0,
        totalQuestions: 0,
        totalExams: 0,
        subjectPerformance: [],
        learningPatterns: { pattern: 'beginner', consistency: 'low' }
      }
    };
  }
};

/**
 * Check AI services health
 * @returns {Promise<Object>} Health status of AI services
 */
export const checkAIHealth = async () => {
  try {
    const response = await axios.get(`${backendURL}/ai/health`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error checking AI health:', error);
    return {
      success: false,
      status: 'unhealthy',
      error: error.response?.data?.error || 'Health check failed'
    };
  }
};

// Legacy AI request functions (for existing functionality)

// Get all AI requests
export const getAllAIRequests = async () => {
    try {
        const response = await axios.get(`${backendURL}/ai/requests`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error getting all AI requests:', error);
        throw error;
    }
};

// Create a new AI request
export const createAIRequest = async (requestData) => {
    try {
        const response = await axios.post(`${backendURL}/ai/requests`, requestData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating AI request:', error);
        throw error;
    }
};

// Get AI requests by user
export const getAIRequestsByUser = async (userId) => {
    try {
        const response = await axios.get(`${backendURL}/ai/requests/user/${userId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error getting AI requests by user:', error);
        throw error;
    }
};

/**
 * Get AI requests for current user (using new API)
 * @returns {Promise<Array>} List of user's AI requests
 */
export const getUserAIRequests = async () => {
  try {
    const response = await axios.get(`${backendURL}/ai/requests/user`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user AI requests:', error);
    throw error;
  }
};

// Utility functions

/**
 * Format AI response for display
 * @param {Object} response - Raw AI response
 * @returns {Object} Formatted response
 */
export const formatAIResponse = (response) => {
  return {
    message: response.message || response.response || 'No response available',
    intent: response.intent || 'unknown',
    confidence: response.confidence || 0,
    navigationLinks: response.navigationLinks || [],
    suggestedActions: response.suggestedActions || [],
    timestamp: response.timestamp || new Date().toISOString()
  };
};

/**
 * Get quick action suggestions based on current context
 * @param {string} page - Current page
 * @returns {Array<string>} List of quick suggestions
 */
export const getQuickSuggestions = (page) => {
  const suggestions = {
    dashboard: [
      'Show me my progress',
      'What should I study next?',
      'Take me to practice questions'
    ],
    learning: [
      'Get exam recommendations',
      'Show me easier questions',
      'Help me with this subject'
    ],
    exams: [
      'Recommend practice exams',
      'Show my exam history',
      'Help me prepare for exams'
    ],
    progress: [
      'Explain my progress',
      'Show weak areas',
      'How can I improve?'
    ],
    default: [
      'How do I get started?',
      'Show me my progress',
      'What should I study next?',
      'Take me to practice questions',
      'Help me find exams'
    ]
  };
  
  return suggestions[page] || suggestions.default;
};

// Process YouTube video
export const processYouTubeVideo = async (url) => {
    try {
        if (!url || typeof url !== 'string' || url.trim() === '') {
          throw new Error('YouTube URL is required');
        }
        
        console.log('Sending request to process YouTube video:', url); // Debug log
        
        const response = await axios.post(`${backendURL}/ai/process/youtube`, 
            { url: url.trim() },
            { 
                headers: getAuthHeader(),
                timeout: 60000 // 60 second timeout
            }
        );
        
        console.log('YouTube processing response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Error processing YouTube video:', error);
        
        // Enhanced error handling
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. The video processing is taking too long.');
        }
        
        if (error.response) {
            // Server responded with error status
            throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Network error. Please check your internet connection.');
        } else {
            // Something else happened
            throw error;
        }
    }
};

// Process document upload
export const processDocument = async (file) => {
    try {
        if (!file) {
            throw new Error('Document file is required');
        }
        
        console.log('Sending request to process document:', file.name); // Debug log
        
        const formData = new FormData();
        formData.append('document', file);
        
        const response = await axios.post(`${backendURL}/ai/process/document`, 
            formData,
            { 
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'
                },
                timeout: 120000 // 2 minute timeout for document processing
            }
        );
        
        console.log('Document processing response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Error processing document:', error);
        
        // Enhanced error handling
        if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. The document processing is taking too long.');
        }
        
        if (error.response) {
            // Server responded with error status
            throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
            // Request was made but no response received
            throw new Error('Network error. Please check your internet connection.');
        } else {
            // Something else happened
            throw error;
        }
    }
};

// Process audio upload
export const processAudio = async (file) => {
    try {
        const formData = new FormData();
        formData.append('audio', file);
        
        const response = await axios.post(`${backendURL}/ai/process/audio`, 
            formData,
            { 
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error processing audio:', error);
        throw error;
    }
};
