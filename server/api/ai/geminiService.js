const axios = require('axios');
const promptTemplates = require('./promptTemplates');

// Gemini API configuration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Function to get API key (allows for dynamic loading)
const getAPIKey = () => {
    const key = process.env.GEMINI_API_KEY;
    console.log('[GeminiService] API Key check:', key ? `${key.substring(0, 10)}...` : 'NOT FOUND');
    return key;
};

// Rate limiting and retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const REQUEST_TIMEOUT = 180000;

class GeminiService {
    constructor() {
        this.requestCount = 0;
        this.lastRequestTime = 0;
        this.minRequestInterval = 1000;
        this.failureCount = 0;
        this.lastFailureTime = 0;
        this.circuitBreakerOpen = false;
        this.circuitBreakerTimeout = 30000;
    }

    // Rate limiting helper
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
        this.requestCount++;
    }

    // Simple circuit breaker check
    checkCircuitBreaker() {
        if (this.circuitBreakerOpen) {
            const timeSinceFailure = Date.now() - this.lastFailureTime;
            if (timeSinceFailure > this.circuitBreakerTimeout) {
                this.circuitBreakerOpen = false;
                this.failureCount = 0;
                console.log('[GeminiService] Circuit breaker reset - attempting to reconnect');
            } else {
                throw new Error('AI service is temporarily unavailable due to repeated failures. Please try again later.');
            }
        }
    }

    // Record failure for circuit breaker
    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        if (this.failureCount >= 3) {
            this.circuitBreakerOpen = true;
            console.log('[GeminiService] Circuit breaker opened due to repeated failures');
        }
    }

    // Record success for circuit breaker
    recordSuccess() {
        this.failureCount = 0;
        this.circuitBreakerOpen = false;
    }

    // Fallback response when API quota is exceeded
    getFallbackResponse(prompt) {
        console.log('[GeminiService] Generating fallback response due to API quota limits');

        // Analyze prompt to provide contextual fallback
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes('chat') || lowerPrompt.includes('hello') || lowerPrompt.includes('hi')) {
            return "Hello! I'm currently experiencing high demand and my AI service quota has been reached for today. However, I'm still here to help! Please try again tomorrow, or contact support if you need immediate assistance.";
        } else if (lowerPrompt.includes('enhance') || lowerPrompt.includes('improve')) {
            return "I'd love to help enhance your content, but I'm currently at my daily API limit. Your content looks great as is! Please try again tomorrow for AI-powered enhancements.";
        } else if (lowerPrompt.includes('summarize') || lowerPrompt.includes('summary')) {
            return "I'm unable to generate a summary right now due to API limits. Please try again tomorrow, or you can create a manual summary by identifying the key points and main ideas in your content.";
        } else if (lowerPrompt.includes('question') || lowerPrompt.includes('quiz')) {
            return "I can't generate questions right now due to API quota limits. Try creating your own study questions by focusing on key concepts, definitions, and important facts from your material.";
        } else if (lowerPrompt.includes('flashcard')) {
            return "Flashcard generation is temporarily unavailable due to API limits. You can create effective flashcards by putting key terms on one side and definitions/explanations on the other.";
        } else if (lowerPrompt.includes('health') || lowerPrompt.includes('working')) {
            return "AI service is operational but currently limited due to daily quota restrictions. Service will be fully restored tomorrow.";
        } else {
            return "I'm currently experiencing high demand and have reached my daily API quota. Please try again tomorrow for full AI assistance. Thank you for your patience!";
        }
    }

    // Core method to generate response from Gemini
    async generateGeminiResponse(prompt, retryCount = 0) {
        try {
            // Check circuit breaker
            this.checkCircuitBreaker();

            // Validate API key
            const API_KEY = getAPIKey();
            if (!API_KEY) {
                throw new Error('GEMINI_API_KEY is not configured');
            }

            // Validate prompt
            if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
                throw new Error('Invalid prompt provided');
            }

            // Enforce rate limiting
            await this.enforceRateLimit();

            console.log(`[GeminiService] Making API request (attempt ${retryCount + 1})`);

            const response = await axios.post(
                `${GEMINI_API_URL}?key=${API_KEY}`,
                {
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048,
                    },
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_MEDIUM_AND_ABOVE"
                        }
                    ]
                },
                {
                    timeout: REQUEST_TIMEOUT,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            // Extract and validate response
            const result = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!result) {
                console.error('[GeminiService] No valid response from API:', response.data);
                throw new Error('No valid response received from Gemini API');
            }

            console.log(`[GeminiService] Successfully generated response (${result.length} characters)`);
            this.recordSuccess();
            return result.trim();

        } catch (error) {
            console.error(`[GeminiService] Error on attempt ${retryCount + 1}:`, error.message);

            // Handle specific error types
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                console.error(`[GeminiService] API Error ${status}:`, errorData);

                // Handle rate limiting (429) - check if quota exceeded
                if (status === 429) {
                    const errorMsg = errorData?.error?.message || 'Rate limit exceeded';
                    if (errorMsg.includes('quota') || errorMsg.includes('billing')) {
                        // Quota exceeded - return fallback response
                        console.log('[GeminiService] API quota exceeded, returning fallback response');
                        return this.getFallbackResponse(prompt);
                    } else if (retryCount < MAX_RETRIES) {
                        // Regular rate limiting - retry with backoff
                        const delay = RETRY_DELAY * Math.pow(2, retryCount);
                        console.log(`[GeminiService] Rate limited. Retrying in ${delay}ms...`);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return this.generateGeminiResponse(prompt, retryCount + 1);
                    }
                }

                // Handle server errors (5xx) with retry
                if (status >= 500 && retryCount < MAX_RETRIES) {
                    const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
                    const errorMsg = errorData?.error?.message || 'Server error';
                    console.log(`[GeminiService] ${errorMsg}. Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.generateGeminiResponse(prompt, retryCount + 1);
                }

                // Handle client errors (4xx) - record failure for non-retry errors
                if (status === 400) {
                    this.recordFailure();
                    throw new Error('Invalid request format or content');
                } else if (status === 401) {
                    this.recordFailure();
                    throw new Error('Invalid API key');
                } else if (status === 403) {
                    this.recordFailure();
                    throw new Error('API access forbidden');
                } else if (status === 429) {
                    this.recordFailure();
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (status === 503) {
                    this.recordFailure();
                    const errorMsg = errorData?.error?.message || 'Service unavailable';
                    if (errorMsg.includes('overloaded')) {
                        throw new Error('AI service is currently overloaded. Please try again in a few moments.');
                    } else {
                        throw new Error('AI service is temporarily unavailable. Please try again later.');
                    }
                } else {
                    this.recordFailure();
                    throw new Error(`API error: ${status} - ${errorData?.error?.message || 'Unknown error'}`);
                }
            } else if (error.code === 'ECONNABORTED') {
                this.recordFailure();
                throw new Error('Request timeout. Please try again.');
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                this.recordFailure();
                throw new Error('Network error. Please check your internet connection.');
            } else {
                this.recordFailure();
                throw new Error(`Unexpected error: ${error.message}`);
            }
        }
    }

    // Chat functionality
    async chat(message) {
        try {
            console.log('[GeminiService] Starting chat request with message:', message.substring(0, 100) + '...');
            const prompt = promptTemplates.chat(message);
            console.log('[GeminiService] Generated prompt length:', prompt.length);
            const response = await this.generateGeminiResponse(prompt);
            console.log('[GeminiService] Successfully generated chat response');
            return response;
        } catch (error) {
            console.error('[GeminiService] Chat error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response?.data,
                status: error.response?.status
            });
            // Return more specific error information for debugging
            throw new Error(`Chat failed: ${error.message}`);
        } 
    }

    // Multi-Capable Assistant (MCP) - Process user intent for action detection
    async processUserIntent(message, userProfile = {}) {
        try {
            console.log('[GeminiService] Processing user intent for:', message.substring(0, 100) + '...');

            // Build action detection prompt
            const prompt = this.buildActionDetectionPrompt(message, userProfile);

            const response = await this.generateGeminiResponse(prompt);
            console.log('[GeminiService] Raw AI response:', response);

            // Try to parse structured response
            try {
                // First try direct JSON parsing
                let structuredResponse;
                try {
                    structuredResponse = JSON.parse(response);
                } catch (directParseError) {
                    // If direct parsing fails, try to extract JSON from the response
                    const jsonMatch = response.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        structuredResponse = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                }
                
                console.log('[GeminiService] Detected action:', structuredResponse.action);
                return structuredResponse;
            } catch (parseError) {
                console.log('[GeminiService] JSON parsing failed:', parseError.message);
                console.log('[GeminiService] Raw response that failed to parse:', response);
                // If not structured, treat as regular chat
                console.log('[GeminiService] No structured action detected, treating as chat');
                return {
                    action: 'chat',
                    response: response,
                    confidence: 'low'
                };
            }
        } catch (error) {
            console.error('[GeminiService] Error processing user intent:', error);

            // Return fallback for intent processing errors
            if (error.message.includes('quota') || error.message.includes('billing')) {
                return {
                    action: 'chat',
                    response: this.getFallbackResponse(),
                    confidence: 'fallback'
                };
            }

            throw error;
        }
    }

    // Build action detection prompt for MCP
    buildActionDetectionPrompt(message, userProfile = {}) {
        const userName = userProfile.name || 'User';
        const userLevel = userProfile.level || 1;

        return `You are an intelligent assistant that can detect user intentions and trigger specific actions.

User Profile:
- Name: ${userName}
- Level: ${userLevel}
- Learning Style: ${userProfile.responseStyle || 'detailed'}

Available Actions:
1. "create_note" - Create a new note
2. "create_quiz" - Create a quiz on a topic
3. "create_flashcards" - Create flashcards from content
4. "analyze_video" - Analyze a YouTube video
5. "process_document" - Process uploaded document
6. "explain_concept" - Explain a concept or topic
7. "chat" - Regular conversation

User Message: "${message}"

Analyze the user's message and determine if they want to perform a specific action. If so, respond with a JSON object containing:
{
  "action": "action_name",
  "confidence": "high|medium|low",
  "parameters": {
    // relevant parameters for the action
  },
  "response": "Brief confirmation message"
}

If no specific action is detected, respond with:
{
  "action": "chat",
  "confidence": "low",
  "response": "Your conversational response here"
}

Examples:
- "Create a note about microservices" → {"action": "create_note", "confidence": "high", "parameters": {"title": "Introduction to Microservices", "content": "Microservices is a software architecture pattern where applications are built as a collection of small, independent services...", "subject": "Software Engineering", "tags": ["architecture", "microservices", "software-engineering"]}, "response": "I'll create a comprehensive note about microservices for you!"}
- "Create a quiz on algebra" → {"action": "create_quiz", "confidence": "high", "parameters": {"topic": "algebra", "subject": "math"}, "response": "I'll create an algebra quiz for you!"}
- "Make flashcards from my biology notes" → {"action": "create_flashcards", "confidence": "high", "parameters": {"source": "biology notes"}, "response": "I'll create flashcards from your biology notes!"}
- "Explain photosynthesis" → {"action": "explain_concept", "confidence": "high", "parameters": {"concept": "photosynthesis", "subject": "biology"}, "response": "I'll explain photosynthesis for you!"}
- "What's the weather like?" → {"action": "chat", "confidence": "low", "response": "I'm focused on helping with your studies. Is there something academic I can help you with?"}

For create_note actions, always generate comprehensive, educational content in the parameters.content field.
For create_quiz actions, include topic, subject, difficulty level, and question count.
For create_flashcards actions, specify the source material and subject.

IMPORTANT: Respond with ONLY a valid JSON object. Do not include any text before or after the JSON. The response must be parseable by JSON.parse().

User message: "${message}"`;
    }

    // Note enhancement
    async enhanceNote(noteContent) {
        try {
            if (!noteContent || noteContent.trim().length === 0) {
                throw new Error('Note content is required for enhancement');
            }
            
            const prompt = promptTemplates.enhanceNote(noteContent);
            return await this.generateGeminiResponse(prompt);
        } catch (error) {
            console.error('[GeminiService] Note enhancement error:', error.message);
            throw new Error('Failed to enhance note. Please try again.');
        }
    }

    // Note summarization
    async summarizeNote(noteContent) {
        try {
            if (!noteContent || noteContent.trim().length === 0) {
                throw new Error('Note content is required for summarization');
            }
            
            const prompt = promptTemplates.summarizeNote(noteContent);
            return await this.generateGeminiResponse(prompt);
        } catch (error) {
            console.error('[GeminiService] Note summarization error:', error.message);
            throw new Error('Failed to summarize note. Please try again.');
        }
    }

    // Generate study questions
    async generateStudyQuestions(noteContent) {
        try {
            if (!noteContent || noteContent.trim().length === 0) {
                throw new Error('Note content is required for question generation');
            }
            
            const prompt = promptTemplates.generateQuestions(noteContent);
            return await this.generateGeminiResponse(prompt);
        } catch (error) {
            console.error('[GeminiService] Question generation error:', error.message);
            throw new Error('Failed to generate study questions. Please try again.');
        }
    }

    // Analyze video content
    async analyzeVideo(videoTitle, videoDescription, transcript) {
        try {
            if (!videoTitle && !videoDescription && !transcript) {
                throw new Error('At least one of video title, description, or transcript is required');
            }
            
            const prompt = promptTemplates.analyzeVideo(
                videoTitle || 'No title provided',
                videoDescription || 'No description provided',
                transcript || 'No transcript provided'
            );
            return await this.generateGeminiResponse(prompt);
        } catch (error) {
            console.error('[GeminiService] Video analysis error:', error.message);
            throw new Error('Failed to analyze video content. Please try again.');
        }
    }

    // Analyze transcript from AssemblyAI
    async analyzeTranscript(transcript, videoTitle = '', videoUrl = '') {
        try {
            if (!transcript || typeof transcript !== 'string' || transcript.trim().length === 0) {
                throw new Error('Transcript content is required for analysis');
            }

            console.log(`[GeminiService] Analyzing transcript: ${transcript.length} characters`);

            const prompt = promptTemplates.analyzeTranscript(transcript, videoTitle, videoUrl);
            const analysis = await this.generateGeminiResponse(prompt);

            console.log(`[GeminiService] Transcript analysis completed: ${analysis.length} characters`);
            return analysis;

        } catch (error) {
            console.error('[GeminiService] Transcript analysis error:', error.message);
            throw new Error('Failed to analyze transcript. Please try again.');
        }
    }

    // Process YouTube video with AssemblyAI integration
    async processYouTubeWithTranscript(youtubeUrl, transcriptData) {
        try {
            console.log(`[GeminiService] Processing YouTube video with transcript: ${youtubeUrl}`);

            const videoTitle = transcriptData.videoInfo?.title || 'YouTube Video';
            const transcript = transcriptData.transcription?.text || '';

            if (!transcript) {
                throw new Error('No transcript available for analysis');
            }

            // Analyze the transcript with Gemini
            const analysis = await this.analyzeTranscript(transcript, videoTitle, youtubeUrl);

            return {
                success: true,
                videoInfo: transcriptData.videoInfo,
                transcription: transcriptData.transcription,
                analysis: analysis,
                processingTime: new Date().toISOString()
            };

        } catch (error) {
            console.error('[GeminiService] YouTube processing error:', error.message);
            throw new Error('Failed to process YouTube video with transcript. Please try again.');
        }
    }

    // Process audio file with AssemblyAI integration
    async processAudioWithTranscript(audioData) {
        try {
            console.log(`[GeminiService] Processing audio with transcript`);

            const fileName = audioData.fileInfo?.name || 'Audio File';
            const transcript = audioData.transcription?.text || '';

            if (!transcript) {
                throw new Error('No transcript available for analysis');
            }

            // Analyze the transcript with Gemini
            const analysis = await this.analyzeTranscript(transcript, fileName);

            return {
                success: true,
                fileInfo: audioData.fileInfo,
                transcription: audioData.transcription,
                analysis: analysis,
                processingTime: new Date().toISOString()
            };

        } catch (error) {
            console.error('[GeminiService] Audio processing error:', error.message);
            throw new Error('Failed to process audio with transcript. Please try again.');
        }
    }

    // Create flashcards
    async createFlashcards(noteContent) {
        try {
            if (!noteContent || noteContent.trim().length === 0) {
                throw new Error('Note content is required for flashcard creation');
            }
            
            const prompt = promptTemplates.createFlashcards(noteContent);
            return await this.generateGeminiResponse(prompt);
        } catch (error) {
            console.error('[GeminiService] Flashcard creation error:', error.message);
            throw new Error('Failed to create flashcards. Please try again.');
        }
    }

    // Explain concept
    async explainConcept(concept, context = '') {
        try {
            if (!concept || concept.trim().length === 0) {
                throw new Error('Concept is required for explanation');
            }
            
            const prompt = promptTemplates.explainConcept(concept, context);
            return await this.generateGeminiResponse(prompt);
        } catch (error) {
            console.error('[GeminiService] Concept explanation error:', error.message);
            throw new Error('Failed to explain concept. Please try again.');
        }
    }

    // Generate quiz
    async generateQuiz(topic, difficulty = 'medium', questionCount = 5) {
        try {
            if (!topic || topic.trim().length === 0) {
                throw new Error('Topic is required for quiz generation');
            }
            
            const prompt = promptTemplates.generateQuiz(topic, difficulty, questionCount);
            return await this.generateGeminiResponse(prompt);
        } catch (error) {
            console.error('[GeminiService] Quiz generation error:', error.message);
            throw new Error('Failed to generate quiz. Please try again.');
        }
    }

    // Process document content
    async processDocument(documentText, fileName) {
        try {
            if (!documentText || documentText.trim().length === 0) {
                throw new Error('Document text is required for processing');
            }

            const prompt = promptTemplates.processDocument(documentText, fileName);
            return await this.generateGeminiResponse(prompt);
        } catch (error) {
            console.error('[GeminiService] Document processing error:', error.message);
            throw new Error('Failed to process document. Please try again.');
        }
    }

    // Generate quiz from note content
    async generateQuizFromNote(noteContent, options = {}) {
        try {
            if (!noteContent || noteContent.trim().length === 0) {
                throw new Error('Note content is required for quiz generation');
            }

            const {
                questionCount = 5,
                difficulty = 'medium',
                title = 'Generated Quiz'
            } = options;

            const prompt = promptTemplates.generateQuizFromNote(noteContent, {
                questionCount,
                difficulty,
                title
            });

            const response = await this.generateGeminiResponse(prompt);

            // Clean markdown formatting before parsing JSON
            let cleanText = response.trim();
            
            // Remove triple backticks and "json" marker if present
            if (cleanText.includes('```json')) {
                cleanText = cleanText.replace(/```json\s*([\s\S]*?)\s*```/g, '$1').trim();
            } else if (cleanText.includes('```')) {
                cleanText = cleanText.replace(/```\s*([\s\S]*?)\s*```/g, '$1').trim();
            }

            // Try to parse JSON response
            try {
                const quizData = JSON.parse(cleanText);
                
                // Validate the structure
                if (!quizData.questions || !Array.isArray(quizData.questions)) {
                    throw new Error('Invalid quiz structure: missing questions array');
                }
                
                // Validate each question has required fields
                for (const question of quizData.questions) {
                    if (!question.question || !question.correctAnswer) {
                        throw new Error('Invalid question structure: missing required fields');
                    }
                }
                
                return quizData;
            } catch (parseError) {
                console.error('[GeminiService] Failed to parse quiz JSON:', parseError);
                console.error('[GeminiService] Raw response:', response);
                console.error('[GeminiService] Cleaned text:', cleanText);
                
                // Return a fallback structure
                return {
                    title: title,
                    description: `AI-generated quiz from note content`,
                    questions: [{
                        question: "What is the main topic of this note?",
                        options: ["Topic A", "Topic B", "Topic C", "Topic D"],
                        correctAnswer: 0,
                        explanation: "Based on the note content analysis."
                    }]
                };
            }
        } catch (error) {
            console.error('[GeminiService] Quiz from note generation error:', error.message);
            throw new Error('Failed to generate quiz from note. Please try again.');
        }
    }

    // Generate flashcards from note content
    async generateFlashcardsFromNote(noteContent, options = {}) {
        try {
            if (!noteContent || noteContent.trim().length === 0) {
                throw new Error('Note content is required for flashcard generation');
            }

            const {
                cardCount = 10,
                title = 'Generated Flashcards',
                category = 'General'
            } = options;

            const prompt = promptTemplates.generateFlashcardsFromNote(noteContent, {
                cardCount,
                title,
                category
            });

            const response = await this.generateGeminiResponse(prompt);

            // Clean markdown formatting before parsing JSON
            let cleanText = response.trim();
            
            // Remove triple backticks and "json" marker if present
            if (cleanText.includes('```json')) {
                cleanText = cleanText.replace(/```json\s*([\s\S]*?)\s*```/g, '$1').trim();
            } else if (cleanText.includes('```')) {
                cleanText = cleanText.replace(/```\s*([\s\S]*?)\s*```/g, '$1').trim();
            }

            // Try to parse JSON response
            try {
                const flashcardData = JSON.parse(cleanText);
                
                // Validate the structure
                if (!flashcardData.cards || !Array.isArray(flashcardData.cards)) {
                    throw new Error('Invalid flashcard structure: missing cards array');
                }
                
                // Validate each card has required fields
                for (const card of flashcardData.cards) {
                    if (!card.front || !card.back) {
                        throw new Error('Invalid card structure: missing front or back');
                    }
                }
                
                return flashcardData;
            } catch (parseError) {
                console.error('[GeminiService] Failed to parse flashcard JSON:', parseError);
                console.error('[GeminiService] Raw response:', response);
                console.error('[GeminiService] Cleaned text:', cleanText);
                
                // Return a fallback structure
                return {
                    title: title,
                    description: `AI-generated flashcards from note content`,
                    cards: [{
                        front: "What is the main concept in this note?",
                        back: "The main concept is based on the note content.",
                        difficulty: "medium",
                        tags: [category]
                    }]
                };
            }
        } catch (error) {
            console.error('[GeminiService] Flashcards from note generation error:', error.message);
            throw new Error('Failed to generate flashcards from note. Please try again.');
        }
    }

    // Health check
    async healthCheck() {
        try {
            const testPrompt = "health check test";
            const response = await this.generateGeminiResponse(testPrompt);

            // Check if response is a fallback (indicates quota issues)
            if (response.includes('quota') || response.includes('API limit')) {
                return {
                    status: 'degraded',
                    message: 'AI service is operational but quota limited',
                    response: response,
                    requestCount: this.requestCount,
                    quotaLimited: true
                };
            }

            return {
                status: 'healthy',
                message: 'AI service is fully operational',
                response: response,
                requestCount: this.requestCount
            };
        } catch (error) {
            // Determine status based on error type
            let status = 'unhealthy';
            let message = error.message;

            if (error.message.includes('quota') || error.message.includes('billing')) {
                status = 'degraded';
                message = 'AI service quota exceeded - using fallback responses';
            } else if (error.message.includes('overloaded')) {
                status = 'degraded';
                message = 'AI service is temporarily overloaded but should recover shortly';
            } else if (error.message.includes('Rate limit')) {
                status = 'degraded';
                message = 'AI service is rate limited but operational';
            } else if (error.message.includes('Network error') || error.message.includes('timeout')) {
                status = 'degraded';
                message = 'AI service has connectivity issues';
            } else if (error.message.includes('temporarily unavailable')) {
                status = 'degraded';
                message = 'AI service is temporarily unavailable due to repeated failures';
            }

            return {
                status: status,
                message: message,
                requestCount: this.requestCount,
                error: error.message
            };
        }
    }
}

// Create singleton instance
const geminiService = new GeminiService();

// Export functions for use in other modules
module.exports = {
    generateGeminiResponse: geminiService.generateGeminiResponse.bind(geminiService),
    enhanceNote: geminiService.enhanceNote.bind(geminiService),
    generateStudyQuestions: geminiService.generateStudyQuestions.bind(geminiService),
    summarizeNote: geminiService.summarizeNote.bind(geminiService),
    chatWithAI: geminiService.chat.bind(geminiService),
    processUserIntent: geminiService.processUserIntent.bind(geminiService), // MCP functionality
    analyzeVideo: geminiService.analyzeVideo.bind(geminiService),
    analyzeTranscript: geminiService.analyzeTranscript.bind(geminiService),
    processYouTubeWithTranscript: geminiService.processYouTubeWithTranscript.bind(geminiService),
    processAudioWithTranscript: geminiService.processAudioWithTranscript.bind(geminiService),
    createFlashcards: geminiService.createFlashcards.bind(geminiService),
    generateQuizFromNote: geminiService.generateQuizFromNote.bind(geminiService),
    generateFlashcardsFromNote: geminiService.generateFlashcardsFromNote.bind(geminiService),
    processDocument: geminiService.processDocument.bind(geminiService),
    healthCheck: geminiService.healthCheck.bind(geminiService)
};
