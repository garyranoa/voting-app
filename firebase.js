// Firebase configuration

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";


const firebaseConfig = {
    apiKey: "AIzaSyAV2kB2PlsdflnI64FdyWrx62GNzeAssnA",
    authDomain: "voting-app-7f788.firebaseapp.com",
    projectId: "voting-app-7f788",
    storageBucket: "voting-app-7f788.appspot.com",
    messagingSenderId: "139492784559",
    appId: "1:139492784559:web:63b56fc2403145eab0d75a",
    databaseURL: "https://voting-app-7f788-default-rtdb.asia-southeast1.firebasedatabase.app/"
};
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
export { app, db };
