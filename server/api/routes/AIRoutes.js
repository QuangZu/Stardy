const AIController = require('../controllers/AIController');
const { authenticate } = require('../middlewares/auth');
const { upload, handleUploadError } = require('../middlewares/upload');

const AIRouter = (app) => {
    app.route('/api/ai/process/youtube')
        .post(authenticate, (req, res) => AIController.processYouTubeVideo(req, res));
        
    app.route('/api/ai/process/document')
        .post(
            authenticate, 
            upload.single('document'), 
            handleUploadError,
            // debugUpload, // Remove this line
            (req, res) => AIController.processDocument(req, res)
        );
        
    app.route('/api/ai/process/audio')
        .post(
            authenticate, 
            upload.single('audio'), 
            handleUploadError,
            (req, res) => AIController.processAudio(req, res)
        );

    app.route('/api/ai/chat')
        .post(authenticate, (req, res) => AIController.chatWithAI(req, res));

    app.route('/api/ai/question/help')
        .post(authenticate, (req, res) => AIController.getQuestionHelp(req, res));
        
    app.route('/api/ai/concept/explain')
        .post(authenticate, (req, res) => AIController.explainConcept(req, res));
        
    app.route('/api/ai/recommendations')
        .get(authenticate, (req, res) => AIController.getRecommendations(req, res));
};

module.exports = AIRouter;