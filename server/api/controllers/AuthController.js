const Account = require('../models/AccountModel');
const UserProgress = require('../models/UserProgressModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if account already exists
        const existingAccount = await Account.findOne({ username });
        if (existingAccount) {
            return res.status(400).json({ message: "Account already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new account
        const newAccount = new Account({
            username,
            password: hashedPassword,
            email
        });

        const savedAccount = await newAccount.save();

        // Initialize user progress
        const newUserProgress = new UserProgress({
            userId: savedAccount._id,
            studyStreak: {
                currentStreak: 0,
                longestStreak: 0,
                lastStudyDate: null
            }
        });

        await newUserProgress.save();

        // Generate JWT token
        const token = jwt.sign({ id: savedAccount._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({ token });
    } catch (error) {
        console.error("Error registering account:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingAccount = await Account.findOne({ email });
        if (!existingAccount) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, existingAccount.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT token with user role
        const token = jwt.sign({ 
            id: existingAccount._id, 
            role: existingAccount.role 
        }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ 
            token,
            user: {
                id: existingAccount._id,
                username: existingAccount.username,
                email: existingAccount.email,
                role: existingAccount.role
            }
        });
    } catch (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const logout = async (req, res) => {
    return res.status(200).json({ message: "Logged out successfully" });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if account exists
        const existingAccount = await Account.findOne({ email });
        if (!existingAccount) {
            return res.status(400).json({ message: "Account not found" });
        }

        // Generate password reset token
        const resetToken = jwt.sign({ id: existingAccount._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        // Send password reset email
        // Note: Implement email sending logic here using a service like Nodemailer or SendGrid
        // For demonstration, we'll just return the token
        return res.status(200).json({ resetToken });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword
};