import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllRewards = async () => {
    try {
        const response = await axios.get(`${backendURL}/rewards`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all rewards:', error);
        throw error;
    }
};

export const createReward = async (rewardData) => {
    try {
        const response = await axios.post(`${backendURL}/admin/rewards`, rewardData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating reward:', error);
        throw error;
    }
};

export const getReward = async (id) => {
    try {
        const response = await axios.get(`${backendURL}/rewards/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching reward:', error);
        throw error;
    }
};

export const updateReward = async (id, rewardData) => {
    try {
        const response = await axios.put(`${backendURL}/admin/rewards/${id}`, rewardData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating reward:', error);
        throw error;
    }
};

export const deleteReward = async (id) => {
    try {
        const response = await axios.delete(`${backendURL}/admin/rewards/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting reward:', error);
        throw error;
    }
};

export const unlockReward = async (userId, rewardId) => {
    try {
        const response = await axios.post(`${backendURL}/rewards/unlock`, { userId, rewardId }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error unlocking reward:', error);
        throw error;
    }
};

export const getRewardsByType = async (type) => {
    try {
        const response = await axios.get(`${backendURL}/rewards/type/${type}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching rewards by type:', error);
        throw error;
    }
};

export const getRewardsByRarity = async (rarity) => {
    try {
        const response = await axios.get(`${backendURL}/rewards/rarity/${rarity}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching rewards by rarity:', error);
        throw error;
    }
};