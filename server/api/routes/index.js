const AccountRouter = require('./AccountRoutes');
const AuthRouter = require('./AuthRoutes');
const LevelRouter = require('./LevelRoutes');
const AchievementRouter = require('./AchievementRoutes');
const RewardRouter = require('./RewardRoutes');
const ExamRouter = require('./ExamRoutes');
const UserProgressRouter = require('./UserProgressRoutes');
const QARouter = require('./QARoutes');
const AIRouter = require('./AIRoutes');
const NoteRouter = require('./NoteRoutes');
const ScheduleRouter = require('./ScheduleRoutes');
const SubjectRouter = require('./SubjectRoutes');

const routes = (app) => {
    AccountRouter(app);
    AuthRouter(app);
    LevelRouter(app);
    AchievementRouter(app);
    RewardRouter(app);
    ExamRouter(app);
    UserProgressRouter(app);
    QARouter(app);
    AIRouter(app);
    NoteRouter(app);
    ScheduleRouter(app);
    SubjectRouter(app);
};

module.exports = routes;