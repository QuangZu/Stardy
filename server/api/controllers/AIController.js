const { GoogleGenerativeAI } = require('@google/generative-ai');
const FileProcessingService = require('../services/FileProcessingService');
const Note = require('../models/NoteModel');

class AIController {
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }

    // Process YouTube video and create notes
    async processYouTubeVideo(req, res) {
        try {
            const { url } = req.body;
            const userId = req.user.id;            
            console.log('Processing YouTube request:', { url, userId });
            
            if (!url || typeof url !== 'string' || url.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'YouTube URL is required and must be a valid string'
                });
            }

            const trimmedUrl = url.trim();
            
            // Validate YouTube URL format
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
            if (!youtubeRegex.test(trimmedUrl)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid YouTube URL format'
                });
            }

            // Process video
            console.log('Calling FileProcessingService.processYouTubeVideo');
            const videoData = await FileProcessingService.processYouTubeVideo(trimmedUrl);
            console.log('Video data received:', !!videoData);
            
            // Create notes structure
            const notesData = FileProcessingService.createNotesStructure(videoData, 'youtube', userId);
            console.log('Notes data created:', !!notesData);
            
            // Try to enhance with AI (but don't fail if it doesn't work)
            let enhancedNotes = notesData;
            try {
                enhancedNotes = await this.enhanceNotesWithAI(notesData);
                console.log('Notes enhanced with AI');
            } catch (aiError) {
                console.warn('AI enhancement failed, using original notes:', aiError.message);
            }
            
            // Save to database
            const newNote = new Note(enhancedNotes);
            const savedNote = await newNote.save();
            console.log('Note saved to database:', savedNote._id);
            
            res.status(200).json({
                success: true,
                message: 'YouTube video processed successfully',
                note: {
                    _id: savedNote._id,
                    title: savedNote.title,
                    content: savedNote.content,
                    category: savedNote.category,
                    createdAt: savedNote.createdAt
                }
            });
        } catch (error) {
            console.error('YouTube processing error:', {
                message: error.message,
                stack: error.stack,
                url: req.body?.url
            });
            
            res.status(500).json({
                success: false,
                message: 'Failed to process YouTube video',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
    }

    // Process document and create notes
    async processDocument(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No document file uploaded'
                });
            }

            const userId = req.user.id;
            const filePath = req.file.path;
            const fileType = req.file.mimetype;
            
            let documentData;
            
            // Process based on file type
            if (fileType === 'application/pdf') {
                documentData = await FileProcessingService.processPDF(filePath);
            } else if (fileType === 'application/msword' || 
                      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                documentData = await FileProcessingService.processWordDocument(filePath);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Unsupported document type'
                });
            }
            
            // Create notes structure
            const notesData = FileProcessingService.createNotesStructure(documentData, 'document', userId);
            
            // Enhance with AI (optional)
            const enhancedNotes = await this.enhanceNotesWithAI(notesData);
            
            // Save to database
            const newNote = new Note(enhancedNotes);
            const savedNote = await newNote.save();
            
            res.status(200).json({
                success: true,
                message: 'Document processed successfully',
                note: savedNote
            });
        } catch (error) {
            console.error('Document processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process document',
                error: error.message
            });
        }
    }

    // Process audio and create notes
    async processAudio(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No audio file uploaded'
                });
            }

            const userId = req.user.id;
            const filePath = req.file.path;
            
            // Process audio
            const audioData = await FileProcessingService.processAudio(filePath);
            
            // Create notes structure
            const notesData = FileProcessingService.createNotesStructure(audioData, 'audio', userId);
            
            // Save to database
            const newNote = new Note(notesData);
            const savedNote = await newNote.save();
            
            res.status(200).json({
                success: true,
                message: 'Audio processed successfully',
                note: savedNote
            });
        } catch (error) {
            console.error('Audio processing error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to process audio',
                error: error.message
            });
        }
    }

    // Enhance notes with AI
    async enhanceNotesWithAI(notesData) {
        try {
            // Only enhance if we have content to work with
            if (notesData.content && notesData.content.length > 50) {
                const prompt = `
                Improve these study notes by:
                1. Organizing the content with clear headings
                2. Extracting key points and important concepts
                3. Adding summaries where appropriate
                4. Making the content more study-friendly
                
                Original notes:
                ${notesData.content}
                
                Please return the enhanced notes in a clear, organized format.
                `;
                
                const result = await this.model.generateContent(prompt);
                const aiResponse = result.response.text();
                
                return {
                    ...notesData,
                    content: aiResponse,
                    aiEnhanced: true
                };
            }
            
            return notesData;
        } catch (error) {
            console.error('AI enhancement error:', error);
            // Return original notes if AI enhancement fails
            return notesData;
        }
    }

    // Simple chatbot
    async chatWithAI(req, res) {
        try {
            const { message } = req.body;
            const userId = req.user.id;
            
            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }
            
            const prompt = `
            You are a helpful study assistant. Answer the following question clearly and concisely:
            ${message}
            
            Provide educational value in your response.
            `;
            
            const result = await this.model.generateContent(prompt);
            const aiResponse = result.response.text();
            
            res.status(200).json({
                success: true,
                response: aiResponse
            });
        } catch (error) {
            console.error('AI chat error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate AI response',
                error: error.message
            });
        }
    }
        // RECOMMENDATIONS (Simplified from RecommendationService)
    async getRecommendations(req, res) {
        try {
            const userId = req.user.id;
            
            // Get user data
            const user = await Account.findById(userId);
            const progress = await UserProgress.findOne({ userId });
            
            const prompt = `
            Based on this student profile, suggest 3 personalized study recommendations:
            Username: ${user.username}
            Current Level: ${user.currentLevel}
            Experience: ${user.experience}
            
            Provide recommendations in this JSON format:
            {
                "recommendations": [
                    {
                        "title": "Recommendation title",
                        "description": "Brief description",
                        "type": "study|practice|review",
                        "suggestedTime": "minutes"
                    }
                ]
            }
            `;
            
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            // Parse JSON response
            const recommendations = JSON.parse(response.match(/\{[\s\S]*\}/)[0]);
            
            res.status(200).json({
                success: true,
                ...recommendations
            });
        } catch (error) {
            console.error('Recommendations error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate recommendations',
                recommendations: {
                    recommendations: [
                        {
                            title: "Review Previous Notes",
                            description: "Go through your recent study notes",
                            type: "review",
                            suggestedTime: "30"
                        }
                    ]
                }
            });
        }
    }

    // QUESTION HELP (Simplified from EnhancedStudyAssistant)
    async getQuestionHelp(req, res) {
        try {
            const { questionId, userQuery, currentAnswer } = req.body;
            
            const prompt = `
            Help a student with this question:
            Question: ${userQuery || "Student needs help"}
            Current Answer: ${currentAnswer || "Not provided"}
            
            Provide a helpful, educational response.
            `;
            
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            res.status(200).json({
                success: true,
                response: response
            });
        } catch (error) {
            console.error('Question help error:', error);
            res.status(500).json({
                success: false,
                response: "I'm here to help! Could you provide more details about what you're struggling with?"
            });
        }
    }

    // CONCEPT EXPLANATION
    async explainConcept(req, res) {
        try {
            const { concept, subject, difficulty } = req.body;
            
            const prompt = `
            Explain this concept clearly for a student:
            Concept: ${concept}
            Subject: ${subject || "General"}
            Difficulty Level: ${difficulty || "medium"}
            
            Provide a clear, educational explanation.
            `;
            
            const result = await this.model.generateContent(prompt);
            const response = result.response.text();
            
            res.status(200).json({
                success: true,
                explanation: response
            });
        } catch (error) {
            console.error('Concept explanation error:', error);
            res.status(500).json({
                success: false,
                explanation: "I'd be happy to explain that concept! Could you provide a bit more detail about what specifically you'd like to understand?"
            });
        }
    }
}

module.exports = new AIController();