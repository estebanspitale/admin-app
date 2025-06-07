// js/auth.js
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

const loginForm = document.getElementById('loginForm');
const errorDiv = document.getElementById('error-message');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      errorDiv.textContent = "Por favor, completá todos los campos.";
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html"; // Redirige a dashboard si login OK
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        errorDiv.textContent = "El usuario no existe.";
      } else if (error.code === "auth/wrong-password") {
        errorDiv.textContent = "Contraseña incorrecta.";
      } else {
        errorDiv.textContent = "Error: " + error.message;
      }
    }
  });
}

// REGISTRO
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert('Usuario registrado exitosamente');
      window.location.href = "dashboard.html";
    } catch (error) {
      alert("Error: " + error.message);
    }
  });
}