// ========================================
// firebase.js
// Kết nối Firebase Firestore
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    deleteDoc,
    updateDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ========================================
// Firebase Config
// ========================================

const firebaseConfig = {

    apiKey: "AIzaSyDwQaZSaTKp08AmFQlTFk8ZJD1tQRwrm4I",

    authDomain: "shop-tb-sv2.firebaseapp.com",

    projectId: "shop-tb-sv2",

    storageBucket: "shop-tb-sv2.firebasestorage.app",

    messagingSenderId: "936586335230",

    appId: "1:936586335230:web:da134955fd2ced6165e6af"

};

// ========================================
// Khởi tạo Firebase
// ========================================

const app = initializeApp(firebaseConfig);

// ========================================
// Firestore
// ========================================

const db = getFirestore(app);

// ========================================
// Export
// ========================================

export {

    db,

    collection,

    addDoc,

    getDocs,

    onSnapshot,

    deleteDoc,

    updateDoc,

    doc,

    query,

    orderBy,

    serverTimestamp

};
