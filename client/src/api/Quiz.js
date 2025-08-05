import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all quizzes for a user
export const getUserQuizzes = async (userId) => {
    try {
        const response = await axios.get(`${backendURL}/quiz/user/${userId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user quizzes:', error);
        throw error;
    }
};

// Get all quizzes (admin only)
export const getAllQuizzes = async () => {
    try {
        const response = await axios.get(`${backendURL}/admin/quizzes`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching all quizzes:', error);
        throw error;
    }
};

// Get a specific quiz
export const getQuiz = async (quizId) => {
    try {
        const response = await axios.get(`${backendURL}/quiz/${quizId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw error;
    }
};

// Generate quiz from note using AI
export const generateQuizFromNote = async (noteId, userId, options = {}) => {
    try {
        const response = await axios.post(`${backendURL}/quiz/generate`, {
            noteId,
            userId,
            difficulty: options.difficulty || 'medium',
            questionCount: options.questionCount || 5
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error generating quiz from note:', error);
        throw error;
    }
};

// Create a custom quiz
export const createQuiz = async (quizData) => {
    try {
        const response = await axios.post(`${backendURL}/quiz`, quizData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw error;
    }
};

// Update quiz
export const updateQuiz = async (quizId, quizData) => {
    try {
        const response = await axios.put(`${backendURL}/quiz/${quizId}`, quizData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating quiz:', error);
        throw error;
    }
};

// Delete quiz
export const deleteQuiz = async (quizId) => {
    try {
        const response = await axios.delete(`${backendURL}/quiz/${quizId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting quiz:', error);
        throw error;
    }
};

// Submit quiz answers and get results
export const submitQuizAnswers = async (quizId, answers, userId, timeSpent) => {
    try {
        const response = await axios.post(`${backendURL}/quiz/submit`, {
            quizId,
            answers,
            userId,
            timeSpent
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting quiz answers:', error);
        throw error;
    }
};
