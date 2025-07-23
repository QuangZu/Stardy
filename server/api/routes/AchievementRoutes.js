const AchievementController = require('../controllers/AchievementController');
const { authenticate, requireRole } = require('../middlewares/auth');

const AchievementRouter = (app) => {
    // Public achievement routes
    app.route('/api/achievements')
        .get(AchievementController.getAllAchievements);
        
    app.route('/api/achievements/:id')
        .get(AchievementController.getAchievement);
        
    app.route('/api/achievements/unlock')
        .post(authenticate, AchievementController.unlockAchievement);
        
    app.route('/api/achievements/category/:category')
        .get(AchievementController.getAchievementsByCategory);

    // Admin achievement routes
    app.route('/api/admin/achievements')
        .get(authenticate, requireRole('admin'), AchievementController.getAllAchievements)
        .post(authenticate, requireRole('admin'), AchievementController.createAchievement);
        
    app.route('/api/admin/achievements/:id')
        .get(authenticate, requireRole('admin'), AchievementController.getAchievement)
        .put(authenticate, requireRole('admin'), AchievementController.updateAchievement)
        .delete(authenticate, requireRole('admin'), AchievementController.deleteAchievement);
};

module.exports = AchievementRouter;