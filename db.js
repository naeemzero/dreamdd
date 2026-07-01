// js/db.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQ_gQgQxHYQvmMsazy0OsWQ4kF_dXxhUQ",
  authDomain: "dream-development-ddr.firebaseapp.com",
  projectId: "dream-development-ddr",
  storageBucket: "dream-development-ddr.appspot.com",
  messagingSenderId: "987035585008",
  appId: "1:987035585008:web:6851818b972871e1913535",
  measurementId: "G-6CVZJ3DX6P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);