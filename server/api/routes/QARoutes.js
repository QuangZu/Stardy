const QAController = require('../controllers/QAController');
const { authenticate, requireRole } = require('../middlewares/auth');

const QARouter = (app) => {
    // Public QA routes
    app.route('/api/qa')
        .get(QAController.getAllQAs);
        
    app.route('/api/qa/:id')
        .get(QAController.getQA);
        
    app.route('/api/qa/subject/:subjectId')
        .get(QAController.getQAsBySubject);
        
    app.route('/api/qa/answer')
        .post(authenticate, QAController.answerQA);
        
    app.route('/api/qa/recommended')
        .get(authenticate, QAController.getRecommendedQAs);

    // Admin QA routes (Questions management)
    app.route('/api/admin/questions')
        .get(authenticate, requireRole('admin'), QAController.getAllQAs)
        .post(authenticate, requireRole('admin'), QAController.createQA);
        
    app.route('/api/admin/questions/:id')
        .get(authenticate, requireRole('admin'), QAController.getQA)
        .put(authenticate, requireRole('admin'), QAController.updateQA)
        .delete(authenticate, requireRole('admin'), QAController.deleteQA);
};

module.exports = QARouter;