import axios from 'axios';

const backendURL = 'http://localhost:3000/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getAllExams = async () => {
    try {
        const response = await axios.get(`${backendURL}/exams`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all exams:', error);
        throw error;
    }
};

export const createExam = async (examData) => {
    try {
        const response = await axios.post(`${backendURL}/admin/exams`, examData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating exam:', error);
        throw error;
    }
};

export const getExam = async (id) => {
    try {
        const response = await axios.get(`${backendURL}/exams/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching exam:', error);
        throw error;
    }
};

export const updateExam = async (id, examData) => {
    try {
        const response = await axios.put(`${backendURL}/admin/exams/${id}`, examData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating exam:', error);
        throw error;
    }
};

export const deleteExam = async (id) => {
    try {
        const response = await axios.delete(`${backendURL}/admin/exams/${id}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting exam:', error);
        throw error;
    }
};

export const submitExam = async (examData) => {
    try {
        const response = await axios.post(`${backendURL}/exams/submit`, examData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting exam:', error);
        throw error;
    }
};

export const getExamsByDifficulty = async (difficulty) => {
    try {
        const response = await axios.get(`${backendURL}/exams/difficulty/${difficulty}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching exams by difficulty:', error);
        throw error;
    }
};

export const getExamsBySubject = async (subjectId) => {
    try {
        const response = await axios.get(`${backendURL}/exams/subject/${subjectId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching exams by subject:', error);
        throw error;
    }
};