const StatisticController = require('../controllers/StatisticController');
const { authenticate, requireAdmin } = require('../middlewares/auth');

const StatisticRouter = (app) => {
    app.route('/admin/stats')
        .get(authenticate, requireAdmin, StatisticController.getStatistic);
    app.route('/admin/system-health')
        .get(authenticate, requireAdmin, StatisticController.getSystemHealth);
}
module.exports = StatisticRouter;
