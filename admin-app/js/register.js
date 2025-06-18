import { auth } from './firebase-config.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";

document.getElementById('registerForm').addEventListener('submit', async e => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value.trim();
  const errorDiv = document.getElementById('error-message');
  const successDiv = document.getElementById('success-message');
  errorDiv.textContent = "";
  successDiv.textContent = "";
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    successDiv.textContent = "Registro exitoso. Ya podés iniciar sesión.";
    setTimeout(() => window.location.href = "login.html", 1500);
  } catch (error) {
    const m = error.code;
    if (m === "auth/email-already-in-use") errorDiv.textContent = "Email ya registrado.";
    else if (m === "auth/invalid-email") errorDiv.textContent = "Email no válido.";
    else if (m === "auth/weak-password") errorDiv.textContent = "Contraseña débil.";
    else errorDiv.textContent = "Error: " + error.message;
  }
});