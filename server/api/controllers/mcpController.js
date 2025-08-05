const { processUserIntent } = require('../ai/geminiService');
const Note = require('../models/noteModel');
const Quiz = require('../models/quizModel');
const FlashcardSet = require('../models/flashcardModel');
const { getUserById } = require('./accountController');

const processUserMessage = async (req, res) => {
    try {
        console.log('[MCPController] === NEW REQUEST ===');
        console.log('[MCPController] Headers:', {
            authorization: req.headers.authorization ? 'Present' : 'Missing',
            contentType: req.headers['content-type']
        });
        console.log('[MCPController] Body:', req.body);
        console.log('[MCPController] User from auth:', req.user);

        const { message } = req.body;
        const userId = req.user?.id;
        
        if (!message || !message.trim()) {
            console.log('[MCPController] Error: Message is required');
            return res.status(400).json({
                success: false,
                error: 'Message is required'
            });
        }

        if (!userId) {
            console.log('[MCPController] Error: User authentication required');
            return res.status(401).json({
                success: false,
                error: 'User authentication required'
            });
        }

        console.log('[MCPController] Processing user message:', message.substring(0, 100) + '...');

        // Get user profile for context
        const userProfile = await getUserProfile(userId);

        // Process user intent with AI
        const intentResult = await processUserIntent(message, userProfile);

        console.log('[MCPController] Intent detected:', intentResult.action);

        // Execute action based on detected intent
        const actionResult = await executeAction(intentResult, userId, userProfile);

        res.json({
            success: true,
            action: intentResult.action,
            confidence: intentResult.confidence,
            message: actionResult.message,
            data: actionResult.data,
            link: actionResult.link
        });

    } catch (error) {
        console.error('[MCPController] Error processing user message:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process user message',
            details: error.message
        });
    }
};

// Execute detected action
const executeAction = async (intentResult, userId, userProfile) => {
    const { action, parameters, response } = intentResult;

    switch (action) {
        case 'create_note':
            return await createNoteAction(parameters, userId, response);
        
        case 'create_quiz':
            return await createQuizAction(parameters, userId, response);
        
        case 'create_flashcards':
            return await createFlashcardsAction(parameters, userId, response);
        
        case 'explain_concept':
            return await explainConceptAction(parameters, userId, response);
        
        case 'chat':
        default:
            return {
                message: intentResult.response || response,
                data: null,
                link: null
            };
    }
};

// Action: Create Note
const createNoteAction = async (parameters, userId, response) => {
    try {
        const { title, content, subject, tags } = parameters;

        console.log('[MCPController] Creating note with parameters:', {
            title,
            contentLength: content ? content.length : 0,
            subject,
            userId,
            tags
        });

        const noteData = {
            title: title || 'AI Generated Note',
            content: content || 'Note content will be generated...',
            subject: subject || 'General',
            tags: Array.isArray(tags) ? tags : (tags ? [tags] : ['ai-generated']),
            category: 'AI Generated',
            isPublic: false,
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const newNote = new Note(noteData);
        const savedNote = await newNote.save();

        console.log('[MCPController] Note created successfully:', {
            noteId: savedNote._id,
            title: savedNote.title
        });

        return {
            message: `📝 **Note Created Successfully!**\n\n**Title:** ${savedNote.title}\n**Subject:** ${savedNote.subject}\n\nYour note has been created and saved. Click the button below to view and edit it.`,
            data: savedNote,
            link: `/notes/${savedNote._id}`,
            actionType: 'note_created',
            actionData: {
                noteId: savedNote._id,
                title: savedNote.title
            }
        };
    } catch (error) {
        console.error('[MCPController] Error creating note:', error);
        throw new Error('Failed to create note: ' + error.message);
    }
};

const createQuizAction = async (parameters, userId, response) => {
    try {
        const { topic, subject, difficulty, questionCount } = parameters;

        const quizData = {
            title: `${topic} Quiz`,
            category: subject || 'General',
            difficulty: difficulty || 'medium',
            questions: [], // Will be populated by AI
            userId: userId
        };

        const newQuiz = new Quiz(quizData);
        const savedQuiz = await newQuiz.save();

        return {
            message: `🧠 **Quiz Created Successfully!**\n\n**Topic:** ${topic}\n**Questions:** ${savedQuiz.questions.length}\n\nYour quiz is ready! Click below to start practicing.`,
            data: savedQuiz,
            link: `/quiz/${savedQuiz._id}`,
        };
    } catch (error) {
        console.error('[MCPController] Error creating quiz:', error);
        throw new Error('Failed to create quiz');
    }
};

// For flashcard creation
const createFlashcardsAction = async (parameters, userId, response) => {
    try {
        const { topic, subject, source } = parameters;

        const flashcardData = {
            title: `${topic} Flashcards`,
            category: subject || 'General',
            cards: [], // Will be populated by AI
            userId: userId
        };

        const newFlashcard = new FlashcardSet(flashcardData);
        const savedFlashcard = await newFlashcard.save();

        return {
            message: `🃏 **Flashcards Created Successfully!**\n\n**Topic:** ${topic}\n**Cards:** ${savedFlashcard.cards.length}\n\nYour flashcards are ready for study! Click below to start reviewing.`,
            data: savedFlashcard,
            link: `/flashcards/${savedFlashcard._id}`,
        };
    } catch (error) {
        console.error('[MCPController] Error creating flashcards:', error);
        throw new Error('Failed to create flashcards');
    }
};

// Action: Explain Concept
const explainConceptAction = async (parameters, userId, response) => {
    try {
        const { concept, context } = parameters;
        
        // This would typically generate an explanation and save it as a note
        const noteData = {
            title: `Explanation: ${concept}`,
            content: response || `Explanation of ${concept} will be generated...`,
            subject: 'Explanations',
            userId: userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const newNote = new Note(noteData);
        const savedNote = await newNote.save();

        return {
            message: response || `Explanation for "${concept}" created!`,
            data: savedNote,
            link: `/notes/${savedNote._id}`
        };
    } catch (error) {
        console.error('[MCPController] Error creating explanation:', error);
        throw new Error('Failed to create explanation');
    }
};

// Get user profile for context
const getUserProfile = async (userId) => {
    try {
        const user = await getUserById(userId);
        return {
            name: user.name || 'User',
            level: user.level || 1,
            responseStyle: 'detailed',
            learningLevel: 'intermediate'
        };
    } catch (error) {
        console.error('[MCPController] Error getting user profile:', error);
        return {
            name: 'User',
            level: 1,
            responseStyle: 'detailed',
            learningLevel: 'intermediate'
        };
    }
};

module.exports = {
    processUserMessage,
    executeAction,
    createNoteAction,
    createQuizAction,
    createFlashcardsAction,
    explainConceptAction,
    getUserProfile
};
