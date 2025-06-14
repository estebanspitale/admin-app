import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const clientesCollection = collection(db, 'clientes');
const productosCollection = collection(db, 'productos');
const ventasCollection = collection(db, 'ventas');

let ventasOriginales = [];
let productosOriginales = [];
let productosVenta = [];

// ---------------------- CARGAR CLIENTES ----------------------
async function cargarClientes() {
  const snapshot = await getDocs(clientesCollection);
  const select = document.getElementById('cliente-select');
  select.innerHTML = '<option value="">--Seleccionar cliente--</option>';

  snapshot.forEach(doc => {
    const cliente = doc.data();
    const option = document.createElement('option');
    option.value = doc.id;
    option.textContent = cliente.nombre;
    select.appendChild(option);
  });
}

const clienteSelect = document.getElementById('cliente-select');
const nuevoClienteInput = document.getElementById('nuevo-cliente');

// Cliente existente vs nuevo cliente
clienteSelect.addEventListener('change', () => {
  if (clienteSelect.value) {
    nuevoClienteInput.disabled = true;
    nuevoClienteInput.value = '';
  } else {
    nuevoClienteInput.disabled = false;
  }
});

nuevoClienteInput.addEventListener('input', () => {
  if (nuevoClienteInput.value.trim()) {
    clienteSelect.disabled = true;
  } else {
    clienteSelect.disabled = false;
  }
});

// ---------------------- CARGAR PRODUCTOS ----------------------
async function cargarProductos() {
  const snapshot = await getDocs(productosCollection);
  const select = document.getElementById('producto-select');
  productosOriginales = [];

  snapshot.forEach(doc => {
    const producto = { id: doc.id, ...doc.data() };
    productosOriginales.push(producto);

    const option = document.createElement('option');
    option.value = producto.id;
    option.textContent = producto.nombre;
    select.appendChild(option);
  });
}

// ---------------------- MOSTRAR PRECIO ----------------------
document.getElementById('producto-select').addEventListener('change', (e) => {
  const id = e.target.value;
  const producto = productosOriginales.find(p => p.id === id);
  document.getElementById('precio-producto').textContent = producto
    ? `Precio: $${producto.precio}`
    : 'Precio: $0';
});

// ---------------------- AGREGAR PRODUCTO ----------------------
document.getElementById('agregar-producto').addEventListener('click', () => {
  const id = document.getElementById('producto-select').value;
  const cantidad = parseInt(document.getElementById('cantidad').value || 1);

  if (!id || cantidad <= 0) return;

  const producto = productosOriginales.find(p => p.id === id);
  const totalParcial = producto.precio * cantidad;
  productosVenta.push({ id, nombre: producto.nombre, precio: producto.precio, cantidad });

  const li = document.createElement('li');
  li.textContent = `${producto.nombre} x${cantidad} - $${totalParcial}`;
  document.getElementById('lista-productos-agregados').appendChild(li);

  actualizarTotal();
});

// ---------------------- CALCULAR TOTAL ----------------------
function actualizarTotal() {
  const total = productosVenta.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  document.getElementById('total').textContent = total;
}

// ---------------------- REGISTRAR VENTA ----------------------
document.getElementById('registrar-venta').addEventListener('click', async (e) => {
  e.preventDefault();
  const clienteId = document.getElementById('cliente-select').value;
  const nuevoNombre = document.getElementById('nuevo-cliente').value.trim();

  if (!clienteId && !nuevoNombre) return alert('Seleccioná o ingresá un cliente');
  if (productosVenta.length === 0) return alert('Agregá al menos un producto');

  let clienteFinalId = clienteId;

  if (!clienteId && nuevoNombre) {
    const nuevoCliente = await addDoc(clientesCollection, { nombre: nuevoNombre, email: '' });
    clienteFinalId = nuevoCliente.id;
  }

  const total = productosVenta.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);
  const clienteNombre = clienteId
    ? document.querySelector(`#cliente-select option[value="${clienteId}"]`).textContent
    : nuevoNombre;

  const venta = {
    cliente: clienteNombre,
    productos: productosVenta,
    total,
    fecha: new Date().toLocaleDateString()
  };

  await addDoc(ventasCollection, venta);
  alert('Venta registrada');

  // Limpiar estado
  productosVenta = [];
  document.getElementById('lista-productos-agregados').innerHTML = '';
  document.getElementById('total').textContent = '0';
  document.getElementById('cantidad').value = 1;
  document.getElementById('producto-select').value = '';
  document.getElementById('precio-producto').textContent = 'Precio: $0';

  // Reset cliente
  clienteSelect.value = '';
  clienteSelect.disabled = false;
  nuevoClienteInput.value = '';
  nuevoClienteInput.disabled = false;

  cargarVentas(); // recargar lista
});

// ---------------------- CARGAR Y MOSTRAR VENTAS ----------------------
async function cargarVentas() {
  const snapshot = await getDocs(ventasCollection);
  ventasOriginales = snapshot.docs.map(doc => doc.data());
  mostrarVentas(ventasOriginales);
}

function mostrarVentas(ventas) {
  const lista = document.getElementById('ventas-lista');
  lista.innerHTML = '';
  ventas.forEach(v => {
    const item = document.createElement('li');
    item.textContent = `Cliente: ${v.cliente} | Productos: ${v.productos.map(p => `${p.nombre} x${p.cantidad}`).join(', ')} | Total: $${v.total} | Fecha: ${v.fecha}`;
    lista.appendChild(item);
  });
}

// ---------------------- BUSCADOR ----------------------
document.getElementById('buscador-ventas').addEventListener('input', (e) => {
  const texto = e.target.value.toLowerCase();
  const filtradas = ventasOriginales.filter(v =>
    v.cliente.toLowerCase().includes(texto) ||
    v.productos.some(p => p.nombre.toLowerCase().includes(texto))
  );
  mostrarVentas(filtradas);
});

// ---------------------- INICIALIZAR ----------------------
cargarClientes();
cargarProductos();
cargarVentas();
