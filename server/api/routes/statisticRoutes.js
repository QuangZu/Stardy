const StatisticController = require('../controllers/statisticController');
const { authenticate, requireRole } = require('../middlewares/auth');

const StatisticRouter = (app) => {
    app.route('/api/admin/stats')
        .get(authenticate, requireRole('admin'), StatisticController.getStatistic);
    app.route('/api/admin/system-health')
        .get(authenticate, requireRole('admin'), StatisticController.getSystemHealth);
    app.route('/api/users/:userId/statistics')
        .get(authenticate, StatisticController.getUserStatistics);
}
module.exports = StatisticRouter;
