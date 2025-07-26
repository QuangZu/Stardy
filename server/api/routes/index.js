const AccountRouter = require('./AccountRoutes');
const AuthRouter = require('./AuthRoutes');
const ExamRouter = require('./ExamRoutes');
const UserProgressRouter = require('./UserProgressRoutes');
const QARouter = require('./QARoutes');
const AIRouter = require('./AIRoutes');
const NoteRouter = require('./NoteRoutes');
const SubjectRouter = require('./SubjectRoutes');
const StatisticRouter = require('./StatisticRoutes');

const routes = (app) => {
    AccountRouter(app);
    AuthRouter(app);
    ExamRouter(app);
    UserProgressRouter(app);
    QARouter(app);
    AIRouter(app);
    NoteRouter(app);
    SubjectRouter(app);
    StatisticRouter(app);
};

module.exports = routes;