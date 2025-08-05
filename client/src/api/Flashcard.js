import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

// Get all flashcard sets for a user
export const getUserFlashcardSets = async (userId) => {
    try {
        const response = await axios.get(`${backendURL}/flashcards/user/${userId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching user flashcard sets:', error);
        throw error;
    }
};

// Get a specific flashcard set
export const getFlashcardSet = async (flashcardSetId) => {
    try {
        const response = await axios.get(`${backendURL}/flashcards/${flashcardSetId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching flashcard set:', error);
        throw error;
    }
};

// Generate flashcards from note using AI
export const generateFlashcardsFromNote = async (noteId, userId, options = {}) => {
    try {
        const response = await axios.post(`${backendURL}/flashcards/generate`, {
            noteId,
            userId,
            cardCount: options.cardCount || 10
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error generating flashcards from note:', error);
        throw error;
    }
};

// Create a custom flashcard set
export const createFlashcardSet = async (flashcardData) => {
    try {
        const response = await axios.post(`${backendURL}/flashcards`, flashcardData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error creating flashcard set:', error);
        throw error;
    }
};

// Update flashcard set
export const updateFlashcardSet = async (flashcardSetId, flashcardData) => {
    try {
        const response = await axios.put(`${backendURL}/flashcards/${flashcardSetId}`, flashcardData, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error updating flashcard set:', error);
        throw error;
    }
};

// Delete flashcard set
export const deleteFlashcardSet = async (flashcardSetId) => {
    try {
        const response = await axios.delete(`${backendURL}/flashcards/${flashcardSetId}`, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error deleting flashcard set:', error);
        throw error;
    }
};

// Record study session
export const recordStudySession = async (flashcardSetId, sessionTime) => {
    try {
        const response = await axios.post(`${backendURL}/flashcards/study-session`, {
            flashcardSetId,
            sessionTime
        }, {
            headers: getAuthHeader()
        });
        return response.data;
    } catch (error) {
        console.error('Error recording study session:', error);
        throw error;
    }
};
