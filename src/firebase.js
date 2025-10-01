import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-Gd_QGVgjnATgd2rC8cA76zKZKjREQS4",
  authDomain: "arq-arley.firebaseapp.com",
  projectId: "arq-arley",
  storageBucket: "arq-arley.appspot.com",
  messagingSenderId: "571274310959",
  appId: "1:571274310959:web:68c215746df51e8cfc9dda",
  measurementId: "G-7NYHYNV2WF"
};
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
