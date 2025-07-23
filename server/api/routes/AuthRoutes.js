const AuthController = require('../controllers/AuthController');

const AuthRouter = (app) => {
    app.route('/api/auth/register')
        .post(AuthController.register);
        
    app.route('/api/auth/login')
        .post(AuthController.login);
        
    app.route('/api/auth/logout')
        .post(AuthController.logout);
        
    app.route('/api/auth/forgot-password')
        .post(AuthController.forgotPassword);
};

module.exports = AuthRouter;