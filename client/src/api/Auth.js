import axios from 'axios';

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