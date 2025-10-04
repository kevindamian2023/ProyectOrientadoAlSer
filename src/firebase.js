// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB-Gd_QGVgjnATgd2rC8cA76zKZKjREQS4",
  authDomain: "arq-arley.firebaseapp.com",
  projectId: "arq-arley",
  storageBucket: "arq-arley.appspot.com",
  messagingSenderId: "571274310959",
  appId: "1:571274310959:web:68c215746df51e8cfc9dda",
  measurementId: "G-7NYHYNV2WF"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app);
