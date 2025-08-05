const AccountRouter = require('./accountRoutes');
const AuthRouter = require('./authRoutes');
const AIRouter = require('./aiRoutes');
const MCPRouter = require('./mcpRoutes');
const NoteRouter = require('./noteRoutes');
const StatisticRouter = require('./statisticRoutes');
const QuizRouter = require('./quizRoutes');
const FlashcardRouter = require('./flashcardRoutes');

const routes = (app) => {
    AccountRouter(app);
    AuthRouter(app);
    AIRouter(app);
    MCPRouter(app);
    NoteRouter(app);
    StatisticRouter(app);
    QuizRouter(app);
    FlashcardRouter(app);
};

module.exports = routes;