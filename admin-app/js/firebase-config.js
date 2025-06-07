// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFxq-9Lofrt2GHHZQpS_Gg9kb8dvpPzio",
  authDomain: "admin-app-6426c.firebaseapp.com",
  projectId: "admin-app-6426c",
  storageBucket: "admin-app-6426c.appspot.com",
  messagingSenderId: "52366603200",
  appId: "1:52366603200:web:cae73849a83893838d4e25"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
