const StatisticController = require('../controllers/StatisticController');
const { authenticate, requireRole } = require('../middlewares/auth');

const StatisticRouter = (app) => {
    app.route('/api/admin/stats')
        .get(authenticate, requireRole('admin'), StatisticController.getStatistic);
};

module.exports = StatisticRouter;
