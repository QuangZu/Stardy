const UserProgressController = require('../controllers/UserProgressController');
const { authenticate } = require('../middlewares/auth');

const UserProgressRouter = (app) => {
    app.route('/api/progress')
        .get(authenticate, UserProgressController.getUserProgress)
        .put(authenticate, UserProgressController.updateUserProgress);
        
    app.route('/api/progress/streak')
        .put(authenticate, UserProgressController.updateStudyStreak);
        
    app.route('/api/progress/subject/:subjectId')
        .put(authenticate, UserProgressController.updateSubjectProgress);
        
    app.route('/api/progress/ai')
        .put(authenticate, UserProgressController.incrementAIInteractions);
};

module.exports = UserProgressRouter;