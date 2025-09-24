import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBu9M5MDiaWJWJXFtoOpK--KZXKRtTFZt0",
    authDomain: "planer-97eb1.firebaseapp.com",
    projectId: "planer-97eb1",
    storageBucket: "planer-97eb1.firebasestorage.app",
    messagingSenderId: "322073132266",
    appId: "1:322073132266:web:39a66937b3cda1c031ab93",
    measurementId: "G-GB94F6MG2N"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebaseConfig = firebaseConfig;
