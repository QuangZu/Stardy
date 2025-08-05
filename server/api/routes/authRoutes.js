const AuthController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');

const AuthRouter = (app) => {
    app.route('/api/auth/register')
        .post(AuthController.register);

    app.route('/api/auth/login')
        .post(AuthController.login);

    app.route('/api/auth/logout')
        .post(AuthController.logout);

    app.route('/api/auth/forgot-password')
        .post(AuthController.forgotPassword);

    app.route('/api/auth/change-password')
        .post(authenticate, AuthController.changePassword);

    app.route('/api/auth/google-auth')
        .post(AuthController.googleAuth);

    // Development only: Promote user to admin
    app.route('/api/auth/promote-to-admin')
        .post(AuthController.promoteToAdmin);
};

module.exports = AuthRouter;