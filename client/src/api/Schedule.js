import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserSchedules = async (userId) => {
    try {
        const response = await axios.get(`${backendURL}/schedules/user/${userId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user schedules:', error);
        throw error;
    }
};

export const getTodaySchedules = async (userId) => {
    try {
        const response = await axios.get(`${backendURL}/schedules/user/${userId}/today`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching today schedules:', error);
        throw error;
    }
};

export const getScheduleById = async (scheduleId) => {
    try {
        const response = await axios.get(`${backendURL}/schedules/${scheduleId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching schedule:', error);
        throw error;
    }
};

export const createSchedule = async (scheduleData) => {
    try {
        const response = await axios.post(`${backendURL}/schedules`, scheduleData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating schedule:', error);
        throw error;
    }
};

export const updateSchedule = async (scheduleId, scheduleData) => {
    try {
        const response = await axios.put(`${backendURL}/schedules/${scheduleId}`, scheduleData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating schedule:', error);
        throw error;
    }
};

export const deleteSchedule = async (scheduleId) => {
    try {
        const response = await axios.delete(`${backendURL}/schedules/${scheduleId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting schedule:', error);
        throw error;
    }
};

export const updateScheduleStatus = async (scheduleId, status) => {
    try {
        const response = await axios.patch(`${backendURL}/schedules/${scheduleId}/status`, { status }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating schedule status:', error);
        throw error;
    }
};
