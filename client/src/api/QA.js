import axios from 'axios';

const backendURL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllQAs = async () => {
    try {
        const response = await axios.get(`${backendURL}/qa`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all QAs:', error);
        throw error;
    }
};

export const createQA = async (qaData) => {
    try {
        const response = await axios.post(`${backendURL}/admin/questions`, qaData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating QA:', error);
        throw error;
    }
};

export const getQA = async (id) => {
    try {
        const response = await axios.get(`${backendURL}/qa/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching QA:', error);
        throw error;
    }
};

export const updateQA = async (id, qaData) => {
    try {
        const response = await axios.put(`${backendURL}/admin/questions/${id}`, qaData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating QA:', error);
        throw error;
    }
};

export const deleteQA = async (id) => {
    try {
        const response = await axios.delete(`${backendURL}/admin/questions/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting QA:', error);
        throw error;
    }
};

export const getQAsBySubject = async (subjectId) => {
    try {
        const response = await axios.get(`${backendURL}/qa/subject/${subjectId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching QAs by subject:', error);
        throw error;
    }
};

export const getQAsByLevel = async (levelId) => {
    try {
        const response = await axios.get(`${backendURL}/qa/level/${levelId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching QAs by level:', error);
        throw error;
    }
};

export const answerQA = async (answerData) => {
    try {
        const response = await axios.post(`${backendURL}/qa/answer`, answerData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error answering QA:', error);
        throw error;
    }
};

export const getRecommendedQAs = async () => {
    try {
        const response = await axios.get(`${backendURL}/qa/recommended`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching recommended QAs:', error);
        throw error;
    }
};