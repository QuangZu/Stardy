import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAdminStats = async () => {
    try {
        const response = await axios.get(`${backendURL}/admin/stats`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        throw error;
    }
};