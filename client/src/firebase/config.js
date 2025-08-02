// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBDnLLvISFdotmfw-cqqaLAttWWaRvSWDI",
  authDomain: "stardy-205.firebaseapp.com",
  projectId: "stardy-205",
  storageBucket: "stardy-205.firebasestorage.app",
  messagingSenderId: "1063321308261",
  appId: "1:1063321308261:web:d2f2e2f7eab4d3ba050a8c",
  measurementId: "G-MMSSKKB0FD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Add additional parameters to help with COOP issues
  hd: undefined // Allow any domain
});

// Initialize Analytics (optional)
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics not available:', error);
}

export { analytics };
export default app;
