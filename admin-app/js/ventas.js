import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
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
  ventasOriginales = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log("Ventas cargadas:", ventasOriginales);
  mostrarVentas(ventasOriginales);
}


function mostrarVentas(ventas) {
  const tbody = document.getElementById('ventas-lista');
  tbody.innerHTML = '';
  ventas.forEach((v, index) => {
    const cliente = v.cliente || "Sin nombre";
    const productos = Array.isArray(v.productos)
      ? v.productos.map(p => `${p.nombre} x${p.cantidad}`).join('<br>')
      : "Sin productos";
    const total = v.total ?? 0;
    const fecha = v.fecha || "Sin fecha";

    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${cliente}</td>
      <td>${productos}</td>
      <td>$${total}</td>
      <td>${fecha}</td>
      <td>
        <button class="btn-editar" onclick="editarVenta(${index})">Editar</button>
        <button class="btn-eliminar" onclick="eliminarVenta(${index})">Eliminar</button>
      </td>
    `;
    tbody.appendChild(fila);
  });
}

window.eliminarVenta = async (index) => {
  const confirmacion = confirm('¿Estás seguro de que querés eliminar esta venta?');
  if (!confirmacion) return;

  const venta = ventasOriginales[index];
  const ventaId = venta.id;

  if (!ventaId) {
    alert('No se puede eliminar esta venta (ID no encontrado).');
    return;
  }

  try {
    await deleteDoc(doc(db, 'ventas', ventaId));
    alert('Venta eliminada correctamente');
    await cargarVentas();
  } catch (error) {
    console.error('Error al eliminar la venta:', error);
    alert('Ocurrió un error al eliminar la venta.');
  }
};

window.editarVenta = async (index) => {
  const venta = ventasOriginales[index];
  const ventaId = venta.id;

  if (!ventaId) {
    alert('ID de venta no encontrado.');
    return;
  }

  // Editar cliente
  const nuevoCliente = prompt('Editar nombre del cliente:', venta.cliente);
  if (!nuevoCliente) return;

  // Editar productos
  const nuevosProductos = [];

  for (let i = 0; i < venta.productos.length; i++) {
    const producto = venta.productos[i];
    const nuevaCantidad = prompt(`Cantidad para ${producto.nombre}:`, producto.cantidad);

    if (nuevaCantidad === null) continue; // Cancelado

    const cantidad = parseInt(nuevaCantidad);
    if (isNaN(cantidad) || cantidad <= 0) continue;

    nuevosProductos.push({
      ...producto,
      cantidad
    });
  }

  if (nuevosProductos.length === 0) {
    alert('No se actualizaron productos válidos.');
    return;
  }

  const nuevoTotal = nuevosProductos.reduce((sum, p) => sum + (p.precio * p.cantidad), 0);

  try {
    await updateDoc(doc(db, 'ventas', ventaId), {
      cliente: nuevoCliente,
      productos: nuevosProductos,
      total: nuevoTotal,
      fecha: new Date().toLocaleDateString()
    });

    alert('Venta actualizada correctamente.');
    await cargarVentas();
  } catch (error) {
    console.error('Error al editar la venta:', error);
    alert('Error al editar la venta.');
  }
};

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
