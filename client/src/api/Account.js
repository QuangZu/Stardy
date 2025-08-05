
import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllAccounts = async () => {
    try {
        const response = await axios.get(`${backendURL}/admin/accounts`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all accounts:', error);
        throw error;
    }
};

// Get user account by ID
export const getAccount = async (userId) => {
    try {
        const response = await axios.get(`${backendURL}/accounts/${userId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching account:', error);
        throw error;
    }
};

// Create new account
export const createAccount = async (username, password, email, options = {}) => {
    try {
        const accountData = {
            username,
            password,
            email,
            role: options.role || 'user',
            currentLevel: options.currentLevel || 1,
            experience: options.experience || 0,
            streak: options.streak || 0
        };
        
        const response = await axios.post(`${backendURL}/accounts`, accountData);
        return response.data;
    } catch (error) {
        console.error('Error creating account:', error);
        throw error;
    }
};

// Update account
export const updateAccount = async (userId, updateData) => {
    try {
        const response = await axios.put(`${backendURL}/accounts/${userId}`, updateData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating account:', error);
        throw error;
    }
};

// Delete account
export const deleteAccount = async (userId) => {
    try {
        const response = await axios.delete(`${backendURL}/accounts/${userId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
};

// Get user progress
export const getUserProgress = async () => {
    try {
        const response = await axios.get(`${backendURL}/progress/`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user progress:', error);
        throw error;
    }
};

// Upload avatar
export const uploadAvatar = async (userId, formData) => {
    try {
        const response = await axios.post(`${backendURL}/accounts/${userId}/avatar`, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading avatar:', error);
        throw error;
    }
};

// Check user role (keeping your existing function)
export const checkUserRole = async () => {
    try {
        const response = await axios.get(`${backendURL}/accounts/check-role`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Check user role error:', error);
        throw error;
    }
};

export const getUserIdFromToken = async () => {
    try {
        const response = await axios.get(`${backendURL}/accounts/user-id`, {
            headers: getAuthHeader()
        });
        return response.data.userId;
    } catch (error) {
        console.error('Error getting user ID from token:', error);
        throw error;
    }
};