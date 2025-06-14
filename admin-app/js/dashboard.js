import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFxq-9Lofrt2GHHZQpS_Gg9kb8dvpPzio",
  authDomain: "admin-app-6426c.firebaseapp.com",
  projectId: "admin-app-6426c",
  storageBucket: "admin-app-6426c.firebasestorage.app",
  messagingSenderId: "52366603200",
  appId: "1:52366603200:web:cae73849a83893838d4e25"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Datos simulados
const datos = {
  ventas: [
    { fecha: "2025-06-06", producto: "Lavandina", cliente: "Supermercado A", total: 3000 },
    { fecha: "2025-06-06", producto: "Detergente", cliente: "Kiosco B", total: 2000 },
    { fecha: "2025-06-05", producto: "Cloro", cliente: "Panadería C", total: 5000 },
    { fecha: "2025-06-06", producto: "Lavandina", cliente: "Supermercado A", total: 4000 },
  ],
  productos: [
    { nombre: "Lavandina", stock: 25 },
    { nombre: "Detergente", stock: 15 },
    { nombre: "Cloro", stock: 10 }
  ],
  clientes: [
    { nombre: "Supermercado A" },
    { nombre: "Kiosco B" },
    { nombre: "Panadería C" }
  ]
};

// Mostrar resumen general
function mostrarResumen(fechaDesde = null, fechaHasta = null) {
  let ventasFiltradas = datos.ventas;

  if (fechaDesde && fechaHasta) {
    ventasFiltradas = datos.ventas.filter(v => v.fecha >= fechaDesde && v.fecha <= fechaHasta);
  }

  // Totales
  document.getElementById("totalClientes").textContent = datos.clientes.length;
  document.getElementById("totalProductos").textContent = datos.productos.length;

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
  document.getElementById("totalVentas").textContent = `$${totalVentas}`;

  // Ventas por producto
  const ventasPorProducto = {};
  ventasFiltradas.forEach(v => {
    ventasPorProducto[v.producto] = (ventasPorProducto[v.producto] || 0) + v.total;
  });

  const listaVentas = document.getElementById("listaVentasProducto");
  listaVentas.innerHTML = "";
  for (let producto in ventasPorProducto) {
    const li = document.createElement("li");
    li.textContent = `${producto}: $${ventasPorProducto[producto]}`;
    listaVentas.appendChild(li);
  }

  // Mejores clientes
  const ventasPorCliente = {};
  ventasFiltradas.forEach(v => {
    ventasPorCliente[v.cliente] = (ventasPorCliente[v.cliente] || 0) + v.total;
  });

  const clientesOrdenados = Object.entries(ventasPorCliente).sort((a, b) => b[1] - a[1]);
  const listaClientes = document.getElementById("listaClientesTop");
  listaClientes.innerHTML = "";
  clientesOrdenados.slice(0, 3).forEach(([cliente, total]) => {
    const li = document.createElement("li");
    li.textContent = `${cliente}: $${total}`;
    listaClientes.appendChild(li);
  });
}

// Filtrar por fecha
window.filtrarPorFecha = function () {
  const desde = document.getElementById("fechaDesde").value;
  const hasta = document.getElementById("fechaHasta").value;

  if (!desde || !hasta) {
    alert("Seleccioná ambas fechas.");
    return;
  }

  mostrarResumen(desde, hasta);
};

// Cerrar sesión
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch(error => {
      console.error("Error al cerrar sesión:", error);
    });
});

// Mostrar cotización del dólar (usando API de Bluelytics sin CORS)
async function mostrarCotizacionDolar() {
  try {
    const res = await fetch("https://api.bluelytics.com.ar/v2/latest");
    const data = await res.json();

    document.getElementById("dolarOficialCompra").textContent = `$${data.oficial.value_buy}`;
    document.getElementById("dolarOficialVenta").textContent = `$${data.oficial.value_sell}`;
    document.getElementById("dolarBlueCompra").textContent = `$${data.blue.value_buy}`;
    document.getElementById("dolarBlueVenta").textContent = `$${data.blue.value_sell}`;
  } catch (error) {
    console.error("❌ Error al obtener cotizaciones:", error);
    alert("Error al obtener cotización. Revisá la consola.");
    document.getElementById("cotizacionDolar").innerHTML = "<p>No se pudo cargar la cotización del dólar.</p>";
  }
}

// Inicializar al cargar
document.addEventListener("DOMContentLoaded", () => {
  mostrarResumen();
  mostrarCotizacionDolar();
});
