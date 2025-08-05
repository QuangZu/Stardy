const Account = require('../models/accountModel');
const jwt = require('jsonwebtoken');

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

const getUserIdFromToken = async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No token provided' 
            });
        }
        
        // Verify and decode JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Return user ID from token
        res.status(200).json({
            success: true,
            userId: decoded.id
        });
    } catch (error) {
        console.error('Error decoding token:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
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

const uploadAvatar = async (req, res) => {
    try {
        const userId = req.params.id;
        
        console.log('[Avatar Upload] Request received for user:', userId);
        console.log('[Avatar Upload] File details:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            destination: req.file.destinatio
        } : 'No file');
        
        // Add file existence check
        if (req.file && req.file.path) {
            const fs = require('fs');
            const fileExists = fs.existsSync(req.file.path);
            console.log('[Avatar Upload] File exists on disk:', fileExists);
        }
        
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Save just the filename, not the full path
        const avatarFilename = req.file.filename;
        console.log('[Avatar Upload] Saving filename to database:', avatarFilename);

        const updatedAccount = await Account.findByIdAndUpdate(
            userId,
            { avatar: avatarFilename }, // Use 'avatar' field and save filename only
            { new: true }
        );

        if (!updatedAccount) {
            console.log('[Avatar Upload] Account not found:', userId);
            return res.status(404).json({ message: "Account not found" });
        }

        console.log('[Avatar Upload] Avatar updated successfully:', updatedAccount.avatar);

        res.status(200).json({
            message: 'Avatar uploaded successfully',
            avatar: updatedAccount.avatar // Return 'avatar' field to match frontend expectation
        });
    } catch (error) {
        console.error('[Avatar Upload] Error:', error);
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
    uploadAvatar,
    checkUserRole,
    getUserIdFromToken
};