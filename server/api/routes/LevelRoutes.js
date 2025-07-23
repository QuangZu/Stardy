const LevelController = require('../controllers/LevelController');
const { authenticate, requireRole } = require('../middlewares/auth');

const LevelRouter = (app) =>
{
    // Public level routes
    app.route('/api/levels')
    .get(LevelController.getAllLevels);

    app.route('/api/levels/:id')
    .get(LevelController.getLevel);

    app.route('/api/levels/number/:number')
    .get(LevelController.getLevelByNumber);
    
    app.route('/api/levels/boss')
    .get(LevelController.getBossLevels);

    // Admin level routes
    app.route('/api/admin/levels')
    .get(authenticate, requireRole('admin'), LevelController.getAllLevels)
    .post(authenticate, requireRole('admin'), LevelController.createLevel);

    app.route('/api/admin/levels/:id')
    .get(authenticate, requireRole('admin'), LevelController.getLevel)
    .put(authenticate, requireRole('admin'), LevelController.updateLevel)
    .delete(authenticate, requireRole('admin'), LevelController.deleteLevel);
};

module.exports = LevelRouter;