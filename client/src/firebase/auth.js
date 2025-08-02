// Firebase Authentication Service
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from './config';
import axios from 'axios';

const backendURL = 'https://stardy-3old.onrender.com/api';

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];

    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);
    });

    // Check for redirect result on initialization
    this.handleRedirectResult();
  }

  /**
   * Handle Google sign-in redirect result
   */
  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        console.log('Redirect sign-in successful:', result.user.email);

        // Process the redirect result same as popup
        const user = result.user;
        const idToken = await user.getIdToken();

        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          provider: 'google',
          idToken: idToken
        };

        const backendResponse = await this.registerWithBackend(userData);

        // Store token and redirect to dashboard
        if (backendResponse.token) {
          localStorage.setItem('token', backendResponse.token);
          // Trigger a custom event to notify the app
          window.dispatchEvent(new CustomEvent('googleSignInSuccess', {
            detail: backendResponse
          }));
        }
      }
    } catch (error) {
      console.error('Redirect result error:', error);
      // Trigger error event
      window.dispatchEvent(new CustomEvent('googleSignInError', {
        detail: error
      }));
    }
  }

  /**
   * Sign in with Google
   * @returns {Promise<Object>} User data and backend response
   */
  async signInWithGoogle() {
    try {
      console.log('Starting Google sign-in...');

      let result = null;
      let user = null;

      try {
        // Try popup first
        console.log('Attempting popup sign-in...');
        result = await signInWithPopup(auth, googleProvider);
        user = result.user;
        console.log('Popup sign-in successful');
      } catch (popupError) {
        console.warn('Popup sign-in failed, trying redirect...', popupError.code);

        // If popup fails due to COOP or other issues, try redirect
        if (popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/popup-closed-by-user' ||
            popupError.message.includes('Cross-Origin-Opener-Policy')) {

          console.log('Using redirect method due to popup restrictions...');
          await signInWithRedirect(auth, googleProvider);

          // The redirect will reload the page, so we need to handle the result on page load
          // This will be handled by checking for redirect result on app initialization
          return { redirecting: true };
        } else {
          throw popupError;
        }
      }
      
      console.log('Google sign-in successful:', user.email);
      
      // Get Firebase ID token
      const idToken = await user.getIdToken();
      
      // Send user data to backend for registration/login
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        provider: 'google',
        idToken: idToken
      };
      
      // Register/login with backend
      const backendResponse = await this.registerWithBackend(userData);
      
      return {
        user: user,
        backendData: backendResponse,
        token: backendResponse.token || idToken
      };
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/network-request-failed') {
        throw new Error('Network error. Please check your internet connection.');
      } else {
        throw new Error(error.message || 'Failed to sign in with Google');
      }
    }
  }

  /**
   * Sign in with email and password
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<Object>} User data
   */
  async signInWithEmail(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      
      return {
        user: result.user,
        token: idToken
      };
    } catch (error) {
      console.error('Email sign-in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create account with email and password
   * @param {string} email 
   * @param {string} password 
   * @param {string} displayName 
   * @returns {Promise<Object>} User data
   */
  async createAccount(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (displayName) {
        await updateProfile(result.user, {
          displayName: displayName
        });
      }
      
      const idToken = await result.user.getIdToken();
      
      return {
        user: result.user,
        token: idToken
      };
    } catch (error) {
      console.error('Account creation error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out user
   * @returns {Promise<void>}
   */
  async signOut() {
    try {
      await signOut(auth);
      localStorage.removeItem('token');
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  /**
   * Send password reset email
   * @param {string} email 
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Register user with backend
   * @param {Object} userData 
   * @returns {Promise<Object>} Backend response
   */
  async registerWithBackend(userData) {
    try {
      const response = await axios.post(`${backendURL}/auth/google-auth`, userData);
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Backend registration error:', error);
      
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Failed to register with backend');
      } else {
        throw new Error('Failed to connect to backend');
      }
    }
  }

  /**
   * Get current user
   * @returns {Object|null} Current user
   */
  getCurrentUser() {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return !!this.currentUser;
  }

  /**
   * Get current user's ID token
   * @returns {Promise<string|null>} ID token
   */
  async getCurrentUserToken() {
    if (this.currentUser) {
      try {
        return await this.currentUser.getIdToken();
      } catch (error) {
        console.error('Error getting user token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Add auth state change listener
   * @param {Function} callback 
   */
  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
  }

  /**
   * Remove auth state change listener
   * @param {Function} callback 
   */
  removeAuthStateListener(callback) {
    this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
  }

  /**
   * Notify all auth state listeners
   * @param {Object|null} user 
   */
  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  /**
   * Handle Firebase auth errors
   * @param {Object} error 
   * @returns {Error} Formatted error
   */
  handleAuthError(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return new Error('No account found with this email address.');
      case 'auth/wrong-password':
        return new Error('Incorrect password. Please try again.');
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists.');
      case 'auth/weak-password':
        return new Error('Password is too weak. Please choose a stronger password.');
      case 'auth/invalid-email':
        return new Error('Invalid email address format.');
      case 'auth/too-many-requests':
        return new Error('Too many failed attempts. Please try again later.');
      case 'auth/network-request-failed':
        return new Error('Network error. Please check your internet connection.');
      default:
        return new Error(error.message || 'Authentication failed');
    }
  }
}

// Create and export singleton instance
const firebaseAuth = new FirebaseAuthService();
export default firebaseAuth;
