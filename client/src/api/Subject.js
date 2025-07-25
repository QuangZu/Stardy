import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllSubjects = async () => {
    try {
        const response = await axios.get(`${backendURL}/subjects`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all subjects:', error);
        throw error;
    }
};

export const getSubject = async (id) => {
    try {
        const response = await axios.get(`${backendURL}/subjects/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching subject:', error);
        throw error;
    }
};

export const createSubject = async (subjectData) => {
    try {
        const response = await axios.post(`${backendURL}/admin/subjects`, subjectData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating subject:', error);
        throw error;
    }
};

export const updateSubject = async (id, subjectData) => {
    try {
        const response = await axios.put(`${backendURL}/admin/subjects/${id}`, subjectData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating subject:', error);
        throw error;
    }
};

export const deleteSubject = async (id) => {
    try {
        const response = await axios.delete(`${backendURL}/admin/subjects/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting subject:', error);
        throw error;
    }
};

export const getSubjectsByCategory = async (category) => {
    try {
        const response = await axios.get(`${backendURL}/subjects/category/${category}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching subjects by category:', error);
        throw error;
    }
};