const Account = require('../models/accountModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('../../firebase/admin');

const register = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingAccount = await Account.findOne({ $or: [{ username }, { email }] });
        if (existingAccount) {
            const field = existingAccount.username === username ? 'username' : 'email';
            return res.status(400).json({ 
                message: `Account with this ${field} already exists` 
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAccount = new Account({
            username,
            password: hashedPassword,
            email,
            provider: 'local',
            role: 'user'
        });

        const savedAccount = await newAccount.save();

        const token = jwt.sign({ id: savedAccount._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(201).json({ token });
    } catch (error) {
        console.error("Error registering account:", error);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `Account with this ${field} already exists` 
            });
        }
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
        return res.status(200).json({ resetToken });
    } catch (error) {
        console.error("Error sending password reset email:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // From JWT middleware

    try {
        // Find the user
        const user = await Account.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        // Hash new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await Account.findByIdAndUpdate(userId, { password: hashedNewPassword });

        return res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        console.error("Error changing password:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// Google Authentication
const googleAuth = async (req, res) => {
    const { uid, email, displayName, photoURL, provider, idToken } = req.body;

    try {
        console.log('[AuthController] Google authentication request:', {
            email,
            displayName,
            provider,
            hasIdToken: !!idToken,
            uid: uid?.substring(0, 8) + '...' // Log partial UID for privacy
        });

        // Validate required fields
        if (!uid || !email || !idToken) {
            console.error('[AuthController] Missing required Google auth fields:', { uid: !!uid, email: !!email, idToken: !!idToken });
            return res.status(400).json({
                success: false,
                message: 'Missing required authentication data'
            });
        }

        // Verify Firebase ID token (optional but recommended for security)
        let decodedToken = null;
        try {
            if (admin.apps.length > 0) {
                decodedToken = await admin.auth().verifyIdToken(idToken);
                console.log('[AuthController] Firebase token verified for:', decodedToken.email);
            }
        } catch (tokenError) {
            console.warn('[AuthController] Firebase token verification failed:', tokenError.message);
            // Continue without verification if Firebase Admin is not properly configured
        }

        // Check if account already exists
        let existingAccount = await Account.findOne({
            $or: [
                { email: email },
                { googleId: uid }
            ]
        });

        if (existingAccount) {
            // Update existing account with Google info if not already set
            if (!existingAccount.googleId) {
                existingAccount.googleId = uid;
                existingAccount.provider = provider;
                if (photoURL) existingAccount.profilePicture = photoURL;
                await existingAccount.save();
            }

            console.log('[AuthController] Existing user logged in:', existingAccount.email);
        } else {
            // Create new account
            const newAccount = new Account({
                username: displayName || email.split('@')[0], // Use display name or email prefix
                email: email,
                googleId: uid,
                provider: provider,
                profilePicture: photoURL,
                isEmailVerified: true, // Google accounts are pre-verified
                // No password for Google accounts
            });

            existingAccount = await newAccount.save();
            console.log('[AuthController] New Google user created:', existingAccount.email);
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: existingAccount._id,
                email: existingAccount.email,
                provider: existingAccount.provider,
                role: existingAccount.role || 'user'
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Longer expiry for Google auth
        );

        console.log('[AuthController] Google authentication successful for:', existingAccount.email);

        return res.status(200).json({
            success: true,
            message: 'Google authentication successful',
            token: token,
            user: {
                id: existingAccount._id,
                username: existingAccount.username,
                email: existingAccount.email,
                profilePicture: existingAccount.profilePicture,
                provider: existingAccount.provider,
                isEmailVerified: existingAccount.isEmailVerified,
                role: existingAccount.role || 'user',
                createdAt: existingAccount.createdAt
            }
        });

    } catch (error) {
        console.error('[AuthController] Google authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Google authentication failed',
            error: error.message
        });
    }
};

// Development only: Promote user to admin
const promoteToAdmin = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const account = await Account.findOne({ email: email });
        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        account.role = 'admin';
        await account.save();

        console.log(`[AuthController] User ${email} promoted to admin`);

        return res.status(200).json({
            success: true,
            message: 'User promoted to admin successfully',
            user: {
                id: account._id,
                email: account.email,
                role: account.role
            }
        });

    } catch (error) {
        console.error('[AuthController] Error promoting user to admin:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to promote user to admin',
            error: error.message
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    forgotPassword,
    changePassword,
    googleAuth,
    promoteToAdmin
};