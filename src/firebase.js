import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSyDEvehO6Q-yHh_RnFsXpjtJQj5PD_-3emc",
 authDomain: "quiz-app-ae090.firebaseapp.com",
 projectId: "quiz-app-ae090",
хранилище: "quiz-app-ae090.firebasestorage.app",
 messagingSenderId: "18917113341",
 appId: "1:18917113341:web:346d7f90066c83c049ed94"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);