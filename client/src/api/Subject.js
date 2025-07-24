import axios from 'axios';

const backendURL = process.env.VUE_APP_API_URL || 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllSubjects = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.category) params.append('category', filters.category);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.featured) params.append('featured', filters.featured);
        
        const response = await axios.get(`${backendURL}/subjects?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }
};

export const getFeaturedSubjects = async () => {
    try {
        const response = await axios.get(`${backendURL}/subjects/featured`);
        return response.data;
    } catch (error) {
        console.error('Error fetching featured subjects:', error);
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

export const getSubjectById = async (id) => {
    try {
        const response = await axios.get(`${backendURL}/subjects/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching subject:', error);
        throw error;
    }
};

export const searchSubjects = async (query, filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (filters.category) params.append('category', filters.category);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        
        const response = await axios.get(`${backendURL}/subjects/search?${params.toString()}`);
        return response.data;
    } catch (error) {
        console.error('Error searching subjects:', error);
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