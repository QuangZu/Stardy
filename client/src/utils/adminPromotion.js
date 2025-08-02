// Utility to promote current user to admin (development only)
import axios from 'axios';

const backendURL = 'http://localhost:3000/api';

export const promoteCurrentUserToAdmin = async () => {
    try {
        // Get current user info from localStorage or make a call to get user info
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        // Decode JWT to get user email (simple decode, not verification)
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.email;

        if (!userEmail) {
            throw new Error('No email found in token');
        }

        console.log('Promoting user to admin:', userEmail);

        const response = await axios.post(`${backendURL}/auth/promote-to-admin`, {
            email: userEmail
        });

        console.log('Promotion successful:', response.data);
        
        // Show success message
        alert(`User ${userEmail} has been promoted to admin! Please log out and log back in for changes to take effect.`);
        
        return response.data;
    } catch (error) {
        console.error('Error promoting user to admin:', error);
        
        if (error.response) {
            alert(`Failed to promote user: ${error.response.data.message}`);
        } else {
            alert(`Failed to promote user: ${error.message}`);
        }
        
        throw error;
    }
};

// Function to call from browser console
window.promoteToAdmin = promoteCurrentUserToAdmin;
