import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUserNotes = async (userId) => {
    try {
        const response = await axios.get(`${backendURL}/notes`, {
            headers: getAuthHeader(),
            params: { userId }
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching user notes:', error);
        throw error;
    }
};

export const getNoteById = async (noteId) => {
    try {
        const response = await axios.get(`${backendURL}/notes/${noteId}`, {
            headers: getAuthHeader()
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching note:', error);
        throw error;
    }
};

export const createNote = async (noteData) => {
    try {
        const response = await axios.post(`${backendURL}/notes`, noteData, {
            headers: getAuthHeader()
        });
        return response.data.data; // Extract the created note from the data wrapper
    } catch (error) {
        console.error('Error creating note:', error);
        throw error;
    }
};

export const updateNote = async (noteId, noteData) => {
    try {
        const response = await axios.put(`${backendURL}/notes/${noteId}`, noteData, {
            headers: getAuthHeader()
        });
        return response.data.data; // Extract the updated note from the data wrapper
    } catch (error) {
        console.error('Error updating note:', error);
        throw error;
    }
};

export const deleteNote = async (noteId) => {
    try {
        const response = await axios.delete(`${backendURL}/notes/${noteId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting note:', error);
        throw error;
    }
};

export const toggleNoteFavorite = async (noteId) => {
    try {
        const response = await axios.patch(`${backendURL}/notes/${noteId}/favorite`, {}, {
            headers: getAuthHeader()
        });
        return response.data.data; // Extract the updated note from the data wrapper
    } catch (error) {
        console.error('Error toggling note favorite:', error);
        throw error;
    }
};