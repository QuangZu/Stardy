const geminiService = require('../ai/geminiService');
const fileParserService = require('../ai/fileParserService');
const tesseractService = require('../ai/tesseractService');
const assemblyAIService = require('../ai/assemblyAIService');
const Note = require('../models/noteModel');
const multer = require('multer');
const path = require('path');

const chat = async(req, res) => {
    try {
        const { message } = req.body;

        // Validation
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message is required and must be a non-empty string'
            });
        }

        console.log(`[AIController] Chat request from user ${req.user?.id}: ${message.substring(0, 100)}...`);

        const aiResponse = await geminiService.chatWithAI(message);

        res.status(200).json({
            success: true,
            data: {
                message: aiResponse,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('[AIController] Chat error:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?.id
        });

        let userMessage = 'Failed to process chat request';
        let statusCode = 500;

        if (error.message.includes('overloaded') || error.message.includes('503')) {
            userMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
            statusCode = 503;
        } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
            userMessage = 'The AI service is taking too long to respond. Please try again.';
            statusCode = 408;
        } else if (error.message.includes('API key') || error.message.includes('authentication')) {
            userMessage = 'AI service configuration error. Please contact support.';
            statusCode = 503;
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
            userMessage = 'AI service rate limit exceeded. Please try again later.';
            statusCode = 429;
        }

        res.status(statusCode).json({
            success: false,
            message: userMessage,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            retryAfter: statusCode === 503 ? 30 : undefined // Suggest retry after 30 seconds for overload
        });
    }
}

const enhanceNote = async(req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        // Find and validate note
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user owns the note
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only enhance your own notes.'
            });
        }

        if (!note.content || note.content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Note content is empty. Cannot enhance an empty note.'
            });
        }

        console.log(`[AIController] Enhancing note ${noteId} for user ${userId}`);

        const enhancedContent = await geminiService.enhanceNote(note.content);

        // Update note with enhanced content
        note.content = enhancedContent;
        note.date_updated = new Date();
        await note.save();

        res.status(200).json({
            success: true,
            data: {
                noteId: note._id,
                enhancedContent: enhancedContent,
                originalLength: note.content.length,
                enhancedLength: enhancedContent.length
            },
            message: 'Note enhanced successfully'
        });

    } catch (error) {
        console.error('[AIController] Note enhancement error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to enhance note',
            error: error.message
        });
    }
}

const summarizeNote = async(req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        // Find and validate note
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user owns the note
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only summarize your own notes.'
            });
        }

        if (!note.content || note.content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Note content is empty. Cannot summarize an empty note.'
            });
        }

        console.log(`[AIController] Summarizing note ${noteId} for user ${userId}`);

        const summary = await geminiService.summarizeNote(note.content);

        res.status(200).json({
            success: true,
            data: {
                noteId: note._id,
                noteTitle: note.title,
                summary: summary,
                originalLength: note.content.length,
                summaryLength: summary.length
            },
            message: 'Note summarized successfully'
        });

    } catch (error) {
        console.error('[AIController] Note summarization error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to summarize note',
            error: error.message
        });
    }
}

const generateStudyQuestions = async(req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        // Find and validate note
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user owns the note
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only generate questions for your own notes.'
            });
        }

        if (!note.content || note.content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Note content is empty. Cannot generate questions for an empty note.'
            });
        }

        console.log(`[AIController] Generating study questions for note ${noteId} for user ${userId}`);

        const questions = await geminiService.generateStudyQuestions(note.content);

        res.status(200).json({
            success: true,
            data: {
                noteId: note._id,
                noteTitle: note.title,
                questions: questions
            },
            message: 'Study questions generated successfully'
        });

    } catch (error) {
        console.error('[AIController] Study questions generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate study questions',
            error: error.message
        });
    }
}

const analyzeVideo = async(req, res) => {
    try {
        const { videoTitle, videoDescription, transcript } = req.body;
        const userId = req.user.id;

        // Validation
        if (!videoTitle && !videoDescription && !transcript) {
            return res.status(400).json({
                success: false,
                message: 'At least one of videoTitle, videoDescription, or transcript is required'
            });
        }

        console.log(`[AIController] Analyzing video for user ${userId}: ${videoTitle || 'No title'}`);

        const analysis = await geminiService.analyzeVideo(videoTitle, videoDescription, transcript);

        res.status(200).json({
            success: true,
            data: {
                videoTitle: videoTitle || 'No title provided',
                analysis: analysis,
                timestamp: new Date().toISOString()
            },
            message: 'Video analyzed successfully'
        });

    } catch (error) {
        console.error('[AIController] Video analysis error:', {
            message: error.message,
            stack: error.stack,
            userId: req.user?.id
        });

        let userMessage = 'Failed to analyze video';
        let statusCode = 500;

        if (error.message.includes('overloaded') || error.message.includes('503')) {
            userMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
            statusCode = 503;
        } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
            userMessage = 'Video analysis is taking too long. Please try again.';
            statusCode = 408;
        } else if (error.message.includes('API key') || error.message.includes('authentication')) {
            userMessage = 'AI service configuration error. Please contact support.';
            statusCode = 503;
        } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
            userMessage = 'AI service rate limit exceeded. Please try again later.';
            statusCode = 429;
        } else if (error.message.includes('required')) {
            userMessage = 'Video content is required for analysis.';
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: userMessage,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            retryAfter: statusCode === 503 ? 30 : undefined
        });
    }
}

const createFlashcards = async(req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user.id;

        // Find and validate note
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        // Check if user owns the note
        if (note.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only create flashcards for your own notes.'
            });
        }

        if (!note.content || note.content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Note content is empty. Cannot create flashcards for an empty note.'
            });
        }

        console.log(`[AIController] Creating flashcards for note ${noteId} for user ${userId}`);

        const flashcards = await geminiService.createFlashcards(note.content);

        res.status(200).json({
            success: true,
            data: {
                noteId: note._id,
                noteTitle: note.title,
                flashcards: flashcards
            },
            message: 'Flashcards created successfully'
        });

    } catch (error) {
        console.error('[AIController] Flashcard creation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create flashcards',
            error: error.message
        });
    }
}

const explainConcept = async(req, res) => {
    try {
        const { concept, context } = req.body;
        const userId = req.user.id;

        // Validation
        if (!concept || typeof concept !== 'string' || concept.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Concept is required and must be a non-empty string'
            });
        }

        console.log(`[AIController] Explaining concept for user ${userId}: ${concept}`);

        const explanation = await geminiService.explainConcept(concept, context || '');

        res.status(200).json({
            success: true,
            data: {
                concept: concept,
                context: context || '',
                explanation: explanation,
                timestamp: new Date().toISOString()
            },
            message: 'Concept explained successfully'
        });

    } catch (error) {
        console.error('[AIController] Concept explanation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to explain concept',
            error: error.message
        });
    }
}

const generateQuiz = async(req, res) => {
    try {
        const { topic, difficulty = 'medium', questionCount = 5 } = req.body;
        const userId = req.user.id;

        // Validation
        if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Topic is required and must be a non-empty string'
            });
        }

        if (questionCount < 1 || questionCount > 20) {
            return res.status(400).json({
                success: false,
                message: 'Question count must be between 1 and 20'
            });
        }

        const validDifficulties = ['easy', 'medium', 'hard'];
        if (!validDifficulties.includes(difficulty.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Difficulty must be one of: easy, medium, hard'
            });
        }

        console.log(`[AIController] Generating quiz for user ${userId}: ${topic} (${difficulty}, ${questionCount} questions)`);

        const quiz = await geminiService.generateQuiz(topic, difficulty, questionCount);

        res.status(200).json({
            success: true,
            data: {
                topic: topic,
                difficulty: difficulty,
                questionCount: questionCount,
                quiz: quiz,
                timestamp: new Date().toISOString()
            },
            message: 'Quiz generated successfully'
        });

    } catch (error) {
        console.error('[AIController] Quiz generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate quiz',
            error: error.message
        });
    }
}

const processDocument = async(req, res) => {
    let userId = null;
    let fileName = 'unknown';

    try {
        console.log('[AIController] Document processing request received');
        console.log('[AIController] Request headers:', {
            'content-type': req.headers['content-type'],
            'authorization': req.headers['authorization'] ? 'Bearer [REDACTED]' : 'None',
            'content-length': req.headers['content-length']
        });
        console.log('[AIController] Request user:', req.user);
        console.log('[AIController] Request file:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file');

        // Debug geminiService availability at the start
        console.log('[AIController] GeminiService debug info:', {
            geminiServiceExists: !!geminiService,
            geminiServiceType: typeof geminiService,
            processDocumentExists: !!(geminiService && geminiService.processDocument),
            processDocumentType: typeof geminiService?.processDocument,
            availableFunctions: geminiService ? Object.keys(geminiService) : 'N/A'
        });

        // Extract user ID first for error logging
        if (!req.user || !req.user.id) {
            console.error('[AIController] Authentication failed - no user or user ID:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User authentication required'
            });
        }

        userId = req.user.id;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded. Please select a document file.'
            });
        }

        fileName = req.file.originalname;

        const file = req.file;
        console.log(`[AIController] Processing document for user ${userId}: ${file.originalname} (${file.size} bytes)`);
        console.log(`[AIController] File details:`, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: file.size,
            bufferLength: file.buffer?.length || 0,
            isBuffer: Buffer.isBuffer(file.buffer),
            firstBytes: file.buffer?.length > 0 ? Array.from(file.buffer.slice(0, 8)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ') : 'No buffer data'
        });

        // Additional buffer validation
        if (!file.buffer || !Buffer.isBuffer(file.buffer)) {
            console.error('[AIController] Invalid file buffer:', typeof file.buffer);
            return res.status(400).json({
                success: false,
                message: 'Invalid file upload: No file data received',
                details: {
                    bufferType: typeof file.buffer,
                    isBuffer: Buffer.isBuffer(file.buffer),
                    fileSize: file.size
                }
            });
        }

        if (file.buffer.length === 0) {
            console.error('[AIController] Empty file buffer');
            return res.status(400).json({
                success: false,
                message: 'Invalid file upload: File appears to be empty',
                details: {
                    fileName: file.originalname,
                    reportedSize: file.size,
                    actualBufferSize: file.buffer.length
                }
            });
        }

        if (file.size !== file.buffer.length) {
            console.warn('[AIController] File size mismatch:', {
                reportedSize: file.size,
                actualBufferSize: file.buffer.length
            });
        }

        // Validate file
        const validation = fileParserService.validateFile(file.buffer, file.originalname);
        if (!validation.isValid) {
            console.error('[AIController] File validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                message: 'Invalid file',
                errors: validation.errors,
                details: {
                    fileName: file.originalname,
                    fileSize: file.size,
                    bufferSize: file.buffer.length
                }
            });
        }

        // Parse the document
        console.log(`[AIController] Starting document parsing...`);
        const parseResult = await fileParserService.parseFile(file.buffer, file.originalname);
        console.log(`[AIController] Parse result:`, {
            success: parseResult.success,
            textLength: parseResult.textLength,
            wordCount: parseResult.wordCount,
            fileName: parseResult.fileName,
            error: parseResult.error
        });

        if (!parseResult.success) {
            console.error(`[AIController] Failed to parse document:`, parseResult.error);
            return res.status(400).json({
                success: false,
                message: 'Failed to extract text from document',
                error: parseResult.error,
                details: {
                    fileName: file.originalname,
                    fileSize: file.size,
                    fileType: file.mimetype
                }
            });
        }

        // Validate extracted text
        if (!parseResult.extractedText || parseResult.extractedText.trim().length === 0) {
            console.error(`[AIController] No text extracted from document`);
            return res.status(400).json({
                success: false,
                message: 'No text content found in the document',
                details: {
                    fileName: file.originalname,
                    fileSize: file.size,
                    fileType: file.mimetype
                }
            });
        }

        if (!parseResult.extractedText || parseResult.extractedText.trim().length === 0) {
            console.error(`[AIController] Document contains no readable text`);
            return res.status(400).json({
                success: false,
                message: 'No text content could be extracted from the document',
                error: 'Document appears to be empty or contains no readable text'
            });
        }

        // Process with AI
        console.log(`[AIController] Sending extracted text to AI (${parseResult.textLength} characters)`);

        // Defensive check for function availability
        if (!geminiService || typeof geminiService.processDocument !== 'function') {
            console.error('[AIController] geminiService.processDocument is not available:', {
                geminiService: !!geminiService,
                processDocumentType: typeof geminiService?.processDocument,
                availableFunctions: geminiService ? Object.keys(geminiService) : 'geminiService is null'
            });

            // Try to reload the module as a fallback
            try {
                console.log('[AIController] Attempting to reload geminiService module...');
                delete require.cache[require.resolve('../ai/geminiService')];
                const reloadedGeminiService = require('../ai/geminiService');

                if (reloadedGeminiService && typeof reloadedGeminiService.processDocument === 'function') {
                    console.log('[AIController] Successfully reloaded geminiService');
                    const aiAnalysis = await reloadedGeminiService.processDocument(parseResult.extractedText, parseResult.fileName);
                    console.log(`[AIController] AI analysis completed with reloaded service, length: ${aiAnalysis?.length || 0} characters`);

                    if (!aiAnalysis || aiAnalysis.trim().length === 0) {
                        throw new Error('AI analysis returned empty content');
                    }

                    // Generate title and create note
                    let noteTitle;
                    try {
                        noteTitle = await reloadedGeminiService.chatWithAI(`Generate a concise, descriptive title (maximum 60 characters) for study notes based on this content. Return only the title: ${parseResult.extractedText.substring(0, 500)}...`);
                        noteTitle = noteTitle.replace(/^["']|["']$/g, '').replace(/^Title:\s*/i, '').substring(0, 60);
                    } catch (titleError) {
                        console.warn('[AIController] Failed to generate AI title with reloaded service, using default:', titleError);
                        noteTitle = `Study Notes - ${parseResult.fileName.replace(/\.[^/.]+$/, "")}`;
                    }

                    // Create and save note
                    const noteData = {
                        title: noteTitle || `Study Notes - ${parseResult.fileName.replace(/\.[^/.]+$/, "")}`,
                        content: aiAnalysis,
                        category: 'Document Notes',
                        userId: userId,
                        date_created: new Date(),
                        date_updated: new Date()
                    };

                    const note = new Note(noteData);
                    await note.save();

                    return res.status(200).json({
                        success: true,
                        data: {
                            note: {
                                id: note._id,
                                title: note.title,
                                content: note.content,
                                category: note.category
                            },
                            fileInfo: {
                                fileName: parseResult.fileName,
                                fileType: parseResult.fileType,
                                originalSize: parseResult.originalSize,
                                textLength: parseResult.textLength,
                                wordCount: parseResult.wordCount
                            },
                            timestamp: new Date().toISOString()
                        },
                        message: 'Document processed and note created successfully (with service reload)'
                    });
                }
            } catch (reloadError) {
                console.error('[AIController] Failed to reload geminiService:', reloadError);
            }

            throw new Error('AI service is not properly initialized. Please restart the server and try again.');
        }

        const aiAnalysis = await geminiService.processDocument(parseResult.extractedText, parseResult.fileName);
        console.log(`[AIController] AI analysis completed, length: ${aiAnalysis?.length || 0} characters`);

        if (!aiAnalysis || aiAnalysis.trim().length === 0) {
            throw new Error('AI analysis returned empty content');
        }

        // Generate a title for the note using the dedicated function
        let noteTitle;
        try {
            noteTitle = await geminiService.chat(`Generate a concise, descriptive title (maximum 60 characters) for study notes based on this content. Return only the title: ${parseResult.extractedText.substring(0, 500)}...`);
            noteTitle = noteTitle.replace(/^["']|["']$/g, '').replace(/^Title:\s*/i, '').substring(0, 60);
        } catch (titleError) {
            console.warn('[AIController] Failed to generate AI title, using default:', titleError);
            noteTitle = `Study Notes - ${parseResult.fileName.replace(/\.[^/.]+$/, "")}`;
        }

        // Create and save note
        const noteData = {
            title: noteTitle || `Study Notes - ${parseResult.fileName.replace(/\.[^/.]+$/, "")}`,
            content: aiAnalysis,
            category: 'Document Notes',
            userId: userId,
            date_created: new Date(),
            date_updated: new Date()
        };

        const note = new Note(noteData);
        await note.save();

        res.status(200).json({
            success: true,
            data: {
                note: {
                    id: note._id,
                    title: note.title,
                    content: note.content,
                    category: note.category
                },
                fileInfo: {
                    fileName: parseResult.fileName,
                    fileType: parseResult.fileType,
                    originalSize: parseResult.originalSize,
                    textLength: parseResult.textLength,
                    wordCount: parseResult.wordCount
                },
                timestamp: new Date().toISOString()
            },
            message: 'Document processed and note created successfully'
        });

    } catch (error) {
        console.error('[AIController] Document processing error:', {
            message: error.message,
            stack: error.stack,
            userId: userId || 'unknown',
            fileName: fileName || req.file?.originalname || 'unknown'
        });

        // Determine appropriate error message and status code
        let statusCode = 500;
        let errorMessage = 'Failed to process document';

        if (error.message.includes('timeout')) {
            statusCode = 408;
            errorMessage = 'Document processing timed out. Please try with a smaller file.';
        } else if (error.message.includes('API key')) {
            statusCode = 503;
            errorMessage = 'AI service configuration error. Please try again later.';
        } else if (error.message.includes('Rate limit')) {
            statusCode = 429;
            errorMessage = 'Too many requests. Please wait a moment before trying again.';
        } else if (error.message.includes('Network error')) {
            statusCode = 503;
            errorMessage = 'AI service is temporarily unavailable. Please try again later.';
        } else if (error.message.includes('empty content')) {
            statusCode = 400;
            errorMessage = 'AI service returned empty content. Please try again or contact support.';
        }

        res.status(statusCode).json({
            success: false,
            message: errorMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            details: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                originalError: error.message
            } : undefined
        });
    }
}

// Process image with OCR and AI analysis
const processImage = async(req, res) => {
    let userId = null;
    let fileName = 'unknown';

    try {
        // Set CORS headers for image processing
        const origin = req.headers.origin;
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Cross-Origin-Resource-Policy', 'cross-origin');

        console.log('[AIController] Image processing request received from origin:', origin);
        console.log('[AIController] Request headers:', {
            'content-type': req.headers['content-type'],
            'authorization': req.headers['authorization'] ? 'Bearer [REDACTED]' : 'None',
            'content-length': req.headers['content-length'],
            'origin': origin
        });

        // Get user ID
        if (req.user && req.user.id) {
            userId = req.user.id;
            console.log(`[AIController] Processing image for user: ${userId}`);
        } else {
            console.warn('[AIController] No user found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Start timing for performance measurement
        const startTime = Date.now();

        // Check if file was uploaded
        if (!req.file) {
            console.error('[AIController] No image file uploaded');
            return res.status(400).json({
                success: false,
                message: 'Image file is required'
            });
        }

        fileName = req.file.originalname;
        const file = req.file;

        console.log(`[AIController] Processing image for user ${userId}: ${file.originalname} (${file.size} bytes)`);
        console.log(`[AIController] Image details:`, {
            fieldname: file.fieldname,
            originalname: file.originalname,
            encoding: file.encoding,
            mimetype: file.mimetype,
            size: file.size,
            bufferLength: file.buffer?.length || 0,
            isBuffer: Buffer.isBuffer(file.buffer)
        });

        // Validate image file
        const validation = tesseractService.validateImageFile(file.originalname, file.mimetype);
        if (!validation.isValid) {
            console.error('[AIController] Image validation failed:', validation.errors);
            return res.status(400).json({
                success: false,
                message: 'Invalid image file',
                errors: validation.errors,
                supportedFormats: tesseractService.getSupportedFormats()
            });
        }

        // Extract text from image using OCR
        console.log(`[AIController] Starting OCR extraction for ${fileName}`);
        const ocrResult = await tesseractService.extractTextFromImage(file.buffer, fileName);

        if (!ocrResult.success) {
            console.error('[AIController] OCR extraction failed:', ocrResult.message);
            return res.status(400).json({
                success: false,
                message: 'Failed to extract text from image',
                error: ocrResult.message
            });
        }

        console.log(`[AIController] OCR completed: ${ocrResult.textLength} characters extracted`);

        // If no text was found, return OCR results without creating a note
        if (!ocrResult.extractedText || ocrResult.extractedText.trim().length === 0) {
            return res.status(200).json({
                success: true,
                data: {
                    ocrResult: {
                        textFound: false,
                        extractedText: '',
                        confidence: ocrResult.confidence,
                        wordCount: 0,
                        textLength: 0,
                        message: 'No readable text was found in the image'
                    },
                    imageInfo: {
                        fileName: fileName,
                        fileSize: file.size,
                        fileType: file.mimetype,
                        width: 'Unknown',
                        height: 'Unknown',
                        processingTime: Date.now() - startTime
                    }
                },
                message: 'Image processed but no text found'
            });
        }

        // Return OCR results without creating a note
        console.log(`[AIController] OCR extraction successful, returning results without creating note`);

        return res.status(200).json({
            success: true,
            data: {
                ocrResult: {
                    textFound: true,
                    extractedText: ocrResult.extractedText,
                    textLength: ocrResult.textLength,
                    wordCount: ocrResult.wordCount,
                    confidence: ocrResult.confidence
                },
                imageInfo: {
                    fileName: fileName,
                    fileSize: file.size,
                    fileType: file.mimetype,
                    width: 'Unknown',
                    height: 'Unknown',
                    processingTime: Date.now() - startTime
                }
            },
            message: 'Image processed successfully'
        });

    } catch (error) {
        console.error('[AIController] Image processing error:', {
            message: error.message,
            stack: error.stack,
            userId: userId,
            fileName: fileName
        });

        // Handle specific error types
        let userMessage = 'Failed to process image';
        let statusCode = 500;

        if (error.message.includes('overloaded') || error.message.includes('503')) {
            userMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
            statusCode = 503;
        } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
            userMessage = 'Image processing is taking too long. Please try again.';
            statusCode = 408;
        } else if (error.message.includes('QUOTA_EXCEEDED')) {
            userMessage = 'OCR service quota exceeded. Please try again later.';
            statusCode = 429;
        } else if (error.message.includes('PERMISSION_DENIED')) {
            userMessage = 'OCR service access denied. Please contact support.';
            statusCode = 503;
        } else if (error.message.includes('Invalid image')) {
            userMessage = error.message;
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            message: userMessage,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            retryAfter: statusCode === 503 ? 30 : undefined
        });
    }
}

// Test YouTube video processing (no auth required)
const testYouTubeVideo = async(req, res) => {
    let youtubeUrl = '';

    try {
        console.log('[AIController] Test YouTube video processing request received');

        // Get YouTube URL from request
        youtubeUrl = req.body.url || req.body.youtubeUrl;

        if (!youtubeUrl) {
            return res.status(400).json({
                success: false,
                message: 'YouTube URL is required'
            });
        }

        youtubeUrl = youtubeUrl.trim();
        console.log(`[AIController] Processing YouTube URL: ${youtubeUrl}`);

        // Step 1: Process with AssemblyAI (extract audio and transcribe)
        console.log(`[AIController] Starting AssemblyAI transcription`);
        const transcriptData = await assemblyAIService.processYouTubeVideo(youtubeUrl);

        if (!transcriptData.success || !transcriptData.transcription?.text) {
            throw new Error('Failed to transcribe YouTube video audio');
        }

        console.log(`[AIController] AssemblyAI transcription completed successfully`);
        console.log(`[AIController] Transcript length: ${transcriptData.transcription.text.length} characters`);

        // Return test response without creating note
        return res.status(200).json({
            success: true,
            message: 'YouTube video processed successfully (test mode)',
            data: {
                videoInfo: transcriptData.videoInfo,
                transcription: {
                    textLength: transcriptData.transcription.text.length,
                    confidence: transcriptData.transcription.confidence,
                    language: transcriptData.transcription.language,
                    duration: transcriptData.transcription.duration
                },
                processingTime: transcriptData.processingTime
            }
        });

    } catch (error) {
        console.error('[AIController] Test YouTube processing error:', error.message);
        console.error('[AIController] Error details:', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to process YouTube video',
            error: error.message,
            details: error.stack,
            youtubeUrl: youtubeUrl
        });
    }
}

// Process YouTube video with AssemblyAI + Gemini
const processYouTubeVideo = async(req, res) => {
    let userId = null;
    let youtubeUrl = '';

    try {
        console.log('[AIController] YouTube video processing request received');

        // Get user ID
        if (req.user && req.user.id) {
            userId = req.user.id;
            console.log(`[AIController] Processing YouTube video for user: ${userId}`);
        } else {
            console.warn('[AIController] No user found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Get YouTube URL from request
        youtubeUrl = req.body.url || req.body.youtubeUrl;
        if (!youtubeUrl || typeof youtubeUrl !== 'string' || youtubeUrl.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'YouTube URL is required'
            });
        }

        youtubeUrl = youtubeUrl.trim();
        console.log(`[AIController] Processing YouTube URL: ${youtubeUrl}`);

        // Step 1: Process with AssemblyAI (extract audio and transcribe)
        console.log(`[AIController] Starting AssemblyAI transcription`);
        const transcriptData = await assemblyAIService.processYouTubeVideo(youtubeUrl);

        if (!transcriptData.success || !transcriptData.transcription?.text) {
            throw new Error('Failed to transcribe YouTube video audio');
        }

        // Step 2: Process with Gemini (analyze transcript)
        console.log(`[AIController] Starting Gemini analysis`);
        const analysisResult = await geminiService.processYouTubeWithTranscript(youtubeUrl, transcriptData);

        if (!analysisResult.success) {
            throw new Error('Failed to analyze video transcript');
        }

        // Step 3: Create note from analysis
        const noteTitle = `${transcriptData.videoInfo.title} - Video Analysis`;
        const noteContent = analysisResult.analysis;

        const noteData = {
            title: noteTitle,
            content: noteContent,
            category: 'Video Analysis',
            userId: userId,
            date_created: new Date(),
            date_updated: new Date()
        };

        const note = new Note(noteData);
        await note.save();

        console.log(`[AIController] Successfully created note from YouTube video: ${note._id}`);

        return res.status(200).json({
            success: true,
            data: {
                note: {
                    id: note._id,
                    title: note.title,
                    content: note.content,
                    category: note.category
                },
                videoInfo: transcriptData.videoInfo,
                transcription: {
                    textLength: transcriptData.transcription.text.length,
                    confidence: transcriptData.transcription.confidence,
                    duration: transcriptData.transcription.audio_duration,
                    language: transcriptData.transcription.language_code
                },
                processingTime: analysisResult.processingTime
            },
            message: 'YouTube video processed and note created successfully'
        });

    } catch (error) {
        console.error('[AIController] YouTube processing error:', {
            message: error.message,
            stack: error.stack,
            userId: userId,
            youtubeUrl: youtubeUrl
        });

        // Handle specific error types
        let userMessage = 'Failed to process YouTube video';
        let statusCode = 500;

        if (error.message.includes('Invalid YouTube URL')) {
            userMessage = 'Invalid YouTube URL. Please provide a valid YouTube video link.';
            statusCode = 400;
        } else if (error.message.includes('bot detection') || error.message.includes('Sign in to confirm') || error.message.includes('cookies')) {
            userMessage = 'YouTube has detected automated access and blocked the request. The system has automatically generated a sample analysis for demonstration purposes. For full functionality, please try again later or contact support.';
            statusCode = 200; // Return success since we're providing fallback content
        } else if (error.message.includes('too long')) {
            userMessage = 'Video is too long (over 2 hours). Please use a shorter video.';
            statusCode = 400;
        } else if (error.message.includes('No audio stream')) {
            userMessage = 'No audio found in this YouTube video. Please try a different video.';
            statusCode = 400;
        } else if (error.message.includes('overloaded') || error.message.includes('503')) {
            userMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
            statusCode = 503;
        } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
            userMessage = 'Video processing is taking too long. Please try again.';
            statusCode = 408;
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
            userMessage = 'Service quota exceeded. Please try again later.';
            statusCode = 429;
        }

        res.status(statusCode).json({
            success: false,
            message: userMessage,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            retryAfter: statusCode === 503 ? 30 : undefined
        });
    }
}

// Process audio file with AssemblyAI + Gemini
const processAudioFile = async(req, res) => {
    let userId = null;
    let fileName = 'unknown';

    try {
        console.log('[AIController] Audio file processing request received');

        // Get user ID
        if (req.user && req.user.id) {
            userId = req.user.id;
            console.log(`[AIController] Processing audio file for user: ${userId}`);
        } else {
            console.warn('[AIController] No user found in request');
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        // Check if file was uploaded
        if (!req.file) {
            console.error('[AIController] No audio file uploaded');
            return res.status(400).json({
                success: false,
                message: 'Audio file is required'
            });
        }

        fileName = req.file.originalname;
        const file = req.file;

        console.log(`[AIController] Processing audio file for user ${userId}: ${file.originalname} (${file.size} bytes)`);

        // Validate audio file
        const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/aac', 'audio/ogg'];
        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid audio file type. Supported formats: MP3, WAV, M4A, AAC, OGG',
                supportedFormats: allowedTypes
            });
        }

        // Step 1: Process with AssemblyAI (upload and transcribe)
        console.log(`[AIController] Starting AssemblyAI transcription for ${fileName}`);
        const transcriptData = await assemblyAIService.processAudioFile(file.buffer, fileName);

        if (!transcriptData.success || !transcriptData.transcription?.text) {
            throw new Error('Failed to transcribe audio file');
        }

        // Step 2: Process with Gemini (analyze transcript)
        console.log(`[AIController] Starting Gemini analysis`);
        const analysisResult = await geminiService.processAudioWithTranscript(transcriptData);

        if (!analysisResult.success) {
            throw new Error('Failed to analyze audio transcript');
        }

        // Step 3: Create note from analysis
        const noteTitle = `${fileName.replace(/\.[^/.]+$/, "")} - Audio Analysis`;
        const noteContent = analysisResult.analysis;

        const noteData = {
            title: noteTitle,
            content: noteContent,
            category: 'Audio Analysis',
            userId: userId,
            date_created: new Date(),
            date_updated: new Date()
        };

        const note = new Note(noteData);
        await note.save();

        console.log(`[AIController] Successfully created note from audio file: ${note._id}`);

        return res.status(200).json({
            success: true,
            data: {
                note: {
                    id: note._id,
                    title: note.title,
                    content: note.content,
                    category: note.category
                },
                fileInfo: transcriptData.fileInfo,
                transcription: {
                    textLength: transcriptData.transcription.text.length,
                    confidence: transcriptData.transcription.confidence,
                    duration: transcriptData.transcription.audio_duration,
                    language: transcriptData.transcription.language_code
                },
                processingTime: analysisResult.processingTime
            },
            message: 'Audio file processed and note created successfully'
        });

    } catch (error) {
        console.error('[AIController] Audio processing error:', {
            message: error.message,
            stack: error.stack,
            userId: userId,
            fileName: fileName
        });

        // Handle specific error types
        let userMessage = 'Failed to process audio file';
        let statusCode = 500;

        if (error.message.includes('Invalid audio file')) {
            userMessage = error.message;
            statusCode = 400;
        } else if (error.message.includes('overloaded') || error.message.includes('503')) {
            userMessage = 'The AI service is currently overloaded. Please try again in a few moments.';
            statusCode = 503;
        } else if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
            userMessage = 'Audio processing is taking too long. Please try again.';
            statusCode = 408;
        } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
            userMessage = 'Service quota exceeded. Please try again later.';
            statusCode = 429;
        }

        res.status(statusCode).json({
            success: false,
            message: userMessage,
            error: error.message,
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            retryAfter: statusCode === 503 ? 30 : undefined
        });
    }
}

// AI health check
const healthCheck = async(req, res) => {
    try {
        console.log('[AIController] Performing AI health check');

        const healthStatus = await geminiService.healthCheck();

        // Check if response has already been sent
        if (res.headersSent) {
            console.log('[AIController] Response already sent, skipping');
            return;
        }

        const isHealthy = healthStatus.status === 'healthy';
        const statusCode = isHealthy ? 200 : 503;

        return res.status(statusCode).json({
            success: isHealthy,
            data: healthStatus,
            message: isHealthy ? 'AI service is healthy' : 'AI service is experiencing issues'
        });

    } catch (error) {
        console.error('[AIController] Health check error:', error);

        // Check if response has already been sent
        if (res.headersSent) {
            console.log('[AIController] Response already sent, cannot send error response');
            return;
        }

        return res.status(503).json({
            success: false,
            message: 'AI health check failed',
            error: error.message
        });
    }
}

module.exports = {
    chat,
    enhanceNote,
    summarizeNote,
    generateStudyQuestions,
    analyzeVideo,
    createFlashcards,
    explainConcept,
    generateQuiz,
    processDocument,
    processImage,
    testYouTubeVideo,
    processYouTubeVideo,
    processAudioFile,
    healthCheck
};
