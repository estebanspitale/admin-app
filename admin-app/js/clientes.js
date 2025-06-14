import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const clientesCollection = collection(db, 'clientes');
let clientesOriginales = [];

// Cargar clientes desde Firestore
async function cargarClientes() {
  const querySnapshot = await getDocs(clientesCollection);
  clientesOriginales = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  mostrarClientes(clientesOriginales);
}

cargarClientes();

// Mostrar lista
function mostrarClientes(clientes) {
  const lista = document.getElementById('clientes-lista');
  lista.innerHTML = '';
  clientes.forEach((cliente, index) => {
    const item = document.createElement('li');
    item.innerHTML = `
      ${cliente.nombre} - ${cliente.email}
      <button onclick="editarCliente(${index})">Editar</button>
      <button onclick="eliminarCliente(${index})">Eliminar</button>
    `;
    lista.appendChild(item);
  });
}

// Buscador
document.getElementById('buscador-clientes').addEventListener('input', (e) => {
  const texto = e.target.value.toLowerCase();
  const filtrados = clientesOriginales.filter(cliente =>
    cliente.nombre.toLowerCase().includes(texto) ||
    cliente.email.toLowerCase().includes(texto)
  );
  mostrarClientes(filtrados);
});

// Agregar cliente
document.getElementById('form-cliente').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!nombre || !email) return;

  await addDoc(clientesCollection, { nombre, email });
  await cargarClientes();
  document.getElementById('form-cliente').reset();
});

// Eliminar cliente
window.eliminarCliente = async (index) => {
  const cliente = clientesOriginales[index];
  await deleteDoc(doc(db, 'clientes', cliente.id));
  await cargarClientes();
};

// Editar cliente
window.editarCliente = async (index) => {
  const cliente = clientesOriginales[index];
  const nuevoNombre = prompt('Nuevo nombre:', cliente.nombre);
  const nuevoEmail = prompt('Nuevo email:', cliente.email);

  if (nuevoNombre && nuevoEmail) {
    const clienteRef = doc(db, 'clientes', cliente.id);
    await updateDoc(clienteRef, { nombre: nuevoNombre, email: nuevoEmail });
    await cargarClientes();
  }
};

console.log("Cargando clientes desde Firestore...");
    cargarClientes();

