import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllAchievements = async () => {
    try {
        const response = await axios.get(`${backendURL}/achievements`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all achievements:', error);
        throw error;
    }
};

export const createAchievement = async (achievementData) => {
    try {
        const response = await axios.post(`${backendURL}/admin/achievements`, achievementData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating achievement:', error);
        throw error;
    }
};

export const getAchievement = async (id) => {
    try {
        const response = await axios.get(`${backendURL}/achievements/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching achievement:', error);
        throw error;
    }
};

export const updateAchievement = async (id, achievementData) => {
    try {
        const response = await axios.put(`${backendURL}/admin/achievements/${id}`, achievementData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating achievement:', error);
        throw error;
    }
};

export const deleteAchievement = async (id) => {
    try {
        const response = await axios.delete(`${backendURL}/admin/achievements/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting achievement:', error);
        throw error;
    }
};

export const unlockAchievement = async (userId, achievementId) => {
    try {
        const response = await axios.post(`${backendURL}/achievements/unlock`, { userId, achievementId }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error unlocking achievement:', error);
        throw error;
    }
};

export const getAchievementsByCategory = async (category) => {
    try {
        const response = await axios.get(`${backendURL}/achievements/category/${category}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching achievements by category:', error);
        throw error;
    }
};