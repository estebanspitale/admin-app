import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

document.getElementById('loginForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = "";
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "dashboard.html";
  } catch (error) {
    const m = error.code;
    if (m === "auth/user-not-found") errorDiv.textContent = "El usuario no existe.";
    else if (m === "auth/wrong-password") errorDiv.textContent = "Contraseña incorrecta.";
    else errorDiv.textContent = "Error: " + error.message;
  }
});