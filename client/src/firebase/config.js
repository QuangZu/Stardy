import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBDnLLvISFdotmfw-cqqaLAttWWaRvSWDI",
  authDomain: "stardy-205.firebaseapp.com",
  projectId: "stardy-205",
  storageBucket: "stardy-205.firebasestorage.app",
  messagingSenderId: "1063321308261",
  appId: "1:1063321308261:web:d2f2e2f7eab4d3ba050a8c",
  measurementId: "G-MMSSKKB0FD"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  hd: undefined
});

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.warn('Analytics not available:', error);
}

export { analytics };
export default app;
