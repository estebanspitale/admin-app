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

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("error-message");
  const successDiv = document.getElementById("success-message");

  errorDiv.textContent = "";
  successDiv.textContent = "";

  if (!email || !password) {
    errorDiv.textContent = "Completá todos los campos.";
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    successDiv.textContent = "Registro exitoso. Ya podés iniciar sesión.";
    // Opcional: Redirigir automáticamente
    // window.location.href = "login.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      errorDiv.textContent = "Este email ya está registrado.";
    } else if (error.code === "auth/invalid-email") {
      errorDiv.textContent = "Email no válido.";
    } else if (error.code === "auth/weak-password") {
      errorDiv.textContent = "La contraseña es muy débil.";
    } else {
      errorDiv.textContent = "Error: " + error.message;
    }
  }
});