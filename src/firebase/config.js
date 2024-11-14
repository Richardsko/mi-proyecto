import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-RSuUSscKSQtpb-krIQogHTcoEasAl4g",
  authDomain: "wingspagina.firebaseapp.com",
  projectId: "wingspagina",
  messagingSenderId: "19751739211",
  appId: "1:19751739211:web:0b38a86f767b4cbd7b12ce"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;