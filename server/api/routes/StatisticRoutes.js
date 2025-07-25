const StatisticController = require('../controllers/StatisticController');
const { authenticate, requireRole } = require('../middlewares/auth');

const StatisticRouter = (app) => {
    app.route('/admin/stats')
        .get(authenticate, requireRole('admin'), StatisticController.getStatistic);
    app.route('/admin/system-health')
        .get(authenticate, requireRole('admin'), StatisticController.getSystemHealth);
}
module.exports = StatisticRouter;
