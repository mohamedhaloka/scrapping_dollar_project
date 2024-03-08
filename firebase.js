const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyCoKSZLwNSZ3BpSn91dEOtwdn2pY_yqBUY",
    authDomain: "dollar-9c01c.firebaseapp.com",
    projectId: "dollar-9c01c",
    storageBucket: "dollar-9c01c.appspot.com",
    messagingSenderId: "363771262269",
    appId: "1:363771262269:web:09a599848275c42de00154",
    measurementId: "G-S4PQ5JV9PX"
};
const app = initializeApp(firebaseConfig);

const database = getFirestore(app)

module.exports = { app, database };