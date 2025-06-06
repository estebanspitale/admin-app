import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFxq-9Lofrt2GHHZQpS_Gg9kb8dvpPzio",
  authDomain: "admin-app-6426c.firebaseapp.com",
  projectId: "admin-app-6426c",
  storageBucket: "admin-app-6426c.firebasestorage.app",
  messagingSenderId: "52366603200",
  appId: "1:52366603200:web:cae73849a83893838d4e25",
  measurementId: "G-D56TL82Q5Y"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Formulario de registro
const registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = registerForm.email.value;
  const password = registerForm.password.value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    alert("Usuario registrado con éxito");
    // Redirigir o mostrar pantalla de bienvenida
    window.location.href = "login.html";
  } catch (error) {
    alert("Error: " + error.message);
  }
});