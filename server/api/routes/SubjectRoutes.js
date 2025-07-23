const SubjectController = require('../controllers/SubjectController');
const { authenticate, requireRole } = require('../middlewares/auth');

const SubjectRouter = (app) => {
    app.route('/api/subjects')
        .get(SubjectController.getAllSubjects)
    
    app.route('/api/subjects/:id')
        .get(SubjectController.getSubjectById)

    app.route('/api/subjects/featured')
        .get(SubjectController.getFeaturedSubjects)

    app.route('/api/subjects/category/:category')
        .get(SubjectController.getSubjectsByCategory)

    app.route('/api/subjects/search')
        .get(SubjectController.searchSubjects)
    
    // Admin routes
    app.route('/api/admin/subjects')
        .get(authenticate, requireRole('admin'), SubjectController.getAllSubjects)
        .post(authenticate, SubjectController.createSubject);

    app.route('/api/admin/subjects/:id')
        .get(authenticate, requireRole('admin'), SubjectController.getSubjectById)
        .put(authenticate, requireRole('admin'), SubjectController.updateSubject)
        .delete(authenticate, requireRole('admin'), SubjectController.deleteSubject);
};

module.exports = SubjectRouter;
