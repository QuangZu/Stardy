const AIController = require('../controllers/aiController');
const { authenticate } = require('../middlewares/auth');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        console.log('[Multer] File upload attempt:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            encoding: file.encoding
        });

        // Check file extension
        const allowedExtensions = ['.pdf', '.docx', '.doc', '.pptx', '.ppt', '.txt'];
        const fileExt = require('path').extname(file.originalname).toLowerCase();

        // Check MIME type
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'text/plain'
        ];

        if (!allowedExtensions.includes(fileExt)) {
            console.log('[Multer] Rejected: Invalid document extension:', fileExt);
            cb(new Error(`Unsupported file extension: ${fileExt}. Allowed types: ${allowedExtensions.join(', ')}`), false);
            return;
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            console.log('[Multer] Warning: Unexpected MIME type:', file.mimetype, 'for extension:', fileExt);
            // Allow it anyway, as browsers sometimes send incorrect MIME types
        }

        console.log('[Multer] Document accepted:', file.originalname);
        cb(null, true);
    }
});

// Image upload configuration
const imageUpload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit for images
    },
    fileFilter: (req, file, cb) => {
        console.log('[Multer] Image upload attempt:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            encoding: file.encoding
        });

        // Check file extension for images
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff', '.tif', '.pdf'];
        const fileExt = require('path').extname(file.originalname).toLowerCase();

        // Check MIME type for images
        const allowedMimeTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/bmp',
            'image/webp',
            'image/tiff',
            'application/pdf'
        ];

        if (!allowedExtensions.includes(fileExt)) {
            console.log('[Multer] Rejected: Invalid image extension:', fileExt);
            cb(new Error(`Unsupported file extension: ${fileExt}. Allowed types: ${allowedExtensions.join(', ')}`), false);
            return;
        }

        if (!allowedMimeTypes.includes(file.mimetype)) {
            console.log('[Multer] Warning: Unexpected MIME type:', file.mimetype, 'for extension:', fileExt);
            // Allow it anyway, as browsers sometimes send incorrect MIME types
        }

        console.log('[Multer] Image accepted:', file.originalname);
        cb(null, true);
    }
});

const AIRouter = (app) => {
    // General AI chat endpoint
    app.route('/api/ai/chat')
        .post(authenticate, AIController.chat);

    // Note-related AI endpoints
    app.route('/api/ai/notes/:noteId/enhance')
        .post(authenticate, AIController.enhanceNote);

    app.route('/api/ai/notes/:noteId/summarize')
        .post(authenticate, AIController.summarizeNote);

    app.route('/api/ai/notes/:noteId/questions')
        .post(authenticate, AIController.generateStudyQuestions);

    app.route('/api/ai/notes/:noteId/flashcards')
        .post(authenticate, AIController.createFlashcards);

    // Video analysis endpoint
    app.route('/api/ai/analyze-video')
        .post(authenticate, AIController.analyzeVideo);

    // Document processing endpoint with extended timeout
    app.route('/api/ai/process-document')
        .post(authenticate, (req, res, next) => {
            // Set longer timeout for document processing
            req.setTimeout(600000); // 10 minutes
            next();
        }, upload.single('document'), AIController.processDocument);

    // Image processing endpoint with OCR and AI analysis
    app.route('/api/ai/process-image')
        .options((req, res) => {
            // Handle preflight requests for image upload
            res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
            res.header('Access-Control-Allow-Credentials', 'true');
            res.status(200).end();
        })
        .post(authenticate, (req, res, next) => {
            // Set CORS headers for the actual request
            res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
            res.header('Access-Control-Allow-Credentials', 'true');

            // Set longer timeout for image processing
            req.setTimeout(300000); // 5 minutes
            next();
        }, imageUpload.single('image'), AIController.processImage);

    // YouTube video processing endpoint with AssemblyAI + Gemini
    app.route('/api/ai/process-youtube')
        .post(authenticate, (req, res, next) => {
            // Set longer timeout for YouTube processing
            req.setTimeout(1800000); // 30 minutes
            next();
        }, AIController.processYouTubeVideo);

    // Audio file processing endpoint with AssemblyAI + Gemini
    app.route('/api/ai/process-audio')
        .post(authenticate, (req, res, next) => {
            // Set longer timeout for audio processing
            req.setTimeout(1800000); // 30 minutes
            next();
        }, upload.single('audio'), AIController.processAudioFile);

    // Educational AI endpoints
    app.route('/api/ai/explain-concept')
        .post(authenticate, AIController.explainConcept);

    // OCR API health check endpoint
    app.route('/api/ai/ocr-health')
        .get(async (req, res) => {
            try {
                console.log('[HealthCheck] Starting OCR API health check...');
                const tesseractService = require('../ai/tesseractService');
                const healthResult = await tesseractService.healthCheck();
                console.log('[HealthCheck] Health check result:', healthResult);
                res.json({
                    success: true,
                    data: healthResult
                });
            } catch (error) {
                console.error('[HealthCheck] Health check failed:', {
                    message: error.message,
                    stack: error.stack
                });
                res.status(500).json({
                    success: false,
                    message: 'OCR API health check failed',
                    error: error.message
                });
            }
        });

    app.route('/api/ai/generate-quiz')
        .post(authenticate, AIController.generateQuiz);

    // Health check endpoint (public - no auth required)
    app.route('/api/ai/health')
        .get(AIController.healthCheck);

    // Test YouTube processing endpoint (public - no auth required for testing)
    app.route('/api/ai/test-youtube')
        .post((req, res, next) => {
            // Set longer timeout for YouTube processing
            req.setTimeout(1800000); // 30 minutes  
            next();
        }, AIController.testYouTubeVideo);

    // Authenticated health check endpoint for admin
    app.route('/api/ai/health/admin')
        .get(authenticate, AIController.healthCheck);

    // Admin AI requests endpoint
    app.route('/api/ai/admin/requests')
        .get(authenticate, (req, res) => {
            // TODO: Implement proper admin authentication check
            // For now, return mock data
            res.json({
                success: true,
                data: {
                    requests: [
                        {
                            id: '1',
                            userId: 'user123',
                            type: 'document_processing',
                            timestamp: new Date().toISOString(),
                            status: 'completed',
                            processingTime: 2500
                        },
                        {
                            id: '2',
                            userId: 'user456',
                            type: 'note_enhancement',
                            timestamp: new Date(Date.now() - 3600000).toISOString(),
                            status: 'completed',
                            processingTime: 1200
                        }
                    ],
                    total: 2,
                    message: 'AI requests retrieved successfully'
                }
            });
        });

    // Test document processing endpoint (for debugging)
    app.route('/api/ai/test-processing')
        .post(authenticate, (req, res) => {
            res.json({
                success: true,
                message: 'Test endpoint working',
                data: {
                    note: {
                        id: 'test-123',
                        title: 'Test Document',
                        content: 'This is a test response to verify the frontend can handle the response structure.',
                        category: 'Test'
                    }
                },
                timestamp: new Date().toISOString()
            });
        });
};

module.exports = AIRouter;
