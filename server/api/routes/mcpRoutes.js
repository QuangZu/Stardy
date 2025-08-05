const { processUserMessage } = require('../controllers/mcpController');
const { authenticate } = require('../middlewares/auth');

const McpRouter = (app) => {
    app.route('/api/mcp/process')
        .post(authenticate, processUserMessage);
};

module.exports = McpRouter;
