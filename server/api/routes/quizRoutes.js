const QuizController = require('../controllers/quizController');
const { authenticate, requireRole } = require('../middlewares/auth');

const QuizRouter = (app) => {
    // User quiz routes
    app.route('/api/quiz/user/:userId')
        .get(authenticate, QuizController.getUserQuizzes);

    app.route('/api/quiz/generate')
        .post(authenticate, QuizController.generateQuizFromNoteAI);

    app.route('/api/quiz/submit')
        .post(authenticate, QuizController.submitQuizAnswers);

    app.route('/api/quiz')
        .post(authenticate, QuizController.createQuiz);

    app.route('/api/quiz/:id')
        .get(authenticate, QuizController.getQuiz)
        .put(authenticate, QuizController.updateQuiz)
        .delete(authenticate, QuizController.deleteQuiz);
        
    // Admin quiz routes
    app.route('/api/admin/quizzes')
        .get(authenticate, requireRole('admin'), QuizController.getAllQuizzes)
        .post(authenticate, requireRole('admin'), QuizController.createQuiz);

    app.route('/api/admin/quizzes/:id')
        .get(authenticate, requireRole('admin'), QuizController.getQuiz)
        .put(authenticate, requireRole('admin'), QuizController.updateQuiz)
        .delete(authenticate, requireRole('admin'), QuizController.deleteQuiz);
};

module.exports = QuizRouter;
