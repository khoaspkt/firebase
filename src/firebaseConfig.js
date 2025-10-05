
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1gjyoc6kv1AimbXcFdHMRoAuTCRvdo1Y",
  authDomain: "labweb-18a0d.firebaseapp.com",
  projectId: "labweb-18a0d",
  storageBucket: "labweb-18a0d.appspot.com",
  messagingSenderId: "413984873959",
  appId: "1:413984873959:web:138db58a00f3d301c97142"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Khởi tạo và export Firestore instance để dùng trong các component khác
export const db = getFirestore(app);

//export default app;
