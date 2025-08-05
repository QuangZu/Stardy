import axios from 'axios';
import firebaseAuth from '@/firebase/auth';

const backendURL = 'https://stardy-3old.onrender.com/api';

// Helper function to get authorization header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const register = async (username, email, password) => {
    try {
        const response = await axios.post(`${backendURL}/auth/register`, { 
            username, 
            email, 
            password 
        });
        return response.data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${backendURL}/auth/login`, { email, password });
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        const response = await axios.post(`${backendURL}/auth/logout`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await axios.post(`${backendURL}/auth/forgot-password`, { email });
        return response.data;
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
};

export const changePassword = async (currentPassword, newPassword) => {
    try {
        const response = await axios.post(`${backendURL}/auth/change-password`, {
            currentPassword,
            newPassword
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Change password error:', error);
        throw error;
    }
};

// Google Authentication
export const signInWithGoogle = async () => {
    try {
        console.log('Starting Google sign-in process...');
        const result = await firebaseAuth.signInWithGoogle();

        console.log('Google sign-in successful:', result.backendData);
        return result.backendData;
    } catch (error) {
        console.error('Google sign-in error:', error);
        throw error;
    }
};

// Firebase Auth State Management
export const onAuthStateChange = (callback) => {
    return firebaseAuth.onAuthStateChange(callback);
};

export const getCurrentUser = () => {
    return firebaseAuth.getCurrentUser();
};

export const isAuthenticated = () => {
    return firebaseAuth.isAuthenticated();
};

export const signOutUser = async () => {
    try {
        await firebaseAuth.signOut();
        return { success: true, message: 'Signed out successfully' };
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
};