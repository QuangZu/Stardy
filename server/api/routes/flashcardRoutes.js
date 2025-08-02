const FlashcardController = require('../controllers/flashcardController');
const { authenticate } = require('../middlewares/auth');

const FlashcardRouter = (app) => {
    // User flashcard routes
    app.route('/api/flashcards/user/:userId')
        .get(authenticate, FlashcardController.getUserFlashcardSets);

    app.route('/api/flashcards/generate')
        .post(authenticate, FlashcardController.generateFlashcardsFromNoteAI);

    app.route('/api/flashcards/study-session')
        .post(authenticate, FlashcardController.recordStudySession);

    app.route('/api/flashcards')
        .post(authenticate, FlashcardController.createFlashcardSet);

    app.route('/api/flashcards/:id')
        .get(authenticate, FlashcardController.getFlashcardSet)
        .put(authenticate, FlashcardController.updateFlashcardSet)
        .delete(authenticate, FlashcardController.deleteFlashcardSet);
};

module.exports = FlashcardRouter;
