const ScheduleController = require('../controllers/ScheduleController');
const { authenticate } = require('../middlewares/auth');

const ScheduleRouter = (app) => {
    app.route('/api/schedules')
        .get(authenticate, ScheduleController.getAllSchedules)
        .post(authenticate, ScheduleController.createSchedule);
    
    app.route('/api/schedules/:id')
        .get(authenticate, ScheduleController.getScheduleById)
        .put(authenticate, ScheduleController.updateSchedule)
        .delete(authenticate, ScheduleController.deleteSchedule);

    app.route('/api/schedules/:id/status')
        .patch(authenticate, ScheduleController.updateScheduleStatus);
};

module.exports = ScheduleRouter;