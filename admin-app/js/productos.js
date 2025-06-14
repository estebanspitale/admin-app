import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const productosCollection = collection(db, 'productos');
let productosOriginales = [];

async function cargarProductos() {
  try {
    const querySnapshot = await getDocs(productosCollection);
    productosOriginales = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    mostrarProductos(productosOriginales);
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

cargarProductos();

function mostrarProductos(productos) {
  const lista = document.getElementById('productos-lista');
  lista.innerHTML = '';
  productos.forEach((producto, index) => {
    const item = document.createElement('li');
    item.innerHTML = `
      ${producto.nombre} - ${producto.categoria} - $${producto.precio}
      <button onclick="editarProducto(${index})">Editar</button>
      <button onclick="eliminarProducto(${index})">Eliminar</button>
    `;
    lista.appendChild(item);
  });
}

document.getElementById('buscador-productos').addEventListener('input', (e) => {
  const texto = e.target.value.toLowerCase();
  const filtrados = productosOriginales.filter(producto =>
    producto.nombre.toLowerCase().includes(texto) ||
    producto.categoria.toLowerCase().includes(texto)
  );
  mostrarProductos(filtrados);
});

document.getElementById('form-producto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const categoria = document.getElementById('categoria').value.trim();
  const precio = parseFloat(document.getElementById('precio').value.trim());

  if (!nombre || !categoria || isNaN(precio)) return;

  await addDoc(productosCollection, { nombre, categoria, precio });
  await cargarProductos();
  document.getElementById('form-producto').reset();
});

window.eliminarProducto = async (index) => {
  const producto = productosOriginales[index];
  await deleteDoc(doc(db, 'productos', producto.id));
  await cargarProductos();
};

window.editarProducto = async (index) => {
  const producto = productosOriginales[index];
  const nuevoNombre = prompt('Nuevo nombre:', producto.nombre);
  const nuevaCategoria = prompt('Nueva categoría:', producto.categoria);
  const nuevoPrecio = parseFloat(prompt('Nuevo precio:', producto.precio));

  if (nuevoNombre && nuevaCategoria && !isNaN(nuevoPrecio)) {
    const productoRef = doc(db, 'productos', producto.id);
    await updateDoc(productoRef, {
      nombre: nuevoNombre,
      categoria: nuevaCategoria,
      precio: nuevoPrecio
    });
    await cargarProductos();
  }
};
