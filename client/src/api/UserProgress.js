import axios from 'axios';

const backendURL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserProgress = async (userId) => {
    try {
        const response = await axios.get(`${backendURL}/progress/${userId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user progress:', error);
        throw error;
    }
};

export const updateUserProgress = async (userId, progressData) => {
    try {
        const response = await axios.put(`${backendURL}/progress/${userId}`, progressData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user progress:', error);
        throw error;
    }
};

export const updateStudyStreak = async (userId, streakData) => {
    try {
        const response = await axios.put(`${backendURL}/progress/${userId}/streak`, streakData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating study streak:', error);
        throw error;
    }
};

export const updateSubjectProgress = async (userId, subjectId, progressData) => {
    try {
        const response = await axios.put(`${backendURL}/progress/${userId}/subject/${subjectId}`, progressData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating subject progress:', error);
        throw error;
    }
};

export const incrementAIInteractions = async (userId) => {
    try {
        const response = await axios.put(`${backendURL}/progress/${userId}/ai`, {}, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error incrementing AI interactions:', error);
        throw error;
    }
};