import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import { getAuth } from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import { getFirestore } from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { getStorage } from
"https://www.gstatic.com/firebasejs/12.19.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyAF3tcCgm92SyZI6gBJR9zGc-8TwW3G25A",
  authDomain: "e-shop-59a6a.firebaseapp.com",
  projectId: "e-shop-59a6a",
  storageBucket: "e-shop-59a6a.firebasestorage.app",
  messagingSenderId: "96982729314",
  appId: "1:96982729314:web:ce555e6906d95768ae873b",
  measurementId: "G-7QX2LHY8VG"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);


export {
    app,
    auth,
    db
};