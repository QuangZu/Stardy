const AccountController = require('../controllers/AccountController');
const { authenticate, requireRole } = require('../middlewares/auth');
const { validationRules, handleValidationErrors } = require('../middlewares/validation');

const AccountRouter = (app) => {
    app.route('/api/accounts/check-role')
        .get(authenticate,AccountController.checkUserRole);

    app.route('/api/accounts')
        .post(validationRules.registerUser,handleValidationErrors,AccountController.createAccount);
        
    app.route('/api/admin/accounts')
        .get(authenticate,requireRole('admin'),AccountController.getAllAccounts);

    app.route('/api/accounts/:id')
        .get(authenticate,validationRules.validateObjectId('id'),handleValidationErrors,AccountController.getAccount)
        
        .put(authenticate,validationRules.validateObjectId('id'),handleValidationErrors,AccountController.updateAccount)
        
        .delete(authenticate,requireRole('admin'),validationRules.validateObjectId('id'),handleValidationErrors,AccountController.deleteAccount);
        
    // Admin routes for account management
    app.route('/api/admin/accounts/:id')
        .get(authenticate,requireRole('admin'),validationRules.validateObjectId('id'),handleValidationErrors,AccountController.getAccount)

        .put(authenticate,requireRole('admin'),validationRules.validateObjectId('id'),handleValidationErrors,AccountController.updateAccount)

        .delete(authenticate,requireRole('admin'),validationRules.validateObjectId('id'),handleValidationErrors,AccountController.deleteAccount); 
};

module.exports = AccountRouter;