const AccountController = require('../controllers/accountController');
const { authenticate, requireRole } = require('../middlewares/auth');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');
const { upload } = require('../middlewares/upload');

const AccountRouter = (app) => {
    app.route('/api/accounts/check-role')
        .get(authenticate,AccountController.checkUserRole);
        
    app.route('/api/accounts/user-id')
        .get(AccountController.getUserIdFromToken);

    app.route('/api/accounts')
        .post(validationRules.registerUser,handleValidationErrors,AccountController.createAccount);
        
    app.route('/api/admin/accounts')
        .get(authenticate,requireRole('admin'),AccountController.getAllAccounts);

    app.route('/api/accounts/:id')
        .get(authenticate,validationRules.validateObjectId('id'),handleValidationErrors,AccountController.getAccount)
        .put(authenticate,validationRules.validateObjectId('id'),handleValidationErrors,AccountController.updateAccount)
        .delete(authenticate,requireRole('admin'),validationRules.validateObjectId('id'),handleValidationErrors,AccountController.deleteAccount);
    
    // Avatar upload route
    app.route('/api/accounts/:id/avatar')
        .post(authenticate, upload.single('avatar'), AccountController.uploadAvatar);
        
    // Admin routes for account management
    app.route('/api/admin/accounts/:id')
        .get(authenticate,requireRole('admin'),validationRules.validateObjectId('id'),handleValidationErrors,AccountController.getAccount)
        .put(authenticate,requireRole('admin'),validationRules.validateObjectId('id'),handleValidationErrors,AccountController.updateAccount)
        .delete(authenticate,requireRole('admin'),validationRules.validateObjectId('id'),handleValidationErrors,AccountController.deleteAccount); 
};

module.exports = AccountRouter;