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

    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.notifyAuthStateListeners(user);
    });
    
    this.handleRedirectResult();
  }

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

        if (backendResponse.token) {
          localStorage.setItem('token', backendResponse.token);
          window.dispatchEvent(new CustomEvent('googleSignInSuccess', {
            detail: backendResponse
          }));
        }
      }
    } catch (error) {
      console.error('Redirect result error:', error);
      window.dispatchEvent(new CustomEvent('googleSignInError', {
        detail: error
      }));
    }
  }

  async signInWithGoogle() {
    try {
      console.log('Starting Google sign-in...');

      let user = null;

      try {
       const result = await signInWithPopup(auth, googleProvider);
        user = result.user;
        console.log('Popup sign-in successful');
      } catch (popupError) {
        console.warn('Popup sign-in failed, trying redirect...', popupError.code);

        await signInWithRedirect(auth, googleProvider);
      }
      
      console.log('Google sign-in successful:', user.email);
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
      
      return {
        user: user,
        backendData: backendResponse,
        token: backendResponse.token || idToken
      };
    } catch (error) {
      if (error.code === 'auth/popup-blocked' || 
          error.message.includes('Cross-Origin-Opener-Policy')) {
        console.warn('Popup blocked or COOP error, falling back to redirect');
        return await signInWithRedirect(auth, googleProvider);
      }
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

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

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

const firebaseAuth = new FirebaseAuthService();
export default firebaseAuth;
