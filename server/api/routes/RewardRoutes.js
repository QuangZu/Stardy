const RewardController = require('../controllers/RewardController');
const { authenticate } = require('../middlewares/auth');

const RewardRouter = (app) => {
    app.route('/api/rewards')
        .get(RewardController.getAllRewards)
        .post(authenticate, RewardController.createReward);
        
    app.route('/api/rewards/:id')
        .get(RewardController.getReward)
        .put(authenticate, RewardController.updateReward)
        .delete(authenticate, RewardController.deleteReward);
        
    app.route('/api/rewards/unlock')
        .post(authenticate, RewardController.unlockReward);
        
    app.route('/api/rewards/type/:type')
        .get(RewardController.getRewardsByType);
        
    app.route('/api/rewards/rarity/:rarity')
        .get(RewardController.getRewardsByRarity);
};

module.exports = RewardRouter;