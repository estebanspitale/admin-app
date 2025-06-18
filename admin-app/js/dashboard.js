import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAFxq-9Lofrt2GHHZQpS_Gg9kb8dvpPzio",
  authDomain: "admin-app-6426c.firebaseapp.com",
  projectId: "admin-app-6426c",
  storageBucket: "admin-app-6426c.appspot.com",
  messagingSenderId: "52366603200",
  appId: "1:52366603200:web:cae73849a83893838d4e25"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Variables globales
let ventas = [];
let clientes = [];
let productos = [];

// Mostrar resumen general
function mostrarResumen(fechaDesde = null, fechaHasta = null) {
  let ventasFiltradas = ventas;

  if (fechaDesde && fechaHasta) {
    ventasFiltradas = ventas.filter(v => {
      const [d, m, a] = v.fecha.split("/"); // formato dd/mm/aaaa
      const fechaVenta = new Date(`${a}-${m}-${d}`);
      return fechaVenta >= new Date(fechaDesde) && fechaVenta <= new Date(fechaHasta);
    });
  }

  // Totales
  document.getElementById("totalClientes").textContent = clientes.length;
  document.getElementById("totalProductos").textContent = productos.length;

  const totalVentas = ventasFiltradas.reduce((sum, v) => sum + v.total, 0);
  document.getElementById("totalVentas").textContent = `$${totalVentas}`;

  // Ventas por producto
  const ventasPorProducto = {};
  ventasFiltradas.forEach(v => {
    v.productos.forEach(p => {
      ventasPorProducto[p.nombre] = (ventasPorProducto[p.nombre] || 0) + p.precio * p.cantidad;
    });
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

// ----------------- Actualización en tiempo real -----------------

onSnapshot(collection(db, "ventas"), snapshot => {
  ventas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  mostrarResumen();
});

onSnapshot(collection(db, "clientes"), snapshot => {
  clientes = snapshot.docs.map(doc => doc.data());
  mostrarResumen();
});

onSnapshot(collection(db, "productos"), snapshot => {
  productos = snapshot.docs.map(doc => doc.data());
  mostrarResumen();
});

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

// Cotización del dólar
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
    document.getElementById("cotizacionDolar").innerHTML = "<p>No se pudo cargar la cotización del dólar.</p>";
  }
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  mostrarCotizacionDolar();
});
