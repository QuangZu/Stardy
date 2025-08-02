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

const BACKEND_URL = 'https://stardy-3old.onrender.com/api';

class FirebaseAuthService {
  constructor() {
    this.currentUser = null;
    this.authStateListeners = [];

    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);
    });
    
    this.handleRedirectResult();
  }

  // Helper method to create user data object
  createUserData(user, provider = 'google') {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      provider,
      idToken: null // Will be set separately
    };
  }

  // Helper method to handle Google sign-in success
  async handleGoogleSignInSuccess(user) {
    const idToken = await user.getIdToken();
    const userData = this.createUserData(user);
    userData.idToken = idToken;
    
    const backendResponse = await this.registerWithBackend(userData);
    
    return {
      user,
      backendData: backendResponse,
      token: backendResponse.token || idToken
    };
  }

  async handleRedirectResult() {
    try {
      const result = await getRedirectResult(auth);
      if (result && result.user) {
        console.log('Redirect sign-in successful:', result.user.email);
        
        const response = await this.handleGoogleSignInSuccess(result.user);
        
        if (response.token) {
          localStorage.setItem('token', response.token);
          window.dispatchEvent(new CustomEvent('googleSignInSuccess', {
            detail: response.backendData
          }));
        }
      }
    } catch (error) {
      console.error('Redirect result error:', error);
      window.dispatchEvent(new CustomEvent('googleSignInError', { detail: error }));
    }
  }

  async signInWithGoogle() {
    try {
      console.log('Starting Google sign-in...');

      try {
        const result = await signInWithPopup(auth, googleProvider);
        console.log('Popup sign-in successful');
        return await this.handleGoogleSignInSuccess(result.user);
      } catch (popupError) {
        if (popupError.code === 'auth/popup-blocked' || 
            popupError.message?.includes('Cross-Origin-Opener-Policy')) {
          console.warn('Popup blocked or COOP error, falling back to redirect');
          await signInWithRedirect(auth, googleProvider);
          return;
        }
        throw popupError;
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

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

  async createAccount(email, password, displayName) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName) {
        await updateProfile(result.user, { displayName });
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

  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  async registerWithBackend(userData) {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/google-auth`, userData);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Backend registration error:', error);
      
      const message = error.response?.data?.message || 'Failed to register with backend';
      throw new Error(message);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  async getCurrentUserToken() {
    if (!this.currentUser) return null;
    
    try {
      return await this.currentUser.getIdToken();
    } catch (error) {
      console.error('Error getting user token:', error);
      return null;
    }
  }

  onAuthStateChange(callback) {
    this.authStateListeners.push(callback);
  }

  removeAuthStateListener(callback) {
    this.authStateListeners = this.authStateListeners.filter(listener => listener !== callback);
  }

  notifyAuthStateListeners(user) {
    this.authStateListeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'No account found with this email address.',
      'auth/wrong-password': 'Incorrect password. Please try again.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password is too weak. Please choose a stronger password.',
      'auth/invalid-email': 'Invalid email address format.',
      'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your internet connection.'
    };

    const message = errorMessages[error.code] || error.message || 'Authentication failed';
    return new Error(message);
  }
}

const firebaseAuth = new FirebaseAuthService();
export default firebaseAuth;
