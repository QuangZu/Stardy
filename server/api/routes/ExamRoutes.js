const ExamController = require('../controllers/ExamController');
const { authenticate, requireRole } = require('../middlewares/auth');

const ExamRouter = (app) => {
    // Public exam routes
    app.route('/api/exams')
        .get(ExamController.getAllExams);
        
    app.route('/api/exams/:id')
        .get(ExamController.getExam);
        
    app.route('/api/exams/submit')
        .post(authenticate, ExamController.submitExam);
        
    app.route('/api/exams/difficulty/:difficulty')
        .get(ExamController.getExamsByDifficulty);
        
    app.route('/api/exams/subject/:subjectId')
        .get(ExamController.getExamsBySubject);

    // Admin exam routes
    app.route('/api/admin/exams')
        .get(authenticate, requireRole('admin'), ExamController.getAllExams)
        .post(authenticate, requireRole('admin'), ExamController.createExam);
        
    app.route('/api/admin/exams/:id')
        .get(authenticate, requireRole('admin'), ExamController.getExam)
        .put(authenticate, requireRole('admin'), ExamController.updateExam)
        .delete(authenticate, requireRole('admin'), ExamController.deleteExam);
};

module.exports = ExamRouter;