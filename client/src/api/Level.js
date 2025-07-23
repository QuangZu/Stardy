import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllLevels = async () => {
    try {
        const response = await axios.get(`${backendURL}/levels`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all levels:', error);
        throw error;
    }
};

export const createLevel = async (levelData) => {
    try {
        const response = await axios.post(`${backendURL}/admin/levels`, levelData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating level:', error);
        throw error;
    }
};

export const getLevel = async (id) => {
    try {
        const response = await axios.get(`${backendURL}/levels/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching level:', error);
        throw error;
    }
};

export const updateLevel = async (id, levelData) => {
    try {
        const response = await axios.put(`${backendURL}/admin/levels/${id}`, levelData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating level:', error);
        throw error;
    }
};

export const deleteLevel = async (id) => {
    try {
        const response = await axios.delete(`${backendURL}/admin/levels/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting level:', error);
        throw error;
    }
};

export const getLevelByNumber = async (number) => {
    try {
        const response = await axios.get(`${backendURL}/levels/number/${number}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching level by number:', error);
        throw error;
    }
};

export const getBossLevels = async () => {
    try {
        const response = await axios.get(`${backendURL}/levels/boss`);
        return response.data;
    } catch (error) {
        console.error('Error fetching boss levels:', error);
        throw error;
    }
};