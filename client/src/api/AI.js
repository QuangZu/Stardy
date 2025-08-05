import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create axios instance with default config
const aiAPI = axios.create({
    baseURL: `${backendURL}/ai`,
    timeout: 1000000000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Add request interceptor for debugging
aiAPI.interceptors.request.use(
    (config) => {
        console.log('[AI API] Making request to:', config.baseURL + config.url);
        console.log('[AI API] Request config:', {
            method: config.method,
            url: config.url,
            baseURL: config.baseURL,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('[AI API] Request error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
aiAPI.interceptors.response.use(
    (response) => {
        console.log('[AI API] Response received:', response.status);
        return response;
    },
    (error) => {
        console.error('[AI API] Response error:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        return Promise.reject(error);
    }
);

// Add request interceptor to include auth headers
aiAPI.interceptors.request.use(
    (config) => {
        const authHeaders = getAuthHeader();
        config.headers = { ...config.headers, ...authHeaders };
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
aiAPI.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        console.error('AI API Error:', error.response?.data || error.message);

        // Handle specific error cases
        if (error.response?.status === 429) {
            throw new Error('Too many AI requests. Please wait a moment before trying again.');
        } else if (error.response?.status === 401) {
            throw new Error('Authentication required. Please log in again.');
        } else if (error.response?.status === 403) {
            throw new Error('Access denied. You can only perform this action on your own content.');
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request timeout. The AI service is taking too long to respond.');
        } else {
            throw new Error(error.response?.data?.message || 'An error occurred while processing your request.');
        }
    }
);


// General AI chat
export const chatWithAI = async (message) => {
    try {
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            throw new Error('Message is required');
        }

        const response = await aiAPI.post('/chat', { message: message.trim() });

        if (response && response.success && response.data && response.data.message) {
            return response.data.message;
        } else if (response && response.data && typeof response.data === 'string') {
            return response.data;
        } else if (response && typeof response === 'string') {
            return response;
        } else {
            console.warn('Unexpected response format:', response);
            console.log('Full response object:', JSON.stringify(response, null, 2));
            return 'No response received from AI service.';
        }
    } catch (error) {
        console.error('Error chatting with AI:', error);

        // Handle specific error types with user-friendly messages
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 503:
                    throw new Error(data.message || 'The AI service is currently overloaded. Please try again in a few moments.');
                case 408:
                    throw new Error(data.message || 'The AI service is taking too long to respond. Please try again.');
                case 429:
                    throw new Error(data.message || 'Too many requests. Please wait a moment before trying again.');
                case 500:
                    throw new Error(data.message || 'AI service error. Please try again or contact support if the issue persists.');
                default:
                    throw new Error(data.message || `AI service error (${status}). Please try again.`);
            }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            throw new Error('Request timeout. The AI service is taking too long to respond.');
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            throw new Error('Network error. Please check your connection and try again.');
        } else {
            throw new Error(error.message || 'Failed to communicate with AI service. Please try again.');
        }
    }
};

// Note enhancement
export const enhanceExistingNote = async (noteId) => {
    try {
        if (!noteId) {
            throw new Error('Note ID is required');
        }

        const response = await aiAPI.post(`/notes/${noteId}/enhance`);
        return response;
    } catch (error) {
        console.error('Error enhancing note:', error);
        throw error;
    }
};

// Note summarization
export const summarizeNoteAPI = async (noteId) => {
    try {
        if (!noteId) {
            throw new Error('Note ID is required');
        }

        const response = await aiAPI.post(`/notes/${noteId}/summarize`);
        return response;
    } catch (error) {
        console.error('Error summarizing note:', error);
        throw error;
    }
};

// Alias for compatibility
export const summarizeNote = summarizeNoteAPI;

// Generate study questions
export const generateStudyQuestions = async (noteId) => {
    try {
        if (!noteId) {
            throw new Error('Note ID is required');
        }

        const response = await aiAPI.post(`/notes/${noteId}/questions`);
        return response;
    } catch (error) {
        console.error('Error generating study questions:', error);
        throw error;
    }
};

// Create flashcards
export const createFlashcards = async (noteId) => {
    try {
        if (!noteId) {
            throw new Error('Note ID is required');
        }

        const response = await aiAPI.post(`/notes/${noteId}/flashcards`);
        return response;
    } catch (error) {
        console.error('Error creating flashcards:', error);
        throw error;
    }
};

// Video analysis
export const analyzeVideoContent = async (videoData) => {
    try {
        if (!videoData) {
            throw new Error('Video data is required');
        }

        const { videoTitle, videoDescription, transcript } = videoData;

        if (!videoTitle && !videoDescription && !transcript) {
            throw new Error('At least one of videoTitle, videoDescription, or transcript is required');
        }

        const response = await aiAPI.post('/analyze-video', {
            videoTitle: videoTitle || '',
            videoDescription: videoDescription || '',
            transcript: transcript || ''
        });
        return response;
    } catch (error) {
        console.error('Error analyzing video:', error);
        throw error;
    }
};

// AI health check
export const getAIHealth = async () => {
    try {
        const response = await aiAPI.get('/health');
        return response;
    } catch (error) {
        console.error('Error checking AI health:', error);
        throw error;
    }
};

// Alias for admin compatibility
export const checkAIHealth = getAIHealth;

// Get all AI requests (admin function)
export const getAllAIRequests = async () => {
    try {
        // This would typically fetch AI request logs from an admin endpoint
        // For now, return mock data or implement based on your admin requirements
        const response = await aiAPI.get('/admin/requests');
        return response;
    } catch (error) {
        console.error('Error getting AI requests:', error);
        // Return empty data if endpoint doesn't exist yet
        return {
            success: true,
            data: {
                requests: [],
                total: 0,
                message: 'AI requests endpoint not implemented yet'
            }
        };
    }
};

// Helper function to check if AI service is available
export const isAIServiceAvailable = async () => {
    try {
        const health = await getAIHealth();
        return health.success && health.data?.status === 'healthy';
    } catch (error) {
        return false;
    }
};

// Helper function to format AI responses
export const formatAIResponse = (response) => {
    // Handle direct string responses
    if (typeof response === 'string') {
        return response;
    }

    // Handle null/undefined responses
    if (!response) {
        return 'No response received from AI service.';
    }

    // Handle server response format (after interceptor processing)
    if (response.success && response.data) {
        if (typeof response.data === 'string') {
            return response.data;
        } else if (response.data.message) {
            return response.data.message;
        } else if (response.data.analysis) {
            return response.data.analysis;
        } else if (response.data.explanation) {
            return response.data.explanation;
        } else if (response.data.summary) {
            return response.data.summary;
        } else if (response.data.questions) {
            return response.data.questions;
        } else if (response.data.flashcards) {
            return response.data.flashcards;
        } else if (response.data.quiz) {
            return response.data.quiz;
        } else if (response.data.enhancedContent) {
            return response.data.enhancedContent;
        }
    }

    // Handle legacy response format (if data is at root level)
    if (response.data) {
        if (typeof response.data === 'string') {
            return response.data;
        } else if (response.data.message) {
            return response.data.message;
        }
    }

    // Fallback to JSON string
    return JSON.stringify(response, null, 2);
};

// Process YouTube video with AssemblyAI + Gemini
export const processYouTubeVideo = async (youtubeUrl) => {
    try {
        if (!youtubeUrl || typeof youtubeUrl !== 'string' || youtubeUrl.trim() === '') {
            throw new Error('YouTube URL is required');
        }

        console.log('Processing YouTube video:', youtubeUrl);

        // Validate YouTube URL format
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)/;
        if (!youtubeRegex.test(youtubeUrl.trim())) {
            throw new Error('Invalid YouTube URL format. Please provide a valid YouTube video link.');
        }

        const response = await aiAPI.post('/process-youtube', {
            url: youtubeUrl.trim()
        }, {
            timeout: 1800000, // 30 minute timeout for YouTube processing
        });

        console.log('YouTube video processing completed successfully');
        return response;
    } catch (error) {
        console.error('Error processing YouTube video:', {
            message: error.message,
            youtubeUrl: youtubeUrl
        });

        // Handle specific error types with user-friendly messages
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 503:
                    throw new Error(data.message || 'The AI or transcription service is currently overloaded. Please try again in a few moments.');
                case 408:
                    throw new Error(data.message || 'YouTube video processing is taking too long. Please try again.');
                case 429:
                    throw new Error(data.message || 'Service quota exceeded. Please try again later.');
                case 400:
                    throw new Error(data.message || 'Invalid YouTube URL or video content. Please check the URL and try again.');
                case 500:
                    throw new Error(data.message || 'YouTube processing error. Please try again or contact support if the issue persists.');
                default:
                    throw new Error(data.message || `YouTube processing error (${status}). Please try again.`);
            }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            throw new Error('Request timeout. The YouTube video processing is taking too long to respond.');
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            throw new Error('Network error. Please check your connection and try again.');
        } else {
            throw new Error(error.message || 'Failed to process YouTube video. Please try again.');
        }
    }
};

// Process image with OCR and AI analysis
// Test CORS configuration
export const testCORS = async () => {
    try {
        console.log('Testing CORS configuration...');
        console.log('Backend URL:', backendURL);

        const response = await axios.get(`${backendURL}/cors-test`, {
            headers: getAuthHeader(),
            withCredentials: true
        });

        console.log('CORS test successful:', response.data);
        return response.data;
    } catch (error) {
        console.error('CORS test failed:', {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        throw error;
    }
};

export const processImage = async (file) => {
    try {
        if (!file) {
            throw new Error('Image file is required');
        }

        console.log('Processing image:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });

        // Validate file before upload
        if (file.size === 0) {
            throw new Error('Selected image file is empty');
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit for images
            throw new Error('Image file size exceeds 50MB limit');
        }

        // Validate image file type
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp',
            'image/tiff',
            'application/pdf'
        ];

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.pdf'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        // Check file extension
        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error(`Unsupported image type: ${fileExtension}. Allowed types: ${allowedExtensions.join(', ')}`);
        }

        // Check MIME type (with warning if mismatch)
        if (file.type && !allowedTypes.includes(file.type)) {
            console.warn(`Unexpected MIME type: ${file.type} for file: ${file.name}. Proceeding anyway.`);
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', file);

        console.log('Uploading image to server for OCR and AI analysis...');
        console.log('Backend URL:', backendURL);
        console.log('Full request URL:', `${backendURL}/ai/process-image`);

        const response = await aiAPI.post('/process-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                ...getAuthHeader()
            },
            timeout: 300000, // 5 minute timeout for image processing
            withCredentials: true
        });

        console.log('Image processing completed successfully');
        return response;
    } catch (error) {
        console.error('Error processing image:', {
            message: error.message,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type
        });

        // Handle specific error types with user-friendly messages
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 503:
                    throw new Error(data.message || 'The AI or OCR service is currently overloaded. Please try again in a few moments.');
                case 408:
                    throw new Error(data.message || 'Image processing is taking too long. Please try again.');
                case 429:
                    throw new Error(data.message || 'OCR service quota exceeded. Please try again later.');
                case 400:
                    throw new Error(data.message || 'Invalid image file. Please check the file format and try again.');
                case 500:
                    throw new Error(data.message || 'Image processing error. Please try again or contact support if the issue persists.');
                default:
                    throw new Error(data.message || `Image processing error (${status}). Please try again.`);
            }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            throw new Error('Request timeout. The image processing is taking too long to respond.');
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            throw new Error('Network error. Please check your connection and try again.');
        } else {
            throw new Error(error.message || 'Failed to process image. Please try again.');
        }
    }
};



// Process audio file with AssemblyAI + Gemini
export const processAudioFile = async (file) => {
    try {
        if (!file) {
            throw new Error('Audio file is required');
        }

        console.log('Processing audio file:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });

        // Validate file before upload
        if (file.size === 0) {
            throw new Error('Selected audio file is empty');
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit for audio files
            throw new Error('Audio file size exceeds 100MB limit');
        }

        // Validate audio file type
        const allowedTypes = [
            'audio/mpeg',
            'audio/mp3',
            'audio/wav',
            'audio/m4a',
            'audio/aac',
            'audio/ogg',
            'audio/webm'
        ];

        const allowedExtensions = ['.mp3', '.wav', '.m4a', '.aac', '.ogg', '.webm'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        // Check file extension
        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error(`Unsupported audio type: ${fileExtension}. Allowed types: ${allowedExtensions.join(', ')}`);
        }

        // Check MIME type (with warning if mismatch)
        if (file.type && !allowedTypes.includes(file.type)) {
            console.warn(`Unexpected MIME type: ${file.type} for file: ${file.name}. Proceeding anyway.`);
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('audio', file);

        console.log('Uploading audio file to server for transcription and AI analysis...');

        const response = await aiAPI.post('/process-audio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 1800000, // 30 minute timeout for audio processing
        });

        console.log('Audio file processing completed successfully');
        return response;
    } catch (error) {
        console.error('Error processing audio file:', {
            message: error.message,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type
        });

        // Handle specific error types with user-friendly messages
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;

            switch (status) {
                case 503:
                    throw new Error(data.message || 'The AI or transcription service is currently overloaded. Please try again in a few moments.');
                case 408:
                    throw new Error(data.message || 'Audio processing is taking too long. Please try again.');
                case 429:
                    throw new Error(data.message || 'Service quota exceeded. Please try again later.');
                case 400:
                    throw new Error(data.message || 'Invalid audio file. Please check the file format and try again.');
                case 500:
                    throw new Error(data.message || 'Audio processing error. Please try again or contact support if the issue persists.');
                default:
                    throw new Error(data.message || `Audio processing error (${status}). Please try again.`);
            }
        } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            throw new Error('Request timeout. The audio processing is taking too long to respond.');
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
            throw new Error('Network error. Please check your connection and try again.');
        } else {
            throw new Error(error.message || 'Failed to process audio file. Please try again.');
        }
    }
};

// Process document upload
export const processDocument = async (file) => {
    try {
        if (!file) {
            throw new Error('Document file is required');
        }

        console.log('Processing document:', {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        });

        // Validate file before upload
        if (file.size === 0) {
            throw new Error('Selected file is empty');
        }

        if (file.size > 100 * 1024 * 1024) { // 100MB limit
            throw new Error('File size exceeds 100MB limit');
        }

        // Validate file type (both extension and MIME type)
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain'
        ];

        const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.txt'];
        const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

        // Check file extension
        if (!allowedExtensions.includes(fileExtension)) {
            throw new Error(`Unsupported file type: ${fileExtension}. Allowed types: ${allowedExtensions.join(', ')}`);
        }

        // Check MIME type (with warning if mismatch, as browsers sometimes send incorrect MIME types)
        if (file.type && !allowedTypes.includes(file.type)) {
            console.warn(`Unexpected MIME type: ${file.type} for file: ${file.name}. Proceeding anyway.`);
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('document', file);

        console.log('Uploading file to server...');

        const response = await aiAPI.post('/process-document', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            timeout: 300000, // 5 minute timeout for large files and AI processing
        });

        console.log('Document processing completed successfully');
        return response;
    } catch (error) {
        console.error('Error processing document:', {
            message: error.message,
            fileName: file?.name,
            fileSize: file?.size,
            fileType: file?.type
        });
        throw error;
    }
};

// Process audio upload
export const processAudio = async (file) => {
    try {
        if (!file) {
            throw new Error('Audio file is required');
        }

        console.log('Processing audio:', file.name);

        // Create a simple note from audio
        // In a real implementation, you'd transcribe the audio first
        const response = await chatWithAI(`Please help me create study notes for an audio recording named "${file.name}". Generate comprehensive study notes with key points, summaries, and important concepts that would typically be found in an educational audio recording.`);

        return {
            success: true,
            note: {
                title: `Audio Notes - ${file.name.replace(/\.[^/.]+$/, "")}`,
                content: formatAIResponse(response),
                category: 'Audio'
            }
        };
    } catch (error) {
        console.error('Error processing audio:', error);
        throw error;
    }
};

// Generate title for content
export const generateNoteTitle = async (content) => {
    try {
        if (!content || content.trim().length === 0) {
            throw new Error('Content is required to generate title');
        }

        const response = await chatWithAI(`Please generate a concise, descriptive title (maximum 60 characters) for the following content. Return only the title, nothing else:\n\n${content.substring(0, 500)}...`);

        let title = formatAIResponse(response).trim();

        // Clean up the title
        title = title.replace(/^["']|["']$/g, ''); // Remove quotes
        title = title.replace(/^Title:\s*/i, ''); // Remove "Title:" prefix
        title = title.substring(0, 60); // Limit length

        return title || 'AI Generated Note';
    } catch (error) {
        console.error('Error generating title:', error);
        return 'AI Generated Note';
    }
};
