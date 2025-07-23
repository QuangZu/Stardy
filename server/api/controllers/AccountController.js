const Account = require('../models/AccountModel');

const getAllAccounts = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }
        
        const accounts = await Account.find();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createAccount = async (req, res) => {
    try {
        const newAccount = new Account(req.body);
        const savedAccount = await newAccount.save();

        const accountResponse = savedAccount.toObject();
        delete accountResponse.password;
        
        res.status(201).json(accountResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getAccount = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id);
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAccount = async (req, res) => {
    try {
        const updatedAccount = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        if (!updatedAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json(updatedAccount);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAccount = async (req, res) => {
    try {
        const deletedAccount = await Account.findByIdAndDelete(req.params.id);
        if (!deletedAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserProgress = async (req, res) => {
    try {
        const account = await Account.findById(req.params.id).select('currentLevel experience streak');
        
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        
        res.status(200).json({
            currentLevel: account.currentLevel,
            experience: account.experience,
            streak: account.streak
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTodaySchedules = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.params.id;
        
        res.status(200).json({userId, date, schedules: []
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        const userId = req.params.id;
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const updatedAccount = await Account.findByIdAndUpdate(
            userId,
            { avatarUrl: req.file.path },
            { new: true }
        );
        
        if (!updatedAccount) {
            return res.status(404).json({ message: "Account not found" });
        }
        
        res.status(200).json({
            message: 'Avatar uploaded successfully',
            avatarUrl: updatedAccount.avatarUrl
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const checkUserRole = async (req, res) => {
    try {
        const userId = req.user.id;
        const account = await Account.findById(userId).select('role username email');
        
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }
        
        res.status(200).json({
            role: account.role,
            username: account.username,
            email: account.email,
            isAdmin: account.role === 'admin'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { 
    getAllAccounts,
    createAccount,
    getAccount,
    updateAccount,
    deleteAccount,
    getUserProgress,
    getTodaySchedules,
    uploadAvatar,
    checkUserRole
};